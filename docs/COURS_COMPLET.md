# Cours Complet: Synthèse de Circuits par Deep Learning

## De l'impédance Z(f) à la topologie du circuit

**Auteur**: Claude (Assistant IA)
**Date**: Janvier 2026
**Projet**: PRI - Circuit Synthesis

---

# Table des Matières

1. [Le Problème](#1-le-problème)
2. [Historique et Échecs](#2-historique-et-échecs)
3. [État de l'Art 2025-2026](#3-état-de-lart-2025-2026)
4. [Nouvelle Approche: Transformer Séquentiel](#4-nouvelle-approche-transformer-séquentiel)
5. [Implémentation Complète](#5-implémentation-complète)
6. [Guide de Déploiement](#6-guide-de-déploiement)

---

# 1. Le Problème

## 1.1 Contexte

**Objectif**: Prédire la topologie d'un circuit électrique (R, L, C) à partir de sa courbe d'impédance Z(f).

```
Input:  Z(f) = |Z|(f) + j·φ(f)   sur 100 fréquences (10 Hz → 10 MHz)
Output: Circuit = liste de composants (type, nœud_a, nœud_b, valeur)
```

**Exemple**:
```
Z(f) montre une résonance à 1 kHz
          ↓
Circuit: R(100Ω) en série avec L(1mH) || C(1µF)
```

## 1.2 Pourquoi c'est difficile?

### Problème inverse mal posé
- Plusieurs circuits peuvent avoir la même Z(f)
- L'espace des solutions est combinatoire
- Relations non-linéaires entre composants et impédance

### Défis techniques
1. **Représentation**: Comment encoder un circuit de taille variable?
2. **Connectivité**: Comment garantir des circuits valides (pas de nœuds morts)?
3. **Valeurs continues**: Comment prédire R=47.3Ω vs R=100Ω?
4. **Multi-tâche**: Classification (type) + Régression (valeur) + Structure (nœuds)

## 1.3 Données synthétiques

**Approche 100% synthétique**:
1. Générer circuits aléatoires (topologie + valeurs)
2. Calculer Z(f) avec solveur MNA (Modified Nodal Analysis)
3. Entraîner supervisé: Z(f) → Circuit

**Avantages**:
- Dataset illimité
- Ground truth parfait
- Contrôle total sur la distribution

---

# 2. Historique et Échecs

## 2.1 Phase 1: Solveur Différentiable (ÉCHEC ❌)

### Approche RobustSolver / GraphSolver

**Idée**: Rendre le calcul Z(f) différentiable pour backpropagation.

```
Z(f)_input → Encoder → Circuit_pred → MNA_Solver → Z(f)_pred
                                                      ↓
                                            Loss = ||Z_pred - Z_input||
```

**Implémentation**:
```python
# solver/robust_solver.py
def forward(edge_types, edge_values, frequencies):
    Y = build_admittance_matrix(edge_types, edge_values, omega)
    V = torch.linalg.solve(Y, I)  # Résolution système linéaire
    Z = V[input_node] / I[input_node]
    return Z
```

### Pourquoi ça a échoué?

**1. Instabilité numérique catastrophique**

Les admittances varient sur 28 ordres de grandeur:
```
Y_capacitor(1pF, 10Hz)  ≈ 10⁻¹⁶ S
Y_resistor(10MΩ)        ≈ 10⁻⁷ S
Y_inductor(100nH, 10MHz) ≈ 10¹² S
```

`torch.linalg.solve()` devient numériquement instable.

**2. Mode collapse**

Le modèle convergait vers une solution triviale:
```
Epoch 1-150: Loss ≈ 238% erreur
Prédiction: Toujours la même courbe plate
```

**3. Pas de gradient exploitable**

Le gradient ∂Z/∂circuit passe par l'inversion matricielle, ce qui:
- Amplifie le bruit numérique
- Crée des gradients explosifs/vanishing
- Ne guide pas l'apprentissage

**Leçon**: Le solveur MNA n'est pas différentiable de manière stable.

---

## 2.2 Phase 2: Supervisé avec Matrices (PARTIEL 🟡)

### Approche CircuitPredictor

**Idée**: Prédire directement le circuit sans passer par le solveur.

```
Z(f) → Encoder_MLP → Decoder_Dual_Head → edge_types[8×8] + edge_values[8×8]
```

**Représentation matricielle**:
```python
edge_types[i,j] = 0/1/2/3  # NONE/R/L/C entre nœuds i et j
edge_values[i,j] = log10(valeur)
```

### Problème: Dataset inadéquat

**Dataset initial `gnn_750k.pt`**:
```
Distribution:
- RLC (R+L+C): 9.9%      ← Très peu!
- R seul: 18.8%
- L seul: 18.9%
- C seul: 18.9%
- Simples (≤3 comp): 46.1%
```

**Résultat**: Le modèle apprenait à prédire des courbes plates (comportement résistif majoritaire).

### Amélioration: Dataset RLC `gnn_750k_rlc.pt`

Nouveau dataset avec 78.6% de circuits RLC complexes:
```
- RLC complexes: 78.6%  ✅
- Circuits ≥6 composants
- Branches parallèles autorisées
```

**Résultat**: Type accuracy ~80% mais...

---

## 2.3 Phase 3: REINFORCE + GNN (ÉCHEC ❌)

### Approche

**Idée**: Utiliser policy gradients pour optimiser directement la reconstruction Z(f).

```python
# training/reinforce_loss.py
reward = -||Z_pred - Z_target||
loss = -log_prob(action) * advantage
```

### Pourquoi ça a échoué?

**Les logs montraient**:
```
Epoch 136/150 | Loss: 0.000 | Reward: 0.00 | Mag: 2.95 | Phase: 90° | Succ: 100%
Epoch 137/150 | Loss: 0.000 | Reward: 0.00 | Mag: 2.97 | Phase: 90° | Succ: 100%
...
Best reward: 0.00
```

**Diagnostic**:
- **Loss = 0**: Les gradients ont disparu
- **Reward = 0**: Pas de signal d'apprentissage
- **Phase ≈ 90°**: Le modèle prédit toujours un condensateur pur
- **Mode collapse**: Solution triviale qui "satisfait" la métrique

**Causes profondes**:
1. **Représentation matricielle inefficace**: 64 positions à prédire (8×8), 90% sont NONE
2. **Pas de pré-entraînement**: REINFORCE sans initialisation supervisée
3. **Espace d'action trop grand**: Combinatoire explosive

---

## 2.4 Tableau récapitulatif des échecs

| Approche | Problème principal | Résultat |
|----------|-------------------|----------|
| RobustSolver | Instabilité numérique (28 ordres) | Mode collapse 238% |
| GraphSolver | Bug permute + même instabilité | Non concluant |
| Supervisé matrices | Dataset déséquilibré (9.9% RLC) | Courbes plates |
| Supervisé matrices v2 | Représentation inefficace (64 pos) | ~80% type, valeurs mauvaises |
| REINFORCE + GNN | Mode collapse (reward=0, loss=0) | Prédit toujours condensateur |

**Conclusion**: Le problème n'est pas le modèle, c'est la **représentation**.

---

# 3. État de l'Art 2025-2026

## 3.1 Recherches effectuées

### Transformers pour génération de structures

**1. SMILES pour molécules** (ChemBERTa, MolGPT)
- Représentation séquentielle: `CC(=O)OC1=CC=CC=C1C(=O)O`
- Génération autoregressive token par token
- **Succès**: >90% molécules valides générées

**2. AutoGraph** (2024-2025)
- Génération de graphes avec Transformers
- Linéaire en nombre d'arêtes (vs quadratique pour matrices)
- Utilisé pour graphes moléculaires

**3. INSIGHT** (2024)
- Universal Neural Simulator pour circuits analogiques
- Transformers autorégressifs
- Prédit comportement temporel de circuits

### Leçons des papiers

1. **Séquentiel > Matriciel** pour structures de taille variable
2. **Autorégressif** permet contraintes structurelles
3. **Attention causale** capture dépendances entre composants
4. **Teacher forcing** puis scheduled sampling

## 3.2 Pourquoi le Transformer séquentiel?

### Comparaison représentations

| Aspect | Matrices 8×8 | Séquentiel |
|--------|-------------|------------|
| Positions à prédire | 64 (90% NONE) | 10-12 (100% utiles) |
| Efficacité | 10% | 100% |
| Taille variable | Padding | Naturel (START...END) |
| Ordre | Ambigu | Canonique |
| Validité | Post-hoc | Par construction |

### Avantages du Transformer

1. **Attention**: Chaque composant "voit" les précédents
2. **Autorégressif**: Génère un composant à la fois
3. **Flexible**: S'adapte à circuits de 1 à 10 composants
4. **Prouvé**: État de l'art pour séquences (NLP, molécules, code)

---

# 4. Nouvelle Approche: Transformer Séquentiel

## 4.1 Représentation

### Format séquentiel

Chaque composant = 1 token de 4 valeurs:
```
[TYPE, NODE_A, NODE_B, VALUE]
```

Où:
- `TYPE`: 0=PAD, 1=R, 2=L, 3=C, 4=START, 5=END
- `NODE_A, NODE_B`: 0-7 (indices des nœuds)
- `VALUE`: log10(valeur) normalisé

### Exemple

Circuit: R(100Ω) entre GND-N1, L(1mH) entre N1-N2, C(1µF) entre N2-GND

```
Séquence (max_len=12):
[START, 0, 0, 0.0]      # Token de début
[R,     0, 1, 0.0]      # R=100Ω (log10(100)-3 = -1 → normalisé ≈ 0)
[L,     1, 2, 0.0]      # L=1mH (log10(1e-3)-(-4) = 1 → normalisé ≈ 0)
[C,     2, 0, 0.0]      # C=1µF (log10(1e-6)-(-8) = 2 → normalisé ≈ 0)
[END,   0, 0, 0.0]      # Token de fin
[PAD,   0, 0, 0.0]      # Padding
...
```

### Normalisation des valeurs

Pour que le modèle apprenne plus facilement:
```python
VALUE_CENTER = {
    R: 3.0,   # 1kΩ = 10^3
    L: -4.0,  # 100µH = 10^-4
    C: -8.0,  # 10nF = 10^-8
}
normalized_value = log10(value) - VALUE_CENTER[type]
```

Ainsi, les valeurs typiques sont proches de 0.

## 4.2 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CircuitTransformer                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Input: Z(f) = (batch, 2, 100)                            │
│            │                                                │
│            ▼                                                │
│   ┌─────────────────┐                                      │
│   │ ImpedanceEncoder│  CNN 1D + MLP                        │
│   │   (2,100) → 256 │  Conv1d(2→64→128→256) + FC(→256)    │
│   └────────┬────────┘                                      │
│            │                                                │
│            ▼                                                │
│      Latent (batch, 256)                                   │
│            │                                                │
│            ▼                                                │
│   ┌─────────────────────────────────────────────┐          │
│   │         TransformerDecoder                   │          │
│   │  ┌──────────────────────────────────────┐   │          │
│   │  │ ComponentEmbedding                    │   │          │
│   │  │  type_emb(6) + node_a_emb(8) +       │   │          │
│   │  │  node_b_emb(8) + value_proj(1)       │   │          │
│   │  │  → d_model (512)                      │   │          │
│   │  └──────────────────────────────────────┘   │          │
│   │                    │                         │          │
│   │                    ▼                         │          │
│   │  ┌──────────────────────────────────────┐   │          │
│   │  │ PositionalEncoding (sinusoidal)      │   │          │
│   │  └──────────────────────────────────────┘   │          │
│   │                    │                         │          │
│   │                    ▼                         │          │
│   │  ┌──────────────────────────────────────┐   │          │
│   │  │ TransformerDecoderLayers × 6         │   │          │
│   │  │  - Self-Attention (causal mask)      │   │          │
│   │  │  - Cross-Attention (to latent)       │   │          │
│   │  │  - FFN (512 → 2048 → 512)           │   │          │
│   │  │  - 8 heads, dropout=0.1              │   │          │
│   │  └──────────────────────────────────────┘   │          │
│   │                    │                         │          │
│   │                    ▼                         │          │
│   │  ┌──────────────────────────────────────┐   │          │
│   │  │ Prediction Heads                      │   │          │
│   │  │  - type_head: Linear(512 → 6)        │   │          │
│   │  │  - node_a_head: Linear(512 → 8)      │   │          │
│   │  │  - node_b_head: Linear(512 → 8)      │   │          │
│   │  │  - value_head: Linear(512 → 1)       │   │          │
│   │  └──────────────────────────────────────┘   │          │
│   └─────────────────────────────────────────────┘          │
│                                                             │
│   Output: Séquence (batch, 12, 4)                          │
│           + Logits pour chaque head                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Paramètres: 27.7M
```

## 4.3 Training

### Teacher Forcing

Pendant l'entraînement, on fournit la séquence cible décalée:

```
Input:  [START, R, L, C, END, PAD, ...]
Target: [R,     L, C, END, PAD, PAD, ...]
```

Le modèle apprend à prédire le token suivant.

### Loss Function

```python
total_loss = (
    1.0 * CrossEntropy(type_logits, target_types) +      # Classification
    0.5 * CrossEntropy(node_a_logits, target_node_a) +   # Classification
    0.5 * CrossEntropy(node_b_logits, target_node_b) +   # Classification
    1.0 * MSE(pred_values, target_values)                # Régression
)
```

**Masking**: On ignore les tokens PAD dans le calcul de loss.

### Gumbel-Softmax Temperature

Pour l'échantillonnage différentiable:
```python
tau = 1.0 → 0.3 sur 50 epochs
```

- `tau=1.0`: Soft sampling (exploration)
- `tau=0.3`: Hard sampling (exploitation)

### Scheduled Sampling (optionnel)

Progressivement remplacer teacher forcing par autorégressif:
```
p_teacher = 1.0 → 0.5 sur training
```

## 4.4 Inférence

Mode autorégressif:
```
1. Encoder Z(f) → latent
2. Initialiser: sequence = [START]
3. Pour t = 1 à max_len:
   a. Embed sequence[:t]
   b. Transformer decode
   c. Predict next token
   d. Si token == END: stop
   e. Append token to sequence
4. Return sequence
```

---

# 5. Implémentation Complète

## 5.1 Structure du projet

```
circuit_transformer/
├── config.py              # Constantes et hyperparamètres
├── requirements.txt       # Dépendances
├── COURS_COMPLET.md       # Ce document
├── data/
│   ├── __init__.py
│   ├── circuit.py         # Component, Circuit, génération aléatoire
│   ├── solver.py          # MNA solver pour Z(f)
│   └── dataset.py         # Génération dataset parallèle
├── models/
│   ├── __init__.py
│   ├── encoder.py         # ImpedanceEncoder (CNN)
│   ├── decoder.py         # TransformerDecoder
│   └── model.py           # CircuitTransformer (complet)
├── training/
│   ├── __init__.py
│   └── loss.py            # CircuitLoss (avec shift pour next-token)
├── scripts/
│   ├── train.py           # Training supervisé
│   └── evaluate.py        # Évaluation et comparaison courbes
└── outputs/               # Résultats
    ├── dataset_*.pt       # Datasets générés
    └── */checkpoints/     # Modèles sauvegardés
```

## 5.2 Fichiers clés

### config.py
```python
# Circuit
MAX_COMPONENTS = 10
MAX_NODES = 8
MAX_SEQ_LEN = 12  # START + 10 + END

# Tokens
TOKEN_PAD, TOKEN_R, TOKEN_L, TOKEN_C = 0, 1, 2, 3
TOKEN_START, TOKEN_END = 4, 5

# Model
LATENT_DIM = 256
D_MODEL = 512
N_HEAD = 8
N_LAYERS = 6

# Training
BATCH_SIZE = 64
LEARNING_RATE = 3e-4
EPOCHS = 100
```

### data/circuit.py
```python
@dataclass
class Component:
    comp_type: int   # 1=R, 2=L, 3=C
    node_a: int
    node_b: int
    value: float

def generate_random_circuit(min_comp=3, max_comp=10, force_rlc=True):
    # 1. Choisir nombre de composants
    # 2. Si force_rlc: garantir R+L+C présents
    # 3. Construire chemin principal IN → GND
    # 4. Ajouter branches parallèles
    # 5. Vérifier connectivité
    return Circuit(components, num_nodes)

def circuit_to_sequence(circuit, max_len=12):
    # 1. START token
    # 2. Trier composants (type, node_a, node_b)
    # 3. Normaliser valeurs
    # 4. END token + padding
    return sequence  # (max_len, 4)
```

### models/decoder.py
```python
class TransformerDecoder(nn.Module):
    def __init__(self, latent_dim=256, d_model=512, nhead=8, num_layers=6):
        self.latent_proj = nn.Linear(latent_dim, d_model)
        self.comp_emb = ComponentEmbedding(d_model)
        self.pos_enc = PositionalEncoding(d_model)
        self.transformer = nn.TransformerDecoder(...)
        self.type_head = nn.Linear(d_model, 6)
        self.node_a_head = nn.Linear(d_model, 8)
        self.node_b_head = nn.Linear(d_model, 8)
        self.value_head = nn.Linear(d_model, 1)

    def forward(self, latent, teacher_seq=None, tau=1.0):
        memory = self.latent_proj(latent).unsqueeze(1)

        if teacher_seq is not None:
            # Teacher forcing
            tgt = self.pos_enc(self.comp_emb(teacher_seq))
            output = self.transformer(tgt, memory, tgt_mask=causal_mask)
        else:
            # Autoregressive
            output = self._generate_autoregressive(memory)

        return {
            'type_logits': self.type_head(output),
            'node_a_logits': self.node_a_head(output),
            'node_b_logits': self.node_b_head(output),
            'values': self.value_head(output)
        }
```

## 5.3 Métriques

### Métriques supervisées (training)

| Métrique | Description | Target |
|----------|-------------|--------|
| type_acc | Accuracy classification type | >90% |
| node_a_acc | Accuracy node A | >85% |
| node_b_acc | Accuracy node B | >85% |
| value_mae | MAE sur valeurs normalisées | <0.5 |

### Métriques de reconstruction (évaluation finale)

| Métrique | Description | Target |
|----------|-------------|--------|
| mag_error | Erreur magnitude Z(f) en dB | <10 dB |
| phase_error | Erreur phase Z(f) en degrés | <15° |
| valid_ratio | % circuits valides générés | >95% |

**Important**: Les métriques supervisées mesurent si on prédit le **même** circuit.
Les métriques de reconstruction mesurent si on prédit un circuit **équivalent**.

## 5.4 Script d'évaluation

**Fichier**: `scripts/evaluate.py`

Compare les courbes Z(f) prédites vs réelles:

```bash
python scripts/evaluate.py \
    --checkpoint outputs/training/checkpoints/best.pt \
    --data outputs/dataset.pt \
    --num-samples 10 \
    --output-dir outputs/evaluation
```

Génère des plots comparatifs dans `outputs/evaluation/`.

---

# 6. Guide de Déploiement

## 6.1 Local (test)

```bash
# 1. Activer environnement
source venv/bin/activate
cd circuit_transformer

# 2. Générer petit dataset test
python data/dataset.py --num-samples 1000 --output outputs/test_1k.pt

# 3. Training court
python scripts/train.py --data outputs/test_1k.pt --epochs 5 --batch-size 16
```

## 6.2 Serveur OVH (RTX 5000)

```bash
# 1. Copier le projet
scp -r circuit_transformer ubuntu@<IP_OVH>:~/

# 2. SSH et setup
ssh ubuntu@<IP_OVH>
cd ~/circuit_transformer
pip install -r requirements.txt

# 3. Générer dataset 750k (~25 min, 8 workers)
nohup python data/dataset.py \
    --num-samples 750000 \
    --min-components 3 \
    --max-components 10 \
    --rlc-ratio 0.8 \
    --output outputs/dataset_750k.pt \
    > dataset.log 2>&1 &

# Surveiller
tail -f dataset.log

# 4. Lancer training (~3-4h pour 100 epochs)
nohup python scripts/train.py \
    --data outputs/dataset_750k.pt \
    --epochs 100 \
    --batch-size 128 \
    --output-dir outputs/run1 \
    > train.log 2>&1 &

# Surveiller
tail -f train.log
watch -n 5 nvidia-smi
```

## 6.3 Hyperparamètres recommandés

Pour RTX 5000 (16GB VRAM):
```yaml
batch_size: 128          # Peut aller jusqu'à 256
d_model: 512
n_layers: 6
n_head: 8
learning_rate: 3e-4
weight_decay: 1e-5
epochs: 100
tau_start: 1.0
tau_end: 0.3
tau_anneal_epochs: 50
```

## 6.4 Checkpoints et monitoring

```bash
# Checkpoints sauvegardés
outputs/run1/
├── checkpoints/
│   ├── best.pt         # Meilleur val_loss
│   ├── epoch_10.pt
│   ├── epoch_20.pt
│   └── final.pt
├── history.json         # Métriques par epoch
└── training_curves.png  # Graphiques
```

---

# 7. Résumé et Perspectives

## 7.1 Ce qui a changé

| Avant | Après |
|-------|-------|
| Matrices 8×8 (64 positions) | Séquence 12 tokens |
| 90% de prédictions NONE | 100% de prédictions utiles |
| MLP Encoder + Decoder | CNN Encoder + Transformer Decoder |
| REINFORCE instable | Supervisé stable |
| Mode collapse | Apprentissage progressif |

## 7.2 Pourquoi ça devrait marcher

1. **Représentation efficace**: Chaque prédiction compte
2. **Architecture prouvée**: Transformer = état de l'art pour séquences
3. **Dataset riche**: 78.6% RLC complexes
4. **Loss multi-tâche**: Type + Nodes + Valeurs supervisés
5. **Pas de solver instable**: Supervisé pur

## 7.3 Bug critique découvert et corrigé

### Le problème: Next-token prediction

Lors des premiers tests, le modèle générait des séquences incorrectes (que des START tokens).

**Cause**: La loss comparait les prédictions aux mauvaises cibles!

```
Input au modèle:  [START, R, L, C, END, PAD]
Target INCORRECT: [START, R, L, C, END, PAD]  ← Le modèle apprend à copier!
Target CORRECT:   [R, L, C, END, PAD, PAD]    ← Décalé de 1
```

**Solution** dans `training/loss.py`:
```python
# Shift target left by 1 (next-token prediction)
target_seq_shifted = torch.zeros_like(target_seq)
target_seq_shifted[:, :-1, :] = target_seq[:, 1:, :]
target_seq = target_seq_shifted
```

Après correction, le modèle génère correctement des R, L, C.

---

## 7.4 Objectif Réel: Circuits Équivalents

### Point clé fondamental

L'objectif n'est **pas** de prédire le circuit exact, mais un **circuit équivalent** qui produit la même courbe Z(f).

**Plusieurs circuits peuvent avoir la même impédance!**

Exemple:
- `R(100) -- L(1mH) -- C(1µF)` en série
- `R(50) -- R(50) -- L(1mH) -- C(1µF)` en série

→ Même Z(f), circuits différents!

### Conséquence sur l'évaluation

La métrique supervisée (accuracy sur types/nœuds) n'est **pas** la bonne métrique finale.
La vraie métrique est: **||Z(f)_prédit - Z(f)_cible||**

---

## 7.5 Expériences Avancées: V2 et Best-of-N

### Approche 1: Best-of-N (SUCCÈS ✅)

**Idée**: Générer N circuits candidats, garder celui avec le meilleur match Z(f).

```
Pour chaque sample:
  1. Générer N circuits avec températures variées (τ = 0.3 à 1.0)
  2. Calculer Z(f) de chaque circuit via MNA solver
  3. Sélectionner celui qui minimise ||Z_pred - Z_target||
```

**Résultats sur 50 samples (modèle V1 entraîné sur 50k)**:

| N candidats | Mag Error | Phase Error | Amélioration |
|-------------|-----------|-------------|--------------|
| N=1 | 3.05 | 59.2° | baseline |
| N=10 | 0.71 | 17.5° | +76.7% |
| **N=50** | **0.35** | **11.6°** | **+88.5%** |

**Avantages**:
- Simple à implémenter
- Exploite la diversité via température variable
- Pas de changement d'architecture

**Inconvénients**:
- Temps d'inférence × N
- Ne change pas le modèle sous-jacent

---

### Approche 2: Forward Model (SUCCÈS ✅)

**Idée**: Entraîner un modèle séparé Circuit → Z(f) pour évaluer les circuits générés.

```
ForwardModel:
  Circuit sequence → Encoder Transformer → Latent → MLP Decoder → Z(f)_pred
```

**Architecture**:
- CircuitEncoder: Embeddings (type, nodes, value) + Transformer 4 layers
- ImpedanceDecoder: MLP 3 couches → (2, 100)

**Résultats après 30 epochs sur 50k**:
- Magnitude error: 0.105
- Phase error: 0.131

**Utilité**: Ce modèle peut remplacer le MNA solver (20× plus rapide) pour évaluer les circuits candidats.

---

### Approche 3: V2 Reconstruction Loss (ÉCHEC ❌)

**Idée**: Optimiser directement ||Z(f)_prédit - Z(f)_cible|| via le forward model.

```
Z(f)_input → Encoder → Decoder → Circuit_pred → ForwardModel → Z(f)_pred
                                                        ↓
                                              Loss = MSE(Z_pred, Z_input)
```

**Problème 1: Pas de gradient flow**

Initialement, la loss ne descendait pas (stuck à 5.5).

**Cause**: `argmax` et `nn.Embedding` ne sont pas différentiables.

**Solution**: Gumbel-Softmax avec soft embeddings:
```python
# Au lieu de:
type_idx = logits.argmax(dim=-1)
type_emb = self.embedding(type_idx)  # ❌ Pas de gradient

# Faire:
type_soft = F.gumbel_softmax(logits, tau=0.5, hard=False)
type_emb = type_soft @ self.embedding.weight  # ✅ Gradient flow
```

**Problème 2: Mode Collapse**

Après correction du gradient, la loss descendait (0.52) mais...

**Résultats V2 reconstruction-only (50 epochs)**:

| Métrique | Valeur |
|----------|--------|
| Mag Error | 8.58 |
| Phase Error | 66.7° |
| Circuits valides | 76% |

**Diagnostic**: Le modèle génère des circuits **dégénérés**:
```
Circuit prédit: C(1e-8) entre 5-2, C(1e-8) entre 5-2, C(1e-8) entre 5-2, ...
→ Même composant répété 10 fois!
```

**Conclusion**: Sans supervision structurelle, le modèle trouve des "hacks" qui minimisent la loss sans générer de vrais circuits.

---

### Comparaison Finale des Approches

| Approche | Mag Error | Phase Error | Circuits valides | Status |
|----------|-----------|-------------|------------------|--------|
| V1 supervisé (N=1) | 3.05 | 59.2° | ~98% | Baseline |
| **Best-of-N (N=50)** | **0.35** | **11.6°** | ~98% | **GAGNANT** |
| V2 recon-only | 8.58 | 66.7° | 76% | Mode collapse |

### Leçons apprises

1. **REINFORCE sans pré-training = échec** (mode collapse immédiat)
2. **Reconstruction loss seule = échec** (circuits dégénérés)
3. **Best-of-N = solution simple et efficace** (+88.5% amélioration)
4. **Le supervisé reste la base solide** sur laquelle construire

---

## 7.6 Note technique: Gumbel-Softmax

Pour que les gradients passent à travers un sampling discret:

```python
# Standard softmax (pas de gradient pour argmax)
probs = F.softmax(logits, dim=-1)
idx = probs.argmax(dim=-1)  # ❌ Non différentiable

# Gumbel-Softmax (gradient flow)
gumbel_probs = F.gumbel_softmax(logits, tau=0.5, hard=False)
# gumbel_probs est "soft" mais approche one-hot quand tau → 0

# Soft embedding (multiplication matricielle au lieu de lookup)
embedding = gumbel_probs @ embedding_matrix.weight  # ✅ Différentiable
```

**Température τ**:
- τ = 1.0: Distribution douce (exploration)
- τ = 0.1: Proche de one-hot (exploitation)
- Annealing: τ décroît pendant le training

---

## 7.7 Prochaines étapes

### En cours
1. **Dataset 500k** - Génération sur OVH (~45 min)
2. **Training V1 sur 500k** - Plus de données = meilleure généralisation
3. **Évaluation Best-of-N=100** - Pousser les performances

### Améliorations futures
1. **Forward Model pour Best-of-N** - Remplacer MNA solver (20× plus rapide)
2. **Beam Search** - Au lieu de sampling aléatoire
3. **Hybrid V2** - Supervised + Reconstruction (éviter mode collapse)

### Extensions possibles
- Plus de composants (>10)
- Topologies complexes (ponts, filtres multi-étages)
- Composants actifs (transistors)
- Circuits non-linéaires

---

# Annexes

## A. Formules MNA

L'impédance d'entrée est calculée par:

```
Y·V = I

où:
- Y = matrice d'admittance (n×n)
- V = vecteur tensions nodales
- I = vecteur courants injectés (1A au nœud IN)

Z_in = V[IN] / I[IN] = V[IN] (car I[IN] = 1A)
```

Admittances des composants:
```
Y_R = 1/R
Y_L = 1/(jωL)
Y_C = jωC
```

## B. Références

1. **Transformers**: Vaswani et al., "Attention Is All You Need" (2017)
2. **SMILES**: Weininger, "SMILES notation" (1988)
3. **MolGPT**: Bagal et al., "MolGPT" (2021)
4. **INSIGHT**: "Universal Neural Simulator" (2024)
5. **AutoGraph**: "Autoregressive Transformers for Graphs" (2024)

---

*Document généré par Claude, Janvier 2026*
