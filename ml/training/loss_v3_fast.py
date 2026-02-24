"""Loss V3 Fast: Vectorized derivative-aware loss function. NO Python loops."""
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Optional

from config import COMP_R, COMP_L, COMP_C, TOKEN_END, MAX_NODES


class CircuitLossV3Fast(nn.Module):

    def __init__(
        self,
        type_weight: float = 1.0,
        node_weight: float = 1.0,
        value_weight: float = 0.5,
        impedance_weight: float = 1.0,
        d1_weight: float = 0.5,
        d2_weight: float = 0.3,
        selfloop_weight: float = 2.0,
        duplicate_weight: float = 1.0,
        label_smoothing: float = 0.1
    ):
        super().__init__()

        self.type_weight = type_weight
        self.node_weight = node_weight
        self.value_weight = value_weight
        self.impedance_weight = impedance_weight
        self.d1_weight = d1_weight
        self.d2_weight = d2_weight
        self.selfloop_weight = selfloop_weight
        self.duplicate_weight = duplicate_weight

        self.type_criterion = nn.CrossEntropyLoss(label_smoothing=label_smoothing)
        self.node_criterion = nn.CrossEntropyLoss(label_smoothing=label_smoothing)
        self.value_criterion = nn.MSELoss()

    def compute_derivative_loss(
        self,
        pred_impedance: torch.Tensor,
        target_impedance: torch.Tensor
    ) -> Dict[str, torch.Tensor]:
        pred_mag = pred_impedance[:, 0, :]
        target_mag = target_impedance[:, 0, :]
        pred_phase = pred_impedance[:, 1, :]
        target_phase = target_impedance[:, 1, :]

        mag_loss = F.mse_loss(pred_mag, target_mag)

        pred_d1 = pred_mag[:, 1:] - pred_mag[:, :-1]
        target_d1 = target_mag[:, 1:] - target_mag[:, :-1]
        d1_loss = F.mse_loss(pred_d1, target_d1)

        pred_d2 = pred_d1[:, 1:] - pred_d1[:, :-1]
        target_d2 = target_d1[:, 1:] - target_d1[:, :-1]
        d2_loss = F.mse_loss(pred_d2, target_d2)

        phase_loss = F.mse_loss(pred_phase, target_phase)

        return {
            'mag_loss': mag_loss,
            'd1_loss': d1_loss,
            'd2_loss': d2_loss,
            'phase_loss': phase_loss
        }

    def compute_validity_penalties_fast(
        self,
        node_a_logits: torch.Tensor,
        node_b_logits: torch.Tensor,
        type_logits: torch.Tensor
    ) -> Dict[str, torch.Tensor]:
        """Fully vectorized validity penalties - NO Python loops."""
        batch_size, seq_len, num_nodes = node_a_logits.shape
        device = node_a_logits.device

        node_a_probs = F.softmax(node_a_logits, dim=-1)
        node_b_probs = F.softmax(node_b_logits, dim=-1)
        type_probs = F.softmax(type_logits, dim=-1)

        comp_mask = type_probs[:, :, COMP_R] + type_probs[:, :, COMP_L] + type_probs[:, :, COMP_C]

        # Self-loop penalty
        selfloop_prob = (node_a_probs * node_b_probs).sum(dim=-1)
        selfloop_penalty = (selfloop_prob * comp_mask).mean()

        # Duplicate penalty (fully vectorized via batched inner product)
        edge_probs = torch.einsum('bsi,bsj->bsij', node_a_probs, node_b_probs)
        edge_probs = edge_probs + edge_probs.transpose(-1, -2)

        edge_flat = edge_probs.reshape(batch_size, seq_len, -1)
        overlap = torch.einsum('bsi,bti->bst', edge_flat, edge_flat)

        weight = comp_mask.unsqueeze(-1) * comp_mask.unsqueeze(-2)
        weighted_overlap = overlap * weight

        # Only count upper triangle (s1 < s2)
        triu_mask = torch.triu(torch.ones(seq_len, seq_len, device=device), diagonal=1)
        duplicate_penalty = (weighted_overlap * triu_mask).sum() / (batch_size * seq_len * (seq_len - 1) / 2 + 1e-8)

        return {
            'selfloop_penalty': selfloop_penalty,
            'duplicate_penalty': duplicate_penalty
        }

    def forward(
        self,
        output: Dict[str, torch.Tensor],
        target_seq: torch.Tensor,
        target_impedance: Optional[torch.Tensor] = None,
        pred_impedance: Optional[torch.Tensor] = None
    ) -> Dict[str, torch.Tensor]:
        type_logits = output['type_logits']
        node_a_logits = output['node_a_logits']
        node_b_logits = output['node_b_logits']
        values = output['values']

        batch_size, seq_len, _ = type_logits.shape

        target_types = target_seq[:, :, 0].long()
        target_node_a = target_seq[:, :, 1].long()
        target_node_b = target_seq[:, :, 2].long()
        target_values = target_seq[:, :, 3:4]

        type_loss = self.type_criterion(
            type_logits.reshape(-1, type_logits.size(-1)),
            target_types.reshape(-1)
        )

        node_a_loss = self.node_criterion(
            node_a_logits.reshape(-1, node_a_logits.size(-1)),
            target_node_a.reshape(-1)
        )

        node_b_loss = self.node_criterion(
            node_b_logits.reshape(-1, node_b_logits.size(-1)),
            target_node_b.reshape(-1)
        )

        value_loss = self.value_criterion(values, target_values)

        penalties = self.compute_validity_penalties_fast(node_a_logits, node_b_logits, type_logits)

        deriv_losses = {'mag_loss': 0, 'd1_loss': 0, 'd2_loss': 0, 'phase_loss': 0}
        if pred_impedance is not None and target_impedance is not None:
            deriv_losses = self.compute_derivative_loss(pred_impedance, target_impedance)

        total_loss = (
            self.type_weight * type_loss +
            self.node_weight * (node_a_loss + node_b_loss) +
            self.value_weight * value_loss +
            self.selfloop_weight * penalties['selfloop_penalty'] +
            self.duplicate_weight * penalties['duplicate_penalty']
        )

        if pred_impedance is not None:
            total_loss = total_loss + self.impedance_weight * (
                deriv_losses['mag_loss'] +
                self.d1_weight * deriv_losses['d1_loss'] +
                self.d2_weight * deriv_losses['d2_loss'] +
                0.1 * deriv_losses['phase_loss']
            )

        return {
            'total': total_loss,
            'type': type_loss,
            'node_a': node_a_loss,
            'node_b': node_b_loss,
            'value': value_loss,
            'selfloop': penalties['selfloop_penalty'],
            'duplicate': penalties['duplicate_penalty'],
            'mag': deriv_losses['mag_loss'],
            'd1': deriv_losses['d1_loss'],
            'd2': deriv_losses['d2_loss']
        }
