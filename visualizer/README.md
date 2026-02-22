# visualizer/ — Outils de visualisation

Scripts pour dessiner des circuits et visualiser les predictions du modele.

## Installation

```bash
cd visualizer
pip install -r requirements.txt
```

Dependances : `matplotlib`, `numpy`, `networkx`, `torch`

## Utilisation

### Demo rapide

```bash
python demo.py
```

Genere quelques circuits et affiche leurs schemas.

### Visualiser les predictions du modele

```bash
python visualize_predictions.py --checkpoint ../ml/outputs/checkpoints/best_v5.pt
```

Affiche cote a cote la courbe Z(f) cible et la prediction du modele.

## Fichiers

| Fichier | Role |
|---------|------|
| `demo.py` | Demonstration : genere et affiche des circuits |
| `visualize_predictions.py` | Compare predictions du modele vs cibles |
| `circuit_drawer.py` | Dessine un circuit (noeuds + composants) avec matplotlib |
