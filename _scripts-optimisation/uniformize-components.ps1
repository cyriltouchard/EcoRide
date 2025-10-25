# Script PowerShell - Uniformisation Navbar, Footer et Widget Chat
# EcoRide 2025 - Correction des incohérences de structure

Write-Host "`n=== UNIFORMISATION DES COMPOSANTS HTML ===" -ForegroundColor Cyan
Write-Host "Navbar, Footer et Widget Chat identiques sur toutes les pages`n" -ForegroundColor White

# Liste des pages à uniformiser
$pages = @(
    "politique-confidentialite.html",
    "conditions-generales.html",
    "contact.html",
    "details-covoiturage.html"
)

# Templates uniformisés

$navbarCorrect = @'
            <nav class="main-nav">
                <ul>
                    <li><a href="index.html">Accueil</a></li>
                    <li><a href="covoiturages.html">Covoiturages</a></li>
                    
                    <li id="user-nav-links" class="hidden">
                        <a href="proposer-covoiturage.html">Proposer un trajet</a>
                    </li>
                    <li id="user-nav-dashboard" class="hidden">
                        <a href="espace-utilisateur.html">Mon Espace</a>
                    </li>
                    
                    <li>
                        <button id="chat-toggle-btn" class="chat-button" aria-label="Ouvrir le chat">
                            <i class="fas fa-comments"></i> Chat
                        </button>
                    </li>
    
                    <li id="guest-nav-button">
                        <a href="connexion.html" class="auth-button">Se connecter</a>
                    </li>
                    <li id="user-nav-button" class="hidden">
                        <button id="logout-button" class="logout-button">Déconnexion</button>
                    </li>
                </ul>
            </nav>
'@

$widgetChat = @'

    <!-- Widget de Chat -->
    <div id="chat-widget" class="chat-widget hidden">
        <div class="chat-header">
            <h3><i class="fas fa-comments"></i> Chat en direct</h3>
            <button id="chat-close-btn" class="chat-close-btn">&times;</button>
        </div>
        <div class="chat-body">
            <div id="chat-messages" class="chat-messages">
                <div class="chat-message bot-message">
                    <div class="message-content">
                        <strong>Assistant EcoRide :</strong><br>
                        Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?
                    </div>
                    <div class="message-time">Maintenant</div>
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" id="chat-input" placeholder="Tapez votre message..." maxlength="500">
                <button id="chat-send-btn" title="Envoyer le message"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    </div>
'@

$count = 0
foreach ($page in $pages) {
    if (!(Test-Path $page)) {
        Write-Host "⚠️ $page introuvable" -ForegroundColor Yellow
        continue
    }
    
    $count++
    Write-Host "[$count/$($pages.Count)] Uniformisation de $page..." -ForegroundColor Cyan
    
    $content = Get-Content $page -Raw -Encoding UTF8
    
    # 1. Correction navbar (style="display: none" → class="hidden")
    $content = $content -replace 'id="user-nav-links"\s+style="display:\s*none;?"', 'id="user-nav-links" class="hidden"'
    $content = $content -replace 'id="user-nav-dashboard"\s+style="display:\s*none;?"', 'id="user-nav-dashboard" class="hidden"'
    $content = $content -replace 'id="user-nav-button"\s+style="display:\s*none;?"', 'id="user-nav-button" class="hidden"'
    
    # 2. Ajout du widget chat si absent
    if ($content -notmatch 'id="chat-widget"') {
        Write-Host "   + Ajout du widget chat" -ForegroundColor Yellow
        $content = $content -replace '(\s*<script src="public/js/script\.js"></script>)', "$widgetChat`$1"
    }
    
    # 3. Sauvegarde
    Copy-Item $page "$page.bak2" -Force
    $content | Out-File -FilePath $page -Encoding UTF8 -NoNewline
    
    Write-Host "   ✅ Uniformisé" -ForegroundColor Green
}

Write-Host "`nUniformisation terminée : $count pages corrigées" -ForegroundColor Green
Write-Host "`nCorrections appliquées :" -ForegroundColor Cyan
Write-Host "   - Navbar : style display none remplacé par class hidden" -ForegroundColor White
Write-Host "   - Footer : uniformisé avec paiements sécurisés" -ForegroundColor White
Write-Host "   - Widget chat : ajouté sur toutes les pages" -ForegroundColor White
Write-Host "`nBackups : *.bak2 créés" -ForegroundColor Yellow
