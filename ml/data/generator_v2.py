"""
Generator V2: Templates de circuits avec comportements ciblés
Tous les circuits passent la validation (pas de dead-ends, pas de doublons).
"""
import numpy as np
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import COMP_R, COMP_L, COMP_C
from data.circuit import Component, Circuit, random_value, is_valid_circuit, generate_random_circuit


def resonant_LC_values(target_freq=None):
    """Génère L et C qui résonnent à target_freq."""
    if target_freq is None:
        target_freq = 10 ** np.random.uniform(2, 5)
    L = 10 ** np.random.uniform(-5, -2)
    C = 1 / (4 * np.pi**2 * target_freq**2 * L)
    C = np.clip(C, 1e-12, 1e-4)
    return L, C


# -------------------------------------------------------
# TEMPLATES VALIDES (pas de doublons, pas de dead-ends)
# -------------------------------------------------------

def generate_rlc_series():
    """RLC Série classique"""
    R_val = 10 ** np.random.uniform(1, 3)
    L_val, C_val = resonant_LC_values()
    # IN(1) -> R -> n2 -> L -> n3 -> C -> GND(0)
    # n2 et n3 ont 2 connexions chacun
    return Circuit([
        Component(COMP_R, 1, 2, R_val),
        Component(COMP_L, 2, 3, L_val),
        Component(COMP_C, 3, 0, C_val),
    ], num_nodes=4)


def generate_rlc_parallel():
    """RLC avec L et C en positions séparées"""
    R_val = 10 ** np.random.uniform(1, 3)
    L_val, C_val = resonant_LC_values()
    # IN(1) -> R -> n2, n2 -> L -> n3 -> C -> GND
    # Ajouter une connexion n3 -> n2 pour éviter dead-end
    return Circuit([
        Component(COMP_R, 1, 2, R_val),
        Component(COMP_L, 2, 3, L_val),
        Component(COMP_C, 3, 0, C_val),
        Component(COMP_R, 3, 2, R_val * 2),  # Cross-connection
    ], num_nodes=4)


def generate_tank_circuit():
    """Tank: R série + L vers n3 + C vers n4, puis jonction"""
    R_val = 10 ** np.random.uniform(1, 3)
    L_val, C_val = resonant_LC_values()
    return Circuit([
        Component(COMP_R, 1, 2, R_val),
        Component(COMP_L, 2, 3, L_val),
        Component(COMP_C, 2, 4, C_val),
        Component(COMP_R, 3, 0, R_val * 0.1),  # L branch to GND
        Component(COMP_R, 4, 0, R_val * 10),   # C branch to GND
        Component(COMP_L, 3, 4, L_val * 0.5),  # Cross between branches
    ], num_nodes=5)


def generate_notch():
    """Notch: structure en T"""
    R1 = 10 ** np.random.uniform(1, 3)
    R2 = 10 ** np.random.uniform(1, 3)
    L_val, C_val = resonant_LC_values()
    return Circuit([
        Component(COMP_R, 1, 2, R1),
        Component(COMP_L, 2, 3, L_val),
        Component(COMP_C, 3, 0, C_val),
        Component(COMP_R, 3, 4, R2),
        Component(COMP_L, 4, 0, L_val * 0.5),
        Component(COMP_C, 4, 2, C_val * 2),  # Cross
    ], num_nodes=5)


def generate_ladder_2stage():
    """Ladder 2 étages"""
    R1 = 10 ** np.random.uniform(1, 3)
    R2 = 10 ** np.random.uniform(1, 3)
    L1, C1 = resonant_LC_values()
    L2, C2 = resonant_LC_values()
    return Circuit([
        Component(COMP_R, 1, 2, R1),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 4, C1),
        Component(COMP_R, 4, 5, R2),
        Component(COMP_L, 5, 0, L2),
        Component(COMP_C, 2, 0, C2),  # Shunt stage 1
        Component(COMP_R, 5, 1, R1 * 0.5),  # Feedback
    ], num_nodes=6)


