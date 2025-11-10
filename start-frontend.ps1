# Script pour démarrer le serveur frontend EcoRide
Write-Host "🚀 Démarrage du serveur frontend EcoRide..." -ForegroundColor Green
Write-Host "📍 URL: http://localhost:8080" -ForegroundColor Cyan
Write-Host "⏹️  Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow
Write-Host ""

npx http-server . -p 8080 --cors -c-1
