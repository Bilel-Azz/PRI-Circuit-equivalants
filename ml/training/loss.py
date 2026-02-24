"""Loss function: CrossEntropy (type/node) + MSE (value)."""
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Tuple

from config import (
    WEIGHT_TYPE, WEIGHT_NODE, WEIGHT_VALUE,
    TOKEN_PAD, TOKEN_START, TOKEN_END,
    COMP_R, COMP_L, COMP_C, NUM_TOKENS, MAX_NODES
)


class CircuitLoss(nn.Module):
    """
    Masks out PAD tokens and computes separate losses for:
    - Component type (6 classes)
    - Node A, Node B (8 classes each)
    - Value (regression, normalized log scale)
    """

    def __init__(
        self,
        type_weight: float = WEIGHT_TYPE,
        node_weight: float = WEIGHT_NODE,
        value_weight: float = WEIGHT_VALUE,
        label_smoothing: float = 0.1
    ):
        super().__init__()

        self.type_weight = type_weight
        self.node_weight = node_weight
        self.value_weight = value_weight

        self.type_ce = nn.CrossEntropyLoss(
            ignore_index=TOKEN_PAD,
            label_smoothing=label_smoothing
        )
        self.node_ce = nn.CrossEntropyLoss(
            label_smoothing=label_smoothing,
            reduction='none'
        )
        self.value_mse = nn.MSELoss(reduction='none')

    def forward(
        self,
        output: Dict[str, torch.Tensor],
        batch: Dict[str, torch.Tensor]
    ) -> Tuple[torch.Tensor, Dict[str, float]]:
        device = output['type_logits'].device

        # Shift target left by 1 (next-token prediction)
        target_seq = batch['sequence'].to(device)
        batch_size, seq_len, _ = target_seq.shape

        target_seq_shifted = torch.zeros_like(target_seq)
        target_seq_shifted[:, :-1, :] = target_seq[:, 1:, :]
        target_seq = target_seq_shifted

        # Handle sequence length mismatch
        pred_len = output['type_logits'].size(1)
        if pred_len != seq_len:
            min_len = min(pred_len, seq_len)
            target_seq = target_seq[:, :min_len]
            type_logits = output['type_logits'][:, :min_len]
            node_a_logits = output['node_a_logits'][:, :min_len]
            node_b_logits = output['node_b_logits'][:, :min_len]
            pred_values = output['values'][:, :min_len].squeeze(-1)
            seq_len = min_len
        else:
            type_logits = output['type_logits']
            node_a_logits = output['node_a_logits']
            node_b_logits = output['node_b_logits']
            pred_values = output['values'].squeeze(-1)

        target_types = target_seq[:, :, 0].long()
        target_node_a = target_seq[:, :, 1].long()
        target_node_b = target_seq[:, :, 2].long()
        target_values = target_seq[:, :, 3]

        valid_mask = (target_types != TOKEN_PAD).float()
        component_mask = ((target_types >= COMP_R) & (target_types <= COMP_C)).float()

        type_loss = self.type_ce(
            type_logits.reshape(-1, NUM_TOKENS),
            target_types.reshape(-1)
        )

        # Node losses only for component positions
        node_a_loss_raw = self.node_ce(
            node_a_logits.reshape(-1, MAX_NODES),
            target_node_a.reshape(-1)
        ).reshape(batch_size, seq_len)
        node_a_loss = (node_a_loss_raw * component_mask).sum() / (component_mask.sum() + 1e-8)

        node_b_loss_raw = self.node_ce(
            node_b_logits.reshape(-1, MAX_NODES),
            target_node_b.reshape(-1)
        ).reshape(batch_size, seq_len)
        node_b_loss = (node_b_loss_raw * component_mask).sum() / (component_mask.sum() + 1e-8)

        node_loss = (node_a_loss + node_b_loss) / 2

        # Value loss only for component positions
        value_loss_raw = self.value_mse(pred_values, target_values)
        value_loss = (value_loss_raw * component_mask).sum() / (component_mask.sum() + 1e-8)

        total_loss = (
            self.type_weight * type_loss +
            self.node_weight * node_loss +
            self.value_weight * value_loss
        )

        with torch.no_grad():
            type_pred = type_logits.argmax(dim=-1)
            type_correct = ((type_pred == target_types) * valid_mask).sum()
            type_acc = type_correct / (valid_mask.sum() + 1e-8)

            node_a_pred = node_a_logits.argmax(dim=-1)
            node_a_acc = ((node_a_pred == target_node_a) * component_mask).sum() / (component_mask.sum() + 1e-8)

            node_b_pred = node_b_logits.argmax(dim=-1)
            node_b_acc = ((node_b_pred == target_node_b) * component_mask).sum() / (component_mask.sum() + 1e-8)

            value_mae = (torch.abs(pred_values - target_values) * component_mask).sum() / (component_mask.sum() + 1e-8)

        metrics = {
            'loss': total_loss.item(),
            'type_loss': type_loss.item(),
            'node_loss': node_loss.item(),
            'value_loss': value_loss.item(),
            'type_acc': type_acc.item() * 100,
            'node_a_acc': node_a_acc.item() * 100,
            'node_b_acc': node_b_acc.item() * 100,
            'value_mae': value_mae.item()
        }

        return total_loss, metrics