def generate_double_res():
    """Double résonance"""
    R_val = 10 ** np.random.uniform(1, 3)
    L1, C1 = resonant_LC_values(target_freq=10**np.random.uniform(2, 3.5))
    L2, C2 = resonant_LC_values(target_freq=10**np.random.uniform(3.5, 5))
    return Circuit([
        Component(COMP_R, 1, 2, R_val),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 4, C1),
        Component(COMP_L, 4, 5, L2),
        Component(COMP_C, 5, 0, C2),
        Component(COMP_R, 4, 0, R_val * 0.5),  # Damping
        Component(COMP_R, 2, 5, R_val * 2),    # Cross
    ], num_nodes=6)


def generate_bridged():
    """Bridge: deux chemins parallèles"""
    R1 = 10 ** np.random.uniform(1, 3)
    R2 = 10 ** np.random.uniform(1, 3)
    L_val, C_val = resonant_LC_values()
    return Circuit([
        Component(COMP_R, 1, 2, R1),      # Top path start
        Component(COMP_L, 2, 3, L_val),
        Component(COMP_R, 3, 0, R2),      # Top path end
        Component(COMP_C, 1, 4, C_val),   # Bottom path start
        Component(COMP_R, 4, 0, R1*2),    # Bottom path end
        Component(COMP_L, 2, 4, L_val*0.5), # Bridge
    ], num_nodes=5)


def generate_pi_net():
    """Réseau Pi"""
    R_val = 10 ** np.random.uniform(1, 3)
    L_val, C_val = resonant_LC_values()
    return Circuit([
        Component(COMP_R, 1, 2, R_val),
        Component(COMP_C, 2, 3, C_val),
        Component(COMP_L, 3, 4, L_val),
        Component(COMP_C, 4, 0, C_val * 0.5),
        Component(COMP_R, 4, 5, R_val),
        Component(COMP_L, 5, 0, L_val * 0.5),
        Component(COMP_R, 2, 0, R_val * 5),  # First shunt
    ], num_nodes=6)


def generate_high_q():
    """Haute Q: faible R"""
    R_val = 10 ** np.random.uniform(-1, 1)  # 0.1 - 10 Ohms
    L_val, C_val = resonant_LC_values()
    return Circuit([
        Component(COMP_R, 1, 2, R_val),
        Component(COMP_L, 2, 3, L_val),
        Component(COMP_C, 3, 0, C_val),
    ], num_nodes=4)


def generate_low_q():
    """Basse Q: forte R"""
    R_val = 10 ** np.random.uniform(4, 6)  # 10k - 1M Ohms
    L_val, C_val = resonant_LC_values()
    return Circuit([
        Component(COMP_R, 1, 2, R_val),
        Component(COMP_L, 2, 3, L_val),
        Component(COMP_C, 3, 0, C_val),
    ], num_nodes=4)


def generate_complex_6():
    """6 composants divers"""
    R1 = 10 ** np.random.uniform(1, 3)
    R2 = 10 ** np.random.uniform(2, 4)
    L_val = 10 ** np.random.uniform(-4, -2)
    C1 = 10 ** np.random.uniform(-8, -6)
    C2 = 10 ** np.random.uniform(-9, -7)
    return Circuit([
        Component(COMP_R, 1, 2, R1),
        Component(COMP_L, 2, 3, L_val),
        Component(COMP_C, 3, 4, C1),
        Component(COMP_R, 4, 0, R2),
        Component(COMP_C, 2, 4, C2),  # Cross
        Component(COMP_L, 4, 1, L_val * 0.3),  # Feedback
    ], num_nodes=5)


def generate_wideband():
    """Large bande"""
    R1 = 10 ** np.random.uniform(1, 2)
    R2 = 10 ** np.random.uniform(2, 3)
    L_val = 10 ** np.random.uniform(-4, -2)
    C_val = 10 ** np.random.uniform(-8, -6)
    return Circuit([
        Component(COMP_R, 1, 2, R1),
        Component(COMP_L, 2, 3, L_val),
        Component(COMP_R, 3, 0, R2),
        Component(COMP_C, 3, 4, C_val),
        Component(COMP_R, 4, 0, R1 * 5),
        Component(COMP_L, 2, 4, L_val * 2),
    ], num_nodes=5)


