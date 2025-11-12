# Installation de SonarScanner CLI (sans droits admin)
Write-Host "🔍 Installation de SonarScanner CLI" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Configuration
$version = "6.2.1.4610"
$downloadUrl = "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-$version-windows-x64.zip"
$installDir = "$env:USERPROFILE\sonar-scanner"
$zipFile = "$env:TEMP\sonar-scanner.zip"

# Vérifier si déjà installé
if (Test-Path "$installDir\bin\sonar-scanner.bat") {
    Write-Host "✅ SonarScanner est déjà installé dans:" -ForegroundColor Green
    Write-Host "   $installDir`n" -ForegroundColor Gray
    
    $choice = Read-Host "Voulez-vous réinstaller ? (O/N)"
    if ($choice -ne "O" -and $choice -ne "o") {
        Write-Host "`n✅ Installation annulée" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "`n🗑️  Suppression de l'installation existante..." -ForegroundColor Yellow
    Remove-Item -Path $installDir -Recurse -Force -ErrorAction SilentlyContinue
}

# Téléchargement
Write-Host "📥 Téléchargement de SonarScanner CLI v$version..." -ForegroundColor Cyan
Write-Host "   URL: $downloadUrl" -ForegroundColor Gray
Write-Host "   Taille: ~60 MB`n" -ForegroundColor Gray

try {
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipFile -UseBasicParsing
    Write-Host "✅ Téléchargement terminé`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors du téléchargement:" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    exit 1
}

# Extraction
Write-Host "📦 Extraction dans $installDir..." -ForegroundColor Cyan
try {
    Expand-Archive -Path $zipFile -DestinationPath "$env:USERPROFILE" -Force
    
    # Renommer le dossier
    $extractedDir = "$env:USERPROFILE\sonar-scanner-$version-windows-x64"
    if (Test-Path $extractedDir) {
        Move-Item -Path $extractedDir -Destination $installDir -Force
    }
    
    Write-Host "✅ Extraction terminée`n" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors de l'extraction:" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    exit 1
}

# Nettoyage
Write-Host "🧹 Nettoyage..." -ForegroundColor Cyan
Remove-Item -Path $zipFile -Force -ErrorAction SilentlyContinue
Write-Host "✅ Nettoyage terminé`n" -ForegroundColor Green

# Configuration du PATH
Write-Host "⚙️  Configuration du PATH utilisateur..." -ForegroundColor Cyan
$binPath = "$installDir\bin"

# Récupérer le PATH actuel
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")

# Vérifier si déjà dans le PATH
if ($userPath -notlike "*$binPath*") {
    # Ajouter au PATH
    $newPath = "$userPath;$binPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    
    # Mettre à jour le PATH de la session courante
    $env:Path = "$env:Path;$binPath"
    
    Write-Host "✅ PATH mis à jour`n" -ForegroundColor Green
}
else {
    Write-Host "✅ PATH déjà configuré`n" -ForegroundColor Green
}

# Vérification
Write-Host "🔍 Vérification de l'installation..." -ForegroundColor Cyan
$scannerExe = "$binPath\sonar-scanner.bat"

if (Test-Path $scannerExe) {
    Write-Host "✅ SonarScanner installé avec succès !`n" -ForegroundColor Green
    
    # Tester la commande
    Write-Host "📊 Version installée:" -ForegroundColor Cyan
    & $scannerExe --version
    
    Write-Host "`n" -ForegroundColor Gray
    Write-Host "=" * 60 -ForegroundColor Green
    Write-Host "✅ INSTALLATION RÉUSSIE" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Green
    Write-Host "`n📍 Emplacement: $installDir" -ForegroundColor Cyan
    Write-Host "🔧 Commande: sonar-scanner" -ForegroundColor Cyan
    Write-Host "`n⚠️  IMPORTANT:" -ForegroundColor Yellow
    Write-Host "   Pour que la commande 'sonar-scanner' fonctionne," -ForegroundColor Yellow
    Write-Host "   fermez et rouvrez votre terminal PowerShell`n" -ForegroundColor Yellow
    
    Write-Host "🚀 Prochaine étape:" -ForegroundColor Cyan
    Write-Host "   1. Fermer et rouvrir PowerShell" -ForegroundColor White
    Write-Host "   2. Vérifier: sonar-scanner --version" -ForegroundColor White
    Write-Host "   3. Analyser le projet EcoRide`n" -ForegroundColor White
}
else {
    Write-Host "❌ Erreur: SonarScanner non trouvé après installation" -ForegroundColor Red
    exit 1
}
