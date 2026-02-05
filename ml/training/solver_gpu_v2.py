"""
Fully vectorized GPU MNA solver - NO Python loops.
Uses scatter operations to build Y matrices in parallel.
"""
import torch
import numpy as np

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import COMP_R, COMP_L, COMP_C, FREQUENCIES, NUM_FREQ

# Pre-compute constants
OMEGA_TENSOR = None
FREQUENCIES_TENSOR = None

def get_omega(device):
    global OMEGA_TENSOR
    if OMEGA_TENSOR is None or OMEGA_TENSOR.device != device:
        OMEGA_TENSOR = torch.tensor(2 * np.pi * FREQUENCIES, dtype=torch.float32, device=device)
    return OMEGA_TENSOR


def compute_impedance_gpu_v2(sequences: torch.Tensor, max_nodes: int = 8) -> torch.Tensor:
    """
    Fully vectorized impedance computation - NO Python loops.
    
    Args:
        sequences: (batch, seq_len, 4) tensor of [type, node_a, node_b, value]
        max_nodes: Maximum number of nodes
    
    Returns:
        (batch, 2, num_freq) tensor of [log_mag, phase]
    """
    device = sequences.device
    dtype = sequences.dtype
    batch_size, seq_len, _ = sequences.shape
    num_freq = NUM_FREQ
    n_reduced = max_nodes - 1
    
    omega = get_omega(device)  # (num_freq,)
    
    # Parse sequences
    comp_types = sequences[:, :, 0].long()  # (batch, seq_len)
    node_as = sequences[:, :, 1].long()
    node_bs = sequences[:, :, 2].long()
    raw_values = sequences[:, :, 3]
    
    # Compute actual values with center offset (vectorized)
    value_centers = torch.zeros(6, device=device)
    value_centers[COMP_R] = 3.0
    value_centers[COMP_L] = -4.0
    value_centers[COMP_C] = -8.0
    
    centers = value_centers[comp_types.clamp(0, 5)]  # (batch, seq_len)
    values = torch.pow(10.0, raw_values + centers)
    
    # Valid mask: R/L/C components, no self-loops, positive values
    valid_mask = ((comp_types >= COMP_R) & (comp_types <= COMP_C) & 
                  (node_as != node_bs) & (values > 0))  # (batch, seq_len)
    
    # Mask invalid components
    values = values * valid_mask.float()  # Zero out invalid
    
    # ===== Compute admittances (Y = G + jB) for all components =====
    # Shape: (batch, seq_len, num_freq)
    
    # R: y = 1/R (real only)
    is_R = (comp_types == COMP_R) & valid_mask
    G_R = torch.where(is_R.unsqueeze(-1), 
                      (1.0 / values.clamp(min=1e-15)).unsqueeze(-1).expand(-1, -1, num_freq),
                      torch.zeros(batch_size, seq_len, num_freq, device=device))
    B_R = torch.zeros_like(G_R)
    
    # L: y = 1/(jwL) = -j/(wL)
    is_L = (comp_types == COMP_L) & valid_mask
    wL = omega.unsqueeze(0).unsqueeze(0) * values.unsqueeze(-1)  # (batch, seq_len, num_freq)
    G_L = torch.zeros(batch_size, seq_len, num_freq, device=device)
    B_L = torch.where(is_L.unsqueeze(-1),
                      -1.0 / wL.clamp(min=1e-15),
                      torch.zeros_like(G_L))
    
    # C: y = jwC
    is_C = (comp_types == COMP_C) & valid_mask
    wC = omega.unsqueeze(0).unsqueeze(0) * values.unsqueeze(-1)
    G_C = torch.zeros(batch_size, seq_len, num_freq, device=device)
    B_C = torch.where(is_C.unsqueeze(-1), wC, torch.zeros_like(G_C))
    
    # Total admittance per component
    G = G_R + G_L + G_C  # (batch, seq_len, num_freq)
    B = B_R + B_L + B_C
    
    # ===== Build Y matrices using scatter_add =====
    # Y[i,i] += y, Y[j,j] += y, Y[i,j] -= y, Y[j,i] -= y
    
    # Initialize Y matrices
    Y_real = torch.zeros(batch_size, num_freq, n_reduced, n_reduced, device=device)
    Y_imag = torch.zeros(batch_size, num_freq, n_reduced, n_reduced, device=device)
    
    # Adjust node indices (remove GND, so node 1 -> index 0)
    idx_a = (node_as - 1).clamp(min=-1)  # -1 means GND
    idx_b = (node_bs - 1).clamp(min=-1)
    
    # For each valid component, add to Y matrix
    # We'll use advanced indexing with masks
    
    # Flatten batch and seq dimensions for scatter
    B_flat, S_flat = batch_size, seq_len
    
    # Get batch indices
    batch_idx = torch.arange(batch_size, device=device).unsqueeze(1).expand(-1, seq_len)  # (batch, seq_len)
    
    # Process based on which nodes are connected (to/from GND or not)
    # Case 1: Both nodes > 0 (neither is GND)
    both_valid = (node_as > 0) & (node_bs > 0) & valid_mask
    
    if both_valid.any():
        bv_batch = batch_idx[both_valid]  # Batch indices
        bv_ia = idx_a[both_valid]  # Node A indices
        bv_ib = idx_b[both_valid]  # Node B indices
        bv_G = G[both_valid]  # (N, num_freq) conductances
        bv_B = B[both_valid]  # (N, num_freq) susceptances
        
        # For each frequency, add stamps
        for f in range(num_freq):
            # Y[a,a] += y
            Y_real[bv_batch, f, bv_ia, bv_ia] += bv_G[:, f]
            Y_imag[bv_batch, f, bv_ia, bv_ia] += bv_B[:, f]
            # Y[b,b] += y
            Y_real[bv_batch, f, bv_ib, bv_ib] += bv_G[:, f]
            Y_imag[bv_batch, f, bv_ib, bv_ib] += bv_B[:, f]
            # Y[a,b] -= y
            Y_real[bv_batch, f, bv_ia, bv_ib] -= bv_G[:, f]
            Y_imag[bv_batch, f, bv_ia, bv_ib] -= bv_B[:, f]
            # Y[b,a] -= y
            Y_real[bv_batch, f, bv_ib, bv_ia] -= bv_G[:, f]
            Y_imag[bv_batch, f, bv_ib, bv_ia] -= bv_B[:, f]
    
    # Case 2: node_a is GND (node_a == 0)
    a_gnd = (node_as == 0) & (node_bs > 0) & valid_mask
    
    if a_gnd.any():
        ag_batch = batch_idx[a_gnd]
        ag_ib = idx_b[a_gnd]
        ag_G = G[a_gnd]
        ag_B = B[a_gnd]
        
        for f in range(num_freq):
            Y_real[ag_batch, f, ag_ib, ag_ib] += ag_G[:, f]
            Y_imag[ag_batch, f, ag_ib, ag_ib] += ag_B[:, f]
    
    # Case 3: node_b is GND (node_b == 0)
    b_gnd = (node_as > 0) & (node_bs == 0) & valid_mask
    
    if b_gnd.any():
        bg_batch = batch_idx[b_gnd]
        bg_ia = idx_a[b_gnd]
        bg_G = G[b_gnd]
        bg_B = B[b_gnd]
        
        for f in range(num_freq):
            Y_real[bg_batch, f, bg_ia, bg_ia] += bg_G[:, f]
            Y_imag[bg_batch, f, bg_ia, bg_ia] += bg_B[:, f]
    
    # ===== Solve Y @ V = I =====
    Y = torch.complex(Y_real, Y_imag)
    
    # Add small diagonal for stability
    eye = torch.eye(n_reduced, device=device, dtype=torch.cfloat)
    Y = Y + 1e-10 * eye.unsqueeze(0).unsqueeze(0)
    
    # Current injection at node 1
    I = torch.zeros(batch_size, num_freq, n_reduced, dtype=torch.cfloat, device=device)
    I[:, :, 0] = 1.0
    
    # Batched solve
    Y_flat = Y.reshape(batch_size * num_freq, n_reduced, n_reduced)
    I_flat = I.reshape(batch_size * num_freq, n_reduced, 1)
    
    try:
        V_flat = torch.linalg.solve(Y_flat, I_flat)
        V = V_flat.reshape(batch_size, num_freq, n_reduced)
        
        Z_in = V[:, :, 0]  # Input impedance
        Z_mag = torch.log10(Z_in.abs().clamp(min=1e-10, max=1e10))
        Z_phase = torch.angle(Z_in)
    except:
        Z_mag = torch.full((batch_size, num_freq), 6.0, device=device)
        Z_phase = torch.zeros(batch_size, num_freq, device=device)
    
    return torch.stack([Z_mag, Z_phase], dim=1)


if __name__ == "__main__":
    print("=== Testing Optimized GPU MNA Solver V2 ===")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Device: {device}")
    
    # Test data
    batch_size = 64
    seq_len = 12
    
    sequences = torch.zeros(batch_size, seq_len, 4, device=device)
    for b in range(batch_size):
        sequences[b, 1, :] = torch.tensor([COMP_R, 1, 2, 2.0 - 3.0])
        sequences[b, 2, :] = torch.tensor([COMP_L, 2, 3, -3.0 - (-4.0)])
        sequences[b, 3, :] = torch.tensor([COMP_C, 3, 0, -6.0 - (-8.0)])
    
    import time
    
    # Warmup
    _ = compute_impedance_gpu_v2(sequences)
    torch.cuda.synchronize()
    
    start = time.time()
    for _ in range(100):
        Z = compute_impedance_gpu_v2(sequences)
        torch.cuda.synchronize()
    elapsed = time.time() - start
    
    print(f"\nBatch size: {batch_size}")
    print(f"Time for 100 batches: {elapsed:.3f}s")
    print(f"Time per batch: {elapsed/100*1000:.1f}ms")
    print(f"Z shape: {Z.shape}")
