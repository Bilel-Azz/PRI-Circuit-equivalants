# Rapport de Projet PRI : Synthese de circuits equivalents par IA

## Prediction de topologies de circuits passifs (R, L, C) a partir de courbes d'impedance Z(f)

**Etudiant** : Bilel AAZZOUZ
**Encadrants** : Frederic Rayar, Yannick Kergossien, Ismail Aouichak
**Formation** : PRI 5A, Polytech Tours, 2025-2026
**Duree** : Decembre 2025 - Fevrier 2026 (~160 heures)

---

# Table des matieres

1. [Introduction et contexte](#1-introduction-et-contexte)
2. [Cahier des charges](#2-cahier-des-charges)
3. [Methodologie](#3-methodologie)
4. [Realisation technique](#4-realisation-technique)
   - 4.1 [Generation de donnees](#41-generation-de-donnees)
   - 4.2 [Representation des circuits](#42-representation-des-circuits)
   - 4.3 [Architecture du modele](#43-architecture-du-modele)
   - 4.4 [Entrainement et evolution du modele](#44-entrainement-et-evolution-du-modele)
   - 4.5 [Optimisations](#45-optimisations)
   - 4.6 [Application web](#46-application-web)
5. [Resultats](#5-resultats)
6. [Experimentations post-V5](#6-experimentations-post-v5)
7. [Problemes rencontres](#7-problemes-rencontres)
8. [Bilan et perspectives](#8-bilan-et-perspectives)

---

# 1. Introduction et contexte

## 1.1 Les circuits RLC

Les circuits passifs composes de resistances (R), d'inductances (L) et de condensateurs (C) sont omnipresents en electronique. Chaque circuit possede une **signature frequentielle** unique : sa courbe d'impedance Z(f), qui decrit comment le circuit s'oppose au passage du courant a differentes frequences.

L'impedance complexe d'un circuit RLC serie s'exprime :

```
Z(f) = R + j(wL - 1/wC)    avec w = 2*pi*f

Module :  |Z(f)| = sqrt(R^2 + (wL - 1/wC)^2)
Phase :   phi(f) = arctan((wL - 1/wC) / R)
```

A la frequence de resonance f0 = 1/(2*pi*sqrt(LC)), les contributions de L et C s'annulent et l'impedance est minimale (Z = R).

## 1.2 Le probleme inverse

L'objectif de ce projet est de resoudre le **probleme inverse** : a partir d'une courbe d'impedance Z(f), retrouver un circuit equivalent qui la produit.

```
ENTREE                                    SORTIE
------                                    ------
Courbe d'impedance Z(f)                   Circuit equivalent
  100 frequences (10 Hz a 10 MHz)         Composants R, L, C + connexions
  2 canaux : module + phase
```

### Pourquoi c'est difficile

Ce probleme est **mal pose** : plusieurs circuits differents peuvent produire exactement la meme courbe Z(f). Par exemple, un R de 100 Ohm donne le meme resultat que deux R de 50 Ohm en serie. Le modele ne cherche donc pas LE circuit original, mais UN circuit **fonctionnellement equivalent** qui reproduit la courbe.

De plus, les valeurs des composants couvrent une plage enorme : les resistances vont de 1 Ohm a 1 MOhm, les inductances de 1 uH a 100 mH, et les condensateurs de 1 pF a 100 uF.

## 1.3 L'approche choisie

L'approche est 100% supervisee avec des **donnees synthetiques** :

1. Generer des circuits aleatoires avec des composants et connexions variees
2. Calculer leur courbe Z(f) avec un solveur MNA (Modified Nodal Analysis)
3. Entrainer un reseau de neurones a predire le circuit a partir de la courbe

L'avantage de cette approche est de disposer d'un dataset illimite avec un ground truth parfait. L'inconvenient : le modele n'apprend que ce qu'on lui montre, donc la qualite du dataset est cruciale.

---

# 2. Cahier des charges

## 2.1 Exigences fonctionnelles

### Perimetre initial (requis)

| ID  | Exigence |
|-----|----------|
| EF1 | Generer des datasets synthetiques de circuits |
| EF2 | Entrainer un modele IA pour predire les circuits |
| EF3 | Calculer Z(f) via solveur MNA |
| EF4 | Representation vectorielle des circuits |

### Ajouts personnels (initiative propre)

| ID  | Exigence |
|-----|----------|
| EF5 | API backend pour l'inference (FastAPI) |
| EF6 | Interface web de visualisation (Next.js) |

## 2.2 Contraintes

- **100% donnees synthetiques** : pas de mesures reelles disponibles
- **Duree** : 5 mois (avec une pause de 7 semaines pour raisons personnelles)

## 2.3 Outils

| Outil | Role |
|-------|------|
| PyTorch | Entrainement du modele IA |
| Python | Solveur MNA, generation de donnees |
| FastAPI | Backend API REST |
| Next.js + React | Interface web |

---

# 3. Methodologie

## 3.1 Demarche exploratoire et iterative

Le projet a suivi une demarche exploratoire, avec un cycle repete a chaque version du modele :

1. **Exploration** : recherche bibliographique, etude des approches existantes
2. **Prototypage** : implementation rapide d'une solution candidate
3. **Test** : evaluation sur le dataset, mesure des metriques
4. **Analyse** : diagnostic des erreurs, identification des limites
5. **Amelioration** : correction ciblee du probleme identifie

Ce cycle a ete repete une douzaine de fois au total, ce qui a permis d'ameliorer progressivement le modele a travers les versions V1 a V12.

## 3.2 Planning

Le projet s'est deroule en plusieurs phases :

1. **Specifications** (decembre 2025) : cahier des charges, etude de l'existant
2. **Problemes personnels** (novembre - 20 decembre) : pause de ~7 semaines
3. **Creation du dataset** (decembre 2025) : generateurs V1 a V4
4. **Representation des circuits** (decembre 2025) : matrice 8x8 puis tokens sequentiels
5. **Entrainement du modele** (janvier 2026) : versions V1 a V12
6. **Backend + Frontend** (janvier 2026) : API FastAPI, interface Next.js
7. **Tests et validation** (fevrier 2026) : evaluation, optimisations
8. **Documents et soutenance** (fevrier 2026) : rapport, slides, demo

## 3.3 Gestion des risques

Les principaux risques identifies et leur evolution :

| Risque | Criticite initiale | Pic | Criticite finale |
|--------|-------------------|-----|-----------------|
| Qualite des donnees | Moyenne | Haute | Moyenne |
| Communication encadrants | Haute | Tres haute | Haute |
| Overfitting | Faible | Haute | Moyenne |
| Representation des circuits | Haute | - | Resolu |
| Delai (pause personnelle) | Faible | Tres haute | Faible |

La representation des circuits etait le risque le plus critique au debut, mais il a ete resolu par le passage aux tokens sequentiels. La communication avec les encadrants est restee un point d'attention tout au long du projet en raison de la pause.

---

# 4. Realisation technique

## 4.1 Generation de donnees

### Premiere approche : generation aleatoire

La premiere approche consistait a generer des circuits 100% aleatoires :

1. Choisir un nombre de composants au hasard (1 a 6)
2. Tirer les types aleatoirement (R, L ou C)
3. Attribuer des valeurs en distribution log-uniforme
4. Connecter les composants a des noeuds tires au sort

**Problemes identifies** :

- **Distribution non controlee** : impossible de garantir la diversite des courbes. 80% des courbes generees etaient monotones (pas de resonance), car la majorite des circuits aleatoires sont des combinaisons simples (R seul, RC, RL).
- **Beaucoup de circuits invalides** : composants connectes au meme noeud (self-loops), noeuds isoles. Seulement 9% des circuits generes etaient valides.

### Solution : generateur par templates de topologies

Pour resoudre ces problemes, j'ai cree un generateur qui utilise des **templates de topologies** predefinies. Chaque template garantit une forme de courbe unique :

| Topologie | % du dataset | Particularite |
|-----------|-------------|---------------|
| RLC serie resonant | 20% | Cas de base, resonance simple |
| Tank LC (anti-resonant) | 25% | Impedance maximale a la resonance |
| Double resonance | 25% | Deux pics/creux distincts |
| Notch filter | 15% | Rejet de frequence |
| Ladder multi-etages | 15% | Circuits complexes (escalier) |

Cette approche a permis de passer d'un dataset domine par les circuits simples a un dataset equilibre avec une variete de courbes d'impedance.

### Le solveur MNA

Pour calculer l'impedance d'un circuit, j'utilise la methode MNA (Modified Nodal Analysis). Le solveur construit une matrice d'admittance Y et resout le systeme :

```
Y * V = I
```

ou Y est la matrice d'admittance (construite a partir des composants), V les tensions aux noeuds (a trouver), et I les courants injectes. L'impedance est alors Z = V[entree] / I[entree].

Ce calcul est repete pour chacune des 100 frequences, de 10 Hz a 10 MHz.

## 4.2 Representation des circuits

### Le probleme

Un circuit est un **graphe** (noeuds + aretes). Mais les reseaux de neurones travaillent avec des **tenseurs de taille fixe**. Comment convertir un circuit en nombres ?

### Premiere idee : matrice d'adjacence 8x8 (echec)

La premiere idee etait de representer le circuit comme une matrice d'adjacence : chaque case (i,j) contient le type du composant entre les noeuds i et j.

**Pourquoi ca a echoue** : sur 64 positions (8x8), environ 90% sont vides (pas de composant). Le modele apprenait a predire "vide" partout, car c'est la solution triviale qui minimise la loss. Resultat : seulement 48% d'accuracy.

**Lecon tiree** : il faut une representation compacte ou chaque nombre compte.

### Solution : tokens sequentiels

Chaque composant est represente par un **token** de 4 valeurs :

```
[TYPE, NODE_A, NODE_B, VALEUR]

Exemple : R(100 Ohm) entre noeuds 0 et 1
       -> [1, 0, 1, 0.0]   (type=R, noeuds 0-1, valeur normalisee)
```

Un circuit complet est une sequence de tokens, avec du padding (type=NONE) pour les positions inutilisees.

**Normalisation des valeurs** : les valeurs couvrent des ordres de grandeur tres differents. La solution est de prendre le log10 et de centrer autour de valeurs typiques :
- R : log10(R) - 3 (centre = 1 kOhm)
- L : log10(L) + 4 (centre = 100 uH)
- C : log10(C) + 8 (centre = 10 nF)

Resultat : toutes les valeurs normalisees tombent dans l'intervalle [-4, +4], ce qui facilite l'apprentissage.

**Avantages** de cette representation :
- Taille fixe, compatible avec le batching GPU
- 100% des positions sont utiles (vs 10% pour la matrice)
- Padding naturel avec type=NONE

## 4.3 Architecture du modele

L'architecture se compose d'un **encoder CNN** et d'un **decoder Transformer** :

### Encoder CNN

L'encoder prend la courbe d'impedance en entree (2 canaux x 100 frequences) et en extrait un vecteur latent. Il utilise des convolutions 1D pour capturer les motifs locaux de la courbe (pentes, pics, creux).

```
Entree (2, 100) -> Conv1d(2->64) -> Conv1d(64->128) -> Conv1d(128->256) -> MLP -> Latent (256)
```

On peut voir l'encoder comme un "reconnaisseur de formes de courbes" : il identifie les features importantes (nombre de resonances, pentes, niveaux).

### Decoder Transformer

Le decoder genere la sequence de composants un par un, en utilisant le mecanisme d'attention pour acceder au vecteur latent. Il comporte 6 couches de Transformer avec 8 tetes d'attention (d_model=512).

Les 8 tetes d'attention sont comme 8 experts paralleles : chacun se specialise sur un aspect different du probleme (un expert regarde les types, un autre les connexions, etc.).

Pour chaque position de la sequence, le decoder predit :
- **type** : R, L, C, ou NONE (fin du circuit)
- **node_a** : premier noeud de connexion
- **node_b** : second noeud de connexion (contraint a etre different de node_a)
- **valeur** : valeur normalisee du composant

### Contrainte architecturale : node_b != node_a

Une innovation cle du modele est le **masking** qui empeche le decoder de predire node_b = node_a (self-loop). Au lieu d'ajouter une penalite dans la loss (qui encourage mais ne garantit pas), on modifie l'architecture pour rendre la prediction impossible :

```
1. Le decoder predit node_a
2. On concatene l'info de node_a avec le hidden state
3. On predit node_b, mais les logits de node_a sont mis a -inf
4. node_b ne peut physiquement PAS etre egal a node_a
```

Cette contrainte garantit 0% de self-loops, ce qui est bien plus efficace qu'une penalite.

**Conclusion architecturale** : les contraintes architecturales (masking, tokens) sont plus efficaces que les penalites de loss.

**Parametres totaux** : 27.7 millions

## 4.4 Entrainement et evolution du modele

Le modele a evolue a travers plusieurs versions, chacune corrigeant un probleme precis :

### V1-V2 : premier modele fonctionnel

- **Architecture** : encoder CNN + decoder Transformer avec 4 tetes de prediction independantes
- **Dataset** : V1 (50k circuits aleatoires)
- **Probleme** : 42% de self-loops (composant relie a lui-meme), seulement 9% de circuits valides
- **Cause** : les tetes sont independantes, rien n'empeche de predire node_a = node_b

### V3 : loss avec penalites

- **Changement** : ajout de penalites de validite dans la loss (self-loop, duplicates, GND/IN)
- **Resultat** : self-loops reduits a 20%, validite 30%
- **Insuffisant** : les penalites encouragent mais ne garantissent pas

### V4 : decoder contraint

- **Changement** : masking node_b != node_a dans le decoder
- **Resultat** : **0% de self-loops**, validite 60%
- **Lecon** : les contraintes architecturales sont bien plus efficaces que les penalites

### V5 : meilleur modele (deploye)

- **Changement** : dataset V3 (150k circuits equilibres avec templates) + 100 epochs d'entrainement
- **Resultat** : 0% self-loops, validite ~40%, val_loss = 0.256
- **Statut** : **Modele en production**

### V6 : tentative sur dataset V4 (echec)

- **Changement** : re-entrainement sur dataset V4 (50% doubles resonances forcees)
- **Resultat** : overfitting catastrophique a epoch 15 (val_loss diverge a 8.5)
- **Cause** : tau annealing trop agressif + dataset trop homogene
- **Decision** : retour au V5

## 4.5 Optimisations

Trois optimisations majeures ont ete realisees pour ameliorer les performances :

### Vectorisation du solveur MNA

Le solveur MNA original utilisait des boucles Python imbriquees (batch x sequence x frequence), ce qui etait extremement lent : **1700 ms par batch**.

En remplacant toutes les boucles par des operations tensorielles PyTorch vectorisees, le temps a ete reduit a **5 ms par batch**, soit un speedup de **340x**.

### Strategie Best-of-N

Au lieu de generer un seul circuit, le modele genere N=50 candidats avec des temperatures d'echantillonnage variees. On calcule Z(f) de chaque candidat via le solveur MNA et on garde celui avec la plus petite erreur (RMSE).

| N | RMSE | Amelioration |
|---|------|-------------|
| 1 | 3.05 | baseline |
| 10 | 0.71 | -76.7% |
| 50 | 0.35 | **-88.5%** |
| 100 | 0.31 | -89.8% |

Cette strategie est analogue au beam search en NLP ou au rejection sampling en statistiques. Le modele fait le travail dur (generer des candidats plausibles), le solveur verifie.

### Reparation automatique

Un post-traitement corrige automatiquement les circuits invalides generes par le modele : suppression des self-loops restants, fusion des edges dupliquees, verification de la connectivite.

Resultat : la validite passe de **~40% a ~65%** apres reparation.

## 4.6 Application web

### Backend (FastAPI)

Le backend expose une API REST qui :
1. Recoit une courbe d'impedance (100 points, magnitude + phase)
2. Execute le modele V5 pour generer N=50 candidats
3. Calcule Z(f) de chaque candidat via le solveur MNA vectorise
4. Selectionne le meilleur circuit (RMSE minimale)
5. Renvoie le circuit avec sa courbe recalculee

Le temps de reponse est d'environ 2 secondes pour 50 candidats.

### Frontend (Next.js + React)

L'interface web permet de :
- Dessiner ou uploader une courbe d'impedance
- Visualiser le circuit predit (composants + connexions)
- Comparer la courbe cible avec la courbe du circuit predit
- Ajuster les parametres (nombre de candidats, temperature)

L'interface utilise des graphiques interactifs pour afficher les courbes de magnitude et de phase.

---

# 5. Resultats

## 5.1 Metriques du modele V5

| Metrique | Valeur |
|----------|--------|
| Self-loops | **0%** |
| Validite brute | ~40% |
| Apres reparation | ~65% |
| RMSE best-of-50 | **0.35** |
| Val loss | 0.256 |

## 5.2 Ce qui marche bien

| Type de circuit | Performance |
|-----------------|-------------|
| RLC serie | Excellent |
| RC, RL simples | Excellent |
| Tank LC | Bon (grace au dataset V3 equilibre) |
| Notch filters | Correct |

Le modele reproduit bien les courbes a resonance simple et les tanks LC.

## 5.3 Ce qui ne marche pas encore

Le modele a tendance a "lisser" les courbes complexes. Quand on lui donne une courbe avec une double resonance, il genere souvent un circuit RLC simple qui approxime la courbe globale mais manque le deuxieme pic.

Ce comportement s'explique par le fait qu'un circuit simple qui "approxime" une courbe complexe donne une loss acceptable. Le modele prend le chemin de moindre resistance.

---

# 6. Experimentations post-V5

Apres le V5, cinq tentatives supplementaires ont ete faites pour depasser ses performances :

| Version | Changement | Resultat |
|---------|-----------|----------|
| V8 | 50k circuits 100% doubles resonances | Overfitting epoch 15 |
| V9c | 150k, resonances espacees | Pas mieux que V5 |
| V10 | Encoder 6 canaux (+derivees 1ere/2eme) | Performances degradees |
| V11 | Classifier + REINFORCE | Decoder detruit par REINFORCE |
| V12 | Classifier sans REINFORCE | Trop de composants (biais dataset) |

**Conclusion** : le V5 reste le meilleur modele. Le probleme des doubles resonances ne vient pas d'un manque d'experimentation mais des limites de l'architecture actuelle et de la qualite du dataset.

---

# 7. Problemes rencontres

## 7.1 Overfitting du modele V6

**Probleme** : sur le dataset V4 (doubles resonances forcees), le modele diverge a epoch 15 avec une val_loss qui explose a 8.5.

**Solution** : retour au V5 stable. Le V7 a ete redesigne avec un scheduler moins agressif, mais n'a pas depasse V5 non plus.

## 7.2 Lissage des courbes complexes

**Probleme** : le modele predit un RLC simple au lieu d'une double resonance.

**Solution tentee** : dataset verifie (100% doubles confirmees), 5 experiences (V8-V12). Non resolu. C'est une limite de l'architecture actuelle.

## 7.3 Circuits invalides (duplicates)

**Probleme** : le masking resout les self-loops (0%), mais les edges dupliquees restent un probleme (validite brute ~40%).

**Solution partielle** : reparation automatique (validite ~65%). Des contraintes supplementaires dans le decoder pourraient encore ameliorer ce point.

## 7.4 Dataset biaise

**Probleme** : les generateurs de "double resonance" ne produisent en realite que <15% de vraies doubles resonances visibles.

**Constat** : meme avec un dataset 100% verifie, le modele plafonne, ce qui confirme que le probleme est aussi architectural.

## 7.5 Arret de 7 semaines

**Probleme** : problemes personnels entre novembre et le 20 decembre, soit ~7 semaines sans avancement.

**Solution** : reprise intense le 20 decembre, rattrapage en janvier avec un rythme soutenu.

---

# 8. Bilan et perspectives

## 8.1 Livrables realises

| Phase | Livrables |
|-------|-----------|
| Specification | Cahier des charges, representation des circuits |
| Conception | Architecture modele, pipeline de donnees |
| Realisation | Modele V5, backend API, frontend web |
| Validation | Tests, deploiement sur serveur OVH |
| Gestion de projet | SPER, risques, Gantt |
| Ecole | Rapport, slides, demo |

## 8.2 Competences acquises

- **Deep Learning** : PyTorch, conception d'architectures, design de fonctions de loss
- **Data Engineering** : generation synthetique, controle de la distribution des donnees
- **Full-Stack** : API FastAPI + interface Next.js + deploiement serveur
- **Gestion de projet** : demarche exploratoire, SPER, analyse de risques
- **Resilience** : reprise apres une longue pause, iteration rapide face aux echecs

## 8.3 Lecons apprises

1. **Les contraintes architecturales sont plus efficaces que les penalites de loss** : le masking garantit 0% de self-loops, une penalite ne fait que decourager.

2. **La distribution du dataset est critique** : le modele apprend exactement ce qu'on lui montre. Un dataset biaise produit un modele biaise.

3. **Le modele prend le chemin de moindre resistance** : un circuit simple qui "approxime" une courbe complexe donne une loss acceptable.

4. **Plus de donnees ne signifie pas toujours mieux** : la qualite et la distribution des donnees comptent plus que la quantite.

5. **Profiler avant d'optimiser** : le goulot d'etranglement etait le solveur MNA (1700 ms), pas le modele (97 ms). La vectorisation a donne un speedup de 340x.

6. **Chaque iteration corrige UN probleme precis** : les 12 versions du modele montrent l'importance d'une demarche systematique de diagnostic.

## 8.4 Perspectives d'amelioration

1. **Nouvelle architecture** : le Transformer V2 atteint ses limites. Explorer les GNN (Graph Neural Networks), les modeles de diffusion, ou un encoder plus expressif.

2. **Validite des circuits** : ajouter des contraintes supplementaires dans le decoder pour eliminer les edges dupliquees.

3. **Donnees reelles** : integrer des mesures reelles de circuits pour valider les performances en conditions non synthetiques.

---

# Annexes

## A. Structure du code

```
ml/                          # Code d'entrainement
  config.py                  # Constantes et hyperparametres
  models/model_v2.py         # Architecture du modele V5
  data/generator_v4.py       # Generateur de circuits par templates
  data/solver.py             # Solveur MNA (calcul d'impedance)
  training/loss_v2.py        # Fonction de loss avec penalites
  scripts/train_v7.py        # Script d'entrainement

web/                         # Application web
  backend/                   # API FastAPI (inference, solveur)
  frontend/                  # Interface Next.js + React

slideshow/                   # Presentation (Next.js + Framer Motion)

livrables/                   # Fichiers remis
  modeles/model_v5_best.pt   # Poids du meilleur modele (106 MB)
  datasets/dataset_v3_150k.pt # Dataset equilibre (142 MB)
  datasets/dataset_v4_150k.pt # Dataset doubles resonances (142 MB)
```

## B. Infrastructure

- **Entrainement** : serveur OVH Cloud GPU (NVIDIA Quadro RTX 5000, 16 GB VRAM, CUDA 12.8)
- **Developpement local** : MacBook M3 (backend MPS)
- **Deploiement** : backend sur OVH, frontend sur Vercel

## C. References

1. Vaswani et al., "Attention Is All You Need" (2017) — Architecture Transformer
2. Weininger, "SMILES notation" (1988) — Representation sequentielle de molecules (inspiration)
3. Bagal et al., "MolGPT: Molecular Generation using Transformers" (2021) — Generation de structures par Transformer

---

*Document mis a jour le 22 fevrier 2026*
*Projet PRI — Synthese de circuits equivalents par IA — Polytech Tours*
