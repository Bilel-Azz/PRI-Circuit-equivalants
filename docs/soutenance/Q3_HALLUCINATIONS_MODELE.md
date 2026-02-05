# Q3 : Hallucinations du Modèle

## Question principale
**"Si 100% des circuits du dataset sont valides, pourquoi le modèle génère-t-il des circuits invalides ?"**

---

## Réponse courte

Le modèle **n'apprend pas les contraintes structurelles** du dataset. Il apprend une distribution statistique des tokens. Comme il n'y a pas de mécanisme forçant les contraintes, il peut générer des combinaisons jamais vues qui violent les règles.

---

## Analogie avec les LLM

C'est exactement le même phénomène que les **hallucinations des modèles de langage** :

| LLM | Notre modèle |
|-----|--------------|
| "Paris est la capitale de l'Allemagne" | R(1→1) [self-loop] |
| Mots corrects, sémantique fausse | Types corrects, topologie invalide |
| N'a jamais vu cette phrase exacte | N'a jamais vu ce circuit exact |
| Interpole entre patterns appris | Interpole entre patterns appris |

---

## Causes techniques

### 1. Têtes de prédiction indépendantes (V1)

**Architecture V1 (decoder.py)** :

```python
# decoder.py (V1 - simplifié)
type_logits = self.type_head(hidden)      # Prédit TYPE
node_a_logits = self.node_a_head(hidden)  # Prédit NODE_A
node_b_logits = self.node_b_head(hidden)  # Prédit NODE_B (INDÉPENDANT de node_a!)
value = self.value_head(hidden)           # Prédit VALUE
```

**Problème V1** : `node_b` est prédit SANS connaître `node_a`. Le modèle peut donc prédire `node_a=2` et `node_b=2` → self-loop.

**Corrigé en V2** : Le Decoder V2 conditionne node_b sur node_a (voir Solution 1).

### 2. Softmax ne garantit pas de contraintes

```python
node_a_probs = softmax([0.3, 0.4, 0.2, 0.1])  # → Nœud 1 le plus probable
node_b_probs = softmax([0.2, 0.5, 0.2, 0.1])  # → Nœud 1 aussi!
# Résultat: (node_a=1, node_b=1) → SELF-LOOP
```

Le modèle peut apprendre que le nœud 1 est souvent utilisé, mais rien ne l'empêche de le choisir deux fois.

### 3. Pas de contraintes dans la loss

**Loss V1** :

```python
loss = CrossEntropy(type) + CrossEntropy(node_a) + CrossEntropy(node_b) + MSE(value)
```

Cette loss ne pénalise PAS :
- Self-loops (node_a == node_b)
- Duplicats (même composant sur même arête)
- Dead-ends (nœuds avec 1 seule connexion)

→ Le modèle n'a aucune incitation à éviter ces erreurs.

---

## Statistiques des erreurs (Modèle V1)

| Type d'erreur | Fréquence |
|---------------|-----------|
| Self-loops | 42% |
| Duplicats | 31% |
| Dead-ends | 9% |
| Déconnecté | 9% |
| **Total circuits invalides** | **91%** |

---

## Solutions implémentées

### Solution 1 : Decoder V2 avec contrainte node_b ≠ node_a

```python
# decoder_v2.py:98-100
# node_b prédiction CONDITIONNÉE sur node_a
node_a_onehot = F.one_hot(node_a_sample, self.max_nodes).float()
node_b_input = torch.cat([output, node_a_onehot], dim=-1)
node_b_logits = self.node_b_head(node_b_input)

# MASKING: Interdire node_a
node_b_logits_masked = node_b_logits.clone()
for b in range(batch_size):
    for t in range(seq_len):
        na = node_a_sample[b, t].item()
        node_b_logits_masked[b, t, int(na)] = float('-inf')  # ← INTERDIT
```

**Résultat** : Self-loops → **0%** (éliminés structurellement)

### Solution 2 : Loss V2 avec pénalités de validité

```python
# loss_v2.py
def compute_validity_penalties(node_a_logits, node_b_logits, type_logits):
    # Pénalité self-loop (probabiliste)
    selfloop_prob = (node_a_probs * node_b_probs).sum(dim=-1)
    selfloop_penalty = (selfloop_prob * comp_mask).mean()

    # Pénalité duplicat (chevauchement des arêtes)
    edge_probs = torch.einsum('bsi,bsj->bsij', node_a_probs, node_b_probs)
    overlap = edge_probs[s1] · edge_probs[s2]  # Pour s1 ≠ s2
    duplicate_penalty = overlap.mean()

    return selfloop_penalty, duplicate_penalty
```

