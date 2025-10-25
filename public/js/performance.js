// SCRIPT DE PERFORMANCE FRONTEND - ECORIDE
// Fichier: public/js/performance.js

class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.startTime = performance.now();
        this.init();
    }

    init() {
        // Mesurer le temps de chargement initial
        window.addEventListener('load', () => {
            this.measurePageLoad();
        });

        // Observer les mutations DOM pour les performances
        this.observeDOM();
        
        // Mesurer les interactions utilisateur
        this.trackUserInteractions();
    }

    measurePageLoad() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.pageLoad = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart,
                dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
                serverResponse: navigation.responseEnd - navigation.requestStart
            };
        }

        // Mesurer les ressources
        this.measureResources();
    }

    measureResources() {
        const resources = performance.getEntriesByType('resource');
        this.metrics.resources = {
            total: resources.length,
            images: resources.filter(r => r.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)).length,
            scripts: resources.filter(r => r.name.match(/\.js$/i)).length,
            styles: resources.filter(r => r.name.match(/\.css$/i)).length,
            largest: resources.reduce((max, r) => r.transferSize > max.transferSize ? r : max, { transferSize: 0 })
        };
    }

    observeDOM() {
        // Observer les changements DOM qui peuvent affecter les performances
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 10) {
                    console.warn('Performance: Beaucoup de noeuds DOM ajoutés d\'un coup', mutation.addedNodes.length);
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    trackUserInteractions() {
        // Mesurer le temps de réponse aux clics
        document.addEventListener('click', (e) => {
            const startTime = performance.now();
            
            // Utiliser requestAnimationFrame pour mesurer le temps de rendu
            requestAnimationFrame(() => {
                const endTime = performance.now();
                const responseTime = endTime - startTime;
                
                if (responseTime > 100) {
                    console.warn(`Performance: Interaction lente détectée (${responseTime.toFixed(2)}ms)`, e.target);
                }
            });
        });
    }

    // Mesurer les requêtes API
    trackAPICall(url, startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (!this.metrics.api) {
            this.metrics.api = [];
        }
        
        this.metrics.api.push({
            url,
            duration,
            timestamp: new Date().toISOString()
        });

        // Alerter si la requête est trop lente
        if (duration > 2000) {
            console.warn(`Performance: Requête API lente (${duration.toFixed(2)}ms)`, url);
        }
    }

    // Générer un rapport de performance
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            sessionDuration: performance.now() - this.startTime,
            metrics: this.metrics,
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }

    // Envoyer le rapport au serveur (optionnel)
    sendReport() {
        const report = this.generateReport();
        
        // Utiliser sendBeacon pour envoyer les données même si l'utilisateur quitte la page
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/performance', JSON.stringify(report));
        } else {
            // Fallback pour les navigateurs plus anciens
            fetch('/api/performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report),
                keepalive: true
            }).catch(console.error);
        }
    }
}

// Initialiser le monitoring de performance
const performanceMonitor = new PerformanceMonitor();

// Envoyer le rapport quand l'utilisateur quitte la page
window.addEventListener('beforeunload', () => {
    performanceMonitor.sendReport();
});

// Exposer pour utilisation dans d'autres scripts
window.performanceMonitor = performanceMonitor;