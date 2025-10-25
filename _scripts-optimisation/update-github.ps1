# Script de remplacement du repository GitHub existant
# EcoRide - Version optimisée 2025

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ECRASEMENT REPOSITORY GITHUB" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$repoUrl = "https://github.com/cyriltouchard/EcoRide.git"

Write-Host "Repository cible : $repoUrl" -ForegroundColor Cyan
Write-Host "`nCe script va :" -ForegroundColor Yellow
Write-Host "  1. Ajouter le remote GitHub" -ForegroundColor White
Write-Host "  2. Renommer la branche en main" -ForegroundColor White
Write-Host "  3. ECRASER l'ancien contenu sur GitHub" -ForegroundColor Red
Write-Host "  4. Pousser la nouvelle version optimisee" -ForegroundColor White

Write-Host "`nATTENTION : L'ancien projet sur GitHub sera remplace !" -ForegroundColor Red
$confirm = Read-Host "`nTapez 'OUI' en majuscules pour confirmer"

if ($confirm -ne "OUI") {
    Write-Host "`nAnnule - Pas de confirmation" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n=== ETAPE 1 : Configuration remote ===" -ForegroundColor Cyan
# Supprimer origin s'il existe déjà
git remote remove origin 2>$null
git remote add origin $repoUrl
Write-Host "Remote ajoute" -ForegroundColor Green

Write-Host "`n=== ETAPE 2 : Renommage branche ===" -ForegroundColor Cyan
git branch -M main
Write-Host "Branche renommee en 'main'" -ForegroundColor Green

Write-Host "`n=== ETAPE 3 : Push force (ecrasement) ===" -ForegroundColor Cyan
Write-Host "Ecrasement de l'ancien repository..." -ForegroundColor Yellow
git push -f origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "    MISE A JOUR REUSSIE" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Votre repository GitHub a ete mis a jour !" -ForegroundColor Green
    Write-Host "URL : $repoUrl" -ForegroundColor White
    Write-Host "`nContenu mis a jour :" -ForegroundColor Cyan
    Write-Host "  - 98 fichiers" -ForegroundColor White
    Write-Host "  - 22,643 lignes de code" -ForegroundColor White
    Write-Host "  - Version optimisee SEO" -ForegroundColor White
    Write-Host "  - Scripts d'optimisation archives" -ForegroundColor White
    
    Write-Host "`nPROCHAINES SAUVEGARDES :" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m 'Description'" -ForegroundColor White
    Write-Host "  git push" -ForegroundColor White
    
    Write-Host "`n========================================" -ForegroundColor Green
} else {
    Write-Host "`nERREUR lors du push" -ForegroundColor Red
    Write-Host "Verifiez vos identifiants GitHub" -ForegroundColor Yellow
}
