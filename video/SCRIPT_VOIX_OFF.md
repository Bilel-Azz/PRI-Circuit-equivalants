# Script Voix Off — Circuit Synthesis AI

**Durée totale** : ~2min 46s
**Format** : 30 fps, 1920x1080

---

## INTRO — Titre (0:00 → 0:06)

> [posé, clair]
> Circuit Synthesis AI.
> [pause longue]
> De la courbe d'impédance, au circuit équivalent.
> [pause longue]

---

## PAGE 1 — Le circuit (0:06 → 0:16)

> Un circuit électrique est composé de trois briques fondamentales :
> des résistances, des inductances, et des condensateurs.
> [souffle]
> Chaque combinaison de ces composants forme un circuit unique,
> avec un comportement électrique qui lui est propre.
> [pause longue]

---

## PAGE 2 — L'impédance (0:16 → 0:26)

> Ce comportement se traduit par une courbe d'impédance.
> [souffle]
> Elle montre comment le circuit réagit en fonction de la fréquence.
> Les pics et les creux révèlent des phénomènes de résonance —
> c'est en quelque sorte l'empreinte du circuit.
> [pause longue]

---

## PAGE 3 — Encodage des données (0:26 → 0:36)

> Pour entraîner notre modèle, on échantillonne cette courbe
> sur cent points de fréquence, espacés de manière logarithmique.
> [souffle]
> On obtient un vecteur de magnitude et de phase :
> c'est l'entrée de notre réseau de neurones.
> [pause longue]

---

## PAGE 4 — Prédiction IA (0:36 → 0:46)

> Le modèle est un encodeur CNN, suivi d'un décodeur Transformer.
> [souffle]
> Il prend la courbe d'impédance en entrée,
> et prédit directement la topologie du circuit :
> quels composants, quelles valeurs, et comment ils sont connectés.
> [pause longue]

---

## PAGE 5 — Backend (0:46 → 0:56)

> Une fois le modèle entraîné, on l'encapsule dans un serveur FastAPI.
> Il expose des endpoints REST pour l'inférence en temps réel.
> [souffle]
> Le modèle se charge au démarrage, et répond en quelques millisecondes.
> [pause longue]

---

## PAGE 6 — Frontend (0:56 → 1:06)

> Le backend est connecté à une interface web développée avec Next.js.
> L'utilisateur envoie sa courbe d'impédance, le serveur prédit le circuit,
> et le frontend affiche les résultats :
> [souffle]
> courbes, schémas, et métriques de performance.
> [pause longue]

---

## PAGE 7 — Transition vers la démo (1:06 → 1:11)

> [léger sourire, plus dynamique]
> Voyons tout ça en action.
> [pause longue]

---

## PAGE 8 — Texte de transition (1:11 → 1:13)

> [silence]

---

## DÉMO SITE (1:13 → 2:10)

### Apparition du site (1:13 → 1:17)

> Voici l'interface de la démo.
> [pause longue]

### Sélection d'un échantillon (1:17 → 1:25)

> À gauche, on retrouve une bibliothèque de courbes d'impédance.
> Chaque échantillon correspond à un circuit de test connu.
> [souffle]
> On sélectionne un échantillon de type RLC série.
> [pause longue]

### Paramètres (1:25 → 1:33)

> On peut ajuster le nombre de candidats, et le seuil de confiance,
> avant de lancer la prédiction.
> [pause longue]

### Génération (1:33 → 1:45)

> On clique sur Générer.
> [pause longue]
> Le modèle analyse la courbe et génère plusieurs circuits candidats.
> [souffle]
> Le chargement prend quelques secondes.
> [pause longue]

### Résultats — Métriques (1:45 → 1:53)

> Les résultats s'affichent à droite.
> On voit les métriques de performance :
> l'erreur RMSE, et le score de correspondance.
> [pause longue]

### Résultats — Courbes (1:53 → 2:01)

> Le graphique superpose la courbe d'entrée et la courbe prédite.
> [souffle]
> On constate que les deux courbes se chevauchent quasi parfaitement,
> y compris au niveau du pic de résonance.
> [pause longue]

### Résultats — Circuit (2:01 → 2:09)

> Voici le circuit prédit par le modèle.
> Les composants et leurs valeurs sont affichés.
> On peut comparer avec le circuit de référence.
> [pause longue]

### Candidats alternatifs (2:09 → 2:13)

> D'autres candidats sont proposés, classés par score de similarité.
> [pause longue]

### Second essai — JSON (2:13 → 2:22)

> On peut aussi fournir directement les données au format JSON.
> [souffle]
> Ici, on entre manuellement une courbe d'impédance,
> pour tester un cas personnalisé.
> [pause longue]

---

## OUTRO (2:22 → 2:46)

> [posé]
> Circuit Synthesis AI.
> [pause longue]
> Un projet de recherche et innovation, par Bilel Aazzouz.
> [silence]

---

## Notes techniques

- **[souffle]** = petite respiration audible, pas un soupir exagéré. Juste un souffle naturel entre deux idées.
- **[pause longue]** = ~1-2 secondes de silence.
- **Prononciation** :
  - "CNN" → "cé-ène-ène"
  - "Transformer" → à l'anglaise
  - "FastAPI" → "fast-A-P-I"
  - "Next.js" → "next-jé-esse"
  - "RMSE" → "ère-ème-esse-euh"
  - "REST" → "reste"
  - "JSON" → "jason"
- **Fichier final** : `public/voiceover.mp3`
