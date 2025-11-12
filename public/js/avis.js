/**
 * EcoRide - Page des avis
 * Gestion des notations et avis (chauffeurs et site)
 * @file avis.js
 */

/**
 * Réinitialise les étoiles
 * @param {NodeList|Array} stars - Liste des éléments étoile
 */
function resetStars(stars) {
    for (const s of stars) {
        s.classList.remove('active');
        s.style.color = '#ddd';
    }
}

/**
 * Met à jour l'affichage des étoiles
 * @param {NodeList|Array} stars - Liste des éléments étoile
 * @param {number} value - Valeur de notation (1-5)
 */
function updateStars(stars, value) {
    for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (i < value) {
            s.classList.add('active');
            s.style.color = '#ffc107';
        } else {
            s.classList.remove('active');
            s.style.color = '#ddd';
        }
    }
}

/**
 * Gère le survol d'une étoile
 * @param {HTMLElement} star - Élément étoile survolé
 * @param {NodeList|Array} stars - Liste des éléments étoile
 */
function handleStarHover(star, stars) {
    const value = Number.parseInt(star.dataset.value);
    stars.forEach((s, i) => {
        s.style.color = i < value ? '#ffc107' : '#ddd';
    });
}

/**
 * Restaure l'affichage des étoiles à leur état actuel
 * @param {NodeList|Array} stars - Liste des éléments étoile
 * @param {HTMLInputElement} input - Input contenant la valeur actuelle
 */
