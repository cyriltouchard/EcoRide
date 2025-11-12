# 📚 Guide des Bonnes Pratiques Git & GitHub - EcoRide

**Guide complet pour développeur en formation**  
**Niveau** : Débutant → Intermédiaire → Pro

---

## 📋 Table des Matières

1. [Organisation du Dépôt](#1-organisation-du-dépôt)
2. [Structure du Projet](#2-structure-du-projet)
3. [README.md Professionnel](#3-readmemd-professionnel)
4. [Fichier .gitignore](#4-fichier-gitignore)
5. [Gestion des Branches](#5-gestion-des-branches)
6. [Messages de Commit](#6-messages-de-commit)
7. [Pull Requests](#7-pull-requests)
8. [Tags et Releases](#8-tags-et-releases)
9. [Documentation](#9-documentation)
10. [Gestion des Issues](#10-gestion-des-issues)
11. [Sécurité](#11-sécurité)
12. [Qualité du Code](#12-qualité-du-code)
13. [Checklist Examen](#13-checklist-examen)
14. [Workflow Professionnel](#14-workflow-professionnel)

---

## 1️⃣ Organisation du Dépôt

### ✅ Nom du Dépôt

**Utiliser un nom clair, court et descriptif**

#### ✅ Exemples Corrects :
```
EcoRide                    ✅ Clair et mémorable
portfolio-2025             ✅ Contextualisé
ecommerce-react            ✅ Technologie visible
chatbot-python             ✅ Descriptif
formation-js-projet-final  ✅ Contexte formation
```

#### ❌ Exemples à Éviter :
```
projet1                    ❌ Pas descriptif
test                       ❌ Trop vague
cours                      ❌ Pas professionnel
monprojet                  ❌ Pas informatif
test123                    ❌ Nom temporaire
```

### 📝 Description du Dépôt

Ajouter une description courte sur GitHub :
```
"Application de covoiturage écologique avec système de crédits et gestion hybride MySQL/MongoDB"
```

### 🏷️ Topics/Tags

Ajouter des tags pertinents :
```
covoiturage, nodejs, react, mysql, mongodb, express, jwt, api-rest
```

---

## 2️⃣ Structure du Projet

### ✅ Structure Recommandée

```
EcoRide/
├─ 📁 server/                    → Backend Node.js
│  ├─ config/                    → Configuration DB
│  ├─ controllers/               → Logique métier
│  ├─ models/                    → Modèles de données
│  ├─ routes/                    → Routes API
│  ├─ middleware/                → Auth, validation, logs
│  ├─ database/                  → Scripts SQL
│  ├─ tests/                     → Tests unitaires
│  ├─ .env.example               → Template variables
│  ├─ package.json               → Dépendances
│  └─ server.js                  → Point d'entrée
│
├─ 📁 public/                    → Frontend
│  ├─ css/                       → Styles
│  ├─ js/                        → Scripts client
│  └─ images/                    → Assets
│
├─ 📁 document/                  → Documentation
│  ├─ Documentation-Technique.md
│  ├─ Manuel-Utilisateur.md
│  ├─ Diagrammes-UML.md
│  └─ Guides-Sécurité/
│
├─ 📁 docker/                    → Configuration Docker
│  ├─ mysql-init.sql
│  └─ mongo-init.js
│
├─ 📁 .git-hooks/                → Git hooks personnalisés
│
├─ 📄 .gitignore                 → Fichiers à ignorer
├─ 📄 README.md                  → Documentation principale ⭐
├─ 📄 LICENSE                    → Licence du projet
├─ 📄 docker-compose.yml         → Orchestration containers
├─ 📄 package.json               → Dépendances frontend (si applicable)
└─ 📄 CHANGELOG.md               → Historique des versions
```

### 🎯 Principes de Structure

- ✅ **Séparation claire** : Backend / Frontend / Docs
- ✅ **Nommage cohérent** : camelCase ou kebab-case (mais pas les deux)
- ✅ **Dossiers logiques** : Regrouper par fonctionnalité
- ✅ **Tests séparés** : Dossier `tests/` ou `__tests__/`

---

## 3️⃣ README.md Professionnel

### ⭐ Le README est LA PREMIÈRE CHOSE que l'examinateur lit !

### ✅ Template Complet pour EcoRide

```markdown
# 🚗 EcoRide - Plateforme de Covoiturage Écologique

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://www.mysql.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Objectif du Projet

EcoRide est une application web de covoiturage écologique permettant aux utilisateurs de :
- Proposer des trajets en tant que chauffeur
- Réserver des places en tant que passager
- Gérer un système de crédits virtuels
- Consulter des statistiques environnementales (CO2 économisé)

**Projet réalisé dans le cadre de** : Formation Développeur Web et Web Mobile  
**Date** : Novembre 2025  
**Durée** : 3 mois

## ✨ Fonctionnalités Principales

### Pour les Utilisateurs
- ✅ Inscription et connexion sécurisée (JWT)
- ✅ Recherche de covoiturages par ville et date
- ✅ Réservation de places
- ✅ Système de crédits (20 crédits offerts à l'inscription)
- ✅ Profil utilisateur avec statistiques
- ✅ Historique des trajets

### Pour les Chauffeurs
- ✅ Ajout et gestion de véhicules
- ✅ Création de trajets
- ✅ Gestion des réservations
- ✅ Préférences de conduite (musique, animaux, fumeurs)

### Pour les Administrateurs
- ✅ Gestion des utilisateurs
- ✅ Modération des trajets
- ✅ Statistiques globales

## 🛠️ Stack Technique

### Backend
- **Node.js** 18.x - Runtime JavaScript
- **Express.js** 4.x - Framework web
- **MySQL** 8.0 - Base de données relationnelle
- **MongoDB** 6.0 - Base de données NoSQL
- **JWT** - Authentification
- **Bcrypt** - Hachage de mots de passe

### Frontend
- **HTML5** / **CSS3**
- **JavaScript** Vanilla
- **Bootstrap** 5 - Framework CSS

### Outils
- **Docker** - Conteneurisation
- **Git** - Gestion de version
- **SonarQube** - Analyse de code
- **Postman** - Tests API

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18.x ou supérieur
- MySQL 8.0 ou supérieur
- MongoDB 6.0 ou supérieur
- npm ou yarn

### 1️⃣ Cloner le projet
```bash
git clone https://github.com/cyriltouchard/EcoRide.git
cd EcoRide
```

### 2️⃣ Configurer les variables d'environnement
```bash
# Backend
cd server
cp .env.example .env
# Éditer .env avec vos paramètres
```

### 3️⃣ Installer les dépendances
```bash
# Backend
cd server
npm install
```

### 4️⃣ Initialiser la base de données
```bash
# MySQL
cd server
npm run db-init

# Créer un compte admin
npm run create-admin
```

### 5️⃣ Démarrer l'application
```bash
# Backend (port 3000)
cd server
npm start

# Frontend (port 5500)
# Ouvrir index.html avec Live Server
```

### 🐳 Avec Docker (Recommandé)
```bash
docker-compose up -d
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Vérification de sécurité
npm run security-check

# Audit des dépendances
npm audit
```

## 📁 Organisation du Code

```
server/
├─ controllers/    → Logique métier
├─ models/         → Modèles de données (MySQL & MongoDB)
├─ routes/         → Routes API REST
├─ middleware/     → Auth, validation, logs
└─ config/         → Configuration DB
```

## 🔐 Sécurité

Le projet implémente plusieurs mesures de sécurité :
- ✅ Authentification JWT
- ✅ Hachage bcrypt des mots de passe
- ✅ Protection contre les injections SQL (requêtes préparées)
- ✅ Protection contre les injections NoSQL (validation stricte)
- ✅ Protection contre ReDoS (expressions régulières optimisées)
- ✅ Rate limiting sur les endpoints sensibles
- ✅ Validation des entrées utilisateur
- ✅ Headers de sécurité (Helmet.js)

**Voir** : `document/GUIDE-SECURITE-IDENTIFIANTS.md`

## 📸 Captures d'Écran

### Page d'accueil
![Accueil](document/screenshots/home.png)

### Recherche de trajets
![Recherche](document/screenshots/search.png)

### Espace utilisateur
![Profil](document/screenshots/profile.png)

## 📖 Documentation

- [Documentation Technique](document/Documentation-Technique-EcoRide-2025.md)
- [Manuel Utilisateur](document/Manuel-Utilisateur-EcoRide-2025.md)
- [Diagrammes UML](document/Diagrammes-UML-EcoRide-2025.md)
- [Guide de Sécurité](document/GUIDE-SECURITE-IDENTIFIANTS.md)
- [Plan de Déploiement](document/Plan-Deploiement-EcoRide-2025.md)

## 🔄 Workflow Git

Le projet utilise le workflow GitFlow :
- `main` : Code stable en production
- `dev` : Développement en cours
- `feature/*` : Nouvelles fonctionnalités
- `hotfix/*` : Correctifs urgents

## 📝 Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique détaillé des versions.

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'feat: Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](LICENSE) pour plus d'informations.

## 👤 Auteur

**Cyril Touchard**
- GitHub: [@cyriltouchard](https://github.com/cyriltouchard)
- Projet: [EcoRide](https://github.com/cyriltouchard/EcoRide)

## 🙏 Remerciements

- Formation Développeur Web et Web Mobile
- Formateurs et mentors
- Communauté open source

---

**⭐ Si ce projet vous a plu, n'hésitez pas à lui donner une étoile sur GitHub !**
```

### 📝 Sections Essentielles d'un README

| Section | Importance | Description |
|---------|------------|-------------|
| Titre + Badges | ⭐⭐⭐⭐⭐ | Première impression |
| Objectif | ⭐⭐⭐⭐⭐ | Contexte du projet |
| Fonctionnalités | ⭐⭐⭐⭐⭐ | Ce que fait l'app |
| Stack Technique | ⭐⭐⭐⭐⭐ | Technologies utilisées |
| Installation | ⭐⭐⭐⭐⭐ | Comment lancer le projet |
| Screenshots | ⭐⭐⭐⭐ | Visuel attractif |
| Documentation | ⭐⭐⭐⭐ | Liens vers docs détaillées |
| Tests | ⭐⭐⭐ | Qualité du code |
| Contribution | ⭐⭐ | Si projet open source |
| Auteur | ⭐⭐⭐⭐⭐ | Qui vous êtes |

---

## 4️⃣ Fichier .gitignore

### ✅ .gitignore Complet pour EcoRide

```gitignore
# ====================================
# SECRETS ET VARIABLES D'ENVIRONNEMENT
# ====================================
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env
.env.*
!.env.example

# ====================================
# NODE.JS / NPM
# ====================================
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.npm
.yarn-integrity
.pnp.*

# ====================================
# BASES DE DONNÉES
# ====================================
*.db
*.sqlite
*.sqlite3
*.sql.backup
db_backup/
data/
mysql-data/
mongo-data/

# ====================================
# LOGS
# ====================================
logs/
*.log
npm-debug.log*
combined.log
error.log
access.log

# ====================================
# SYSTÈME D'EXPLOITATION
# ====================================
# macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/

# Linux
*~

# ====================================
# IDE / ÉDITEURS
# ====================================
# VSCode
.vscode/
*.code-workspace

# IntelliJ / WebStorm
.idea/
*.iml
*.iws
*.ipr

# Sublime Text
*.sublime-project
*.sublime-workspace

# Vim
*.swp
*.swo
*~

# ====================================
# BUILD / DIST
# ====================================
dist/
build/
out/
.next/
.nuxt/
.cache/
.parcel-cache/

# ====================================
# TESTS / COVERAGE
# ====================================
coverage/
.nyc_output/
test-results/
*.lcov

# ====================================
# FICHIERS TEMPORAIRES
# ====================================
tmp/
temp/
*.tmp
*.bak
*.backup
*.old

# ====================================
# UPLOADS / MEDIAS UTILISATEUR
# ====================================
uploads/
public/uploads/
user-uploads/

# ====================================
# CERTIFICATS SSL (si générés localement)
# ====================================
*.pem
*.key
*.crt
*.cert

# ====================================
# DOCKER (fichiers runtime)
# ====================================
.docker/
docker-compose.override.yml

# ====================================
# ARCHIVES
# ====================================
*.zip
*.tar.gz
*.rar
*.7z
```

### 🚫 Ne JAMAIS Commiter

| Fichier | Pourquoi | Conséquence |
|---------|----------|-------------|
| `.env` | Contient secrets | 🔴 Fuite de données |
| `node_modules/` | Trop volumineux | 🔴 Dépôt lourd |
| `*.log` | Données temporaires | 🟡 Pollution |
| Mots de passe | Sécurité | 🔴 Hack |
| Clés API | Sécurité | 🔴 Compromission |
| `package-lock.json` (débat) | Dépendances | 🟡 Conflits |

---

## 5️⃣ Gestion des Branches

### 🌳 Modèle GitFlow (Recommandé pour Examens)

```
main (production)
  ↑
  └── develop (développement)
       ↑
       ├── feature/login
       ├── feature/ride-search
       ├── feature/payment
       └── hotfix/security-fix
```

### 📊 Types de Branches

| Branche | Rôle | Durée de vie | Merge vers |
|---------|------|--------------|------------|
| `main` | Code stable, production | ♾️ Permanente | - |
| `develop` | Intégration des features | ♾️ Permanente | `main` |
| `feature/*` | Nouvelle fonctionnalité | 🕐 Temporaire | `develop` |
| `hotfix/*` | Correction urgente | 🕐 Temporaire | `main` + `develop` |
| `release/*` | Préparation version | 🕐 Temporaire | `main` + `develop` |

### ✅ Convention de Nommage des Branches

```bash
# Features (fonctionnalités)
feature/login                   ✅
feature/user-profile            ✅
feature/ride-booking            ✅

# Fixes (corrections)
fix/password-validation         ✅
fix/database-connection         ✅

# Hotfix (corrections urgentes)
hotfix/security-vulnerability   ✅
hotfix/critical-bug             ✅

# Documentation
docs/readme-update              ✅
docs/api-documentation          ✅

# Refactoring
refactor/code-cleanup           ✅
refactor/optimize-queries       ✅
```

### ❌ Mauvais Exemples

```bash
test                    ❌ Trop vague
fix                     ❌ Pas descriptif
feature                 ❌ Quel feature ?
cyril-travail           ❌ Pas professionnel
nouvelle-fonction       ❌ Pas de convention
```

### 🔄 Workflow avec Branches

```bash
# 1️⃣ Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/ride-booking

# 2️⃣ Travailler sur la branche
# ... faire vos modifications ...

# 3️⃣ Commiter régulièrement
git add .
git commit -m "feat: implement ride booking form"

# 4️⃣ Pousser la branche
git push origin feature/ride-booking

# 5️⃣ Créer une Pull Request sur GitHub
# (via l'interface web)

# 6️⃣ Après validation, merger dans develop
# (via l'interface web ou en ligne de commande)

# 7️⃣ Supprimer la branche locale
git branch -d feature/ride-booking

# 8️⃣ Supprimer la branche distante
git push origin --delete feature/ride-booking
```

---

## 6️⃣ Messages de Commit

### 🎯 Convention des Messages de Commit (Conventional Commits)

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 📝 Types de Commit

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat: add ride booking system` |
| `fix` | Correction de bug | `fix: resolve password validation` |
| `docs` | Documentation | `docs: update README installation` |
| `style` | Format, style (pas de logique) | `style: format code with prettier` |
| `refactor` | Refactoring (ni feat ni fix) | `refactor: optimize database queries` |
| `test` | Ajout de tests | `test: add unit tests for auth` |
| `chore` | Tâches diverses | `chore: update dependencies` |
| `perf` | Amélioration performance | `perf: optimize image loading` |
| `ci` | CI/CD | `ci: add GitHub Actions workflow` |
| `build` | Build system | `build: update webpack config` |
| `revert` | Annulation commit précédent | `revert: undo last commit` |

### ✅ Exemples de Bons Commits

```bash
feat: add user authentication with JWT
feat(auth): implement login endpoint
feat(rides): add ride search by city

fix: resolve null pointer in user controller
fix(security): patch SQL injection vulnerability
fix(ui): correct responsive layout on mobile

docs: add API documentation
docs(readme): improve installation instructions

refactor: clean up ride controller code
refactor(db): optimize database queries

test: add unit tests for user service
test(auth): add integration tests for login

style: format code with ESLint
style(ui): update button colors

chore: update npm dependencies
chore(deps): bump express from 4.17 to 4.18
```

### ❌ Exemples de Mauvais Commits

```bash
Update                          ❌ Trop vague
fix stuff                       ❌ Pas descriptif
modifications                   ❌ Pas de contexte
test                           ❌ Trop court
correction bug                  ❌ Quel bug ?
WIP                            ❌ Work in progress (à éviter)
...                            ❌ Pas de sens
a                              ❌ Incompréhensible
```

### 📏 Règles pour un Bon Message de Commit

1. ✅ **Utiliser l'impératif** : "add" et non "added" ou "adds"
2. ✅ **Être court** : 50 caractères max pour le titre
3. ✅ **Être descriptif** : Expliquer QUOI et POURQUOI
4. ✅ **Commencer par un type** : feat, fix, docs, etc.
5. ✅ **Pas de point final** dans le titre
6. ✅ **Séparer titre et body** par une ligne vide

### 📝 Commit avec Corps (body)

```bash
git commit -m "feat: add ride booking system

- Implement booking form with validation
- Add credit deduction logic
- Update database schema with bookings table
- Add email notification on successful booking

Closes #42"
```

### 🔗 Lier Commit et Issue

```bash
# Fermer automatiquement une issue
git commit -m "fix: resolve login bug

Closes #15"

# Référencer une issue
git commit -m "feat: add payment system

Related to #23"
```

---

## 7️⃣ Pull Requests

### ✅ Pourquoi Utiliser les Pull Requests ?

Même si vous travaillez seul, créer des PR montre un **workflow professionnel** :

- ✅ **Historique clair** des fonctionnalités
- ✅ **Revue de code** (auto-review)
- ✅ **Tests avant merge**
- ✅ **Documentation** des changements
- ✅ **Traçabilité** pour l'examen

### 📝 Template de Pull Request

```markdown
## 🎯 Description

Ajout du système de réservation de trajets avec gestion des crédits.

## 🔗 Issue Liée

Closes #42

## 📋 Type de Changement

- [x] Nouvelle fonctionnalité (feature)
- [ ] Correction de bug (fix)
- [ ] Refactoring
- [ ] Documentation

## ✅ Checklist

- [x] Mon code suit les conventions du projet
- [x] J'ai ajouté des tests
- [x] Tous les tests passent
- [x] J'ai mis à jour la documentation
- [x] J'ai testé manuellement la fonctionnalité
- [x] Pas de secrets ou données sensibles
- [x] Le code est commenté si nécessaire

## 🧪 Tests Effectués

- [x] Tests unitaires OK
- [x] Tests d'intégration OK
- [x] Tests manuels OK
- [x] Tests de sécurité OK

## 📸 Screenshots (si applicable)

![Booking Form](screenshots/booking-form.png)

## 📝 Notes Supplémentaires

- Utilisation de transactions pour garantir l'atomicité
- Validation côté client et serveur
- Rate limiting ajouté sur l'endpoint

## 🔍 Review Checklist pour le Reviewer

- [ ] Le code est lisible et maintenable
- [ ] Les tests couvrent les cas d'usage
- [ ] La documentation est à jour
- [ ] Pas de régression
- [ ] Performance acceptable
```

### 🔄 Workflow Pull Request

```bash
# 1️⃣ Créer une branche
git checkout -b feature/ride-booking

# 2️⃣ Développer et commiter
git add .
git commit -m "feat: implement ride booking"

# 3️⃣ Pousser la branche
git push origin feature/ride-booking

# 4️⃣ Créer la PR sur GitHub
# - Aller sur le dépôt
# - Cliquer sur "Pull requests" > "New pull request"
# - Sélectionner base: develop et compare: feature/ride-booking
# - Remplir le template
# - Créer la PR

# 5️⃣ Auto-review (important pour l'examen !)
# - Relire votre code
# - Tester une dernière fois
# - Vérifier les tests automatiques

# 6️⃣ Merger la PR
# - Cliquer sur "Merge pull request"
# - Choisir le type de merge (Squash recommandé)

# 7️⃣ Supprimer la branche
git branch -d feature/ride-booking
git push origin --delete feature/ride-booking
```

---

## 8️⃣ Tags et Releases

### 🏷️ Versioning Sémantique (SemVer)

```
MAJOR.MINOR.PATCH

Exemple : v1.2.3
```

- **MAJOR** (1.x.x) : Changements incompatibles
- **MINOR** (x.2.x) : Nouvelles fonctionnalités compatibles
- **PATCH** (x.x.3) : Corrections de bugs

### ✅ Convention de Tagging

```bash
v1.0.0    → Première version stable
v1.1.0    → Ajout de fonctionnalités
v1.1.1    → Correction de bug
v2.0.0    → Changement majeur (breaking change)
```

### 📝 Créer un Tag

```bash
# Tag léger
git tag v1.0.0

# Tag annoté (recommandé)
git tag -a v1.0.0 -m "Release version 1.0.0 - Initial stable release"

# Pousser le tag
git push origin v1.0.0

# Pousser tous les tags
git push origin --tags
```

### 🚀 Créer une Release sur GitHub

1. Aller sur **Releases** > **Draft a new release**
2. Choisir le tag : `v1.0.0`
3. Titre : `Version 1.0.0 - Initial Release`
4. Description :

```markdown
## 🎉 Version 1.0.0 - Initial Release

### ✨ Nouvelles Fonctionnalités
- Système d'authentification JWT
- Création et recherche de trajets
- Système de réservation avec crédits
- Gestion des véhicules
- Profils utilisateurs

### 🔒 Sécurité
- Hachage bcrypt des mots de passe
- Protection contre injections SQL/NoSQL
- Rate limiting sur endpoints sensibles

### 🐛 Corrections
- Résolution du bug de validation email
- Correction de l'affichage responsive

### 📖 Documentation
- README complet
- Documentation technique
- Guide de sécurité

### 🔗 Liens
- [Documentation complète](docs/)
- [Changelog](CHANGELOG.md)
```

5. Attacher des fichiers (si nécessaire) : ZIP du code, assets, etc.
6. Publier la release

### 📋 Exemple de CHANGELOG.md

```markdown
# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/lang/fr/).

## [1.1.0] - 2025-11-10

### Ajouté
- Système d'avis et notation (US10)
- Statistiques environnementales (CO2 économisé)
- Filtres avancés de recherche

### Modifié
- Amélioration de l'interface utilisateur
- Optimisation des requêtes base de données

### Corrigé
- Bug d'affichage des dates
- Problème de validation formulaire

### Sécurité
- Correction vulnérabilité injection NoSQL
- Protection contre ReDoS

## [1.0.0] - 2025-10-15

### Ajouté
- Système d'authentification JWT
- Création et recherche de trajets
- Système de crédits
- Gestion des véhicules

## [0.1.0] - 2025-09-01

### Ajouté
- Structure initiale du projet
- Configuration base de données
- Première interface utilisateur
```

---

## 9️⃣ Documentation

### 📚 Structure de Documentation Recommandée

```
document/
├─ README.md                                      ⭐ À la racine !
├─ CHANGELOG.md                                   ⭐ Historique versions
├─ CONTRIBUTING.md                                → Guide contribution
├─ LICENSE                                        → Licence du projet
│
├─ 📁 technique/
│  ├─ Architecture.md                             → Schémas architecture
│  ├─ API-Documentation.md                        → Endpoints API
│  ├─ Database-Schema.md                          → Schéma BDD
│  └─ Technologies.md                             → Stack technique
│
├─ 📁 utilisateur/
│  ├─ Manuel-Utilisateur.md                       → Guide utilisateur
│  ├─ Guide-Installation.md                       → Installation pas à pas
│  └─ FAQ.md                                      → Questions fréquentes
│
├─ 📁 developpeur/
│  ├─ Guide-Contribution.md                       → Comment contribuer
│  ├─ Conventions-Code.md                         → Standards de code
│  ├─ Git-Workflow.md                             → Workflow Git
│  └─ Tests.md                                    → Comment tester
│
├─ 📁 securite/
│  ├─ Guide-Securite.md                           → Bonnes pratiques
│  ├─ Vulnerabilites-Corrigees.md                 → Historique sécurité
│  └─ Audit-Securite.md                           → Rapports audit
│
└─ 📁 screenshots/
   ├─ home.png
   ├─ search.png
   └─ profile.png
```

### ✅ Documents Essentiels pour un Examen

| Document | Importance | Contenu |
|----------|------------|---------|
| README.md | ⭐⭐⭐⭐⭐ | Vue d'ensemble, installation |
| CHANGELOG.md | ⭐⭐⭐⭐ | Historique des versions |
| Architecture.md | ⭐⭐⭐⭐ | Diagrammes, choix techniques |
| API-Documentation.md | ⭐⭐⭐⭐ | Endpoints, exemples |
| Manuel-Utilisateur.md | ⭐⭐⭐ | Comment utiliser l'app |
| Guide-Installation.md | ⭐⭐⭐⭐⭐ | Démarrage rapide |

---

## 🔟 Gestion des Issues

### 📝 Utiliser les Issues pour :

- ✅ **Planifier** les fonctionnalités
- ✅ **Suivre** les bugs
- ✅ **Documenter** les améliorations
- ✅ **Organiser** le travail

### ✅ Template d'Issue - Bug

```markdown
## 🐛 Description du Bug

Impossible de créer un trajet lorsque le véhicule n'a pas d'image.

## 📋 Étapes pour Reproduire

1. Aller sur "Proposer un covoiturage"
2. Sélectionner un véhicule sans image
3. Remplir le formulaire
4. Cliquer sur "Créer le trajet"

## ✅ Comportement Attendu

Le trajet devrait être créé avec une image par défaut.

## ❌ Comportement Actuel

Erreur 500 - "Image required"

## 📸 Screenshots

![Error](screenshots/vehicle-error.png)

## 🖥️ Environnement

- OS: Windows 11
- Navigateur: Chrome 120
- Version: v1.0.0

## 📝 Informations Supplémentaires

Stack trace :
```
Error: Image required
  at VehicleController.create (line 45)
```
```

### ✅ Template d'Issue - Feature

```markdown
## ✨ Fonctionnalité Demandée

Système d'avis et notation pour les trajets

## 🎯 Problème à Résoudre

Les utilisateurs ne peuvent pas évaluer leurs expériences de covoiturage.

## 💡 Solution Proposée

Ajouter un système de notation 1-5 étoiles avec commentaire optionnel.

## 🔄 Workflow

1. Après un trajet terminé, l'utilisateur reçoit une notification
2. Il peut noter le chauffeur/passager
3. Les notes sont affichées sur les profils
4. Moyenne calculée automatiquement

## ✅ Critères d'Acceptation

- [ ] Interface de notation (étoiles)
- [ ] Champ commentaire
- [ ] Affichage note moyenne sur profil
- [ ] Notification après trajet
- [ ] Tests unitaires

## 📝 Notes Supplémentaires

Inspiré du système Uber/BlaBlaCar
```

### 🏷️ Labels Recommandés

```
bug               → 🐛 Correction de bug
feature           → ✨ Nouvelle fonctionnalité
documentation     → 📖 Documentation
enhancement       → ⚡ Amélioration
security          → 🔒 Sécurité
good first issue  → 👶 Bon premier issue
help wanted       → 🆘 Aide souhaitée
priority: high    → 🔴 Priorité haute
priority: medium  → 🟡 Priorité moyenne
priority: low     → 🟢 Priorité basse
```

---

## 1️⃣1️⃣ Sécurité

### 🚫 NE JAMAIS Commiter sur GitHub

#### ❌ INTERDIT ABSOLU

```bash
# Mots de passe
password = "monMotDePasse123"

# Clés API
API_KEY = "sk-abc123xyz789"

# Tokens
JWT_SECRET = "secret_key_123"

# Identifiants
DB_USER = "admin"
DB_PASSWORD = "root123"

# Certificats
private.key
certificate.pem
```

### ✅ Utiliser .env.example

```bash
# .env.example (À COMMITER)
DB_HOST=localhost
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
API_KEY=
```

```bash
# .env (À NE PAS COMMITER)
DB_HOST=localhost
DB_PORT=3306
DB_USER=ecoride_user
DB_PASSWORD=super_secret_password_123
DB_NAME=ecoride_db

JWT_SECRET=my_ultra_secret_jwt_key_2025
API_KEY=sk-real-api-key-here
```

### 🔒 Checklist Sécurité Git

- [ ] `.env` dans `.gitignore`
- [ ] Aucun mot de passe dans le code
- [ ] `.env.example` fourni
- [ ] Scan de sécurité effectué (`npm run security-check`)
- [ ] Pas de clés API dans l'historique Git
- [ ] Certificats SSL non commités

### 🛠️ Vérifier l'Historique Git

```bash
# Rechercher des mots de passe potentiels
git log --all --full-history --grep="password"

# Rechercher dans tous les fichiers
git log --all --full-history -- .env

# Scanner avec trufflehog (outil externe)
trufflehog git https://github.com/user/repo
```

### 🚨 Si Vous Avez Commité un Secret

1. **NE PAS** simplement supprimer et recommiter
2. Le secret reste dans l'historique Git !
3. **Solutions** :

```bash
# Option 1: Supprimer de l'historique (DANGER)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Option 2: Utiliser BFG Repo-Cleaner (recommandé)
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Option 3: Nouveau dépôt (si petit projet)
# Créer un nouveau dépôt sans l'historique compromis
```

4. **Changer IMMÉDIATEMENT** tous les secrets exposés !

---

## 1️⃣2️⃣ Qualité du Code

### ✅ Outils Recommandés

#### Linters

```bash
# JavaScript/Node.js
npm install --save-dev eslint prettier

# Python
pip install flake8 black pylint

# PHP
composer require --dev phpstan/phpstan
```

#### Tests

```bash
# Node.js
npm install --save-dev jest mocha chai

# Python
pip install pytest coverage
```

#### Analyse de Code

- **SonarQube** / **SonarCloud**
- **CodeClimate**
- **Snyk** (sécurité)
- **Dependabot** (dépendances)

### 📋 Checklist Qualité

- [ ] Code linté (ESLint, Flake8...)
- [ ] Tests unitaires (>70% coverage)
- [ ] Tests d'intégration
- [ ] Pas de code dupliqué
- [ ] Documentation du code
- [ ] Gestion des erreurs
- [ ] Validation des entrées
- [ ] Sécurité vérifiée

### 🚀 CI/CD (Bonus pour examen)

Exemple de GitHub Actions :

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run security-check
```

---

## 1️⃣3️⃣ Checklist Examen

### ✅ Avant de Rendre Votre Projet

#### 📋 Dépôt GitHub

- [ ] Nom de dépôt clair et professionnel
- [ ] Description complète
- [ ] Tags/Topics pertinents
- [ ] README.md complet et attractif
- [ ] Badges (build, coverage, license)
- [ ] Screenshots dans le README
- [ ] .gitignore configuré
- [ ] Aucun secret committé
- [ ] CHANGELOG.md à jour

#### 📋 Code

- [ ] Code propre et commenté
- [ ] Conventions de nommage respectées
- [ ] Pas de code mort (commenté)
- [ ] Pas de console.log en production
- [ ] Gestion des erreurs
- [ ] Validation des entrées

#### 📋 Documentation

- [ ] README complet
- [ ] Documentation technique
- [ ] Manuel utilisateur
- [ ] Guide d'installation
- [ ] Diagrammes UML/Architecture
- [ ] API documentée

#### 📋 Tests

- [ ] Tests unitaires présents
- [ ] Tests passent tous
- [ ] Coverage > 70%
- [ ] Tests d'intégration

#### 📋 Git

- [ ] Historique propre
- [ ] Messages de commit clairs
- [ ] Branches organisées
- [ ] Pull Requests créées
- [ ] Tags/Releases

#### 📋 Sécurité

- [ ] Pas de secrets hardcodés
- [ ] .env.example fourni
- [ ] Scan de sécurité effectué
- [ ] Dépendances à jour
- [ ] npm audit clean

#### 📋 Présentation

- [ ] Démo fonctionnelle
- [ ] Présentation préparée
- [ ] Screenshots/Vidéo
- [ ] Points techniques à expliquer identifiés

---

## 1️⃣4️⃣ Workflow Professionnel

### 🔄 Workflow Complet Exemple

```bash
# ====================================
# 1️⃣ DÉMARRER UNE NOUVELLE FEATURE
# ====================================

# Mettre à jour develop
git checkout develop
git pull origin develop

# Créer une branche feature
git checkout -b feature/ride-booking

# ====================================
# 2️⃣ DÉVELOPPER
# ====================================

# ... développement ...

# Commiter régulièrement
git add src/controllers/rideController.js
git commit -m "feat(rides): add booking logic"

git add src/models/booking.js
git commit -m "feat(models): create booking model"

git add tests/ride.test.js
git commit -m "test(rides): add booking tests"

# ====================================
# 3️⃣ POUSSER ET CRÉER PR
# ====================================

# Pousser la branche
git push origin feature/ride-booking

# Sur GitHub :
# - Créer Pull Request
# - Remplir le template
# - Auto-review

# ====================================
# 4️⃣ MERGER
# ====================================

# Après validation, merger via GitHub

# Mettre à jour develop localement
git checkout develop
git pull origin develop

# Supprimer la branche locale
git branch -d feature/ride-booking

# ====================================
# 5️⃣ RELEASE (quand prêt)
# ====================================

# Créer une branche release
git checkout -b release/v1.1.0

# Finaliser (bump version, changelog)
npm version minor  # 1.0.0 → 1.1.0

# Merger dans main
git checkout main
git merge release/v1.1.0

# Créer un tag
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0

# Merger dans develop
git checkout develop
git merge release/v1.1.0

# Supprimer la branche release
git branch -d release/v1.1.0

# Créer la Release sur GitHub
```

### 📅 Planning Type pour Projet d'Examen

#### Semaine 1-2 : Setup
- [ ] Créer le dépôt
- [ ] Structure du projet
- [ ] README initial
- [ ] .gitignore
- [ ] Branches (main, develop)

#### Semaine 3-6 : Développement
- [ ] Features par branches
- [ ] Commits réguliers
- [ ] Pull Requests
- [ ] Tests

#### Semaine 7 : Finalisation
- [ ] Documentation complète
- [ ] Screenshots
- [ ] CHANGELOG
- [ ] Release v1.0.0

#### Semaine 8 : Préparation Examen
- [ ] Démo
- [ ] Présentation
- [ ] Révision code
- [ ] Points à expliquer

---

## 🎯 Résumé - Points Clés pour l'Examen

### ⭐ Top 10 des Bonnes Pratiques

1. **README complet et attractif** ⭐⭐⭐⭐⭐
2. **Branches organisées** (GitFlow) ⭐⭐⭐⭐⭐
3. **Messages de commit clairs** (Conventional Commits) ⭐⭐⭐⭐⭐
4. **Pull Requests avec template** ⭐⭐⭐⭐
5. **.gitignore bien configuré** ⭐⭐⭐⭐⭐
6. **Aucun secret committé** ⭐⭐⭐⭐⭐
7. **Documentation technique** ⭐⭐⭐⭐
8. **Tags et Releases** ⭐⭐⭐⭐
9. **Tests unitaires** ⭐⭐⭐
10. **Historique Git propre** ⭐⭐⭐⭐

### 🚫 Top 10 des Erreurs à Éviter

1. ❌ Tout développer sur `main`
2. ❌ Commits "fix" ou "test" sans contexte
3. ❌ Commiter `node_modules/`
4. ❌ Commiter `.env` avec secrets
5. ❌ Pas de README
6. ❌ Historique Git chaotique
7. ❌ Pas de documentation
8. ❌ Code non testé
9. ❌ Nom de dépôt non professionnel
10. ❌ Pas de .gitignore

---

## 📚 Ressources Complémentaires

### 🔗 Liens Utiles

- [Git Documentation Officielle](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitFlow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

### 📖 Commandes Git Essentielles

```bash
# Configuration
git config --global user.name "Votre Nom"
git config --global user.email "email@example.com"

# Initialisation
git init
git clone <url>

# Branches
git branch                          # Lister
git branch <nom>                    # Créer
git checkout <nom>                  # Changer
git checkout -b <nom>               # Créer + changer
git branch -d <nom>                 # Supprimer

# Commits
git status                          # État
git add <fichier>                   # Ajouter
git add .                           # Tout ajouter
git commit -m "message"             # Commiter
git commit --amend                  # Modifier dernier commit

# Synchronisation
git fetch                           # Récupérer
git pull                            # Récupérer + merger
git push                            # Pousser
git push origin <branche>           # Pousser branche

# Historique
git log                             # Historique
git log --oneline --graph --all     # Graphique
git diff                            # Différences

# Tags
git tag                             # Lister
git tag <nom>                       # Créer
git tag -a <nom> -m "message"       # Tag annoté
git push origin <tag>               # Pousser tag

# Annulation
git reset HEAD <fichier>            # Unstage
git checkout -- <fichier>           # Annuler modifications
git revert <commit>                 # Annuler commit

# Nettoyage
git clean -fd                       # Supprimer fichiers non suivis
git prune                           # Nettoyer objets
```

---

## ✅ Template README.md pour Votre Projet

**Un README.md prêt à l'emploi est disponible dans ce guide !**

Copiez la section [3️⃣ README.md Professionnel](#3️⃣-readmemd-professionnel) et adaptez-la à votre projet.

---

## 🎓 Conclusion

En suivant ce guide, votre projet sera :
- ✅ **Professionnel**
- ✅ **Bien documenté**
- ✅ **Facile à évaluer**
- ✅ **Sécurisé**
- ✅ **Maintenable**

**L'examen juge votre DÉMARCHE, pas seulement votre code.**

Un projet avec un Git propre, une bonne documentation et des bonnes pratiques fera la différence ! 🚀

---

**Bonne chance pour votre examen ! 🎓✨**

---

**Auteur** : Guide créé pour Cyril Touchard  
**Date** : 10 novembre 2025  
**Version** : 1.0.0
