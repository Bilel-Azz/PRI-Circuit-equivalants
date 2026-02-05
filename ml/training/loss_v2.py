"""
Loss V2 with validity penalties.
Option 4: Adds differentiable penalties for invalid circuit configurations.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import TOKEN_PAD, TOKEN_START, TOKEN_END, COMP_R, COMP_L, COMP_C


class CircuitLossV2(nn.Module):
    """
    Loss function with structural validity penalties.
    
    Penalties:
    1. Self-loop: P(node_a == node_b) should be 0
    2. Duplicate: P(same edge appears twice) should be 0
    3. GND/IN presence: Circuits should contain nodes 0 and 1
    """

    def __init__(
        self,
        type_weight: float = 1.0,
        node_weight: float = 0.5,
        value_weight: float = 1.0,
        selfloop_weight: float = 2.0,
        duplicate_weight: float = 1.0,
        gnd_in_weight: float = 0.5
    ):
        super().__init__()
        self.type_weight = type_weight
        self.node_weight = node_weight
        self.value_weight = value_weight
        self.selfloop_weight = selfloop_weight
        self.duplicate_weight = duplicate_weight
        self.gnd_in_weight = gnd_in_weight

        self.ce_loss = nn.CrossEntropyLoss(reduction='none')
        self.mse_loss = nn.MSELoss(reduction='none')

    def forward(self, output: dict, batch: dict) -> tuple:
        """
        Args:
            output: dict with 'type_logits', 'node_a_logits', 'node_b_logits', 'values'
            batch: dict with 'sequence' target
        
        Returns:
            (total_loss, metrics_dict)
        """
        type_logits = output['type_logits']
        node_a_logits = output['node_a_logits']
        node_b_logits = output['node_b_logits']
        pred_values = output['values'].squeeze(-1)

        target_seq = batch['sequence']
        batch_size, seq_len, _ = target_seq.shape
        device = type_logits.device

        # Shift targets (predict next token)
        target_shifted = torch.zeros_like(target_seq)
        target_shifted[:, :-1] = target_seq[:, 1:]

        target_types = target_shifted[:, :, 0].long()
        target_node_a = target_shifted[:, :, 1].long()
        target_node_b = target_shifted[:, :, 2].long()
        target_values = target_shifted[:, :, 3]

        # Mask: only compute loss for actual components (R, L, C)
        is_component = (target_types >= COMP_R) & (target_types <= COMP_C)
        mask = is_component.float()

        # === Standard losses ===
        
        # Type loss (all positions)
        type_loss = self.ce_loss(
            type_logits.view(-1, type_logits.size(-1)),
            target_types.view(-1)
        ).view(batch_size, seq_len).mean()

        # Node losses (only component positions)
        node_a_loss = self.ce_loss(
            node_a_logits.view(-1, node_a_logits.size(-1)),
            target_node_a.view(-1)
        ).view(batch_size, seq_len)
        node_a_loss = (node_a_loss * mask).sum() / (mask.sum() + 1e-8)

        node_b_loss = self.ce_loss(
            node_b_logits.view(-1, node_b_logits.size(-1)),
            target_node_b.view(-1)
        ).view(batch_size, seq_len)
        node_b_loss = (node_b_loss * mask).sum() / (mask.sum() + 1e-8)

        node_loss = (node_a_loss + node_b_loss) / 2

        # Value loss (only component positions)
        value_loss = self.mse_loss(pred_values, target_values)
        value_loss = (value_loss * mask).sum() / (mask.sum() + 1e-8)

        # === Validity penalties ===
        
        # 1. Self-loop penalty: P(node_a == node_b) for each position
        selfloop_pen = self._compute_selfloop_penalty(node_a_logits, node_b_logits, mask)

        # 2. Duplicate edge penalty
        duplicate_pen = self._compute_duplicate_penalty(node_a_logits, node_b_logits, mask)

        # 3. GND/IN presence penalty
        gnd_in_pen = self._compute_gnd_in_penalty(node_a_logits, node_b_logits, type_logits)

        # === Total loss ===
        supervised_loss = (
            self.type_weight * type_loss +
            self.node_weight * node_loss +
            self.value_weight * value_loss
        )

        validity_loss = (
            self.selfloop_weight * selfloop_pen +
            self.duplicate_weight * duplicate_pen +
            self.gnd_in_weight * gnd_in_pen
        )

        total_loss = supervised_loss + validity_loss

        # === Metrics ===
        with torch.no_grad():
            type_pred = type_logits.argmax(dim=-1)
            type_acc = (type_pred == target_types).float().mean() * 100

            node_a_pred = node_a_logits.argmax(dim=-1)
            node_a_acc = ((node_a_pred == target_node_a).float() * mask).sum() / (mask.sum() + 1e-8) * 100

            node_b_pred = node_b_logits.argmax(dim=-1)
            node_b_acc = ((node_b_pred == target_node_b).float() * mask).sum() / (mask.sum() + 1e-8) * 100

            node_acc = (node_a_acc + node_b_acc) / 2

            value_mae = ((pred_values - target_values).abs() * mask).sum() / (mask.sum() + 1e-8)

        metrics = {
            'loss': total_loss.item(),
            'supervised_loss': supervised_loss.item(),
            'validity_loss': validity_loss.item(),
            'type_loss': type_loss.item(),
            'node_loss': node_loss.item(),
            'value_loss': value_loss.item(),
            'selfloop_pen': selfloop_pen.item(),
            'duplicate_pen': duplicate_pen.item(),
            'gnd_in_pen': gnd_in_pen.item(),
            'type_acc': type_acc.item(),
            'node_acc': node_acc.item(),
            'value_mae': value_mae.item()
        }

        return total_loss, metrics

    def _compute_selfloop_penalty(self, node_a_logits, node_b_logits, mask):
        """
        Penalize P(node_a == node_b) = sum_i P(a=i) * P(b=i)
        """
        p_a = F.softmax(node_a_logits, dim=-1)  # (batch, seq, num_nodes)
        p_b = F.softmax(node_b_logits, dim=-1)
        
        # P(self-loop) = sum over all nodes i of P(a=i) * P(b=i)
        selfloop_prob = (p_a * p_b).sum(dim=-1)  # (batch, seq)
        
        # Average over valid positions
        penalty = (selfloop_prob * mask).sum() / (mask.sum() + 1e-8)
        return penalty

    def _compute_duplicate_penalty(self, node_a_logits, node_b_logits, mask):
        """
        Penalize duplicate edges across positions.
        Uses soft edge representation.
        """
        p_a = F.softmax(node_a_logits, dim=-1)  # (batch, seq, N)
        p_b = F.softmax(node_b_logits, dim=-1)
        
        batch_size, seq_len, num_nodes = p_a.shape
        
        # Create soft edge representation: P(edge = (i, j)) = P(a=i)*P(b=j) + P(a=j)*P(b=i)
        # Shape: (batch, seq, N, N)
        p_edge = torch.einsum('bti,btj->btij', p_a, p_b)
        p_edge_sym = p_edge + p_edge.transpose(-1, -2)  # Symmetric for undirected edges
        
        # Sum edge probabilities across positions (weighted by mask)
        mask_expanded = mask.unsqueeze(-1).unsqueeze(-1)  # (batch, seq, 1, 1)
        edge_counts = (p_edge_sym * mask_expanded).sum(dim=1)  # (batch, N, N)
        
        # Penalize edges that appear more than once
        excess = F.relu(edge_counts - 1.0)  # Only penalize if > 1
        penalty = (excess ** 2).mean()
        
        return penalty

    def _compute_gnd_in_penalty(self, node_a_logits, node_b_logits, type_logits):
        """
        Penalize circuits that don't include GND (node 0) and IN (node 1).
        """
        p_a = F.softmax(node_a_logits, dim=-1)  # (batch, seq, N)
        p_b = F.softmax(node_b_logits, dim=-1)
        p_type = F.softmax(type_logits, dim=-1)  # (batch, seq, num_types)
        
        # P(is component) = P(R) + P(L) + P(C)
        p_comp = p_type[:, :, COMP_R] + p_type[:, :, COMP_L] + p_type[:, :, COMP_C]  # (batch, seq)
        
        # For each node, compute P(node appears) = 1 - prod(1 - P(node in position t))
        # Simplified: sum of P(node_a=n or node_b=n) weighted by P(is_component)
        p_node_a_0 = (p_a[:, :, 0] * p_comp).sum(dim=1)  # (batch,)
        p_node_b_0 = (p_b[:, :, 0] * p_comp).sum(dim=1)
        p_gnd = 1 - torch.exp(-p_node_a_0 - p_node_b_0)  # Soft approximation
        
        p_node_a_1 = (p_a[:, :, 1] * p_comp).sum(dim=1)
        p_node_b_1 = (p_b[:, :, 1] * p_comp).sum(dim=1)
        p_in = 1 - torch.exp(-p_node_a_1 - p_node_b_1)
        
        # Penalize low probability of having GND and IN
        penalty = (1 - p_gnd).mean() + (1 - p_in).mean()
        
        return penalty


if __name__ == "__main__":
    print("=== Testing Loss V2 ===")
    
    loss_fn = CircuitLossV2()
    
    batch_size, seq_len = 4, 12
    num_types, num_nodes = 6, 8
    
    output = {
        'type_logits': torch.randn(batch_size, seq_len, num_types),
        'node_a_logits': torch.randn(batch_size, seq_len, num_nodes),
        'node_b_logits': torch.randn(batch_size, seq_len, num_nodes),
        'values': torch.randn(batch_size, seq_len, 1)
    }
    
    batch = {
        'sequence': torch.zeros(batch_size, seq_len, 4)
    }
    # Fill with some components
    batch['sequence'][:, 0, 0] = 4  # START
    batch['sequence'][:, 1, :] = torch.tensor([1, 0, 1, 0.0])  # R
    batch['sequence'][:, 2, :] = torch.tensor([2, 1, 2, -1.0])  # L
    batch['sequence'][:, 3, :] = torch.tensor([3, 2, 0, -2.0])  # C
    batch['sequence'][:, 4, 0] = 5  # END
    
    loss, metrics = loss_fn(output, batch)
    
    print(f"Total loss: {loss.item():.4f}")
    print(f"\nMetrics:")
    for k, v in metrics.items():
        print(f"  {k}: {v:.4f}")
