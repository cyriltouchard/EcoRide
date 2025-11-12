/**
 * EcoRide - Page de détails d'un covoiturage
 * Affichage des informations détaillées et réservation
 * @file details-covoiturage.js
 */

import { createFetchWithAuth, API_BASE_URL, requireAuth, isAuthenticated } from '../common/auth.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { formatDate, generateStars } from '../common/utils.js';

/**
 * Récupère les détails d'un covoiturage
 * @param {number} rideId - ID du trajet
 * @returns {Promise<Object>} Détails du trajet
 */
const fetchRideDetails = async (rideId) => {
    const fetchWithAuth = createFetchWithAuth();
    
    const response = await fetchWithAuth(`${API_BASE_URL}/rides/${rideId}`);
    if (!response.ok) {
        throw new Error('Trajet non trouvé');
    }
    
    return await response.json();
};

/**
 * Récupère les avis du chauffeur
 * @param {number} driverId - ID du chauffeur
 * @returns {Promise<Array>} Liste des avis
 */
const fetchDriverReviews = async (driverId) => {
    const fetchWithAuth = createFetchWithAuth();
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/reviews/driver/${driverId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.warn('Erreur lors de la récupération des avis:', error);
        return [];
    }
};

/**
 * Génère le HTML pour la section de réservation
 * @param {Object} ride - Données du trajet
 * @returns {string} HTML de la section réservation
 */
const renderBookingSection = (ride) => {
    const price = ride.prix_par_place ? `${ride.prix_par_place} crédits` : 'Gratuit';
    const placesText = `${ride.places_disponibles} place${ride.places_disponibles > 1 ? 's' : ''} disponible${ride.places_disponibles > 1 ? 's' : ''}`;
    
    return `
        <div class="booking-section">
            <div class="price-card">
                <div class="price-label">Prix par place</div>
                <div class="price-amount">${price}</div>
                <div class="places-info">
                    <span class="icon">👥</span>
                    ${placesText}
                </div>
            </div>
            
            ${isAuthenticated() ? `
                <div class="booking-form">
                    <label for="places_reservees">Nombre de places</label>
                    <select id="places_reservees" class="form-control">
                        ${Array.from({ length: Math.min(ride.places_disponibles, 8) }, (_, i) => 
                            `<option value="${i + 1}">${i + 1}</option>`
                        ).join('')}
                    </select>
                    
                    <div class="total-price">
                        Total : <span id="booking-total">${ride.prix_par_place || 0}</span> crédits
                    </div>
                    
                    <button id="book-ride-btn" class="btn btn-primary btn-block">
                        Réserver
                    </button>
                </div>
            ` : `
                <a href="connexion.html?redirect=details-covoiturage.html?id=${ride.id}" 
                   class="btn btn-primary btn-block">
                    Se connecter pour réserver
                </a>
            `}
        </div>
    `;
};

/**
 * Génère le HTML pour les préférences de voyage
 * @param {Object} ride - Données du trajet
 * @returns {string} HTML des préférences
 */
const renderPreferences = (ride) => {
    return `
        <div class="preferences-card">
            <h2>Préférences de voyage</h2>
            <div class="preferences-list">
                <div class="preference-item ${ride.animaux_acceptes ? 'accepted' : 'rejected'}">
                    <span class="icon">🐾</span>
                    <span>Animaux ${ride.animaux_acceptes ? 'acceptés' : 'non acceptés'}</span>
                </div>
                <div class="preference-item ${ride.fumeur_accepte ? 'accepted' : 'rejected'}">
                    <span class="icon">🚬</span>
                    <span>Fumeurs ${ride.fumeur_accepte ? 'acceptés' : 'non acceptés'}</span>
                </div>
                <div class="preference-item ${ride.detour_possible ? 'accepted' : 'rejected'}">
                    <span class="icon">🔄</span>
                    <span>Détour ${ride.detour_possible ? 'possible' : 'non possible'}</span>
                </div>
            </div>
        </div>
    `;
};

/**
 * Affiche les détails du trajet
 * @param {Object} ride - Données du trajet
 */
