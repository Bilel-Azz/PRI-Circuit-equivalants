# Notes de Présentation — Circuit Synthesis AI
## PRI 5A Polytech Tours — Bilel AAZZOUZ — 2025-2026

**37 slides | ~25-30 min + démo**

---

## SLIDE 1 — Titre
> Circuit Synthesis AI — Impédance Z(f) → Topologie de circuit

- Se présenter : Bilel AAZZOUZ, PRI 5A
- Encadrants : Frédéric Rayar, Yannick Kergossien
- **Contexte PRI** : projet de recherche individuel, 5 mois, sujet proposé par M. Rayar
- **En une phrase** : "L'objectif est de créer une IA capable de retrouver un circuit électrique à partir de sa courbe d'impédance"
- Mentionner les technos visibles : PyTorch, CNN + Transformer, FastAPI, Next.js

---

## SLIDE 2 — Sommaire
> 4 sections

- Présenter rapidement les 4 parties :
  1. **Contexte** — comprendre le problème
  2. **Gestion de projet** — organisation, planning, risques
  3. **Réalisation technique** — la partie la plus conséquente
  4. **Bilan** — problèmes, compétences, améliorations, démo

---

## SLIDE 3 — Transition 01 : Contexte & Problématique

- "Commençons par poser le contexte"
- Montrer la progression : Circuits RLC → Impédance → Problème inverse → Le défi → Cahier des charges

---

## SLIDE 4 — Qu'est-ce qu'un circuit RLC ?
> Les 3 briques de base de l'électronique

**Mots-clés** : résistance, inductance, capacité

- **R** (Résistance) : freine le courant. Impédance Z = R, **constante** quelle que soit la fréquence
- **L** (Inductance/bobine) : stocke l'énergie magnétique. Z = jωL, **augmente** avec la fréquence
- **C** (Capacité/condensateur) : stocke l'énergie électrique. Z = 1/jωC, **diminue** avec la fréquence
- **Assemblage** : en série (Z s'additionne) ou en parallèle (1/Z s'additionne)
- "En combinant ces 3 briques, on peut créer une infinité de circuits"

---

## SLIDE 5 — L'impédance Z(f)
> La « signature fréquentielle » d'un circuit

**Mots-clés** : balayage fréquentiel, résonance, empreinte digitale

- **Principe** : on prend un circuit, on le soumet à des signaux de fréquences croissantes (10 Hz à 10 MHz), et on mesure comment il réagit
- **Ce qu'on mesure** : le **module** |Z(f)| (en Ohms) et la **phase** φ(f) (déphasage courant/tension)
- **100 points de mesure** espacés logarithmiquement
- **Résonance** : à la fréquence f₀, l'impédance est minimale — c'est le point clé de la courbe
- **Point important** : "Chaque circuit a une courbe unique — c'est son empreinte digitale"
- Analogie : comme une empreinte digitale identifie une personne, la courbe Z(f) identifie un circuit

---

## SLIDE 6 — Le problème inverse
> Retrouver le circuit à partir de sa courbe

**Mots-clés** : sens direct vs sens inverse, IA, prédiction

- **Sens direct** : Circuit → Z(f) — "ça, on sait faire" (calcul mathématique MNA)
- **Sens inverse** : Z(f) → Circuit — "c'est ce qu'on veut résoudre"
- **Le pipeline** : on donne une courbe Z(f) → l'IA prédit le circuit (topologie + valeurs)
- **3 questions à résoudre simultanément** :
  1. Quelle topologie ? (série, parallèle, mixte)
  2. Quels composants ? (R, L, C et combien)
  3. Quelles valeurs ? (100Ω, 10mH, 1µF...)

---

## SLIDE 7 — Pourquoi c'est difficile
> Problème mal posé : plusieurs circuits → même courbe

**Mots-clés** : problème mal posé, circuit équivalent, ordres de grandeur

- **Problème mal posé** : deux circuits complètement différents peuvent donner EXACTEMENT la même courbe Z(f)
  - Ex : un RLC série et un R + (L‖C) peuvent avoir la même réponse
- **On cherche UN circuit équivalent, pas LE circuit original**
- **3 défis techniques** :
  - **28 ordres de grandeur** — les valeurs vont de 0.000001 à 1 000 000 (pF à MΩ)
  - **3 prédictions simultanées** — type + valeur + connexions pour chaque composant
  - **1 à 10 composants** — on ne sait pas combien à l'avance
