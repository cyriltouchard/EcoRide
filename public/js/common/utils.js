/**
 * EcoRide - Utilitaires communs
 * Fonctions utilitaires réutilisables dans toute l'application
 * @file utils.js
 */

/**
 * Fonction de protection XSS - Nettoie le HTML dangereux
 * @param {string} str - Chaîne à nettoyer
 * @returns {string} Chaîne nettoyée
 */
export const sanitizeHTML = (str) => {
    if (typeof str !== 'string') return str;
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

/**
 * Validation et nettoyage des entrées utilisateur
 * @param {string} input - Entrée utilisateur à valider
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Entrée nettoyée
 */
export const validateAndSanitizeInput = (input, maxLength = 500) => {
    if (typeof input !== 'string') return '';
    
    // Supprimer les scripts malveillants
    let cleaned = input.replaceAll(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Supprimer les événements JavaScript
    cleaned = cleaned.replaceAll(/on\w+="[^"]*"/gi, '');
    cleaned = cleaned.replaceAll(/on\w+='[^']*'/gi, '');
    
    // Limiter la longueur
    cleaned = cleaned.substring(0, maxLength);
    
    // Échapper les caractères HTML
    return sanitizeHTML(cleaned);
};

/**
 * Capitalise la première lettre de chaque mot
 * @param {HTMLInputElement} input - Champ input à modifier
 */
export const capitalizeFirstLetter = (input) => {
    if (!input?.value) return;
    const words = input.value.split(' ');
    const capitalized = words.map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    input.value = capitalized.join(' ');
};

/**
 * Initialise la capitalisation automatique sur des champs spécifiques
 */
export const initFieldsCapitalization = () => {
    // Champs de ville
    const cityFields = [
        document.getElementById('search-departure'),
        document.getElementById('search-arrival'),
        document.getElementById('departure'),
        document.getElementById('arrival')
    ].filter(Boolean);
    
    // Champs de véhicule (marque et modèle)
    const vehicleFields = [
        document.getElementById('brand'),
        document.getElementById('model'),
        document.getElementById('edit-brand-modal'),
        document.getElementById('edit-model-modal')
    ].filter(Boolean);
    
    // Appliquer la capitalisation à tous les champs
    const allFields = [...cityFields, ...vehicleFields];
    
    allFields.forEach(field => {
        field.addEventListener('blur', () => capitalizeFirstLetter(field));
        field.addEventListener('change', () => capitalizeFirstLetter(field));
    });
};

/**
 * Formate un numéro de carte bancaire (XXXX XXXX XXXX XXXX)
 * @param {string} value - Numéro de carte
 * @returns {string} Numéro formaté
 */
export const formatCardNumber = (value) => {
    const cleaned = value.replaceAll(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
};

/**
 * Formate une date d'expiration (MM/YY)
 * @param {string} value - Date d'expiration
 * @returns {string} Date formatée
 */
export const formatExpiryDate = (value) => {
    let cleaned = value.replaceAll(/\D/g, '');
    if (cleaned.length >= 2) {
        cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
};

/**
 * Formate une date pour l'affichage en français
 * @param {string|Date} date - Date à formater
 * @param {object} options - Options de formatage
 * @returns {string} Date formatée
 */
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return new Date(date).toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
};

/**
 * Génère des étoiles pour une note
 * @param {number} rating - Note (1-5)
 * @returns {string} Chaîne d'étoiles
 */
export const generateStars = (rating) => {
    return '⭐'.repeat(Math.round(rating));
};

/**
 * Vérifie si l'utilisateur est connecté
 * @returns {boolean} True si connecté
 */
export const isUserLoggedIn = () => {
    return !!localStorage.getItem('token');
};

/**
 * Redirige vers la page de connexion si non connecté
 * @param {string} message - Message à afficher
 */
export const requireAuth = (message = "Vous devez être connecté pour accéder à cette page.") => {
    if (!isUserLoggedIn()) {
        if (window.showNotification) {
            window.showNotification(message, "error");
        }
        setTimeout(() => window.location.href = 'connexion.html', 2000);
        return false;
    }
    return true;
};

/**
 * Extrait les paramètres de l'URL
 * @param {string} param - Nom du paramètre
 * @returns {string|null} Valeur du paramètre
 */
export const getUrlParameter = (param) => {
    return new URLSearchParams(window.location.search).get(param);
};

/**
 * Debounce une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai en ms
 * @returns {Function} Fonction debouncée
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
