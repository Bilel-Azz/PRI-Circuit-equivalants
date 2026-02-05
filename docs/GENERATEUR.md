# Documentation du Générateur de Circuits

## Pipeline complet de génération de données synthétiques

Ce document explique en détail comment fonctionne le générateur de circuits, du début à la fin.

---

# Table des Matières

1. [Vue d'Ensemble du Pipeline](#1-vue-densemble-du-pipeline)
2. [Représentation d'un Circuit](#2-représentation-dun-circuit)
3. [Le Solveur MNA](#3-le-solveur-mna)
4. [Génération de Circuits: Les Générateurs V1 à V4](#4-génération-de-circuits-les-générateurs-v1-à-v4)
5. [Encodage en Séquence](#5-encodage-en-séquence)
6. [Assemblage du Dataset](#6-assemblage-du-dataset)
7. [Statistiques et Validation](#7-statistiques-et-validation)

---

# 1. Vue d'Ensemble du Pipeline

## Le Processus Complet

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PIPELINE DE GÉNÉRATION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. GÉNÉRER CIRCUIT          2. CALCULER Z(f)        3. ENCODER   │
│   ┌───────────────┐           ┌─────────────┐         ┌─────────┐  │
│   │ Template ou   │           │  Solveur    │         │Séquence │  │
│   │ aléatoire     │──────────▶│  MNA        │────────▶│ + Z(f)  │  │
│   │               │           │             │         │         │  │
│   └───────────────┘           └─────────────┘         └─────────┘  │
│        │                           │                       │       │
│        ▼                           ▼                       ▼       │
│   ┌───────────┐              ┌───────────┐           ┌─────────┐   │
│   │ R, L, C   │              │ Y·V = I   │           │ .pt     │   │
│   │ + nodes   │              │ Z = V/I   │           │ file    │   │
│   └───────────┘              └───────────┘           └─────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Fichiers Impliqués

```
circuit_transformer/
├── config.py           # Constantes (plages de valeurs, fréquences, etc.)
├── data/
│   ├── circuit.py      # Classes Component, Circuit + validation
│   ├── solver.py       # Solveur MNA pour calculer Z(f)
│   ├── generator_v2.py # Générateur avec templates
│   ├── generator_v3.py # Générateur équilibré (tanks, double résonances)
│   ├── generator_v4.py # Générateur avec résonances marquées
│   └── dataset.py      # Assemblage et sauvegarde du dataset
```

---

# 2. Représentation d'un Circuit

## La Classe Component

Un composant est défini par 4 attributs:

```python
@dataclass
class Component:
    comp_type: int   # 1=R, 2=L, 3=C
    node_a: int      # Premier nœud (0-7)
    node_b: int      # Deuxième nœud (0-7)
    value: float     # Valeur en unités SI
```

**Exemple:**
```python
Component(COMP_R, 1, 2, 1000.0)  # R=1kΩ entre nœuds 1 et 2
Component(COMP_L, 2, 3, 0.001)   # L=1mH entre nœuds 2 et 3
Component(COMP_C, 3, 0, 1e-9)    # C=1nF entre nœud 3 et GND
```

## La Classe Circuit

Un circuit est une liste de composants avec un nombre de nœuds:

```python
@dataclass
class Circuit:
    components: List[Component]
    num_nodes: int
```

## Convention des Nœuds

| Nœud | Signification |
|------|---------------|
| 0 | **GND** (masse, référence) |
| 1 | **IN** (entrée, où on injecte le courant) |
| 2-7 | Nœuds internes |

**L'impédance est mesurée entre IN (nœud 1) et GND (nœud 0).**

## Plages de Valeurs

Définies dans `config.py`:

```python
# Résistances: 0.1Ω à 10MΩ
LOG_R_MIN, LOG_R_MAX = -1, 7

# Inductances: 100nH à 100mH
LOG_L_MIN, LOG_L_MAX = -7, -1

# Capacités: 1pF à 100µF
LOG_C_MIN, LOG_C_MAX = -12, -4
```

**Les valeurs sont générées en log-uniforme:**
```python
def random_value(comp_type: int) -> float:
    if comp_type == COMP_R:
        log_val = np.random.uniform(-1, 7)  # log10(R)
    elif comp_type == COMP_L:
        log_val = np.random.uniform(-7, -1)
    elif comp_type == COMP_C:
        log_val = np.random.uniform(-12, -4)
    return 10 ** log_val
```

---

# 3. Le Solveur MNA

## Principe: Modified Nodal Analysis

Le solveur calcule l'impédance Z(f) en résolvant un système linéaire:

```
Y · V = I

où:
- Y = matrice d'admittance (N×N pour N nœuds)
- V = tensions aux nœuds (vecteur N×1)
- I = courants injectés (vecteur N×1)
```

## Construction de la Matrice Y

Pour chaque composant, on "stamp" sa contribution dans Y:

```python
# Admittance de chaque type de composant
if comp_type == COMP_R:
    y = 1.0 / value                    # Y_R = 1/R
elif comp_type == COMP_L:
    y = 1.0 / (1j * omega * value)     # Y_L = 1/(jωL)
elif comp_type == COMP_C:
    y = 1j * omega * value             # Y_C = jωC
```

**Règle de stamping:**
- Si le composant est entre nœuds i et j (ni GND):
  ```
  Y[i,i] += y
  Y[j,j] += y
  Y[i,j] -= y
  Y[j,i] -= y
  ```
- Si le composant est entre nœud i et GND (j=0):
  ```
  Y[i,i] += y
  ```

## Calcul de Z

```python
def compute_impedance(circuit: Circuit) -> np.ndarray:
    for f_idx, omega in enumerate(2 * np.pi * FREQUENCIES):
        # 1. Construire Y pour cette fréquence
        Y = build_admittance_matrix(circuit, omega)

        # 2. Injecter 1A à l'entrée (nœud 1)
        I = np.zeros(num_nodes)
        I[0] = 1.0  # Nœud 1 = index 0 dans la matrice réduite

        # 3. Résoudre Y·V = I
        V = np.linalg.solve(Y, I)

        # 4. Impédance = V[IN] / I[IN] = V[0] / 1
        Z[f_idx] = V[0]

    # Retourner log(|Z|) et phase
    return np.stack([np.log10(np.abs(Z)), np.angle(Z)])
```

## Fréquences Utilisées

```python
FREQ_MIN = 10.0       # 10 Hz
FREQ_MAX = 10e6       # 10 MHz
NUM_FREQ = 100        # 100 points

FREQUENCIES = np.logspace(1, 7, 100)  # Échelle log
```

---

# 4. Génération de Circuits: Les Générateurs V1 à V4

## Pourquoi Plusieurs Versions?

| Version | Problème à Résoudre | Approche |
|---------|---------------------|----------|
| V1 | Besoin d'un dataset | Génération aléatoire |
| V2 | Circuits trop simples | Templates de circuits |
| V3 | Manque de tanks et double résonances | Distribution forcée |
| V4 | Courbes trop subtiles | Résonances très marquées |

---

## V1: Générateur Aléatoire de Base

**Fichier**: `circuit.py` → `generate_random_circuit()`

**Principe**: Construire un circuit valide en ajoutant des composants un par un.

### Algorithme

```python
def generate_random_circuit(min_comp=3, max_comp=10, force_rlc=True):
    # 1. Choisir le nombre de composants
    num_components = random.randint(min_comp, max_comp)

    # 2. Choisir les types (forcer R+L+C si demandé)
    if force_rlc:
        types = [R, L, C] + [random(R,L,C) for _ in range(num_comp-3)]
    else:
        types = [random(R,L,C) for _ in range(num_comp)]

    # 3. Construire un chemin principal: IN → n2 → n3 → ... → GND
    path = [1, 2, 3, ..., 0]

    # 4. Ajouter des composants le long du chemin
    for i in range(len(path)-1):
        add_component(types[i], path[i], path[i+1])

    # 5. Ajouter des connexions croisées et shunts
    while not enough_components:
        strategy = random(['cross', 'shunt', 'parallel'])
        add_component_with_strategy(strategy)

    return circuit
```

### Validation des Circuits

Un circuit est **valide** si:

```python
def is_valid_circuit(components: List[Component]) -> bool:
    # 1. Pas de self-loops (node_a == node_b)
    for c in components:
        if c.node_a == c.node_b:
            return False

    # 2. Pas de duplicates (même type sur même arête)
    edges = set()
    for c in components:
        edge = (c.comp_type, min(c.node_a, c.node_b), max(c.node_a, c.node_b))
        if edge in edges:
            return False
        edges.add(edge)

    # 3. Doit contenir IN (1) et GND (0)
    nodes = get_all_nodes(components)
    if 0 not in nodes or 1 not in nodes:
        return False

    # 4. Pas de nœuds "dead-end" (sauf IN et GND)
    for node in nodes:
        if node not in [0, 1] and degree(node) < 2:
            return False

    # 5. Tous les nœuds connectés (BFS depuis IN)
    return is_connected(components)
```

### Problème du V1

La génération aléatoire produit **naturellement plus de circuits simples**:
- Beaucoup de RLC série basiques
- Peu de double résonances
- Distribution déséquilibrée

---

## V2: Templates de Circuits

**Fichier**: `generator_v2.py`

**Idée**: Définir des "templates" de circuits avec des comportements spécifiques, puis choisir aléatoirement parmi eux.

### Exemples de Templates

#### RLC Série Résonant
```python
def gen_rlc_series_resonant():
    """Impédance minimale à la résonance f0 = 1/(2π√LC)"""
    R = 10 ** random.uniform(1, 3)  # 10Ω à 1kΩ
    L, C = resonant_LC()  # Calcule L et C pour une fréquence cible
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L),
        Component(COMP_C, 3, 0, C),
    ], num_nodes=4)
```

#### Tank LC (Anti-Résonant)
```python
def gen_tank_lc_parallel():
    """Impédance MAXIMALE à la résonance (bosse au lieu de creux)"""
    R = 10 ** random.uniform(1, 3)
    L, C = resonant_LC()
    # R série + (L || C) vers GND
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 0, L),  # L vers GND
        Component(COMP_C, 2, 0, C),  # C vers GND (parallèle à L)
    ], num_nodes=3)
```

#### Double Résonance
```python
def gen_double_resonance():
    """Deux pics de résonance à f1 et f2"""
    R = 10 ** random.uniform(0, 2)
    f1 = 10 ** random.uniform(2, 3.5)   # 100Hz - 3kHz
    f2 = 10 ** random.uniform(3.5, 5)   # 3kHz - 100kHz
    L1, C1 = resonant_LC(f1)
    L2, C2 = resonant_LC(f2)
    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 4, C1),
        Component(COMP_L, 4, 5, L2),
        Component(COMP_C, 5, 0, C2),
    ], num_nodes=6)
```

### Fonction resonant_LC()

Calcule L et C pour résonner à une fréquence cible:

```python
def resonant_LC(target_freq=None):
    """
    Fréquence de résonance: f0 = 1 / (2π√LC)
    Donc: C = 1 / (4π²f0²L)
    """
    if target_freq is None:
        target_freq = 10 ** random.uniform(2, 5)  # 100Hz à 100kHz

    # Choisir L aléatoirement
    L = 10 ** random.uniform(-5, -1)  # 10µH à 100mH

    # Calculer C pour la résonance
    C = 1 / (4 * np.pi**2 * target_freq**2 * L)

    # Limiter à des valeurs réalistes
    C = np.clip(C, 1e-12, 1e-4)

    return L, C
```

---

## V3: Distribution Équilibrée

**Fichier**: `generator_v3.py`

**Problème à résoudre**: Même avec des templates, la distribution était déséquilibrée. Le modèle voyait trop de RLC simples.

**Solution**: Forcer une distribution spécifique avec des poids.

### Distribution V3

```python
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
```

### Générateur V3

```python
def generate_circuit_v3():
    """Génère un circuit avec distribution équilibrée."""
    templates, weights = zip(*TEMPLATES_V3)
    template_fn = np.random.choice(templates, p=weights)

    for _ in range(10):  # Retry si invalide
        circuit = template_fn()
        if is_valid_circuit(circuit.components):
            return circuit

    # Fallback
    return gen_rlc_serie_simple()
```

---

## V4: Résonances Très Marquées

**Fichier**: `generator_v4.py`

**Problème à résoudre**: Les double résonances du V3 étaient trop **subtiles**:
- Fréquences f1 et f2 trop proches → ressemble à un pic unique
- Q factor trop élevé → pics trop étroits, faciles à rater

**Solution**: Générer des courbes **impossible à confondre** avec un RLC simple.

### Paramètres Modifiés

| Paramètre | V3 | V4 | Effet |
|-----------|-----|-----|-------|
| Écart f1/f2 | ~0.5 décade | **2+ décades** | Pics bien séparés |
| Q factor | 20-50 (élevé) | **5-15 (modéré)** | Pics larges et visibles |
| % double résonances | 25% | **50%** | Forcer l'apprentissage |

### Exemple: Double Résonance Marquée

```python
def gen_double_res_clear():
    """Double résonance avec deux creux TRÈS visibles."""
    R = 10 ** np.random.uniform(0.5, 1.5)  # 3-30 ohm (faible)

    # Fréquences BIEN SÉPARÉES (2 décades)
    f1 = 10 ** np.random.uniform(2, 2.5)   # 100Hz - 300Hz
    f2 = 10 ** np.random.uniform(4, 4.5)   # 10kHz - 30kHz

    # Q MODÉRÉ pour pics LARGES et visibles
    L1, C1 = resonant_LC(f1, q_factor=5)   # Pas 50, mais 5!
    L2, C2 = resonant_LC(f2, q_factor=5)

    return Circuit([
        Component(COMP_R, 1, 2, R),
        Component(COMP_L, 2, 3, L1),
        Component(COMP_C, 3, 4, C1),
        Component(COMP_L, 4, 5, L2),
        Component(COMP_C, 5, 0, C2),
    ], num_nodes=6)
```

### Distribution V4

```python
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
    (gen_double_res_clear, 0.15),  # Encore plus de double résonances
    (gen_double_tank_clear, 0.10),
]
```

### resonant_LC avec Q Factor

```python
def resonant_LC(freq, q_factor=10):
    """Generate L, C for target resonance with specified Q."""
    omega = 2 * np.pi * freq

    # Q = ωL/R, donc L = Q/ω (pour R=1Ω)
    L = q_factor / omega

    # f0 = 1/(2π√LC), donc C = 1/(ω²L)
    C = 1 / (omega * omega * L)

    return L, C
```

**Effet du Q factor:**
- **Q élevé (50)**: Pic très étroit, facile à rater avec 100 points de fréquence
- **Q modéré (5-15)**: Pic large, visible même avec peu de points

---

# 5. Encodage en Séquence

## Format de Séquence

Le modèle travaille avec des **séquences de tokens** (comme en NLP):

```
[START, Comp1, Comp2, ..., CompN, END, PAD, PAD, ...]
```

Chaque position = 4 valeurs:
```
[type, node_a, node_b, value_normalized]
```

## Fonction circuit_to_sequence()

```python
def circuit_to_sequence(circuit: Circuit, max_len: int = 12) -> np.ndarray:
    seq = np.zeros((max_len, 4), dtype=np.float32)

    # Token START
    seq[0, 0] = TOKEN_START  # 4

    # Trier les composants pour un ordre déterministe
    sorted_comps = sorted(circuit.components,
                         key=lambda c: (c.comp_type, c.node_a, c.node_b))

    # Encoder chaque composant
    for i, comp in enumerate(sorted_comps):
        if i + 1 >= max_len - 1:
            break

        # Normaliser la valeur
        log_val = np.log10(comp.value)
        center = VALUE_CENTER[comp.comp_type]  # R=3, L=-4, C=-8
        norm_val = log_val - center  # Centré autour de 0

        seq[i + 1, 0] = comp.comp_type  # 1, 2, ou 3
        seq[i + 1, 1] = comp.node_a     # 0-7
        seq[i + 1, 2] = comp.node_b     # 0-7
        seq[i + 1, 3] = norm_val        # ~[-4, +4]

    # Token END
    end_pos = min(len(sorted_comps) + 1, max_len - 1)
    seq[end_pos, 0] = TOKEN_END  # 5

    return seq
```

## Normalisation des Valeurs

**Problème**: Les valeurs couvrent 28 ordres de grandeur!
- R: 0.1Ω à 10MΩ
- L: 100nH à 100mH
- C: 1pF à 100µF

**Solution**: Normaliser autour de valeurs typiques:

```python
VALUE_CENTER = {
    COMP_R: 3.0,   # log10(1kΩ) = 3
    COMP_L: -4.0,  # log10(100µH) = -4
    COMP_C: -8.0,  # log10(10nF) = -8
}

# Exemple: R = 10kΩ
log_val = log10(10000) = 4
norm_val = 4 - 3 = 1  # Facile à apprendre!

# Exemple: C = 1nF
log_val = log10(1e-9) = -9
norm_val = -9 - (-8) = -1  # Facile à apprendre!
```

---

# 6. Assemblage du Dataset

## Fonction generate_dataset()

```python
def generate_dataset(num_samples=100000, save_path='dataset.pt'):
    # Préparation
    impedances = []
    sequences = []

    # Génération en parallèle
    for sample in parallel_generate(num_samples):
        # 1. Générer le circuit
        circuit = generate_circuit_v3()  # ou v4

        # 2. Valider
        if not is_valid_circuit(circuit.components):
            continue

        # 3. Calculer Z(f)
        impedance = compute_impedance(circuit)
        if not np.isfinite(impedance).all():
            continue

        # 4. Encoder en séquence
        sequence = circuit_to_sequence(circuit)

        # 5. Stocker
        impedances.append(impedance)
        sequences.append(sequence)

    # Sauvegarder
    dataset = {
        'impedances': torch.tensor(impedances),  # (N, 2, 100)
        'sequences': torch.tensor(sequences),    # (N, 12, 4)
    }
    torch.save(dataset, save_path)
```

## Parallélisation

```python
from multiprocessing import Pool

def generate_single_sample(args):
    """Génère un seul sample (pour multiprocessing)."""
    circuit = generate_circuit_v3()
    if not is_valid_circuit(circuit.components):
        return None
    impedance = compute_impedance(circuit)
    if not np.isfinite(impedance).all():
        return None
    sequence = circuit_to_sequence(circuit)
    return {'impedance': impedance, 'sequence': sequence}

# Génération parallèle
with Pool(num_workers) as pool:
    results = pool.map(generate_single_sample, range(num_samples))

# Filtrer les échecs
valid_results = [r for r in results if r is not None]
```

## Format du Fichier .pt

```python
dataset = {
    'impedances': torch.Tensor,  # (N, 2, 100) float32
                                  # [0, :] = log10(|Z|)
                                  # [1, :] = phase(Z) en radians

    'sequences': torch.Tensor,   # (N, 12, 4) float32
                                  # [:, :, 0] = type (0-5)
                                  # [:, :, 1] = node_a (0-7)
                                  # [:, :, 2] = node_b (0-7)
                                  # [:, :, 3] = value normalisée
}
```

---

# 7. Statistiques et Validation

## Statistiques Affichées

```python
print(f"=== Dataset Statistics ===")
print(f"Impedances: {impedances.shape}")   # (N, 2, 100)
print(f"Sequences: {sequences.shape}")     # (N, 12, 4)

# Distribution du nombre de composants
comp_counts = count_components_per_circuit(sequences)
print(f"Components/circuit: min={min}, max={max}, mean={mean}")

# Distribution des types
print(f"Type distribution: R={r}%, L={l}%, C={c}%")

# Plage d'impédance
print(f"|Z| range: [{Z_min:.2f}, {Z_max:.2f}] log10(Ohm)")
print(f"Phase range: [{phase_min:.2f}, {phase_max:.2f}] rad")
```

## Exemple de Sortie

```
Generating 150,000 circuits...
  Components: 3-10
  Max nodes: 8
  RLC ratio: 80%
  Workers: 7

Generating: 100%|████████████████| 150000/150000 [05:32<00:00, 451.23it/s]

Generated 142,847 valid samples (95.2%)
Time: 332.1s (430 samples/sec)

=== Dataset Statistics ===
Impedances: torch.Size([142847, 2, 100])
Sequences: torch.Size([142847, 12, 4])
Components/circuit: min=3, max=10, mean=5.2
Type distribution: R=35.1%, L=32.4%, C=32.5%
|Z| range: [-1.52, 8.34] log10(Ohm)
Phase range: [-1.57, 1.57] rad

Saved to outputs/dataset_v3.pt (215.4 MB)
```

---

# Résumé

| Étape | Fichier | Entrée | Sortie |
|-------|---------|--------|--------|
| 1. Génération | `generator_v*.py` | Paramètres | `Circuit` |
| 2. Validation | `circuit.py` | `Circuit` | bool |
| 3. Calcul Z(f) | `solver.py` | `Circuit` | `(2, 100)` array |
| 4. Encodage | `circuit.py` | `Circuit` | `(12, 4)` array |
| 5. Assemblage | `dataset.py` | N samples | `.pt` file |

**Commande pour générer un dataset:**
```bash
cd ~/circuit_transformer
source venv/bin/activate
python3 -m data.dataset --num-samples 150000 --output outputs/dataset_v3.pt
```

---

*Document technique — Pipeline de génération de données synthétiques*
