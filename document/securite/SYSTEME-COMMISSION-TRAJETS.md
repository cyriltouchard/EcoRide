# 💰 Système de Commission sur les Trajets - EcoRide

## 📋 Vue d'ensemble

Ce document décrit le système de commission mis en place pour les trajets EcoRide. La plateforme prélève une commission fixe de **2 crédits par trajet** réservé.

## 🎯 Règles de Commission

### Commission Standard
- **Montant fixe** : 2 crédits par réservation
- **Prélevé sur** : Le passager paie le prix total
- **Répartition** : 
  - Site EcoRide : 2 crédits
  - Chauffeur : Prix - 2 crédits

### Exemple avec Prix Normal (> 2 crédits)

```
Prix du trajet : 25 crédits
├── Passager paie : 25 crédits
├── Commission EcoRide : 2 crédits
└── Chauffeur reçoit : 23 crédits
```

### Cas Particulier : Prix ≤ 2 Crédits

Lorsque le prix du trajet est **inférieur ou égal à 2 crédits** :

- ⚠️ **La plateforme prend la totalité du montant**
- ❌ **Le chauffeur ne reçoit RIEN**

#### Exemples :

**Prix = 1 crédit**
```
Prix du trajet : 1 crédit
├── Passager paie : 1 crédit
├── Commission EcoRide : 1 crédit (tout)
└── Chauffeur reçoit : 0 crédit ⚠️
```

**Prix = 2 crédits**
```
Prix du trajet : 2 crédits
├── Passager paie : 2 crédits
├── Commission EcoRide : 2 crédits (tout)
└── Chauffeur reçoit : 0 crédit ⚠️
```

**Prix = 3 crédits**
```
Prix du trajet : 3 crédits
├── Passager paie : 3 crédits
├── Commission EcoRide : 2 crédits
└── Chauffeur reçoit : 1 crédit ✅
```

## 🔧 Implémentation Technique

### Backend - creditModel.js

La fonction `processBooking()` gère automatiquement la répartition :

```javascript
const PLATFORM_COMMISSION = 2;

if (amount <= PLATFORM_COMMISSION) {
    // Prix ≤ 2 : Plateforme prend tout
    platformCommission = amount;
    driverAmount = 0;
} else {
    // Prix > 2 : Plateforme prend 2, reste au chauffeur
    platformCommission = PLATFORM_COMMISSION;
    driverAmount = amount - PLATFORM_COMMISSION;
}
```

### Frontend - Avertissements

Deux niveaux d'avertissement pour les chauffeurs :

#### 1. Message Statique (HTML)
Sur la page de proposition de trajet :
```
📌 Commission EcoRide : 2 crédits par trajet.
   Si vous fixez un prix ≤ 2 crédits, la plateforme 
   prendra la totalité et vous ne recevrez rien.
```

#### 2. Avertissement Dynamique (JavaScript)
Apparaît en temps réel si prix ≤ 2 :
```
⚠️ Vous ne recevrez aucun crédit avec ce prix 
   (commission plateforme de 2 crédits)
```

## 📊 Base de Données

### Transactions Enregistrées

Pour chaque réservation, 2 ou 3 transactions sont créées :

**Si prix > 2 crédits :**
```sql
-- 1. Dépense du passager
INSERT INTO credit_transactions 
(user_id, type, amount, description)
VALUES (passager_id, 'depense', montant_total, 'Réservation covoiturage');

-- 2. Commission plateforme
INSERT INTO credit_transactions 
(user_id, type, amount, description)
VALUES (passager_id, 'commission', 2, 'Commission plateforme');

-- 3. Gain du chauffeur
INSERT INTO credit_transactions 
(user_id, type, amount, description)
VALUES (chauffeur_id, 'gain', montant-2, 'Paiement trajet');
```

**Si prix ≤ 2 crédits :**
```sql
-- 1. Dépense du passager
INSERT INTO credit_transactions 
(user_id, type, amount, description)
VALUES (passager_id, 'depense', montant_total, 'Réservation covoiturage');

-- 2. Commission plateforme (totalité)
INSERT INTO credit_transactions 
(user_id, type, amount, description)
VALUES (passager_id, 'commission', montant_total, 'Commission plateforme');

-- 3. PAS de transaction pour le chauffeur (0 crédit)
```

## 🎨 Interface Utilisateur

### Page de Proposition de Trajet

- Label : "Prix par passager (crédits)"
- Message informatif permanent sur la commission
- Avertissement dynamique si prix ≤ 2

### Page de Détails du Trajet

- Affichage clair du prix pour les passagers
- Prix affiché en crédits

## ✅ Avantages du Système

1. **Commission fixe prévisible** : Toujours 2 crédits
2. **Transparence totale** : Avertissements clairs pour les chauffeurs
3. **Simplicité** : Pas de calculs complexes de pourcentages
4. **Protection plateforme** : Commission minimum garantie

## ⚠️ Points d'Attention

### Pour les Chauffeurs
- ⚠️ **Prix minimum recommandé** : 3 crédits (pour recevoir au moins 1 crédit)
- 💡 **Prix optimal** : > 5 crédits pour un revenu significatif
- 🎯 **Trajets gratuits** : Mettez 0 crédit si vous voulez un trajet gratuit

### Pour les Passagers
- Le prix affiché est le prix total à payer
- Pas de frais cachés
- Transaction transparente

## 🔍 Tests et Validation

### Scénarios de Test

```javascript
// Test 1 : Prix = 0 (gratuit)
processBooking(passengerId, driverId, 0, rideId, bookingId)
// Résultat : Pas de transaction

// Test 2 : Prix = 1 crédit
processBooking(passengerId, driverId, 1, rideId, bookingId)
// Résultat : Commission=1, Chauffeur=0

// Test 3 : Prix = 2 crédits
processBooking(passengerId, driverId, 2, rideId, bookingId)
// Résultat : Commission=2, Chauffeur=0

// Test 4 : Prix = 3 crédits
processBooking(passengerId, driverId, 3, rideId, bookingId)
// Résultat : Commission=2, Chauffeur=1

// Test 5 : Prix = 25 crédits
processBooking(passengerId, driverId, 25, rideId, bookingId)
// Résultat : Commission=2, Chauffeur=23
```

## 📝 Notes de Version

### Version 1.0 (25 novembre 2025)
- ✅ Implémentation commission fixe de 2 crédits
- ✅ Gestion du cas prix ≤ 2 crédits
- ✅ Avertissements frontend pour les chauffeurs
- ✅ Transactions MySQL correctement enregistrées
- ✅ Documentation complète

## 🔗 Fichiers Modifiés

1. **Backend**
   - `server/models/creditModel.js` - Logique de commission

2. **Frontend**
   - `public/js/proposer-covoiturage.js` - Avertissement dynamique
   - `public/js/pages/rides/proposer-covoiturage.js` - Validation
   - `proposer-covoiturage.html` - Message informatif

3. **Documentation**
   - `document/securite/SYSTEME-COMMISSION-TRAJETS.md` (ce fichier)

---

**Auteur** : EcoRide Team  
**Date** : 25 novembre 2025  
**Statut** : ✅ Implémenté et documenté
