# ml/ — Code Machine Learning

Tout le code d'entrainement, de generation de donnees, et les modeles.

## Structure

```
ml/
├── config.py                  # Constantes et hyperparametres
├── generate_dataset_v3.py     # Generateur de dataset V3
├── generate_dataset_v4.py     # Generateur de dataset V4 (dernier)
├── requirements.txt           # Dependances Python
│
├── data/                      # Donnees et generation
│   ├── circuit.py             # Classe Circuit, validation, conversion vecteur
│   ├── solver.py              # Solveur MNA (calcul impedance Z(f))
│   ├── dataset.py             # PyTorch Dataset loader
│   ├── generator_v2.py        # Generateur aleatoire
│   ├── generator_v3.py        # Generateur par topologies
│   └── generator_v4.py        # Generateur avec doubles resonances forcees
│
├── models/                    # Architectures de modeles
│   ├── model.py               # Modele V1 (baseline)
│   ├── model_v2.py            # Modele V2 (= V5 deploye) — CNN + Transformer
│   ├── encoder.py             # Encoder CNN seul
│   ├── decoder.py             # Decoder Transformer V1
│   ├── decoder_v2.py          # Decoder V2 avec contrainte node_b != node_a
│   └── forward_model.py       # Modele direct (circuit -> impedance)
│
├── training/                  # Entrainement
│   ├── loss.py                # Loss V1 (basique)
│   ├── loss_v2.py             # Loss V2 (+ penalites validite)
│   ├── loss_v3.py             # Loss V3 (experimentale)
│   ├── loss_v3_fast.py        # Loss V3 optimisee
│   └── solver_gpu*.py         # Solveur MNA vectorise sur GPU (4 versions)
│
├── scripts/                   # Scripts d'entrainement et evaluation
│   ├── train.py               # Entrainement V1
│   ├── train_v2.py            # Entrainement V2
│   ├── train_v4.py            # Entrainement V4 (loss V2)
│   ├── train_v7.py            # Entrainement V7 (dernier, utilise pour V5+)
│   ├── evaluate.py            # Evaluation basique
│   ├── evaluate_v2.py         # Evaluation avec metriques detaillees
│   ├── evaluate_best_of_n.py  # Evaluation best-of-N
│   └── train_forward.py       # Entrainement du forward model
│
└── outputs/                   # Checkpoints et datasets (gitignore, sauf livrables/)
    ├── dataset_*.pt           # Datasets generes
    └── checkpoints/           # Modeles entraines
```

## Installation

```bash
cd ml
pip install -r requirements.txt
```

Dependances : `torch>=2.0.0`, `numpy`, `matplotlib`, `tqdm`

## Generer un dataset

```bash
# Dataset V4 (150k circuits, topologies predefinies)
python generate_dataset_v4.py --num-samples 150000 --output outputs/dataset.pt
```

Le generateur cree des circuits selon 5 topologies (RLC serie, tank LC, double resonance, notch, ladder) et calcule leur impedance Z(f) via le solveur MNA.

## Entrainer un modele

```bash
python scripts/train_v7.py \
    --data outputs/dataset.pt \
    --output-dir outputs/training \
    --epochs 100 \
    --batch-size 128 \
    --lr 3e-4
```

Le script sauvegarde automatiquement le meilleur checkpoint (`best.pt`) et un historique d'entrainement (`history.json`).

**GPU recommande** : L'entrainement prend environ 4-5h sur RTX 5000 (16 GB). Sur CPU, compter plusieurs jours.

## Evaluer un modele

```bash
# Evaluation standard
python scripts/evaluate_v2.py --checkpoint outputs/training/checkpoints/best.pt

# Evaluation best-of-N (genere N circuits, garde le meilleur)
python scripts/evaluate_best_of_n.py --checkpoint outputs/training/checkpoints/best.pt --n 50
```

## Fichiers cles

| Fichier | Role |
|---------|------|
| `config.py` | Tous les hyperparametres (MAX_COMPONENTS=10, MAX_NODES=4, latent_dim=256, etc.) |
| `models/model_v2.py` | Architecture du modele deploye (V5) |
| `data/solver.py` | Solveur MNA — calcul de Z(f) a partir d'un circuit |
| `data/circuit.py` | Representation d'un circuit en vecteur + validation |
| `training/loss_v2.py` | Fonction de loss avec penalites de validite |
| `training/solver_gpu_v4.py` | Solveur MNA vectorise (340x plus rapide que la version CPU) |
