/**
 * EcoRide - Espace chauffeur
 * Gestion de l'espace dédié aux chauffeurs
 * @file espace-chauffeur.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('driver-space') && !window.location.pathname.includes('espace-chauffeur')) return;
    
    console.log('🚗 Page espace chauffeur initialisée');
    
    const userToken = localStorage.getItem('token');
    
    if (!userToken) {
        showNotification("Vous devez être connecté pour accéder à cette page.", "error");
        return setTimeout(() => window.location.href = 'connexion.html', 2000);
    }

    const fetchWithAuth = createFetchWithAuth(userToken);
    let vehicles = [];
    let rides = [];

    /**
     * Vérifie l'authentification et les droits chauffeur
     */
    const checkDriverAuthentication = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/users/me`);
            const user = response.data || response;
            
            // Vérifier si l'utilisateur a les droits (chauffeur ou admin)
            if (user.user_type !== 'driver' && user.user_type !== 'admin') {
                showNotification('Accès réservé aux chauffeurs', 'error');
                setTimeout(() => window.location.href = 'espace-utilisateur.html', 2000);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erreur vérification accès:', error);
            showNotification("Erreur de vérification des droits d'accès", "error");
            return false;
        }
    };

    /**
     * Charge le solde de crédits
     */
    const loadCreditBalance = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/credits/balance`);
            const credits = response.data ? response.data.current_credits : response.current_credits;
            const creditBalanceEl = document.getElementById('credit-balance');
            if (creditBalanceEl) {
                creditBalanceEl.textContent = `💰 ${credits || 0} crédits`;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des crédits:', error);
        }
    };

    /**
     * Charge les véhicules du chauffeur
     */
    const loadVehicles = async () => {
        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/vehicles/me`);
            vehicles = data.vehicles || [];
            displayVehicles();
            updateVehicleOptions();
        } catch (error) {
            console.error('Erreur chargement véhicules:', error);
            vehicles = [];
            displayVehicles();
        }
    };

    /**
     * Affiche les véhicules
     */
    const displayVehicles = () => {
        const container = document.getElementById('vehicles-container');
        if (!container) return;
        
        if (vehicles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>🚗 Aucun véhicule enregistré</p>
                    <button class="btn btn-primary" onclick="showAddVehicleModal()">
                        Ajouter votre premier véhicule
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = vehicles.map(vehicle => `
            <div class="vehicle-item">
                <h4>${vehicle.brand} ${vehicle.model}</h4>
                <p>🪑 ${vehicle.seats || vehicle.available_seats} places | 
                   ⚡ ${vehicle.energy || vehicle.energy_type} | 
                   🔢 ${vehicle.plate || vehicle.license_plate}</p>
                <button class="btn btn-danger" onclick="deleteVehicle(${vehicle._id || vehicle.id})">
                    Supprimer
                </button>
            </div>
        `).join('');
    };

    /**
     * Charge les trajets du chauffeur
     */
    const loadRides = async () => {
        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/rides/offered`);
            rides = data.rides || [];
            displayRides();
        } catch (error) {
            console.error('Erreur chargement trajets:', error);
            rides = [];
            displayRides();
        }
    };

    /**
     * Affiche les trajets
     */
    const displayRides = () => {
        const container = document.getElementById('rides-container');
        if (!container) return;
        
        if (rides.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>🛣️ Aucun trajet créé</p>
                    <button class="btn btn-primary" onclick="showCreateRideModal()">
                        Créer votre premier trajet
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = rides.map(ride => {
            const date = new Date(ride.departureDate).toLocaleDateString('fr-FR');
            return `
                <div class="ride-item">
                    <h4>${ride.departure} → ${ride.arrival}</h4>
                    <p>📅 ${date} à ${ride.departureTime} | 
                       💰 ${ride.price} <span class="ecocredit-icon-sm"></span> | 
                       🪑 ${ride.availableSeats} places</p>
                    <button class="btn btn-danger" onclick="cancelRide('${ride._id}')">
                        Annuler
                    </button>
                </div>
            `;
        }).join('');
    };

    /**
     * Met à jour les options de véhicules dans les sélecteurs
     */
    const updateVehicleOptions = () => {
        const select = document.getElementById('ride-vehicle');
        if (!select) return;
        
        select.innerHTML = '<option value="">Sélectionnez un véhicule...</option>';
        vehicles.forEach(vehicle => {
            const vehicleId = vehicle.sql_id || vehicle._id || vehicle.id;
            select.innerHTML += `<option value="${vehicleId}">${vehicle.brand} ${vehicle.model}</option>`;
        });
    };

    /**
     * Supprime un véhicule
     */
    window.deleteVehicle = async (vehicleId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;
        
        try {
            await fetchWithAuth(`${API_BASE_URL}/vehicles/${vehicleId}`, { method: 'DELETE' });
            showNotification('Véhicule supprimé !', 'success');
            loadVehicles();
        } catch (error) {
            showNotification(`Erreur: ${error.message}`, 'error');
        }
    };

    /**
     * Annule un trajet
     */
    window.cancelRide = async (rideId) => {
        if (!confirm('Êtes-vous sûr de vouloir annuler ce trajet ?')) return;
        
        try {
            await fetchWithAuth(`${API_BASE_URL}/rides/${rideId}`, { method: 'DELETE' });
            showNotification('Trajet annulé !', 'success');
            loadRides();
            loadCreditBalance();
        } catch (error) {
            showNotification(`Erreur: ${error.message}`, 'error');
        }
    };

    /**
     * Affiche/masque les modales
     */
    window.showAddVehicleModal = () => {
        const modal = document.getElementById('add-vehicle-modal');
        if (modal) modal.style.display = 'block';
    };

    window.showCreateRideModal = () => {
        const modal = document.getElementById('create-ride-modal');
        if (modal) modal.style.display = 'block';
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    };

    // Initialisation
    checkDriverAuthentication().then(isAuthorized => {
        if (isAuthorized) {
            loadCreditBalance();
            loadVehicles();
            loadRides();
        }
    });
});
