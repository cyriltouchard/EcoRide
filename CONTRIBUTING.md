# 🤝 Guide de Contribution - EcoRide

Merci de votre intérêt pour contribuer à EcoRide ! Ce document vous guide à travers le processus de contribution.

---

## 📋 Table des Matières

1. [Code de Conduite](#code-de-conduite)
2. [Comment Contribuer](#comment-contribuer)
3. [Configuration de l'Environnement](#configuration-de-lenvironnement)
4. [Workflow Git](#workflow-git)
5. [Standards de Code](#standards-de-code)
6. [Messages de Commit](#messages-de-commit)
7. [Pull Requests](#pull-requests)
8. [Tests](#tests)
9. [Documentation](#documentation)
10. [Signaler un Bug](#signaler-un-bug)
11. [Proposer une Fonctionnalité](#proposer-une-fonctionnalité)

---

## 🤝 Code de Conduite

### Nos Engagements

En participant à ce projet, vous acceptez de :

- ✅ Être respectueux et courtois
- ✅ Accepter les critiques constructives
- ✅ Se concentrer sur ce qui est le mieux pour la communauté
- ✅ Montrer de l'empathie envers les autres

### Comportements Inacceptables

- ❌ Langage ou images sexualisés
- ❌ Trolling, insultes ou attaques personnelles
- ❌ Harcèlement public ou privé
- ❌ Publication d'informations privées sans permission

---

## 💡 Comment Contribuer

### Types de Contributions Bienvenues

- 🐛 **Signaler des bugs**
- ✨ **Proposer de nouvelles fonctionnalités**
- 📖 **Améliorer la documentation**
- 🎨 **Améliorer l'interface utilisateur**
- ⚡ **Optimiser les performances**
- 🔒 **Renforcer la sécurité**
- ✅ **Ajouter des tests**

---

## 🛠️ Configuration de l'Environnement

### Prérequis

- Node.js 18.x ou supérieur
- npm 9.x ou supérieur
- MySQL 8.0 ou supérieur
- MongoDB 6.0 ou supérieur
- Git 2.x ou supérieur

### Installation

```bash
# 1. Fork le projet sur GitHub

# 2. Cloner votre fork
git clone https://github.com/VOTRE_USERNAME/EcoRide.git
cd EcoRide

# 3. Ajouter le dépôt original comme remote
git remote add upstream https://github.com/cyriltouchard/EcoRide.git

# 4. Installer les dépendances backend
cd server
npm install

# 5. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 6. Initialiser la base de données
npm run db-init

# 7. Créer un compte admin
npm run create-admin

# 8. Démarrer le serveur
npm start
```

### Vérification de l'Installation

```bash
# Vérifier que le serveur démarre
curl http://localhost:3000/health

# Lancer les tests
npm test

# Vérifier la sécurité
npm run security-check
```

---

## 🔄 Workflow Git

### Modèle de Branches

Nous utilisons le workflow GitFlow :

```
main            → Production (code stable)
  ↑
develop         → Développement (intégration)
  ↑
feature/*       → Nouvelles fonctionnalités
fix/*           → Corrections de bugs
hotfix/*        → Corrections urgentes
docs/*          → Documentation
```

### Créer une Branche

```bash
# Mettre à jour develop
git checkout develop
git pull upstream develop

# Créer une branche feature
git checkout -b feature/nom-fonctionnalite

# Créer une branche fix
git checkout -b fix/nom-bug

# Créer une branche docs
git checkout -b docs/nom-documentation
```

### Convention de Nommage

```bash
feature/user-profile           ✅
feature/ride-booking           ✅
fix/password-validation        ✅
fix/database-connection        ✅
docs/api-documentation         ✅
hotfix/security-vulnerability  ✅
```

---

## 📝 Standards de Code

### JavaScript / Node.js

#### Style

```javascript
// ✅ Bon
const getUserById = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  const user = await User.findById(userId);
  return user;
};

// ❌ Mauvais
function get_user(id) {
  return User.findById(id)
}
```

#### Conventions

- **Variables** : camelCase (`userName`, `userId`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_LIMIT`, `API_URL`)
- **Classes** : PascalCase (`UserController`, `RideModel`)
- **Fichiers** : camelCase ou kebab-case (`userController.js`, `ride-model.js`)
- **Indentation** : 2 espaces
- **Point-virgules** : Oui
- **Quotes** : Simple quotes `'` préféré

#### Commentaires

```javascript
/**
 * Crée une nouvelle réservation de trajet
 * @param {number} rideId - ID du trajet
 * @param {number} userId - ID de l'utilisateur
 * @param {number} seats - Nombre de places
 * @returns {Promise<Booking>} La réservation créée
 * @throws {Error} Si pas assez de crédits
 */
const createBooking = async (rideId, userId, seats) => {
  // Vérifier les crédits disponibles
  const credits = await getUserCredits(userId);
  
  if (credits < seats) {
    throw new Error('Crédits insuffisants');
  }
  
  // Créer la réservation
  const booking = await Booking.create({
    ride_id: rideId,
    user_id: userId,
    seats_booked: seats
  });
  
  return booking;
};
```

### SQL

```sql
-- ✅ Bon - Requêtes préparées
const query = 'SELECT * FROM users WHERE id = ?';
const [rows] = await connection.execute(query, [userId]);

-- ❌ Mauvais - Injection SQL possible
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

### HTML/CSS

```html
<!-- ✅ Bon - Sémantique et accessible -->
<section class="ride-search">
  <h2>Rechercher un Trajet</h2>
  <form id="search-form" aria-label="Formulaire de recherche">
    <label for="departure">Ville de départ</label>
    <input 
      type="text" 
      id="departure" 
      name="departure" 
      required 
      aria-required="true"
    >
  </form>
</section>

<!-- ❌ Mauvais -->
<div>
  <div>Rechercher</div>
  <div>
    <input type="text">
  </div>
</div>
```

---

## 💬 Messages de Commit

### Format

Nous utilisons les **Conventional Commits** :

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(rides): add booking system` |
| `fix` | Correction de bug | `fix(auth): resolve token expiration` |
| `docs` | Documentation | `docs(readme): update installation` |
| `style` | Style/format | `style(ui): improve button colors` |
| `refactor` | Refactoring | `refactor(db): optimize queries` |
| `test` | Tests | `test(users): add unit tests` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `perf` | Performance | `perf(api): reduce response time` |
| `security` | Sécurité | `security: fix SQL injection` |

### Exemples

```bash
# Simple
git commit -m "feat: add ride booking feature"

# Avec scope
git commit -m "fix(auth): resolve JWT token expiration"

# Avec body
git commit -m "feat(credits): implement purchase system

- Add purchase endpoint
- Integrate payment logic
- Update user balance

Closes #42"

# Breaking change
git commit -m "feat(api): change response format

BREAKING CHANGE: API now returns data in camelCase instead of snake_case"
```

### Règles

- ✅ Utiliser l'impératif : "add" et non "added"
- ✅ Pas de majuscule au début du subject
- ✅ Pas de point final
- ✅ Maximum 50 caractères pour le subject
- ✅ Ligne vide entre subject et body
- ✅ Body optionnel mais recommandé

---

## 🔀 Pull Requests

### Avant de Soumettre

#### Checklist Développeur

- [ ] Mon code suit les conventions du projet
- [ ] J'ai effectué une auto-review
- [ ] J'ai ajouté des commentaires si nécessaire
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests
- [ ] Tous les tests passent
- [ ] J'ai vérifié la sécurité (`npm run security-check`)
- [ ] J'ai mis à jour le CHANGELOG.md

### Créer une Pull Request

```bash
# 1. Pousser votre branche
git push origin feature/nom-fonctionnalite

# 2. Aller sur GitHub et créer une PR
# 3. Remplir le template de PR
# 4. Assigner des reviewers
# 5. Ajouter des labels appropriés
```

### Template PR

Le template `.github/pull_request_template.md` sera automatiquement utilisé.

Assurez-vous de :

- ✅ Remplir toutes les sections
- ✅ Cocher toutes les checkboxes applicables
- ✅ Lier l'issue correspondante
- ✅ Ajouter des screenshots si UI/UX
- ✅ Décrire les tests effectués

### Processus de Review

1. **Soumission** : Créer la PR
2. **Review** : Un ou plusieurs reviewers examinent le code
3. **Discussion** : Échanges sur les changements
4. **Modifications** : Apporter les corrections demandées
5. **Approbation** : Review approuvée
6. **Merge** : PR mergée dans develop

### Après le Merge

```bash
# Mettre à jour votre branche locale
git checkout develop
git pull upstream develop

# Supprimer la branche locale
git branch -d feature/nom-fonctionnalite

# Supprimer la branche distante (optionnel, peut être fait via GitHub)
git push origin --delete feature/nom-fonctionnalite
```

---

## 🧪 Tests

### Lancer les Tests

```bash
# Tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests d'un fichier spécifique
npm test -- userController.test.js
```

### Écrire des Tests

#### Structure

```javascript
// tests/userController.test.js
const { describe, it, expect, beforeEach, afterEach } = require('@jest/globals');
const UserController = require('../controllers/userController');

describe('UserController', () => {
  describe('getUserById', () => {
    beforeEach(() => {
      // Setup avant chaque test
    });

    afterEach(() => {
      // Cleanup après chaque test
    });

    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = 1;
      
      // Act
      const user = await UserController.getUserById(userId);
      
      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 99999;
      
      // Act & Assert
      await expect(UserController.getUserById(userId))
        .rejects
        .toThrow('User not found');
    });
  });
});
```

### Coverage Attendu

- **Statements** : > 70%
- **Branches** : > 60%
- **Functions** : > 70%
- **Lines** : > 70%

---

## 📖 Documentation

### Quand Documenter

- ✅ Nouvelle fonctionnalité
- ✅ Changement d'API
- ✅ Configuration complexe
- ✅ Comportement non évident
- ✅ Dépendances externes

### Types de Documentation

#### Code (JSDoc)

```javascript
/**
 * @description Crée un nouveau trajet
 * @param {Object} rideData - Données du trajet
 * @param {string} rideData.departure - Ville de départ
 * @param {string} rideData.destination - Ville d'arrivée
 * @param {Date} rideData.date - Date du trajet
 * @param {number} rideData.price - Prix en crédits
 * @returns {Promise<Ride>} Le trajet créé
 * @throws {Error} Si les données sont invalides
 */
```

#### README

Mettre à jour `README.md` si :
- Nouvelle fonctionnalité majeure
- Changement d'installation
- Nouvelle dépendance

#### Documentation Technique

Mettre à jour `document/Documentation-Technique-EcoRide-2025.md` si :
- Architecture modifiée
- Nouveau module
- Changement de base de données

#### API

Documenter chaque endpoint dans `document/API-Documentation.md` :

```markdown
### POST /api/rides

Crée un nouveau trajet.

#### Headers
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

#### Body
```json
{
  "departure": "Paris",
  "destination": "Lyon",
  "date": "2025-11-15T10:00:00Z",
  "price": 5,
  "seats": 3
}
```

#### Response 201
```json
{
  "success": true,
  "ride": {
    "id": 42,
    "departure": "Paris",
    "destination": "Lyon"
  }
}
```
```

---

## 🐛 Signaler un Bug

### Avant de Signaler

1. ✅ Vérifier que le bug n'a pas déjà été signalé
2. ✅ Tester sur la dernière version
3. ✅ Rassembler les informations nécessaires

### Créer une Issue

1. Aller sur [Issues](https://github.com/cyriltouchard/EcoRide/issues)
2. Cliquer sur "New Issue"
3. Sélectionner "🐛 Rapport de Bug"
4. Remplir le template

### Informations à Fournir

- Description claire du bug
- Étapes pour reproduire
- Comportement attendu vs actuel
- Screenshots si applicable
- Environnement (OS, navigateur, version)
- Logs/erreurs

---

## ✨ Proposer une Fonctionnalité

### Avant de Proposer

1. ✅ Vérifier que la fonctionnalité n'existe pas
2. ✅ Vérifier qu'elle n'est pas déjà proposée
3. ✅ S'assurer qu'elle correspond au scope du projet

### Créer une Issue

1. Aller sur [Issues](https://github.com/cyriltouchard/EcoRide/issues)
2. Cliquer sur "New Issue"
3. Sélectionner "✨ Demande de Fonctionnalité"
4. Remplir le template

### Informations à Fournir

- Description de la fonctionnalité
- Problème qu'elle résout
- Solution proposée
- Workflow utilisateur
- Mockups/exemples (si possible)

---

## 📞 Support

### Obtenir de l'Aide

- 📖 Lire la [Documentation](document/)
- 🐛 Chercher dans les [Issues](https://github.com/cyriltouchard/EcoRide/issues)
- 💬 Créer une nouvelle issue de type "Question"

### Contacts

- **GitHub** : [@cyriltouchard](https://github.com/cyriltouchard)
- **Projet** : [EcoRide](https://github.com/cyriltouchard/EcoRide)

---

## 📜 Licence

En contribuant à EcoRide, vous acceptez que vos contributions soient sous licence MIT.

---

## 🙏 Remerciements

Merci de contribuer à EcoRide ! Chaque contribution, grande ou petite, est appréciée. 💚

---

**Dernière mise à jour** : 10 novembre 2025
