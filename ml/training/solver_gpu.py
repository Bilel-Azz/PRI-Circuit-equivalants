"""
GPU-accelerated MNA solver using PyTorch batched operations.
Solves impedance for multiple circuits in parallel on GPU.
"""
import torch
import torch.nn.functional as F
from typing import List, Dict
import numpy as np

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import COMP_R, COMP_L, COMP_C, FREQUENCIES, NUM_FREQ

# Pre-compute omega on GPU
OMEGA_TENSOR = None

def get_omega(device):
    global OMEGA_TENSOR
    if OMEGA_TENSOR is None or OMEGA_TENSOR.device != device:
        OMEGA_TENSOR = torch.tensor(2 * np.pi * FREQUENCIES, dtype=torch.float32, device=device)
    return OMEGA_TENSOR


def sequences_to_components_batch(sequences, value_center={1: 3.0, 2: -4.0, 3: -8.0}):
    """
    Convert batch of sequences to component info tensors.
    Returns: comp_types, node_as, node_bs, values, masks (all batch x seq_len)
    """
    batch_size, seq_len, _ = sequences.shape
    
    comp_types = sequences[:, :, 0].long()
    node_as = sequences[:, :, 1].long()
    node_bs = sequences[:, :, 2].long()
    raw_values = sequences[:, :, 3]
    
    # Compute actual values with center offset
    values = torch.zeros_like(raw_values)
    for t, center in value_center.items():
        mask = (comp_types == t)
        values[mask] = 10 ** (raw_values[mask] + center)
    
    # Valid component mask (R, L, C only, no self-loops)
    valid_mask = ((comp_types >= COMP_R) & (comp_types <= COMP_C) & (node_as != node_bs))
    
    return comp_types, node_as, node_bs, values, valid_mask


