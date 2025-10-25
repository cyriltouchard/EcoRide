# Script d'optimisation automatique des balises <head> - Pages restantes
# EcoRide 2025

Write-Host "🚀 Optimisation des pages HTML restantes..." -ForegroundColor Cyan

$pages = @(
    @{
        file = "details-covoiturage.html"
        title = "Détails du Trajet - EcoRide | Informations et réservation"
        description = "Consultez tous les détails du trajet en covoiturage : horaires, itinéraire, tarif, profil du conducteur et avis des passagers. Réservation instantanée sécurisée."
        robots = "noindex, follow"
    },
    @{
        file = "espace-chauffeur.html"
        title = "Espace Chauffeur - EcoRide | Gérez vos trajets proposés"
        description = "Accédez à votre espace chauffeur EcoRide. Gérez vos trajets publiés, suivez vos réservations, communiquez avec vos passagers et consultez vos gains."
        robots = "noindex, nofollow"
    },
    @{
        file = "employe.html"
        title = "Espace Employé - EcoRide | Gestion interne"
        description = "Tableau de bord employé EcoRide pour la gestion et le support des utilisateurs."
        robots = "noindex, nofollow"
    },
    @{
        file = "admin.html"
        title = "Administration - EcoRide | Panneau d'administration"
        description = "Panneau d'administration EcoRide pour la gestion de la plateforme."
        robots = "noindex, nofollow"
    },
    @{
        file = "contact.html"
        title = "Contact - EcoRide | Nous contacter"
        description = "Contactez l'équipe EcoRide. Assistance, questions, partenariats ou suggestions : nous sommes à votre écoute 7j/7. Réponse rapide garantie."
        robots = "index, follow"
    },
    @{
        file = "mentions-legales.html"
        title = "Mentions Légales - EcoRide | Informations juridiques"
        description = "Consultez les mentions légales d'EcoRide : éditeur du site, hébergement, propriété intellectuelle et informations de contact légales."
        robots = "index, follow"
    },
    @{
        file = "politique-confidentialite.html"
        title = "Politique de Confidentialité - EcoRide | Protection des données"
        description = "Notre politique de confidentialité : traitement des données personnelles, vos droits RGPD, cookies et mesures de sécurité sur EcoRide."
        robots = "index, follow"
    },
    @{
        file = "conditions-generales.html"
        title = "Conditions Générales - EcoRide | CGU et CGV"
        description = "Conditions Générales d'Utilisation et de Vente d'EcoRide. Règles du service de covoiturage, responsabilités, annulations et litiges."
        robots = "index, follow"
    },
    @{
        file = "audit-complet-global.html"
        title = "Audit Global - EcoRide | Analyse technique interne"
        description = "Tableau de bord d'audit technique et qualité du projet EcoRide."
        robots = "noindex, nofollow"
    },
    @{
        file = "test-images.html"
        title = "Tests Images - EcoRide | Page de test interne"
        description = "Page de test des ressources images EcoRide."
        robots = "noindex, nofollow"
    }
)

$template = @'
<!DOCTYPE html>
<html lang="fr">
<head>
    <!-- Métas essentiels -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#27ae60">
    
    <!-- SEO -->
    <title>{TITLE}</title>
    <meta name="description" content="{DESCRIPTION}">
    <meta name="author" content="EcoRide">
    <meta name="robots" content="{ROBOTS}">
    <link rel="canonical" href="https://ecoride.fr/{FILE}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://ecoride.fr/{FILE}">
    <meta property="og:title" content="{OG_TITLE}">
    <meta property="og:description" content="{OG_DESCRIPTION}">
    <meta property="og:image" content="https://ecoride.fr/public/images/logo.png">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:site_name" content="EcoRide">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://ecoride.fr/{FILE}">
    <meta name="twitter:title" content="{TWITTER_TITLE}">
    <meta name="twitter:description" content="{TWITTER_DESCRIPTION}">
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
'@

$count = 0
$total = $pages.Count

foreach ($page in $pages) {
    $count++
    $filePath = $page.file
    
    if (!(Test-Path $filePath)) {
        Write-Host "⚠️ $filePath introuvable, passage..." -ForegroundColor Yellow
        continue
    }
    
    Write-Host "[$count/$total] 🔧 Optimisation de $filePath..." -ForegroundColor Cyan
    
    # Lecture du fichier
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    # Extraction du <body> (tout après </head>)
    if ($content -match '(?s)</head>(.*$)') {
        $bodyContent = $matches[1]
    } else {
        Write-Host "   ❌ Structure HTML invalide dans $filePath" -ForegroundColor Red
        continue
    }
    
    # Préparation des variables pour le template
    $ogTitle = $page.title -replace ' - EcoRide.*$', ' - EcoRide'
    $twitterTitle = $ogTitle
    
    # Descriptions courtes pour réseaux sociaux (max 200 chars)
    $shortDesc = if ($page.description.Length -gt 150) {
        $page.description.Substring(0, 147) + "..."
    } else {
        $page.description
    }
    
    # Construction du nouveau <head>
    $newHead = $template -replace '\{TITLE\}', $page.title `
                        -replace '\{DESCRIPTION\}', $page.description `
                        -replace '\{ROBOTS\}', $page.robots `
                        -replace '\{FILE\}', $filePath `
                        -replace '\{OG_TITLE\}', $ogTitle `
                        -replace '\{OG_DESCRIPTION\}', $shortDesc `
                        -replace '\{TWITTER_TITLE\}', $twitterTitle `
                        -replace '\{TWITTER_DESCRIPTION\}', $shortDesc
    
    # Reconstruction du fichier
    $newContent = $newHead + "</head>" + $bodyContent
    
    # Sauvegarde avec backup
    Copy-Item $filePath "$filePath.bak" -Force
    $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
    
    Write-Host "   ✅ $filePath optimisé (backup: $filePath.bak)" -ForegroundColor Green
}

Write-Host "`n✅ Optimisation terminée : $count/$total pages traitées" -ForegroundColor Green
Write-Host "📊 Résumé :" -ForegroundColor Cyan
Write-Host "   • Font Awesome mis à jour vers 6.5.1 avec intégrité SRI" -ForegroundColor White
Write-Host "   • Meta theme-color ajouté (#27ae60)" -ForegroundColor White
Write-Host "   • Favicons SVG/PNG/Apple ajoutés" -ForegroundColor White
Write-Host "   • Préconnexion CDN optimisée (performance)" -ForegroundColor White
Write-Host "   • Open Graph et Twitter Cards configurés" -ForegroundColor White
Write-Host "   • Robots et canonical configurés par page" -ForegroundColor White
Write-Host "`n💾 Les fichiers originaux ont été sauvegardés avec l'extension .bak" -ForegroundColor Yellow
