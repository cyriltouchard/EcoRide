# Script d'analyse SonarQube pour EcoRide
# Usage: .\analyze-sonarqube-simple.ps1

param(
    [string]$Token = $env:SONAR_TOKEN,
    [string]$HostUrl = "http://localhost:9000"
)

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Analyse SonarQube - EcoRide" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier SonarScanner
Write-Host "[1/5] Verification de SonarScanner..." -ForegroundColor Yellow
if (!(Get-Command sonar-scanner -ErrorAction SilentlyContinue)) {
    Write-Host "ERREUR: SonarScanner n'est pas installe" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation recommandee:" -ForegroundColor Yellow
    Write-Host "  choco install sonarscanner" -ForegroundColor White
    exit 1
}
Write-Host "OK - SonarScanner trouve" -ForegroundColor Green
Write-Host ""

# Verifier le token
Write-Host "[2/5] Verification du token..." -ForegroundColor Yellow
if (!$Token) {
    Write-Host "ERREUR: Token SonarQube non fourni" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour definir le token:" -ForegroundColor Yellow
    Write-Host "  `$env:SONAR_TOKEN = 'votre_token'" -ForegroundColor White
    exit 1
}
Write-Host "OK - Token trouve" -ForegroundColor Green
Write-Host ""

# Verifier que SonarQube est accessible
Write-Host "[3/5] Verification de SonarQube ($HostUrl)..." -ForegroundColor Yellow
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
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Afficher les informations du projet
Write-Host "[4/5] Informations du projet:" -ForegroundColor Cyan
Write-Host "  Nom: EcoRide" -ForegroundColor White
Write-Host "  Cle: ecoride" -ForegroundColor White
Write-Host "  Repertoire: $PWD" -ForegroundColor White
Write-Host ""

# Lancer l'analyse
Write-Host "[5/5] Lancement de l'analyse..." -ForegroundColor Cyan
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
        exit $LASTEXITCODE
    }
    
} catch {
    Write-Host ""
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Metriques importantes" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "- Complexite cognitive: <=15" -ForegroundColor Green
Write-Host "- Fiabilite: A (0 bugs)" -ForegroundColor Yellow
Write-Host "- Maintenabilite: A (0 code smells)" -ForegroundColor Yellow
Write-Host "- Securite: A (0 vulnerabilites)" -ForegroundColor Yellow
Write-Host "- Duplications: <3%" -ForegroundColor Yellow
Write-Host ""