def compute_impedance_gpu(sequences: torch.Tensor, max_nodes: int = 8) -> torch.Tensor:
    """
    Compute impedance for a batch of circuit sequences on GPU.
    
    Args:
        sequences: (batch, seq_len, 4) tensor of [type, node_a, node_b, value]
        max_nodes: Maximum number of nodes (for matrix size)
    
    Returns:
        (batch, 2, num_freq) tensor of [log_mag, phase]
    """
    device = sequences.device
    batch_size, seq_len, _ = sequences.shape
    num_freq = NUM_FREQ
    n_reduced = max_nodes - 1  # Exclude GND
    
    omega = get_omega(device)
    
    # Parse sequences
    comp_types, node_as, node_bs, values, valid_mask = sequences_to_components_batch(sequences)
    
    # Output tensor
    Z_mag = torch.zeros(batch_size, num_freq, device=device)
    Z_phase = torch.zeros(batch_size, num_freq, device=device)
    
    # Build Y matrices for all frequencies at once
    # Y shape: (batch, num_freq, n_reduced, n_reduced)
    Y_real = torch.zeros(batch_size, num_freq, n_reduced, n_reduced, device=device)
    Y_imag = torch.zeros(batch_size, num_freq, n_reduced, n_reduced, device=device)
    
    for b in range(batch_size):
        for s in range(seq_len):
            if not valid_mask[b, s]:
                continue
            
            ctype = comp_types[b, s].item()
            na = node_as[b, s].item()
            nb = node_bs[b, s].item()
            val = values[b, s].item()
            
            if val <= 0:
                continue
            
            # Compute admittance y = g + j*b for each frequency
            if ctype == COMP_R:
                g = 1.0 / val  # Conductance (real)
                g_vec = torch.full((num_freq,), g, device=device)
                b_vec = torch.zeros(num_freq, device=device)
            elif ctype == COMP_L:
                # y = 1/(jwL) = -j/(wL)
                g_vec = torch.zeros(num_freq, device=device)
                b_vec = -1.0 / (omega * val + 1e-15)  # Susceptance
            elif ctype == COMP_C:
                # y = jwC
                g_vec = torch.zeros(num_freq, device=device)
                b_vec = omega * val
            else:
                continue
            
            # Stamp into Y matrix
            if na > 0 and nb > 0:
                idx_a, idx_b = na - 1, nb - 1
                Y_real[b, :, idx_a, idx_a] += g_vec
                Y_real[b, :, idx_b, idx_b] += g_vec
                Y_real[b, :, idx_a, idx_b] -= g_vec
                Y_real[b, :, idx_b, idx_a] -= g_vec
                Y_imag[b, :, idx_a, idx_a] += b_vec
                Y_imag[b, :, idx_b, idx_b] += b_vec
                Y_imag[b, :, idx_a, idx_b] -= b_vec
                Y_imag[b, :, idx_b, idx_a] -= b_vec
            elif na == 0:  # na is GND
                idx_b = nb - 1
                Y_real[b, :, idx_b, idx_b] += g_vec
                Y_imag[b, :, idx_b, idx_b] += b_vec
            else:  # nb is GND
                idx_a = na - 1
                Y_real[b, :, idx_a, idx_a] += g_vec
                Y_imag[b, :, idx_a, idx_a] += b_vec
    
    # Build complex Y matrix
    Y = torch.complex(Y_real, Y_imag)  # (batch, num_freq, n_reduced, n_reduced)
    
    # Current source: I[0] = 1
    I = torch.zeros(batch_size, num_freq, n_reduced, dtype=torch.cfloat, device=device)
    I[:, :, 0] = 1.0
    
    # Solve Y @ V = I for each frequency (batched)
    # Reshape for batched solve: (batch * num_freq, n_reduced, n_reduced)
    Y_flat = Y.reshape(batch_size * num_freq, n_reduced, n_reduced)
    I_flat = I.reshape(batch_size * num_freq, n_reduced, 1)
    
    # Add small diagonal for numerical stability
    Y_flat = Y_flat + 1e-10 * torch.eye(n_reduced, device=device, dtype=torch.cfloat)
    
    try:
        V_flat = torch.linalg.solve(Y_flat, I_flat)  # GPU batched solve!
        V = V_flat.reshape(batch_size, num_freq, n_reduced)
        
        # Z_in = V[0] (voltage at input node)
        Z_in = V[:, :, 0]  # (batch, num_freq)
        
        # Clamp extreme values
        Z_in = torch.clamp(Z_in.abs(), min=1e-6, max=1e10)
        
        Z_mag = torch.log10(Z_in)
        Z_phase = torch.angle(V[:, :, 0])
        
    except Exception as e:
        # Fallback: high impedance
        Z_mag = torch.full((batch_size, num_freq), 6.0, device=device)
        Z_phase = torch.zeros(batch_size, num_freq, device=device)
    
    # Return (batch, 2, num_freq)
    return torch.stack([Z_mag, Z_phase], dim=1)


if __name__ == "__main__":
    print("=== Testing GPU MNA Solver ===")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Device: {device}")
    
    # Create test sequences (batch of 4 RLC circuits)
    batch_size = 64
    seq_len = 12
    
    sequences = torch.zeros(batch_size, seq_len, 4, device=device)
    # Simple RLC: R(100) 1-2, L(1mH) 2-3, C(1uF) 3-0
    for b in range(batch_size):
        sequences[b, 1, :] = torch.tensor([COMP_R, 1, 2, 2.0 - 3.0])  # R=100
        sequences[b, 2, :] = torch.tensor([COMP_L, 2, 3, -3.0 - (-4.0)])  # L=1mH
        sequences[b, 3, :] = torch.tensor([COMP_C, 3, 0, -6.0 - (-8.0)])  # C=1uF
    
    # Benchmark
    import time
    
    # Warmup
    _ = compute_impedance_gpu(sequences)
    torch.cuda.synchronize()
    
    # Time it
    start = time.time()
    for _ in range(10):
        Z = compute_impedance_gpu(sequences)
        torch.cuda.synchronize()
    elapsed = time.time() - start
    
    print(f"\nBatch size: {batch_size}")
    print(f"Time for 10 batches: {elapsed:.3f}s")
    print(f"Time per batch: {elapsed/10*1000:.1f}ms")
    print(f"Z shape: {Z.shape}")
    print(f"Z[0] mag range: [{Z[0,0].min():.2f}, {Z[0,0].max():.2f}]")
    print(f"\nGPU solver ready!")
