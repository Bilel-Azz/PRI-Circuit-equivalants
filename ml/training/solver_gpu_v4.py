"""
Fully vectorized GPU MNA solver V4 - ZERO Python loops.
Uses einsum and advanced indexing.
"""
import torch
import numpy as np

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import COMP_R, COMP_L, COMP_C, FREQUENCIES, NUM_FREQ

OMEGA_TENSOR = None

def get_omega(device):
    global OMEGA_TENSOR
    if OMEGA_TENSOR is None or OMEGA_TENSOR.device != device:
        OMEGA_TENSOR = torch.tensor(2 * np.pi * FREQUENCIES, dtype=torch.float32, device=device)
    return OMEGA_TENSOR


def compute_impedance_gpu_v4(sequences: torch.Tensor, max_nodes: int = 8) -> torch.Tensor:
    """
    ZERO loops impedance computation.
    
    Key insight: Instead of stamping into a matrix, we can directly compute
    each Y[i,j] element as a sum of admittances from components that connect to (i,j).
    """
    device = sequences.device
    batch_size, seq_len, _ = sequences.shape
    num_freq = NUM_FREQ
    n = max_nodes - 1  # Reduced matrix size (exclude GND)
    
    omega = get_omega(device)  # (F,)
    
    # ===== Parse sequences =====
    types = sequences[:, :, 0].long()  # (B, S)
    na = sequences[:, :, 1].long()     # (B, S)
    nb = sequences[:, :, 2].long()     # (B, S)
    raw_val = sequences[:, :, 3]       # (B, S)
    
    # Compute actual values
    centers = torch.zeros(6, device=device)
    centers[COMP_R] = 3.0
    centers[COMP_L] = -4.0
    centers[COMP_C] = -8.0
    
    vals = torch.pow(10.0, raw_val + centers[types.clamp(0, 5)])  # (B, S)
    
    # Valid mask
    valid = ((types >= COMP_R) & (types <= COMP_C) & 
             (na != nb) & (vals > 0))  # (B, S)
    
    # ===== Compute admittances Y = G + jB =====
    # Expand to (B, S, F)
    vals_f = vals.unsqueeze(-1).expand(-1, -1, num_freq)  # (B, S, F)
    omega_f = omega.view(1, 1, num_freq)  # (1, 1, F)
    
    # R: y = 1/R (real)
    is_R = (types == COMP_R).unsqueeze(-1)  # (B, S, 1)
    G = torch.where(is_R & valid.unsqueeze(-1), 1.0 / vals_f.clamp(min=1e-15), torch.zeros_like(vals_f))
    
    # L: y = -j/(wL)
    is_L = (types == COMP_L).unsqueeze(-1)
    B_L = torch.where(is_L & valid.unsqueeze(-1), -1.0 / (omega_f * vals_f).clamp(min=1e-15), torch.zeros_like(vals_f))
    
    # C: y = jwC
    is_C = (types == COMP_C).unsqueeze(-1)
    B_C = torch.where(is_C & valid.unsqueeze(-1), omega_f * vals_f, torch.zeros_like(vals_f))
    
    B = B_L + B_C  # (B, S, F)
    
    # ===== Build Y matrix using one-hot encoding =====
    # Y[b,f,i,j] = sum over components s of y[b,s,f] * (contribution to Y[i,j])
    
    # Node indices in reduced matrix (GND=0 -> -1, others -> idx-1)
    ia = (na - 1).clamp(min=-1)  # (B, S)
    ib = (nb - 1).clamp(min=-1)
    
    # Create position encodings
    # For each component, create one-hot vectors for its matrix contributions
    
    # Initialize Y matrix
    Y_real = torch.zeros(batch_size, num_freq, n, n, device=device)
    Y_imag = torch.zeros(batch_size, num_freq, n, n, device=device)
    
    # Create index grids
    b_idx = torch.arange(batch_size, device=device).view(-1, 1, 1)  # (B, 1, 1)
    f_idx = torch.arange(num_freq, device=device).view(1, -1, 1)    # (1, F, 1)
    s_idx = torch.arange(seq_len, device=device).view(1, 1, -1)     # (1, 1, S)
    
    # Expand indices for indexing
    ia_exp = ia.unsqueeze(1).expand(-1, num_freq, -1)  # (B, F, S)
    ib_exp = ib.unsqueeze(1).expand(-1, num_freq, -1)
    G_exp = G.transpose(1, 2)  # (B, F, S)
    B_exp = B.transpose(1, 2)
    valid_exp = valid.unsqueeze(1).expand(-1, num_freq, -1)  # (B, F, S)
    
    # ===== Use einsum-style accumulation with one-hot encoding =====
    # Y[b,f,i,j] += sum_s G[b,f,s] * delta(i,ia) * delta(j,ia) for diagonal
    
    # Create one-hot for row/col indices
    # This is the key trick: multiply admittances by one-hot position indicators
    
    # For efficiency, we'll use index_put_ but expand all freqs at once
    # Flatten (batch, freq) -> (batch * freq)
    BF = batch_size * num_freq
    
    Y_real_flat = Y_real.view(BF, n, n)
    Y_imag_flat = Y_imag.view(BF, n, n)
    
    # Flatten indices
    bf_idx = (torch.arange(batch_size, device=device).view(-1, 1) * num_freq + 
              torch.arange(num_freq, device=device).view(1, -1))  # (B, F)
    
    # For each component position s, we need to add to Y
    # Use scatter_add by flattening everything
    
    # Create global indices: (B, F, S) -> (B*F*S,)
    B_range = torch.arange(batch_size, device=device)
    F_range = torch.arange(num_freq, device=device)
    S_range = torch.arange(seq_len, device=device)
    
    # Mesh grid
    b_grid, f_grid, s_grid = torch.meshgrid(B_range, F_range, S_range, indexing='ij')
    b_flat = b_grid.flatten()  # (B*F*S,)
    f_flat = f_grid.flatten()
    s_flat = s_grid.flatten()
    
    # Get values at each (b, f, s) position
    G_flat = G_exp[b_grid, f_grid, s_grid].flatten()  # (B*F*S,)
    B_flat_vals = B_exp[b_grid, f_grid, s_grid].flatten()
    valid_flat = valid_exp[b_grid, f_grid, s_grid].flatten()
    
    # Get node indices
    ia_flat = ia_exp[b_grid, f_grid, s_grid].flatten()  # (B*F*S,)
    ib_flat = ib_exp[b_grid, f_grid, s_grid].flatten()
    
    # Compute batch*freq index
    bf_flat = b_flat * num_freq + f_flat  # (B*F*S,)
    
    # ===== Case 1: Both nodes valid (not GND) =====
    both = (ia_flat >= 0) & (ib_flat >= 0) & valid_flat
    
    if both.any():
        idx_bf = bf_flat[both]
        idx_ia = ia_flat[both]
        idx_ib = ib_flat[both]
        g_val = G_flat[both]
        b_val = B_flat_vals[both]
        
        # Y[ia,ia] += y
        Y_real_flat[idx_bf, idx_ia, idx_ia] += g_val
        Y_imag_flat[idx_bf, idx_ia, idx_ia] += b_val
        # Y[ib,ib] += y
        Y_real_flat[idx_bf, idx_ib, idx_ib] += g_val
        Y_imag_flat[idx_bf, idx_ib, idx_ib] += b_val
        # Y[ia,ib] -= y
        Y_real_flat[idx_bf, idx_ia, idx_ib] -= g_val
        Y_imag_flat[idx_bf, idx_ia, idx_ib] -= b_val
        # Y[ib,ia] -= y
        Y_real_flat[idx_bf, idx_ib, idx_ia] -= g_val
        Y_imag_flat[idx_bf, idx_ib, idx_ia] -= b_val
    
    # ===== Case 2: node_a is GND =====
    a_gnd = (ia_flat < 0) & (ib_flat >= 0) & valid_flat
    if a_gnd.any():
        idx_bf = bf_flat[a_gnd]
        idx_ib = ib_flat[a_gnd]
        g_val = G_flat[a_gnd]
        b_val = B_flat_vals[a_gnd]
        Y_real_flat[idx_bf, idx_ib, idx_ib] += g_val
        Y_imag_flat[idx_bf, idx_ib, idx_ib] += b_val
    
    # ===== Case 3: node_b is GND =====
    b_gnd = (ia_flat >= 0) & (ib_flat < 0) & valid_flat
    if b_gnd.any():
        idx_bf = bf_flat[b_gnd]
        idx_ia = ia_flat[b_gnd]
        g_val = G_flat[b_gnd]
        b_val = B_flat_vals[b_gnd]
        Y_real_flat[idx_bf, idx_ia, idx_ia] += g_val
        Y_imag_flat[idx_bf, idx_ia, idx_ia] += b_val
    
    # Reshape back
    Y_real = Y_real_flat.view(batch_size, num_freq, n, n)
    Y_imag = Y_imag_flat.view(batch_size, num_freq, n, n)
    
    # Build complex Y + regularization
    Y = torch.complex(Y_real, Y_imag)
    eye = torch.eye(n, device=device, dtype=torch.cfloat)
    Y = Y + 1e-10 * eye
    
    # ===== Solve =====
    I = torch.zeros(batch_size, num_freq, n, dtype=torch.cfloat, device=device)
    I[:, :, 0] = 1.0
    
    Y_solve = Y.reshape(batch_size * num_freq, n, n)
    I_solve = I.reshape(batch_size * num_freq, n, 1)
    
    try:
        V = torch.linalg.solve(Y_solve, I_solve).reshape(batch_size, num_freq, n)
        Z_in = V[:, :, 0]
        Z_mag = torch.log10(Z_in.abs().clamp(min=1e-10, max=1e10))
        Z_phase = torch.angle(Z_in)
    except:
        Z_mag = torch.full((batch_size, num_freq), 6.0, device=device)
        Z_phase = torch.zeros(batch_size, num_freq, device=device)
    
    return torch.stack([Z_mag, Z_phase], dim=1)


