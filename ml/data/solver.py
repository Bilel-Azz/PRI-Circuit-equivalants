"""MNA (Modified Nodal Analysis) solver for computing impedance Z(f)."""
import numpy as np

from config import FREQUENCIES, NUM_FREQ, COMP_R, COMP_L, COMP_C
from data.circuit import Circuit


def compute_impedance(circuit: Circuit) -> np.ndarray:
    """
    Compute impedance curve Z(f) using MNA.

    Returns:
        (2, NUM_FREQ) array: [0,:] = log10(|Z|), [1,:] = phase(Z) in radians
    """
    num_nodes = circuit.num_nodes
    omega = 2 * np.pi * FREQUENCIES

    Z_in = np.zeros(NUM_FREQ, dtype=complex)

    for f_idx, w in enumerate(omega):
        n_reduced = num_nodes - 1
        Y = np.zeros((n_reduced, n_reduced), dtype=complex)

        for comp in circuit.components:
            if comp.comp_type == COMP_R:
                y = 1.0 / comp.value
            elif comp.comp_type == COMP_L:
                y = 1.0 / (1j * w * comp.value + 1e-15)
            elif comp.comp_type == COMP_C:
                y = 1j * w * comp.value
            else:
                continue

            i, j = comp.node_a, comp.node_b

            # Stamp into Y matrix (GND=0 is reference, excluded from matrix)
            if i > 0 and j > 0:
                idx_i, idx_j = i - 1, j - 1
                Y[idx_i, idx_i] += y
                Y[idx_j, idx_j] += y
                Y[idx_i, idx_j] -= y
                Y[idx_j, idx_i] -= y
            elif i == 0:
                idx_j = j - 1
                Y[idx_j, idx_j] += y
            else:
                idx_i = i - 1
                Y[idx_i, idx_i] += y

        # Inject 1A at IN (node 1 = index 0 in reduced matrix)
        I = np.zeros(n_reduced, dtype=complex)
        I[0] = 1.0

        try:
            Y_reg = Y + 1e-12 * np.eye(n_reduced)
            V = np.linalg.solve(Y_reg, I)
            Z_in[f_idx] = V[0]
        except np.linalg.LinAlgError:
            Z_in[f_idx] = 1e6

    Z_mag = np.abs(Z_in)
    Z_phase = np.angle(Z_in)
    Z_log_mag = np.log10(Z_mag + 1e-15)

    return np.stack([Z_log_mag, Z_phase], axis=0).astype(np.float32)
