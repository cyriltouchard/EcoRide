# 🧪 Tests Unitaires EcoRide - Guide de Démarrage

> **Objectif :** Atteindre 80% de couverture de code  
> **Framework :** Jest + Supertest  
> **Durée estimée :** 2 semaines

---

## 📋 Plan d'Action

### Semaine 1 : Backend Tests
- ✅ Configuration Jest
- 🔄 Tests Controllers (userController, rideController, vehicleController)
- 🔄 Tests Models (userModel, rideModel, creditModel)
- 🔄 Tests Middleware (auth, security)

### Semaine 2 : Frontend Tests
- 📝 Configuration Jest pour browser
- 📝 Tests modules common/ (auth.js, validation.js, utils.js)
- 📝 Tests pages/ (création-compte, connexion, covoiturages)
- 📝 Tests intégration

---

## 🚀 Installation

### 1. Installer les dépendances de test

```bash
cd server
npm install --save-dev jest supertest @jest/globals
```

### 2. Configuration Jest

Créer `server/jest.config.js` (déjà fait)

### 3. Lancer les tests

```bash
# Tous les tests
npm test

# Tests en mode watch (développement)
npm run test:watch

# Couverture de code
npm run test:coverage

# Tests spécifiques
npm test userController
```

---

## 📁 Structure des Tests

```
server/
├── __tests__/
│   ├── unit/
│   │   ├── controllers/
│   │   │   ├── userController.test.js
│   │   │   ├── rideController.test.js
│   │   │   ├── vehicleController.test.js
│   │   │   └── creditController.test.js
│   │   ├── models/
│   │   │   ├── userModel.test.js
│   │   │   ├── rideModel.test.js
│   │   │   └── creditModel.test.js
│   │   └── middleware/
│   │       ├── auth.test.js
│   │       └── security.test.js
│   ├── integration/
│   │   ├── auth.integration.test.js
│   │   ├── rides.integration.test.js
│   │   └── credits.integration.test.js
│   └── setup/
│       ├── testSetup.js
│       └── testDatabase.js
├── jest.config.js
└── package.json
```

---

## 📝 Checklist des Tests

### Backend - Controllers (Priorité Haute)

- [ ] **userController.test.js**
  - [ ] `register()` - inscription utilisateur
  - [ ] `login()` - connexion utilisateur
  - [ ] `getUserProfile()` - récupération profil
  - [ ] `updateProfile()` - mise à jour profil
  - [ ] `updateProfilePicture()` - upload photo
  - [ ] Gestion des erreurs

- [ ] **rideController.test.js**
  - [ ] `createRide()` - création trajet
  - [ ] `getRides()` - liste trajets
  - [ ] `getRideById()` - détails trajet
  - [ ] `updateRide()` - modification trajet
  - [ ] `deleteRide()` - suppression trajet
  - [ ] `searchRides()` - recherche avec filtres

- [ ] **vehicleController.test.js**
  - [ ] `addVehicle()` - ajout véhicule
  - [ ] `getUserVehicles()` - liste véhicules utilisateur
  - [ ] `updateVehicle()` - modification véhicule
  - [ ] `deleteVehicle()` - suppression véhicule

- [ ] **creditController.test.js**
  - [ ] `getUserCredits()` - solde crédits
  - [ ] `addCredits()` - ajout crédits
  - [ ] `deductCredits()` - déduction crédits
  - [ ] `getTransactions()` - historique

### Backend - Models (Priorité Haute)

- [ ] **userModel.test.js**
  - [ ] `create()` - création utilisateur
  - [ ] `findByEmail()` - recherche par email
  - [ ] `findById()` - recherche par ID
  - [ ] `updateProfile()` - mise à jour
  - [ ] Validation des données

- [ ] **rideModel.test.js**
  - [ ] CRUD complet
  - [ ] Recherche avec filtres
  - [ ] Gestion des places disponibles

- [ ] **creditModel.test.js**
  - [ ] Transactions
  - [ ] Calcul du solde
  - [ ] Historique

