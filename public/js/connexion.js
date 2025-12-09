/**
 * EcoRide - Page de connexion
 * Gestion du formulaire de connexion
 * @file connexion.js
 */

// Configuration API (définie dans config.js)
const API_BASE_URL = window.API_BASE_URL;

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('connexion-page')) {
        const loginForm = document.querySelector('.auth-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                try {
                    const response = await fetch(`${API_BASE_URL}/users/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.message || 'Identifiants invalides.');
                    }
                    
                    showNotification('Connexion réussie ! Bienvenue.', 'success');
                    localStorage.setItem('token', data.data.token);
                    setTimeout(() => window.location.href = 'espace-utilisateur.html', 1500);
                    
                } catch (error) {
                    showNotification(`Erreur : ${error.message}`, 'error');
                }
            });
        }
    }
});
