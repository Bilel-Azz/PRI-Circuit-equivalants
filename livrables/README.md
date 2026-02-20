# Livrables — Projet PRI : Synthese de circuits equivalents par IA

**Auteur** : Bilel AAZZOUZ
**Encadrants** : Frederic Rayar, Yannick Kergossien, Ismail Aouichak
**Formation** : PRI 5A, Polytech Tours, 2025-2026

---

## Structure des livrables

```
livrables/
|-- README.md                  (ce fichier)
|-- modeles/
|   |-- model_v5_best.pt       (meilleur modele - 106 MB)
|-- datasets/
|   |-- dataset_v3_150k.pt     (dataset equilibre - 142 MB)
|   |-- dataset_v4_150k.pt     (dataset doubles resonances - 142 MB)
```

---

## Modeles

### model_v5_best.pt (V5 — Meilleur modele)

- **Architecture** : CNN Encoder (Conv1d 2->64->128->256) + Transformer Decoder (6 couches, 8 tetes, d_model=512)
- **Parametres** : 27.7M
- **Entraine sur** : dataset_v3 (150k circuits, 100 epochs)
- **Meilleure epoch** : 94
- **Val loss** : 0.2558
- **Self-loops** : 0% (grace au masking node_b != node_a)
- **Validite brute** : ~40%, apres reparation : ~65%
- **RMSE best-of-50** : 0.35

#### Comment charger le modele

```python
import torch
from models.model_v2 import CircuitTransformerV2
from config import *

model = CircuitTransformerV2()
checkpoint = torch.load("livrables/modeles/model_v5_best.pt", map_location="cpu")
model.load_state_dict(checkpoint["model_state_dict"])
model.eval()
```

---

## Datasets

### Format commun

Chaque dataset est un fichier PyTorch (.pt) contenant un dictionnaire :

```python
data = torch.load("livrables/datasets/dataset_v3_150k.pt")
data["impedances"]  # Tensor (N, 2, 100) - [log10|Z|, phase/pi] x 100 frequences
data["circuits"]    # Tensor (N, 60)     - 10 composants x [type, node_a, node_b, value, pad, pad]
```

- **Frequences** : 100 points log-espaces de 10 Hz a 10 MHz
- **Impedance canal 0** : log10(|Z(f)|)
- **Impedance canal 1** : phase(Z(f)) / pi
- **Circuit** : sequence de tokens [type (0=NONE, 1=R, 2=L, 3=C), node_a, node_b, valeur normalisee]

### dataset_v3_150k.pt (Dataset equilibre)

- **Taille** : 150 000 circuits
- **Distribution** :
  - RLC serie : 20%
  - Tank LC (anti-resonance) : 25%
  - Double resonance : 25%
  - Notch filter : 15%
  - Ladder multi-etages : 15%
- **Generateur** : `data/generator_v4.py` (templates de topologies)
- **Utilise pour** : entrainement du modele V5 (meilleur resultat)

### dataset_v4_150k.pt (Dataset doubles resonances forcees)

- **Taille** : 150 000 circuits
- **Distribution** :
  - 50% doubles resonances marquees (f1/f2 espacees de 2+ decades)
  - 25% circuits simples
  - 25% variations supplementaires
- **Generateur** : `data/generator_v4.py` (mode force)
- **Note** : Ce dataset a cause de l'overfitting sur le modele V6. Le modele V5 entraine sur dataset_v3 reste superieur.

---

## Versions du modele (historique)

| Version | Dataset | Val Loss | Self-loops | Validite | Statut |
|---------|---------|----------|------------|----------|--------|
| V1-V2   | V1 (50k) | ~2.5    | 42%        | 9%       | Abandonne |
| V3      | V1 (50k) | ~1.2    | 20%        | -        | Abandonne |
| V4      | V1 (50k) | ~0.7    | 0%         | 60%      | Decoder contraint |
| **V5**  | **V3 (150k)** | **0.256** | **0%** | **~40%** | **Deploye** |
| V6      | V4 (150k) | 8.5 (diverge) | -    | -        | Overfitting |
| V8-V12  | Varies  | >1.4     | -          | -        | Tous inferieurs a V5 |

---

## Code source

Le code se trouve dans les dossiers suivants du depot :

- `ml/` — Code d'entrainement (modeles, data, training, config)
  - `ml/config.py` — Constantes et hyperparametres
  - `ml/models/model_v2.py` — Architecture du modele V5
  - `ml/data/generator_v4.py` — Generateur de circuits par templates
  - `ml/data/solver.py` — Solveur MNA (calcul d'impedance)
  - `ml/training/loss_v2.py` — Fonction de loss avec penalites
  - `ml/scripts/train_v7.py` — Script d'entrainement
- `web/` — Application web
  - `web/backend/` — API FastAPI (inference, solveur)
  - `web/frontend/` — Interface Next.js + React
- `slideshow/` — Presentation (Next.js + Framer Motion)

---

## Reproduction des resultats

### 1. Installer les dependances

```bash
pip install torch numpy scipy tqdm
```

### 2. Generer un dataset

```bash
cd ml
python generate_dataset_v4.py --num-samples 150000 --output outputs/dataset.pt
```

### 3. Entrainer le modele

```bash
python scripts/train_v7.py --data outputs/dataset.pt --output-dir outputs/training --epochs 100
```

### 4. Lancer le backend

```bash
cd web/backend
pip install fastapi uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 5. Lancer le frontend

```bash
cd web/frontend
npm install && npm run dev
```

---

## Infrastructure

- **Entrainement** : OVH Cloud GPU (RTX 5000 16 GB, CUDA 12.8)
- **Local** : MacBook M3 (MPS backend)
- **Deploiement** : Backend sur OVH, Frontend sur Vercel
