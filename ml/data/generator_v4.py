"""
Generator V4: Double résonances plus marquées
- Fréquences bien espacées mais Q modéré
- Courbes avec variations CLAIRES
"""
import numpy as np
from data.circuit import Circuit, Component, COMP_R, COMP_L, COMP_C


def resonant_LC(freq, q_factor=10):
    omega = 2 * np.pi * freq
    L = q_factor / omega
    C = 1 / (omega * omega * L)
    return L, C


# Double résonances bien marquées

def gen_double_res_clear():
    """Fréquences espacées de ~2 décades, Q modéré pour pics larges."""
    R = 10 ** np.random.uniform(0.5, 1.5)
    f1 = 10 ** np.random.uniform(2, 2.5)     # 100Hz - 300Hz
    f2 = 10 ** np.random.uniform(4, 4.5)     # 10kHz - 30kHz
    L1, C1 = resonant_LC(f1, q_factor=5)
    L2, C2 = resonant_LC(f2, q_factor=5)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 4, C1),
        Component(COMP_L, 4, 5, L2),
        Component(COMP_C, 5, 0, C2),
    ], num_nodes=6)


def gen_double_res_asymmetric():
    """Un pic large (Q=3), un étroit (Q=15)."""
    R = 10 ** np.random.uniform(0.5, 1.5)
    f1 = 10 ** np.random.uniform(1.8, 2.5)
    f2 = 10 ** np.random.uniform(4, 5)
    L1, C1 = resonant_LC(f1, q_factor=3)
    L2, C2 = resonant_LC(f2, q_factor=15)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 4, C1),
        Component(COMP_L, 4, 5, L2),
        Component(COMP_C, 5, 0, C2),
    ], num_nodes=6)


def gen_double_tank_clear():
    """Deux tanks (anti-résonances) bien séparés."""
    R = 10 ** np.random.uniform(1, 2)
    f1 = 10 ** np.random.uniform(2, 2.8)
    f2 = 10 ** np.random.uniform(3.8, 4.5)
    L1, C1 = resonant_LC(f1, q_factor=8)
    L2, C2 = resonant_LC(f2, q_factor=8)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 2, 3, C1),
        Component(COMP_L, 3, 0, L2),
        Component(COMP_C, 3, 0, C2),
    ], num_nodes=4)


def gen_resonance_plus_tank():
    """Un creux (série) + une bosse (tank) = forme complexe."""
    R = 10 ** np.random.uniform(0.5, 1.5)
    f1 = 10 ** np.random.uniform(2, 3)
    f2 = 10 ** np.random.uniform(3.5, 4.5)
    L1, C1 = resonant_LC(f1, q_factor=5)
    L2, C2 = resonant_LC(f2, q_factor=10)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 0, C1),
        Component(COMP_L, 3, 4, L2),
        Component(COMP_C, 3, 4, C2),
        Component(COMP_R, 4, 0, R * 5),
    ], num_nodes=5)


def gen_ladder_3_stages():
    R = 10 ** np.random.uniform(1, 2)
    f = 10 ** np.random.uniform(2.5, 4)
    L, C = resonant_LC(f, q_factor=3)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L),
        Component(COMP_C, 3, 0, C),
        Component(COMP_L, 3, 4, L * 0.8),
        Component(COMP_C, 4, 0, C * 1.2),
        Component(COMP_L, 4, 5, L * 0.6),
        Component(COMP_C, 5, 0, C * 1.5),
    ], num_nodes=6)


# Circuits simples (baseline)

def gen_rlc_serie():
    R = 10 ** np.random.uniform(1, 3)
    f0 = 10 ** np.random.uniform(2, 5)
    L, C = resonant_LC(f0, q_factor=10)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L),
        Component(COMP_C, 3, 0, C),
    ], num_nodes=4)


def gen_tank_simple():
    R = 10 ** np.random.uniform(1, 2)
    f0 = 10 ** np.random.uniform(2, 5)
    L, C = resonant_LC(f0, q_factor=10)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 0, L),
        Component(COMP_C, 2, 0, C),
    ], num_nodes=3)


def gen_notch():
    R = 10 ** np.random.uniform(1, 2)
    f0 = 10 ** np.random.uniform(2, 5)
    L, C = resonant_LC(f0, q_factor=15)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L),
        Component(COMP_C, 2, 3, C),
        Component(COMP_R, 3, 0, R),
    ], num_nodes=4)


# Templates V4 - 50% double résonances marquées

TEMPLATES_V4 = [
    # Simples (25%)
    (gen_rlc_serie, 0.10),
    (gen_tank_simple, 0.10),
    (gen_notch, 0.05),

    # Double résonances MARQUÉES (50%)
    (gen_double_res_clear, 0.15),
    (gen_double_res_asymmetric, 0.10),
    (gen_double_tank_clear, 0.10),
    (gen_resonance_plus_tank, 0.10),
    (gen_ladder_3_stages, 0.05),

    # Extra variation (25%)
    (gen_double_res_clear, 0.15),
    (gen_double_tank_clear, 0.10),
]


def generate_circuit_v4():
    r = np.random.random()
    cumsum = 0
    for gen_fn, prob in TEMPLATES_V4:
        cumsum += prob
        if r < cumsum:
            try:
                return gen_fn()
            except:
                return gen_rlc_serie()
    return gen_rlc_serie()
