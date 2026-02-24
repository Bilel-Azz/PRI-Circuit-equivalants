"""GPU MNA solver V3 - uses scatter_add and index_put_ for Y matrix stamping."""
import torch
import numpy as np

from config import COMP_R, COMP_L, COMP_C, FREQUENCIES, NUM_FREQ

OMEGA_TENSOR = None

def get_omega(device):
    global OMEGA_TENSOR
    if OMEGA_TENSOR is None or OMEGA_TENSOR.device != device:
        OMEGA_TENSOR = torch.tensor(2 * np.pi * FREQUENCIES, dtype=torch.float32, device=device)
    return OMEGA_TENSOR


def compute_impedance_gpu_v3(sequences: torch.Tensor, max_nodes: int = 8) -> torch.Tensor:
    """
    Uses index_put_ with accumulate for Y stamping.
    Still has per-frequency loop for stamping, but admittances are vectorized.
    Returns: (batch, 2, num_freq) tensor of [log_mag, phase]
    """
    device = sequences.device
    batch_size, seq_len, _ = sequences.shape
    num_freq = NUM_FREQ
    n_reduced = max_nodes - 1

    omega = get_omega(device)

    comp_types = sequences[:, :, 0].long()
    node_as = sequences[:, :, 1].long()
    node_bs = sequences[:, :, 2].long()
    raw_values = sequences[:, :, 3]

    value_centers = torch.zeros(6, device=device)
    value_centers[COMP_R] = 3.0
    value_centers[COMP_L] = -4.0
    value_centers[COMP_C] = -8.0

    centers = value_centers[comp_types.clamp(0, 5)]
    values = torch.pow(10.0, raw_values + centers)

    valid = ((comp_types >= COMP_R) & (comp_types <= COMP_C) &
             (node_as != node_bs) & (values > 0))

    # Vectorized admittance computation
    is_R = (comp_types == COMP_R) & valid
    g_R = torch.where(is_R, 1.0 / values.clamp(min=1e-15), torch.zeros_like(values))
    G = g_R.unsqueeze(-1).expand(-1, -1, num_freq)

    is_L = (comp_types == COMP_L) & valid
    wL = omega.view(1, 1, num_freq) * values.unsqueeze(-1)
    b_L = torch.where(is_L.unsqueeze(-1), -1.0 / wL.clamp(min=1e-15), torch.zeros_like(wL))

    is_C = (comp_types == COMP_C) & valid
    wC = omega.view(1, 1, num_freq) * values.unsqueeze(-1)
    b_C = torch.where(is_C.unsqueeze(-1), wC, torch.zeros_like(wC))

    B = b_L + b_C

    G = G * valid.unsqueeze(-1).float()
    B = B * valid.unsqueeze(-1).float()

    # Build Y matrices using flat indexing + index_put_
    mat_size = n_reduced * n_reduced
    Y_real = torch.zeros(batch_size, num_freq, mat_size, device=device)
    Y_imag = torch.zeros(batch_size, num_freq, mat_size, device=device)

    ia = (node_as - 1)
    ib = (node_bs - 1)

    b_idx = torch.arange(batch_size, device=device).view(-1, 1).expand(-1, seq_len)

    # Both nodes valid (not GND)
    both_valid = (ia >= 0) & (ib >= 0) & valid

    if both_valid.any():
        bv_b = b_idx[both_valid]
        bv_ia = ia[both_valid]
        bv_ib = ib[both_valid]
        bv_G = G[both_valid]
        bv_B = B[both_valid]

        flat_aa = bv_ia * n_reduced + bv_ia
        flat_bb = bv_ib * n_reduced + bv_ib
        flat_ab = bv_ia * n_reduced + bv_ib
        flat_ba = bv_ib * n_reduced + bv_ia

        for f in range(num_freq):
            Y_real.index_put_((bv_b, torch.full_like(bv_b, f), flat_aa), bv_G[:, f], accumulate=True)
            Y_real.index_put_((bv_b, torch.full_like(bv_b, f), flat_bb), bv_G[:, f], accumulate=True)
            Y_real.index_put_((bv_b, torch.full_like(bv_b, f), flat_ab), -bv_G[:, f], accumulate=True)
            Y_real.index_put_((bv_b, torch.full_like(bv_b, f), flat_ba), -bv_G[:, f], accumulate=True)

            Y_imag.index_put_((bv_b, torch.full_like(bv_b, f), flat_aa), bv_B[:, f], accumulate=True)
            Y_imag.index_put_((bv_b, torch.full_like(bv_b, f), flat_bb), bv_B[:, f], accumulate=True)
            Y_imag.index_put_((bv_b, torch.full_like(bv_b, f), flat_ab), -bv_B[:, f], accumulate=True)
            Y_imag.index_put_((bv_b, torch.full_like(bv_b, f), flat_ba), -bv_B[:, f], accumulate=True)

    # node_a is GND
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

    # node_b is GND
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

    Y_real = Y_real.view(batch_size, num_freq, n_reduced, n_reduced)
    Y_imag = Y_imag.view(batch_size, num_freq, n_reduced, n_reduced)

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
