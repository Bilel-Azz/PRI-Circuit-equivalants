"""
Generator V3: Dataset équilibré avec plus de:
- Tank LC (anti-résonant)
- Double résonance  
- Notch filters
- Circuits parallèles
"""
import numpy as np
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import COMP_R, COMP_L, COMP_C
from data.circuit import Component, Circuit, is_valid_circuit


def resonant_LC(target_freq=None):
    """Génère L et C qui résonnent à target_freq."""
    if target_freq is None:
        target_freq = 10 ** np.random.uniform(2, 5)
    L = 10 ** np.random.uniform(-5, -2)
    C = 1 / (4 * np.pi**2 * target_freq**2 * L)
    C = np.clip(C, 1e-12, 1e-4)
    return L, C


# =============================================================================
# CIRCUITS SÉRIE RÉSONANTS (minimum d'impédance à la résonance)
# =============================================================================

def gen_rlc_serie_simple():
    """RLC série classique - résonance série"""
    R = 10 ** np.random.uniform(0, 2)  # 1-100 Ohm (faible pour voir la résonance)
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L),
        Component(COMP_C, 3, 0, C),
    ], num_nodes=4)


def gen_rlc_serie_high_q():
    """RLC série haute Q (pic étroit)"""
    R = 10 ** np.random.uniform(-1, 1)  # 0.1-10 Ohm
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L),
        Component(COMP_C, 3, 0, C),
    ], num_nodes=4)


# =============================================================================
# CIRCUITS TANK / ANTI-RÉSONANTS (maximum d'impédance à la résonance)
# =============================================================================

def gen_tank_lc_parallel():
    """Tank LC parallèle pur - anti-résonance"""
    R = 10 ** np.random.uniform(1, 3)
    L, C = resonant_LC()
    # R série + (L || C) vers GND
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 0, L),
        Component(COMP_C, 2, 0, C),
    ], num_nodes=3)


def gen_tank_lc_with_load():
    """Tank LC avec résistance de charge"""
    R1 = 10 ** np.random.uniform(1, 2)
    R2 = 10 ** np.random.uniform(2, 4)  # Charge haute impédance
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_R, 1, 2, R1),
        Component(COMP_L, 2, 3, L),
        Component(COMP_C, 2, 3, C),
        Component(COMP_R, 3, 0, R2),
    ], num_nodes=4)


def gen_tank_tapped():
    """Tank avec prise intermédiaire"""
    R = 10 ** np.random.uniform(1, 3)
    L1 = 10 ** np.random.uniform(-4, -2)
    L2 = L1 * np.random.uniform(0.3, 0.7)
    C = 10 ** np.random.uniform(-9, -6)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_L, 3, 0, L2),
        Component(COMP_C, 2, 0, C),
    ], num_nodes=4)


def gen_parallel_rlc():
    """RLC tout en parallèle"""
    R = 10 ** np.random.uniform(2, 4)  # Haute R pour voir l'effet
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_R, 1, 0, R),
        Component(COMP_L, 1, 0, L),
        Component(COMP_C, 1, 0, C),
    ], num_nodes=2)


def gen_tank_damped():
    """Tank amorti avec R parallèle"""
    R1 = 10 ** np.random.uniform(1, 2)
    R2 = 10 ** np.random.uniform(3, 5)  # R parallèle haute
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_R, 1, 2, R1),
        Component(COMP_L, 2, 0, L),
        Component(COMP_C, 2, 0, C),
        Component(COMP_R, 2, 0, R2),
    ], num_nodes=3)


# =============================================================================
# DOUBLE RÉSONANCE
# =============================================================================

def gen_double_resonance_serie():
    """Double résonance: deux LC série en cascade"""
    R = 10 ** np.random.uniform(0, 2)
    f1 = 10 ** np.random.uniform(2, 3.5)
    f2 = 10 ** np.random.uniform(3.5, 5)
    L1, C1 = resonant_LC(f1)
    L2, C2 = resonant_LC(f2)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 4, C1),
        Component(COMP_L, 4, 5, L2),
        Component(COMP_C, 5, 0, C2),
        Component(COMP_R, 3, 0, R * 10),  # Damping
    ], num_nodes=6)


def gen_double_resonance_parallel():
    """Double résonance: deux tanks en série"""
    R = 10 ** np.random.uniform(1, 2)
    f1 = 10 ** np.random.uniform(2, 3.5)
    f2 = 10 ** np.random.uniform(3.5, 5)
    L1, C1 = resonant_LC(f1)
    L2, C2 = resonant_LC(f2)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 2, 3, C1),
        Component(COMP_L, 3, 0, L2),
        Component(COMP_C, 3, 0, C2),
    ], num_nodes=4)


def gen_double_resonance_mixed():
    """Double résonance mixte série/parallèle"""
    R = 10 ** np.random.uniform(1, 2)
    f1 = 10 ** np.random.uniform(2, 3.5)
    f2 = 10 ** np.random.uniform(3.5, 5)
    L1, C1 = resonant_LC(f1)
    L2, C2 = resonant_LC(f2)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 0, C1),
        Component(COMP_L, 3, 4, L2),
        Component(COMP_C, 3, 4, C2),
        Component(COMP_R, 4, 0, R * 5),
    ], num_nodes=5)


