/**
 * EcoRide - Page de recherche et liste des covoiturages
 * Gestion de la recherche et de l'affichage des trajets disponibles
 * @file covoiturages.js
 */

import { createFetchWithAuth, API_BASE_URL } from '../common/auth.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { validateAndSanitizeInput, formatDate } from '../common/utils.js';

/**
 * Récupère la liste des covoiturages
 * @param {Object} filters - Filtres de recherche
 * @returns {Promise<Array>} Liste des covoiturages
 */
const fetchRides = async (filters = {}) => {
    const fetchWithAuth = createFetchWithAuth();
    const params = new URLSearchParams();
    
    if (filters.depart) params.append('depart', filters.depart);
    if (filters.arrivee) params.append('arrivee', filters.arrivee);
    if (filters.date) params.append('date', filters.date);
    if (filters.places) params.append('places', filters.places);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/rides${queryString ? '?' + queryString : ''}`;
    
    const response = await fetchWithAuth(url);
    if (!response.ok) {
        throw new Error('Erreur lors de la récupération des covoiturages');
    }
    
    return await response.json();
};

/**
 * Crée le HTML pour une carte de covoiturage
 * @param {Object} ride - Données du covoiturage
 * @returns {string} HTML de la carte
 */
const createRideCard = (ride) => {
    const date = formatDate(new Date(ride.date_depart));
    const price = ride.prix_par_place ? `${ride.prix_par_place} crédits` : 'Gratuit';
    
    return `
        <div class="ride-card" data-ride-id="${ride.id}">
            <div class="ride-header">
                <div class="driver-info">
                    <img src="${ride.photo_profil || '/images/default-avatar.png'}" 
                         alt="${ride.chauffeur_pseudo}" 
                         class="driver-avatar">
                    <div>
                        <h3 class="driver-name">${ride.chauffeur_pseudo}</h3>
                        <span class="driver-rating">⭐ ${ride.note_moyenne || 'Nouveau'}</span>
                    </div>
                </div>
                <div class="ride-price">${price}</div>
            </div>
            
            <div class="ride-route">
                <div class="route-point">
                    <span class="route-icon">📍</span>
                    <span class="route-location">${ride.ville_depart}</span>
                </div>
                <div class="route-arrow">→</div>
                <div class="route-point">
                    <span class="route-icon">🎯</span>
                    <span class="route-location">${ride.ville_arrivee}</span>
                </div>
            </div>
            
            <div class="ride-details">
                <span class="detail-item">
                    <span class="detail-icon">📅</span>
                    ${date}
                </span>
                <span class="detail-item">
                    <span class="detail-icon">🕒</span>
                    ${ride.heure_depart}
                </span>
                <span class="detail-item">
                    <span class="detail-icon">👥</span>
                    ${ride.places_disponibles} places
                </span>
            </div>
            
            ${ride.commentaire ? `
                <div class="ride-comment">
                    <p>${ride.commentaire}</p>
                </div>
            ` : ''}
            
            <div class="ride-actions">
                <button class="btn btn-primary view-details" data-ride-id="${ride.id}">
                    Voir les détails
                </button>
            </div>
        </div>
    `;
};

/**
 * Affiche les covoiturages dans le conteneur
 * @param {Array} rides - Liste des covoiturages
 */
const displayRides = (rides) => {
    const container = document.getElementById('rides-container');
    if (!container) return;
    
    if (!rides || rides.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>Aucun covoiturage trouvé pour ces critères</p>
                <button class="btn btn-secondary" id="reset-filters">
                    Réinitialiser les filtres
                </button>
            </div>
        `;
        
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                document.getElementById('search-form')?.reset();
                loadRides();
            });
        }
        return;
    }
    
    container.innerHTML = rides.map(ride => createRideCard(ride)).join('');
    
    // Ajouter les événements sur les boutons
    for (const btn of container.querySelectorAll('.view-details')) {
        btn.addEventListener('click', (e) => {
            const rideId = e.target.dataset.rideId;
            globalThis.location.href = `details-covoiturage.html?id=${rideId}`;
        });
    }
};

/**
 * Charge et affiche les covoiturages
 * @param {Object} filters - Filtres de recherche
 */
const loadRides = async (filters = {}) => {
    const closeLoading = showLoading('Recherche de covoiturages...');
    
    try {
        const rides = await fetchRides(filters);
        closeLoading();
        displayRides(rides);
        
        // Afficher le nombre de résultats
        const count = rides.length;
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = `${count} trajet${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`;
        }
        
    } catch (error) {
        closeLoading();
        console.error('Erreur lors du chargement des covoiturages:', error);
        showNotification('Erreur lors du chargement des covoiturages', 'error');
        displayRides([]);
    }
};

/**
 * Gère la soumission du formulaire de recherche
 * @param {Event} event - Événement de soumission
 */
const handleSearchSubmit = (event) => {
    event.preventDefault();
    
    const filters = {
        depart: validateAndSanitizeInput(document.getElementById('depart')?.value || ''),
        arrivee: validateAndSanitizeInput(document.getElementById('arrivee')?.value || ''),
        date: document.getElementById('date')?.value || '',
        places: document.getElementById('places')?.value || ''
    };
    
    // Supprimer les filtres vides
    for (const key of Object.keys(filters)) {
        if (!filters[key]) delete filters[key];
    }
    
    loadRides(filters);
};

/**
 * Initialise la recherche avancée
 */
const initAdvancedSearch = () => {
    const toggleBtn = document.getElementById('toggle-advanced-search');
    const advancedPanel = document.getElementById('advanced-search-panel');
    
    if (toggleBtn && advancedPanel) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = advancedPanel.style.display === 'none';
            advancedPanel.style.display = isHidden ? 'block' : 'none';
            toggleBtn.textContent = isHidden ? 'Masquer les filtres' : 'Filtres avancés';
        });
    }
};

/**
 * Initialise la page de recherche de covoiturages
 */
export const init = () => {
    console.log('🚗 Initialisation de la page de covoiturages');
    
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchSubmit);
    }
    
    // Initialiser la recherche avancée
    initAdvancedSearch();
    
    // Charger les covoiturages au démarrage
    loadRides();
    
    // Date minimum = aujourd'hui
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    console.log('✅ Page de covoiturages initialisée');
};