function restoreStarState(stars, input) {
    const currentValue = Number.parseInt(input.value) || 0;
    stars.forEach((s, i) => {
        if (i < currentValue) {
            s.classList.add('active');
            s.style.color = '#ffc107';
        } else {
            s.classList.remove('active');
            s.style.color = '#ddd';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('avis.html')) return;
    
    console.log('📋 Page avis initialisée');

    const userToken = localStorage.getItem('token');
    if (!userToken) {
        showNotification("Vous devez être connecté pour accéder à cette page.", "error");
        return setTimeout(() => window.location.href = 'connexion.html', 2000);
    }

    let currentRideData = null;

    /**
     * Gestion des onglets
     */
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    for (const button of tabButtons) {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            for (const btn of tabButtons) {
                btn.classList.remove('active');
            }
            for (const content of tabContents) {
                content.classList.remove('active');
            }
            
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            if (tabName === 'eligible') {
                loadEligibleRides();
            } else if (tabName === 'my-reviews') {
                loadMyReviews();
            }
        });
    }

    /**
     * Gère le clic sur une étoile
     */
    function handleStarClick(star, stars, input) {
        const value = Number.parseInt(star.dataset.value);
        const currentValue = Number.parseInt(input.value);
        
        // Si on clique sur la même étoile, on désélectionne
        if (currentValue === value) {
            input.value = '';
            resetStars(stars);
        } else {
            input.value = value;
            updateStars(stars, value);
        }
    }

    /**
     * Initialise le système de notation par étoiles
     */
    function initStarRating(containerId, inputId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`⚠️ Container non trouvé: ${containerId}`);
            return;
        }
        
        const input = document.getElementById(inputId);
        if (!input) {
            console.warn(`⚠️ Input non trouvé: ${inputId}`);
            return;
        }
        
        const stars = container.querySelectorAll('.star');
        console.log(`⭐ Initialisation ${containerId}: ${stars.length} étoiles trouvées`);

        // Initialiser toutes les étoiles en gris au départ
        resetStars(stars);

        stars.forEach((star) => {
            star.addEventListener('click', () => handleStarClick(star, stars, input));
            star.addEventListener('mouseenter', () => handleStarHover(star, stars));
        });

        container.addEventListener('mouseleave', () => restoreStarState(stars, input));
    }

    // Initialiser tous les systèmes de notation
    initStarRating('overall-stars', 'overall-rating');
    initStarRating('ease-stars', 'ease-rating');
    initStarRating('reliability-stars', 'reliability-rating');
    initStarRating('service-stars', 'service-rating');
    initStarRating('value-stars', 'value-rating');
    initStarRating('driver-overall-stars', 'driver-overall-rating');
    initStarRating('punctuality-stars', 'punctuality-rating');
    initStarRating('driving-stars', 'driving-rating');
    initStarRating('cleanliness-stars', 'cleanliness-rating');
    initStarRating('friendliness-stars', 'friendliness-rating');

    /**
     * Charge les trajets éligibles pour notation
     */
    async function loadEligibleRides() {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/eligible-rides`, {
                headers: { 'x-auth-token': userToken }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des trajets');
            }

            const data = await response.json();
            const container = document.getElementById('eligible-rides-container');

            if (!data.rides || data.rides.length === 0) {
                container.innerHTML = `
                    <div class="no-reviews">
                        <div class="no-reviews-icon">🚗</div>
                        <h3>Aucun trajet à noter</h3>
                        <p>Vous avez noté tous vos trajets récents !</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = data.rides.map(ride => `
                <div class="ride-card">
                    <div class="ride-info">
                        <div>
                            <div class="ride-route">
                                ${ride.departure_city} → ${ride.arrival_city}
                            </div>
                            <div class="ride-date">
                                ${new Date(ride.departure_datetime).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                    <div class="driver-info">
                        <div class="driver-avatar">
                            ${ride.driver_pseudo ? ride.driver_pseudo.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                            <strong>${ride.driver_pseudo || 'Chauffeur'}</strong>
                        </div>
                    </div>
                    <button class="rate-button" onclick="openRatingModal(${ride.ride_id}, ${ride.driver_id}, ${ride.booking_id}, '${ride.driver_pseudo}', '${ride.departure_city}', '${ride.arrival_city}')">
                        ⭐ Noter ce chauffeur
                    </button>
                </div>
            `).join('');

        } catch (error) {
            console.error('Erreur chargement trajets:', error);
            showNotification('Erreur lors du chargement des trajets', 'error');
        }
    }

    /**
     * Ouvre la modale de notation
     */
    window.openRatingModal = function(rideId, driverId, bookingId, driverPseudo, departureCity, arrivalCity) {
        currentRideData = { rideId, driverId, bookingId, driverPseudo, departureCity, arrivalCity };
        
        document.getElementById('selected-ride-id').value = rideId;
        document.getElementById('selected-driver-id').value = driverId;
        document.getElementById('selected-booking-id').value = bookingId;
        
        document.getElementById('driver-display').innerHTML = `
            <div style="padding: 15px; background: #f5f5f5; border-radius: 8px;">
                <strong>Chauffeur:</strong> ${driverPseudo}<br>
                <strong>Trajet:</strong> ${departureCity} → ${arrivalCity}
            </div>
        `;
        
        document.getElementById('driver-rating-form').reset();
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
        
        document.getElementById('rating-modal').classList.add('active');
    };

    /**
     * Ferme la modale
     */
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('rating-modal').classList.remove('active');
        });
    }

    const ratingModal = document.getElementById('rating-modal');
    if (ratingModal) {
        ratingModal.addEventListener('click', (e) => {
            if (e.target.id === 'rating-modal') {
                ratingModal.classList.remove('active');
            }
        });
    }

    /**
     * Soumission de l'avis chauffeur
     */
    const driverRatingForm = document.getElementById('driver-rating-form');
    if (driverRatingForm) {
        driverRatingForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const rating = Number.parseInt(document.getElementById('driver-overall-rating').value);
            if (!rating) {
                showNotification('Veuillez sélectionner une note globale', 'error');
                return;
            }

            // Calculer la moyenne de toutes les notes
            const punctuality = Number.parseInt(document.getElementById('punctuality-rating').value) || 0;
            const driving = Number.parseInt(document.getElementById('driving-rating').value) || 0;
            const cleanliness = Number.parseInt(document.getElementById('cleanliness-rating').value) || 0;
            const friendliness = Number.parseInt(document.getElementById('friendliness-rating').value) || 0;
            
            const ratings = [rating, punctuality, driving, cleanliness, friendliness].filter(r => r > 0);
            const average = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
            
            console.log(`📊 Moyenne des notes: ${average}/5 (basée sur ${ratings.length} critères)`);

            try {
                const response = await fetch(`${API_BASE_URL}/reviews/driver`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': userToken
                    },
                    body: JSON.stringify({
                        driverId: Number.parseInt(document.getElementById('selected-driver-id').value),
                        rideId: Number.parseInt(document.getElementById('selected-ride-id').value),
                        bookingId: Number.parseInt(document.getElementById('selected-booking-id').value),
                        rating: rating,
                        punctualityRating: Number.parseInt(document.getElementById('punctuality-rating').value) || null,
                        drivingQualityRating: Number.parseInt(document.getElementById('driving-rating').value) || null,
                        vehicleCleanlinessRating: Number.parseInt(document.getElementById('cleanliness-rating').value) || null,
                        friendlinessRating: Number.parseInt(document.getElementById('friendliness-rating').value) || null,
                        comment: document.getElementById('driver-comment').value
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(`✅ Avis publié avec succès ! Moyenne: ${average}⭐`, 'success');
                    document.getElementById('rating-modal').classList.remove('active');
                    loadEligibleRides();
                } else {
                    showNotification(data.msg || 'Erreur lors de la publication de l\'avis', 'error');
                }

            } catch (error) {
                console.error('Erreur publication avis:', error);
                showNotification('Erreur lors de la publication de l\'avis', 'error');
            }
        });
    }

    /**
     * Soumission de l'avis sur le site
     */
    const siteReviewForm = document.getElementById('site-review-form');
    if (siteReviewForm) {
        siteReviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const overallRating = Number.parseInt(document.getElementById('overall-rating').value);
            if (!overallRating) {
                showNotification('Veuillez sélectionner une note globale', 'error');
                return;
            }

            // Calculer la moyenne de toutes les notes
            const ease = Number.parseInt(document.getElementById('ease-rating').value) || 0;
            const reliability = Number.parseInt(document.getElementById('reliability-rating').value) || 0;
            const service = Number.parseInt(document.getElementById('service-rating').value) || 0;
            const value = Number.parseInt(document.getElementById('value-rating').value) || 0;
            
            const ratings = [overallRating, ease, reliability, service, value].filter(r => r > 0);
            const average = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
            
            console.log(`📊 Moyenne des notes: ${average}/5 (basée sur ${ratings.length} critères)`);

            try {
                const response = await fetch(`${API_BASE_URL}/reviews/site`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': userToken
                    },
                    body: JSON.stringify({
                        overallRating: overallRating,
                        easeOfUseRating: Number.parseInt(document.getElementById('ease-rating').value) || null,
                        reliabilityRating: Number.parseInt(document.getElementById('reliability-rating').value) || null,
                        customerServiceRating: Number.parseInt(document.getElementById('service-rating').value) || null,
                        valueForMoneyRating: Number.parseInt(document.getElementById('value-rating').value) || null,
                        comment: document.getElementById('site-comment').value,
                        wouldRecommend: document.getElementById('would-recommend')?.checked || false
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(`✅ Avis sur le site publié avec succès ! Moyenne: ${average}⭐`, 'success');
                    siteReviewForm.reset();
                    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
                } else {
                    showNotification(data.msg || 'Erreur lors de la publication de l\'avis', 'error');
                }

            } catch (error) {
                console.error('Erreur publication avis site:', error);
                showNotification('Erreur lors de la publication de l\'avis', 'error');
            }
        });
    }

    /**
     * Charge les avis donnés par l'utilisateur
     */
    async function loadMyReviews() {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/my-reviews`, {
                headers: { 'x-auth-token': userToken }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement de vos avis');
            }

            const data = await response.json();
            const container = document.getElementById('my-reviews-container');

            if (!data.reviews || data.reviews.length === 0) {
                container.innerHTML = `
                    <div class="no-reviews">
                        <div class="no-reviews-icon">📝</div>
                        <h3>Aucun avis donné</h3>
                        <p>Vous n'avez pas encore donné d'avis. Complétez un trajet pour pouvoir noter votre expérience !</p>
                    </div>
                `;
                return;
            }

            // Afficher les avis
            container.innerHTML = data.reviews.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-type">
                            ${review.review_type === 'driver' ? 
                                `<i class="fas fa-user-circle"></i> Avis chauffeur - ${review.driver_name || 'Chauffeur'}` : 
                                `<i class="fas fa-star"></i> Avis sur EcoRide`
                            }
                        </div>
                        <div class="review-date">
                            ${new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                    
                    ${review.review_type === 'driver' ? `
                        <div class="review-ride-info">
                            <i class="fas fa-route"></i>
                            ${review.departure_city || 'Départ'} → ${review.arrival_city || 'Arrivée'}
                        </div>
                    ` : ''}
                    
                    <div class="review-ratings">
                        ${review.rating ? `
                            <div class="rating-item">
                                <span class="rating-label">Note globale:</span>
                                <span class="rating-stars">${'⭐'.repeat(Math.round(review.rating))}</span>
                                <span class="rating-value">${review.rating.toFixed(1)}</span>
                            </div>
                        ` : ''}
                        
                        ${review.review_type === 'driver' && review.punctuality ? `
                            <div class="rating-item">
                                <span class="rating-label">Ponctualité:</span>
                                <span class="rating-stars">${'⭐'.repeat(review.punctuality)}</span>
                            </div>
                        ` : ''}
                        
                        ${review.review_type === 'driver' && review.driving_quality ? `
                            <div class="rating-item">
                                <span class="rating-label">Conduite:</span>
                                <span class="rating-stars">${'⭐'.repeat(review.driving_quality)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${review.comment ? `
                        <div class="review-comment">
                            <i class="fas fa-comment"></i>
                            "${review.comment}"
                        </div>
                    ` : ''}
                </div>
            `).join('');

        } catch (error) {
            console.error('Erreur chargement avis:', error);
            showNotification("Impossible de charger vos avis", "error");
        }
    }

    // Charger les trajets éligibles au démarrage
    loadEligibleRides();
});
