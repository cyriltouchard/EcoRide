/**
 * Script pour l'achat de crédits EcoRide
 * Gère l'affichage des packs et la redirection vers le paiement
 * @file acheter-credits.js
 */

/**
 * Variable pour stocker le pack sélectionné
 * @type {Object|null}
 */
let selectedPackage = null;

/**
 * Charge et affiche le solde actuel de crédits de l'utilisateur
 * @async
 * @returns {Promise<void>}
 */
async function loadCurrentBalance() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            globalThis.location.href = 'connexion.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/credits/balance`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            const credits = result.data ? result.data.current_credits : 0;
            document.getElementById('current-credits').textContent = credits;
            console.log('✅ Crédits chargés:', credits);
        } else {
            console.error('Erreur chargement crédits, status:', response.status);
            document.getElementById('current-credits').textContent = '0';
        }
    } catch (error) {
        console.error('Erreur chargement solde:', error);
        document.getElementById('current-credits').textContent = '0';
    }
}

/**
 * Initialise les événements de la page d'achat de crédits
 * @returns {void}
 */
function initializeAcheterCredits() {
    console.log('🔵 DOM chargé - Initialisation achat crédits');

    const buyButtons = document.querySelectorAll('.buy-button');
    console.log('📦 Boutons trouvés:', buyButtons.length);

    // Rediriger vers la page de paiement avec les paramètres
    for (const button of buyButtons) {
        button.addEventListener('click', function () {
            const packageType = this.dataset.package;
            const credits = this.dataset.credits;
            const price = this.dataset.price;

            console.log('🛒 Redirection vers paiement:', { packageType, credits, price });

            // Redirection avec paramètres URL
            globalThis.location.href = `paiement-credits.html?package=${packageType}&credits=${credits}&price=${price}`;
        });
    }

    // Fermer la modale
    const closeModalBtn = document.getElementById('close-payment-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function () {
            document.getElementById('payment-modal').style.display = 'none';
        });
    }

    // Gérer le changement de méthode de paiement
    for (const radio of document.querySelectorAll('input[name="payment-method"]')) {
        radio.addEventListener('change', function () {
            if (this.value === 'card') {
                document.getElementById('card-payment-fields').style.display = 'block';
                document.getElementById('paypal-payment-fields').style.display = 'none';
            } else {
                document.getElementById('card-payment-fields').style.display = 'none';
                document.getElementById('paypal-payment-fields').style.display = 'block';
            }
        });
    }

    // Gérer la soumission du paiement
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    // Charger le solde au chargement
    loadCurrentBalance();
}

/**
 * Gère la soumission du formulaire de paiement
 * @async
 * @param {Event} e - L'événement de soumission du formulaire
 * @returns {Promise<void>}
 */
async function handlePaymentSubmit(e) {
    e.preventDefault();

    if (!selectedPackage) {
        showNotification('Erreur: Aucun pack sélectionné', 'error');
        return;
    }

    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

    // Validation basique
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        const cardName = document.getElementById('card-name').value;

        if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
            showNotification('Veuillez remplir tous les champs de la carte', 'error');
            return;
        }
    }

    // Désactiver le bouton pendant le traitement
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';

    try {
        // Simuler le paiement (attendre 2 secondes)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Appeler l'API pour ajouter les crédits
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/credits/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                packageType: selectedPackage.name,
                credits: selectedPackage.credits,
                amount: selectedPackage.price,
                paymentMethod: paymentMethod
            })
        });

        if (response.ok) {
            const data = await response.json();
            showNotification(
                `✅ Paiement réussi ! ${selectedPackage.credits} crédits ajoutés à votre compte`,
                'success'
            );

            // Fermer la modale
            document.getElementById('payment-modal').style.display = 'none';

            // Recharger le solde
            setTimeout(() => {
                loadCurrentBalance();
            }, 500);

            // Réinitialiser le formulaire
            e.target.reset();
        } else {
            const error = await response.json();
            showNotification('Erreur lors du paiement: ' + (error.message || 'Erreur inconnue'), 'error');
        }
    } catch (error) {
        console.error('Erreur paiement:', error);
        showNotification('Erreur lors du traitement du paiement', 'error');
    } finally {
        // Réactiver le bouton
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-lock"></i> Payer maintenant';
    }
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', initializeAcheterCredits);