# =============================================================================
# NOTCH FILTERS (coupe-bande)
# =============================================================================

def gen_notch_twin_t():
    """Notch Twin-T simplifié"""
    R = 10 ** np.random.uniform(2, 4)
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_C, 2, 3, C),
        Component(COMP_L, 3, 0, L),
        Component(COMP_R, 2, 4, R),
        Component(COMP_L, 4, 0, L * 0.5),
        Component(COMP_C, 4, 3, C * 2),
    ], num_nodes=5)


def gen_notch_bridged_t():
    """Notch Bridged-T"""
    R1 = 10 ** np.random.uniform(2, 3)
    R2 = 10 ** np.random.uniform(1, 2)
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_R, 1, 2, R1),
        Component(COMP_L, 2, 3, L),
        Component(COMP_C, 2, 3, C),
        Component(COMP_R, 3, 0, R2),
        Component(COMP_C, 2, 0, C * 0.5),
    ], num_nodes=4)


def gen_notch_parallel_trap():
    """Notch avec piège parallèle"""
    R = 10 ** np.random.uniform(1, 3)
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_R, 2, 0, R * 10),
        Component(COMP_L, 2, 3, L),
        Component(COMP_C, 2, 3, C),
        Component(COMP_R, 3, 0, R * 0.1),
    ], num_nodes=4)


# =============================================================================
# CIRCUITS COMPLEXES VARIÉS
# =============================================================================

def gen_ladder_lc():
    """Ladder LC (filtre)"""
    L1, C1 = resonant_LC()
    L2, C2 = resonant_LC()
    R = 10 ** np.random.uniform(1, 3)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 0, C1),
        Component(COMP_L, 3, 4, L2),
        Component(COMP_C, 4, 0, C2),
        Component(COMP_R, 4, 0, R),
    ], num_nodes=5)


def gen_pi_network():
    """Réseau Pi"""
    R = 10 ** np.random.uniform(1, 3)
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_C, 1, 0, C),
        Component(COMP_L, 1, 2, L),
        Component(COMP_C, 2, 0, C * 0.8),
        Component(COMP_R, 2, 0, R),
    ], num_nodes=3)


def gen_t_network():
    """Réseau T"""
    R = 10 ** np.random.uniform(1, 3)
    L, C = resonant_LC()
    return Circuit([
        Component(COMP_L, 1, 2, L),
        Component(COMP_C, 2, 0, C),
        Component(COMP_L, 2, 3, L * 0.8),
        Component(COMP_R, 3, 0, R),
    ], num_nodes=4)


# =============================================================================
# DISTRIBUTION ÉQUILIBRÉE
# =============================================================================

TEMPLATES_V3 = [
    # Série résonants (20%)
    (gen_rlc_serie_simple, 0.10),
    (gen_rlc_serie_high_q, 0.10),
    
    # Tanks / Anti-résonants (25%) - AUGMENTÉ!
    (gen_tank_lc_parallel, 0.08),
    (gen_tank_lc_with_load, 0.06),
    (gen_tank_tapped, 0.04),
    (gen_parallel_rlc, 0.04),
    (gen_tank_damped, 0.03),
    
    # Double résonance (25%) - AUGMENTÉ!
    (gen_double_resonance_serie, 0.10),
    (gen_double_resonance_parallel, 0.08),
    (gen_double_resonance_mixed, 0.07),
    
    # Notch filters (15%) - NOUVEAU!
    (gen_notch_twin_t, 0.05),
    (gen_notch_bridged_t, 0.05),
    (gen_notch_parallel_trap, 0.05),
    
    # Complexes (15%)
    (gen_ladder_lc, 0.05),
    (gen_pi_network, 0.05),
    (gen_t_network, 0.05),
]


def generate_circuit_v3():
    """Génère un circuit avec distribution équilibrée."""
    templates, weights = zip(*TEMPLATES_V3)
    template_fn = np.random.choice(templates, p=weights)
    
    for _ in range(10):
        circuit = template_fn()
        if is_valid_circuit(circuit.components):
            return circuit
    
    # Fallback
    return gen_rlc_serie_simple()


if __name__ == "__main__":
    from data.solver import compute_impedance
    
    print("=" * 70)
    print("TEST GENERATOR V3 - Distribution équilibrée")
    print("=" * 70)
    
    # Test chaque template
    for fn, weight in TEMPLATES_V3:
        circuit = fn()
        valid = is_valid_circuit(circuit.components)
        try:
            Z = compute_impedance(circuit)
            mag_range = Z[0].max() - Z[0].min()
            status = "OK" if valid else "FAIL"
            print(f"{fn.__name__:30} {status:4} | {len(circuit.components):2}c | weight={weight:.2f} | MagRange={mag_range:.1f}")
        except Exception as e:
            print(f"{fn.__name__:30} ERROR: {e}")
    
    print(f"\nTotal weight: {sum(w for _, w in TEMPLATES_V3):.2f}")
