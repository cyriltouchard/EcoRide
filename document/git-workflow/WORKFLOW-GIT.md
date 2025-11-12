# 🔄 Workflow Git - EcoRide

## 🌳 Structure des Branches

Votre projet utilise maintenant une structure de branches professionnelle GitFlow :

```
main (production)           → Code stable, version en production
  ↑
  └── dev (développement)   → Intégration de toutes les features
       ↑
       └── feature/*        → Nouvelles fonctionnalités
```

---

## 📊 État Actuel des Branches

### ✅ Branches Configurées

| Branche | Rôle | État |
|---------|------|------|
| `main` | **Production** - Code stable et validé | ✅ À jour |
| `dev` | **Développement** - Intégration des features | ✅ Synchro avec main |
| `feature` | **Nouvelles fonctionnalités** - Travail en cours | ✅ Synchro avec dev |

---

## 🚀 Comment Travailler avec ce Workflow

### 1️⃣ **Pour Développer une Nouvelle Fonctionnalité**

#### Option A : Utiliser la branche `feature` existante

```bash
# Se positionner sur feature
git checkout feature

# Récupérer les dernières modifications
git pull origin feature

# Travailler sur votre code
# ... modifications ...

# Commiter régulièrement
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser vers GitHub
git push origin feature
```

#### Option B : Créer une branche feature spécifique (RECOMMANDÉ)

```bash
# Se positionner sur dev
git checkout dev

# Créer une nouvelle branche depuis dev
git checkout -b feature/nom-fonctionnalite

# Exemples de noms :
# feature/avis-notation
# feature/chat-temps-reel
# feature/notifications
# feature/paiement-stripe

# Travailler sur votre code
# ... modifications ...

# Commiter
git add .
git commit -m "feat: add user rating system"

# Pousser vers GitHub
git push -u origin feature/nom-fonctionnalite

# Sur GitHub : Créer une Pull Request vers 'dev'
```

---

### 2️⃣ **Quand une Fonctionnalité est Terminée**

```bash
# 1. S'assurer que tout est commité
git status

# 2. Mettre à jour dev avec les derniers changements
git checkout dev
git pull origin dev

# 3. Merger votre feature dans dev
git merge feature/nom-fonctionnalite

# Ou si vous travaillez sur la branche 'feature' :
git merge feature

# 4. Tester que tout fonctionne
npm test
npm run security-check

# 5. Pousser dev vers GitHub
git push origin dev

# 6. Supprimer la branche feature locale (si feature spécifique)
git branch -d feature/nom-fonctionnalite
```

---

### 3️⃣ **Valider et Passer en Production (main)**

```bash
# 1. Vérifier que dev est stable
git checkout dev
npm test
npm run security-check

# 2. Passer sur main
git checkout main

# 3. Merger dev dans main
git merge dev --no-ff -m "release: version 1.1.0"

# 4. Créer un tag de version
git tag -a v1.1.0 -m "Release version 1.1.0"

# 5. Pousser vers GitHub
git push origin main
git push origin v1.1.0

# 6. Créer une Release sur GitHub
# → Aller sur GitHub : Releases > Draft a new release
```

---

## 📝 Convention de Nommage des Branches

### ✅ Branches Features

```bash
feature/avis-notation           ✅ Système d'avis et notation
feature/chat-temps-reel         ✅ Chat intégré
feature/notifications-push      ✅ Notifications push
feature/paiement-stripe         ✅ Intégration Stripe
feature/statistiques-co2        ✅ Statistiques CO2
feature/export-pdf              ✅ Export PDF
```

### ✅ Branches Corrections (Fix)

```bash
fix/bug-reservation             ✅ Correction bug réservation
fix/email-validation            ✅ Fix validation email
fix/memory-leak                 ✅ Correction fuite mémoire
```

### ✅ Branches Hotfix (Urgence)

```bash
hotfix/security-sql-injection   ✅ Correction urgente sécurité
hotfix/server-crash             ✅ Fix crash serveur
```

---

## 🔄 Workflow Recommandé au Quotidien

### 🌅 Début de Journée

```bash
# 1. Se positionner sur dev
git checkout dev

# 2. Récupérer les dernières modifications
git pull origin dev

# 3. Créer ou reprendre une branche feature
git checkout -b feature/ma-fonctionnalite
# ou
git checkout feature
```

### 💻 Pendant le Développement

