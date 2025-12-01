# Script PowerShell pour lancer l'analyse SonarQube avec couverture
# EcoRide - Analyse de qualite du code

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  ANALYSE SONARQUBE - ECORIDE" -ForegroundColor Green
Write-Host "  Amelioration de la couverture de code" -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1 : Verifier SonarQube
Write-Host "Etape 1/5 : Verification de SonarQube..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/api/system/status" -UseBasicParsing -ErrorAction Stop
    Write-Host "SonarQube est actif" -ForegroundColor Green
} catch {
    Write-Host "SonarQube n'est pas accessible" -ForegroundColor Red
    Write-Host "Demarrez SonarQube et reessayez" -ForegroundColor Yellow
    exit 1
}

# Etape 2 : Generer les tests avec couverture
Write-Host ""
Write-Host "Etape 2/5 : Generation des rapports de couverture..." -ForegroundColor Cyan
Set-Location -Path "server"
npm test -- --coverage --verbose=false 2>&1 | Out-Null
Write-Host "Tests executes" -ForegroundColor Green
Set-Location -Path ".."

# Etape 3 : Verifier le fichier lcov
Write-Host ""
Write-Host "Etape 3/5 : Verification du rapport..." -ForegroundColor Cyan
if (Test-Path "server/coverage/lcov.info") {
    Write-Host "Fichier lcov.info trouve" -ForegroundColor Green
} else {
    Write-Host "Fichier lcov.info non trouve" -ForegroundColor Red
    exit 1
}

# Etape 4 : Configuration token
Write-Host ""
Write-Host "Etape 4/5 : Configuration authentification..." -ForegroundColor Cyan
$envFile = ".env.sonarqube"

if (Test-Path $envFile) {
    $content = Get-Content $envFile | Select-String "SONAR_TOKEN"
    if ($content) {
        $token = $content.ToString().Split('=')[1].Trim()
        Write-Host "Token trouve" -ForegroundColor Green
        $env:SONAR_TOKEN = $token
    }
} else {
    Write-Host "Pas de token configure" -ForegroundColor Yellow
    $useDefault = Read-Host "Utiliser admin/admin ? (o/N)"
    if ($useDefault -eq "o") {
        $env:SONAR_LOGIN = "admin"
        $env:SONAR_PASSWORD = "admin"
    } else {
        Write-Host "Analyse annulee" -ForegroundColor Red
        exit 1
    }
}

# Etape 5 : Lancer analyse
Write-Host ""
Write-Host "Etape 5/5 : Lancement analyse..." -ForegroundColor Cyan

if ($env:SONAR_TOKEN) {
    sonar-scanner -Dsonar.token=$env:SONAR_TOKEN
} elseif ($env:SONAR_LOGIN) {
    sonar-scanner -Dsonar.login=$env:SONAR_LOGIN -Dsonar.password=$env:SONAR_PASSWORD
} else {
    sonar-scanner
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "ANALYSE TERMINEE AVEC SUCCES" -ForegroundColor Green
    Write-Host "Resultats : http://localhost:9000/dashboard?id=ecoride" -ForegroundColor White
    Start-Process "http://localhost:9000/dashboard?id=ecoride"
} else {
    Write-Host "ERREUR LORS DE L'ANALYSE" -ForegroundColor Red
    exit 1
}
