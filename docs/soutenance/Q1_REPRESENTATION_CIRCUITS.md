# Q1 : Représentation des Circuits RLC

## Question principale
**"Peut-on représenter TOUTES les topologies de circuits RLC possibles avec ce système de nœuds ?"**

---

## Réponse courte

**OUI**, dans les limites de taille (≤8 nœuds, ≤10 composants).

Un circuit RLC est un **graphe** où les nœuds sont des points de connexion et les arêtes sont des composants. Notre format de séquence peut représenter n'importe quel graphe de ce type.

---

## Preuve de complétude

### Qu'est-ce qu'un circuit RLC ?

Mathématiquement, un circuit RLC est un **graphe non-orienté** G = (V, E) où :
- V = ensemble des nœuds (points de connexion)
- E = ensemble des arêtes (composants R, L, ou C)

Chaque arête e ∈ E a :
- Deux extrémités (node_a, node_b)
- Un type (R, L, ou C)
- Une valeur (en Ω, H, ou F)

### Notre représentation

```
Séquence: [TYPE, NODE_A, NODE_B, VALUE] × 12 positions
```

**C'est exactement une liste d'arêtes** d'un graphe !

### Théorème (informel)

> Tout graphe RLC avec ≤8 nœuds et ≤10 composants peut être encodé dans notre format.

**Preuve** :
1. Numéroter les nœuds de 0 à 7
2. Pour chaque composant, écrire (TYPE, NODE_A, NODE_B, VALUE)
3. Ajouter START au début, END à la fin

C'est une bijection entre graphes RLC (de taille bornée) et séquences valides.

---

## Exemples de topologies

### 1. Série

```
IN ─R─ n2 ─L─ n3 ─C─ GND

Séquence: START, R(1,2), L(2,3), C(3,0), END
```

### 2. Parallèle

```
     ┌─ R ─┐
IN ──┤     ├── GND
     └─ C ─┘

Séquence: START, R(1,0), C(1,0), END
```

### 3. Série-Parallèle mixte

```
IN ─R─┬─ L ─┬─ GND
      └─ C ─┘

Séquence: START, R(1,2), L(2,0), C(2,0), END
```

### 4. Pont (Bridge / Wheatstone)

```
       R1
    ┌──/\/──┐
IN ─┤   R3  ├─ GND
    │  /\/  │
    └──/\/──┘
       R2

Séquence: START, R1(1,2), R2(1,3), R3(2,3), R4(2,0), R5(3,0), END
```

### 5. Ladder (Échelle)

```
IN ─R─ n2 ─L─ n3 ─R─ n4 ─L─ GND
      │      │      │
      C      C      C
      │      │      │
     GND    GND    GND

Séquence: START, R(1,2), C(2,0), L(2,3), C(3,0), R(3,4), C(4,0), L(4,0), END
```

### 6. Double résonance (2 LC en cascade)

```
IN ─R─ n2 ─L1─ n3 ─C1─ n4 ─L2─ n5 ─C2─ GND

Séquence: START, R(1,2), L(2,3), C(3,4), L(4,5), C(5,0), END
```

### 7. Pi (π) Network

```
      ┌─── L ───┐
IN ───┤         ├─── GND
      │         │
      C1        C2
      │         │
     GND       GND

Nœuds: IN=1, nœud interne=2, GND=0
Séquence: START, C1(1,0), L(1,2), C2(2,0), END
```

### 8. T Network

```
IN ─L1─ n2 ─L2─ n3 ─ GND
         │
         C
         │
        GND

Séquence: START, L(1,2), C(2,0), L(2,3), R(3,0), END
```

---

## Ce qui est couvert

