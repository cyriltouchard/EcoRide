# Script d'analyse SonarQube pour EcoRide
# Gère automatiquement les tests avec couverture et l'analyse SonarQube
# Usage: .\analyze-sonarqube.ps1 [-WithCoverage] [-Token "votre_token"] [-HostUrl "http://localhost:9000"]

param(
    [switch]$WithCoverage = $true,
    [string]$Token = $env:SONAR_TOKEN,
    [string]$HostUrl = "http://localhost:9000"
)

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  ANALYSE SONARQUBE - ECORIDE" -ForegroundColor Green
Write-Host "  Analyse de qualite du code avec couverture" -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1 : Verifier que SonarQube est accessible
Write-Host "[1/5] Verification de SonarQube ($HostUrl)..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$HostUrl/api/system/status" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $status = ($response.Content | ConvertFrom-Json).status
    
    if ($status -eq "UP") {
        Write-Host "      SonarQube est actif" -ForegroundColor Green
    } else {
        Write-Host "      ATTENTION: SonarQube status: $status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "      ERREUR: Impossible de contacter SonarQube" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifier que SonarQube est demarre:" -ForegroundColor Yellow
    Write-Host "  - Docker: docker start sonarqube" -ForegroundColor White
    Write-Host "  - Local: .\bin\windows-x86-64\StartSonar.bat" -ForegroundColor White
    Write-Host ""
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Etape 2 : Generer les tests avec couverture
if ($WithCoverage) {
    Write-Host "[2/5] Generation des rapports de couverture..." -ForegroundColor Cyan
    
    if (Test-Path "server") {
        Set-Location -Path "server"
        Write-Host "      Execution des tests Jest avec --coverage..." -ForegroundColor White
        
        $testOutput = npm test -- --coverage --silent 2>&1
        $testExitCode = $LASTEXITCODE
        
        Set-Location -Path ".."
        
        if ($testExitCode -eq 0) {
            Write-Host "      Tests executes avec succes" -ForegroundColor Green
        } else {
            Write-Host "      ATTENTION: Certains tests ont echoue (code: $testExitCode)" -ForegroundColor Yellow
            Write-Host "      L'analyse continue avec la couverture partielle..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "      ATTENTION: Dossier 'server' introuvable" -ForegroundColor Yellow
        Write-Host "      Passage en mode sans couverture..." -ForegroundColor Yellow
        $WithCoverage = $false
    }
} else {
    Write-Host "[2/5] Generation des rapports de couverture... IGNORE" -ForegroundColor Yellow
}
Write-Host ""

# Etape 3 : Verifier le fichier de couverture
if ($WithCoverage) {
    Write-Host "[3/5] Verification du rapport de couverture..." -ForegroundColor Cyan
    
    if (Test-Path "server/coverage/lcov.info") {
        $lcovSize = (Get-Item "server/coverage/lcov.info").Length
        Write-Host "      Fichier lcov.info trouve ($lcovSize octets)" -ForegroundColor Green
    } else {
        Write-Host "      ATTENTION: Fichier lcov.info non trouve" -ForegroundColor Yellow
        Write-Host "      L'analyse continuera sans couverture de code" -ForegroundColor Yellow
    }
} else {
    Write-Host "[3/5] Verification du rapport de couverture... IGNORE" -ForegroundColor Yellow
}
Write-Host ""

# Etape 4 : Configuration de l'authentification
Write-Host "[4/5] Configuration de l'authentification..." -ForegroundColor Cyan

# Verifier si un token existe dans .env.sonarqube
$envFile = ".env.sonarqube"
if (!$Token -and (Test-Path $envFile)) {
    $content = Get-Content $envFile | Select-String "SONAR_TOKEN"
    if ($content) {
        $Token = $content.ToString().Split('=')[1].Trim()
        Write-Host "      Token charge depuis .env.sonarqube" -ForegroundColor Green
    }
}

if ($Token) {
    Write-Host "      Utilisation du token d'authentification" -ForegroundColor Green
    $env:SONAR_TOKEN = $Token
} else {
    Write-Host "      ERREUR: Token SonarQube non fourni" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour definir le token:" -ForegroundColor Yellow
    Write-Host "  1. Aller sur $HostUrl" -ForegroundColor White
    Write-Host "  2. Se connecter (admin/admin par defaut)" -ForegroundColor White
    Write-Host "  3. Mon compte -> Securite -> Generer un token" -ForegroundColor White
    Write-Host "  4. Creer un fichier .env.sonarqube avec:" -ForegroundColor White
    Write-Host "     SONAR_TOKEN=votre_token_ici" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ou passer en parametre:" -ForegroundColor Yellow
    Write-Host "  .\analyze-sonarqube.ps1 -Token 'votre_token'" -ForegroundColor White
    exit 1
}
Write-Host ""

# Etape 5 : Lancer l'analyse SonarScanner
Write-Host "[5/5] Lancement de l'analyse SonarScanner..." -ForegroundColor Cyan
Write-Host ""

# Verifier que sonar-scanner est installe
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
        Write-Host "===============================================================" -ForegroundColor Green
        Write-Host "  ANALYSE TERMINEE AVEC SUCCES" -ForegroundColor Green
        Write-Host "===============================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Duree: $([math]::Round($duration, 2)) secondes" -ForegroundColor White
        Write-Host "Resultats: $HostUrl/dashboard?id=ecoride" -ForegroundColor Cyan
        Write-Host ""
        
        # Afficher les metriques importantes
        Write-Host "Metriques a verifier:" -ForegroundColor Yellow
        Write-Host "  - Couverture de code" -ForegroundColor White
        Write-Host "  - Duplications (<3%)" -ForegroundColor White
        Write-Host "  - Security Hotspots (0% reviewed -> 100%)" -ForegroundColor White
        Write-Host "  - Bugs et vulnerabilites" -ForegroundColor White
        Write-Host ""
        
        # Proposer d'ouvrir le navigateur
        Write-Host "Ouvrir le tableau de bord dans le navigateur ? (O/N)" -ForegroundColor Yellow
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
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  document/qualite/GUIDE-SONARQUBE-ANALYSE.md" -ForegroundColor White
Write-Host "  document/qualite/RESUME-AMELIORATION-SONARQUBE.md" -ForegroundColor White
Write-Host ""
