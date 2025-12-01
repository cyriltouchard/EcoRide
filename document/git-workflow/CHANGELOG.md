# Changelog - EcoRide

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versioning Sémantique](https://semver.org/lang/fr/).

---

## [Unreleased]

### À Venir
- Notifications en temps réel
- Application mobile
- Système de chat intégré
- Système de recommandations intelligentes

---

## [2.1.0] - 2025-12-01

### ⭐ Système d'Avis et Notations Complet

#### ✨ Ajouté
- **Notation des chauffeurs** sur 5 critères (ponctualité, conduite, propreté, amabilité)
- **Avis sur le site** avec système de recommandation
- **Affichage temps réel** des notes sur pages recherche et détails trajet
- **Éligibilité automatique** : Trajets terminés disponibles pour notation
- **Statistiques détaillées** : Notes moyennes et répartition par critère
- **Interface étoiles interactive** : Hover, sélection, reset
- **Dashboard admin MySQL** : Statistiques complètes (utilisateurs, trajets, crédits, avis)
- **Graphiques Chart.js** : Visualisation activité par jour

#### 🔧 Modifié
- **Backend** : `reviewHybridController.js` - Validation robuste booking + date trajet
- **Backend** : `adminController.js` - Migration complète stats vers MySQL
- **Frontend** : 8 fichiers JavaScript avec parseFloat pour AVG() MySQL
- **Frontend** : Boutons notation avec data attributes (sécurité XSS)
- **Frontend** : Reset complet du formulaire de notation avec étoiles

#### 🗄️ Base de Données MySQL
- **Tables créées** :
  - `driver_reviews` - Avis sur les chauffeurs
  - `site_reviews` - Avis sur le site EcoRide
  - `review_responses` - Réponses aux avis (admin/chauffeur)
- **Requêtes optimisées** : Remplacement vues SQL par requêtes directes
- **Statistiques temps réel** : Dashboard admin 100% MySQL

#### 🔐 Sécurité
- **Validation booking** : Status `IN ('confirme', 'termine')` + date vérifiée
- **Protection XSS** : Sanitisation complète commentaires
- **Vérification éligibilité** : Trajets passés uniquement
- **Double validation** : Frontend + Backend

#### 📝 Documentation
- `README.md` - Section complète système d'avis
- `Index-Documentation-EcoRide-2025.md` - Mise à jour avec nouveautés
- Commit `47ab064` - Documentation technique détaillée

#### 🧪 Tests Validés
- ✅ Éligibilité trajets (confirme + termine + date passée)
- ✅ Boutons notation fonctionnels
- ✅ Soumission avis sans 403 Forbidden
- ✅ Affichage notes sur toutes les pages
- ✅ Dashboard admin avec vraies données
- ✅ Conversions parseFloat AVG() MySQL

### 💰 Système de Commission sur les Trajets - 2025-11-25

#### ✨ Ajouté
- **Commission fixe de 2 crédits** par trajet réservé
- Gestion intelligente des prix inférieurs ou égaux à 2 crédits
- Avertissements pour les chauffeurs lors de la création de trajets à prix bas
- Documentation complète du système de commission
- Tests unitaires pour la répartition des crédits

#### 🔧 Modifié
- **Backend** : `creditModel.processBooking()` - Calcul automatique de la commission
- **Frontend** : Validation et avertissements en temps réel sur le prix
- **HTML** : Message informatif sur la commission dans le formulaire de proposition

#### 📝 Documentation
- `SYSTEME-COMMISSION-TRAJETS.md` - Documentation technique complète
- `RESUME-COMMISSION-TRAJETS.md` - Résumé des modifications
- `GUIDE-MIGRATION-COMMISSION.md` - Guide pour les développeurs

#### 🧪 Tests
- Tests unitaires pour tous les scénarios de commission
- Validation des cas prix ≤ 2 crédits
- Tests d'intégrité des transactions

---

## [1.0.0] - 2025-11-10

### 🎉 Version Initiale

#### ✨ Ajouté

##### Authentification & Utilisateurs
- Système d'inscription et connexion sécurisé avec JWT
- Authentification Bearer Token
- Hachage des mots de passe avec bcrypt (salt factor 10)
- Gestion des profils utilisateurs
- Photos de profil
- Préférences de conduite (musique, animaux, fumeurs)
- Historique des trajets effectués
- Statistiques utilisateur (trajets, km parcourus)

##### Gestion des Trajets
- Création de trajets par les chauffeurs
- Recherche de trajets par ville et date
- Filtrage des résultats de recherche
- Réservation de places
- Gestion des statuts de réservation
- Historique des réservations
- Détails complets des trajets

##### Système de Crédits
- 20 crédits offerts à l'inscription
- Achat de crédits (10€ = 10 crédits)
- Déduction de crédits lors des réservations
- Historique des transactions
- Affichage du solde en temps réel

##### Gestion des Véhicules
- Ajout de véhicules par les chauffeurs
- Informations détaillées (marque, modèle, année, etc.)
- Photos des véhicules
- Association véhicule-trajet
- Nombre de places disponibles

##### Administration
- Tableau de bord administrateur
- Gestion des utilisateurs
- Modération des trajets
- Statistiques globales de la plateforme
- Logs d'activité

##### Base de Données
- Architecture hybride MySQL + MongoDB
- Modèles SQL pour données transactionnelles
- Modèles MongoDB pour recherche et données étendues
- Synchronisation MySQL ↔ MongoDB
- Migrations et scripts d'initialisation

##### API REST
- Endpoints utilisateurs (/api/users)
- Endpoints trajets (/api/rides)
- Endpoints véhicules (/api/vehicles)
- Endpoints crédits (/api/credits)
- Endpoints avis (/api/reviews)
- Endpoints administration (/api/admin)
- Endpoint santé (/health)

##### Interface Utilisateur
- Page d'accueil responsive
- Formulaire de recherche intuitive
- Espace utilisateur personnalisé
- Espace chauffeur dédié
- Interface de réservation
- Système de navigation fluide
- Design responsive mobile-first

##### Sécurité
- Protection contre injections SQL (requêtes préparées)
- Protection contre injections NoSQL (validation parseInt)
- Protection contre ReDoS (regex optimisées)
- Rate limiting sur endpoints sensibles
- Validation stricte des entrées utilisateur
- Headers de sécurité (Helmet.js)
- CORS configuré
- Scripts de sécurité automatisés

##### Documentation
- README complet
- Documentation technique détaillée
- Manuel utilisateur
- Diagrammes UML (cas d'usage, classes, séquence)
- Guide de sécurité
- Guide des identifiants
- Plan de déploiement
- Charte graphique
- Maquettes HTML

##### DevOps
- Configuration Docker (mysql, mongodb)
- docker-compose.yml
- Scripts d'initialisation base de données
- Scripts npm personnalisés
- Git hooks de sécurité
- Analyse de code (SonarQube)

#### 🔒 Sécurité

##### Vulnérabilités Corrigées
- **CWE-798** : Suppression du hash bcrypt hardcodé dans init-db.js
- **CWE-1333** : Correction vulnérabilité ReDoS dans validation email
- **CWE-943** : Protection contre injections NoSQL dans les contrôleurs hybrides

##### Mesures de Sécurité
- Script de création admin sécurisé (`create-admin.js`)
- Scanner de sécurité automatisé (`security-check.js`)
- Guide complet de sécurité (347 lignes)
- Documentation des corrections (1,355 lignes)
- .gitignore configuré pour secrets
- .env.example fourni

#### 🛠️ Tech Stack

##### Backend
- Node.js 18.x
- Express.js 4.x
- MySQL 8.0 (base de données relationnelle)
- MongoDB 6.0 (base de données NoSQL)
- bcryptjs (hachage)
- jsonwebtoken (JWT)
- mysql2 (driver MySQL)
- mongoose (ODM MongoDB)

##### Frontend
- HTML5
- CSS3
- JavaScript Vanilla
- Bootstrap 5

##### Outils
- Docker & Docker Compose
- Git & GitHub
- SonarQube
- ESLint
- Postman

#### 📖 Documentation

##### Fichiers Documentation (9 fichiers, 2,265+ lignes)
- Index-Documentation-EcoRide-2025.md
- Documentation-Technique-EcoRide-2025.md
- Manuel-Utilisateur-EcoRide-2025.md
- Diagrammes-UML-EcoRide-2025.md
- Charte-Graphique-EcoRide-2025.md
- Plan-Deploiement-EcoRide-2025.md
- Gestion-Projet-EcoRide-2025.md
- GUIDE-SYSTEME-PAIEMENT.md
- Maquettes.html

##### Documentation Sécurité (5 fichiers, 1,965+ lignes)
- GUIDE-SECURITE-IDENTIFIANTS.md (347 lignes)
- SECURITE-CORRECTION-README.md (255 lignes)
- SECURITE-REDOS-CORRECTION.md (400 lignes)
- SECURITE-NOSQL-INJECTION-CORRECTION.md (700 lignes)
- SCRIPTS-SECURITE-README.md (263 lignes)

##### Guides Développeur
- GUIDE-BONNES-PRATIQUES-GIT-GITHUB.md (1,800+ lignes)

#### 🧪 Tests

##### Tests Implémentés
- Tests de sécurité automatisés
- Validation des entrées utilisateur
- Tests de connexion base de données
- Tests de routes API
- Scanner de vulnérabilités

#### 📊 Statistiques

##### Code Source
- 87 fichiers scannés pour sécurité
- Backend : ~3,000 lignes de code
- Frontend : ~2,000 lignes de code
- Documentation : ~6,000 lignes
- Total : ~11,000 lignes

##### Base de Données
- 8 tables MySQL principales
- 5 collections MongoDB
- 2 vues SQL
- 3 triggers

##### API Endpoints
- 40+ endpoints REST
- Authentification JWT sur tous les endpoints protégés
- Rate limiting configuré

#### 🚀 Déploiement

##### Environnements
- Développement local (Docker)
- Variables d'environnement (.env)
- Configuration multi-environnement

##### Scripts NPM
```bash
npm start              # Démarrer le serveur
npm run db-init        # Initialiser la base de données
npm run create-admin   # Créer un compte administrateur
npm run security-check # Scanner de sécurité
npm test               # Lancer les tests
```

#### 🎓 Contexte Projet

##### Formation
- Formation : Développeur Web et Web Mobile
- Durée : 3 mois
- Date de rendu : Novembre 2025
- Type : Projet de fin de formation

##### Fonctionnalités Examen
- ✅ US01 : Inscription / Connexion
- ✅ US02 : Gestion profil utilisateur
- ✅ US03 : Recherche de trajets
- ✅ US04 : Réservation de trajets
- ✅ US05 : Proposer un trajet
- ✅ US06 : Gestion des véhicules
- ✅ US07 : Système de crédits
- ✅ US08 : Historique des trajets
- ✅ US09 : Administration
- 🔄 US10 : Système d'avis (en cours)

#### 👤 Auteur

- **Nom** : Cyril Touchard
- **GitHub** : [@cyriltouchard](https://github.com/cyriltouchard)
- **Repository** : [EcoRide](https://github.com/cyriltouchard/EcoRide)

#### 📄 Licence

- MIT License

---

## [0.1.0] - 2025-09-01

### 🎬 Initialisation du Projet

#### Ajouté
- Structure initiale du projet
- Configuration base de données
- Première interface HTML
- Setup Git et GitHub

---

## Format des Versions

### Types de Changements
- **Ajouté** : Nouvelles fonctionnalités
- **Modifié** : Changements dans fonctionnalités existantes
- **Déprécié** : Fonctionnalités qui seront supprimées
- **Supprimé** : Fonctionnalités supprimées
- **Corrigé** : Corrections de bugs
- **Sécurité** : Vulnérabilités corrigées

### Versioning
- **MAJOR** (X.0.0) : Changements incompatibles
- **MINOR** (0.X.0) : Nouvelles fonctionnalités compatibles
- **PATCH** (0.0.X) : Corrections de bugs

---

## Roadmap - Versions Futures

### [1.1.0] - Prévu Décembre 2025

#### Planifié
- [ ] Système d'avis et notation (US10)
- [ ] Statistiques CO2 économisé
- [ ] Export PDF des reçus
- [ ] Amélioration interface mobile
- [ ] Optimisation performances

### [1.2.0] - Prévu Janvier 2026

#### Planifié
- [ ] Notifications en temps réel (WebSocket)
- [ ] Chat intégré chauffeur-passager
- [ ] Système de favoris
- [ ] Partage social

### [2.0.0] - Prévu Mars 2026

#### Planifié
- [ ] Application mobile (React Native)
- [ ] Géolocalisation en temps réel
- [ ] Paiement en ligne (Stripe)
- [ ] Programme de fidélité

---

**📝 Note** : Ce changelog est mis à jour à chaque nouvelle version.

**🔗 Liens Utiles** :
- [Releases GitHub](https://github.com/cyriltouchard/EcoRide/releases)
- [Documentation](document/)
- [Guide Git](GUIDE-BONNES-PRATIQUES-GIT-GITHUB.md)
