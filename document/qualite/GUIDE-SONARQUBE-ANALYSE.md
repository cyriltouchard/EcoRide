# 🔍 Guide d'analyse SonarQube pour EcoRide

## 📋 Prérequis

### 1. Installation de SonarQube

**Option A : Docker (recommandé)**
```powershell
# Télécharger et lancer SonarQube
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

**Option B : Installation locale**
```powershell
# Télécharger depuis https://www.sonarqube.org/downloads/
# Extraire et lancer
.\bin\windows-x86-64\StartSonar.bat
```

### 2. Installation de SonarScanner

```powershell
# Via Chocolatey
choco install sonarscanner

# OU télécharger depuis
# https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/
```

---

## 🚀 Lancer l'analyse

### Étape 1 : Démarrer SonarQube

```powershell
# Si vous utilisez Docker
docker start sonarqube

# Attendre que SonarQube soit prêt (1-2 minutes)
# Ouvrir http://localhost:9000
# Login par défaut: admin / admin
```

### Étape 2 : Créer un token

1. Aller sur http://localhost:9000
2. Se connecter (admin/admin)
3. Mon compte → Sécurité → Générer un token
4. Nom: `ecoride-analysis`
5. Copier le token généré

### Étape 3 : Configurer le projet

```powershell
# Définir les variables d'environnement
$env:SONAR_TOKEN = "votre_token_ici"
$env:SONAR_HOST_URL = "http://localhost:9000"
```

### Étape 4 : Lancer l'analyse

```powershell
# Se placer dans le répertoire du projet
cd C:\Users\cyril\EcoRide

# Lancer SonarScanner
sonar-scanner `
  -Dsonar.projectKey=ecoride `
  -Dsonar.sources=. `
  -Dsonar.host.url=http://localhost:9000 `
  -Dsonar.login=$env:SONAR_TOKEN
```

**OU utiliser le fichier de configuration** :
```powershell
# Le fichier sonar-project.properties est déjà configuré
sonar-scanner -Dsonar.login=$env:SONAR_TOKEN
```

---

## 📊 Analyser les résultats

### Tableau de bord

Une fois l'analyse terminée (2-5 minutes), aller sur :
```
http://localhost:9000/dashboard?id=ecoride
```

### Métriques à surveiller

| Métrique | Objectif | Status actuel |
|----------|----------|---------------|
| **Porte de qualité** | Passé | À vérifier |
| **Fiabilité** | A | C (149 problèmes) |
| **Maintenabilité** | A | A (562 problèmes) |
| **Sécurité** | A | À vérifier |
| **Duplications** | <3% | 8.3% |
| **Couverture** | >80% | 0% (pas de tests) |
| **Complexité cognitive** | ≤15 | ✅ Corrigé |

---

## 🎯 Plan de correction des problèmes

### Phase 1 : Problèmes critiques (Fiabilité - 149)

**Types de problèmes courants** :
- ❌ Variables non utilisées
- ❌ Fonctions non appelées
- ❌ Erreurs potentielles de nullité
- ❌ Promesses non gérées
- ❌ Conditions toujours vraies/fausses

**Action** :
```powershell
# Voir les détails dans SonarQube
# Aller sur : Problèmes → Fiabilité → Trier par gravité
```

### Phase 2 : Duplications (8.3%)

**Problème** : Code dupliqué = maintenance difficile

**Solution** :
- ✅ Utiliser les modules créés (common/utils.js, etc.)
- ✅ Extraire les fonctions communes
- ✅ Créer des composants réutilisables

### Phase 3 : Maintenabilité (562)

**Types de problèmes** :
- ⚠️ Complexité cognitive élevée → ✅ **Déjà corrigé !**
- ⚠️ Fonctions trop longues
- ⚠️ Code mort
- ⚠️ Commentaires TODO

**Status** :
- ✅ Complexité cognitive : 91 → ≤15 (corrigé)
- ⏳ Autres problèmes à analyser

---

## 🛠️ Correction automatique

### Script PowerShell d'analyse

```powershell
# Créer un script d'analyse automatique
./scripts/analyze-sonarqube.ps1
```

Contenu du script :

```powershell
# analyze-sonarqube.ps1
Write-Host "🔍 Analyse SonarQube d'EcoRide" -ForegroundColor Cyan