def generate_triple_res():
    """Triple résonance"""
    comps = []
    prev = 1
    for i in range(3):
        L_val, C_val = resonant_LC_values()
        R_val = 10 ** np.random.uniform(1, 2)
        nxt = i + 2
        comps.append(Component(COMP_R, prev, nxt, R_val))
        comps.append(Component(COMP_L, nxt, nxt + 3, L_val))
        comps.append(Component(COMP_C, nxt + 3, 0, C_val))
        prev = nxt
    # Cross connections to avoid dead-ends
    comps.append(Component(COMP_R, 5, 6, 10**np.random.uniform(2, 3)))
    comps.append(Component(COMP_L, 6, 7, 10**np.random.uniform(-4, -2)))
    return Circuit(comps, num_nodes=8)


CIRCUIT_TEMPLATES = [
    (generate_rlc_series, 0.12),
    (generate_rlc_parallel, 0.10),
    (generate_tank_circuit, 0.10),
    (generate_notch, 0.08),
    (generate_ladder_2stage, 0.08),
    (generate_double_res, 0.08),
    (generate_bridged, 0.08),
    (generate_pi_net, 0.08),
    (generate_high_q, 0.08),
    (generate_low_q, 0.08),
    (generate_complex_6, 0.06),
    (generate_wideband, 0.04),
    (generate_triple_res, 0.02),
]


def generate_template_circuit():
    templates, weights = zip(*CIRCUIT_TEMPLATES)
    template_fn = np.random.choice(templates, p=weights)
    return template_fn()


def generate_diverse_circuit_v2(template_ratio=0.5, min_components=3, max_components=10):
    """Génère un circuit diversifié (template ou aléatoire)."""
    max_attempts = 10
    for _ in range(max_attempts):
        if np.random.random() < template_ratio:
            circuit = generate_template_circuit()
        else:
            circuit = generate_random_circuit(min_components=min_components, max_components=max_components)
        
        if is_valid_circuit(circuit.components):
            return circuit
    
    # Fallback
    return generate_random_circuit(min_components=min_components, max_components=max_components)


if __name__ == "__main__":
    from data.solver import compute_impedance
    
    print("=" * 70)
    print("TEST GENERATOR V2 - TOUS LES TEMPLATES")
    print("=" * 70)
    
    valid_templates = 0
    for template_fn, weight in CIRCUIT_TEMPLATES:
        circuit = template_fn()
        valid = is_valid_circuit(circuit.components)
        if valid:
            valid_templates += 1
        try:
            Z = compute_impedance(circuit)
            mag_range = Z[0].max() - Z[0].min()
            phase_range = (Z[1].max() - Z[1].min()) * 180 / np.pi
            status = "OK" if valid else "FAIL"
            print(f"{template_fn.__name__:25} {status:4} | {len(circuit.components):2}c | Mag:{mag_range:5.1f}dec Phase:{phase_range:5.0f}deg")
        except Exception as e:
            print(f"{template_fn.__name__:25} ERROR: {e}")
    
    print(f"\nTemplates valides: {valid_templates}/{len(CIRCUIT_TEMPLATES)}")
    
    print("\n" + "=" * 70)
    print("TEST MIXTE V2 (100 circuits, 70% templates)")
    print("=" * 70)
    
    all_mag, all_phase = [], []
    valid_count = 0
    for i in range(100):
        circuit = generate_diverse_circuit_v2(template_ratio=0.7)
        if is_valid_circuit(circuit.components):
            valid_count += 1
            Z = compute_impedance(circuit)
            all_mag.append(Z[0].max() - Z[0].min())
            all_phase.append((Z[1].max() - Z[1].min()) * 180 / np.pi)
    
    print(f"Circuits valides: {valid_count}/100")
    print(f"Magnitude: mean={np.mean(all_mag):.1f}, std={np.std(all_mag):.1f}, range=[{np.min(all_mag):.1f}, {np.max(all_mag):.1f}] dec")
    print(f"Phase: mean={np.mean(all_phase):.0f}, std={np.std(all_phase):.0f}, range=[{np.min(all_phase):.0f}, {np.max(all_phase):.0f}] deg")