**Résultat** : Duplicats réduits de 31% → ~15%

### Solution 3 : Best-of-N inference

```python
# Générer N=50 candidats
candidates = []
for _ in range(50):
    seq = model.generate(impedance, tau=temperature)
    circuit = sequence_to_circuit(seq)
    if is_valid_circuit(circuit):  # ← Filtrage post-hoc
        z_pred = compute_impedance(circuit)
        error = mse(z_pred, z_target)
        candidates.append((circuit, error))

# Retourner le meilleur
return min(candidates, key=lambda x: x[1])
```

**Résultat** : ~85% des inférences trouvent au moins 1 circuit valide sur 50.

---

## Sous-questions anticipées

### "Pourquoi ne pas encoder les contraintes dans l'architecture ?"

**C'est exactement ce que fait le Decoder V2** pour les self-loops.

Pour les autres contraintes (duplicats, dead-ends, connectivité), c'est plus complexe :
- **Duplicats** : Nécessite une mémoire des arêtes déjà générées
- **Dead-ends** : Nécessite de "voir le futur" pour savoir si un nœud aura assez de connexions
- **Connectivité** : Contrainte globale, pas locale

→ Ces contraintes sont gérées par **post-traitement** (filtrage, réparation).

### "La loss V2 résout-elle le problème ?"

**Partiellement**. La loss V2 ajoute des pénalités douces (soft penalties) qui guident le modèle mais ne garantissent pas la validité.

```
Loss V1 : 91% invalides
Loss V2 : 40% invalides ← Amélioration significative mais pas parfait
```

### "Pourquoi pas de réparation automatique ?"

**Nous avons implémenté** `repair_utils.py` qui tente de corriger les circuits invalides :

```python
def repair_circuit(circuit):
    # 1. Supprimer self-loops
    # 2. Fusionner duplicats (R//R → R/2)
    # 3. Supprimer dead-ends
    # 4. Reconnecter parties isolées
```

**Problème** : La réparation peut changer le comportement Z(f) du circuit.

→ Compromis entre validité structurelle et fidélité à la prédiction.

### "Les modèles de langage ont le même problème ?"

**OUI**. Les LLM génèrent du texte grammaticalement correct mais factuellement faux.

**Solutions similaires** :
- **Contraintes structurelles** : Masking (nous), constrained decoding (LLM)
- **Pénalités dans la loss** : RLHF (LLM), validity penalties (nous)
- **Post-traitement** : Fact-checking (LLM), is_valid_circuit (nous)

### "Le problème empire-t-il avec plus de composants ?"

**OUI**. Plus le circuit est complexe, plus les contraintes sont difficiles à satisfaire.

```
Circuits 3 composants : ~70% valides
Circuits 6 composants : ~40% valides
Circuits 10 composants : ~15% valides
```

→ L'espace des circuits valides devient exponentiellement plus petit.

---

## Évolution de la validité

| Version | Validité | Self-loops | Duplicats | Changement clé |
|---------|----------|------------|-----------|----------------|
| V1 | 9% | 42% | 31% | Baseline |
| V2 | 35% | 42% | 31% | Loss améliorée |
| V4 | 60% | 0% | 25% | Decoder V2 (masking) |
| V5 | 36-42% | 0% | 20% | Dataset V3 équilibré |

**Observation** : Le masking élimine les self-loops (0%) mais les duplicats restent problématiques (~20-25%).

---

## Conclusion

Le modèle "hallucine" des circuits invalides car :

1. **Pas de contraintes architecturales** (V1) → Résolu par Decoder V2 pour self-loops
2. **Loss ne pénalise pas les erreurs structurelles** (V1) → Amélioré par Loss V2
3. **L'espace des séquences valides est minuscule** → Nécessite Best-of-N sampling

**Citation à utiliser en soutenance** :
> "Le modèle apprend une distribution sur les tokens, pas les contraintes logiques. C'est le même phénomène que les hallucinations dans les LLM. Nous l'avons résolu pour les self-loops avec un masking architectural (0% de self-loops), et atténué pour les duplicats avec des pénalités dans la loss. Le reste est géré par Best-of-N sampling : on génère 50 candidats et on garde le meilleur circuit valide."
