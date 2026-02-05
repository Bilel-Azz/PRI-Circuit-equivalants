# Circuit Synthesis AI

Synthèse automatique de circuits RLC à partir de courbes d'impédance Z(f) en utilisant le Deep Learning.

## Architecture

```
circuit_synthesis_ai/
├── ml/                     # Code Machine Learning
│   ├── data/               # Générateurs de circuits, solveur MNA
│   ├── models/             # Encoder CNN + Decoder Transformer
│   ├── training/           # Loss functions, GPU solver
│   └── scripts/            # Entraînement et évaluation
│
├── web/                    # Application Web
│   ├── frontend/           # Next.js React
│   └── backend/            # FastAPI Python
│
├── visualizer/             # Outils de visualisation
│
├── docs/                   # Documentation
│   ├── RAPPORT_PROJET.md   # Rapport complet
│   ├── GENERATEUR.md       # Documentation du générateur
│   └── soutenance/         # Questions de soutenance
│
└── outputs/                # Modèles et datasets (gitignore)
```

## Approche

1. **Génération synthétique** : Créer des circuits RLC aléatoires avec topologies variées
2. **Calcul d'impédance** : Utiliser MNA (Modified Nodal Analysis) pour calculer Z(f)
3. **Entraînement supervisé** : Apprendre la relation inverse Z(f) → Circuit

## Modèle

- **Encoder** : CNN 1D pour extraire les features de la courbe d'impédance
- **Decoder** : Transformer autoregressif pour générer la séquence de composants
- **Contraintes** : Masking pour empêcher les self-loops (node_a ≠ node_b)

## Quick Start

### Entraînement

```bash
cd ml
pip install -r requirements.txt

# Générer un dataset
python generate_dataset_v4.py

# Entraîner le modèle
python scripts/train_v7.py
```

### Application Web

```bash
# Backend
cd web/backend
pip install -r requirements.txt
python main.py

# Frontend (autre terminal)
cd web/frontend
npm install
npm run dev
```

## Performances

| Métrique | Valeur |
|----------|--------|
| Type accuracy | 99.8% |
| Validité circuits | 60% |
| Self-loops | 0% |

## Documentation

- [Rapport complet](docs/RAPPORT_PROJET.md)
- [Détails du générateur](docs/GENERATEUR.md)
- [Questions de soutenance](docs/soutenance/)

## Auteur

Projet de fin d'études - Circuit Synthesis AI
