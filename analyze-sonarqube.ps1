# Script d'analyse SonarQube pour EcoRide
# Usage: .\analyze-sonarqube.ps1

param(
    [string]$Token = $env:SONAR_TOKEN,
    [string]$HostUrl = "http://localhost:9000"
)

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Analyse SonarQube - EcoRide" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier SonarScanner
Write-Host "[1/6] Verification de SonarScanner..." -ForegroundColor Yellow
if (!(Get-Command sonar-scanner -ErrorAction SilentlyContinue)) {
    Write-Host "ERREUR: SonarScanner n'est pas installe" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation recommandee:" -ForegroundColor Yellow
    Write-Host "  choco install sonarscanner" -ForegroundColor White
    Write-Host ""
    Write-Host "OU telecharger depuis:" -ForegroundColor Yellow
    Write-Host "  https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/" -ForegroundColor White
    exit 1
}
Write-Host "OK - SonarScanner trouve" -ForegroundColor Green
Write-Host ""

# Verifier le token
Write-Host "[2/6] Verification du token..." -ForegroundColor Yellow
if (!$Token) {
    Write-Host "ERREUR: Token SonarQube non fourni" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour definir le token:" -ForegroundColor Yellow
    Write-Host "  1. Aller sur $HostUrl" -ForegroundColor White
    Write-Host "  2. Se connecter (admin/admin)" -ForegroundColor White
    Write-Host "  3. Mon compte -> Securite -> Generer un token" -ForegroundColor White
    Write-Host "  4. Executer: `$env:SONAR_TOKEN = 'votre_token'" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou passer en parametre:" -ForegroundColor Yellow
    Write-Host "  .\analyze-sonarqube.ps1 -Token 'votre_token'" -ForegroundColor White
    exit 1
}
Write-Host "OK - Token trouve" -ForegroundColor Green
Write-Host ""

# Verifier que SonarQube est accessible
Write-Host "[3/6] Verification de SonarQube ($HostUrl)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$HostUrl/api/system/status" -Method GET -TimeoutSec 5 -ErrorAction Stop
    $status = ($response.Content | ConvertFrom-Json).status
    
    if ($status -eq "UP") {
        Write-Host "OK - SonarQube est en ligne" -ForegroundColor Green
    } else {
        Write-Host "AVERTISSEMENT: SonarQube status: $status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "ERREUR: Impossible de contacter SonarQube" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifier que SonarQube est demarre:" -ForegroundColor Yellow
    Write-Host "  - Docker: docker start sonarqube" -ForegroundColor White
    Write-Host "  - Local: .\bin\windows-x86-64\StartSonar.bat" -ForegroundColor White
    Write-Host ""
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Afficher les informations du projet
Write-Host "[4/6] Informations du projet:" -ForegroundColor Cyan
Write-Host "  Nom: EcoRide" -ForegroundColor White
Write-Host "  Cle: ecoride" -ForegroundColor White
Write-Host "  Repertoire: $PWD" -ForegroundColor White
Write-Host ""

# Afficher les fichiers qui seront analyses
Write-Host "[5/6] Fichiers a analyser:" -ForegroundColor Cyan
$jsFiles = (Get-ChildItem -Path "public/js" -Filter "*.js" -Recurse | Where-Object { $_.Name -notlike "*.min.js" }).Count
$serverFiles = (Get-ChildItem -Path "server" -Filter "*.js" -Recurse -ErrorAction SilentlyContinue).Count
Write-Host "  JavaScript frontend: $jsFiles fichiers" -ForegroundColor White
Write-Host "  JavaScript backend: $serverFiles fichiers" -ForegroundColor White
Write-Host ""

# Lancer l'analyse
Write-Host "[6/6] Lancement de l'analyse..." -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

try {
    sonar-scanner `
        "-Dsonar.projectKey=ecoride" `
        "-Dsonar.host.url=$HostUrl" `
        "-Dsonar.token=$Token" `
        "-Dsonar.verbose=false"
    
    if ($LASTEXITCODE -eq 0) {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host ""
        Write-Host "===================================================" -ForegroundColor Green
        Write-Host " Analyse terminee avec succes !" -ForegroundColor Green
        Write-Host "===================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Duree: $([math]::Round($duration, 2)) secondes" -ForegroundColor White
        Write-Host ""
        Write-Host "Voir les resultats:" -ForegroundColor Cyan
        Write-Host "  $HostUrl/dashboard?id=ecoride" -ForegroundColor White
        Write-Host ""
        
        # Ouvrir le navigateur
        Write-Host "Ouvrir le tableau de bord ? (O/N)" -ForegroundColor Yellow
        $open = Read-Host
        if ($open -eq "O" -or $open -eq "o") {
            Start-Process "$HostUrl/dashboard?id=ecoride"
        }
        
    } else {
        Write-Host ""
        Write-Host "ERREUR: L'analyse a echoue (code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Consulter les logs ci-dessus pour plus de details" -ForegroundColor Yellow
        exit $LASTEXITCODE
    }
    
} catch {
    Write-Host ""
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Metriques importantes a verifier" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "- Complexite cognitive: <=15 (deja corrige !)" -ForegroundColor Green
Write-Host "- Fiabilite: A (0 bugs)" -ForegroundColor Yellow
Write-Host "- Maintenabilite: A (0 code smells)" -ForegroundColor Yellow
Write-Host "- Securite: A (0 vulnerabilites)" -ForegroundColor Yellow
Write-Host "- Duplications: <3%" -ForegroundColor Yellow
Write-Host "- Couverture: >80% (necessite tests unitaires)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  document/GUIDE-SONARQUBE-ANALYSE.md" -ForegroundColor White
Write-Host "  document/REFACTORING-SONARQUBE-RESUME.md" -ForegroundColor White
Write-Host ""
