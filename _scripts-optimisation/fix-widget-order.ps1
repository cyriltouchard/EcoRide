# Script PowerShell - Correction ordre Footer et Widget Chat
# Le widget chat doit être AVANT le footer pour un bon affichage

Write-Host "`n=== CORRECTION ORDRE FOOTER / WIDGET CHAT ===" -ForegroundColor Cyan
Write-Host "Le widget chat doit etre AVANT le footer`n" -ForegroundColor White

$pages = @(
    "conditions-generales.html",
    "contact.html", 
    "covoiturages.html",
    "creation-compte.html",
    "details-covoiturage.html",
    "espace-utilisateur.html",
    "mentions-legales.html",
    "politique-confidentialite.html",
    "proposer-covoiturage.html"
)

$count = 0
foreach ($page in $pages) {
    if (!(Test-Path $page)) {
        Write-Host "Fichier $page introuvable" -ForegroundColor Yellow
        continue
    }
    
    $count++
    Write-Host "[$count/$($pages.Count)] Correction de $page..." -ForegroundColor Cyan
    
    $content = Get-Content $page -Raw -Encoding UTF8
    
    # Vérifier si le widget chat existe
    if ($content -notmatch 'id="chat-widget"') {
        Write-Host "   Pas de widget chat trouve" -ForegroundColor Yellow
        continue
    }
    
    # Extraire les 3 parties : avant footer, footer, widget chat + script
    if ($content -match '(?s)(.*?)(\s*<footer>.*?</footer>)(.*?<div id="chat-widget".*?</div>)(.*?</body>.*?</html>)') {
        $avant = $matches[1]
        $footer = $matches[2]
        $widget = $matches[3]
        $apres = $matches[4]
        
        # Reconstruction : avant + widget + footer + apres
        $newContent = $avant + $widget + "`n" + $footer + $apres
        
        # Sauvegarde
        Copy-Item $page "$page.bak3" -Force
        $newContent | Out-File -FilePath $page -Encoding UTF8 -NoNewline
        
        Write-Host "   Widget chat deplace AVANT footer" -ForegroundColor Green
    } else {
        Write-Host "   Structure HTML non reconnue" -ForegroundColor Red
    }
}

Write-Host "`nCorrection terminee : $count pages traitees" -ForegroundColor Green
Write-Host "Backups : *.bak3 crees" -ForegroundColor Yellow
