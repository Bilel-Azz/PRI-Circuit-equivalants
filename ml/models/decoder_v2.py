"""
Transformer Decoder V2 with constrained node_b != node_a.
Option 2: Structured head that guarantees node_b cannot equal node_a.
"""
import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Optional

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import (
    LATENT_DIM, D_MODEL, N_HEAD, N_LAYERS, DIM_FF, DROPOUT,
    MAX_SEQ_LEN, NUM_TOKENS, MAX_NODES
)


class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, max_len: int = 100):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1).float()
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * -(math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe)

    def forward(self, x):
        return x + self.pe[:x.size(1), :].unsqueeze(0)


class ComponentEmbedding(nn.Module):
    def __init__(self, d_model: int, vocab_size: int = NUM_TOKENS, max_nodes: int = MAX_NODES):
        super().__init__()
        self.type_emb = nn.Embedding(vocab_size, d_model // 4)
        self.node_a_emb = nn.Embedding(max_nodes, d_model // 4)
        self.node_b_emb = nn.Embedding(max_nodes, d_model // 4)
        self.value_proj = nn.Linear(1, d_model // 4)
        self.proj = nn.Linear(d_model, d_model)

    def forward(self, seq: torch.Tensor) -> torch.Tensor:
        comp_type = seq[:, :, 0].long().clamp(0, NUM_TOKENS - 1)
        node_a = seq[:, :, 1].long().clamp(0, MAX_NODES - 1)
        node_b = seq[:, :, 2].long().clamp(0, MAX_NODES - 1)
        value = seq[:, :, 3].unsqueeze(-1)
        
        type_e = self.type_emb(comp_type)
        node_a_e = self.node_a_emb(node_a)
        node_b_e = self.node_b_emb(node_b)
        value_e = self.value_proj(value)
        
        emb = torch.cat([type_e, node_a_e, node_b_e, value_e], dim=-1)
        return self.proj(emb)


class TransformerDecoderV2(nn.Module):
    """
    Decoder V2 with constrained generation:
    - node_b is forced to be different from node_a
    - Uses masking to eliminate self-loop possibilities
    """

    def __init__(
        self,
        latent_dim: int = LATENT_DIM,
        d_model: int = D_MODEL,
        nhead: int = N_HEAD,
        num_layers: int = N_LAYERS,
        dim_feedforward: int = DIM_FF,
        dropout: float = DROPOUT,
        max_seq_len: int = MAX_SEQ_LEN,
        vocab_size: int = NUM_TOKENS,
        max_nodes: int = MAX_NODES
    ):
        super().__init__()

        self.d_model = d_model
        self.max_seq_len = max_seq_len
        self.max_nodes = max_nodes

        self.latent_proj = nn.Linear(latent_dim, d_model)
        self.comp_emb = ComponentEmbedding(d_model, vocab_size, max_nodes)
        self.pos_enc = PositionalEncoding(d_model, max_seq_len)

        decoder_layer = nn.TransformerDecoderLayer(
            d_model=d_model, nhead=nhead, dim_feedforward=dim_feedforward,
            dropout=dropout, batch_first=True
        )
        self.transformer = nn.TransformerDecoder(decoder_layer, num_layers)

        # Standard heads
        self.type_head = nn.Linear(d_model, vocab_size)
        self.node_a_head = nn.Linear(d_model, max_nodes)
        self.value_head = nn.Linear(d_model, 1)
        
        # V2: Conditioned node_b head (takes node_a info as input)
        # node_b prediction is conditioned on the hidden state + node_a one-hot
        self.node_b_head = nn.Linear(d_model + max_nodes, max_nodes)

        self._init_weights()

    def _init_weights(self):
        for p in self.parameters():
            if p.dim() > 1:
                nn.init.xavier_uniform_(p)

    def _causal_mask(self, seq_len: int, device: torch.device) -> torch.Tensor:
        mask = torch.triu(torch.ones(seq_len, seq_len, device=device), diagonal=1)
        return mask.masked_fill(mask == 1, float('-inf'))

    def forward(
        self,
        latent: torch.Tensor,
        teacher_seq: Optional[torch.Tensor] = None,
        tau: float = 1.0,
        hard: bool = False
    ) -> Dict[str, torch.Tensor]:
        batch_size = latent.size(0)
        device = latent.device

        memory = self.latent_proj(latent).unsqueeze(1)

        if teacher_seq is not None:
            # Training with teacher forcing
            seq_len = teacher_seq.size(1)
            tgt = self.comp_emb(teacher_seq)
            tgt = self.pos_enc(tgt)
            tgt_mask = self._causal_mask(seq_len, device)

            output = self.transformer(tgt=tgt, memory=memory, tgt_mask=tgt_mask)

            type_logits = self.type_head(output)
            node_a_logits = self.node_a_head(output)
            values = self.value_head(output)

            # V2: Get node_a sample first, then condition node_b on it
            node_a_probs = F.gumbel_softmax(node_a_logits, tau=tau, hard=hard, dim=-1)
            node_a_sample = node_a_probs.argmax(dim=-1)
            
            # Condition node_b on hidden state + node_a one-hot
            node_a_onehot = F.one_hot(node_a_sample, self.max_nodes).float()
            node_b_input = torch.cat([output, node_a_onehot], dim=-1)
            node_b_logits = self.node_b_head(node_b_input)
            
            # CRITICAL: Mask out node_a position so node_b != node_a
            node_b_logits_masked = node_b_logits.clone()
            for b in range(batch_size):
                for t in range(seq_len):
                    na = node_a_sample[b, t].item()
                    node_b_logits_masked[b, t, int(na)] = float('-inf')
            
            node_b_sample = F.gumbel_softmax(node_b_logits_masked, tau=tau, hard=hard, dim=-1).argmax(dim=-1)

            sequence = torch.stack([
                type_logits.argmax(dim=-1).float(),
                node_a_sample.float(),
                node_b_sample.float(),
                values.squeeze(-1)
            ], dim=-1)

        else:
            # Inference: autoregressive
            sequence = self._generate_autoregressive(memory, batch_size, device, tau, hard)

            tgt = self.comp_emb(sequence)
            tgt = self.pos_enc(tgt)
            tgt_mask = self._causal_mask(sequence.size(1), device)
            output = self.transformer(tgt=tgt, memory=memory, tgt_mask=tgt_mask)

            type_logits = self.type_head(output)
            node_a_logits = self.node_a_head(output)
            node_a_onehot = F.one_hot(sequence[:, :, 1].long().clamp(0, self.max_nodes-1), self.max_nodes).float()
            node_b_input = torch.cat([output, node_a_onehot], dim=-1)
            node_b_logits = self.node_b_head(node_b_input)
            values = self.value_head(output)

        return {
            'type_logits': type_logits,
            'node_a_logits': node_a_logits,
            'node_b_logits': node_b_logits,
            'values': values,
            'sequence': sequence
        }

    def _generate_autoregressive(
        self,
        memory: torch.Tensor,
        batch_size: int,
        device: torch.device,
        tau: float,
        hard: bool
    ) -> torch.Tensor:
        """Autoregressive generation with node_b != node_a constraint."""
        from config import TOKEN_START, TOKEN_END

        sequence = torch.zeros(batch_size, self.max_seq_len, 4, device=device)
        sequence[:, 0, 0] = TOKEN_START

        for t in range(1, self.max_seq_len):
            tgt = self.comp_emb(sequence[:, :t])
            tgt = self.pos_enc(tgt)
            tgt_mask = self._causal_mask(t, device)

            output = self.transformer(tgt=tgt, memory=memory, tgt_mask=tgt_mask)
            last_output = output[:, -1, :]

            # Predict type
            type_logits = self.type_head(last_output)
            comp_type = F.gumbel_softmax(type_logits, tau=tau, hard=hard, dim=-1).argmax(dim=-1)

            # Predict node_a
            node_a_logits = self.node_a_head(last_output)
            node_a = F.gumbel_softmax(node_a_logits, tau=tau, hard=hard, dim=-1).argmax(dim=-1)

            # V2: Predict node_b conditioned on node_a, with masking
            node_a_onehot = F.one_hot(node_a, self.max_nodes).float()
            node_b_input = torch.cat([last_output, node_a_onehot], dim=-1)
            node_b_logits = self.node_b_head(node_b_input)
            
            # CRITICAL: Mask out node_a so node_b cannot equal node_a
            node_b_logits_masked = node_b_logits.clone()
            for b in range(batch_size):
                node_b_logits_masked[b, node_a[b].item()] = float('-inf')
            
            node_b = F.gumbel_softmax(node_b_logits_masked, tau=tau, hard=hard, dim=-1).argmax(dim=-1)

            # Predict value
            value = self.value_head(last_output)

            sequence[:, t, 0] = comp_type.float()
            sequence[:, t, 1] = node_a.float()
            sequence[:, t, 2] = node_b.float()
            sequence[:, t, 3] = value.squeeze(-1)

            if (comp_type == TOKEN_END).all():
                break

        return sequence


if __name__ == "__main__":
    print("=== Testing Decoder V2 (constrained node_b != node_a) ===")
    
    decoder = TransformerDecoderV2()
    print(f"Parameters: {sum(p.numel() for p in decoder.parameters()):,}")
    
    latent = torch.randn(4, LATENT_DIM)
    output = decoder(latent, tau=0.5, hard=True)
    
    print("\nGenerated sequence (sample 0):")
    seq = output['sequence'][0].numpy()
    for i, row in enumerate(seq):
        if row[0] > 0:
            print(f"  {i}: type={int(row[0])}, node_a={int(row[1])}, node_b={int(row[2])}, val={row[3]:.2f}")
    
    # Verify no self-loops
    has_selfloop = False
    for row in seq:
        if row[0] in [1, 2, 3]:  # R, L, C
            if int(row[1]) == int(row[2]):
                has_selfloop = True
                print(f"  SELF-LOOP FOUND: node_a={int(row[1])}, node_b={int(row[2])}")
    
    print(f"\nSelf-loop check: {'FAIL' if has_selfloop else 'PASS (no self-loops)'}")
