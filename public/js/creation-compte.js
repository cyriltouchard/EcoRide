/**
 * EcoRide - Page de création de compte
 * Gestion du formulaire d'inscription
 * @file creation-compte.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('creation-compte-page')) {
        const registerForm = document.querySelector('.auth-form');
        
        if (registerForm) {
            registerForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                const pseudo = document.getElementById('pseudo').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                try {
                    const response = await fetch(`${API_BASE_URL}/users/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pseudo, email, password }),
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.message || 'Une erreur est survenue.');
                    }
                    
                    showNotification('Inscription réussie ! Vous allez être redirigé.', 'success');
                    localStorage.setItem('token', data.data.token);
                    setTimeout(() => window.location.href = 'espace-utilisateur.html', 1500);
                    
                } catch (error) {
                    showNotification(`Erreur : ${error.message}`, 'error');
                }
            });
        }
    }
});
