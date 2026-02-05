"""
Circuit Transformer V2:
- Uses DecoderV2 with constrained node_b != node_a
- Compatible with LossV2 validity penalties
"""
import torch
import torch.nn as nn
from typing import Optional

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.encoder import ImpedanceEncoder
from models.decoder_v2 import TransformerDecoderV2
from config import LATENT_DIM, D_MODEL, N_HEAD, N_LAYERS


class CircuitTransformerV2(nn.Module):
    """
    V2 Model with constrained generation.
    Guarantees no self-loops (node_a != node_b).
    """

    def __init__(
        self,
        latent_dim: int = LATENT_DIM,
        d_model: int = D_MODEL,
        nhead: int = N_HEAD,
        num_layers: int = N_LAYERS
    ):
        super().__init__()
        
        self.encoder = ImpedanceEncoder(latent_dim=latent_dim)
        self.decoder = TransformerDecoderV2(
            latent_dim=latent_dim,
            d_model=d_model,
            nhead=nhead,
            num_layers=num_layers
        )
        self.tau = 1.0

    def forward(
        self,
        impedance: torch.Tensor,
        teacher_seq: Optional[torch.Tensor] = None,
        hard: bool = False
    ) -> dict:
        latent = self.encoder(impedance)
        output = self.decoder(latent, teacher_seq=teacher_seq, tau=self.tau, hard=hard)
        output['latent'] = latent
        return output

    def generate(self, impedance: torch.Tensor, tau: float = 0.5) -> torch.Tensor:
        """Generate circuit sequence from impedance."""
        self.eval()
        old_tau = self.tau
        self.tau = tau
        
        with torch.no_grad():
            output = self.forward(impedance, teacher_seq=None, hard=True)
        
        self.tau = old_tau
        return output['sequence']

    def count_parameters(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)


if __name__ == "__main__":
    print("=== Testing Circuit Transformer V2 ===")
    
    model = CircuitTransformerV2()
    print(f"Parameters: {model.count_parameters():,}")
    
    # Test
    impedance = torch.randn(4, 2, 100)  # batch=4
    output = model.generate(impedance, tau=0.5)
    
    print(f"\nGenerated sequence shape: {output.shape}")
    print(f"Sample sequence (first batch):")
    
    seq = output[0].cpu().numpy()
    selfloop_count = 0
    for i, row in enumerate(seq):
        if row[0] in [1, 2, 3]:  # R, L, C
            na, nb = int(row[1]), int(row[2])
            if na == nb:
                selfloop_count += 1
            print(f"  Pos {i}: type={int(row[0])}, ({na}->{nb}), val={row[3]:.2f}")
    
    print(f"\nSelf-loops in batch 0: {selfloop_count}")
    print(f"V2 constraint {'WORKING' if selfloop_count == 0 else 'FAILED'}")
