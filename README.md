# Synthese de circuits equivalents par IA

Projet de Recherche et d'Innovation (PRI) — 5A ISIE, Polytech Tours, 2025-2026

**Auteur** : Bilel AAZZOUZ
**Encadrants** : Frederic Rayar, Yannick Kergossien, Ismail Aouichak

---

## Le projet en une phrase

A partir d'une courbe d'impedance Z(f), predire automatiquement le circuit electrique equivalent (composants R, L, C et connexions) grace au deep learning.

## Structure du depot

```
circuit_synthesis_ai/
├── ml/                  # Code machine learning (entrainement, donnees, modeles)
├── web/                 # Application web (backend FastAPI + frontend Next.js)
├── slideshow/           # Slides de soutenance (Next.js + Framer Motion)
├── video/               # Video de presentation (Remotion)
├── visualizer/          # Outils de visualisation de circuits
├── livrables/           # Modele final + datasets (prets a l'emploi)
└── docs/                # Rapport et documentation
```

Chaque dossier contient son propre README avec les instructions de lancement.

## Lancement rapide

### 1. Tester le modele via l'application web

C'est la facon la plus simple de voir le projet en action :

```bash
# Terminal 1 : Backend
cd web/backend
pip install -r requirements.txt
python main.py
# -> http://localhost:8000

# Terminal 2 : Frontend
cd web/frontend
npm install
npm run dev
# -> http://localhost:3000
```

Ouvrir http://localhost:3000, choisir un preset (ex: "RLC Serie"), cliquer "Generate".

> **Note** : Le backend a besoin du modele V5. Par defaut il cherche dans `../ml/outputs/checkpoints/best_v5.pt`. Voir [web/README.md](web/README.md) pour configurer le chemin.

### 2. Entrainer le modele

```bash
cd ml
pip install -r requirements.txt

# Generer un dataset (150k circuits)
python generate_dataset_v4.py --num-samples 150000 --output outputs/dataset.pt

# Entrainer
python scripts/train_v7.py --data outputs/dataset.pt --output-dir outputs/training --epochs 100
```

Voir [ml/README.md](ml/README.md) pour le detail.

### 3. Voir les slides

```bash
cd slideshow
npm install
npm run dev
# -> http://localhost:3000
```

Voir [slideshow/README.md](slideshow/README.md).

### 4. Voir la video

```bash
cd video
npm install
npx remotion preview
```

Voir [video/README.md](video/README.md).

## Architecture du modele

- **Encoder** : CNN 1D (Conv1d 2 → 64 → 128 → 256, puis MLP → latent 256D)
- **Decoder** : Transformer autoregressif (6 couches, 8 tetes, d_model=512)
- **Contrainte** : Masking node_b != node_a pour empecher les self-loops
- **Sortie** : Sequence de tokens [type, node_a, node_b, valeur] x 10 composants max
- **Parametres** : 27.7M

## Resultats (modele V5)

| Metrique | Valeur |
|----------|--------|
| Type accuracy | 99.8% |
| Self-loops | 0% |
| Validite circuits | ~40% (brut), ~65% (apres reparation) |
| RMSE best-of-50 | 0.35 |

## Liens vers les sous-READMEs

| Dossier | Description | README |
|---------|-------------|--------|
| `ml/` | Entrainement, generateur, solveur MNA | [ml/README.md](ml/README.md) |
| `web/` | Backend API + Frontend interactif | [web/README.md](web/README.md) |
| `slideshow/` | Presentation de soutenance (43 slides) | [slideshow/README.md](slideshow/README.md) |
| `video/` | Video de demo (Remotion) | [video/README.md](video/README.md) |
| `visualizer/` | Outils de dessin de circuits | [visualizer/README.md](visualizer/README.md) |
| `livrables/` | Modele V5 + datasets prets a l'emploi | [livrables/README.md](livrables/README.md) |
| `docs/` | Rapport final | [docs/README.md](docs/README.md) |

## Prerequis

- **Python 3.10+** avec PyTorch 2.x
- **Node.js 18+** (pour le frontend, slideshow, video)
- **GPU** recommande pour l'entrainement (NVIDIA avec CUDA). L'inference fonctionne sur CPU.
