"""Full Circuit Transformer Model: ImpedanceEncoder + TransformerDecoder."""
import torch
import torch.nn as nn
from typing import Dict, Optional

from config import NUM_FREQ, LATENT_DIM, D_MODEL, N_HEAD, N_LAYERS, MAX_SEQ_LEN
from models.encoder import ImpedanceEncoder
from models.decoder import TransformerDecoder


class CircuitTransformer(nn.Module):
    """
    End-to-end model: Z(f) -> circuit sequence.
    Input: (batch, 2, NUM_FREQ) impedance curve
    Output: (batch, MAX_SEQ_LEN, 4) circuit sequence
    """

    def __init__(
        self,
        num_freq: int = NUM_FREQ,
        latent_dim: int = LATENT_DIM,
        d_model: int = D_MODEL,
        nhead: int = N_HEAD,
        num_layers: int = N_LAYERS,
        max_seq_len: int = MAX_SEQ_LEN
    ):
        super().__init__()

        self.encoder = ImpedanceEncoder(
            num_freq=num_freq,
            latent_dim=latent_dim
        )

        self.decoder = TransformerDecoder(
            latent_dim=latent_dim,
            d_model=d_model,
            nhead=nhead,
            num_layers=num_layers,
            max_seq_len=max_seq_len
        )

        self.tau = 1.0

    def set_tau(self, tau: float):
        self.tau = tau

    def forward(
        self,
        impedance: torch.Tensor,
        teacher_seq: Optional[torch.Tensor] = None,
        hard: bool = False
    ) -> Dict[str, torch.Tensor]:
        latent = self.encoder(impedance)

        output = self.decoder(
            latent,
            teacher_seq=teacher_seq,
            tau=self.tau,
            hard=hard
        )

        output['latent'] = latent
        return output

    def generate(
        self,
        impedance: torch.Tensor,
        tau: float = 0.5
    ) -> torch.Tensor:
        """Generate circuit from impedance (inference)."""
        self.eval()
        old_tau = self.tau
        self.tau = tau

        with torch.no_grad():
            output = self.forward(impedance, teacher_seq=None, hard=True)

        self.tau = old_tau
        return output['sequence']

    def count_parameters(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)