```bash
# Commiter régulièrement (toutes les 30min - 1h)
git add .
git commit -m "feat: implement booking form"

# Pousser régulièrement
git push origin feature/ma-fonctionnalite
```

### 🌙 Fin de Journée

```bash
# 1. Commiter tout le travail en cours
git add .
git commit -m "wip: work in progress on rating system"

# 2. Pousser vers GitHub (backup)
git push origin feature/ma-fonctionnalite

# 3. Si la feature est terminée, créer une PR vers dev
```

---

## 🎯 Workflow pour l'Examen

### Scénario : Ajouter le Système d'Avis (US10)

```bash
# 1️⃣ Créer une branche depuis dev
git checkout dev
git pull origin dev
git checkout -b feature/avis-notation

# 2️⃣ Développer la fonctionnalité
# - Créer reviewController.js
# - Créer reviewModel.js
# - Créer les routes /api/reviews
# - Créer l'interface HTML
# - Ajouter les tests

# 3️⃣ Commiter par étapes logiques
git add server/controllers/reviewController.js
git commit -m "feat(reviews): add review controller"

git add server/models/reviewModel.js
git commit -m "feat(reviews): add review model"

git add server/routes/reviewRoutes.js
git commit -m "feat(reviews): add review routes"

git add avis.html
git commit -m "feat(reviews): add review UI"

git add tests/review.test.js
git commit -m "test(reviews): add review tests"

# 4️⃣ Pousser vers GitHub
git push -u origin feature/avis-notation

# 5️⃣ Créer une Pull Request sur GitHub
# → Base: dev
# → Compare: feature/avis-notation
# → Remplir le template de PR

# 6️⃣ Après validation, merger dans dev
git checkout dev
git merge feature/avis-notation
git push origin dev

# 7️⃣ Quand tout est validé, merger dev dans main
git checkout main
git merge dev --no-ff -m "release: v1.1.0 - add rating system"
git tag -a v1.1.0 -m "Version 1.1.0 - Système d'avis"
git push origin main
git push origin v1.1.0
```

---

## 🛡️ Protection des Branches

### ⚠️ Règles Importantes

- ❌ **Ne JAMAIS développer directement sur `main`**
- ❌ **Ne JAMAIS forcer un push** (`git push --force`) sur main ou dev
- ✅ **Toujours passer par `dev`** avant d'aller sur main
- ✅ **Toujours tester** avant de merger
- ✅ **Créer des Pull Requests** pour traçabilité

---

## 🔍 Commandes Utiles

### Voir les Branches

```bash
# Branches locales
git branch

# Toutes les branches (locales + distantes)
git branch -a

# Voir la branche courante
git branch --show-current
```

### Changer de Branche

```bash
# Changer vers une branche existante
git checkout dev
git checkout feature
git checkout main

# Créer et basculer vers une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite
```

### Mettre à Jour une Branche

```bash
# Récupérer les modifications depuis GitHub
git pull origin dev

# Récupérer sans merger automatiquement
git fetch origin
git merge origin/dev
```

### Voir les Différences

```bash
# Différences entre branches
git diff dev main

# Différences non commitées
git diff

# Différences commitées mais non pushées
git diff origin/dev
```

### Annuler des Modifications

```bash
# Annuler les modifications d'un fichier
git checkout -- fichier.js

# Annuler le dernier commit (garder les modifications)
git reset --soft HEAD~1

# Annuler le dernier commit (supprimer les modifications)
git reset --hard HEAD~1
```

---

## 📚 Exemple Complet : Projet US10 (Avis)

### Étape 1 : Planification

```bash
# Créer une issue sur GitHub
# Issue #50 : "Implémenter le système d'avis et notation (US10)"
```

### Étape 2 : Développement

```bash
# Créer la branche
git checkout dev
git checkout -b feature/avis-notation

# Développer par étapes
# ... création des fichiers ...

# Commits réguliers
git add server/controllers/reviewController.js
git commit -m "feat(reviews): add controller with CRUD operations"

git add server/models/reviewModel.js
git commit -m "feat(reviews): add MongoDB review model"

git add server/routes/reviewRoutes.js
git commit -m "feat(reviews): add API routes for reviews"

git add avis.html public/js/review.js
git commit -m "feat(reviews): add user interface for ratings"

git add tests/review.test.js
git commit -m "test(reviews): add unit tests for review system"

git add document/Documentation-Technique-EcoRide-2025.md
git commit -m "docs(reviews): document review system architecture"
```

