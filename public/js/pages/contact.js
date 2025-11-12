/**
 * EcoRide - Page de contact
 * Gestion du formulaire de contact
 * @file contact.js
 */

import { createFetchWithAuth, API_BASE_URL } from '../common/auth.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { validateAndSanitizeInput } from '../common/utils.js';

/**
 * Valide les données du formulaire de contact
 * @param {Object} formData - Données du formulaire
 * @returns {Object|null} Erreurs ou null si valide
 */
const validateContactForm = (formData) => {
    const errors = {};
    
    if (!formData.nom || formData.nom.length < 2) {
        errors.nom = 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!formData.prenom || formData.prenom.length < 2) {
        errors.prenom = 'Le prénom doit contenir au moins 2 caractères';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.email = 'Adresse email invalide';
    }
    
    if (!formData.sujet || formData.sujet.length < 5) {
        errors.sujet = 'Le sujet doit contenir au moins 5 caractères';
    }
    
    if (!formData.message || formData.message.length < 20) {
        errors.message = 'Le message doit contenir au moins 20 caractères';
    }
    
    if (formData.message && formData.message.length > 1000) {
        errors.message = 'Le message ne peut pas dépasser 1000 caractères';
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Affiche les erreurs de validation
 * @param {Object} errors - Erreurs de validation
 */
const displayErrors = (errors) => {
    for (const el of document.querySelectorAll('.error-message')) {
        el.remove();
    }
    for (const el of document.querySelectorAll('.input-error')) {
        el.classList.remove('input-error');
    }
    
    for (const [field, message] of Object.entries(errors)) {
        const input = document.getElementById(field);
        if (input) {
            input.classList.add('input-error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            input.parentElement.appendChild(errorDiv);
        }
    }
    
    showNotification(Object.values(errors)[0], 'error');
};

/**
 * Envoie le message de contact
 * @param {Object} contactData - Données du contact
 * @returns {Promise<Object>} Résultat de l'envoi
 */
const sendContactMessage = async (contactData) => {
    const fetchWithAuth = createFetchWithAuth();
    
    const response = await fetchWithAuth(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'envoi du message');
    }
    
    return await response.json();
};

/**
 * Gère la soumission du formulaire de contact
 * @param {Event} event - Événement de soumission
 */
const handleContactSubmit = async (event) => {
    event.preventDefault();
    
    const formData = {
        nom: validateAndSanitizeInput(document.getElementById('nom').value),
        prenom: validateAndSanitizeInput(document.getElementById('prenom').value),
        email: validateAndSanitizeInput(document.getElementById('email').value),
        sujet: validateAndSanitizeInput(document.getElementById('sujet').value),
        message: validateAndSanitizeInput(document.getElementById('message').value)
    };
    
    // Validation
    const errors = validateContactForm(formData);
    if (errors) {
        displayErrors(errors);
        return;
    }
    
    const closeLoading = showLoading('Envoi de votre message...');
    
    try {
        await sendContactMessage(formData);
        
        closeLoading();
        showNotification('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.', 'success');
        
        // Réinitialiser le formulaire
        event.target.reset();
        updateCharacterCount();
        
    } catch (error) {
        closeLoading();
        console.error('Erreur lors de l\'envoi du message:', error);
        showNotification(error.message || 'Erreur lors de l\'envoi du message', 'error');
    }
};

/**
 * Met à jour le compteur de caractères du message
 */
const updateCharacterCount = () => {
    const messageInput = document.getElementById('message');
    const counterEl = document.getElementById('char-count');
    
    if (!messageInput || !counterEl) return;
    
    const length = messageInput.value.length;
    const maxLength = 1000;
    
    counterEl.textContent = `${length}/${maxLength}`;
    
    if (length > maxLength * 0.9) {
        counterEl.style.color = '#e53e3e';
    } else if (length > maxLength * 0.75) {
        counterEl.style.color = '#dd6b20';
    } else {
        counterEl.style.color = '#718096';
    }
};

/**
 * Affiche les informations de contact
 */
const displayContactInfo = () => {
    const container = document.getElementById('contact-info');
    if (!container) return;
    
    container.innerHTML = `
        <div class="contact-info-card">
            <h2>Nous contacter</h2>
            <p>Notre équipe est à votre disposition pour répondre à toutes vos questions.</p>
            
            <div class="contact-methods">
                <div class="contact-method">
                    <span class="icon">📧</span>
                    <div>
                        <h3>Email</h3>
                        <a href="mailto:support@ecoride.fr">support@ecoride.fr</a>
                    </div>
                </div>
                
                <div class="contact-method">
                    <span class="icon">📞</span>
                    <div>
                        <h3>Téléphone</h3>
                        <a href="tel:+33123456789">01 23 45 67 89</a>
                        <p class="hours">Lun-Ven 9h-18h</p>
                    </div>
                </div>
                
                <div class="contact-method">
                    <span class="icon">📍</span>
                    <div>
                        <h3>Adresse</h3>
                        <p>123 Avenue de l'Écologie<br>75001 Paris, France</p>
                    </div>
                </div>
            </div>
            
            <div class="faq-link">
                <p>Consultez notre <a href="#faq">FAQ</a> pour des réponses rapides</p>
            </div>
        </div>
    `;
};

/**
 * Affiche la FAQ
 */
const displayFAQ = () => {
    const container = document.getElementById('faq-container');
    if (!container) return;
    
    const faqItems = [
        {
            question: 'Comment réserver un covoiturage ?',
            answer: 'Connectez-vous à votre compte, recherchez un trajet qui vous convient, et cliquez sur "Réserver". Le paiement se fait avec vos crédits EcoRide.'
        },
        {
            question: 'Comment acheter des crédits ?',
            answer: 'Rendez-vous dans la section "Acheter des crédits" depuis votre espace utilisateur. Choisissez votre pack et payez par carte bancaire de manière sécurisée.'
        },
        {
            question: 'Puis-je annuler une réservation ?',
            answer: 'Oui, vous pouvez annuler une réservation jusqu\'à 24h avant le départ. Vos crédits vous seront intégralement remboursés.'
        },
        {
            question: 'Comment proposer un trajet ?',
            answer: 'Dans votre espace chauffeur, cliquez sur "Proposer un trajet", remplissez les informations (départ, arrivée, date, prix) et publiez votre annonce.'
        },
        {
            question: 'Est-ce que EcoRide est sécurisé ?',
            answer: 'Oui, EcoRide utilise les dernières technologies de sécurité. Tous les paiements sont cryptés et les données personnelles sont protégées.'
        }
    ];
    
    container.innerHTML = `
        <h2>Questions fréquentes</h2>
        <div class="faq-list">
            ${faqItems.map((item, index) => `
                <div class="faq-item" data-faq-index="${index}">
                    <div class="faq-question">
                        <h3>${item.question}</h3>
                        <span class="faq-toggle">+</span>
                    </div>
                    <div class="faq-answer" style="display: none;">
                        <p>${item.answer}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Ajouter les événements pour déplier/replier
    for (const item of container.querySelectorAll('.faq-item')) {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        
        question.addEventListener('click', () => {
            const isOpen = answer.style.display === 'block';
            answer.style.display = isOpen ? 'none' : 'block';
            toggle.textContent = isOpen ? '+' : '−';
            item.classList.toggle('open');
        });
    }
};

/**
 * Initialise la page de contact
 */
export const init = () => {
    console.log('📧 Initialisation de la page de contact');
    
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Initialiser le compteur de caractères
    const messageInput = document.getElementById('message');
    if (messageInput) {
        messageInput.addEventListener('input', updateCharacterCount);
        updateCharacterCount();
    }
    
    // Afficher les informations de contact
    displayContactInfo();
    
    // Afficher la FAQ
    displayFAQ();
    
    console.log('✅ Page de contact initialisée');
};
