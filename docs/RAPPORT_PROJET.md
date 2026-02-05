# Rapport de Projet: Synthèse de Circuits Électriques par Deep Learning

## Prédiction de topologies de circuits passifs (R, L, C) à partir de courbes d'impédance Z(f)

**Étudiant**: Bilel Azzabi
**Période**: Décembre 2025 - Janvier 2026
**Projet**: PRI (Projet de Recherche et Innovation)

---

# Table des Matières

1. [Introduction et Objectif](#1-introduction-et-objectif)
2. [Infrastructure: Pourquoi un Serveur Distant](#2-infrastructure-pourquoi-un-serveur-distant)
3. [Approche Technique de Base](#3-approche-technique-de-base)
4. [Parcours du Projet: Problèmes et Solutions](#4-parcours-du-projet-problèmes-et-solutions)
5. [Best-of-N: La Stratégie d'Inférence](#5-best-of-n-la-stratégie-dinférence)
6. [Optimisations GPU](#6-optimisations-gpu)
7. [État Actuel et Résultats](#7-état-actuel-et-résultats)
8. [Conclusion et Perspectives](#8-conclusion-et-perspectives)

---

# 1. Introduction et Objectif

## 1.1 Le Problème à Résoudre

**Objectif**: Créer une IA capable de "deviner" quel circuit électrique produit une courbe d'impédance donnée.

```
ENTRÉE                                    SORTIE
──────                                    ──────
Courbe d'impédance Z(f)                   Circuit équivalent
┌─────────────────┐                       ┌─────────────┐
│     /\          │                       │  R ─── L    │
│    /  \         │     ────────►         │       │     │
│   /    \        │      Modèle IA        │       C     │
│  /      ────────│                       │       │     │
└─────────────────┘                       └─────────────┘
100 fréquences (10Hz à 10MHz)             Composants + connexions
```

**Entrée**: Une courbe avec 100 points (magnitude et phase de l'impédance à différentes fréquences)

**Sortie**: Une liste de composants (R, L, C) avec leurs valeurs et leurs connexions entre les nœuds du circuit

## 1.2 Pourquoi c'est Difficile

### C'est un problème inverse MAL POSÉ

**Point crucial**: Plusieurs circuits différents peuvent produire **exactement la même courbe Z(f)**!

Exemple:
- Un R de 100Ω donne Z = 100Ω
- Deux R de 50Ω en série donnent aussi Z = 100Ω

**Conséquence fondamentale**: Le modèle ne cherche pas LE circuit original, mais UN circuit **fonctionnellement équivalent** qui reproduit la courbe.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CE QUE FAIT LE MODÈLE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Input: Courbe Z(f)                    Output: Circuit ÉQUIVALENT  │
│   ┌─────────────────┐                   ┌─────────────────┐         │
│   │    RL Série     │                   │   R + 2L + C    │         │
│   │  R=470Ω L=10mH  │  ──── IA ────▶   │  (autre topo)   │         │
│   │                 │                   │                 │         │
│   └─────────────────┘                   └─────────────────┘         │
│           │                                     │                   │
│           └──────────── MÊME Z(f) ─────────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Analogie**: "Quel calcul donne 10?"
- 5 × 2 = 10 ✓
- 20 ÷ 2 = 10 ✓
- 7 + 3 = 10 ✓

Toutes les réponses sont correctes! **Ce qui compte, c'est le résultat (la courbe), pas le chemin (la topologie).**

### Défis techniques

| Défi | Explication |
|------|-------------|
| **Plage de valeurs énorme** | R va de 0.1Ω à 10MΩ, C de 1pF à 100µF (**28 ordres de grandeur!**) |
| **Topologie variable** | De 1 à 10 composants, connexions arbitraires |
| **Multi-tâche** | Le modèle doit prédire le TYPE (R/L/C), la VALEUR, et les CONNEXIONS |
| **Circuits valides** | Il ne faut pas de fils qui partent nulle part ou de courts-circuits |

---

# 2. Infrastructure: Pourquoi un Serveur Distant

## 2.1 Le Problème: Pas Assez de Puissance

**Constat initial**: Mon MacBook (CPU uniquement) mettait **plusieurs jours** pour entraîner un modèle sur 100 epochs. C'était impossible de tester rapidement différentes idées.

**Solution**: J'ai loué un serveur GPU chez OVH.

## 2.2 Le Serveur OVH

| Caractéristique | Spécification |
|-----------------|---------------|
| **GPU** | NVIDIA Quadro RTX 5000 (16 GB VRAM) |
| **RAM** | ~28 GB |
| **Adresse** | 57.128.57.31 (Ubuntu) |

**Résultat**: Un entraînement de 100 epochs prend maintenant **3-4 heures** au lieu de plusieurs jours. J'ai pu itérer beaucoup plus vite.

## 2.3 Architecture Déployée

```
Serveur OVH (57.128.57.31)
├── circuit_transformer/     # Code d'entraînement
│   ├── models/             # Architectures neuronales
│   ├── training/           # Scripts de training + loss
│   ├── data/               # Générateurs de datasets
│   └── outputs/            # Modèles et datasets générés
│
└── circuit_web_backend/    # API REST (FastAPI)
    └── main.py             # Endpoints pour l'interface web

Machine locale (MacBook)
└── Interface React         # Pour tester le modèle visuellement
```

---

# 3. Approche Technique de Base

## 3.1 Données 100% Synthétiques

**Problème**: Il n'existe pas de dataset public avec des circuits et leurs courbes d'impédance.

**Solution**: Générer les données synthétiquement:
1. Créer un circuit aléatoire (composants + connexions)
2. Calculer sa courbe Z(f) avec un solveur MNA (Modified Nodal Analysis)
3. Former une paire (courbe, circuit) pour l'entraînement

**Avantage**: Dataset illimité, ground truth parfait.

**Inconvénient majeur** (on le verra plus tard): **Le modèle n'apprend que ce qu'on lui montre**. Si le dataset est biaisé, le modèle sera biaisé.

## 3.2 Le Solveur MNA

Le solveur calcule l'impédance en résolvant un système linéaire:
```
Y · V = I

où:
- Y = matrice d'admittance (construite à partir des composants)
- V = tensions aux nœuds (à trouver)
- I = courants injectés (on injecte 1A à l'entrée)

Admittances des composants:
- Résistance:  Y_R = 1/R
- Inductance:  Y_L = 1/(jωL) = -j/(ωL)
- Capacité:    Y_C = jωC

Impédance = V[entrée] / I[entrée]
```

## 3.3 Représentation des Circuits: Le Choix Crucial

### Pourquoi la représentation est critique

Un circuit est un **graphe** (nœuds + arêtes). Mais les réseaux de neurones travaillent avec des **tenseurs de taille fixe**. Comment convertir?

### Approche matricielle (ÉCHEC)

**Première idée**: Représenter le circuit comme une matrice 8×8.

```
edge_types[i,j] = type du composant entre nœuds i et j
                  0=NONE, 1=R, 2=L, 3=C
```

**Pourquoi ça a échoué**: Sur 64 positions (8×8), environ **90% sont NONE** (pas de composant).

```
Exemple circuit 5 composants:
[0 1 0 0 0 0 0 0]    ← 1 seul composant sur cette ligne
[1 0 2 0 0 0 0 0]
[0 2 0 3 0 0 0 0]    Le modèle doit prédire 64 positions
[0 0 3 0 0 0 0 0]    dont 59 sont "NONE"
[0 0 0 0 0 0 0 0]
...                   → Le modèle apprend à prédire NONE partout!
```

### Approche séquentielle (SUCCÈS)

**Idée**: Représenter le circuit comme une **séquence de tokens** (inspiré de SMILES pour les molécules en chimie).

```
[START, Composant1, Composant2, ..., END, PAD, PAD, ...]

Chaque composant = [TYPE, NODE_A, NODE_B, VALEUR]

Exemple:
- R(100Ω) entre nœuds 0-1, L(1mH) entre nœuds 1-2
- → [START, [R,0,1,100], [L,1,2,0.001], END]
```

**Avantage énorme**: 100% des positions sont utiles (vs 10% pour les matrices).

### Normalisation des valeurs

**Problème**: Les valeurs couvrent 28 ordres de grandeur!

**Solution**: Normaliser autour de valeurs typiques.

```python
VALUE_CENTER = {
    R: 3.0,   # Centre = 1kΩ = 10³
    L: -4.0,  # Centre = 100µH = 10⁻⁴
    C: -8.0,  # Centre = 10nF = 10⁻⁸
}

normalized_value = log10(value) - VALUE_CENTER[type]
# Résultat: valeurs entre -4 et +4 (faciles à apprendre)
```

## 3.4 Architecture du Modèle

```
Courbe Z(f)           Encoder CNN              Decoder Transformer
(2, 100)        →     (convolutions)      →    (attention)
                           ↓                         ↓
                      Vecteur latent           Séquence de tokens
                        (256 dim)              [type, node_a, node_b, value]
```

**Architecture complète**:
- **Encoder CNN**: Conv1d(2→64→128→256) + FC(→256)
- **Decoder Transformer**: 6 couches, 8 têtes d'attention, d_model=512
- **Têtes de prédiction**:
  - type_head: Linear(512 → 6) — R, L, C, START, END, PAD
  - node_a_head: Linear(512 → 8) — nœuds 0-7
  - node_b_head: Linear(512 → 8) — nœuds 0-7
  - value_head: Linear(512 → 1) — valeur normalisée

**Paramètres totaux**: 27.7 millions

---

# 4. Parcours du Projet: Problèmes et Solutions

Cette section raconte **chronologiquement** comment le projet a évolué, avec pour chaque étape: **le problème rencontré**, **pourquoi la solution semblait bonne**, et **si ça a marché ou pas**.

---

## 4.1 Phase 1: Tentatives Initiales (Début Décembre) — ÉCHECS

### 4.1.1 Tentative: Solveur Différentiable

**L'idée**: Rendre le calcul de Z(f) différentiable pour faire du backpropagation directement à travers le solveur.

**Pourquoi ça semblait une bonne idée**: Pas besoin de dataset! On optimise directement "quel circuit donne cette courbe".

**Ce qui s'est passé**: **ÉCHEC total**. Les valeurs des composants couvrent 28 ordres de grandeur. Quand on fait passer les gradients à travers l'inversion de matrice (`torch.linalg.solve`), ils explosent ou disparaissent. Instabilité numérique totale.

### 4.1.2 Tentative: REINFORCE sans Pré-training

**L'idée**: Utiliser du reinforcement learning (policy gradients). Le modèle génère des circuits, on calcule la récompense (erreur sur la courbe), et on optimise.

**Pourquoi ça semblait une bonne idée**: Pas besoin de supervision explicite.

**Ce qui s'est passé**: **ÉCHEC — Mode collapse**. Sans pré-training supervisé, le modèle ne sait pas générer de circuits valides. Les rewards sont tous ~0 au début, donc pas de signal d'apprentissage. Le modèle finit par toujours générer le même circuit (un simple condensateur) car c'est un minimum local qui donne une récompense "acceptable".

### 4.1.3 Tentative: Représentation Matricielle (8×8)

**L'idée**: Représenter le circuit comme une matrice d'adjacence.

**Pourquoi ça semblait une bonne idée**: C'est la représentation naturelle d'un graphe.

**Ce qui s'est passé**: **ÉCHEC**. 90% des cases sont vides. Le modèle apprend à prédire "vide" partout — c'est la solution triviale qui minimise la loss.

### Décision clé

**Après ces échecs, j'ai abandonné les approches "fancy" (end-to-end, RL) et adopté l'approche supervisée classique avec représentation séquentielle.**

---

## 4.2 Phase 2: Premier Modèle Fonctionnel (Mi-Décembre)

### Dataset V1: Premier Dataset (50k samples)

**Approche**: Générer des circuits complètement aléatoires avec le solveur MNA.

**Ce qui a été fait**:
- Nombre de composants: 1 à 6 (aléatoire)
- Types: R, L, C (aléatoire)
- Valeurs: distribution log-uniforme
- Connexions: aléatoires entre 4 nœuds

### Model V1-V2: Heads Indépendantes

**Architecture**: Encoder CNN + Decoder Transformer avec 4 têtes de prédiction **indépendantes**:
- type_head → prédit R/L/C
- node_a_head → prédit le premier nœud
- node_b_head → prédit le deuxième nœud
- value_head → prédit la valeur

### Le Problème: 91% de Circuits INVALIDES !

**Constat choquant**: Le modèle génère des circuits physiquement impossibles:

| Problème | Fréquence | Explication |
|----------|-----------|-------------|
| **Self-loops** | 42% | node_a = node_b (composant relié à lui-même!) |
| **Connexions dupliquées** | 31% | Deux composants identiques entre les mêmes nœuds |
| **Nœuds flottants** | 9% | Fils qui ne mènent nulle part |
| **Autres invalides** | 9% | Graphe non connexe, etc. |

**Pourquoi?** Les têtes sont indépendantes. Quand le modèle prédit node_a=2, **rien ne l'empêche de prédire node_b=2 aussi** → self-loop. C'est un bug architectural fondamental.

---

## 4.3 Phase 3: Résoudre les Self-Loops (Fin Décembre)

### Le Problème Précis

42% des circuits ont des self-loops (composant relié à lui-même). C'est physiquement impossible et rend le circuit invalide. C'est le problème numéro 1 à résoudre.

### Première Tentative: Pénalités dans la Loss

**L'idée**: Ajouter une pénalité dans la loss quand node_a = node_b.

```python
loss = standard_loss + 10 * self_loop_penalty
```

**Résultat**: **Insuffisant**. Les self-loops diminuent (42% → 25%) mais ne disparaissent pas. Le modèle "essaie" d'éviter les self-loops mais n'y arrive pas toujours.

**Pourquoi?** Une pénalité **encourage** à éviter, mais ne **garantit** pas. C'est comme mettre une amende pour excès de vitesse — ça réduit mais n'élimine pas.

### Solution: Constrained Decoder (Model V4)

**L'idée révolutionnaire**: Au lieu d'encourager, **rendre IMPOSSIBLE** de prédire node_b = node_a.

**Comment?** Le decoder prédit node_b **conditionnellement** à node_a, avec un **masking** qui met les logits de node_a à -∞.

```python
# AVANT (V1-V2): Prédictions indépendantes
node_a = argmax(node_a_head(hidden))
node_b = argmax(node_b_head(hidden))  # Peut être = node_a!

# APRÈS (V4): Prédiction conditionnelle avec masking
node_a = argmax(node_a_head(hidden))
# On concatène l'info de node_a avant de prédire node_b
node_b_input = concat(hidden, one_hot(node_a))
node_b_logits = node_b_head(node_b_input)
node_b_logits[node_a] = -inf  # INTERDIT de prédire node_b = node_a
node_b = argmax(node_b_logits)
```

### Résultat: Self-Loops ÉLIMINÉS !

| Métrique | V1-V2 | V4 |
|----------|-------|-----|
| **Self-loops** | 42% | **0%** |
| Circuits valides | 9% | 60% |
| Type accuracy | 94.8% | 97.2% |

**Leçon fondamentale**: **Les contraintes architecturales sont bien plus efficaces que les pénalités dans la loss.** Le masking **garantit** l'absence de self-loops — ce n'est pas une question d'optimisation.

---

## 4.4 Phase 4: Le Problème des Circuits "Trop Simples" (Début Janvier)

### Observation Inquiétante

Avec le Dataset V1, le modèle marche bien sur les circuits simples (RLC série, RC, RL). Mais quand je lui donne une courbe **complexe** (double résonance par exemple), il génère... un circuit simple qui "approxime" la courbe!

```
Courbe cible: Double résonance          Ce que le modèle prédit: RLC simple
      ___                                      ___
     /   \                                    /   \
____/     \____                            __/     \____
         /\
        /  \                              ← Le deuxième pic est IGNORÉ!
       /    \
```

### Pourquoi le Modèle "Lisse" les Courbes?

**Analyse du Dataset V1**:
```
Distribution des circuits dans V1:
- R seul: 18.8%
- L seul: 18.9%
- C seul: 18.9%
- Circuits avec R+L+C: seulement 9.9%!
- Circuits simples (≤3 comp): 46.1%
```

**Le problème**: La majorité des circuits sont simples (1-3 composants). Le modèle a appris que:
1. Un circuit simple donne une erreur "acceptable" sur TOUTES les courbes
2. Pourquoi risquer de prédire un circuit complexe qui pourrait être faux?

**Le modèle prend le chemin de moindre résistance**: Prédire un RLC simple est "safe". C'est comme un élève qui répond toujours "je ne sais pas" — il n'a jamais tort!

### Dataset V2: Tentative d'Équilibrage (100k samples)

**L'idée**: Augmenter le dataset et essayer d'équilibrer les types.

**Résultat**: **Insuffisant**. Le générateur aléatoire produit naturellement plus de circuits simples. Même avec 100k samples, la distribution reste biaisée.

### Dataset V3: Distribution FORCÉE (150k samples)

**L'idée**: Ne plus compter sur le hasard. Créer un générateur qui **force** une distribution spécifique:

| Type de circuit | % du dataset | Pourquoi? |
|-----------------|--------------|-----------|
| RLC série résonant | 20% | Cas de base, bien maîtrisé |
| Tank LC (anti-résonant) | 25% | Importante famille à apprendre |
| Double résonance | 25% | Le cas difficile qu'on veut résoudre |
| Notch filter | 15% | Autre pattern important |
| Circuits complexes | 15% | Pour la généralisation |

**Ce qui a été fait**:
- Générateur V3 avec **templates** de circuits pour chaque type
- 150k samples
- **Validation** que chaque type est bien représenté

### Model V5: Entraîné sur Dataset V3

**Résultats**:

| Métrique | Valeur |
|----------|--------|
| Type accuracy | **99.8%** |
| Self-loops | **0%** |
| Circuits valides | 36-42% |

**Amélioration**: Le modèle reconnaît maintenant les **tanks LC**! C'est un premier succès sur un pattern qui n'était pas dans V1.

### MAIS... Le Problème Persiste pour les Double Résonances!

**Observation**: Même avec Dataset V3 (25% de double résonances), le modèle "lisse" souvent ces courbes.

**Analyse plus poussée**: En regardant les courbes de double résonance du Dataset V3, on se rend compte qu'elles sont **trop subtiles**:
- Les deux fréquences de résonance f1 et f2 sont souvent **proches** (ex: 1kHz et 3kHz)
- Le Q (facteur de qualité) est **élevé** → pics très **étroits**
- Visuellement, ça ressemble presque à une simple résonance avec du bruit!

**Le modèle ne voit pas la différence** entre une double résonance subtile et un RLC simple avec un peu de bruit. Et comme un RLC simple a une loss acceptable... il choisit le simple.

---

## 4.5 Phase 5: Dataset V4 — Résonances TRÈS Marquées (Mi-Janvier)

### Le Raisonnement

Si le modèle confond les double résonances avec des RLC simples, c'est parce que **les courbes se ressemblent trop**.

Solution: Générer des double résonances **IMPOSSIBLES À CONFONDRE** avec un RLC simple.

### Modifications du Générateur V4

| Paramètre | Dataset V3 | Dataset V4 | Pourquoi? |
|-----------|------------|------------|-----------|
| Écart f1/f2 | Variable | **2+ décades minimum** | Ex: 100Hz et 10kHz (pas 1kHz et 3kHz) |
| Q factor | Élevé (20-50) | **Modéré (5-15)** | Pics **larges** et visibles, pas des aiguilles |
| % double résonances | 25% | **50%** | Forcer le modèle à vraiment apprendre ce pattern |

**Objectif**: Que visuellement, une double résonance soit **IMPOSSIBLE** à confondre avec un RLC simple.

### Model V6: Overfit CATASTROPHIQUE

**Entraînement**: Model V5 re-entraîné sur Dataset V4, 100 epochs.

**Résultat**: **ÉCHEC — Overfitting sévère**

| Epoch | Val Loss | Type Accuracy |
|-------|----------|---------------|
| 1 | 0.255 | 100% |
| 6 (meilleur) | **0.226** | 99.9% |
| 15 | 4.294 | 85.9% |
| 26 | **8.5** | **66%** |

Le modèle a commencé à **mémoriser** le dataset au lieu d'apprendre des patterns généralisables. La train loss reste stable (~0.4) mais la val loss explose!

### Pourquoi l'Overfitting?

**Cause identifiée**: Le "tau annealing" (température du sampling) descend **trop vite**.

```python
# V6: Tau descend trop vite
tau = max(0.5, 1.0 - 0.005 * epoch)  # Atteint 0.5 à epoch 100

# Le modèle devient trop "confiant" trop tôt
# → Il mémorise les exemples au lieu de généraliser
```

**Autre hypothèse**: Dataset V4 est plus "homogène" (50% du même type) donc plus facile à mémoriser.

**Décision**: Revenir au Model V5 en production (il marche) et retravailler V7 avec:
- Tau annealing plus lent (floor à 0.7 au lieu de 0.5)
- Early stopping
- Plus de régularisation

---

## 4.6 Phase 6: Model V7 — Loss avec Dérivées (Cette semaine)

### L'Idée Centrale

**Problème non résolu**: Le modèle "lisse" les courbes complexes.

**Observation**: La loss MSE classique compare **point par point**. Elle ne "voit" pas la **forme** de la courbe.

```
Courbe 1: ────/\────────    (un pic)
Courbe 2: ────/\───/\───    (deux pics)

Si le pic manquant est "petit", la MSE peut être faible!
Le modèle ne voit pas qu'il manque un pic.
```

**Solution**: Ajouter les **dérivées** dans la loss pour capturer la forme.

```python
# Loss classique: Compare uniquement les valeurs
loss = MSE(Z_pred, Z_target)

# Loss V3: Compare aussi la FORME (pente et courbure)
d1_pred = Z_pred[:, 1:] - Z_pred[:, :-1]   # 1ère dérivée = pente
d1_target = Z_target[:, 1:] - Z_target[:, :-1]
d2_pred = d1_pred[:, 1:] - d1_pred[:, :-1]  # 2ème dérivée = courbure
d2_target = d1_target[:, 1:] - d1_target[:, :-1]

loss = MSE(Z) + 0.5 * MSE(d1) + 0.3 * MSE(d2)
```

**Intuition**: Si le modèle génère un RLC simple pour une double résonance:
- La courbe peut être "proche" en valeur → MSE(Z) faible
- Mais les **dérivées seront très différentes** (pic manquant = pente différente) → MSE(d1), MSE(d2) élevés

### Premier Test V7: Petit Dataset (15k)

Pour tester rapidement, j'ai entraîné V7 sur un petit dataset de 15k samples.

**Résultat de l'entraînement**:
- Type accuracy: 100%
- Val loss: 13.99
- Temps: ~7 minutes (grâce aux optimisations GPU!)

### Le Problème: CATASTROPHE en Production

Quand j'ai déployé V7 sur l'API et testé avec l'interface web:

- **90% des circuits générés sont vides ou invalides**
- Pour une double résonance, le modèle sort **une seule résistance**
- Les courbes prédites sont des **lignes droites**

**Comparaison V5 vs V7 sur un test RLC**:
```
V5: 3 composants valides [R, L, C] avec nodes corrects
V7: 1 composant avec node invalide (0, 7) → circuit vide
```

### Analyse du Problème V7

**Cause identifiée**: Le dataset de 15k samples est **beaucoup trop petit**. Le modèle n'a pas vu assez d'exemples pour généraliser. Il a "appris" des patterns incorrects.

**Décision actuelle**:
1. **Revenir à V5 en production** (il marche)
2. **Relancer V7 sur le dataset complet** (150k samples)
3. Ajouter **early stopping** pour éviter l'overfitting

**Statut**: En cours — à suivre.

---

# 5. Best-of-N: La Stratégie d'Inférence

## 5.1 Le Problème avec N=1

Avec une seule génération (N=1), le modèle donne un circuit qui est "correct en moyenne" mais rarement optimal pour un cas particulier.

**Résultats typiques N=1**:
- Erreur magnitude: ~3.0
- Erreur phase: ~60°

## 5.2 L'Idée du Best-of-N

**Principe simple**: Générer N circuits différents, garder le meilleur!

```
Pour chaque courbe Z(f) cible:
  1. Générer N circuits candidats (avec températures variées)
  2. Pour chaque candidat:
     - Calculer Z(f) du circuit via MNA solver
     - Mesurer erreur = ||Z_pred - Z_target||
  3. Garder le circuit avec la plus petite erreur
```

### Pourquoi ça marche?

Le modèle génère des circuits **diversifiés** grâce à:
- L'échantillonnage stochastique (softmax avec température)
- La variation de température (τ = 0.3 à 1.0)

Parmi N candidats, au moins un sera proche de la cible!

## 5.3 Est-ce que c'est de la "triche"?

### Arguments CONTRE

1. **Temps d'inférence × N**: On fait N fois plus de calculs
2. **On utilise le solver MNA**: On a accès à la "vraie" fonction Z(f)
3. **Le modèle ne s'améliore pas**: On ne fait que chercher parmi ses outputs

### Arguments POUR (pourquoi c'est légitime)

1. **C'est une technique standard**:
   - **Beam search** en NLP (génère plusieurs phrases, garde la meilleure)
   - **MCTS** en RL (explore plusieurs trajectoires)
   - **Rejection sampling** en statistiques

2. **Le modèle fait le travail dur**:
   - Sans bon modèle, même N=1000 ne trouverait pas de bon circuit
   - Le modèle génère des candidats **plausibles**, pas aléatoires

3. **Le solver MNA est juste une vérification**:
   - C'est comme vérifier qu'un code compile
   - On pourrait le remplacer par un Forward Model appris

### Conclusion: Ce n'est PAS de la triche

Best-of-N est une **stratégie d'inférence légitime** qui exploite la diversité du modèle. C'est analogue à un humain qui dessine plusieurs circuits et garde le meilleur.

## 5.4 Résultats Best-of-N

| N | Erreur Magnitude | Erreur Phase | Amélioration vs N=1 |
|---|------------------|--------------|---------------------|
| 1 | 3.05 | 59.2° | baseline |
| 10 | 0.71 | 17.5° | **+76.7%** |
| 50 | 0.35 | 11.6° | **+88.5%** |
| 100 | 0.31 | 13.6° | **+89.8%** |

**Observation**: L'amélioration sature vers N=100. Au-delà, le gain est marginal.

---

# 6. Optimisations GPU

## 6.1 Le Problème: Entraînement BEAUCOUP Trop Lent

Pendant le développement de V7, j'ai constaté que l'entraînement était **extrêmement lent**: **~1.7 secondes par batch**!

Pour 100 epochs sur 150k samples avec batch_size=128, ça fait **~8 heures** d'entraînement. Inacceptable pour itérer rapidement.

## 6.2 Profiling: Identifier le Goulot d'Étranglement

J'ai profilé le code pour voir où part le temps:

| Composant | Temps | % du total |
|-----------|-------|------------|
| Forward model | 97ms | 5.7% |
| **Solver MNA** | **1700ms** | **100%** |
| Loss | 193ms | 11.4% |

**Le solveur MNA est le goulot d'étranglement.**

## 6.3 Pourquoi le Solveur était Lent

Le code original utilisait des **boucles Python** pour construire les matrices d'admittance:

```python
# AVANT: Triple boucle Python (TRÈS lent!)
for b in range(batch_size):
    for s in range(seq_len):
        for f in range(num_freq):
            Y[b, f, i, j] += admittance
```

Chaque boucle Python a un **overhead énorme** comparé aux opérations tensor natives.

## 6.4 Solution: Vectorisation Complète (solver_gpu_v4.py)

**Idée**: Remplacer TOUTES les boucles par des opérations tensorielles PyTorch.

```python
# APRÈS: Opérations vectorisées (TRÈS rapide!)
omega = torch.tensor(2 * pi * frequencies)  # (F,)
Y_L = -1.0 / (omega * L_values)  # (B, S, F) vectorisé en une ligne

# Stamp avec scatter_add au lieu de boucles
Y_flat.index_put_((indices,), values, accumulate=True)
```

**Résultat**: **Solver 350x plus rapide** (1700ms → 5ms)

## 6.5 La Loss aussi était Lente

La loss utilisait aussi des boucles pour calculer les pénalités de validité:

```python
# AVANT: Triple boucle
for b in range(batch_size):
    for s1 in range(seq_len):
        for s2 in range(s1+1, seq_len):
            overlap = compute_overlap(s1, s2)
```

**Solution**: Utiliser `einsum` pour calculer tous les overlaps en une seule opération:

```python
# APRÈS: Une seule opération einsum
edge_flat = edge_probs.reshape(B, S, -1)
overlap = torch.einsum('bsi,bti->bst', edge_flat, edge_flat)
```

**Résultat**: **Loss 120x plus rapide** (193ms → 1.6ms)

## 6.6 Impact Final sur l'Entraînement

| Configuration | Temps/Batch | 100 Epochs |
|---------------|-------------|------------|
| Original (boucles Python) | ~1.7s | ~8 heures |
| **Optimisé (vectorisé)** | **~290ms** | **~1.5 heures** |

**Speedup total: ~6x**

Maintenant je peux itérer beaucoup plus vite sur les expériences!

---

# 7. État Actuel et Résultats

## 7.1 Modèle en Production: V5

Le modèle V5 est actuellement déployé sur l'API. Voici ses performances:

| Métrique | Valeur |
|----------|--------|
| Type accuracy | **99.8%** |
| Self-loops | **0%** |
| Circuits valides | 36-42% |
| Erreur (RMSE) avec Best-of-50 | ~0.3 |

## 7.2 Ce Qui Marche Bien

| Type de circuit | Performance |
|-----------------|-------------|
| RLC série | Excellent |
| RC, RL simples | Excellent |
| Tank LC | Bon (grâce au Dataset V3) |
| Notch filters | Correct |

## 7.3 Ce Qui Ne Marche Pas Encore

| Problème | Explication |
|----------|-------------|
| **Double résonances** | Le modèle génère souvent un RLC simple (lisse la 2ème résonance) |
| **Circuits complexes (>5 comp.)** | Tendance à simplifier |
| **Taux de validité** | 36-42% seulement (duplicates encore présents) |

## 7.4 Comparaison 50k vs 500k

Une observation surprenante: le modèle entraîné sur **50k samples** est souvent **meilleur** que celui sur 500k!

| Sample Test | 50k Error | 500k Error | Gagnant |
|-------------|-----------|------------|---------|
| 0 | 0.721 | 0.382 | 500k |
| 20 | **0.095** | 0.217 | **50k** |
| 50 | **0.071** | 0.147 | **50k** |
| 80 | **0.144** | 0.389 | **50k** |

**Le 50k gagne 3/4 des tests!**

**Hypothèse**: 27.7M paramètres ne suffisent pas pour 500k patterns. Un dataset plus petit permet une meilleure spécialisation.

**Leçon**: **Plus de données ≠ toujours mieux.** Il faut adapter la capacité du modèle au dataset.

---

# 8. Conclusion et Perspectives

## 8.1 Résumé du Parcours

| Phase | Problème | Solution Tentée | Résultat |
|-------|----------|-----------------|----------|
| 1 | Approches end-to-end échouent | Passer au supervisé | ✓ Fonctionnel |
| 2 | 91% circuits invalides | Constrained decoder | ✓ Self-loops 0% |
| 3 | Circuits trop simples | Dataset V3 équilibré | ✓ Tanks LC reconnus |
| 4 | Double résonances lissées | Dataset V4 marqué | ✗ Overfitting (V6) |
| 5 | Entraînement trop lent | Vectorisation GPU | ✓ 350x plus rapide |
| 6 | Loss ne voit pas la forme | Loss avec dérivées | ? V7 en test |

## 8.2 Leçons Apprises

### 1. Les contraintes architecturales > les pénalités dans la loss

Le masking **garantit** 0% de self-loops. Une pénalité ne fait que "décourager".

### 2. La distribution du dataset est CRITIQUE

Le modèle apprend **exactement** ce qu'on lui montre. Si 80% du dataset = RLC simple, le modèle prédit des RLC simples.

### 3. Le modèle prend le chemin de moindre résistance

Un circuit simple qui "approxime" une courbe complexe = loss acceptable. Il faut **forcer** le modèle à voir la différence.

### 4. Plus de données ≠ toujours mieux

V6 a overfit sur Dataset V4. La **qualité et la distribution** comptent plus que la quantité.

### 5. Profiler avant d'optimiser

Le goulot d'étranglement n'était pas où je pensais (le modèle) mais dans le solver MNA.

## 8.3 Prochaines Étapes

1. **Finir V7**: Entraîner sur dataset complet avec early stopping
2. **Améliorer la validité**: Passer de 40% à 80%+ de circuits valides (résoudre les duplicates)
3. **Tester sur données réelles**: Comparer avec des mesures de vrais circuits

## 8.4 Bilan Personnel

Ce projet m'a appris énormément sur:
- La gestion d'infrastructure (serveur distant, API, déploiement)
- Les subtilités de l'entraînement de modèles (overfitting, distribution des données)
- L'importance du profiling et de l'optimisation
- L'itération rapide face aux échecs — chaque échec a enseigné quelque chose

Le modèle actuel (V5) fonctionne bien pour les circuits simples à moyens. Le défi reste les circuits complexes — mais les bases sont solides pour continuer.

---

# Annexes

## A. Commandes Serveur

```bash
# Connexion
ssh ubuntu@57.128.57.31

# Environnement
cd ~/circuit_transformer && source venv/bin/activate

# Générer un dataset
python3 data/generator_v4.py --num-samples 150000 --output outputs/dataset_v4.pt

# Entraîner un modèle
python3 scripts/train_v7.py --data outputs/dataset_v3.pt --epochs 100

# Redémarrer l'API
cd ~/circuit_web_backend
pkill -f uvicorn
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &
```

## B. Fichiers Clés

```
/home/ubuntu/circuit_transformer/
├── models/
│   ├── encoder.py           # CNN pour encoder Z(f)
│   ├── decoder_v2.py        # Transformer avec masking
│   └── model_v2.py          # Modèle complet
├── training/
│   ├── loss_v2.py           # Loss avec pénalités validité
│   ├── loss_v3_fast.py      # Loss vectorisée + dérivées
│   └── solver_gpu_v4.py     # Solveur MNA vectorisé (350x speedup)
├── data/
│   ├── generator_v3.py      # Générateur équilibré
│   └── generator_v4.py      # Générateur résonances marquées
└── outputs/
    ├── dataset_v3.pt        # 150k samples équilibrés
    ├── model_v5_test.pt     # Modèle en production
    └── training_v7/         # Checkpoints V7
```

## C. Constantes du Projet

```python
# Configuration
MAX_COMPONENTS = 10        # Composants par circuit
MAX_NODES = 8              # Nœuds (0=GND, 1=IN, 2-7=internal)
MAX_SEQ_LEN = 12           # START + 10 composants + END

FREQ_MIN = 10              # Hz
FREQ_MAX = 10e6            # 10 MHz
NUM_FREQ = 100             # Points de fréquence

# Architecture
LATENT_DIM = 256           # Sortie encoder
D_MODEL = 512              # Dimension Transformer
N_HEAD = 8                 # Têtes d'attention
N_LAYERS = 6               # Couches Transformer
# Total: 27.7M paramètres
```

## D. Références

1. Vaswani et al., "Attention Is All You Need" (2017) — Architecture Transformer
2. Weininger, "SMILES notation" (1988) — Représentation séquentielle de molécules
3. Bagal et al., "MolGPT: Molecular Generation using Transformers" (2021) — Inspiration pour génération de structures
4. Jang et al., "Categorical Reparameterization with Gumbel-Softmax" (2017) — Échantillonnage différentiable

---

*Document généré le 20 janvier 2026*
*Projet PRI — Synthèse de Circuits par Deep Learning*
