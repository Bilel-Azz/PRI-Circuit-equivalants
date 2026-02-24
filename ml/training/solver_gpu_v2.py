"""Partially vectorized GPU MNA solver - uses scatter operations for Y matrix building."""
import torch
import numpy as np

from config import COMP_R, COMP_L, COMP_C, FREQUENCIES, NUM_FREQ

OMEGA_TENSOR = None
FREQUENCIES_TENSOR = None

def get_omega(device):
    global OMEGA_TENSOR
    if OMEGA_TENSOR is None or OMEGA_TENSOR.device != device:
        OMEGA_TENSOR = torch.tensor(2 * np.pi * FREQUENCIES, dtype=torch.float32, device=device)
    return OMEGA_TENSOR


def compute_impedance_gpu_v2(sequences: torch.Tensor, max_nodes: int = 8) -> torch.Tensor:
    """
    Partially vectorized: admittances computed without loops,
    but Y matrix stamping still uses per-frequency loop.
    Returns: (batch, 2, num_freq) tensor of [log_mag, phase]
    """
    device = sequences.device
    dtype = sequences.dtype
    batch_size, seq_len, _ = sequences.shape
    num_freq = NUM_FREQ
    n_reduced = max_nodes - 1

    omega = get_omega(device)

    comp_types = sequences[:, :, 0].long()
    node_as = sequences[:, :, 1].long()
    node_bs = sequences[:, :, 2].long()
    raw_values = sequences[:, :, 3]

    # Vectorized value computation with center offset
    value_centers = torch.zeros(6, device=device)
    value_centers[COMP_R] = 3.0
    value_centers[COMP_L] = -4.0
    value_centers[COMP_C] = -8.0

    centers = value_centers[comp_types.clamp(0, 5)]
    values = torch.pow(10.0, raw_values + centers)

    valid_mask = ((comp_types >= COMP_R) & (comp_types <= COMP_C) &
                  (node_as != node_bs) & (values > 0))

    values = values * valid_mask.float()

    # Compute admittances Y = G + jB for all components/freqs
    is_R = (comp_types == COMP_R) & valid_mask
    G_R = torch.where(is_R.unsqueeze(-1),
                      (1.0 / values.clamp(min=1e-15)).unsqueeze(-1).expand(-1, -1, num_freq),
                      torch.zeros(batch_size, seq_len, num_freq, device=device))
    B_R = torch.zeros_like(G_R)

    is_L = (comp_types == COMP_L) & valid_mask
    wL = omega.unsqueeze(0).unsqueeze(0) * values.unsqueeze(-1)
    G_L = torch.zeros(batch_size, seq_len, num_freq, device=device)
    B_L = torch.where(is_L.unsqueeze(-1),
                      -1.0 / wL.clamp(min=1e-15),
                      torch.zeros_like(G_L))

    is_C = (comp_types == COMP_C) & valid_mask
    wC = omega.unsqueeze(0).unsqueeze(0) * values.unsqueeze(-1)
    G_C = torch.zeros(batch_size, seq_len, num_freq, device=device)
    B_C = torch.where(is_C.unsqueeze(-1), wC, torch.zeros_like(G_C))

    G = G_R + G_L + G_C
    B = B_R + B_L + B_C

    # Build Y matrices
    Y_real = torch.zeros(batch_size, num_freq, n_reduced, n_reduced, device=device)
    Y_imag = torch.zeros(batch_size, num_freq, n_reduced, n_reduced, device=device)

    idx_a = (node_as - 1).clamp(min=-1)
    idx_b = (node_bs - 1).clamp(min=-1)

    batch_idx = torch.arange(batch_size, device=device).unsqueeze(1).expand(-1, seq_len)

    # Both nodes > 0
    both_valid = (node_as > 0) & (node_bs > 0) & valid_mask

    if both_valid.any():
        bv_batch = batch_idx[both_valid]
        bv_ia = idx_a[both_valid]
        bv_ib = idx_b[both_valid]
        bv_G = G[both_valid]
        bv_B = B[both_valid]

        for f in range(num_freq):
            Y_real[bv_batch, f, bv_ia, bv_ia] += bv_G[:, f]
            Y_imag[bv_batch, f, bv_ia, bv_ia] += bv_B[:, f]
            Y_real[bv_batch, f, bv_ib, bv_ib] += bv_G[:, f]
            Y_imag[bv_batch, f, bv_ib, bv_ib] += bv_B[:, f]
            Y_real[bv_batch, f, bv_ia, bv_ib] -= bv_G[:, f]
            Y_imag[bv_batch, f, bv_ia, bv_ib] -= bv_B[:, f]
            Y_real[bv_batch, f, bv_ib, bv_ia] -= bv_G[:, f]
            Y_imag[bv_batch, f, bv_ib, bv_ia] -= bv_B[:, f]

    # node_a is GND
    a_gnd = (node_as == 0) & (node_bs > 0) & valid_mask

    if a_gnd.any():
        ag_batch = batch_idx[a_gnd]
        ag_ib = idx_b[a_gnd]
        ag_G = G[a_gnd]
        ag_B = B[a_gnd]

        for f in range(num_freq):
            Y_real[ag_batch, f, ag_ib, ag_ib] += ag_G[:, f]
            Y_imag[ag_batch, f, ag_ib, ag_ib] += ag_B[:, f]

    # node_b is GND
    b_gnd = (node_as > 0) & (node_bs == 0) & valid_mask

    if b_gnd.any():
        bg_batch = batch_idx[b_gnd]
        bg_ia = idx_a[b_gnd]
        bg_G = G[b_gnd]
        bg_B = B[b_gnd]

        for f in range(num_freq):
            Y_real[bg_batch, f, bg_ia, bg_ia] += bg_G[:, f]
            Y_imag[bg_batch, f, bg_ia, bg_ia] += bg_B[:, f]

    # Solve Y @ V = I
    Y = torch.complex(Y_real, Y_imag)

    eye = torch.eye(n_reduced, device=device, dtype=torch.cfloat)
    Y = Y + 1e-10 * eye.unsqueeze(0).unsqueeze(0)

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
