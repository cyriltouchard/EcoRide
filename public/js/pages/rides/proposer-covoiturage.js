/**
 * EcoRide - Page de proposition de covoiturage
 * Gestion de la création d'offres de trajet
 * @file proposer-covoiturage.js
 */

import { createFetchWithAuth, API_BASE_URL, requireAuth } from '../common/auth.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { validateAndSanitizeInput } from '../common/utils.js';

/**
 * Valide les données du formulaire de proposition
 * @param {Object} formData - Données du formulaire
 * @returns {Object|null} Erreurs ou null si valide
 */
const validateRideForm = (formData) => {
    const errors = {};
    
    if (!formData.ville_depart || formData.ville_depart.length < 2) {
        errors.ville_depart = 'Ville de départ requise';
    }
    
    if (!formData.ville_arrivee || formData.ville_arrivee.length < 2) {
        errors.ville_arrivee = 'Ville d\'arrivée requise';
    }
    
    if (formData.ville_depart === formData.ville_arrivee) {
        errors.ville_arrivee = 'La ville d\'arrivée doit être différente de la ville de départ';
    }
    
    if (!formData.date_depart) {
        errors.date_depart = 'Date de départ requise';
    } else {
        const departDate = new Date(formData.date_depart);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (departDate < today) {
            errors.date_depart = 'La date ne peut pas être dans le passé';
        }
    }
    
    if (!formData.heure_depart) {
        errors.heure_depart = 'Heure de départ requise';
    }
    
    if (!formData.places_disponibles || formData.places_disponibles < 1 || formData.places_disponibles > 8) {
        errors.places_disponibles = 'Le nombre de places doit être entre 1 et 8';
    }
    
    if (formData.prix_par_place && (formData.prix_par_place < 0 || formData.prix_par_place > 100)) {
        errors.prix_par_place = 'Le prix doit être entre 0 et 100 crédits';
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};

/**
 * Affiche les erreurs de validation
 * @param {Object} errors - Erreurs de validation
 */
const displayErrors = (errors) => {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    
    Object.entries(errors).forEach(([field, message]) => {
        const input = document.getElementById(field);
        if (input) {
            input.classList.add('input-error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            input.parentElement.appendChild(errorDiv);
        }
    });
    
    showNotification(Object.values(errors)[0], 'error');
};

/**
 * Crée une nouvelle proposition de covoiturage
 * @param {Object} rideData - Données du trajet
 * @returns {Promise<Object>} Trajet créé
 */
const createRide = async (rideData) => {
    const fetchWithAuth = createFetchWithAuth();
    
    const response = await fetchWithAuth(`${API_BASE_URL}/rides`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rideData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création du trajet');
    }
    
    return await response.json();
};

/**
 * Gère la soumission du formulaire
 * @param {Event} event - Événement de soumission
 */
const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = {
        ville_depart: validateAndSanitizeInput(document.getElementById('ville_depart').value),
        ville_arrivee: validateAndSanitizeInput(document.getElementById('ville_arrivee').value),
        date_depart: document.getElementById('date_depart').value,
        heure_depart: document.getElementById('heure_depart').value,
        places_disponibles: Number.parseInt(document.getElementById('places_disponibles').value),
        prix_par_place: Number.parseFloat(document.getElementById('prix_par_place').value) || 0,
        commentaire: validateAndSanitizeInput(document.getElementById('commentaire')?.value || ''),
        animaux_acceptes: document.getElementById('animaux_acceptes')?.checked || false,
        fumeur_accepte: document.getElementById('fumeur_accepte')?.checked || false,
        detour_possible: document.getElementById('detour_possible')?.checked || false
    };
    
    // Validation
    const errors = validateRideForm(formData);
    if (errors) {
        displayErrors(errors);
        return;
    }
    
    const closeLoading = showLoading('Création du trajet en cours...');
    
    try {
        const ride = await createRide(formData);
        
        closeLoading();
        showNotification('Trajet créé avec succès !', 'success');
        
        setTimeout(() => {
            window.location.href = `details-covoiturage.html?id=${ride.id}`;
        }, 1500);
        
    } catch (error) {
        closeLoading();
        console.error('Erreur lors de la création du trajet:', error);
        showNotification(error.message || 'Erreur lors de la création du trajet', 'error');
    }
};

/**
 * Calcule et affiche le prix estimé
 */
const updatePriceEstimate = () => {
    const priceInput = document.getElementById('prix_par_place');
    const placesInput = document.getElementById('places_disponibles');
    const estimateEl = document.getElementById('price-estimate');
    
    if (!priceInput || !placesInput || !estimateEl) return;
    
    const price = Number.parseFloat(priceInput.value) || 0;
    const places = Number.parseInt(placesInput.value) || 0;
    const total = price * places;
    
    estimateEl.textContent = `Vous gagnerez environ ${total} crédits si toutes les places sont réservées`;
    estimateEl.style.color = total > 0 ? '#48bb78' : '#718096';
};

/**
 * Initialise l'autocomplétion des villes
 * @param {HTMLInputElement} input - Champ de saisie
 */
const initCityAutocomplete = (input) => {
    if (!input) return;
    
    // Liste des grandes villes françaises (à remplacer par un appel API)
    const cities = [
        'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 
        'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes',
        'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble',
        'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Le Mans'
    ];
    
    const datalistId = `${input.id}-list`;
    let datalist = document.getElementById(datalistId);
    
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = datalistId;
        input.setAttribute('list', datalistId);
        document.body.appendChild(datalist);
    }
    
    datalist.innerHTML = cities.map(city => `<option value="${city}">`).join('');
};

/**
 * Initialise les validations en temps réel
 */
const initRealTimeValidation = () => {
    const priceInput = document.getElementById('prix_par_place');
    const placesInput = document.getElementById('places_disponibles');
    
    if (priceInput) {
        priceInput.addEventListener('input', updatePriceEstimate);
    }
    
    if (placesInput) {
        placesInput.addEventListener('input', updatePriceEstimate);
    }
    
    // Validation de la date
    const dateInput = document.getElementById('date_depart');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        dateInput.addEventListener('change', () => {
            const selectedDate = new Date(dateInput.value);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            
            if (selectedDate < todayDate) {
                dateInput.classList.add('input-error');
                showNotification('La date ne peut pas être dans le passé', 'warning');
            } else {
                dateInput.classList.remove('input-error');
            }
        });
    }
};

/**
 * Initialise la page de proposition de covoiturage
 */
export const init = () => {
    console.log('➕ Initialisation de la page de proposition de covoiturage');
    
    // Vérifier l'authentification
    if (!requireAuth()) {
        window.location.href = 'connexion.html?redirect=proposer-covoiturage.html';
        return;
    }
    
    const form = document.getElementById('propose-ride-form');
    if (!form) {
        console.warn('Formulaire de proposition non trouvé');
        return;
    }
    
    form.addEventListener('submit', handleSubmit);
    
    // Initialiser l'autocomplétion
    initCityAutocomplete(document.getElementById('ville_depart'));
    initCityAutocomplete(document.getElementById('ville_arrivee'));
    
    // Initialiser les validations
    initRealTimeValidation();
    
    // Calcul initial du prix
    updatePriceEstimate();
    
    console.log('✅ Page de proposition de covoiturage initialisée');
};
