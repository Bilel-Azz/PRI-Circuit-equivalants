# Q4 : Choix de l'Architecture - CNN Encoder + Transformer Decoder

## Question principale
**"Pourquoi un CNN pour l'encodeur et un Transformer pour le décodeur ?"**

---

## Réponse courte

Notre architecture est **hybride** :
- **Encodeur CNN** : Traite la courbe Z(f) → vecteur latent
- **Décodeur Transformer** : Génère la séquence de composants autoregressivement

Chaque partie utilise l'architecture la mieux adaptée à sa tâche.

---

## Architecture complète

```
┌─────────────────────────────────────────────────────────────┐
│                    CircuitTransformerV2                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Z(f) ──► [CNN ENCODER] ──► latent ──► [TRANSFORMER DECODER] ──► Séquence
│            (2, 100)          (512)                              (12, 4)
│                                                              │
│   Encodeur:                  Décodeur:                       │
│   - Conv1d × 3               - TransformerDecoder            │
│   - BatchNorm                - 4 layers, 8 heads             │
│   - MaxPool                  - Attention causale             │
│   - MLP                      - Heads: type, node_a, node_b   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Pourquoi CNN pour l'encodeur ?

### Le problème : Encoder Z(f)

L'entrée est une **courbe 1D** : (2 canaux, 100 points)
- Canal 0 : log|Z(f)|
- Canal 1 : phase(Z(f))

### Pourquoi CNN est adapté

#### 1. Features locales

Les caractéristiques importantes de Z(f) sont **locales** :
- Pics de résonance (quelques points)
- Transitions de phase (gradient local)
- Vallées d'anti-résonance

```python
# Un filtre CNN peut détecter un pic
filter = [-1, -1, 4, -1, -1]  # Détecte maxima locaux
```

#### 2. Invariance translationnelle

Un pic de résonance peut être à n'importe quelle fréquence :
```
Circuit 1: f_res = 1 kHz  → pic au sample 30
Circuit 2: f_res = 10 kHz → pic au sample 50
```

Le CNN avec ses filtres **glissants** détecte le pic peu importe sa position.

#### 3. Hiérarchie de features

| Couche | Détecte | Champ réceptif |
|--------|---------|----------------|
| conv1 (k=5) | Gradients, pentes | 5 points |
| conv2 (k=5) | Pics, vallées | 15 points |
| conv3 (k=3) | Patterns de résonance | 35 points |

#### 4. Efficacité

```python
# encoder.py
self.conv1 = nn.Conv1d(2, 64, kernel_size=5)   # 640 params
self.conv2 = nn.Conv1d(64, 128, kernel_size=5) # 41K params
self.conv3 = nn.Conv1d(128, 256, kernel_size=3) # 98K params
# Total conv: ~140K params

# MLP équivalent pour même capacité: ~500K+ params
```

### Pourquoi pas Transformer pour l'encodeur ?

| Aspect | CNN | Transformer |
|--------|-----|-------------|
| Complexité | O(n × k) | O(n²) |
| Inductive bias | Localité (correct pour Z(f)) | Global (overkill) |
| Params pour 100 points | ~140K | ~500K+ |
| Données nécessaires | ~50K | ~200K+ |

Le Transformer n'a pas d'avantage pour encoder une courbe 1D de 100 points.

---

## Pourquoi Transformer pour le décodeur ?

### Le problème : Générer une séquence

La sortie est une **séquence variable** de composants :
```
[START, R(1,2,100Ω), L(2,3,1mH), C(3,0,1µF), END, PAD, PAD, ...]
```

### Pourquoi Transformer est adapté

#### 1. Génération autoregressive

Le Transformer génère token par token, conditionnant chaque prédiction sur les précédentes :

```python
# decoder_v2.py
for t in range(1, max_seq_len):
    # Attention sur tous les tokens précédents
    output = self.transformer(tgt=sequence[:, :t], memory=latent)
    next_token = predict(output[:, -1])
    sequence[:, t] = next_token