const displayRideDetails = (ride) => {
    const container = document.getElementById('ride-details-container');
    if (!container) return;
    
    const date = formatDate(new Date(ride.date_depart));
    const rating = ride.note_moyenne ? generateStars(ride.note_moyenne) : 'Nouveau chauffeur';
    const tripsText = `${ride.nombre_trajets || 0} trajet${ride.nombre_trajets > 1 ? 's' : ''} effectué${ride.nombre_trajets > 1 ? 's' : ''}`;
    
    container.innerHTML = `
        <div class="ride-details">
            <div class="ride-header">
                <h1>Trajet ${ride.ville_depart} → ${ride.ville_arrivee}</h1>
                <div class="ride-status ${ride.statut}">${ride.statut}</div>
            </div>
            
            <div class="ride-main-info">
                <div class="route-section">
                    <div class="route-visual">
                        <div class="route-point start">
                            <span class="route-icon">📍</span>
                            <div class="route-details">
                                <h3>${ride.ville_depart}</h3>
                                <p class="time">${ride.heure_depart}</p>
                            </div>
                        </div>
                        
                        <div class="route-line"></div>
                        
                        <div class="route-point end">
                            <span class="route-icon">🎯</span>
                            <div class="route-details">
                                <h3>${ride.ville_arrivee}</h3>
                                <p class="time">Arrivée estimée</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ride-date">
                        <span class="icon">📅</span>
                        <span>${date}</span>
                    </div>
                </div>
                
                ${renderBookingSection(ride)}
            </div>
            
            <div class="ride-additional-info">
                <div class="driver-card">
                    <h2>À propos du chauffeur</h2>
                    <div class="driver-profile">
                        <img src="${ride.photo_profil || '/images/default-avatar.png'}" 
                             alt="${ride.chauffeur_pseudo}" 
                             class="driver-avatar-large">
                        <div class="driver-info">
                            <h3>${ride.chauffeur_pseudo}</h3>
                            <div class="driver-rating">${rating}</div>
                            <p class="driver-trips">${tripsText}</p>
                        </div>
                    </div>
                    
                    ${ride.bio ? `
                        <div class="driver-bio">
                            <p>${ride.bio}</p>
                        </div>
                    ` : ''}
                </div>
                
                ${renderPreferences(ride)}
                
                ${ride.commentaire ? `
                    <div class="comment-card">
                        <h2>Message du chauffeur</h2>
                        <p>${ride.commentaire}</p>
                    </div>
                ` : ''}
            </div>
            
            <div id="reviews-section" class="reviews-section">
                <h2>Avis des passagers</h2>
                <div id="reviews-container" class="reviews-container">
                    <p class="loading">Chargement des avis...</p>
                </div>
            </div>
        </div>
    `;
    
    // Initialiser le calcul du total
    initBookingCalculator(ride);
};

/**
 * Affiche les avis du chauffeur
 * @param {Array} reviews - Liste des avis
 */
const displayReviews = (reviews) => {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="no-reviews">Aucun avis pour le moment</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <img src="${review.photo_profil || '/images/default-avatar.png'}" 
                         alt="${review.passager_pseudo}" 
                         class="reviewer-avatar">
                    <div>
                        <h4>${review.passager_pseudo}</h4>
                        <div class="review-date">${formatDate(new Date(review.date_creation))}</div>
                    </div>
                </div>
                <div class="review-rating">${generateStars(review.note)}</div>
            </div>
            ${review.commentaire ? `
                <div class="review-comment">
                    <p>${review.commentaire}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
};

/**
 * Initialise le calculateur de prix de réservation
 * @param {Object} ride - Données du trajet
 */
const initBookingCalculator = (ride) => {
    const placesSelect = document.getElementById('places_reservees');
    const totalEl = document.getElementById('booking-total');
    
    if (!placesSelect || !totalEl) return;
    
    placesSelect.addEventListener('change', () => {
        const places = Number.parseInt(placesSelect.value);
        const total = places * (ride.prix_par_place || 0);
        totalEl.textContent = total;
    });
    
    // Initialiser le bouton de réservation
    const bookBtn = document.getElementById('book-ride-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', () => handleBooking(ride));
    }
};

/**
 * Gère la réservation d'un trajet
 * @param {Object} ride - Données du trajet
 */
const handleBooking = async (ride) => {
    if (!requireAuth()) {
        window.location.href = `connexion.html?redirect=details-covoiturage.html?id=${ride.id}`;
        return;
    }
    
    const placesSelect = document.getElementById('places_reservees');
    const places = Number.parseInt(placesSelect?.value || 1);
    
    const closeLoading = showLoading('Traitement de votre réservation...');
    
    try {
        const fetchWithAuth = createFetchWithAuth();
        const response = await fetchWithAuth(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                covoiturage_id: ride.id,
                nombre_places: places
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de la réservation');
        }
        
        const booking = await response.json();
        
        closeLoading();
        showNotification('Réservation effectuée avec succès !', 'success');
        
        setTimeout(() => {
            window.location.href = 'espace-utilisateur.html';
        }, 1500);
        
    } catch (error) {
        closeLoading();
        console.error('Erreur lors de la réservation:', error);
        showNotification(error.message || 'Erreur lors de la réservation', 'error');
    }
};

/**
 * Initialise la page de détails de covoiturage
 */
export const init = async () => {
    console.log('🔍 Initialisation de la page de détails de covoiturage');
    
    // Récupérer l'ID du trajet depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const rideId = urlParams.get('id');
    
    if (!rideId) {
        showNotification('Trajet non spécifié', 'error');
        setTimeout(() => {
            window.location.href = 'covoiturages.html';
        }, 2000);
        return;
    }
    
    const closeLoading = showLoading('Chargement des détails...');
    
    try {
        const ride = await fetchRideDetails(rideId);
        closeLoading();
        
        displayRideDetails(ride);
        
        // Charger les avis du chauffeur
        const reviews = await fetchDriverReviews(ride.chauffeur_id);
        displayReviews(reviews);
        
    } catch (error) {
        closeLoading();
        console.error('Erreur lors du chargement des détails:', error);
        showNotification(error.message || 'Erreur lors du chargement des détails', 'error');
        
        setTimeout(() => {
            window.location.href = 'covoiturages.html';
        }, 2000);
    }
    
    console.log('✅ Page de détails de covoiturage initialisée');
};
