/**
 * EcoRide - Page d'achat de crédits
 * Gestion du système de paiement et d'achat de crédits
 * @file acheter-credits.js
 */

import { createFetchWithAuth, API_BASE_URL, requireAuth } from '../common/auth.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { formatCardNumber, formatExpiryDate, validateAndSanitizeInput } from '../common/utils.js';

/**
 * Packages de crédits disponibles
 */
const CREDIT_PACKAGES = [
    { id: 1, credits: 10, price: 10, bonus: 0, popular: false },
    { id: 2, credits: 25, price: 24, bonus: 1, popular: false },
    { id: 3, credits: 50, price: 45, bonus: 5, popular: true },
    { id: 4, credits: 100, price: 85, bonus: 15, popular: false }
];

/**
 * Affiche les packages de crédits
 */
const displayCreditPackages = () => {
    const container = document.getElementById('packages-container');
    if (!container) return;
    
    container.innerHTML = CREDIT_PACKAGES.map(pkg => `
        <div class="credit-package ${pkg.popular ? 'popular' : ''}" data-package-id="${pkg.id}">
            ${pkg.popular ? '<div class="popular-badge">Le plus populaire</div>' : ''}
            
            <div class="package-credits">
                ${pkg.credits}
                <span class="credits-label">crédits</span>
            </div>
            
            ${pkg.bonus > 0 ? `
                <div class="package-bonus">+ ${pkg.bonus} crédits bonus</div>
            ` : ''}
            
            <div class="package-price">
                ${pkg.price}€
            </div>
            
            <div class="package-unit-price">
                ${(pkg.price / (pkg.credits + pkg.bonus)).toFixed(2)}€ / crédit
            </div>
            
            <button class="btn btn-primary select-package" data-package-id="${pkg.id}">
                Sélectionner
            </button>
        </div>
    `).join('');
    
    // Ajouter les événements sur les boutons
    for (const btn of container.querySelectorAll('.select-package')) {
        btn.addEventListener('click', (e) => {
            const packageId = Number.parseInt(e.target.dataset.packageId);
            selectPackage(packageId);
        });
    }
};

/**
 * Sélectionne un package et affiche le formulaire de paiement
 * @param {number} packageId - ID du package
 */
const selectPackage = (packageId) => {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;
    
    // Mettre en surbrillance le package sélectionné
    for (const el of document.querySelectorAll('.credit-package')) {
        el.classList.remove('selected');
    }
    
    const selectedEl = document.querySelector(`.credit-package[data-package-id="${packageId}"]`);
    if (selectedEl) {
        selectedEl.classList.add('selected');
    }
    
    // Afficher le résumé
    displayOrderSummary(pkg);
    
    // Afficher le formulaire de paiement
    const paymentSection = document.getElementById('payment-section');
    if (paymentSection) {
        paymentSection.style.display = 'block';
        paymentSection.scrollIntoView({ behavior: 'smooth' });
    }
};

/**
 * Affiche le résumé de la commande
 * @param {Object} pkg - Package sélectionné
 */
const displayOrderSummary = (pkg) => {
    const container = document.getElementById('order-summary');
    if (!container) return;
    
    const totalCredits = pkg.credits + pkg.bonus;
    
    container.innerHTML = `
        <h3>Résumé de votre commande</h3>
        <div class="summary-item">
            <span>Crédits de base</span>
            <span>${pkg.credits} crédits</span>
        </div>
        ${pkg.bonus > 0 ? `
            <div class="summary-item bonus">
                <span>Bonus offert</span>
                <span>+ ${pkg.bonus} crédits</span>
            </div>
        ` : ''}
        <div class="summary-divider"></div>
        <div class="summary-total">
            <span>Total</span>
            <span>${totalCredits} crédits</span>
        </div>
        <div class="summary-price">
            <span>Prix à payer</span>
            <span class="price-amount">${pkg.price}€</span>
        </div>
    `;
};

/**
 * Valide les informations de carte bancaire
 * @param {Object} cardData - Données de la carte
 * @returns {Object|null} Erreurs ou null si valide
 */
