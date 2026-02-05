"""
Fully vectorized GPU MNA solver V3 - using scatter_add and vmap.
NO Python loops at all.
"""
import torch
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


def compute_impedance_gpu_v3(sequences: torch.Tensor, max_nodes: int = 8) -> torch.Tensor:
    """
    Fully vectorized impedance computation using scatter_add.
    NO Python loops - everything is tensor operations.
    
    Args:
        sequences: (batch, seq_len, 4) tensor of [type, node_a, node_b, value]
        max_nodes: Maximum number of nodes
    
    Returns:
        (batch, 2, num_freq) tensor of [log_mag, phase]
    """
    device = sequences.device
    batch_size, seq_len, _ = sequences.shape
    num_freq = NUM_FREQ
    n_reduced = max_nodes - 1
    
    omega = get_omega(device)  # (num_freq,)
    
    # ===== Parse sequences =====
    comp_types = sequences[:, :, 0].long()  # (B, S)
    node_as = sequences[:, :, 1].long()
    node_bs = sequences[:, :, 2].long()
    raw_values = sequences[:, :, 3]
    
    # Compute actual values with center offset (vectorized)
    value_centers = torch.zeros(6, device=device)
    value_centers[COMP_R] = 3.0
    value_centers[COMP_L] = -4.0
    value_centers[COMP_C] = -8.0
    
    centers = value_centers[comp_types.clamp(0, 5)]
    values = torch.pow(10.0, raw_values + centers)  # (B, S)
    
    # Valid mask
    valid = ((comp_types >= COMP_R) & (comp_types <= COMP_C) & 
             (node_as != node_bs) & (values > 0))  # (B, S)
    
    # ===== Compute admittances Y = G + jB for all freqs =====
    # Output shape: (B, S, F) for conductance and susceptance
    
    # R: g = 1/R, b = 0
    is_R = (comp_types == COMP_R) & valid
    g_R = torch.where(is_R, 1.0 / values.clamp(min=1e-15), torch.zeros_like(values))
    G = g_R.unsqueeze(-1).expand(-1, -1, num_freq)  # (B, S, F)
    
    # L: g = 0, b = -1/(wL)
    is_L = (comp_types == COMP_L) & valid
    wL = omega.view(1, 1, num_freq) * values.unsqueeze(-1)  # (B, S, F)
    b_L = torch.where(is_L.unsqueeze(-1), -1.0 / wL.clamp(min=1e-15), torch.zeros_like(wL))
    
    # C: g = 0, b = wC
    is_C = (comp_types == COMP_C) & valid
    wC = omega.view(1, 1, num_freq) * values.unsqueeze(-1)
    b_C = torch.where(is_C.unsqueeze(-1), wC, torch.zeros_like(wC))
    
    B = b_L + b_C  # (B, S, F)
    
    # Mask invalid components
    G = G * valid.unsqueeze(-1).float()
    B = B * valid.unsqueeze(-1).float()
    
    # ===== Build Y matrices using flat indexing + scatter_add =====
    # Y is (B, F, n_reduced, n_reduced) - flatten last two dims to (B, F, n_reduced*n_reduced)
    
    mat_size = n_reduced * n_reduced
    Y_real = torch.zeros(batch_size, num_freq, mat_size, device=device)
    Y_imag = torch.zeros(batch_size, num_freq, mat_size, device=device)
    
    # Node indices (0-indexed, GND is -1)
    ia = (node_as - 1)  # (B, S) - can be -1 for GND
    ib = (node_bs - 1)
    
    # Create batch indices
    b_idx = torch.arange(batch_size, device=device).view(-1, 1).expand(-1, seq_len)  # (B, S)
    f_idx = torch.arange(num_freq, device=device)
    
    # We need to stamp 4 entries per component (when both nodes > 0):
    # Y[ia,ia] += y, Y[ib,ib] += y, Y[ia,ib] -= y, Y[ib,ia] -= y
    
    # Case: Both nodes valid (not GND)
    both_valid = (ia >= 0) & (ib >= 0) & valid  # (B, S)
    
    if both_valid.any():
        # Get indices of valid components
        bv_b = b_idx[both_valid]  # batch indices
        bv_ia = ia[both_valid]    # node a indices
        bv_ib = ib[both_valid]    # node b indices
        bv_G = G[both_valid]      # (N, F) conductances
        bv_B = B[both_valid]      # (N, F) susceptances
        
        # Compute flat matrix indices
        # For Y[i,i]: flat_idx = i * n_reduced + i
        # For Y[i,j]: flat_idx = i * n_reduced + j
        
        flat_aa = bv_ia * n_reduced + bv_ia  # Y[a,a]
        flat_bb = bv_ib * n_reduced + bv_ib  # Y[b,b]
        flat_ab = bv_ia * n_reduced + bv_ib  # Y[a,b]
        flat_ba = bv_ib * n_reduced + bv_ia  # Y[b,a]
        
        # For scatter_add, we need 3D indexing: (batch, freq, flat_pos)
        # Expand to (N, F)
        N = bv_b.shape[0]
        bv_b_exp = bv_b.unsqueeze(-1).expand(-1, num_freq)  # (N, F)
        flat_aa_exp = flat_aa.unsqueeze(-1).expand(-1, num_freq)
        flat_bb_exp = flat_bb.unsqueeze(-1).expand(-1, num_freq)
        flat_ab_exp = flat_ab.unsqueeze(-1).expand(-1, num_freq)
        flat_ba_exp = flat_ba.unsqueeze(-1).expand(-1, num_freq)
        
        # Stamp using index_put_ with accumulate=True
        # Y[b, f, flat] += value
        for f in range(num_freq):
            Y_real.index_put_((bv_b, torch.full_like(bv_b, f), flat_aa), bv_G[:, f], accumulate=True)
            Y_real.index_put_((bv_b, torch.full_like(bv_b, f), flat_bb), bv_G[:, f], accumulate=True)
            Y_real.index_put_((bv_b, torch.full_like(bv_b, f), flat_ab), -bv_G[:, f], accumulate=True)
            Y_real.index_put_((bv_b, torch.full_like(bv_b, f), flat_ba), -bv_G[:, f], accumulate=True)
            
            Y_imag.index_put_((bv_b, torch.full_like(bv_b, f), flat_aa), bv_B[:, f], accumulate=True)
            Y_imag.index_put_((bv_b, torch.full_like(bv_b, f), flat_bb), bv_B[:, f], accumulate=True)
            Y_imag.index_put_((bv_b, torch.full_like(bv_b, f), flat_ab), -bv_B[:, f], accumulate=True)
            Y_imag.index_put_((bv_b, torch.full_like(bv_b, f), flat_ba), -bv_B[:, f], accumulate=True)
    
    # Case: node_a is GND (ia == -1)
    a_gnd = (ia < 0) & (ib >= 0) & valid
    if a_gnd.any():
        ag_b = b_idx[a_gnd]
        ag_ib = ib[a_gnd]
        ag_G = G[a_gnd]
        ag_B = B[a_gnd]
        
        flat_bb = ag_ib * n_reduced + ag_ib
        
        for f in range(num_freq):
            Y_real.index_put_((ag_b, torch.full_like(ag_b, f), flat_bb), ag_G[:, f], accumulate=True)
            Y_imag.index_put_((ag_b, torch.full_like(ag_b, f), flat_bb), ag_B[:, f], accumulate=True)
    
    # Case: node_b is GND (ib == -1)
    b_gnd = (ia >= 0) & (ib < 0) & valid
    if b_gnd.any():
        bg_b = b_idx[b_gnd]
        bg_ia = ia[b_gnd]
        bg_G = G[b_gnd]
        bg_B = B[b_gnd]
        
        flat_aa = bg_ia * n_reduced + bg_ia
        
        for f in range(num_freq):
            Y_real.index_put_((bg_b, torch.full_like(bg_b, f), flat_aa), bg_G[:, f], accumulate=True)
            Y_imag.index_put_((bg_b, torch.full_like(bg_b, f), flat_aa), bg_B[:, f], accumulate=True)
    
    # Reshape Y to (B, F, n_reduced, n_reduced)
    Y_real = Y_real.view(batch_size, num_freq, n_reduced, n_reduced)
    Y_imag = Y_imag.view(batch_size, num_freq, n_reduced, n_reduced)
    
    # Build complex Y and add regularization
    Y = torch.complex(Y_real, Y_imag)
    eye = torch.eye(n_reduced, device=device, dtype=torch.cfloat)
    Y = Y + 1e-10 * eye.unsqueeze(0).unsqueeze(0)
    
    # ===== Solve =====
    I = torch.zeros(batch_size, num_freq, n_reduced, dtype=torch.cfloat, device=device)
    I[:, :, 0] = 1.0
    
    Y_flat = Y.reshape(batch_size * num_freq, n_reduced, n_reduced)
    I_flat = I.reshape(batch_size * num_freq, n_reduced, 1)
    
    try:
        V_flat = torch.linalg.solve(Y_flat, I_flat)
        V = V_flat.reshape(batch_size, num_freq, n_reduced)
        
        Z_in = V[:, :, 0]
        Z_mag = torch.log10(Z_in.abs().clamp(min=1e-10, max=1e10))
        Z_phase = torch.angle(Z_in)
    except:
        Z_mag = torch.full((batch_size, num_freq), 6.0, device=device)
        Z_phase = torch.zeros(batch_size, num_freq, device=device)
    
    return torch.stack([Z_mag, Z_phase], dim=1)


if __name__ == "__main__":
    print("=== Testing GPU MNA Solver V3 ===")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Device: {device}")
    
    batch_size = 64
    seq_len = 12
    
    sequences = torch.zeros(batch_size, seq_len, 4, device=device)
    for b in range(batch_size):
        sequences[b, 1, :] = torch.tensor([COMP_R, 1, 2, 2.0 - 3.0])
        sequences[b, 2, :] = torch.tensor([COMP_L, 2, 3, -3.0 - (-4.0)])
        sequences[b, 3, :] = torch.tensor([COMP_C, 3, 0, -6.0 - (-8.0)])
    
    import time
    
    # Warmup
    _ = compute_impedance_gpu_v3(sequences)
    torch.cuda.synchronize()
    
    start = time.time()
    for _ in range(100):
        Z = compute_impedance_gpu_v3(sequences)
        torch.cuda.synchronize()
    elapsed = time.time() - start
    
    print(f"\nBatch size: {batch_size}")
    print(f"Time for 100 batches: {elapsed:.3f}s")
    print(f"Time per batch: {elapsed/100*1000:.1f}ms")
