/**
 * EcoRide - Page de connexion
 * Gestion de l'authentification utilisateur
 * @file connexion.js
 */

import { login } from '../common/auth.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { validateAndSanitizeInput } from '../common/utils.js';

/**
 * Gère la soumission du formulaire de connexion
 * @param {Event} event - Événement de soumission
 */
const handleLoginSubmit = async (event) => {
    event.preventDefault();
    
    const email = validateAndSanitizeInput(document.getElementById('email').value);
    const password = document.getElementById('password').value; // Ne pas sanitize le password
    
    // Validation basique
    if (!email || !password) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const closeLoading = showLoading('Connexion en cours...');
    
    try {
        const data = await login({ email, password });
        
        closeLoading();
        showNotification(`Bienvenue ${data.pseudo || 'utilisateur'} !`, 'success');
        
        // Redirection selon le rôle
        setTimeout(() => {
            if (data.user_type === 'admin' || data.user_type === 'employe') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'espace-utilisateur.html';
            }
        }, 1500);
        
    } catch (error) {
        closeLoading();
        console.error('Erreur de connexion:', error);
        showNotification(error.message || 'Erreur de connexion', 'error');
    }
};

/**
 * Initialise la page de connexion
 */
export const init = () => {
    console.log('🔐 Initialisation de la page de connexion');
    
    const loginForm = document.querySelector('.auth-form');
    
    if (!loginForm) {
        console.warn('Formulaire de connexion non trouvé');
        return;
    }
    
    loginForm.addEventListener('submit', handleLoginSubmit);
    
    // Auto-focus sur le champ email
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
    
    console.log('✅ Page de connexion initialisée');
};
