/**
 * EcoRide - Script principal modulaire
 * Point d'entrée principal de l'application avec architecture modulaire
 * @file main.js
 */

// Import des modules communs
import { initFieldsCapitalization } from './common/utils.js';
import { showNotification } from './common/notifications.js';
import { initAuthCheck, API_BASE_URL, createFetchWithAuth } from './common/auth.js';
import { initAllNavigation } from './common/navigation.js';

/**
 * Initialise les fonctionnalités globales de l'application
 */
const initGlobalFeatures = () => {
    console.log('🚀 Initialisation des fonctionnalités globales...');
    
    // Vérifier l'authentification
    initAuthCheck();
    
    // Initialiser la navigation
    initAllNavigation();
    
    // Initialiser la capitalisation des champs
    initFieldsCapitalization();
    
    console.log('✅ Fonctionnalités globales initialisées');
};

/**
 * Router principal - Charge le module approprié selon la page
 */
const initPageRouter = async () => {
    const currentPage = window.location.pathname.split('/').pop();
    console.log(`📄 Page actuelle: ${currentPage}`);
    
    const pageModules = {
        // Pages d'authentification
        'connexion.html': () => import('./pages/auth/connexion.js'),
        'creation-compte.html': () => import('./pages/auth/creation-compte.js'),
        
        // Pages de trajets
        'covoiturages.html': () => import('./pages/rides/covoiturages.js'),
        'proposer-covoiturage.html': () => import('./pages/rides/proposer-covoiturage.js'),
        'details-covoiturage.html': () => import('./pages/rides/details-covoiturage.js'),
        
        // Pages de paiement
        'acheter-credits.html': () => import('./pages/acheter-credits.js'),
        
        // Autres pages
        'contact.html': () => import('./pages/contact.js'),
        
        // NOTE: Les pages suivantes utilisent encore l'ancien système (via script-backup.js):
        // - espace-utilisateur.html (partiellement refactorisé)
        // - espace-chauffeur.html
        // - avis.html (partiellement refactorisé)
        // - admin.html
        // - employe.html
        // Ces pages seront migrées dans les prochaines phases de refactoring
    };
    
    // Charger le module de la page si disponible
    if (pageModules[currentPage]) {
        try {
            console.log(`📦 Chargement du module pour ${currentPage}...`);
            const module = await pageModules[currentPage]();
            
            // Appeler la fonction d'initialisation du module
            if (module.init && typeof module.init === 'function') {
                await module.init();
                console.log(`✅ Module ${currentPage} initialisé`);
            }
        } catch (error) {
            console.error(`❌ Erreur lors du chargement du module ${currentPage}:`, error);
            showNotification('Erreur lors du chargement de la page', 'error');
        }
    } else {
        console.log(`ℹ️ Pas de module spécifique pour ${currentPage}`);
    }
};

/**
 * Point d'entrée principal de l'application
 */
const init = async () => {
    console.log('🎯 Démarrage de l\'application EcoRide...');
    
    try {
        // 1. Initialiser les fonctionnalités globales
        initGlobalFeatures();
        
        // 2. Router vers le module de page approprié
        await initPageRouter();
        
        console.log('✨ Application EcoRide démarrée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors du démarrage de l\'application:', error);
        showNotification('Erreur lors du chargement de l\'application', 'error');
    }
};

// Démarrer l'application quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Exposer des fonctions globales pour compatibilité avec l'ancien code
window.showNotification = showNotification;
window.API_BASE_URL = API_BASE_URL;
window.createFetchWithAuth = createFetchWithAuth;