### Backend - Middleware (Priorité Moyenne)

- [ ] **auth.test.js**
  - [ ] `verifyToken()` - vérification JWT
  - [ ] Protection des routes
  - [ ] Gestion token expiré

- [ ] **security.test.js**
  - [ ] Rate limiting
  - [ ] Validation inputs
  - [ ] Protection NoSQL injection

### Frontend - Modules (Priorité Moyenne)

- [ ] **common/auth.test.js**
  - [ ] `login()` - connexion
  - [ ] `register()` - inscription
  - [ ] `logout()` - déconnexion
  - [ ] Gestion tokens

- [ ] **common/validation.test.js**
  - [ ] `isValidEmail()` - validation email
  - [ ] `isValidPassword()` - validation password
  - [ ] `isValidPhone()` - validation téléphone
  - [ ] Protection ReDoS

- [ ] **common/utils.test.js**
  - [ ] `validateAndSanitizeInput()` - sanitization
  - [ ] `formatDate()` - formatage dates
  - [ ] Autres utilitaires

### Tests d'Intégration (Priorité Basse)

- [ ] **Parcours complet inscription**
- [ ] **Parcours création trajet → réservation**
- [ ] **Parcours paiement crédits**
- [ ] **Tests API endpoints complets**

---

## 📊 Objectifs de Couverture

| Module | Objectif | Actuel | Priorité |
|--------|----------|--------|----------|
| Controllers | 90% | 0% | 🔴 Haute |
| Models | 85% | 0% | 🔴 Haute |
| Middleware | 80% | 0% | 🟡 Moyenne |
| Utils | 75% | 0% | 🟡 Moyenne |
| Frontend | 70% | 0% | 🟢 Basse |
| **TOTAL** | **80%** | **0%** | 🎯 |

---

## 💡 Bonnes Pratiques

### 1. Nommage des tests
```javascript
describe('UserController', () => {
    describe('register', () => {
        it('devrait créer un nouvel utilisateur avec des données valides', async () => {
            // Test
        });
        
        it('devrait rejeter une inscription avec un email invalide', async () => {
            // Test
        });
    });
});
```

### 2. Structure AAA (Arrange-Act-Assert)
```javascript
it('devrait retourner le profil utilisateur', async () => {
    // Arrange - Préparer les données
    const userId = 1;
    const mockUser = { id: 1, email: 'test@test.com' };
    
    // Act - Exécuter l'action
    const result = await getUserProfile(userId);
    
    // Assert - Vérifier le résultat
    expect(result).toEqual(mockUser);
});
```

### 3. Mocking des dépendances
```javascript
jest.mock('../models/userModel');
jest.mock('../config/db-mysql');
```

### 4. Tests isolés
- Chaque test doit être indépendant
- Nettoyer après chaque test (`afterEach`)
- Utiliser `beforeEach` pour setup

---

## 🎯 Prochaines Étapes

### Jour 1-2 : Configuration
- [x] Installer Jest et Supertest
- [x] Créer structure de tests
- [x] Configurer Jest
- [ ] Créer base de test helpers

### Jour 3-5 : Tests Controllers
- [ ] userController.test.js (complet)
- [ ] rideController.test.js (complet)
- [ ] vehicleController.test.js (complet)

### Jour 6-7 : Tests Models
- [ ] Tests modèles MySQL
- [ ] Tests modèles MongoDB

### Jour 8-10 : Tests Frontend
- [ ] Tests modules common/
- [ ] Tests validation
- [ ] Tests utils

### Jour 11-12 : Tests Intégration
- [ ] Parcours complets
- [ ] Tests API end-to-end

### Jour 13-14 : Optimisation
- [ ] Atteindre 80% couverture
- [ ] Refactoring tests
- [ ] Documentation

---

## 📚 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

**🔄 Mise à jour quotidienne de la progression**  
**📊 Objectif : 80% de couverture en 2 semaines**
