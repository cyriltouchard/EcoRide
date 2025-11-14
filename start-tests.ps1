# Script de démarrage des tests EcoRide
# Usage: .\start-tests.ps1

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 Tests Unitaires EcoRide" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est dans le bon répertoire
if (!(Test-Path "server")) {
    Write-Host "❌ Erreur: Exécutez ce script depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Vérifier si les dépendances sont installées
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow
cd server

if (!(Test-Path "node_modules/jest")) {
    Write-Host "⚠️  Jest n'est pas installé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installation des dépendances de test..." -ForegroundColor Cyan
    npm install --save-dev jest supertest @jest/globals
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "✅ Dépendances présentes" -ForegroundColor Green
    Write-Host ""
}

# Menu de choix
Write-Host "🎯 Que souhaitez-vous faire ?" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 🧪 Lancer tous les tests" -ForegroundColor White
Write-Host "2. 👁️  Lancer en mode watch (recommandé)" -ForegroundColor White
Write-Host "3. 📊 Lancer avec couverture de code" -ForegroundColor White
Write-Host "4. 🎯 Lancer tests unitaires seulement" -ForegroundColor White
Write-Host "5. 🔗 Lancer tests d'intégration seulement" -ForegroundColor White
Write-Host "6. 📝 Lancer tests verbose" -ForegroundColor White
Write-Host "7. ❌ Quitter" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Votre choix (1-7)"

Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "🧪 Lancement de tous les tests..." -ForegroundColor Cyan
        npm test
    }
    "2" {
        Write-Host "👁️  Mode watch activé (Ctrl+C pour quitter)" -ForegroundColor Cyan
        Write-Host ""
        npm run test:watch
    }
    "3" {
        Write-Host "📊 Génération du rapport de couverture..." -ForegroundColor Cyan
        npm run test:coverage
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Rapport généré !" -ForegroundColor Green
            Write-Host ""
            Write-Host "📂 Ouvrir le rapport HTML ? (O/N)" -ForegroundColor Yellow
            $open = Read-Host
            
            if ($open -eq "O" -or $open -eq "o") {
                $coveragePath = Join-Path $PWD "coverage\lcov-report\index.html"
                if (Test-Path $coveragePath) {
                    Start-Process $coveragePath
                } else {
                    Write-Host "⚠️  Rapport non trouvé : $coveragePath" -ForegroundColor Yellow
                }
            }
        }
    }
    "4" {
        Write-Host "🎯 Tests unitaires..." -ForegroundColor Cyan
        npm run test:unit
    }
    "5" {
        Write-Host "🔗 Tests d'intégration..." -ForegroundColor Cyan
        npm run test:integration
    }
    "6" {
        Write-Host "📝 Tests verbose..." -ForegroundColor Cyan
        npm run test:verbose
    }
    "7" {
        Write-Host "👋 Au revoir !" -ForegroundColor Cyan
        exit 0
    }
    default {
        Write-Host "❌ Choix invalide" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Terminé !" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation complète : document/technique/TESTS-UNITAIRES-GUIDE.md" -ForegroundColor White
Write-Host "🎯 Objectif : 80% de couverture" -ForegroundColor White
Write-Host ""
