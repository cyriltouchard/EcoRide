# 🔐 Guide de Sécurité - Gestion des Identifiants EcoRide

## ⚠️ Vulnérabilité Corrigée

**Date de correction**: 10 novembre 2025
**Problème**: Hachage de mot de passe bcrypt hardcodé dans le code source (CWE-798)
**Gravité**: Bloqueur
**Fichier concerné**: `server/init-db.js` (ligne 161)

### Ce qui a été fait

1. ✅ Suppression du hachage de mot de passe bcrypt hardcodé
2. ✅ Suppression de la création automatique du compte admin
3. ✅ Création d'un script sécurisé pour créer des comptes admin (`create-admin.js`)
4. ✅ Ajout de cette documentation

## 🚨 Règles de Sécurité Importantes

### ❌ À NE JAMAIS FAIRE

1. **Ne JAMAIS hardcoder des mots de passe ou leurs hachages** dans le code source
   ```javascript
   // ❌ MAUVAIS - Vulnérabilité de sécurité critique!
   const password = "monmotdepasse123";
   const hash = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";
   ```

2. **Ne JAMAIS commiter** de fichiers `.env` contenant des identifiants réels

3. **Ne JAMAIS exposer** des identifiants dans les logs, messages d'erreur ou réponses API

4. **Ne JAMAIS utiliser** le même mot de passe pour plusieurs environnements

### ✅ Bonnes Pratiques

1. **Utiliser des variables d'environnement**
   ```javascript
   // ✅ BON
   const password = process.env.DB_PASSWORD;
   ```

2. **Utiliser des secrets managers** en production (Azure Key Vault, AWS Secrets Manager, etc.)

3. **Créer les comptes admin de manière interactive ou via des outils sécurisés**

4. **Utiliser des mots de passe forts** (minimum 12 caractères, avec majuscules, minuscules, chiffres et symboles)

5. **Activer l'authentification multi-facteurs (MFA)** pour les comptes admin

## 🔧 Création d'un Compte Administrateur

### Méthode 1: Script Interactif (Recommandé)

```bash
cd server
node create-admin.js
```

Ce script vous demandera de saisir les informations de manière sécurisée:
- Pseudo
- Email
- Mot de passe (saisi de manière masquée)
- Confirmation du mot de passe

### Méthode 2: Via l'Interface Web

1. Accéder à la page de création de compte
2. Remplir les informations
3. **Après création**, un employé ou admin existant doit modifier le type d'utilisateur en "admin" directement dans la base de données

### Méthode 3: Variables d'Environnement (Développement uniquement)

```bash
# .env.local (NE JAMAIS commiter ce fichier!)
ADMIN_EMAIL=admin@ecoride.local
ADMIN_PASSWORD=VotreMDPSecurise123!
```

⚠️ **Cette méthode est UNIQUEMENT pour le développement local, JAMAIS pour la production!**

## 🔐 Gestion des Mots de Passe

### Lors du Hachage

```javascript
const bcrypt = require('bcryptjs');

// Hacher avec un salt factor de 10 minimum (12 recommandé pour production)
const hash = await bcrypt.hash(password, 12);
```

### Lors de la Vérification

```javascript
// Comparer le mot de passe saisi avec le hash stocké
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### Politique de Mots de Passe

Pour EcoRide, les mots de passe doivent respecter:
- ✅ Minimum 8 caractères (12+ recommandé)
- ✅ Au moins une majuscule
- ✅ Au moins une minuscule
- ✅ Au moins un chiffre
- ✅ Au moins un caractère spécial
- ✅ Pas de mots du dictionnaire
- ✅ Pas d'informations personnelles (nom, date de naissance, etc.)

## 🛡️ Mesures de Sécurité Supplémentaires

### 1. Rotation des Identifiants

- Changer les mots de passe admin tous les 90 jours
- Révoquer immédiatement les accès des anciens employés

### 2. Logs et Audit

```javascript
// Logger les tentatives de connexion
logger.info('Login attempt', { 
    email: sanitizedEmail, 
    success: true,
    ip: req.ip,
    timestamp: new Date()
});

// ❌ NE JAMAIS logger le mot de passe!
logger.error('Login failed', { password: userPassword }); // MAUVAIS!
```

### 3. Rate Limiting

```javascript
// Limiter les tentatives de connexion
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
});
```

### 4. Protection des Sessions

```javascript
// Configuration de session sécurisée
app.use(session({
    secret: process.env.SESSION_SECRET, // Variable d'environnement!
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: true, // HTTPS uniquement
        httpOnly: true, // Pas accessible via JavaScript
        maxAge: 3600000 // 1 heure
    }
}));
```

## 📋 Checklist de Déploiement

Avant de déployer en production:

- [ ] Tous les secrets sont dans des variables d'environnement ou un secrets manager
- [ ] Aucun mot de passe ou hash n'est hardcodé dans le code
- [ ] Le fichier `.env` est dans `.gitignore`
- [ ] Les mots de passe admin sont forts et uniques
- [ ] MFA est activée pour tous les comptes admin
- [ ] Rate limiting est configuré sur les endpoints sensibles
- [ ] Les logs ne contiennent aucune information sensible
- [ ] HTTPS est activé
- [ ] Les en-têtes de sécurité sont configurés (HSTS, CSP, etc.)

## 🆘 En Cas de Compromission

Si vous suspectez qu'un mot de passe a été compromis:

1. **Immédiatement**:
   - Changer tous les mots de passe affectés
   - Révoquer toutes les sessions actives
   - Analyser les logs pour détecter des accès non autorisés

2. **Investigation**:
   - Identifier la source de la compromission
   - Vérifier l'intégrité des données
   - Documenter l'incident

3. **Communication**:
   - Informer les utilisateurs affectés
   - Notifier les autorités si requis (CNIL en France)

## 📚 Références

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [ANSSI - Guide d'authentification](https://www.ssi.gouv.fr/)

---

**Dernière mise à jour**: 10 novembre 2025  
**Responsable sécurité**: Équipe EcoRide DevSecOps