```

#### 2. Attention sur le contexte complet

Pour prédire le composant 5, le modèle doit "voir" les composants 1-4 :
- Quels nœuds sont déjà utilisés ?
- Quels types de composants manquent ?
- La structure est-elle cohérente ?

L'**attention** permet exactement ça.

#### 3. Parallélisation pendant l'entraînement

Avec teacher forcing, tous les tokens sont prédits en parallèle :
```python
# Training: une seule passe forward
output = self.transformer(tgt=teacher_seq, memory=latent)
# output contient les prédictions pour TOUS les tokens
```

#### 4. Flexibilité de longueur

Le Transformer gère naturellement des séquences de longueur variable (3 à 10 composants).

### Pourquoi pas RNN/LSTM pour le décodeur ?

| Aspect | Transformer | LSTM |
|--------|-------------|------|
| Parallélisation | ✅ Complète | ❌ Séquentielle |
| Long-range deps | ✅ Attention directe | ⚠️ Vanishing gradient |
| Modernité | ✅ State-of-art | ⚠️ Moins utilisé |

---

## Configuration du Transformer Decoder

```python
# config.py
D_MODEL = 256      # Dimension des embeddings
N_HEAD = 8         # Nombre de têtes d'attention
N_LAYERS = 4       # Nombre de couches
DIM_FF = 1024      # Dimension feedforward
DROPOUT = 0.1
```

### Composants clés

```python
# decoder_v2.py
class TransformerDecoderV2(nn.Module):
    def __init__(self):
        # Embeddings
        self.comp_emb = ComponentEmbedding(d_model)  # Encode (type, node_a, node_b, value)
        self.pos_enc = PositionalEncoding(d_model)   # Position dans la séquence

        # Transformer standard
        decoder_layer = nn.TransformerDecoderLayer(
            d_model=256, nhead=8, dim_feedforward=1024
        )
        self.transformer = nn.TransformerDecoder(decoder_layer, num_layers=4)

        # Têtes de prédiction
        self.type_head = nn.Linear(d_model, 6)       # 6 types de tokens
        self.node_a_head = nn.Linear(d_model, 8)     # 8 nœuds
        self.node_b_head = nn.Linear(d_model + 8, 8) # Conditionné sur node_a
        self.value_head = nn.Linear(d_model, 1)      # Valeur continue
```

---

## Sous-questions anticipées

### "Pourquoi pas un Transformer end-to-end ?"

**Possible** mais pas optimal :

1. **Encoder Transformer** : Traiter Z(f) comme une séquence de 100 tokens
   - Overkill pour une courbe 1D
   - Pas d'avantage sur CNN pour features locales

2. **Vision Transformer (ViT)** : Patcher Z(f) en segments
   - Conçu pour images 2D
   - Perte d'information aux frontières des patches

Le CNN est simplement plus adapté à notre entrée 1D.

### "Pourquoi 4 couches et 8 têtes ?"

**Heuristique** basée sur :
- Taille du problème : séquences de 12 tokens max
- Capacité nécessaire : ~500K params pour le decoder
- Tests empiriques : 4 couches suffisent, 6 n'améliore pas

### "Le masking causal est-il important ?"

**OUI**, crucial pour l'entraînement :

```python
def _causal_mask(self, seq_len, device):
    # Triangle supérieur = -inf (positions futures masquées)
    mask = torch.triu(torch.ones(seq_len, seq_len), diagonal=1)
    return mask.masked_fill(mask == 1, float('-inf'))
```

Sans masking, le modèle "tricherait" en regardant les tokens futurs pendant le training.

### "Comment le latent est-il injecté dans le Transformer ?"

Via le mécanisme **cross-attention** :

```python
# Le latent devient la "memory" du decoder
memory = self.latent_proj(latent).unsqueeze(1)  # (batch, 1, d_model)

# Le transformer fait cross-attention entre:
# - Query: séquence générée
# - Key/Value: latent (memory)
output = self.transformer(tgt=sequence_emb, memory=memory)
```

### "Pourquoi pas un simple MLP pour le décodeur ?"

Un MLP prédirait tous les tokens **indépendamment** :

```python
# MLP naïf (mauvais)
output = mlp(latent)  # → (batch, 12, 4)
# Chaque position est prédite sans voir les autres !
```

Problème : Pas de cohérence entre composants. Le MLP pourrait prédire le même composant deux fois.

Le Transformer avec attention **garantit** que chaque prédiction voit le contexte.

---

## Comparaison des architectures testées

| Architecture | Type acc | Validité | Commentaire |
|--------------|----------|----------|-------------|
| MLP → MLP | 85% | 5% | Pas de structure |
| CNN → MLP | 91% | 12% | Encoder OK, decoder mauvais |
| CNN → LSTM | 94% | 25% | Mieux mais lent |
| **CNN → Transformer** | **99%** | **60%** | Meilleur compromis |

---

## Résumé

| Composant | Architecture | Justification |
|-----------|--------------|---------------|
| Encodeur | **CNN 1D** | Features locales, invariance translationnelle |
| Décodeur | **Transformer** | Génération séquentielle, attention sur contexte |

**Citation à utiliser en soutenance** :
> "Notre architecture est hybride : CNN pour l'encodeur car Z(f) a des features locales (pics de résonance), et Transformer pour le décodeur car la génération de circuits est séquentielle et nécessite de l'attention sur les composants déjà générés. Chaque partie utilise l'architecture la mieux adaptée à sa sous-tâche."
