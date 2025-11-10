# 🪝 Git Hooks de Sécurité EcoRide

Ce dossier contient des Git hooks personnalisés pour améliorer la sécurité du projet EcoRide.

## 📋 Hooks Disponibles

### pre-commit

**Objectif**: Vérifier automatiquement la sécurité avant chaque commit

**Vérifications effectuées**:
1. ✅ Détection des fichiers `.env` accidentellement ajoutés au commit
2. ✅ Détection des fichiers de backup (`.bak`, `.backup`, `~`)
3. ✅ Scan des secrets hardcodés dans tout le code
4. ✅ Détection de patterns dangereux dans les fichiers JavaScript:
   - `console.log()` avec des données sensibles (password, token, secret)
   - Utilisation de `eval()` (risque de sécurité)

**Résultat**:
- ✅ Si tout est OK : Le commit continue normalement
- ❌ Si problème détecté : Le commit est bloqué et un message d'erreur explicatif s'affiche

## 🔧 Installation

### Sur Windows (PowerShell)

```powershell
# Se placer à la racine du projet
cd C:\Users\cyril\OneDrive\Bureau\EcoRide

# Copier le hook dans le dossier Git
Copy-Item .git-hooks\pre-commit.sample .git\hooks\pre-commit

# Note: Sur Windows, le hook s'exécutera automatiquement avec Git Bash
```

### Sur Linux/Mac

```bash
# Se placer à la racine du projet
cd ~/EcoRide

# Copier et rendre exécutable
cp .git-hooks/pre-commit.sample .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Vérifier l'Installation

```bash
# Tenter un commit de test
git add .
git commit -m "test: vérification du hook"

# Vous devriez voir :
# 🔐 Vérification de sécurité avant commit...
# 📋 Vérification des fichiers sensibles...
# 🔍 Scan des secrets hardcodés...
# ✅ Aucun secret hardcodé détecté
# 🔍 Vérification des patterns dangereux...
# ✅ Toutes les vérifications de sécurité sont passées !
```

## 📖 Utilisation

Une fois installé, le hook s'exécute **automatiquement** à chaque `git commit`.

### Exemple : Commit Normal (Succès)

```bash
git add mon-fichier.js
git commit -m "feat: nouvelle fonctionnalité"

# Sortie:
🔐 Vérification de sécurité avant commit...
📋 Vérification des fichiers sensibles...
🔍 Scan des secrets hardcodés...
✅ Aucun secret hardcodé détecté
🔍 Vérification des patterns dangereux...
✅ Toutes les vérifications de sécurité sont passées !

[main abc1234] feat: nouvelle fonctionnalité
 1 file changed, 10 insertions(+)
```

### Exemple : Commit Bloqué (Fichier .env)

```bash
git add .env
git commit -m "fix: correction config"

# Sortie:
🔐 Vérification de sécurité avant commit...
📋 Vérification des fichiers sensibles...
❌ ERREUR: Tentative de commit d'un fichier .env !
   Les fichiers .env contiennent des secrets et ne doivent JAMAIS être commités.

Pour corriger:
  git reset HEAD .env

# Le commit est BLOQUÉ
```

### Exemple : Commit Bloqué (Secret Hardcodé)

```bash
# Vous avez ajouté un mot de passe dans le code
git add server/config.js
git commit -m "fix: configuration"

# Sortie:
🔐 Vérification de sécurité avant commit...
📋 Vérification des fichiers sensibles...
🔍 Scan des secrets hardcodés...
❌ ERREUR: Secrets hardcodés détectés !
   Corrigez les problèmes avant de commiter.

Pour voir les détails:
  cd server && npm run security-check