| Topologie | Représentable ? | Exemple |
|-----------|-----------------|---------|
| Série pure | ✅ | R-L-C |
| Parallèle pur | ✅ | R // L // C |
| Série-Parallèle | ✅ | R-(L//C) |
| Ladder (échelle) | ✅ | Filtres LC |
| Pont | ✅ | Wheatstone |
| Pi (π) | ✅ | Matching networks |
| T | ✅ | Matching networks |
| Double/Triple résonance | ✅ | Cascades LC |
| **Tout graphe planaire** | ✅ | (avec assez de nœuds) |
| **Tout graphe non-planaire** | ✅ | K5, K3,3 aussi ! |

---

## Les seules limites

### Limite 1 : Nombre de nœuds (8 max)

Un circuit avec 9+ points de connexion distincts ne peut pas être représenté.

**En pratique** : Les circuits RLC réels ont rarement plus de 6-7 nœuds. Au-delà, on utilise généralement des sous-circuits ou des modèles simplifiés.

### Limite 2 : Nombre de composants (10 max)

La séquence a 12 positions : START + 10 composants + END.

**En pratique** : 10 composants RLC couvrent la grande majorité des circuits réels. Les filtres d'ordre élevé (>5) sont rares.

### Limite 3 : Un seul composant de même type par arête

On interdit deux R sur la même arête (serait équivalent à un seul R).

**Justification** : R1 // R2 = R_eq. Le modèle peut apprendre la valeur équivalente.

---

## Sous-questions anticipées

### "Y a-t-il des topologies RLC impossibles à représenter ?"

**NON**, tant qu'on reste dans les limites de taille.

Toute façon de connecter des R, L, C entre des nœuds est un graphe, et notre format encode des graphes.

### "Pourquoi 8 nœuds ?"

**Choix pratique** basé sur :
1. Couverture : 95%+ des circuits pratiques ont ≤6 nœuds
2. Complexité du décodeur : 8 nœuds → 56 paires possibles (8×7)
3. Compromis entraînement/expressivité

### "Les circuits non-planaires sont-ils représentables ?"

**OUI**. Notre format n'impose aucune contrainte de planarité.

Un graphe K5 (5 nœuds tous connectés) :
```
Séquence: R(1,2), R(1,3), R(1,4), R(1,0), R(2,3), R(2,4), R(2,0), R(3,4), R(3,0), R(4,0)
```
→ 10 composants, 5 nœuds. Représentable !

### "Peut-on avoir plusieurs composants entre deux mêmes nœuds ?"

**OUI**, tant qu'ils sont de types différents :

```
R(1,2) + L(1,2) + C(1,2)  ← VALIDE (R//L//C entre nœuds 1 et 2)
R(1,2) + R(1,2)           ← INVALIDE (duplicat, équivaut à R/2)
```

### "Comment représenter R en série avec L sur la même 'branche' ?"

Utiliser un nœud intermédiaire :

```
Mauvais: R(1,2) "série" L(1,2) ← Impossible, c'est un parallèle !

Correct: R(1,3) série L(3,2)
         IN ─R─ n3 ─L─ n2 ─...
```

Le nœud n3 est le point de jonction entre R et L.

### "Notre représentation est-elle canonique ?"

**NON**. Plusieurs séquences peuvent représenter le même circuit :

```
Séquence A: R(1,2), L(2,0), C(2,0)
Séquence B: L(2,0), R(1,2), C(2,0)  ← Même circuit, ordre différent
Séquence C: R(1,3), L(3,0), C(3,0)  ← Même circuit, nœuds renommés
```

**Conséquence** : Le modèle peut apprendre n'importe quelle forme canonique. On normalise les circuits (tri par type, puis par nœuds) pour réduire cette ambiguïté.

---

## Résumé mathématique

Notre représentation est une **fonction surjective** :

```
f: {Graphes RLC avec ≤8 nœuds, ≤10 arêtes} → {Séquences valides}
```

- **Surjective** : Tout graphe RLC (dans les limites) a au moins une séquence
- **Non injective** : Plusieurs séquences peuvent donner le même graphe (ordres différents)

---

## Conclusion

**OUI, nous pouvons représenter TOUTES les topologies RLC** dans les limites de :
- 8 nœuds maximum
- 10 composants maximum

Ces limites sont **pratiques, pas fondamentales**. Elles pourraient être augmentées au prix d'un modèle plus complexe.

**Citation à utiliser en soutenance** :
> "Un circuit RLC est mathématiquement un graphe : des nœuds connectés par des composants. Notre format de séquence [TYPE, NODE_A, NODE_B, VALUE] encode exactement ce graphe. Donc oui, toute topologie RLC est représentable, dans la limite de 8 nœuds et 10 composants. C'est une restriction de taille, pas de forme."
