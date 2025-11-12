# 🔐 Scripts de Sécurité EcoRide

Ce document explique comment utiliser les nouveaux scripts de sécurité ajoutés au projet EcoRide suite à la correction de la vulnérabilité CWE-798.

## 📋 Scripts Disponibles

### 1. Vérification de Sécurité (security-check)

**Objectif**: Scanner le code source pour détecter des secrets hardcodés (mots de passe, clés API, tokens, etc.)

**Utilisation**:
```bash
cd server
npm run security-check
```

**Détecte**:
- ✅ Hachages bcrypt hardcodés
- ✅ Mots de passe en clair
- ✅ Clés API hardcodées
- ✅ Tokens hardcodés
- ✅ Secrets JWT hardcodés
- ✅ Chaînes de connexion avec mot de passe

**Résultat**:
- ✅ Code 0 : Aucun problème détecté
- ❌ Code 1 : Problèmes de sécurité détectés

**Recommandation**: Exécuter ce script avant chaque commit !

### 2. Création de Compte Admin (create-admin)

**Objectif**: Créer de manière sécurisée un compte administrateur

**Utilisation**:
```bash
cd server
npm run create-admin
```

**Processus interactif**:
1. Saisir le pseudo de l'administrateur
2. Saisir l'email de l'administrateur
3. Saisir le mot de passe (minimum 8 caractères)
4. Confirmer le mot de passe

**Validations**:
- ✅ Format d'email valide
- ✅ Mot de passe minimum 8 caractères
- ✅ Confirmation du mot de passe
- ✅ Vérification des doublons (email/pseudo)
- ✅ Hachage sécurisé avec bcrypt

**Exemple**:
```
🔐 Création sécurisée d'un compte administrateur EcoRide

Pseudo de l'administrateur: superadmin
Email de l'administrateur: admin@ecoride.com
Mot de passe (min. 8 caractères): ********
Confirmez le mot de passe: ********

🔄 Connexion à la base de données...
✅ Connecté à la base de données
🔐 Hachage du mot de passe...

✅ Compte administrateur créé avec succès!
   Pseudo: superadmin
   Email: admin@ecoride.com
   Type: admin

⚠️  IMPORTANT: Conservez ces identifiants en lieu sûr!
⚠️  Ne partagez jamais vos identifiants administrateur!
```

### 3. Initialisation de la Base de Données (db-init)

**Objectif**: Créer la structure de la base de données

**Utilisation**:
```bash
cd server
npm run db-init
```

**Actions**:
- ✅ Création de la base de données `ecoride_sql`
- ✅ Création des tables (users, vehicles, rides, etc.)
- ✅ Création des triggers et vues
- ❌ **Ne crée PLUS** de compte admin par défaut (sécurité)

**Note**: Après l'initialisation, utilisez `npm run create-admin` pour créer votre compte admin.

## 🔄 Workflow Recommandé

### Installation Initiale

```bash
# 1. Installer les dépendances
cd server
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. Initialiser la base de données
npm run db-init

# 4. Créer un compte admin
npm run create-admin

# 5. Vérifier la sécurité
npm run security-check

# 6. Démarrer le serveur
npm start
```

### Développement Quotidien

```bash
# Avant de commencer à coder
npm run security-check

# Développement
npm run dev

# Avant de commiter
npm run security-check
git add .
git commit -m "feat: nouvelle fonctionnalité"
```

### Avant un Déploiement

```bash
# 1. Audit de sécurité npm
npm audit

# 2. Vérification des secrets hardcodés
npm run security-check

# 3. Tests
npm test

# 4. Vérifier que .env n'est pas commité
git ls-files | grep ".env"
# Doit retourner vide (sauf .env.example)
```

## 🔐 Bonnes Pratiques

### Variables d'Environnement

**Toujours utiliser .env pour les secrets**:
```bash
# .env (NE JAMAIS commiter)
DB_PASSWORD=mon_mot_de_passe_securise
JWT_SECRET=ma_cle_jwt_tres_longue_et_aleatoire
```

**Jamais dans le code**:
```javascript
// ❌ MAUVAIS
const password = "mon_mot_de_passe";

// ✅ BON
const password = process.env.DB_PASSWORD;
```

### Gestion des Mots de Passe

**Toujours hacher avec bcrypt**:
```javascript
const bcrypt = require('bcryptjs');

// Hachage
const hash = await bcrypt.hash(plainPassword, 10);

// Vérification
const isValid = await bcrypt.compare(plainPassword, hash);
```

**Jamais en clair**:
```javascript
// ❌ JAMAIS
await db.query('INSERT INTO users (password) VALUES (?)', [plainPassword]);

// ✅ TOUJOURS
const hash = await bcrypt.hash(plainPassword, 10);
await db.query('INSERT INTO users (password_hash) VALUES (?)', [hash]);
```

### .gitignore

**Vérifier que ces fichiers sont ignorés**:
```gitignore
# Secrets
.env
.env.local
.env.*.local

# Logs sensibles
logs/
*.log

# Fichiers de base de données
*.sql.backup
db_backup/
```

## 📊 Intégration CI/CD

### GitHub Actions (exemple)

```yaml
name: Security Check

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd server && npm ci
      
      - name: Security audit
        run: cd server && npm audit
      
      - name: Check hardcoded secrets
        run: cd server && npm run security-check
```

## 🆘 En Cas de Problème

### Le script security-check détecte un problème

1. **Lire le rapport** pour identifier le fichier et la ligne
2. **Déplacer le secret** dans .env
3. **Utiliser** `process.env.VARIABLE_NAME` dans le code
4. **Re-exécuter** le script pour valider

### Impossible de créer un compte admin

1. **Vérifier** que MySQL est démarré
2. **Vérifier** les paramètres dans .env
3. **Vérifier** que la base est initialisée (`npm run db-init`)
4. **Vérifier** que l'email/pseudo n'existe pas déjà

### Compte admin compromis

1. **Immédiatement**:
   ```bash
   npm run create-admin  # Créer nouveau compte
   # Puis supprimer l'ancien dans la base
   ```

2. **Analyser** les logs pour détecter des accès suspects

3. **Changer** tous les secrets (.env, JWT_SECRET, etc.)

## 📚 Documentation Complète

- `GUIDE-SECURITE-IDENTIFIANTS.md` : Guide complet de sécurité
- `SECURITE-CORRECTION-README.md` : Détails de la correction de vulnérabilité
- Code source des scripts dans `server/`:
  - `security-check.js`
  - `create-admin.js`
  - `init-db.js`

## ✅ Checklist Sécurité

Avant chaque déploiement:

- [ ] `npm audit` sans vulnérabilité critique
- [ ] `npm run security-check` passe avec succès
- [ ] Aucun secret dans le code source
- [ ] `.env` n'est pas commité
- [ ] Tous les mots de passe admin sont forts et uniques
- [ ] MFA activée pour les comptes admin (si disponible)
- [ ] Logs ne contiennent pas d'informations sensibles
- [ ] HTTPS activé en production
- [ ] Rate limiting configuré

---

**Date de création**: 10 novembre 2025  
**Dernière mise à jour**: 10 novembre 2025  
**Version**: 1.0.0
