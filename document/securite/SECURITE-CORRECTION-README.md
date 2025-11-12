# 🔐 Correction Vulnérabilité de Sécurité - Hachage de Mot de Passe Hardcodé

## 📋 Résumé

**Date**: 10 novembre 2025  
**Gravité**: 🔴 **BLOQUEUR**  
**Type**: CWE-798 - Utilisation d'identifiants hardcodés  
**Fichier**: `server/init-db.js` (ligne 161)  
**Statut**: ✅ **CORRIGÉ**

## 🔍 Description du Problème

Un hachage bcrypt de mot de passe était hardcodé dans le fichier `server/init-db.js` pour créer automatiquement un compte administrateur par défaut:

```javascript
// ❌ CODE VULNÉRABLE (SUPPRIMÉ)
await connection.query(`
    INSERT INTO users (pseudo, email, password_hash, user_type) VALUES 
    ('admin', 'admin@ecoride.fr', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
`);
```

### Risques Identifiés

1. **Accès non autorisé**: N'importe qui ayant accès au code source connaît le mot de passe admin
2. **Compromission immédiate**: Le mot de passe peut être cracké ou utilisé directement
3. **Violation de confidentialité**: Exposition publique via le dépôt Git
4. **Non-conformité**: Violation des standards de sécurité (OWASP, CWE-798)

## ✅ Actions Correctives

### 1. Suppression du Code Vulnérable

Le code créant automatiquement un compte admin avec un mot de passe hardcodé a été **complètement supprimé** de `server/init-db.js`.

### 2. Création d'un Script Sécurisé

Un nouveau script `server/create-admin.js` a été créé pour permettre la création sécurisée de comptes admin:

```bash
cd server
node create-admin.js
```

**Caractéristiques**:
- ✅ Saisie interactive des identifiants (pas de hardcoding)
- ✅ Validation du format email
- ✅ Vérification de la complexité du mot de passe (min. 8 caractères)
- ✅ Confirmation du mot de passe
- ✅ Hachage sécurisé avec bcrypt (salt factor 10)
- ✅ Vérification des doublons

### 3. Documentation de Sécurité

Création du guide `document/GUIDE-SECURITE-IDENTIFIANTS.md` contenant:
- 📚 Bonnes pratiques de gestion des identifiants
- 🔐 Politique de mots de passe
- 🛡️ Mesures de sécurité supplémentaires
- 📋 Checklist de déploiement
- 🆘 Procédure en cas de compromission

## 🔧 Utilisation

### Pour Créer un Compte Admin

**Méthode Recommandée** (via script sécurisé):
```bash
cd server
node create-admin.js
```

Vous serez invité à saisir:
1. Pseudo de l'administrateur
2. Email de l'administrateur
3. Mot de passe (minimum 8 caractères)
4. Confirmation du mot de passe

**Alternative** (via l'interface web):
1. Créer un compte utilisateur normal
2. Demander à un admin existant de modifier le `user_type` en `admin` dans la base de données

## 📝 Changements de Fichiers

| Fichier | Action | Description |
|---------|--------|-------------|
| `server/init-db.js` | ✏️ Modifié | Suppression du code de création automatique d'admin |
| `server/create-admin.js` | ➕ Créé | Script sécurisé pour créer des comptes admin |
| `document/GUIDE-SECURITE-IDENTIFIANTS.md` | ➕ Créé | Guide complet de sécurité |
| `document/SECURITE-CORRECTION-README.md` | ➕ Créé | Ce fichier |

## 🔄 Migration

### Si Vous Aviez un Compte Admin Existant

Si vous utilisiez le compte admin créé automatiquement par l'ancien code:

1. **Créez un nouveau compte admin** avec le script sécurisé
2. **Supprimez l'ancien compte** de la base de données:
   ```sql
   DELETE FROM users WHERE email = 'admin@ecoride.fr' AND password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
   ```
3. **Vérifiez** qu'aucune session active n'utilise l'ancien compte

## 🧪 Tests de Sécurité

### Vérifications Effectuées

✅ Aucun mot de passe hardcodé dans le code source  
✅ Aucun hash de mot de passe hardcodé  
✅ Les identifiants admin sont créés de manière sécurisée  
✅ Validation des mots de passe (longueur, format)  
✅ Protection contre les doublons  

### Tests Recommandés

```bash
# Vérifier qu'aucun secret n'est hardcodé
grep -r "password.*=.*['\"]" server/ --exclude-dir=node_modules

# Vérifier que .env n'est pas commité
git ls-files | grep ".env"

# Scanner les vulnérabilités npm
npm audit
```

## 📚 Références

- [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [OWASP - Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [SonarQube Rule S8215](https://rules.sonarsource.com/javascript/RSPEC-8215)

## ✅ Checklist de Validation

- [x] Code vulnérable supprimé
- [x] Script sécurisé créé et testé
- [x] Documentation de sécurité complète
- [x] Aucun secret hardcodé dans le code
- [x] `.env` dans `.gitignore`
- [x] Tests de validation effectués

## 🔮 Actions Futures Recommandées

1. **Implémenter MFA** (Authentification Multi-Facteurs) pour les comptes admin
2. **Rate Limiting** sur les endpoints de connexion
3. **Audit logs** pour tracer toutes les actions admin
4. **Rotation régulière** des mots de passe (tous les 90 jours)
5. **Secrets Manager** en production (Azure Key Vault, AWS Secrets Manager)
6. **Analyse automatique** avec SonarQube/SonarCloud dans la CI/CD

## 📞 Contact

Pour toute question de sécurité:
- Ouvrir une issue GitHub (pour les questions générales)
- Contacter directement l'équipe DevSecOps (pour les vulnérabilités)

---

**⚠️ IMPORTANT**: Cette vulnérabilité a été corrigée. Si vous avez cloné le dépôt avant cette correction, assurez-vous de:
1. Tirer les dernières modifications (`git pull`)
2. Supprimer tout compte admin créé avec l'ancien code
3. Créer de nouveaux comptes admin avec le script sécurisé
