"""GPU MNA solver V4 - ZERO Python loops. Uses meshgrid + advanced indexing."""
import torch
import numpy as np

from config import COMP_R, COMP_L, COMP_C, FREQUENCIES, NUM_FREQ

OMEGA_TENSOR = None

def get_omega(device):
    global OMEGA_TENSOR
    if OMEGA_TENSOR is None or OMEGA_TENSOR.device != device:
        OMEGA_TENSOR = torch.tensor(2 * np.pi * FREQUENCIES, dtype=torch.float32, device=device)
    return OMEGA_TENSOR


def compute_impedance_gpu_v4(sequences: torch.Tensor, max_nodes: int = 8) -> torch.Tensor:
    """
    Zero-loop impedance computation via meshgrid over (batch, freq, seq).
    Each Y[i,j] is computed as a sum of admittances from connecting components.
    Returns: (batch, 2, num_freq) tensor of [log_mag, phase]
    """
    device = sequences.device
    batch_size, seq_len, _ = sequences.shape
    num_freq = NUM_FREQ
    n = max_nodes - 1

    omega = get_omega(device)

    types = sequences[:, :, 0].long()
    na = sequences[:, :, 1].long()
    nb = sequences[:, :, 2].long()
    raw_val = sequences[:, :, 3]

    centers = torch.zeros(6, device=device)
    centers[COMP_R] = 3.0
    centers[COMP_L] = -4.0
    centers[COMP_C] = -8.0

    vals = torch.pow(10.0, raw_val + centers[types.clamp(0, 5)])

    valid = ((types >= COMP_R) & (types <= COMP_C) &
             (na != nb) & (vals > 0))

    # Compute admittances
    vals_f = vals.unsqueeze(-1).expand(-1, -1, num_freq)
    omega_f = omega.view(1, 1, num_freq)

    is_R = (types == COMP_R).unsqueeze(-1)
    G = torch.where(is_R & valid.unsqueeze(-1), 1.0 / vals_f.clamp(min=1e-15), torch.zeros_like(vals_f))

    is_L = (types == COMP_L).unsqueeze(-1)
    B_L = torch.where(is_L & valid.unsqueeze(-1), -1.0 / (omega_f * vals_f).clamp(min=1e-15), torch.zeros_like(vals_f))

    is_C = (types == COMP_C).unsqueeze(-1)
    B_C = torch.where(is_C & valid.unsqueeze(-1), omega_f * vals_f, torch.zeros_like(vals_f))

    B = B_L + B_C

    # Build Y matrix via meshgrid + advanced indexing
    ia = (na - 1).clamp(min=-1)
    ib = (nb - 1).clamp(min=-1)

    Y_real = torch.zeros(batch_size, num_freq, n, n, device=device)
    Y_imag = torch.zeros(batch_size, num_freq, n, n, device=device)

    ia_exp = ia.unsqueeze(1).expand(-1, num_freq, -1)
    ib_exp = ib.unsqueeze(1).expand(-1, num_freq, -1)
    G_exp = G.transpose(1, 2)
    B_exp = B.transpose(1, 2)
    valid_exp = valid.unsqueeze(1).expand(-1, num_freq, -1)

    BF = batch_size * num_freq

    Y_real_flat = Y_real.view(BF, n, n)
    Y_imag_flat = Y_imag.view(BF, n, n)

    B_range = torch.arange(batch_size, device=device)
    F_range = torch.arange(num_freq, device=device)
    S_range = torch.arange(seq_len, device=device)

    b_grid, f_grid, s_grid = torch.meshgrid(B_range, F_range, S_range, indexing='ij')
    b_flat = b_grid.flatten()
    f_flat = f_grid.flatten()

    G_flat = G_exp[b_grid, f_grid, s_grid].flatten()
    B_flat_vals = B_exp[b_grid, f_grid, s_grid].flatten()
    valid_flat = valid_exp[b_grid, f_grid, s_grid].flatten()

    ia_flat = ia_exp[b_grid, f_grid, s_grid].flatten()
    ib_flat = ib_exp[b_grid, f_grid, s_grid].flatten()

    bf_flat = b_flat * num_freq + f_flat

    # Both nodes valid (not GND)
    both = (ia_flat >= 0) & (ib_flat >= 0) & valid_flat

    if both.any():
        idx_bf = bf_flat[both]
        idx_ia = ia_flat[both]
        idx_ib = ib_flat[both]
        g_val = G_flat[both]
        b_val = B_flat_vals[both]

        Y_real_flat[idx_bf, idx_ia, idx_ia] += g_val
        Y_imag_flat[idx_bf, idx_ia, idx_ia] += b_val
        Y_real_flat[idx_bf, idx_ib, idx_ib] += g_val
        Y_imag_flat[idx_bf, idx_ib, idx_ib] += b_val
        Y_real_flat[idx_bf, idx_ia, idx_ib] -= g_val
        Y_imag_flat[idx_bf, idx_ia, idx_ib] -= b_val
        Y_real_flat[idx_bf, idx_ib, idx_ia] -= g_val
        Y_imag_flat[idx_bf, idx_ib, idx_ia] -= b_val

    # node_a is GND
    a_gnd = (ia_flat < 0) & (ib_flat >= 0) & valid_flat
    if a_gnd.any():
        idx_bf = bf_flat[a_gnd]
        idx_ib = ib_flat[a_gnd]
        g_val = G_flat[a_gnd]
        b_val = B_flat_vals[a_gnd]
        Y_real_flat[idx_bf, idx_ib, idx_ib] += g_val
        Y_imag_flat[idx_bf, idx_ib, idx_ib] += b_val

    # node_b is GND
    b_gnd = (ia_flat >= 0) & (ib_flat < 0) & valid_flat
    if b_gnd.any():
        idx_bf = bf_flat[b_gnd]
        idx_ia = ia_flat[b_gnd]
        g_val = G_flat[b_gnd]
        b_val = B_flat_vals[b_gnd]
        Y_real_flat[idx_bf, idx_ia, idx_ia] += g_val
        Y_imag_flat[idx_bf, idx_ia, idx_ia] += b_val

    Y_real = Y_real_flat.view(batch_size, num_freq, n, n)
    Y_imag = Y_imag_flat.view(batch_size, num_freq, n, n)

    Y = torch.complex(Y_real, Y_imag)
    eye = torch.eye(n, device=device, dtype=torch.cfloat)
    Y = Y + 1e-10 * eye

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