# Vérifier que SonarScanner est installé
if (!(Get-Command sonar-scanner -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SonarScanner n'est pas installé" -ForegroundColor Red
    Write-Host "Installation: choco install sonarscanner" -ForegroundColor Yellow
    exit 1
}

# Vérifier le token
if (!$env:SONAR_TOKEN) {
    Write-Host "❌ Variable SONAR_TOKEN non définie" -ForegroundColor Red
    Write-Host "Définir: `$env:SONAR_TOKEN = 'votre_token'" -ForegroundColor Yellow
    exit 1
}

# Lancer l'analyse
Write-Host "📊 Lancement de l'analyse..." -ForegroundColor Green
sonar-scanner -Dsonar.login=$env:SONAR_TOKEN

# Attendre les résultats
Write-Host "✅ Analyse terminée !" -ForegroundColor Green
Write-Host "📈 Voir les résultats : http://localhost:9000/dashboard?id=ecoride" -ForegroundColor Cyan
```

---

## 📈 Suivi de la qualité

### Intégration CI/CD (futur)

```yaml
# .github/workflows/sonarqube.yml
name: SonarQube Analysis

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

### Badges de qualité

Une fois configuré, ajouter dans README.md :

```markdown
[![Quality Gate Status](http://localhost:9000/api/project_badges/measure?project=ecoride&metric=alert_status)](http://localhost:9000/dashboard?id=ecoride)
[![Reliability Rating](http://localhost:9000/api/project_badges/measure?project=ecoride&metric=reliability_rating)](http://localhost:9000/dashboard?id=ecoride)
[![Maintainability Rating](http://localhost:9000/api/project_badges/measure?project=ecoride&metric=sqale_rating)](http://localhost:9000/dashboard?id=ecoride)
```

---

## 🎯 Objectifs de qualité

| Métrique | Actuel | Objectif | Actions |
|----------|--------|----------|---------|
| **Complexité cognitive** | 91 | ≤15 | ✅ FAIT |
| **Fiabilité** | C (149) | A (0) | 🔄 En cours |
| **Duplications** | 8.3% | <3% | 🔄 En cours |
| **Maintenabilité** | A (562) | A (0) | 🔄 En cours |
| **Couverture** | 0% | >80% | ⏳ Futur |
| **Sécurité** | ? | A | ⏳ À vérifier |

---

## 🔥 Problèmes prioritaires à corriger

### 1. Variables non utilisées
```javascript
// ❌ MAUVAIS
const unusedVar = 'test';
function myFunction() {
    const result = doSomething();
    // result jamais utilisé
}

// ✅ BON
function myFunction() {
    const result = doSomething();
    return result;
}
```

### 2. Promesses non gérées
```javascript
// ❌ MAUVAIS
fetch('/api/data'); // Pas de .catch()

// ✅ BON
fetch('/api/data')
    .then(response => response.json())
    .catch(error => console.error('Erreur:', error));
```

### 3. Code dupliqué
```javascript
// ❌ MAUVAIS (dupliqué dans 5 fichiers)
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ BON (dans utils.js, importé partout)
import { validateEmail } from './common/utils.js';
```

---

## 📚 Ressources

### Documentation
- [SonarQube Documentation](https://docs.sonarqube.org/latest/)
- [JavaScript Rules](https://rules.sonarsource.com/javascript/)
- [Best Practices](https://docs.sonarqube.org/latest/user-guide/clean-code/)

### Règles corrigées
- ✅ **S1192** - Littéraux dupliqués
- ✅ **S7761** - dataset vs getAttribute
- ✅ **S2004** - Niveaux d'imbrication
- ✅ **S3776** - Complexité cognitive

### Prochaines règles à corriger
- ⏳ **S1481** - Variables inutilisées
- ⏳ **S1854** - Valeurs inutilisées
- ⏳ **S2583** - Conditions toujours vraies
- ⏳ **S3504** - Fonctions retournant toujours la même chose

---

## 💡 Conseils

### 1. Analyser régulièrement
```powershell
# Créer un script dans package.json
npm run analyze
```

### 2. Fixer les problèmes par ordre de priorité
1. 🔴 Blockers & Critical
2. 🟠 Major
3. 🟡 Minor
4. 🟢 Info

### 3. Maintenir la qualité
- ✅ Analyser avant chaque commit
- ✅ Ne pas merger si porte de qualité échoue
- ✅ Suivre les métriques dans le temps

---

## 🎉 Conclusion

Avec les corrections déjà effectuées :
- ✅ **Complexité cognitive réduite de 83%**
- ✅ **Architecture modulaire propre**
- ✅ **60+ fonctions réutilisables**

**Prochaine étape** : Lancer l'analyse SonarQube complète pour identifier et corriger les 149 problèmes de fiabilité et réduire les duplications !

---

**Date** : 12 novembre 2025  
**Version** : 1.0  
**Projet** : EcoRide - Plateforme de covoiturage écologique