const validateCardData = (cardData) => {
    const errors = {};
    
    // Validation du numéro de carte (Luhn algorithm)
    const cardNumber = cardData.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumber)) {
        errors.cardNumber = 'Numéro de carte invalide (16 chiffres requis)';
    } else {
        // Algorithme de Luhn pour validation
        let sum = 0;
        let isEven = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = Number.parseInt(cardNumber[i]);
            if (isEven) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            isEven = !isEven;
        }
        if (sum % 10 !== 0) {
            errors.cardNumber = 'Numéro de carte invalide';
        }
    }
    
    // Validation de l'expiration
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
        errors.expiry = 'Format invalide (MM/AA)';
    } else {
        const [month, year] = cardData.expiry.split('/').map(Number);
        const now = new Date();
        const expDate = new Date(2000 + year, month - 1);
        if (month < 1 || month > 12 || expDate < now) {
            errors.expiry = 'Date d\'expiration invalide ou expirée';
        }
    }
    
    // Validation du CVV
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
        errors.cvv = 'CVV invalide (3 ou 4 chiffres)';
    }
    
    // Validation du nom
    if (!cardData.cardHolder || cardData.cardHolder.length < 3) {
        errors.cardHolder = 'Nom du titulaire requis';
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Affiche les erreurs de validation
 * @param {Object} errors - Erreurs de validation
 */
const displayCardErrors = (errors) => {
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
 * Traite l'achat de crédits
 * @param {number} packageId - ID du package
 * @param {Object} cardData - Données de la carte
 * @returns {Promise<Object>} Résultat de la transaction
 */
const processPurchase = async (packageId, cardData) => {
    const fetchWithAuth = createFetchWithAuth();
    
    const response = await fetchWithAuth(`${API_BASE_URL}/credits/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            package_id: packageId,
            card_number: cardData.cardNumber.replace(/\s/g, ''),
            card_holder: cardData.cardHolder,
            expiry: cardData.expiry,
            cvv: cardData.cvv
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du paiement');
    }
    
    return await response.json();
};

/**
 * Gère la soumission du formulaire de paiement
 * @param {Event} event - Événement de soumission
 */
const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    
    const selectedPackage = document.querySelector('.credit-package.selected');
    if (!selectedPackage) {
        showNotification('Veuillez sélectionner un package', 'warning');
        return;
    }
    
    const packageId = Number.parseInt(selectedPackage.dataset.packageId);
    
    const cardData = {
        cardNumber: document.getElementById('cardNumber').value,
        cardHolder: validateAndSanitizeInput(document.getElementById('cardHolder').value),
        expiry: document.getElementById('expiry').value,
        cvv: document.getElementById('cvv').value
    };
    
    // Validation
    const errors = validateCardData(cardData);
    if (errors) {
        displayCardErrors(errors);
        return;
    }
    
    const closeLoading = showLoading('Traitement du paiement...');
    
    try {
        const result = await processPurchase(packageId, cardData);
        
        closeLoading();
        showNotification(`Achat réussi ! ${result.credits_added} crédits ajoutés à votre compte`, 'success');
        
        // Réinitialiser le formulaire
        event.target.reset();
        document.querySelectorAll('.credit-package').forEach(el => el.classList.remove('selected'));
        document.getElementById('payment-section').style.display = 'none';
        
        setTimeout(() => {
            window.location.href = 'espace-utilisateur.html';
        }, 2000);
        
    } catch (error) {
        closeLoading();
        console.error('Erreur lors de l\'achat:', error);
        showNotification(error.message || 'Erreur lors du paiement', 'error');
    }
};

/**
 * Initialise le formatage automatique des champs
 */
const initCardFormatting = () => {
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            e.target.value = formatCardNumber(e.target.value);
        });
    }
    
    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            e.target.value = formatExpiryDate(e.target.value);
        });
    }
    
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }
};

/**
 * Initialise la page d'achat de crédits
 */
export const init = () => {
    console.log('💳 Initialisation de la page d\'achat de crédits');
    
    // Vérifier l'authentification
    if (!requireAuth()) {
        window.location.href = 'connexion.html?redirect=acheter-credits.html';
        return;
    }
    
    // Afficher les packages
    displayCreditPackages();
    
    // Initialiser le formulaire de paiement
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
        initCardFormatting();
    }
    
    console.log('✅ Page d\'achat de crédits initialisée');
};
