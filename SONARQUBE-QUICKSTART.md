# 🔍 Analyse SonarQube - Guide rapide

## Installation rapide

### 1. Installer SonarQube (Docker - recommandé)

```powershell
# Télécharger et démarrer SonarQube
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Attendre 1-2 minutes que SonarQube démarre
# Vérifier : http://localhost:9000
```

### 2. Installer SonarScanner

```powershell
# Via Chocolatey (recommandé)
choco install sonarscanner

# Vérifier l'installation
sonar-scanner --version
```

### 3. Configurer le token

```powershell
# 1. Aller sur http://localhost:9000
# 2. Se connecter : admin / admin (changer le mot de passe)
# 3. Mon compte → Sécurité → Générer un token
# 4. Copier le token et exécuter :

$env:SONAR_TOKEN = "votre_token_ici"
```

## 🚀 Lancer l'analyse

```powershell
# Méthode 1 : Script automatique (recommandé)
.\analyze-sonarqube.ps1

# Méthode 2 : Commande directe
sonar-scanner -Dsonar.login=$env:SONAR_TOKEN
```

## 📊 Voir les résultats

Une fois l'analyse terminée :
- Ouvrir http://localhost:9000/dashboard?id=ecoride
- Consulter les problèmes détectés
- Suivre les recommandations de correction

## 📚 Documentation complète

Voir **[document/GUIDE-SONARQUBE-ANALYSE.md](document/GUIDE-SONARQUBE-ANALYSE.md)** pour :
- Configuration détaillée
- Correction des problèmes
- Intégration CI/CD
- Bonnes pratiques

## 🎯 Objectifs

| Métrique | Cible | Status |
|----------|-------|--------|
| Complexité cognitive | ≤15 | ✅ FAIT |
| Fiabilité | A | 🔄 En cours |
| Maintenabilité | A | 🔄 En cours |
| Duplications | <3% | 🔄 En cours |
| Sécurité | A | ⏳ À vérifier |

---

**Documentation** : [GUIDE-SONARQUBE-ANALYSE.md](document/GUIDE-SONARQUBE-ANALYSE.md)  
**Refactoring** : [REFACTORING-SONARQUBE-RESUME.md](document/REFACTORING-SONARQUBE-RESUME.md)
