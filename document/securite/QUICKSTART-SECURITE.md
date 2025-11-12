# 🚀 Quick Start - Sécurité EcoRide

Guide rapide pour mettre en place les mesures de sécurité après la correction de la vulnérabilité CWE-798.

## ⚡ Installation Rapide (5 minutes)

### 1. Mettre à Jour le Code
```bash
cd C:\Users\cyril\OneDrive\Bureau\EcoRide
git pull
```

### 2. Installer les Dépendances
```bash
cd server
npm install
```

### 3. Créer un Compte Admin Sécurisé
```bash
npm run create-admin
```
Suivez les instructions à l'écran :
- Saisir pseudo
- Saisir email
- Saisir mot de passe (min. 8 caractères)
- Confirmer mot de passe

### 4. Vérifier la Sécurité
```bash
npm run security-check
```
Résultat attendu : ✅ **AUCUN PROBLÈME DÉTECTÉ !**

### 5. Installer le Git Hook (Optionnel mais Recommandé)
```powershell
# Sur Windows PowerShell
Copy-Item ..\.git-hooks\pre-commit.sample ..\.git\hooks\pre-commit
```

```bash
# Sur Linux/Mac
cp ../.git-hooks/pre-commit.sample ../.git/hooks/pre-commit
chmod +x ../.git/hooks/pre-commit
```

✅ **C'est tout ! Votre environnement est sécurisé.**

---

## 🔥 Commandes Essentielles

| Commande | Description | Quand l'utiliser |
|----------|-------------|------------------|
| `npm run security-check` | Scan de sécurité complet | Avant chaque commit |
| `npm run create-admin` | Créer un compte admin | À l'installation ou si compromis |
| `npm run db-init` | Initialiser la base de données | Première installation |
| `npm start` | Démarrer le serveur | Développement et production |
| `npm run dev` | Démarrer avec nodemon | Développement uniquement |

---

## ⚠️ Points d'Attention CRITIQUES

### 🚫 À NE JAMAIS FAIRE

1. **Ne JAMAIS commiter le fichier `.env`**
   ```bash
   # ❌ DANGER !
   git add .env
   ```
   
2. **Ne JAMAIS hardcoder de mot de passe**
   ```javascript
   // ❌ DANGER !
   const password = "monmotdepasse123";
   ```

3. **Ne JAMAIS partager vos identifiants admin**

4. **Ne JAMAIS contourner le hook de sécurité** (sauf urgence absolue)
   ```bash
   # ❌ À éviter !
   git commit --no-verify
   ```

### ✅ À TOUJOURS FAIRE

1. **Utiliser des variables d'environnement**
   ```javascript
   // ✅ BON
   const password = process.env.DB_PASSWORD;
   ```

2. **Vérifier la sécurité avant chaque commit**
   ```bash
   npm run security-check
   ```

3. **Utiliser des mots de passe forts** (12+ caractères, avec majuscules, minuscules, chiffres, symboles)

4. **Vérifier le fichier `.gitignore`**
   ```bash
   # .env doit être dans .gitignore
   cat .gitignore | grep "\.env"
   ```

---

## 🔍 Vérification Rapide de Sécurité (2 minutes)

### Checklist de Sécurité Express

```bash
# 1. Vérifier qu'aucun .env n'est commité
git ls-files | grep "\.env"
# Doit être vide (sauf .env.example)

# 2. Scanner les secrets hardcodés
cd server && npm run security-check
# Doit retourner : ✅ AUCUN PROBLÈME DÉTECTÉ !

# 3. Vérifier les vulnérabilités npm
npm audit
# Idéalement 0 vulnérabilité, maximum : vulnérabilités basses uniquement

# 4. Vérifier la présence du hook Git
ls ../.git/hooks/pre-commit
# Le fichier doit exister
```

Si **TOUTES** ces vérifications passent → ✅ Vous êtes sécurisé !

---

## 📖 Documentation Complète

Pour plus de détails :

| Document | Description | Lien |
|----------|-------------|------|
| **Guide Complet** | Tout savoir sur la sécurité | `document/GUIDE-SECURITE-IDENTIFIANTS.md` |
| **Correction** | Détails de la vulnérabilité corrigée | `document/SECURITE-CORRECTION-README.md` |
| **Scripts** | Mode d'emploi des scripts | `document/SCRIPTS-SECURITE-README.md` |
| **Résumé** | Vue d'ensemble des modifications | `document/RESUME-CORRECTIONS-SECURITE.md` |
| **Git Hooks** | Installation et utilisation | `.git-hooks/README.md` |
| **Changelog** | Historique des modifications | `CHANGELOG-SECURITE.md` |

---

## 🆘 Dépannage Express

### Problème : "npm run security-check" ne fonctionne pas

**Solution** :
```bash
# Vérifier que le fichier existe
ls server/security-check.js

# Vérifier que node est installé
node --version

# Réinstaller les dépendances
cd server
rm -rf node_modules
npm install
```

### Problème : Impossible de créer un compte admin

**Solution** :
```bash
# Vérifier que MySQL est démarré (XAMPP)
# Vérifier les paramètres .env
cat server/.env

# Initialiser la base de données
cd server
npm run db-init
npm run create-admin
```

### Problème : Le hook Git ne fonctionne pas

**Solution** :
```bash
# Réinstaller le hook
cp .git-hooks/pre-commit.sample .git/hooks/pre-commit

# Sur Linux/Mac, rendre exécutable
chmod +x .git/hooks/pre-commit

# Tester manuellement
bash .git/hooks/pre-commit
```

### Problème : Ancien compte admin encore présent

**Solution** :
```sql
-- Se connecter à MySQL et exécuter :
USE ecoride_sql;
DELETE FROM users 
WHERE email = 'admin@ecoride.fr' 
AND password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- Puis créer un nouveau compte admin sécurisé
-- Depuis le terminal : npm run create-admin
```

---

## 🎯 Workflow Quotidien

### Début de Journée
```bash
# 1. Mettre à jour le code
git pull

# 2. Vérifier la sécurité
cd server && npm run security-check
```

### Avant Chaque Commit
```bash
# 1. Vérifier la sécurité (automatique si hook installé)
cd server && npm run security-check

# 2. Commiter
git add .
git commit -m "feat: ma fonctionnalité"

# Le hook s'exécute automatiquement ✅
```

### Fin de Semaine
```bash
# Audit de sécurité complet
cd server
npm audit
npm run security-check

# Si problème détecté : corriger avant le week-end !
```

---

## 📊 Résumé en 30 Secondes

1. ✅ **Vulnérabilité CWE-798 corrigée** (mot de passe hardcodé supprimé)
2. ✅ **Script de création admin sécurisé** disponible : `npm run create-admin`
3. ✅ **Script de scan de sécurité** disponible : `npm run security-check`
4. ✅ **Git hook** disponible pour vérification automatique
5. ✅ **Documentation complète** dans le dossier `document/`

**🔒 Le projet EcoRide est maintenant sécurisé !**

---

## 🔗 Liens Rapides

- [SonarQube Rule S8215](https://rules.sonarsource.com/javascript/RSPEC-8215)
- [CWE-798](https://cwe.mitre.org/data/definitions/798.html)
- [OWASP Top 10](https://owasp.org/Top10/)
- [Bcrypt Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

**⏱️ Temps total de mise en place : ~5 minutes**  
**🔒 Niveau de sécurité : Haute**  
**✅ Statut : Production Ready**

**💡 Besoin d'aide ?** Consultez la documentation complète dans `document/GUIDE-SECURITE-IDENTIFIANTS.md`
