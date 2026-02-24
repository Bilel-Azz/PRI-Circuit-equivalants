"""Forward Model: Circuit -> Z(f). Used for reconstruction loss in training."""
import torch
import torch.nn as nn
import torch.nn.functional as F

from config import (
    MAX_SEQ_LEN, NUM_FREQ, NUM_TOKENS, MAX_NODES,
    D_MODEL, N_HEAD, N_LAYERS, DROPOUT
)


class CircuitEncoder(nn.Module):
    """
    Encode circuit sequence into a latent representation.
    Input: (batch, seq_len, 4) - [type, node_a, node_b, value]
    Output: (batch, latent_dim)
    """

    def __init__(
        self,
        d_model: int = D_MODEL,
        nhead: int = N_HEAD,
        num_layers: int = 4,
        latent_dim: int = 256
    ):
        super().__init__()

        self.type_emb = nn.Embedding(NUM_TOKENS, d_model // 4)
        self.node_a_emb = nn.Embedding(MAX_NODES, d_model // 4)
        self.node_b_emb = nn.Embedding(MAX_NODES, d_model // 4)
        self.value_proj = nn.Linear(1, d_model // 4)
        self.input_proj = nn.Linear(d_model, d_model)

        self.pos_emb = nn.Embedding(MAX_SEQ_LEN, d_model)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=d_model * 4,
            dropout=DROPOUT,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers)

        self.output_proj = nn.Linear(d_model, latent_dim)

    def forward(
        self,
        seq: torch.Tensor,
        type_soft: torch.Tensor = None,
        node_a_soft: torch.Tensor = None,
        node_b_soft: torch.Tensor = None
    ) -> torch.Tensor:
        """
        Args:
            seq: (batch, seq_len, 4) - hard sequence
            type_soft: optional soft probabilities for gradient flow
            node_a_soft: optional soft probabilities
            node_b_soft: optional soft probabilities
        """
        batch_size, seq_len, _ = seq.shape
        device = seq.device

        value = seq[:, :, 3:4]

        # Use soft embeddings if provided (for gradient flow), otherwise hard
        if type_soft is not None:
            type_e = type_soft @ self.type_emb.weight
            node_a_e = node_a_soft @ self.node_a_emb.weight
            node_b_e = node_b_soft @ self.node_b_emb.weight
        else:
            comp_type = seq[:, :, 0].long().clamp(0, NUM_TOKENS - 1)
            node_a = seq[:, :, 1].long().clamp(0, MAX_NODES - 1)
            node_b = seq[:, :, 2].long().clamp(0, MAX_NODES - 1)
            type_e = self.type_emb(comp_type)
            node_a_e = self.node_a_emb(node_a)
            node_b_e = self.node_b_emb(node_b)

        value_e = self.value_proj(value)

        x = torch.cat([type_e, node_a_e, node_b_e, value_e], dim=-1)
        x = self.input_proj(x)

        positions = torch.arange(seq_len, device=device).unsqueeze(0).expand(batch_size, -1)
        x = x + self.pos_emb(positions)

        x = self.transformer(x)
        x = x.mean(dim=1)

        return self.output_proj(x)


class ImpedanceDecoder(nn.Module):
    """
    Input: (batch, latent_dim)
    Output: (batch, 2, num_freq) - [log|Z|, phase]
    """

    def __init__(
        self,
        latent_dim: int = 256,
        hidden_dim: int = 512,
        num_freq: int = NUM_FREQ
    ):
        super().__init__()

        self.num_freq = num_freq

        self.net = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim),
            nn.ReLU(),
            nn.LayerNorm(hidden_dim),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.LayerNorm(hidden_dim),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.LayerNorm(hidden_dim),
            nn.Linear(hidden_dim, num_freq * 2)
        )

    def forward(self, latent: torch.Tensor) -> torch.Tensor:
        x = self.net(latent)
        return x.view(-1, 2, self.num_freq)


class ForwardModel(nn.Module):
    """Complete forward model: Circuit -> Z(f)."""

    def __init__(
        self,
        d_model: int = 256,
        latent_dim: int = 256,
        num_freq: int = NUM_FREQ
    ):
        super().__init__()

        self.circuit_encoder = CircuitEncoder(
            d_model=d_model,
            latent_dim=latent_dim
        )

        self.impedance_decoder = ImpedanceDecoder(
            latent_dim=latent_dim,
            num_freq=num_freq
        )

    def forward(
        self,
        circuit_seq: torch.Tensor,
        type_soft: torch.Tensor = None,
        node_a_soft: torch.Tensor = None,
        node_b_soft: torch.Tensor = None
    ) -> torch.Tensor:
        latent = self.circuit_encoder(
            circuit_seq,
            type_soft=type_soft,
            node_a_soft=node_a_soft,
            node_b_soft=node_b_soft
        )
        z_pred = self.impedance_decoder(latent)
        return z_pred

    def count_parameters(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)
