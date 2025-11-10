/**
 * EcoRide - Page de contact
 * Gestion du formulaire de contact
 * @file contact.js
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('📧 Page contact initialisée');
    
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Récupérer les valeurs du formulaire
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Validation côté client
            if (!name || !email || !message) {
                showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }

            // Validation de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Veuillez entrer une adresse email valide', 'error');
                return;
            }

            try {
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'Envoi en cours...';

                const response = await fetch(`${API_BASE_URL}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, message })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showNotification(data.message || 'Votre message a été envoyé avec succès !', 'success');
                    contactForm.reset();
                } else {
                    showNotification(data.message || 'Erreur lors de l\'envoi du message', 'error');
                }

                submitButton.disabled = false;
                submitButton.textContent = originalText;

            } catch (error) {
                console.error('❌ Erreur envoi formulaire contact:', error);
                showNotification('Erreur lors de l\'envoi du message. Veuillez réessayer.', 'error');
                
                const submitButton = contactForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = 'Envoyer';
            }
        });
    }
});