- "C'est pour ça qu'on a besoin d'une approche IA"

---

## SLIDE 8 — Cahier des charges

**Mots-clés** : exigences, ajouts personnels, contraintes

- **Périmètre initial** (4 exigences MUST) :
  - EF1 : Générer des datasets synthétiques
  - EF2 : Entraîner un modèle IA
  - EF3 : Calculer Z(f) via solveur MNA
  - EF4 : Représentation vectorielle des circuits
- **Ajouts personnels** (initiative propre) :
  - API backend FastAPI
  - Interface web Next.js
  - Stratégie Best-of-N
  - Réparation automatique de circuits invalides
- **Contraintes** : 100% données synthétiques, max 6 composants, 4 nœuds, durée 5 mois
- "J'ai ajouté de moi-même l'application web complète — ce n'était pas demandé"

---

## SLIDE 9 — Transition 02 : Gestion de Projet

---

## SLIDE 10 — Méthodologie
> Démarche exploratoire & itérative

**Mots-clés** : expérimentation, itération, pivot, autonomie

- **Approche** : "Tester, mesurer, pivoter" — pas de cycle en V classique
- **Timeline en 5 phases** :
  1. **Oct** — Exploration, recherche biblio, premiers prototypes
  2. **Nov → 20 déc** — ⏸ PAUSE (problèmes personnels, ~6 semaines d'arrêt)
  3. **20 déc → mi-jan** — Reprise intensive, pivot supervisé, modèles V1→V5, meilleur résultat
  4. **Jan → début fév** — Expérimentations V8→V12, toutes inférieures à V5
  5. **Fév** — Intégration web, déploiement OVH + Vercel
- **3 chiffres clés** :
  - 12 versions testées, seule V5 retenue
  - Pivot majeur : le problème = dataset, pas modèle
  - Projet individuel : autonomie totale
- "Malgré la pause, j'ai rattrapé tout le retard en un mois et demi"

---

## SLIDE 11 — Planning réel (Gantt)

**Mots-clés** : planning réel, chevauchement, rattrapage

- Montrer le Gantt : les barres se chevauchent car rattrapage parallèle
- **Zone rouge** : Nov → 20 déc = arrêt complet
- **Reprise** : tout se compresse entre fin décembre et février
- "Comme vous pouvez le voir, le vrai travail s'est concentré sur les 2 derniers mois"

---

## SLIDE 12 — Analyse des risques

**Mots-clés** : suivi mensuel, sévérité, mitigation

- **5 risques suivis** (sévérité 1-10 par mois) :
  - R1 : Instabilité numérique solver — 8→1 (résolu via vectorisation)
  - R2 : Complexité représentation — 9→2 (résolu via tokens séquentiels)
  - R3 : Communication encadrants — 9→2 (rattrapé)
  - R4 : Overfitting — 3→3 (reste modéré, V6 a montré le risque)
  - R5 : Circuits invalides — 7→1 (masking + réparation)
- "Tous les risques critiques sont descendus sous 3 en fin de projet"

---

## SLIDE 13 — Indicateurs SPER

**Mots-clés** : charge de travail, avancement, écart

- **~200h réalisées** vs 120h prévues → **+67% d'écart charge**
- **100% avancement** — projet livré
- **Graphiques** : avancement quasi plat Nov-Déc puis explosion Jan-Fév
- "L'écart de charge s'explique par la pause et le rattrapage intensif qui a suivi"

---

## SLIDE 14 — Transition 03 : Réalisation Technique

- "C'est la partie la plus conséquente — je vais vous montrer comment tout a été construit"
- Items : Génération de données, Représentation, Architecture, Entraînement, Application web

---

## SLIDE 15 — Génération aléatoire
> Première approche : circuits 100% random

**Mots-clés** : générateur aléatoire, problèmes, distribution

- **Pipeline en 4 étapes** : nb composants aléatoire → types R/L/C → valeurs log-uniform → connexions random
- **3 problèmes identifiés** :
  1. **Nœuds isolés** — composants connectés à rien → 42% de self-loops, 9% de validité
  2. **80% de courbes monotones** — majorité R ou RC simples, très peu de résonances
  3. **Distribution non contrôlée** — impossible de garantir la diversité
- "Le premier générateur ne fonctionnait pas — le modèle ne voyait que des cas simples"
- **Transition** : "D'où la solution → générateur par templates"

---

## SLIDE 16 — Pourquoi des templates ?
> Fixer la topologie, randomiser les valeurs

**Mots-clés** : contrôle, diversité, courbes uniques

- **Comparaison visuelle** :
  - GAUCHE (rouge) : aléatoire → toutes les courbes se ressemblent (monotones)
  - DROITE (vert) : templates → chaque type de circuit donne une courbe différente
- **Le principe** : on fixe la **structure** du circuit (la topologie) et on ne randomise que les **valeurs** des composants
- **Résultat** : on contrôle quelles formes de courbes on génère, tout en gardant la variété
- "C'est comme des moules à gâteaux : la forme est fixée, mais les ingrédients varient"

---

## SLIDE 17 — Les 5 topologies
> 5 familles de circuits couvrant toutes les formes d'impédance

**Mots-clés** : RLC série, Tank, Double résonance, Notch, Ladder

- **5 templates avec schémas et courbes** :
  1. **RLC série** (20%) — résonance : |Z| minimal à f₀ (dip)
  2. **Tank LC** (25%) — anti-résonance : |Z| maximal à f₀ (pic)
  3. **Double résonance** (25%) — 2 dips séparés de 2+ décades
  4. **Notch** (15%) — rejet de bande : un dip suivi d'un pic
  5. **Ladder** (15%) — multi-étages, forme complexe
- **Barre de distribution** en bas : 20/25/25/15/15
- "Chaque template garantit une forme de courbe Z(f) distincte"

---

## SLIDE 18 — Représentation 1/2 : le problème
> Comment encoder un circuit pour un réseau de neurones ?

**Mots-clés** : matrice d'adjacence, sparse, 90% vide

- **Le problème** : un circuit c'est un graphe (nœuds + arêtes), mais un réseau de neurones attend des nombres
- **Première idée** : matrice d'adjacence 8×8
  - Chaque case = type de composant entre 2 nœuds
  - **Problème** : 90% de cases vides (zéros) → le modèle prédit "rien" partout
  - **Résultat** : 48% accuracy seulement
- **3 échecs** : 90% vide → biais vers zéro, 48% accuracy, perd l'info des valeurs
- "Il fallait trouver une représentation plus compacte"

---

## SLIDE 19 — Représentation 2/2 : Tokens séquentiels
> Chaque composant = un token de 4 valeurs

**Mots-clés** : token, séquence, normalisation, taille fixe

- **Schéma visuel** : circuit RLC série → tokenisation → grille de tokens colorés
- **Principe** : chaque composant devient un token de 4 nombres :
  - **type** (R=1, L=2, C=3, NONE=0)
  - **node_a** (nœud de départ)
  - **node_b** (nœud d'arrivée, ≠ node_a !)
  - **valeur normalisée** (entre -4 et +4)
- **Normalisation** : R → log₁₀(R)−3, L → log₁₀(L)+4, C → log₁₀(C)+8
  - Permet de ramener des valeurs sur 28 ordres de grandeur dans un intervalle raisonnable
- **6 tokens × 4 valeurs = 24 nombres** (taille fixe, slots vides = NONE = padding)
- **Avantages** : batch GPU efficace, compatible Transformer (séquence), contrainte node_b ≠ node_a intégrée
- "C'est cette représentation qui a tout débloqué"

---

## SLIDE 20 — Pipeline MNA
> Du circuit au tenseur

**Mots-clés** : MNA, Modified Nodal Analysis, matrice d'admittance, solveur

- **Pipeline en 4 étapes** :
  1. Circuit → composants avec nœuds
  2. Construction matrice admittance Y(f) (formules : Y_R = 1/R, Y_L = 1/jωL, Y_C = jωC)
  3. Résolution Y·V = I → Z(f) = V(IN)/I(IN)
  4. Résultat : tenseur (2, 100)
- **100 fréquences log-espacées** de 10 Hz à 10 MHz
- "C'est le solveur qui permet de calculer la courbe d'impédance pour n'importe quel circuit — c'est le cœur du pipeline de données"

---

## SLIDE 21 — Encodage de la courbe
> Comment la courbe entre dans le CNN

**Mots-clés** : 2 canaux, log-magnitude, phase normalisée, tenseur

- **3 étapes de traitement** :
  1. Données brutes : 100 points avec magnitude (Ω) et phase (°)
  2. Normalisation :
     - Module → log₁₀(|Z|) — car les valeurs vont de 0.1Ω à 10MΩ (8 décades)
     - Phase → φ/π — remappe -90°/+90° dans [-0.5, +0.5]
  3. Tenseur final : **(2, 100)** — comme une image 1D à 2 couleurs
- "On donne au CNN 2 séries de 100 nombres : le module et la phase, normalisés"

---

## SLIDE 22 — Approches explorées
> 3 approches testées et abandonnées

**Mots-clés** : solver différentiable, REINFORCE, matrice 8×8, leçon

- **Avant d'arriver au Transformer, j'ai testé 3 approches** :
  1. **Solver différentiable** — backpropagation à travers le solveur MNA
     - Problème : instabilité numérique sur 28 ordres de grandeur
     - Résultat : 238% d'erreur, mode collapse
  2. **REINFORCE (RL)** — policy gradient sans supervision
     - Problème : pas de signal au début (reward ≈ 0)
     - Résultat : mode collapse, prédit toujours "un condensateur seul"
  3. **Matrice 8×8** — prédiction du graphe sous forme matricielle
     - Problème : 90% de positions vides → prédit "rien" partout
     - Résultat : 48% accuracy
- **Leçon tirée** : approche supervisée + représentation séquentielle + **contraintes architecturales** (masking > pénalités de loss)
- "Chaque échec a guidé vers la solution finale"

---

## SLIDE 23 — Architecture du modèle
> CNN Encoder + Transformer Decoder

**Mots-clés** : encoder CNN, latent 256, Transformer 6 couches, autorégressif

- **Entrée** : (2, 100) — la courbe d'impédance normalisée
- **Encoder CNN** :
  - Conv1d : 2→64→128→256 avec BatchNorm, ReLU, MaxPool
  - MLP : 3072→512→256 (espace latent compressé)
- **Espace latent** : vecteur de 256 dimensions — "l'essence du circuit"
- **Decoder Transformer** :
  - 6 couches, 8 têtes d'attention, d_model=512
  - Génère **autoregressivement** les 6 tokens de sortie
  - **Contrainte clé** : node_b ≠ node_a (masking) → 0% de self-loops
- **27.7M paramètres**, ~2s d'inférence
- "Le decoder génère les composants un par un, comme une phrase mot par mot"

---

## SLIDE 24 — Diagramme de classes

**Mots-clés** : architecture objet, Circuit, Component, MNASolver, CircuitTransformerV2

- **Structure du code** :
  - `Circuit` contient `Component[]` (1 à 6 composants)
  - `Component` : type (R/L/C), node_a, node_b, value
  - `MNASolver` : calcule l'impédance (100 fréquences)
  - `CircuitTransformerV2` (hérite nn.Module) : contient EncoderCNN + TransformerDecoder
  - `CircuitModel` : wrapper d'inférence (charge checkpoint, génère candidats)
  - `FastAPI Backend` : expose les endpoints web
- **Légende** : flèche pleine = composition, pointillée = utilisation, badge = héritage
- "Le code est structuré en couches : données → modèle → inférence → API"

---

## SLIDE 25 — Datasets
> Chaque version corrige un problème de la précédente

**Mots-clés** : V1 aléatoire, V3 équilibré, V4 double résonance forcée

- **V1** (50k, random) : 46% simples, forte distribution biaisée → le modèle ne voyait que des simples
- **V3** (150k, templates équilibrés) : 20% RLC, 25% Tank, 25% Double rés., 30% autres → doubles trop subtiles
- **V4** (150k, doubles forcées) : 50% doubles marquées → overfitting V6 à epoch 15
- **Leçon** : "Le modèle apprend exactement ce qu'il voit — la distribution compte plus que le volume"
- "C'est le dataset qui détermine ce que le modèle est capable de prédire"

---

## SLIDE 26 — Évolution V1→V5
> Itérations, debug, amélioration progressive

**Mots-clés** : itération, self-loops, decoder contraint, masking

- **V1-V2** : heads indépendantes → val_loss ~2.5, **42% self-loops**, 9% validité
- **V3** : + Loss V2 avec pénalités de validité → val_loss ~1.2, 20% self-loops
- **V4** : + Decoder contraint (node_b ≠ node_a par masking) → val_loss ~0.7, **0% self-loops**, 60% validité
- **V5** ⭐ : + Dataset V3 (150k équilibré), 100 epochs → **val_loss 0.256**, 0% self-loops
- **V6** : + Dataset V4 (doubles forcées) → overfitting epoch 15, val_loss 8.5 → retour V5
- **Insight** : "Chaque itération corrige UN problème précis — c'est du bricolage intelligent"
- Le **masking** (contrainte architecturale) a été plus efficace que les **pénalités de loss**

---

## SLIDE 27 — Résultats

**Mots-clés** : self-loops éliminés, validité, best-of-50, RMSE

- **Métriques clés** :
  - Self-loops : **0%** (grâce au masking)
  - Validité brute : **~40%** (problème de duplicates restant)
  - Après réparation : **~65%** (+62% grâce au post-traitement)
  - Best-of-50 RMSE : **0.35** (erreur de reconstruction de courbe)
- **Tableau d'évolution** : V1-V2 → V4 → V5 montrant la progression (self-loops, validité, RMSE)
- **Visuel** : courbe cible vs courbe prédite (overlay)
- "Le modèle élimine 100% des self-loops et atteint un RMSE de 0.35 avec la stratégie best-of-50"

---

## SLIDE 28 — Expériences post-V5
> 5 tentatives pour dépasser V5 — toutes échouées

**Mots-clés** : REINFORCE destructeur, 6 canaux inutiles, limite architecture

- **5 expériences** (toutes ✕) :
  1. **V8** (double-only dataset) → overfitting, pas de diversité
  2. **V9c** (V4 amélioré) → pas mieux que V5
  3. **V10** (6 canaux : +dérivées 1ère/2ème) → performances dégradées (REINFORCE détruit le decoder)
  4. **V11** (classificateur + REINFORCE) → decoder détruit même à faible poids REINFORCE
  5. **V12** (classificateur sans REINFORCE) → trop de composants (biais V4)
- **Conclusion** : V5 reste le meilleur — le problème vient de l'architecture/dataset, pas du manque d'expérimentation
- "J'ai testé 12 versions au total. Quand rien ne marchait, j'ai investigué et découvert que le problème venait du dataset"

---

## SLIDE 29 — Optimisations

**Mots-clés** : vectorisation GPU, best-of-N, réparation automatique

- **3 optimisations majeures** :
  1. **Vectorisation MNA** : boucles Python → opérations tensorielles GPU
     - 1700ms → 5ms/batch = **340× plus rapide**
     - A rendu possible l'entraînement sur GPU
  2. **Best-of-N** : générer N=50 candidats avec température τ, garder le meilleur
     - RMSE : 3.05 (N=1) → 0.35 (N=50) = **−88% d'erreur**
     - "Au lieu de faire 1 prédiction, on en fait 50 et on garde la meilleure"
  3. **Réparation automatique** : post-traitement des circuits invalides
     - Suppression self-loops, fusion duplicates, reconnexion nœuds isolés
     - ~40% → ~65% de validité = **+62%**

---

## SLIDE 30 — Backend & Inférence

**Mots-clés** : FastAPI, endpoints, best-of-N, API REST

- **Architecture** : Modèle V5 (PyTorch) → FastAPI (port 8000)
- **4 endpoints** :
  - POST /api/predict — prédiction de circuit
  - POST /api/impedance — calcul Z(f) pour vérification
  - GET /api/health — état du serveur
  - POST /api/candidates — top-K candidats
- **Best-of-N en pratique** :
  - N=1 : RMSE 3.05 (1 seul candidat)
  - N=10 : RMSE 0.71
  - N=50 : RMSE 0.35 → **−88.5% d'erreur**
- "Le backend génère 50 circuits candidats et les trie par qualité"

---

## SLIDE 31 — Frontend / Architecture bout en bout

**Mots-clés** : Next.js, visualisation, candidats, architecture 3 couches

- **3 couches** :
  - **Frontend** (Next.js + React + Tailwind, port 3000) : visualisation des circuits, graphes interactifs, exploration des candidats, réparation
  - **Backend** (FastAPI, port 8000) : inférence, solveur MNA, validation, réparation
  - **Modèle** (PyTorch, model_v5.pt)
- "L'utilisateur dessine une courbe ou upload des données → le backend génère les candidats → le frontend les affiche"
- Mentionner le déploiement : OVH (GPU RTX 5000) + Vercel (frontend)

---

## SLIDE 32 — Transition 04 : Bilan & Conclusion

---

## SLIDE 33 — Problèmes rencontrés

**Mots-clés** : overfitting, lissage, circuits invalides, dataset biaisé, pause

- **5 problèmes** :
  1. **Overfitting V6** (✓ Résolu) : τ annealing trop agressif → divergence epoch 15 → retour V5
  2. **Lissage des courbes** (✗ Non résolu) : pour une double résonance, le modèle prédit un RLC simple — limite dataset/architecture
  3. **Circuits invalides** (⚠ En cours) : 36-42% validité, duplicates persistent malgré le masking
  4. **Dataset biaisé** (Cause racine) : les générateurs "double résonance" produisent <15% de vraies doubles
  5. **Pause Nov→Déc** (✓ Rattrapé) : 7 semaines d'arrêt → reprise intense, rattrapé en janvier
- "Le plus gros problème non résolu est le lissage — le modèle simplifie les courbes complexes"

---

## SLIDE 34 — Bilan & Compétences

**Mots-clés** : livrables, compétences acquises, autonomie

- **6 livrables réalisés** : Spécification → Conception → Implémentation → Validation → Gestion projet → Livrables (tous ✓)
- **5 compétences acquises** :
  1. **Deep Learning** : PyTorch, design d'architectures, conception de fonctions de loss
  2. **Data Engineering** : génération synthétique, gestion de distributions
  3. **Full-Stack** : FastAPI + Next.js + déploiement cloud
  4. **Gestion de projet** : démarche exploratoire, SPER, analyse de risques
  5. **Résilience** : récupération post-pause, itération rapide
- "Ce projet m'a permis de toucher à toute la chaîne : de la génération de données au déploiement en production"

---

## SLIDE 35 — Axes d'amélioration

**Mots-clés** : REINFORCE, dataset vérifié, nouvelle architecture, GNN, données réelles

- **5 axes futurs** :
  1. **REINFORCE/loss dérivées** (Testé ✕) — détruit le decoder même à faible poids
  2. **Dataset vérifié** (Testé ✕) — 100% doubles vérifiées → le modèle plafonne quand même
  3. **Nouvelle architecture** (Futur) — le Transformer V2 a atteint ses limites → explorer GNN, diffusion, ou encoder plus expressif
  4. **Validité des circuits** (Planifié) — contraintes supplémentaires pour éliminer les arêtes dupliquées
  5. **Données réelles** (Futur) — intégrer des mesures réelles pour du transfer learning
- "La prochaine étape serait de changer d'architecture — le Transformer a atteint ses limites sur les circuits complexes"

---

## SLIDE 36 — Démo en direct

**Mots-clés** : temps réel, 150k circuits, RMSE 0.35, <2s

- **Rappeler les chiffres** : 150k circuits d'entraînement, RMSE 0.35, <2s pour 50 candidats
- **Lancer la démo** → ouvrir l'application web
- **Scénario suggéré** :
  1. Montrer un circuit simple (RLC série) → fonctionne très bien
  2. Montrer un circuit Tank → résultat correct
  3. (Optionnel) Essayer une double résonance → montrer la limite
- "On va voir en temps réel comment l'IA retrouve un circuit à partir de sa courbe"

---

## SLIDE 37 — Merci / Questions

- Remercier les encadrants et le jury
- Ouvrir aux questions
- Contact si besoin

---

# CONSEILS GÉNÉRAUX

## Timing suggéré (~25 min)
| Section | Slides | Durée |
|---------|--------|-------|
| Titre + Sommaire | 1-2 | 1 min |
| Contexte | 3-8 | 5 min |
| Gestion projet | 9-13 | 4 min |
| Réalisation technique | 14-31 | 12 min |
| Bilan | 32-37 | 3 min + démo |

## Phrases de transition clés
- Après Contexte → "Maintenant que vous avez compris le problème, voyons comment je me suis organisé"
- Après Gestion → "Passons à la partie technique — comment tout ça a été construit"
- Après Réalisation → "Pour conclure, faisons le bilan de ce projet"
- Avant Démo → "Et maintenant, je vous propose de voir tout ça en action"

## Points à NE PAS oublier
- La **pause de 7 semaines** — soyez transparent, montrez le rattrapage
- Les **12 versions testées** — montre la rigueur expérimentale
- Les **ajouts personnels** (web app) — montre l'initiative
- Le **masking > pénalités de loss** — c'est la découverte technique clé
- Le **problème du lissage** — soyez honnête sur les limites

## Points forts à souligner
- 0% self-loops (résolu par une contrainte architecturale élégante)
- Best-of-50 RMSE 0.35 : −88% d'erreur
- ~65% validité après réparation (+62%)
- Vectorisation GPU : 340× speedup
- Application web complète non demandée
- 12 versions testées méthodiquement
