# 📊 Diagrammes - Système de Commission EcoRide

## 🎯 Vue d'ensemble

```mermaid
graph LR
    A[Passager] -->|Paie| B[Prix Total]
    B -->|2 crédits| C[Plateforme EcoRide]
    B -->|Prix - 2| D[Chauffeur]
    
    style A fill:#3498db
    style B fill:#f39c12
    style C fill:#27ae60
    style D fill:#9b59b6
```

---

## 💰 Flux de Paiement - Cas Normal (Prix > 2 crédits)

```mermaid
sequenceDiagram
    participant P as 🧳 Passager
    participant S as 💻 Système
    participant E as 🏢 EcoRide
    participant C as 🚗 Chauffeur
    
    P->>S: Réserve trajet (25 crédits)
    S->>P: Débite 25 crédits
    S->>E: Commission 2 crédits
    S->>C: Crédite 23 crédits
    S->>P: ✅ Réservation confirmée
    
    Note over E: +2 crédits
    Note over C: +23 crédits
```

**Résultat** :
- Passager : -25 crédits
- EcoRide : +2 crédits
- Chauffeur : +23 crédits

---

## ⚠️ Flux de Paiement - Prix Bas (Prix ≤ 2 crédits)

```mermaid
sequenceDiagram
    participant P as 🧳 Passager
    participant S as 💻 Système
    participant E as 🏢 EcoRide
    participant C as 🚗 Chauffeur
    
    P->>S: Réserve trajet (1 crédit)
    S->>P: Débite 1 crédit
    S->>E: Commission 1 crédit (TOUT)
    S--xC: ❌ Aucun crédit
    S->>P: ⚠️ Réservation confirmée
    
    Note over E: +1 crédit (100%)
    Note over C: +0 crédit ⚠️
```

**Résultat** :
- Passager : -1 crédit
- EcoRide : +1 crédit (tout)
- Chauffeur : +0 crédit ⚠️

---

## 📈 Répartition par Tranche de Prix

```mermaid
pie title Trajet à 25 crédits
    "Chauffeur (92%)" : 23
    "EcoRide (8%)" : 2
```

```mermaid
pie title Trajet à 5 crédits
    "Chauffeur (60%)" : 3
    "EcoRide (40%)" : 2
```

```mermaid
pie title Trajet à 2 crédits
    "Chauffeur (0%)" : 0
    "EcoRide (100%)" : 2
```

---

## 🔄 Diagramme de Décision

```mermaid
flowchart TD
    A[Réservation créée] --> B{Prix du trajet ?}
    B -->|Prix = 0| C[Trajet gratuit<br/>Aucune transaction]
    B -->|Prix > 0 et ≤ 2| D[Commission = Prix<br/>Chauffeur = 0]
    B -->|Prix > 2| E[Commission = 2<br/>Chauffeur = Prix - 2]
    
    C --> F[Fin]
    D --> G[⚠️ Avertissement chauffeur]
    E --> H[✅ Transactions normales]
    
    G --> F
    H --> F
    
    style C fill:#95a5a6
    style D fill:#e74c3c
    style E fill:#27ae60
```

---

## 🗄️ Schéma Base de Données

```mermaid
erDiagram
    CREDIT_TRANSACTIONS {
        int id PK
        varchar user_id FK
        enum transaction_type
        decimal amount
        text description
        varchar related_booking_id
        varchar related_ride_id
        timestamp created_at
    }
    
    USER_CREDITS {
        varchar user_id PK
        decimal current_credits
        timestamp updated_at
    }
    
    CREDIT_TRANSACTIONS ||--o{ USER_CREDITS : "met à jour"
```

**Types de transactions pour une réservation :**

1. **Transaction DEPENSE** (Passager)
   - `transaction_type` = 'depense'
   - `amount` = prix total
   - `user_id` = passager

2. **Transaction COMMISSION** (Plateforme)
   - `transaction_type` = 'commission'
   - `amount` = 2 (ou prix si ≤ 2)
   - `user_id` = passager

3. **Transaction GAIN** (Chauffeur) - *Si prix > 2*
   - `transaction_type` = 'gain'
   - `amount` = prix - 2
   - `user_id` = chauffeur

---

## 🎨 Interface Utilisateur - Avertissement

