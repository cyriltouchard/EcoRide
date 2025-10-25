# Script de sauvegarde GitHub - EcoRide
# Utiliser ce script après avoir créé le repository sur GitHub

Write-Host "`n=== SAUVEGARDE GITHUB - ECORIDE ===" -ForegroundColor Cyan

# Demander l'URL du repository GitHub
Write-Host "`nCollez l'URL de votre repository GitHub :" -ForegroundColor Yellow
Write-Host "Exemple : https://github.com/USERNAME/EcoRide.git" -ForegroundColor Gray
$repoUrl = Read-Host "URL"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "`nERREUR : URL vide" -ForegroundColor Red
    exit 1
}

Write-Host "`nConfiguration du remote origin..." -ForegroundColor Cyan
git remote add origin $repoUrl

Write-Host "Verification du remote..." -ForegroundColor Cyan
git remote -v

Write-Host "`nRenommage de la branche en main..." -ForegroundColor Cyan
git branch -M main

Write-Host "`nEnvoi vers GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "    SAUVEGARDE GITHUB TERMINEE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Votre projet est maintenant sur GitHub !" -ForegroundColor Green
Write-Host "URL : $repoUrl" -ForegroundColor White

Write-Host "`nPROCHAINES SAUVEGARDES :" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m 'Description des changements'" -ForegroundColor White
Write-Host "  git push" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Green
