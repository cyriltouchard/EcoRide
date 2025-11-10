/**
 * Script pour la page de paiement de crédits EcoRide
 * Gère le formulaire de paiement et le traitement de la transaction
 * @file paiement-credits.js
 */

/**
 * Récupère les paramètres de l'URL et initialise la page
 * @returns {Object} Les paramètres du package sélectionné
 */
function initializePaymentPage() {
    // Récupérer les paramètres de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const packageType = urlParams.get('package') || 'discovery';
    const credits = parseInt(urlParams.get('credits')) || 10;
    const price = parseFloat(urlParams.get('price')) || 5.00;

    console.log('📦 Package sélectionné:', { packageType, credits, price });

    // Afficher les informations du package
    displayPackageInfo(packageType, credits, price);

    // Initialiser les événements
    setupPaymentMethodToggle();
    setupCardFormatting();
    setupFormSubmission(packageType, credits, price);
    setupCancelButton();
    checkAuthentication();

    return { packageType, credits, price };
}

/**
 * Affiche les informations du package dans tous les emplacements
 * @param {string} packageType - Type de package (discovery, explorer, adventurer, unlimited)
 * @param {number} credits - Nombre de crédits
 * @param {number} price - Prix en euros
 * @returns {void}
 */
function displayPackageInfo(packageType, credits, price) {
    const packageName = packageType.charAt(0).toUpperCase() + packageType.slice(1);
    const creditsText = credits + ' crédits';
    const priceText = price.toFixed(2) + ' €';

    // Mobile
    const mobilePackageName = document.getElementById('mobile-package-name');
    const mobilePackageCredits = document.getElementById('mobile-package-credits');
    const mobileTotalPrice = document.getElementById('mobile-total-price');
    
    if (mobilePackageName) mobilePackageName.textContent = 'Pack ' + packageName;
    if (mobilePackageCredits) mobilePackageCredits.textContent = creditsText;
    if (mobileTotalPrice) mobileTotalPrice.textContent = priceText;

    // Sidebar
    const sidebarPackageName = document.getElementById('sidebar-package-name');
    const sidebarPackageCredits = document.getElementById('sidebar-package-credits');
    const sidebarUnitPrice = document.getElementById('sidebar-unit-price');
    const sidebarTotalPrice = document.getElementById('sidebar-total-price');
    
    if (sidebarPackageName) sidebarPackageName.textContent = 'Pack ' + packageName;
    if (sidebarPackageCredits) sidebarPackageCredits.textContent = creditsText;
    if (sidebarUnitPrice) sidebarUnitPrice.textContent = priceText;
    if (sidebarTotalPrice) sidebarTotalPrice.textContent = priceText;

    // Bouton
    const submitPrice = document.getElementById('submit-price');
    if (submitPrice) submitPrice.textContent = priceText;
}

/**
 * Configure le basculement entre les méthodes de paiement
 * @returns {void}
 */
function setupPaymentMethodToggle() {
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const cardForm = document.getElementById('card-form');
    const paypalMessage = document.getElementById('paypal-message');

    paymentMethods.forEach(radio => {
        radio.addEventListener('change', function () {
            // Retirer la classe active de tous
            document.querySelectorAll('.payment-option').forEach(label => {
                label.classList.remove('active');
            });

            // Ajouter active au parent du radio sélectionné
            this.closest('.payment-option').classList.add('active');

            // Afficher les bons champs
            if (this.value === 'card') {
                if (cardForm) cardForm.classList.remove('hidden');
                if (paypalMessage) paypalMessage.classList.add('hidden');
            } else {
                if (cardForm) cardForm.classList.add('hidden');
                if (paypalMessage) paypalMessage.classList.remove('hidden');
            }
        });
    });
}

/**
 * Configure le formatage automatique des champs de carte
 * @returns {void}
 */
function setupCardFormatting() {
    // Formatage automatique du numéro de carte
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Formatage de la date d'expiration
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
}

/**
 * Configure la soumission du formulaire de paiement
 * @param {string} packageType - Type de package
 * @param {number} credits - Nombre de crédits
 * @param {number} price - Prix en euros
 * @returns {void}
 */
function setupFormSubmission(packageType, credits, price) {
    const paymentForm = document.getElementById('payment-form');
    
    if (paymentForm) {
        paymentForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
            const submitBtn = e.target.querySelector('button[type="submit"]');

            // Désactiver le bouton
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement en cours...';

            console.log('💳 Traitement du paiement...', { packageType, credits, price, paymentMethod });

            try {
                // Simulation d'un délai de traitement
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Appel API pour enregistrer les crédits
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/credits/purchase`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        packageType: packageType,
                        credits: credits,
                        amount: price,
                        paymentMethod: paymentMethod
                    })
                });

                const result = await response.json();

                if (result.success) {
                    console.log('✅ Paiement réussi!', result);

                    // Afficher un message de succès
                    alert('✅ Paiement réussi ! Vos ' + credits + ' crédits ont été ajoutés à votre compte.');

                    // Rediriger vers l'espace utilisateur
                    window.location.href = 'espace-utilisateur.html';
                } else {
                    throw new Error(result.message || 'Erreur lors du paiement');
                }

            } catch (error) {
                console.error('❌ Erreur de paiement:', error);
                alert('❌ Erreur : ' + error.message);

                // Réactiver le bouton
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-lock"></i> Payer maintenant';
            }
        });
    }
}

/**
 * Configure le bouton d'annulation
 * @returns {void}
 */
function setupCancelButton() {
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            if (confirm('Voulez-vous vraiment annuler cette transaction ?')) {
                window.location.href = 'acheter-credits.html';
            }
        });
    }
}

/**
 * Vérifie l'authentification de l'utilisateur
 * @returns {void}
 */
function checkAuthentication() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('⚠️ Vous devez être connecté pour effectuer un achat.');
        window.location.href = 'connexion.html?redirect=acheter-credits.html';
    }
}

// Initialiser la page au chargement
initializePaymentPage();
