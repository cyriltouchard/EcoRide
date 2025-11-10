/**
 * EcoRide - Fonctions communes
 * Fichier contenant toutes les fonctions globales utilisées sur toutes les pages
 * @file common.js
 */

// Configuration centralisée des URLs
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Crée une fonction fetch avec authentification automatique
 * @param {string} token - Le token JWT d'authentification
 * @returns {Function} Fonction fetch configurée avec auth
 */
const createFetchWithAuth = (token) => {
    return async (url, options = {}) => {
        console.log('🔵 Requête authentifiée:', url, 'Token présent:', !!token);
        const headers = { ...options.headers, 'Content-Type': 'application/json', 'x-auth-token': token };
        const response = await fetch(url, { ...options, headers });
        
        console.log('📡 Réponse:', response.status, response.statusText);
        
        // Tenter de parser le JSON, sinon retourner null
        let data = null;
        try {
            const text = await response.text();
            data = text ? JSON.parse(text) : null;
            console.log('📦 Data reçue:', data);
        } catch (e) {
            console.error('❌ Erreur de parsing JSON:', e);
        }
        
        if (!response.ok) {
            console.error('❌ Erreur HTTP:', response.status, data?.message);
            if (response.status === 401) {
                console.warn('⚠️ Token invalide - déconnexion');
                localStorage.removeItem('token');
                window.location.href = 'connexion.html';
            }
            throw new Error(data?.message || `Erreur ${response.status}`);
        }
        return data;
    };
};

/**
 * Capitalise automatiquement la première lettre d'un texte
 * @param {HTMLInputElement} input - L'élément input à capitaliser
 */
const capitalizeFirstLetter = (input) => {
    if (!input.value) return;
    const words = input.value.split(' ');
    const capitalized = words.map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    input.value = capitalized.join(' ');
};

/**
 * Applique la capitalisation automatique aux champs de ville et véhicule
 */
const initFieldsCapitalization = () => {
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
 * Affiche une notification non bloquante à l'écran
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification (info, success, error, warning)
 */
const showNotification = (message, type = 'info') => {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = sanitizeHTML(message);
    container.appendChild(notification);
    setTimeout(() => {
        if(notification) notification.remove();
    }, 5000);
};

/**
 * Fonction de protection XSS - Nettoie le HTML dangereux
 * @param {string} str - La chaîne à nettoyer
 * @returns {string} La chaîne nettoyée
 */
const sanitizeHTML = (str) => {
    if (typeof str !== 'string') return str;
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

/**
 * Validation et nettoyage des entrées utilisateur
 * @param {string} input - L'entrée à valider
 * @param {number} maxLength - Longueur maximale autorisée
 * @returns {string} L'entrée nettoyée
 */
const validateAndSanitizeInput = (input, maxLength = 500) => {
    if (typeof input !== 'string') return '';
    
    let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/on\w+="[^"]*"/gi, '');
    cleaned = cleaned.replace(/on\w+='[^']*'/gi, '');
    cleaned = cleaned.substring(0, maxLength);
    
    return sanitizeHTML(cleaned);
};

/**
 * Initialise la navigation dynamique selon l'état de connexion
 */
const initNavigation = () => {
    const token = localStorage.getItem('token');
    const guestNavButton = document.getElementById('guest-nav-button');
    const userNavLinks = document.getElementById('user-nav-links');
    const userNavDashboard = document.getElementById('user-nav-dashboard');
    const userNavButton = document.getElementById('user-nav-button');
    const logoutButton = document.getElementById('logout-button');
    const adminNavButton = document.getElementById('admin-nav-button');

    if (guestNavButton) {
        token ? guestNavButton.classList.add('hidden') : guestNavButton.classList.remove('hidden');
    }
    
    if (userNavLinks) {
        token ? userNavLinks.classList.remove('hidden') : userNavLinks.classList.add('hidden');
    }
    
    if (userNavDashboard) {
        token ? userNavDashboard.classList.remove('hidden') : userNavDashboard.classList.add('hidden');
    }
    
    if (userNavButton) {
        token ? userNavButton.classList.remove('hidden') : userNavButton.classList.add('hidden');
    }

    // Vérifier si l'utilisateur est admin
    if (adminNavButton && token) {
        fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(data => {
            if (data.user_type === 'admin' || data.user_type === 'employe') {
                adminNavButton.classList.remove('hidden');
            } else {
                adminNavButton.classList.add('hidden');
            }
        })
        .catch(() => adminNavButton.classList.add('hidden'));
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            showNotification("Vous avez été déconnecté.", "success");
            setTimeout(() => window.location.href = 'index.html', 1500);
        });
    }
    
    // Gestionnaire pour le bouton de déconnexion de la navbar (avis.html, etc.)
    const navLogoutButton = document.getElementById('nav-logout');
    if (navLogoutButton) {
        navLogoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            showNotification("Vous avez été déconnecté.", "success");
            setTimeout(() => window.location.href = 'index.html', 1500);
        });
    }
};

/**
 * Initialise le menu hamburger pour la version mobile
 */
const initHamburgerMenu = () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav');
    
    if (hamburger && navMenu) {
        // Toggle menu au clic sur hamburger
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Fermer menu en cliquant en dehors
        document.addEventListener('click', (event) => {
            if (navMenu.classList.contains('active') && 
                !navMenu.contains(event.target) && 
                !hamburger.contains(event.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        // Fermer menu en cliquant sur un lien
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
};

/**
 * Initialise les animations de révélation au scroll
 */
const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        revealElements.forEach(element => observer.observe(element));
    }
};

/**
 * Charge et affiche le badge de notification pour les avis en attente
 */
const loadReviewsBadge = async () => {
    const userToken = localStorage.getItem('token');
    if (!userToken) return;

    try {
        const response = await fetch(`${API_BASE_URL}/reviews/eligible-rides`, {
            headers: { 'x-auth-token': userToken }
        });
        
        if (response.ok) {
            const data = await response.json();
            const count = data.rides ? data.rides.length : 0;
            
            if (count > 0) {
                // Chercher le lien "Avis" dans la navigation
                const navLinks = document.querySelectorAll('.main-nav a');
                navLinks.forEach(link => {
                    if (link.textContent.trim() === 'Avis' || link.href.includes('avis.html')) {
                        // Ajouter le badge si pas déjà présent
                        if (!link.querySelector('.notification-badge')) {
                            const badge = document.createElement('span');
                            badge.className = 'notification-badge';
                            badge.textContent = count;
                            link.appendChild(badge);
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.log('Erreur chargement badge avis:', error);
    }
};

/**
 * Initialise tous les composants communs de l'application
 */
const initCommon = () => {
    initFieldsCapitalization();
    initNavigation();
    initHamburgerMenu();
    initScrollReveal();
    loadReviewsBadge();
};

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', initCommon);

