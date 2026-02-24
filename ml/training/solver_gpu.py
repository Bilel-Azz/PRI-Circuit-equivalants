"""GPU-accelerated MNA solver using PyTorch batched operations."""
import torch
import numpy as np

from config import COMP_R, COMP_L, COMP_C, FREQUENCIES, NUM_FREQ

OMEGA_TENSOR = None

def get_omega(device):
    global OMEGA_TENSOR
    if OMEGA_TENSOR is None or OMEGA_TENSOR.device != device:
        OMEGA_TENSOR = torch.tensor(2 * np.pi * FREQUENCIES, dtype=torch.float32, device=device)
    return OMEGA_TENSOR


def sequences_to_components_batch(sequences, value_center={1: 3.0, 2: -4.0, 3: -8.0}):
    """Convert batch of sequences to component info tensors."""
    batch_size, seq_len, _ = sequences.shape

    comp_types = sequences[:, :, 0].long()
    node_as = sequences[:, :, 1].long()
    node_bs = sequences[:, :, 2].long()
    raw_values = sequences[:, :, 3]

    values = torch.zeros_like(raw_values)
    for t, center in value_center.items():
        mask = (comp_types == t)
        values[mask] = 10 ** (raw_values[mask] + center)

    valid_mask = ((comp_types >= COMP_R) & (comp_types <= COMP_C) & (node_as != node_bs))

    return comp_types, node_as, node_bs, values, valid_mask


def compute_impedance_gpu(sequences: torch.Tensor, max_nodes: int = 8) -> torch.Tensor:
    """
    Compute impedance for a batch of circuit sequences on GPU.
    Returns: (batch, 2, num_freq) tensor of [log_mag, phase]
    """
    device = sequences.device
    batch_size, seq_len, _ = sequences.shape
    num_freq = NUM_FREQ
    n_reduced = max_nodes - 1

    omega = get_omega(device)

    comp_types, node_as, node_bs, values, valid_mask = sequences_to_components_batch(sequences)

    Z_mag = torch.zeros(batch_size, num_freq, device=device)
    Z_phase = torch.zeros(batch_size, num_freq, device=device)

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

            if ctype == COMP_R:
                g = 1.0 / val
                g_vec = torch.full((num_freq,), g, device=device)
                b_vec = torch.zeros(num_freq, device=device)
            elif ctype == COMP_L:
                g_vec = torch.zeros(num_freq, device=device)
                b_vec = -1.0 / (omega * val + 1e-15)
            elif ctype == COMP_C:
                g_vec = torch.zeros(num_freq, device=device)
                b_vec = omega * val
            else:
                continue

            # MNA stamp: Y[i,i]+=y, Y[j,j]+=y, Y[i,j]-=y, Y[j,i]-=y
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
            elif na == 0:
                idx_b = nb - 1
                Y_real[b, :, idx_b, idx_b] += g_vec
                Y_imag[b, :, idx_b, idx_b] += b_vec
            else:
                idx_a = na - 1
                Y_real[b, :, idx_a, idx_a] += g_vec
                Y_imag[b, :, idx_a, idx_a] += b_vec

    Y = torch.complex(Y_real, Y_imag)

    I = torch.zeros(batch_size, num_freq, n_reduced, dtype=torch.cfloat, device=device)
    I[:, :, 0] = 1.0

    Y_flat = Y.reshape(batch_size * num_freq, n_reduced, n_reduced)
    I_flat = I.reshape(batch_size * num_freq, n_reduced, 1)

    Y_flat = Y_flat + 1e-10 * torch.eye(n_reduced, device=device, dtype=torch.cfloat)

    try:
        V_flat = torch.linalg.solve(Y_flat, I_flat)
        V = V_flat.reshape(batch_size, num_freq, n_reduced)

        Z_in = V[:, :, 0]
        Z_in = torch.clamp(Z_in.abs(), min=1e-6, max=1e10)

        Z_mag = torch.log10(Z_in)
        Z_phase = torch.angle(V[:, :, 0])

    except Exception:
        Z_mag = torch.full((batch_size, num_freq), 6.0, device=device)
        Z_phase = torch.zeros(batch_size, num_freq, device=device)

    return torch.stack([Z_mag, Z_phase], dim=1)
