/**
 * EcoRide - Page de recherche de covoiturages
 * Gestion de la recherche et de l'affichage des trajets disponibles
 * @file covoiturages.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('covoiturages-page')) return;
    
    console.log('🔍 Page covoiturages initialisée');
    
    const mainSearchForm = document.getElementById('main-search-form');
    const searchResultsList = document.getElementById('search-results-list');
    const noSearchResultsMessage = document.getElementById('no-search-results');
    let allRides = [];

    /**
     * Charge la note d'un chauffeur
     */
    const loadDriverRating = async (driverId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/driver/${driverId}/rating`);
            const data = await response.json();
            if (data.success && data.rating) {
                return data.rating;
            }
            return { avg_rating: 0, total_reviews: 0 };
        } catch (error) {
            console.error('Erreur chargement note chauffeur:', error);
            return { avg_rating: 0, total_reviews: 0 };
        }
    };

    /**
     * Génère les étoiles de notation
     */
    const generateStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }
        if (hasHalfStar) {
            stars += '⭐';
        }
        for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
            stars += '☆';
        }
        
        return stars;
    };

    /**
     * Affiche les résultats de recherche
     */
    const displaySearchResults = async (rides) => {
        if (!searchResultsList || !noSearchResultsMessage) return;
        searchResultsList.innerHTML = '';
        
        if (!rides || rides.length === 0) {
            noSearchResultsMessage.style.display = 'block';
            return;
        }
        
        noSearchResultsMessage.style.display = 'none';
        
        for (const ride of rides) {
            const date = new Date(ride.departureDate).toLocaleDateString('fr-FR');
            const driverId = ride.driver.id || ride.driver._id;
            
            // Photo du chauffeur
            const timestamp = new Date().getTime();
            let driverPhoto = 'public/images/driver-default.jpeg';
            
            if (ride.driver.profile_picture) {
                if (ride.driver.profile_picture.startsWith('data:image') || 
                    ride.driver.profile_picture.startsWith('/9j/')) {
                    driverPhoto = ride.driver.profile_picture.startsWith('data:image') 
                        ? ride.driver.profile_picture 
                        : `data:image/jpeg;base64,${ride.driver.profile_picture}`;
                } else {
                    driverPhoto = `${API_BASE_URL.replace('/api', '')}${ride.driver.profile_picture}?t=${timestamp}`;
                }
            }
            
            // Charger la note du chauffeur
            const rating = await loadDriverRating(driverId);
            const avgRating = Number.parseFloat(rating.avg_rating) || 0;
            const stars = generateStars(avgRating);
            const ratingDisplay = rating.total_reviews > 0 
                ? `<div class="driver-rating">${stars} <span class="rating-value">${avgRating.toFixed(1)}/5</span> <span class="rating-count">(${rating.total_reviews} avis)</span></div>`
                : `<div class="driver-rating"><span class="rating-count">Nouveau chauffeur</span></div>`;
            
            searchResultsList.innerHTML += `
                <div class="covoiturage-card">
                    <div class="card-header">
                        <img src="${driverPhoto}" alt="Photo ${ride.driver.pseudo}" class="driver-photo" onerror="this.src='public/images/driver-default.jpeg'">
                        <div class="driver-info">
                            <strong>${ride.driver.pseudo}</strong>
                            ${ratingDisplay}
                        </div>
                    </div>
                    <div class="card-body">
                        <p><strong>Trajet:</strong> ${ride.departure} → ${ride.arrival}</p>
                        <p><strong>Date:</strong> ${date} à ${ride.departureTime}</p>
                        <p><strong>Prix:</strong> ${ride.price} <span class="ecocredit-icon"></span></p>
                        <div class="card-actions">
                            <a href="details-covoiturage.html?id=${ride._id}" class="details-button">
                                <i class="fas fa-info-circle"></i> Détails
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    /**
     * Gestion du formulaire de recherche
     */
    if (mainSearchForm) {
        mainSearchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const params = Object.fromEntries(new FormData(e.target).entries());
            
            // Nettoyer les paramètres vides
            Object.keys(params).forEach(key => {
                if (!params[key] || params[key] === '') {
                    delete params[key];
                }
            });
            
            const query = new URLSearchParams(params).toString();
            
            try {
                const response = await fetch(`${API_BASE_URL}/rides/search?${query}`);
                const data = await response.json();
                
                if (!response.ok) throw new Error(data.msg || data.message || "Erreur de recherche");
                
                allRides = data.rides || [];
                displaySearchResults(allRides);
            } catch (error) {
                showNotification(`Erreur: ${error.message}`, 'error');
                if(searchResultsList) searchResultsList.innerHTML = '';
                if(noSearchResultsMessage) noSearchResultsMessage.style.display = 'block';
            }
        });
        
        // Charger tous les trajets disponibles au démarrage
        mainSearchForm.dispatchEvent(new Event('submit'));
    }
});
