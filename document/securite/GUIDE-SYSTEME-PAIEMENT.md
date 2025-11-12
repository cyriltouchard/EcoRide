# 💳 Guide du Système de Paiement et de Crédits - EcoRide

## 📋 Vue d'ensemble

Le système de crédits EcoRide permet aux utilisateurs d'acheter des crédits pour réserver des places dans les covoiturages. Ce guide explique comment utiliser et configurer le système de paiement.

---

## 🎯 Fonctionnalités Principales

### 1. **Achat de Crédits**
- **3 packs disponibles** :
  - 🌟 **Pack Découverte** : 10 crédits pour 5,00 € (0,50 €/crédit)
  - 🔥 **Pack Standard** : 25 crédits pour 10,00 € (0,40 €/crédit) + 5 crédits bonus
  - 👑 **Pack Premium** : 60 crédits pour 20,00 € (0,33 €/crédit) + 10 crédits bonus

### 2. **Moyens de Paiement**
- 💳 **Carte bancaire** (simulation)
- 💼 **PayPal** (simulation - prêt pour intégration)

### 3. **Sécurité**
- ✅ Validation des données de paiement
- ✅ Vérification du montant et du nombre de crédits
- ✅ Authentification requise
- ✅ Transactions enregistrées

---

## 🚀 Utilisation

### Pour les Utilisateurs

1. **Accéder à la page d'achat** :
   - Depuis l'espace utilisateur : cliquer sur **"Acheter des crédits"**
   - URL directe : `http://localhost:8080/acheter-credits.html`

2. **Choisir un pack** :
   - Comparer les 3 offres disponibles
   - Cliquer sur **"Acheter maintenant"**

3. **Finaliser le paiement** :
   - Choisir **Carte bancaire** ou **PayPal**
   - Remplir les informations de paiement
   - Cliquer sur **"Payer maintenant"**

4. **Confirmation** :
   - Les crédits sont ajoutés instantanément
   - Le nouveau solde s'affiche automatiquement

### Informations de Test (Carte Bancaire)

Pour tester le système en mode simulation :

```
Numéro de carte : 1234 5678 9012 3456
Date d'expiration : 12/25
CVV : 123
Nom du titulaire : Votre nom
```

---

## 🔧 Configuration Technique

### Fichiers du Système

#### Frontend
- **`acheter-credits.html`** : Page d'achat de crédits
- **`public/css/style.css`** : Styles de la page (lignes ~2230-2700)
- **`public/js/script.js`** : Logique de paiement (lignes ~930-1150)

#### Backend
- **`server/routes/creditRoutes.js`** : Routes API (ligne 280+)
- **`server/models/creditModel.js`** : Gestion des crédits en base de données

### API Endpoints

#### **POST** `/api/credits/purchase`
Acheter des crédits

**Headers** :
```json
{
  "Content-Type": "application/json",
  "x-auth-token": "<token>"
}
```

**Body** :
```json
{
  "packageType": "standard",
  "credits": 25,
  "amount": 10.00,
  "paymentMethod": "card"
}
```

**Response (Succès)** :
```json
{
  "success": true,
  "message": "Achat de 25 crédits effectué avec succès",
  "data": {
    "credits_added": 25,
    "new_balance": 125
  }
}
```

#### **GET** `/api/credits/balance`
Obtenir le solde de crédits actuel

**Response** :
```json
{
  "success": true,
  "data": {
    "current_credits": 100,
    "total_earned": 200,
    "total_spent": 100,
    "last_transaction": "2025-10-27T10:30:00.000Z"
  }
}
```

---

## 🛠️ Intégration de Vrais Systèmes de Paiement

### Option 1 : Stripe

1. **Installation** :
```bash
npm install stripe
```

2. **Configuration** :
```javascript
// server/config/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
```

3. **Modification de la route** :
```javascript
// Dans creditRoutes.js
const stripe = require('../config/stripe');

router.post('/purchase', authenticateToken, async (req, res) => {
    try {
        // ... validations
        
        // Créer une session de paiement Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `EcoRide - ${packageType}`,
                    },
                    unit_amount: amount * 100, // en centimes
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/acheter-credits.html`,
        });
        
        res.json({ url: session.url });
    } catch (error) {
        // ...
    }
});
```

### Option 2 : PayPal

1. **Installation** :
```bash
npm install @paypal/checkout-server-sdk
```

2. **Configuration** :
```javascript
// server/config/paypal.js
const paypal = require('@paypal/checkout-server-sdk');

const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
);

