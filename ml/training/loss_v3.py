"""
Loss V3: Derivative-aware loss function.

Captures curve SHAPE through derivatives, not just point-by-point matching.
- 1st derivative: slopes, rise/fall patterns
- 2nd derivative: peaks, valleys, inflection points

This prevents the model from "smoothing" complex curves with simple RLC.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Optional

from config import COMP_R, COMP_L, COMP_C, TOKEN_END, MAX_NODES


class CircuitLossV3(nn.Module):

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

        # 1st derivative (finite differences)
        pred_d1 = pred_mag[:, 1:] - pred_mag[:, :-1]
        target_d1 = target_mag[:, 1:] - target_mag[:, :-1]
        d1_loss = F.mse_loss(pred_d1, target_d1)

        # 2nd derivative
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

    def compute_validity_penalties(
        self,
        node_a_logits: torch.Tensor,
        node_b_logits: torch.Tensor,
        type_logits: torch.Tensor
    ) -> Dict[str, torch.Tensor]:
        batch_size, seq_len, num_nodes = node_a_logits.shape
        device = node_a_logits.device

        node_a_probs = F.softmax(node_a_logits, dim=-1)
        node_b_probs = F.softmax(node_b_logits, dim=-1)
        type_probs = F.softmax(type_logits, dim=-1)

        comp_mask = type_probs[:, :, COMP_R] + type_probs[:, :, COMP_L] + type_probs[:, :, COMP_C]

        # Self-loop penalty: P(node_a == node_b)
        selfloop_prob = (node_a_probs * node_b_probs).sum(dim=-1)
        selfloop_penalty = (selfloop_prob * comp_mask).mean()

        # Duplicate penalty
        edge_probs = torch.einsum('bsi,bsj->bsij', node_a_probs, node_b_probs)
        edge_probs = edge_probs + edge_probs.transpose(-1, -2)

        duplicate_penalty = torch.tensor(0.0, device=device)
        for b in range(batch_size):
            for s1 in range(seq_len):
                for s2 in range(s1 + 1, seq_len):
                    overlap = (edge_probs[b, s1] * edge_probs[b, s2]).sum()
                    weight = comp_mask[b, s1] * comp_mask[b, s2]
                    duplicate_penalty = duplicate_penalty + overlap * weight

        duplicate_penalty = duplicate_penalty / (batch_size * seq_len * (seq_len - 1) / 2 + 1e-8)

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

        validity = self.compute_validity_penalties(node_a_logits, node_b_logits, type_logits)

        imp_losses = {'mag_loss': torch.tensor(0.0), 'd1_loss': torch.tensor(0.0),
                      'd2_loss': torch.tensor(0.0), 'phase_loss': torch.tensor(0.0)}
        if pred_impedance is not None and target_impedance is not None:
            imp_losses = self.compute_derivative_loss(pred_impedance, target_impedance)

        total_loss = (
            self.type_weight * type_loss +
            self.node_weight * (node_a_loss + node_b_loss) +
            self.value_weight * value_loss +
            self.selfloop_weight * validity['selfloop_penalty'] +
            self.duplicate_weight * validity['duplicate_penalty'] +
            self.impedance_weight * imp_losses['mag_loss'] +
            self.d1_weight * imp_losses['d1_loss'] +
            self.d2_weight * imp_losses['d2_loss'] +
            0.1 * imp_losses['phase_loss']
        )

        return {
            'total': total_loss,
            'type': type_loss,
            'node_a': node_a_loss,
            'node_b': node_b_loss,
            'value': value_loss,
            'selfloop': validity['selfloop_penalty'],
            'duplicate': validity['duplicate_penalty'],
            'mag': imp_losses['mag_loss'],
            'd1': imp_losses['d1_loss'],
            'd2': imp_losses['d2_loss'],
            'phase': imp_losses['phase_loss']
        }