```mermaid
stateDiagram-v2
    [*] --> SaisiePrix
    SaisiePrix --> PrixNormal: Prix > 2
    SaisiePrix --> PrixBas: Prix ≤ 2
    
    PrixNormal --> ValidationOK: ✅ Validation
    PrixBas --> AvertissementRouge: ⚠️ Alerte affichée
    
    AvertissementRouge --> ValidationBloquée: Message erreur
    
    ValidationOK --> [*]
    ValidationBloquée --> [*]
```

**États de l'interface :**
- **Prix > 2** : Pas d'avertissement, validation OK
- **Prix ≤ 2** : Avertissement rouge visible
- **Prix = 0** : Trajet gratuit, pas d'avertissement

---

## 📊 Graphique des Revenus

```
Revenus par Prix de Trajet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prix    │ EcoRide │ Chauffeur
────────┼─────────┼───────────
1 €     │   1 €   │   0 € ⚠️
2 €     │   2 €   │   0 € ⚠️
3 €     │   2 €   │   1 €
5 €     │   2 €   │   3 €
10 €    │   2 €   │   8 €
25 €    │   2 €   │  23 €
50 €    │   2 €   │  48 €
100 €   │   2 €   │  98 €

📈 Plus le prix augmente, plus la part du chauffeur augmente
⚠️  Prix recommandé minimum : 3 € (pour que le chauffeur gagne)
```

---

## 🔐 Sécurité des Transactions

```mermaid
flowchart TD
    A[Début Transaction] --> B[BEGIN TRANSACTION]
    B --> C{Crédits suffisants ?}
    C -->|Non| D[ROLLBACK]
    C -->|Oui| E[Débiter passager]
    E --> F[Créditer plateforme]
    F --> G{Prix > 2 ?}
    G -->|Oui| H[Créditer chauffeur]
    G -->|Non| I[Ignorer chauffeur]
    H --> J[COMMIT]
    I --> J
    J --> K[✅ Fin]
    D --> L[❌ Erreur]
    
    style D fill:#e74c3c
    style J fill:#27ae60
    style L fill:#e74c3c
```

**Garanties** :
- ✅ Atomicité : Tout ou rien
- ✅ Cohérence : Solde toujours correct
- ✅ Isolation : Transactions séparées
- ✅ Durabilité : Enregistrement permanent

---

## 📱 Vue Mobile - Avertissement

```
┌─────────────────────────────────┐
│  Proposer un Trajet             │
├─────────────────────────────────┤
│                                 │
│  💰 Prix par place              │
│  ┌───────────────────────────┐  │
│  │ 1              crédits    │  │
│  └───────────────────────────┘  │
│                                 │
│  ⚠️  Vous ne recevrez aucun    │
│      crédit avec ce prix       │
│      (commission plateforme    │
│      de 2 crédits)             │
│                                 │
│  ℹ️  Commission EcoRide :      │
│     2 crédits par trajet.      │
│     Si prix ≤ 2, la plateforme │
│     prendra la totalité.       │
│                                 │
│  [ Publier le covoiturage ]    │
│                                 │
└─────────────────────────────────┘
```

---

## 🎯 Résumé Visuel

```
┌─────────────────────────────────────────┐
│   SYSTÈME DE COMMISSION ECORIDE         │
├─────────────────────────────────────────┤
│                                         │
│  Règle Simple :                         │
│  ════════════                           │
│                                         │
│  🏢 EcoRide gagne toujours 2 crédits   │
│  🚗 Chauffeur reçoit le reste          │
│                                         │
│  Cas particulier :                      │
│  ════════════════                       │
│                                         │
│  Si Prix ≤ 2 crédits                   │
│  → EcoRide prend TOUT                   │
│  → Chauffeur reçoit 0                   │
│                                         │
│  Exemples :                             │
│  ════════                               │
│                                         │
│  25 crédits → EcoRide: 2, Vous: 23 ✅   │
│   5 crédits → EcoRide: 2, Vous:  3 ✅   │
│   2 crédits → EcoRide: 2, Vous:  0 ⚠️   │
│   1 crédit  → EcoRide: 1, Vous:  0 ⚠️   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📚 Légende

| Symbole | Signification |
|---------|---------------|
| ✅ | Valide, fonctionne correctement |
| ⚠️ | Avertissement, attention requise |
| ❌ | Erreur, action bloquée |
| 🏢 | Plateforme EcoRide |
| 🚗 | Chauffeur |
| 🧳 | Passager |
| 💰 | Crédits / Argent |
| 📊 | Statistiques / Graphiques |
| 🔐 | Sécurité |

---

**Version** : 1.0  
**Date** : 25 novembre 2025  
**Auteur** : EcoRide Team
