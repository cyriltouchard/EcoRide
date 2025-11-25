# 🔄 Guide de Migration - Système de Commission v1.0

## 📋 Vue d'ensemble

Ce guide explique comment le nouveau système de commission fonctionne et comment il s'intègre avec le code existant.

---

## 🎯 Changement Principal

### Avant
- Commission calculée manuellement
- Pas de gestion des cas prix < commission
- Risque de valeurs négatives

### Après ✅
- Commission automatique de 2 crédits
- Gestion intelligente des prix bas
- Protection contre les erreurs

---

## 🔧 Détails Techniques

### Fonction `processBooking()`

**Signature** :
```javascript
static async processBooking(passengerId, driverId, amount, rideId, bookingId)
```

**Paramètres** :
- `passengerId` : ID MongoDB du passager
- `driverId` : ID MongoDB du chauffeur
- `amount` : Prix total du trajet (en crédits)
- `rideId` : ID du trajet
- `bookingId` : ID de la réservation (optionnel)

**Retour** :
```javascript
{
    passenger_credits: Object,      // Crédits restants du passager
    driver_credits: Object,         // Crédits totaux du chauffeur
    amount_charged: Number,         // Montant débité du passager
    platform_commission: Number,    // Commission prélevée
    driver_earned: Number,          // Montant reçu par le chauffeur
    warning: String|null           // Avertissement si chauffeur ne reçoit rien
}
```

---

## 💡 Cas d'Usage

### Cas 1 : Trajet Normal (> 2 crédits)

```javascript
const result = await CreditModel.processBooking(
    'passenger-123',
    'driver-456', 
    25,              // 25 crédits
    'ride-789',
    'booking-101'
);

// Résultat :
// - passenger_credits : solde actuel - 25
// - platform_commission : 2
// - driver_earned : 23
// - warning : null
```

**Transactions MySQL** :
```sql
-- 1. Passager paie 25 crédits
user_id=passenger-123, type=depense, amount=25

-- 2. Plateforme reçoit 2 crédits
user_id=passenger-123, type=commission, amount=2

-- 3. Chauffeur reçoit 23 crédits
user_id=driver-456, type=gain, amount=23
```

---

### Cas 2 : Prix Bas (≤ 2 crédits)

```javascript
const result = await CreditModel.processBooking(
    'passenger-123',
    'driver-456',
    1.5,             // 1.5 crédits
    'ride-789',
    'booking-101'
);

// Résultat :
// - passenger_credits : solde actuel - 1.5
// - platform_commission : 1.5 (tout)
// - driver_earned : 0 ⚠️
// - warning : "Prix inférieur ou égal à la commission..."
```

**Transactions MySQL** :
```sql
-- 1. Passager paie 1.5 crédits
user_id=passenger-123, type=depense, amount=1.5

-- 2. Plateforme reçoit TOUT
user_id=passenger-123, type=commission, amount=1.5

-- 3. PAS de transaction pour le chauffeur (0 crédit)
```

---

## 🛡️ Gestion des Erreurs

### Crédits Insuffisants

```javascript
try {
    const result = await CreditModel.processBooking(...);
} catch (error) {
    if (error.message === 'Crédits insuffisants pour cette réservation') {
        // Le passager n'a pas assez de crédits
        showNotification('Solde insuffisant', 'error');
    }
}
```

### Rollback Automatique

En cas d'erreur, **toutes les transactions sont annulées** :

```javascript
try {
    await connection.beginTransaction();
    // ... opérations ...
    await connection.commit();
} catch (error) {
    await connection.rollback();  // ← Annulation automatique
    throw error;
}
```

---

## 🎨 Interface Utilisateur

### Avertissement pour Chauffeurs

**Quand ?** Lors de la création d'un trajet avec prix ≤ 2

**Où ?** Page `proposer-covoiturage.html`

**Apparence** :
```
⚠️ Vous ne recevrez aucun crédit avec ce prix 
   (commission plateforme de 2 crédits)
```

### Code JavaScript

```javascript
priceInput.addEventListener('input', (e) => {
    const price = parseFloat(e.target.value);
    
    if (price > 0 && price <= 2) {
        // Créer et afficher l'avertissement
        const warning = document.createElement('p');
        warning.className = 'error-message';
        warning.innerHTML = '⚠️ Vous ne recevrez aucun crédit...';
        priceInput.parentElement.appendChild(warning);
    }
});
```

