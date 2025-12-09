/**
 * EcoRide - Module d'authentification
 * Gestion de l'authentification et des requêtes API
 * @file auth.js
 */

// Configuration API - Détection automatique de l'environnement
export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : `${window.location.protocol}//${window.location.host}/api`;

/**
 * Crée une fonction fetch avec authentification
 * @param {string} token - Token JWT
 * @returns {Function} Fonction fetch authentifiée
 */
export const createFetchWithAuth = (token) => {
    return async (url, options = {}) => {
        console.log('🔵 Requête authentifiée:', url, 'Token présent:', !!token);
        
        const headers = { 
            ...options.headers, 
            'Content-Type': 'application/json', 
            'x-auth-token': token 
        };
        
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
                logout();
            }
            throw new Error(data?.message || `Erreur ${response.status}`);
        }
        
        return data;
    };
};

/**
 * Récupère le token stocké
 * @returns {string|null} Token JWT ou null
 */
export const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Stocke le token
 * @param {string} token - Token JWT
 */
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

/**
 * Vérifie si l'utilisateur est connecté
 * @returns {boolean} True si connecté
 */
export const isAuthenticated = () => {
    return !!getToken();
};

/**
 * Déconnecte l'utilisateur
 */
export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = 'connexion.html';
};

/**
 * Redirige vers la page de connexion si non authentifié
 * @param {string} message - Message à afficher
 * @returns {boolean} True si authentifié
 */
export const requireAuth = (message = "Vous devez être connecté pour accéder à cette page.") => {
    if (!isAuthenticated()) {
        if (window.showNotification) {
            window.showNotification(message, "error");
        }
        setTimeout(() => window.location.href = 'connexion.html', 2000);
        return false;
    }
    return true;
};

/**
 * Inscription d'un nouvel utilisateur
 * @param {object} userData - Données de l'utilisateur (pseudo, email, password)
 * @returns {Promise<object>} Réponse de l'API
 */
export const register = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
    }
    
    // Stocker le token si fourni
    if (data.token) {
        setToken(data.token);
    }
    
    return data;
};

/**
 * Connexion d'un utilisateur
 * @param {object} credentials - Identifiants (email, password)
 * @returns {Promise<object>} Réponse de l'API
 */
export const login = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la connexion');
    }
    
    // Stocker le token
    if (data.token) {
        setToken(data.token);
    }
    
    return data;
};

/**
 * Récupère les informations de l'utilisateur connecté
 * @returns {Promise<object>} Données utilisateur
 */
export const getCurrentUser = async () => {
    const token = getToken();
    if (!token) {
        throw new Error('Non authentifié');
    }
    
    const fetchWithAuth = createFetchWithAuth(token);
    return await fetchWithAuth(`${API_BASE_URL}/users/me`);
};

/**
 * Vérifie si l'utilisateur est admin ou employé
 * @returns {Promise<boolean>} True si admin/employé
 */
export const isAdmin = async () => {
    try {
        const user = await getCurrentUser();
        return user.user_type === 'admin' || user.user_type === 'employe';
    } catch {
        return false;
    }
};

/**
 * Middleware pour vérifier l'authentification au chargement
 */
export const initAuthCheck = () => {
    const token = getToken();
    
    // Vérifier si on est sur une page protégée
    const protectedPages = [
        'espace-utilisateur.html',
        'espace-chauffeur.html',
        'proposer-covoiturage.html',
        'acheter-credits.html',
        'avis.html',
        'admin.html',
        'employe.html'
    ];
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !token) {
        if (window.showNotification) {
            window.showNotification("Vous devez être connecté pour accéder à cette page.", "error");
        }
        setTimeout(() => window.location.href = 'connexion.html', 2000);
    }
};

// Exposer globalement pour compatibilité
window.API_BASE_URL = API_BASE_URL;
window.createFetchWithAuth = createFetchWithAuth;
