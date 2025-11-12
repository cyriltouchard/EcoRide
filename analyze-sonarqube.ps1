# Script d'analyse SonarQube pour EcoRide
# Usage: .\analyze-sonarqube.ps1

param(
    [string]$Token = $env:SONAR_TOKEN,
    [string]$HostUrl = "http://localhost:9000"
)

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 Analyse SonarQube - EcoRide" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Vérifier SonarScanner
Write-Host "📦 Vérification de SonarScanner..." -ForegroundColor Yellow
if (!(Get-Command sonar-scanner -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SonarScanner n'est pas installé" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation recommandée:" -ForegroundColor Yellow
    Write-Host "  choco install sonarscanner" -ForegroundColor White
    Write-Host ""
    Write-Host "OU télécharger depuis:" -ForegroundColor Yellow
    Write-Host "  https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/" -ForegroundColor White
    exit 1
}
Write-Host "✅ SonarScanner trouvé" -ForegroundColor Green
Write-Host ""

# Vérifier le token
Write-Host "🔑 Vérification du token..." -ForegroundColor Yellow
if (!$Token) {
    Write-Host "❌ Token SonarQube non fourni" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour définir le token:" -ForegroundColor Yellow
    Write-Host "  1. Aller sur $HostUrl" -ForegroundColor White
    Write-Host "  2. Se connecter (admin/admin)" -ForegroundColor White
    Write-Host "  3. Mon compte → Sécurité → Générer un token" -ForegroundColor White
    Write-Host "  4. Exécuter: `$env:SONAR_TOKEN = 'votre_token'" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou passer en paramètre:" -ForegroundColor Yellow
    Write-Host "  .\analyze-sonarqube.ps1 -Token 'votre_token'" -ForegroundColor White
    exit 1
}
Write-Host "✅ Token trouvé" -ForegroundColor Green
Write-Host ""

# Vérifier que SonarQube est accessible
Write-Host "🌐 Vérification de SonarQube ($HostUrl)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$HostUrl/api/system/status" -Method GET -TimeoutSec 5 -ErrorAction Stop
    $status = ($response.Content | ConvertFrom-Json).status
    
    if ($status -eq "UP") {
        Write-Host "✅ SonarQube est en ligne" -ForegroundColor Green
    } else {
        Write-Host "⚠️ SonarQube status: $status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Impossible de contacter SonarQube" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifier que SonarQube est démarré:" -ForegroundColor Yellow
    Write-Host "  - Docker: docker start sonarqube" -ForegroundColor White
    Write-Host "  - Local: .\bin\windows-x86-64\StartSonar.bat" -ForegroundColor White
    Write-Host ""
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Afficher les informations du projet
Write-Host "📁 Informations du projet:" -ForegroundColor Cyan
Write-Host "  Nom: EcoRide" -ForegroundColor White
Write-Host "  Clé: ecoride" -ForegroundColor White
Write-Host "  Répertoire: $PWD" -ForegroundColor White
Write-Host ""

# Afficher les fichiers qui seront analysés
Write-Host "📊 Fichiers à analyser:" -ForegroundColor Cyan
$jsFiles = (Get-ChildItem -Path "public/js" -Filter "*.js" -Recurse | Where-Object { $_.Name -notlike "*.min.js" }).Count
$serverFiles = (Get-ChildItem -Path "server" -Filter "*.js" -Recurse -ErrorAction SilentlyContinue).Count
Write-Host "  JavaScript frontend: $jsFiles fichiers" -ForegroundColor White
Write-Host "  JavaScript backend: $serverFiles fichiers" -ForegroundColor White
Write-Host ""

# Confirmer avant de continuer
Write-Host "🚀 Prêt à lancer l'analyse" -ForegroundColor Green
Write-Host "Appuyer sur Entrée pour continuer, Ctrl+C pour annuler..." -ForegroundColor Yellow
$null = Read-Host

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔄 Lancement de l'analyse..." -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Lancer l'analyse
$startTime = Get-Date

try {
    sonar-scanner `
        -Dsonar.projectKey=ecoride `
        -Dsonar.host.url=$HostUrl `
        -Dsonar.login=$Token `
        -Dsonar.verbose=false
    
    if ($LASTEXITCODE -eq 0) {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "✅ Analyse terminée avec succès !" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏱️ Durée: $([math]::Round($duration, 2)) secondes" -ForegroundColor White
        Write-Host ""
        Write-Host "📈 Voir les résultats:" -ForegroundColor Cyan
        Write-Host "  $HostUrl/dashboard?id=ecoride" -ForegroundColor White
        Write-Host ""
        
        # Essayer d'ouvrir automatiquement le navigateur
        Write-Host "Ouvrir le tableau de bord ? (O/N)" -ForegroundColor Yellow
        $open = Read-Host
        if ($open -eq "O" -or $open -eq "o") {
            Start-Process "$HostUrl/dashboard?id=ecoride"
        }
        
    } else {
        Write-Host ""
        Write-Host "❌ L'analyse a échoué (code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Consulter les logs ci-dessus pour plus de détails" -ForegroundColor Yellow
        exit $LASTEXITCODE
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Erreur lors de l'analyse" -ForegroundColor Red
    Write-Host "$($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎯 Métriques importantes à vérifier:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Complexité cognitive: ≤15 (déjà corrigé !)" -ForegroundColor Green
Write-Host "⏳ Fiabilité: A (0 bugs)" -ForegroundColor Yellow
Write-Host "⏳ Maintenabilité: A (0 code smells)" -ForegroundColor Yellow
Write-Host "⏳ Sécurité: A (0 vulnérabilités)" -ForegroundColor Yellow
Write-Host "⏳ Duplications: <3%" -ForegroundColor Yellow
Write-Host "⏳ Couverture: >80% (nécessite tests unitaires)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  document/GUIDE-SONARQUBE-ANALYSE.md" -ForegroundColor White
Write-Host "  document/REFACTORING-SONARQUBE-RESUME.md" -ForegroundColor White
Write-Host ""