### Étape 3 : Tests

```bash
# Tester localement
npm test
npm run security-check

# Vérifier que tout fonctionne
npm start
# → Tester manuellement l'interface
```

### Étape 4 : Pull Request

```bash
# Pousser vers GitHub
git push -u origin feature/avis-notation

# Sur GitHub :
# 1. Créer une Pull Request
# 2. Base: dev
# 3. Compare: feature/avis-notation
# 4. Titre: "feat: implement rating and review system (US10)"
# 5. Remplir le template avec checklist
# 6. Ajouter le label "feature"
# 7. Lier l'issue : "Closes #50"
# 8. Créer la PR
```

### Étape 5 : Merge

```bash
# Après validation de la PR sur GitHub, merger localement
git checkout dev
git pull origin dev  # Récupérer le merge de la PR

# Tester une dernière fois
npm test
npm run security-check

# Si tout est OK, prêt pour la release !
```

### Étape 6 : Release

```bash
# Merger dans main
git checkout main
git merge dev --no-ff -m "release: v1.1.0 - add rating system (US10)"

# Créer le tag
git tag -a v1.1.0 -m "Version 1.1.0

Nouvelles fonctionnalités :
- Système d'avis et notation (US10)
- Interface de notation avec étoiles
- Calcul de moyenne automatique
- Affichage des avis sur les profils

Closes #50"

# Pousser
git push origin main
git push origin v1.1.0

# Mettre à jour CHANGELOG.md
git checkout dev
# ... éditer CHANGELOG.md ...
git add CHANGELOG.md
git commit -m "docs: update CHANGELOG for v1.1.0"
git push origin dev
```

### Étape 7 : Créer la Release GitHub

```
1. Aller sur GitHub : Releases > Draft a new release
2. Tag : v1.1.0
3. Titre : Version 1.1.0 - Système d'Avis
4. Description :
   - Copier le contenu du CHANGELOG
   - Ajouter des screenshots
   - Lien vers la documentation
5. Publier
```

---

## ⚡ Raccourcis Rapides

```bash
# Statut rapide
git status -s

# Log condensé
git log --oneline --graph --all -10

# Voir les branches avec dernier commit
git branch -v

# Synchroniser rapidement dev
git checkout dev && git pull origin dev

# Créer feature et basculer
git checkout dev && git checkout -b feature/nom

# Commit rapide (seulement si petite modification)
git add . && git commit -m "fix: quick fix"
```

---

## 🎓 Récapitulatif pour l'Examen

### ✅ Ce que Votre Workflow Montre

1. **Organisation** : Structure claire avec main/dev/feature
2. **Professionnalisme** : Pull Requests, tags, releases
3. **Traçabilité** : Commits clairs, historique propre
4. **Tests** : Validation avant merge
5. **Documentation** : CHANGELOG, README, commits descriptifs

### ✅ Points Importants pour l'Examinateur

- 🎯 **main** = Version stable présentée
- 🔧 **dev** = Développement documenté
- ✨ **feature/*** = Process de développement visible
- 📊 **Releases** = Versions clairement identifiées
- 📝 **Pull Requests** = Revue de code et validation

---

## 🆘 Problèmes Courants

### Problème : "Your branch is behind"

```bash
# Solution
git pull origin dev
```

### Problème : Conflit lors du merge

```bash
# 1. Git vous indique les fichiers en conflit
git status

# 2. Ouvrir les fichiers et résoudre les conflits
# Chercher les marqueurs : <<<<<<< ======= >>>>>>>

# 3. Marquer comme résolu
git add fichier-resolu.js

# 4. Finaliser le merge
git commit -m "merge: resolve conflicts from feature/nom"
```

### Problème : J'ai commité sur la mauvaise branche

```bash
# Si pas encore pushé
git reset --soft HEAD~1  # Annule le commit, garde les modifications
git stash                # Sauvegarde les modifications
git checkout bonne-branche
git stash pop            # Récupère les modifications
git add .
git commit -m "message"
```

---

## 📞 Aide Rapide

### Besoin d'aide ?

1. Consulter `GUIDE-BONNES-PRATIQUES-GIT-GITHUB.md`
2. Consulter `CONTRIBUTING.md`
3. Voir les Issues sur GitHub
4. Créer une issue de type "Question"

---

**Dernière mise à jour** : 10 novembre 2025  
**Version du workflow** : GitFlow simplifié pour examen