# Le commit est BLOQUÉ
```

## 🚫 Contournement (À Éviter)

En cas d'urgence absolue, vous pouvez contourner le hook avec `--no-verify`:

```bash
git commit -m "message" --no-verify
```

⚠️ **ATTENTION**: Utilisez cette option avec une extrême précaution !
- Ne JAMAIS l'utiliser pour commiter des secrets
- Seulement en cas de faux positif avéré
- Vérifier manuellement que le commit est sécurisé

## 🔄 Mise à Jour

Si le hook est mis à jour dans le dépôt:

```bash
# Réinstaller le hook
cp .git-hooks/pre-commit.sample .git/hooks/pre-commit

# Sur Linux/Mac
chmod +x .git/hooks/pre-commit
```

## 🛠️ Personnalisation

Le fichier hook est situé dans `.git-hooks/pre-commit.sample`.

Pour ajouter des vérifications personnalisées:

1. Éditer `.git-hooks/pre-commit.sample`
2. Ajouter vos vérifications dans le script
3. Réinstaller le hook (voir section Installation)

### Exemple de Vérification Personnalisée

```bash
# Vérifier la présence de TODO dans le code
if echo "$STAGED_JS_FILES" | xargs grep -n "TODO\|FIXME" 2>/dev/null; then
    echo "${YELLOW}⚠️  ATTENTION: TODO/FIXME détecté${NC}"
    echo "   Pensez à résoudre avant de pousser en production"
fi
```

## 🧪 Tests

Pour tester le hook sans faire de commit:

```bash
# Exécuter le hook manuellement
.git/hooks/pre-commit

# Ou sur Windows avec Git Bash
bash .git/hooks/pre-commit
```

## 🔍 Dépannage

### Le hook ne s'exécute pas

**Cause possible**: Fichier non exécutable (Linux/Mac)
```bash
chmod +x .git/hooks/pre-commit
```

**Cause possible**: Hook mal installé
```bash
# Vérifier que le fichier existe
ls -la .git/hooks/pre-commit

# Réinstaller
cp .git-hooks/pre-commit.sample .git/hooks/pre-commit
```

### Le hook produit des faux positifs

1. **Vérifier manuellement** le fichier signalé
2. Si c'est un vrai positif : **Corriger le code**
3. Si c'est un faux positif :
   - Éditer `.git-hooks/pre-commit.sample`
   - Ajouter une exclusion
   - Réinstaller le hook

### Le hook est trop lent

Le scan de sécurité peut prendre quelques secondes sur de gros projets.

Pour accélérer:
- Exclure les dossiers de build dans `security-check.js`
- Limiter le scan aux fichiers modifiés uniquement

## 📊 Statistiques

Le hook vérifie:
- 📁 **Tous les fichiers** staged pour commit
- 🔍 **86+ fichiers** scannés par le script de sécurité
- 🛡️ **6 patterns** de vulnérabilité détectés
- ⏱️ **~2-5 secondes** d'exécution moyenne

## 📚 Ressources

- [Git Hooks Documentation](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Sécurité des Git Hooks](https://owasp.org/www-community/vulnerabilities/Git_Hooks)
- Script de scan : `server/security-check.js`
- Documentation : `document/GUIDE-SECURITE-IDENTIFIANTS.md`

## ✅ Bonnes Pratiques

1. ✅ **Installer le hook** sur chaque clone du projet
2. ✅ **Ne jamais contourner** le hook sans raison valable
3. ✅ **Vérifier manuellement** en cas de doute
4. ✅ **Mettre à jour** le hook régulièrement
5. ✅ **Signaler** les faux positifs à l'équipe

## 🔒 Sécurité

Le hook lui-même:
- ✅ Ne modifie pas vos fichiers
- ✅ N'envoie aucune donnée externe
- ✅ S'exécute uniquement en local
- ✅ Peut être désactivé à tout moment (supprimer `.git/hooks/pre-commit`)

---

**Date de création**: 10 novembre 2025  
**Version**: 1.0.0  
**Compatibilité**: Windows, Linux, macOS

**💡 Conseil**: Installer ce hook sur tous vos clones du projet EcoRide pour une sécurité maximale !
