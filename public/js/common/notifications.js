/**
 * EcoRide - Système de notifications
 * Gestion des notifications utilisateur non bloquantes
 * @file notifications.js
 */

import { sanitizeHTML } from './utils.js';

/**
 * Affiche une notification non bloquante
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification (success, error, info, warning)
 * @param {number} duration - Durée d'affichage en ms (défaut: 5000)
 */
export const showNotification = (message, type = 'info', duration = 5000) => {
    let container = document.getElementById('notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;';
        document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        color: white;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
        min-width: 250px;
        max-width: 400px;
    `;
    
    // Couleurs selon le type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    notification.style.background = colors[type] || colors.info;
    notification.textContent = sanitizeHTML(message);
    
    container.appendChild(notification);
    
    // Supprimer après la durée spécifiée
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
};

/**
 * Affiche une notification de succès
 * @param {string} message - Message à afficher
 */
export const showSuccess = (message) => {
    showNotification(message, 'success');
};

/**
 * Affiche une notification d'erreur
 * @param {string} message - Message à afficher
 */
export const showError = (message) => {
    showNotification(message, 'error');
};

/**
 * Affiche une notification d'avertissement
 * @param {string} message - Message à afficher
 */
export const showWarning = (message) => {
    showNotification(message, 'warning');
};

/**
 * Affiche une notification d'information
 * @param {string} message - Message à afficher
 */
export const showInfo = (message) => {
    showNotification(message, 'info');
};

/**
 * Affiche une notification de chargement
 * @param {string} message - Message à afficher
 * @returns {Function} Fonction pour fermer la notification
 */
export const showLoading = (message = 'Chargement en cours...') => {
    const loadingId = `loading-${Date.now()}`;
    const container = document.getElementById('notification-container') || (() => {
        const c = document.createElement('div');
        c.id = 'notification-container';
        c.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;';
        document.body.appendChild(c);
        return c;
    })();
    
    const notification = document.createElement('div');
    notification.id = loadingId;
    notification.className = 'notification loading';
    notification.style.cssText = `
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        color: white;
        font-weight: 500;
        background: #3498db;
        min-width: 250px;
    `;
    notification.innerHTML = `
        <span class="spinner" style="
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 10px;
            vertical-align: middle;
        "></span>
        ${sanitizeHTML(message)}
    `;
    
    container.appendChild(notification);
    
    // Retourner une fonction pour fermer cette notification
    return () => {
        const elem = document.getElementById(loadingId);
        if (elem) elem.remove();
    };
};

// Ajouter les animations CSS si elles n'existent pas
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Exposer globalement pour compatibilité avec le code existant
window.showNotification = showNotification;
