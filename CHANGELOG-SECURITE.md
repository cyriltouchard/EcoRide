# 📝 Changelog - Corrections de Sécurité

Toutes les modifications notables du projet EcoRide concernant la sécurité seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [Non publié]

### À venir
- Implémentation de l'authentification multi-facteurs (MFA)
- Rate limiting sur les endpoints de connexion
- Intégration avec Azure Key Vault pour la gestion des secrets
- Rotation automatique des mots de passe
- Logs d'audit pour toutes les actions admin

## [1.0.1] - 2025-11-10

### 🔒 Sécurité - CRITIQUE

#### Corrigé
- **[CWE-798] Hachage de mot de passe bcrypt hardcodé** (Bloqueur)
  - Suppression du hachage de mot de passe hardcodé dans `server/init-db.js` ligne 161
  - Le compte admin n'est plus créé automatiquement avec un mot de passe connu
  - Vulnérabilité SonarQube `secrets:S8215` résolue

#### Ajouté
- **Script de création sécurisée de comptes admin** (`server/create-admin.js`)
  - Saisie interactive des identifiants
  - Validation du format email et de la complexité du mot de passe
  - Hachage sécurisé avec bcrypt (salt factor 10)
  - Vérification des doublons

- **Script de validation de sécurité** (`server/security-check.js`)
  - Scan automatique de 86+ fichiers du projet
  - Détection de 6 patterns de vulnérabilité :
    - Hachages bcrypt hardcodés
    - Mots de passe en clair
    - Clés API hardcodées
    - Tokens hardcodés
    - Secrets JWT hardcodés
    - Chaînes de connexion avec mot de passe
  - Rapport détaillé avec fichiers, lignes et sévérités
  - Code de sortie pour intégration CI/CD

- **Git hook pre-commit** (`.git-hooks/pre-commit.sample`)
  - Vérification automatique avant chaque commit
  - Détection des fichiers `.env` accidentellement ajoutés
  - Scan des secrets hardcodés
  - Détection de patterns dangereux (console.log avec secrets, eval())

- **Documentation complète de sécurité**
  - `document/GUIDE-SECURITE-IDENTIFIANTS.md` (347 lignes)
    - Règles de sécurité (à faire / ne pas faire)
    - Méthodes de création de comptes admin
    - Bonnes pratiques de gestion des mots de passe
    - Mesures de sécurité supplémentaires
    - Checklist de déploiement
    - Procédure en cas de compromission
    - Références (OWASP, CWE, NIST, ANSSI)
  
  - `document/SECURITE-CORRECTION-README.md` (255 lignes)
    - Description détaillée de la vulnérabilité
    - Actions correctives effectuées
    - Instructions d'utilisation
    - Guide de migration
    - Tests de sécurité
    - Actions futures recommandées
  
  - `document/SCRIPTS-SECURITE-README.md` (363 lignes)
    - Mode d'emploi des 3 scripts de sécurité
    - Workflows recommandés
    - Bonnes pratiques de développement
    - Guide d'intégration CI/CD
    - Guide de dépannage
    - Checklist de sécurité
  
  - `document/RESUME-CORRECTIONS-SECURITE.md` (380 lignes)
    - Résumé complet de toutes les modifications
    - Statistiques détaillées
    - Validation de la correction
    - Workflow après correction
    - Prochaines étapes recommandées
  
  - `.git-hooks/README.md` (300+ lignes)
    - Installation et utilisation des Git hooks
    - Exemples d'utilisation
    - Guide de dépannage
    - Personnalisation

#### Modifié
- **server/init-db.js**
  - Suppression du code de création automatique du compte admin
  - Ajout de messages informatifs pour guider vers les méthodes sécurisées

- **server/package.json**
  - Ajout du script `npm run security-check` : Lance le scan de sécurité
  - Ajout du script `npm run create-admin` : Crée un compte admin de manière sécurisée
  - Modification du script `security-check` (ancien : `npm audit`, nouveau : script personnalisé)

#### Statistiques de cette version
- 📝 **2 fichiers modifiés**
- ➕ **7 fichiers créés**
- 📄 **~1,965 lignes de documentation ajoutées**
- 🔒 **1 vulnérabilité critique corrigée**
- ✅ **0 secret hardcodé restant**

### 🧪 Tests
- ✅ Scan de sécurité passe avec succès (86 fichiers scannés, 0 problème)
- ✅ Script `create-admin.js` testé et fonctionnel
- ✅ Aucun fichier `.env` dans le dépôt Git
- ✅ Tous les secrets sont dans `.env` (ignoré par Git)

### 📚 Documentation
- ✅ 4 guides de sécurité complets (1,365 lignes)
- ✅ README pour les Git hooks (300+ lignes)
- ✅ Commentaires dans le code pour expliquer les changements
- ✅ Changelog complet de cette version

---

## [1.0.0] - 2025-10-26

### Ajouté
- Version initiale de l'application EcoRide
- Système de covoiturage
- Gestion des utilisateurs (passagers, chauffeurs, employés, admin)
- Système de crédits
- Gestion des véhicules
- Système de réservation
- Base de données MySQL et MongoDB

### Sécurité Initiale
- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Protection CORS
- Helmet.js pour les en-têtes de sécurité
- Express-validator pour la validation des entrées
- Rate limiting basique

---

## Types de Changements

- **Ajouté** : pour les nouvelles fonctionnalités
- **Modifié** : pour les changements dans les fonctionnalités existantes
- **Déprécié** : pour les fonctionnalités qui seront bientôt supprimées
- **Supprimé** : pour les fonctionnalités supprimées
- **Corrigé** : pour les corrections de bugs
- **Sécurité** : en cas de vulnérabilités

## Sévérité des Problèmes de Sécurité

- 🔴 **CRITIQUE** : Exploit direct possible, données sensibles exposées
- 🟠 **HAUTE** : Vulnérabilité exploitable sous certaines conditions
- 🟡 **MOYENNE** : Vulnérabilité difficile à exploiter ou impact limité
- 🟢 **BASSE** : Amélioration de sécurité sans vulnérabilité active

## Guide de Version

- **Version Majeure (X.0.0)** : Changements incompatibles avec les versions précédentes
- **Version Mineure (1.X.0)** : Ajout de fonctionnalités compatible avec les versions précédentes
- **Version Patch (1.0.X)** : Corrections de bugs et de sécurité

---

**Maintenu par** : Équipe DevSecOps EcoRide  
**Format** : [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)  
**Versioning** : [Semantic Versioning](https://semver.org/lang/fr/)