---

## 🔗 Intégration avec Routes

### Route de Réservation

```javascript
// routes/creditRoutes.js
router.post('/process-booking', authenticateToken, async (req, res) => {
    const { driver_id, amount, ride_id, booking_id } = req.body;
    
    try {
        const result = await CreditModel.processBooking(
            req.user.id,     // ID du passager (depuis JWT)
            driver_id,
            amount,
            ride_id,
            booking_id
        );
        
        // Afficher un avertissement si le chauffeur ne reçoit rien
        if (result.warning) {
            console.warn('⚠️', result.warning);
        }
        
        res.json({
            success: true,
            message: 'Réservation effectuée',
            data: result
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
```

---

## 📊 Structure Base de Données

### Table `credit_transactions`

```sql
CREATE TABLE credit_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    transaction_type ENUM('gain', 'depense', 'commission', 'remboursement', 'bonus'),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    related_booking_id VARCHAR(255),
    related_ride_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Types de transaction** :
- `depense` : Passager paie le trajet
- `commission` : Commission plateforme
- `gain` : Chauffeur reçoit paiement

---

## 🧪 Tests

### Test Unitaire

```javascript
test('Prix de 2 crédits : chauffeur ne reçoit rien', async () => {
    const result = await CreditModel.processBooking(
        'passenger-id',
        'driver-id',
        2,
        'ride-id',
        'booking-id'
    );
    
    expect(result.platform_commission).toBe(2);
    expect(result.driver_earned).toBe(0);
    expect(result.warning).toBeTruthy();
});
```

### Test d'Intégration

```bash
# Créer un trajet à 1 crédit
POST /api/rides
{
    "prix_par_place": 1,
    ...
}

# Réserver le trajet
POST /api/credits/process-booking
{
    "driver_id": "...",
    "amount": 1,
    "ride_id": "..."
}

# Vérifier dans MySQL
SELECT * FROM credit_transactions 
WHERE related_ride_id = '...'
ORDER BY created_at;

# Résultat attendu :
# 1. depense = -1 (passager)
# 2. commission = 1 (plateforme)
# 3. PAS de ligne pour le chauffeur
```

---

## ⚙️ Configuration

### Constantes

```javascript
// Dans creditModel.js
const PLATFORM_COMMISSION = 2;  // Commission fixe
```

Pour modifier la commission, changer cette constante.

---

## 🚨 Points d'Attention

### ❌ À NE PAS FAIRE

```javascript
// MAUVAIS : Calculer manuellement la commission
const driverAmount = amount - 2;

// MAUVAIS : Ne pas vérifier le cas prix ≤ 2
if (amount > 0) {
    creditDriver(driverId, amount - 2);
}
```

### ✅ À FAIRE

```javascript
// BON : Utiliser processBooking()
const result = await CreditModel.processBooking(
    passengerId, 
    driverId, 
    amount, 
    rideId, 
    bookingId
);

// BON : Vérifier le warning
if (result.warning) {
    console.warn(result.warning);
}
```

---

## 📚 Ressources

- 📖 **Documentation complète** : `SYSTEME-COMMISSION-TRAJETS.md`
- 📝 **Résumé rapide** : `RESUME-COMMISSION-TRAJETS.md`
- 🧪 **Tests** : `server/__tests__/unit/models/creditModel.commission.test.js`

---

## 🆘 Support

### Questions Fréquentes

**Q : Puis-je changer la commission de 2 crédits ?**  
R : Oui, modifier la constante `PLATFORM_COMMISSION` dans `creditModel.js`

**Q : Que se passe-t-il si le prix est 0 ?**  
R : Trajet gratuit, aucune transaction créée

**Q : Les anciennes réservations sont-elles affectées ?**  
R : Non, seules les nouvelles réservations utilisent ce système

**Q : Comment tester en local ?**  
R : Lancer les tests avec `npm test` dans le dossier `server/`

---

**Version** : 1.0  
**Date** : 25 novembre 2025  
**Statut** : ✅ Production Ready