if __name__ == "__main__":
    print("=== Testing GPU Solver V4 (Zero Loops) ===")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Device: {device}")
    
    batch_size = 64
    seq_len = 12
    
    # Create test data
    sequences = torch.zeros(batch_size, seq_len, 4, device=device)
    for b in range(batch_size):
        sequences[b, 1, :] = torch.tensor([COMP_R, 1, 2, 2.0 - 3.0])
        sequences[b, 2, :] = torch.tensor([COMP_L, 2, 3, -3.0 - (-4.0)])
        sequences[b, 3, :] = torch.tensor([COMP_C, 3, 0, -6.0 - (-8.0)])
    
    import time
    
    # Warmup
    _ = compute_impedance_gpu_v4(sequences)
    if device.type == 'cuda':
        torch.cuda.synchronize()
    
    start = time.time()
    n_iter = 100
    for _ in range(n_iter):
        Z = compute_impedance_gpu_v4(sequences)
        if device.type == 'cuda':
            torch.cuda.synchronize()
    elapsed = time.time() - start
    
    print(f"\nBatch size: {batch_size}")
    print(f"Time for {n_iter} batches: {elapsed:.3f}s")
    print(f"Time per batch: {elapsed/n_iter*1000:.1f}ms")
    print(f"Z shape: {Z.shape}")
    print(f"Z[0,0,:5]: {Z[0,0,:5]}")