const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;
```

---

## 📊 Base de Données

### Table : `user_credits`

```sql
CREATE TABLE user_credits (
    user_id INT PRIMARY KEY,
    current_credits INT DEFAULT 0,
    total_earned INT DEFAULT 0,
    total_spent INT DEFAULT 0,
    last_transaction DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Table : `credit_transactions`

```sql
CREATE TABLE credit_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('purchase', 'earn', 'spend', 'refund') NOT NULL,
    amount INT NOT NULL,
    description VARCHAR(255),
    related_id INT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔒 Sécurité

### Validations Implémentées

1. **Authentification obligatoire** : Token JWT requis
2. **Validation des montants** : Vérification côté serveur
3. **Prévention de la fraude** :
   - Montants fixes par package
   - Correspondance credits/prix vérifiée
   - Impossible de modifier le prix côté client

### Recommandations

- ⚠️ **Ne jamais faire confiance au client** : Toujours valider côté serveur
- 🔐 **Utiliser HTTPS** en production
- 📝 **Logger toutes les transactions** pour audit
- 💰 **Vérifier les webhooks** des systèmes de paiement
- 🛡️ **Implémenter un rate limiting** pour éviter les abus

---

## 🎨 Interface Utilisateur

### Affichage du Solde

Le solde de crédits s'affiche :
- ✅ Dans l'en-tête de l'espace utilisateur
- ✅ Sur la page d'achat de crédits
- ✅ Mis à jour automatiquement après achat

### Responsive Design

La page d'achat est **100% responsive** :
- 📱 **Mobile** : Cards empilées verticalement
- 💻 **Tablette/Desktop** : Grille de 3 colonnes

---

## 🐛 Débogage

### Vérifier si les crédits sont ajoutés

```sql
SELECT * FROM user_credits WHERE user_id = 5;
SELECT * FROM credit_transactions WHERE user_id = 5 ORDER BY created_at DESC LIMIT 10;
```

### Logs Backend

Les logs affichent :
```
✅ Connexion MySQL réussie
🍃 Connexion MongoDB réussie
🚀 Serveur démarré sur port 3000
```

### Console Frontend

Ouvrir la console du navigateur (F12) pour voir :
- 🔵 Requêtes authentifiées
- 📡 Réponses des API
- 📦 Données reçues

---

## 📈 Statistiques et Rapports

### Ajouter un Dashboard Admin

Créer une page pour voir :
- 💰 **Total des ventes** par pack
- 📊 **Nombre de transactions** par jour
- 👥 **Utilisateurs avec le plus de crédits**
- 💳 **Méthodes de paiement** les plus utilisées

Exemple de requête :
```sql
SELECT 
    packageType,
    COUNT(*) as nb_achats,
    SUM(amount) as total_ventes
FROM credit_transactions
WHERE type = 'purchase'
GROUP BY packageType;
```

---

## ✅ Checklist de Déploiement

Avant de mettre en production :

- [ ] Intégrer un vrai système de paiement (Stripe/PayPal)
- [ ] Configurer les webhooks pour confirmer les paiements
- [ ] Activer HTTPS
- [ ] Ajouter des tests unitaires
- [ ] Implémenter un système de remboursement
- [ ] Créer une page "Historique des achats"
- [ ] Ajouter des emails de confirmation
- [ ] Configurer les variables d'environnement (.env)
- [ ] Tester en mode sandbox (Stripe/PayPal)
- [ ] Obtenir les clés API de production
- [ ] Vérifier la conformité RGPD
- [ ] Ajouter les mentions légales de paiement

---

## 🎓 Support et Documentation

- 📧 **Support** : contact@ecoride.fr
- 📚 **Documentation Stripe** : https://stripe.com/docs
- 💼 **Documentation PayPal** : https://developer.paypal.com/docs

---

## 🆕 Évolutions Futures

### Fonctionnalités à ajouter

1. **Crédits gratuits** :
   - Bonus de bienvenue (10 crédits)
   - Parrainage (5 crédits par filleul)
   - Programme de fidélité

2. **Abonnements** :
   - Pass mensuel : 50 crédits/mois
   - Pass annuel : 600 crédits/an (réduction 20%)

3. **Promotions** :
   - Codes promo
   - Ventes flash
   - Réductions saisonnières

4. **Historique détaillé** :
   - Export PDF des factures
   - Graphiques de consommation
   - Alertes de solde faible

---

## 📝 Notes Importantes

- 🔴 **Mode actuel** : SIMULATION de paiement
- ⚠️ Aucune carte bancaire réelle n'est débitée
- ✅ Tous les tests peuvent être effectués sans risque
- 🎯 Parfait pour démonstration et développement

---

**Dernière mise à jour** : 27 octobre 2025  
**Version** : 1.0  
**Auteur** : Équipe EcoRide
