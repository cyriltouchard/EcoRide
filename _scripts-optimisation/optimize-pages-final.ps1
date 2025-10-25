# Script PowerShell - Optimisation HEAD des pages HTML restantes
# EcoRide 2025

Write-Host "=== Optimisation des pages HTML ===" -ForegroundColor Cyan

# Template HEAD optimisé
function Get-OptimizedHead {
    param(
        [string]$Title,
        [string]$Description,
        [string]$Robots,
        [string]$FileName
    )
    
    $ogTitle = $Title -replace ' \| .*$', ''
    $shortDesc = if ($Description.Length -gt 150) { $Description.Substring(0, 147) + "..." } else { $Description }
    
    return @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <!-- Métas essentiels -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#27ae60">
    
    <!-- SEO -->
    <title>$Title</title>
    <meta name="description" content="$Description">
    <meta name="author" content="EcoRide">
    <meta name="robots" content="$Robots">
    <link rel="canonical" href="https://ecoride.fr/$FileName">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://ecoride.fr/$FileName">
    <meta property="og:title" content="$ogTitle">
    <meta property="og:description" content="$shortDesc">
    <meta property="og:image" content="https://ecoride.fr/public/images/logo.png">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:site_name" content="EcoRide">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://ecoride.fr/$FileName">
    <meta name="twitter:title" content="$ogTitle">
    <meta name="twitter:description" content="$shortDesc">
    <meta name="twitter:image" content="https://ecoride.fr/public/images/logo.png">
    
    <!-- Favicons -->
    <link rel="icon" type="image/svg+xml" href="public/images/favicon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="public/images/favicon.svg">
    <link rel="apple-touch-icon" sizes="180x180" href="public/images/favicon.svg">
    
    <!-- Préchargement des ressources (Performance) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Poppins:wght@700&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer">
    
    <!-- Styles -->
    <link rel="stylesheet" href="public/css/style.css">
</head>
"@
}

# Liste des pages à traiter
$pages = @(
    @{ File="details-covoiturage.html"; Title="Détails du Trajet - EcoRide | Informations et réservation"; Description="Consultez tous les détails du trajet en covoiturage : horaires, itinéraire, tarif, profil du conducteur et avis des passagers. Réservation instantanée sécurisée."; Robots="noindex, follow" },
    @{ File="espace-chauffeur.html"; Title="Espace Chauffeur - EcoRide | Gérez vos trajets proposés"; Description="Accédez à votre espace chauffeur EcoRide. Gérez vos trajets publiés, suivez vos réservations, communiquez avec vos passagers et consultez vos gains."; Robots="noindex, nofollow" },
    @{ File="employe.html"; Title="Espace Employé - EcoRide | Gestion interne"; Description="Tableau de bord employé EcoRide pour la gestion et le support des utilisateurs."; Robots="noindex, nofollow" },
    @{ File="admin.html"; Title="Administration - EcoRide | Panneau d'administration"; Description="Panneau d'administration EcoRide pour la gestion de la plateforme."; Robots="noindex, nofollow" },
    @{ File="contact.html"; Title="Contact - EcoRide | Nous contacter"; Description="Contactez l'équipe EcoRide. Assistance, questions, partenariats ou suggestions : nous sommes à votre écoute 7j/7. Réponse rapide garantie."; Robots="index, follow" },
    @{ File="mentions-legales.html"; Title="Mentions Légales - EcoRide | Informations juridiques"; Description="Consultez les mentions légales d'EcoRide : éditeur du site, hébergement, propriété intellectuelle et informations de contact légales."; Robots="index, follow" },
    @{ File="politique-confidentialite.html"; Title="Politique de Confidentialité - EcoRide | Protection des données"; Description="Notre politique de confidentialité : traitement des données personnelles, vos droits RGPD, cookies et mesures de sécurité sur EcoRide."; Robots="index, follow" },
    @{ File="conditions-generales.html"; Title="Conditions Générales - EcoRide | CGU et CGV"; Description="Conditions Générales d'Utilisation et de Vente d'EcoRide. Règles du service de covoiturage, responsabilités, annulations et litiges."; Robots="index, follow" },
    @{ File="audit-complet-global.html"; Title="Audit Global - EcoRide | Analyse technique interne"; Description="Tableau de bord d'audit technique et qualité du projet EcoRide."; Robots="noindex, nofollow" },
    @{ File="test-images.html"; Title="Tests Images - EcoRide | Page de test interne"; Description="Page de test des ressources images EcoRide."; Robots="noindex, nofollow" }
)

$count = 0
foreach ($page in $pages) {
    if (!(Test-Path $page.File)) {
        Write-Host "⚠️ $($page.File) introuvable" -ForegroundColor Yellow
        continue
    }
    
    $count++
    Write-Host "[$count/10] Optimisation de $($page.File)..." -ForegroundColor Cyan
    
    # Lecture du fichier
    $content = Get-Content $page.File -Raw -Encoding UTF8
    
    # Extraction du body
    if ($content -match '(?s)</head>(.*)') {
        $bodyPart = "</head>" + $matches[1]
        
        # Génération du nouveau head
        $newHead = Get-OptimizedHead -Title $page.Title -Description $page.Description -Robots $page.Robots -FileName $page.File
        
        # Reconstruction
        $newContent = $newHead + $bodyPart
        
        # Sauvegarde
        Copy-Item $page.File "$($page.File).bak" -Force
        $newContent | Out-File -FilePath $page.File -Encoding UTF8 -NoNewline
        
        Write-Host "   ✅ Optimisé" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Structure HTML invalide" -ForegroundColor Red
    }
}

Write-Host "`n✅ Terminé : $count pages optimisées" -ForegroundColor Green
