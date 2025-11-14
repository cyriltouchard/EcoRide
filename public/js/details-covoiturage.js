/**
 * EcoRide - Page de détails d'un covoiturage
 * Gestion de l'affichage des détails et de la réservation
 * @file details-covoiturage.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('details-page')) return;
    
    console.log('📄 Page détails covoiturage initialisée');
    
    const rideId = new URLSearchParams(window.location.search).get('id');
    
    if (!rideId) {
        document.querySelector('main').innerHTML = `<h1>Trajet non trouvé</h1>`;
        return;
    }

    /**
     * Fonction fetch avec ou sans authentification
     */
    const fetchWithAuth = async (url, options = {}) => {
        const userToken = localStorage.getItem('token');
        if (!userToken) return fetch(url, options).then(r => r.json());
        return createFetchWithAuth(userToken)(url, options);
    };

    /**
     * Charge les détails du trajet
     */
    const loadRideDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/rides/${rideId}`);
            const result = await response.json();
            
            if (!response.ok) throw new Error(result.msg || result.message || "Trajet non trouvé");

            const ride = result.data || result;
            
            console.log('📦 Trajet chargé:', ride);
            console.log('🚗 Véhicule complet:', JSON.stringify(ride.vehicle, null, 2));
            console.log('🔑 Immatriculation:', ride.vehicle?.plate);
            console.log('⚡ Énergie:', ride.vehicle?.energy);

            document.getElementById('ride-departure').textContent = ride.departure;
            document.getElementById('ride-arrival').textContent = ride.arrival;
            document.getElementById('ride-date').textContent = new Date(ride.departureDate).toLocaleDateString('fr-FR');
            document.getElementById('ride-time').textContent = ride.departureTime;
            document.getElementById('ride-price').textContent = ride.price;
            document.getElementById('ride-seats').textContent = ride.availableSeats;
            document.getElementById('driver-name').textContent = ride.driver.pseudo;
            
            // Description du trajet
            const descriptionEl = document.getElementById('ride-description');
            if (ride.description && ride.description.trim()) {
                descriptionEl.textContent = ride.description;
            } else {
                descriptionEl.style.display = 'none';
            }
            
            // Bio du chauffeur
            const driverBioEl = document.getElementById('driver-bio');
            if (driverBioEl && ride.driver.bio) {
                driverBioEl.textContent = ride.driver.bio;
            } else if (driverBioEl) {
                driverBioEl.textContent = 'Aucune description disponible.';
            }
            
            // Charger la photo du chauffeur
            const driverPhotoEl = document.getElementById('driver-photo-lg');
            if (driverPhotoEl && ride.driver.profile_picture) {
                const timestamp = new Date().getTime();
                
                if (ride.driver.profile_picture.startsWith('data:image') || 
                    ride.driver.profile_picture.startsWith('/9j/')) {
                    driverPhotoEl.src = ride.driver.profile_picture.startsWith('data:image') 
                        ? ride.driver.profile_picture 
                        : `data:image/jpeg;base64,${ride.driver.profile_picture}`;
                } else {
                    driverPhotoEl.src = `${API_BASE_URL.replace('/api', '')}${ride.driver.profile_picture}?t=${timestamp}`;
                }
            }
            
            // Véhicule
            document.getElementById('vehicle-model').textContent = ride.vehicle?.model || 'Non renseigné';
            document.getElementById('vehicle-brand').textContent = ride.vehicle?.brand || 'Non renseignée';
            document.getElementById('vehicle-plate').textContent = ride.vehicle?.plate || 'Non renseignée';
            document.getElementById('vehicle-energy').textContent = ride.vehicle?.energy || 'Non renseignée';
            
            // Debug final
            if (!ride.vehicle?.plate || !ride.vehicle?.energy) {
                console.warn('⚠️ Données véhicule manquantes. Populate ne fonctionne pas correctement.');
            }
            
            const button = document.getElementById('participate-button');
            if (ride.availableSeats <= 0) {
                button.disabled = true;
                button.textContent = "Complet";
            }
        } catch (error) {
            console.error('❌ Erreur chargement trajet:', error);
            showNotification(`Erreur de chargement: ${error.message}`, 'error');
        }
    };

    /**
     * Gestion du bouton de participation
     */
    const participateButton = document.getElementById('participate-button');
    if (participateButton) {
        participateButton.addEventListener('click', async () => {
            const userToken = localStorage.getItem('token');
            
            if (!userToken) {
                showNotification("Veuillez vous connecter pour participer.", "info");
                return setTimeout(() => window.location.href = 'connexion.html', 2000);
            }
            
            try {
                await fetchWithAuth(`${API_BASE_URL}/rides/${rideId}/book`, { 
                    method: 'POST',
                    body: JSON.stringify({ seatsToBook: 1 })
                });
                
                showNotification("Réservation réussie !", "success");
                participateButton.textContent = "Réservé !";
                participateButton.disabled = true;
                
                const seatsEl = document.getElementById('ride-seats');
                seatsEl.textContent = Number.parseInt(seatsEl.textContent) - 1;
            } catch (error) {
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        });
    }
    
    // Charger les détails au démarrage
    loadRideDetails();
});
