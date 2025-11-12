/**
 * EcoRide - Page de création de compte
 * Gestion de l'inscription des nouveaux utilisateurs
 * @file creation-compte.js
 */

import { register } from '../common/auth.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { validateAndSanitizeInput } from '../common/utils.js';

/**
 * Valide les champs du formulaire
 * @param {Object} formData - Données du formulaire
 * @returns {Object|null} Erreurs ou null si valide
 */
const validateRegistrationForm = (formData) => {
    const errors = {};
    
    // Validation du pseudo
    if (!formData.pseudo || formData.pseudo.length < 3) {
        errors.pseudo = 'Le pseudo doit contenir au moins 3 caractères';
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.email = 'Adresse email invalide';
    }
    
    // Validation du téléphone
    const phoneRegex = /^0[1-9](\d{8})$/;
    if (!phoneRegex.test(formData.telephone.replace(/\s/g, ''))) {
        errors.telephone = 'Numéro de téléphone invalide (format: 0XXXXXXXXX)';
    }
    
    // Validation du mot de passe
    if (!formData.password || formData.password.length < 8) {
        errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    // Validation de la confirmation
    if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    // Validation de la date de naissance
    const birthDate = new Date(formData.date_naissance);
    const age = (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (age < 18) {
        errors.date_naissance = 'Vous devez avoir au moins 18 ans';
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Affiche les erreurs de validation dans le formulaire
 * @param {Object} errors - Objet contenant les erreurs
 */
const displayValidationErrors = (errors) => {
    // Nettoyer les erreurs précédentes
    for (const el of document.querySelectorAll('.error-message')) {
        el.remove();
    }
    for (const el of document.querySelectorAll('.input-error')) {
        el.classList.remove('input-error');
    }
    
    // Afficher les nouvelles erreurs
    for (const [field, message] of Object.entries(errors)) {
        const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
        if (input) {
            input.classList.add('input-error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.color = '#e53e3e';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            input.parentElement.appendChild(errorDiv);
        }
    }
    
    // Afficher le premier message d'erreur en notification
    const firstError = Object.values(errors)[0];
    showNotification(firstError, 'error');
};

/**
 * Gère la soumission du formulaire d'inscription
 * @param {Event} event - Événement de soumission
 */
const handleRegistrationSubmit = async (event) => {
    event.preventDefault();
    
    // Récupération des données
    const formData = {
        pseudo: validateAndSanitizeInput(document.getElementById('pseudo').value),
        prenom: validateAndSanitizeInput(document.getElementById('prenom').value),
        nom: validateAndSanitizeInput(document.getElementById('nom').value),
        email: validateAndSanitizeInput(document.getElementById('email').value),
        telephone: validateAndSanitizeInput(document.getElementById('telephone').value),
        date_naissance: document.getElementById('date_naissance').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    // Validation
    const validationErrors = validateRegistrationForm(formData);
    if (validationErrors) {
        displayValidationErrors(validationErrors);
        return;
    }
    
    // Suppression du champ de confirmation
    delete formData.confirmPassword;
    
    const closeLoading = showLoading('Création du compte en cours...');
    
    try {
        const data = await register(formData);
        
        closeLoading();
        showNotification('Compte créé avec succès !', 'success');
        
        // Redirection vers le profil
        setTimeout(() => {
            window.location.href = 'espace-utilisateur.html';
        }, 1500);
        
    } catch (error) {
        closeLoading();
        console.error('Erreur d\'inscription:', error);
        
        // Gestion spécifique des erreurs serveur
        if (error.message.includes('existe déjà')) {
            displayValidationErrors({ email: error.message });
        } else {
            showNotification(error.message || 'Erreur lors de la création du compte', 'error');
        }
    }
};

/**
 * Initialise les validations en temps réel
 */
const initRealTimeValidation = () => {
    const form = document.getElementById('registerForm');
    if (!form) return;
    
    // Validation du mot de passe en temps réel
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordInput && confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.classList.add('input-error');
            } else {
                confirmPasswordInput.classList.remove('input-error');
            }
        });
    }
    
    // Validation du téléphone en temps réel
    const phoneInput = document.getElementById('telephone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Formatage automatique: ajouter un espace tous les 2 chiffres
            let value = e.target.value.replace(/\s/g, '');
            if (value.length > 10) value = value.substring(0, 10);
            e.target.value = value.match(/.{1,2}/g)?.join(' ') || value;
        });
    }
};

/**
 * Initialise la page de création de compte
 */
export const init = () => {
    console.log('📝 Initialisation de la page de création de compte');
    
    const registerForm = document.getElementById('registerForm') || document.querySelector('.auth-form');
    
    if (!registerForm) {
        console.warn('Formulaire d\'inscription non trouvé');
        return;
    }
    
    registerForm.addEventListener('submit', handleRegistrationSubmit);
    initRealTimeValidation();
    
    // Auto-focus sur le premier champ
    const firstInput = document.getElementById('pseudo');
    if (firstInput) {
        firstInput.focus();
    }
    
    console.log('✅ Page de création de compte initialisée');
};
