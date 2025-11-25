/**
 * EcoRide - Page de proposition de covoiturage
 * Gestion de la création de nouveaux trajets
 * @file proposer-covoiturage.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('offer-ride-page')) return;
    
    console.log('🚗 Page proposition de covoiturage initialisée');
    
    const userToken = localStorage.getItem('token');
    
    if (!userToken) {
        showNotification("Vous devez être connecté pour accéder à cette page.", "error");
        return setTimeout(() => window.location.href = 'connexion.html', 2000);
    }

    const fetchWithAuth = createFetchWithAuth(userToken);
    const vehicleSelect = document.getElementById('vehicleSelect');
    const noVehicleMessage = document.getElementById('no-vehicle-message');
    const offerRideForm = document.getElementById('offer-ride-form');

    /**
     * Charge les véhicules de l'utilisateur
     */
    const loadUserVehiclesForRide = async () => {
        if (!vehicleSelect || !noVehicleMessage) return;
        
        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/vehicles/me`);
            console.log('🚗 Véhicules chargés:', data.vehicles);
            
            if (data.vehicles && data.vehicles.length > 0) {
                vehicleSelect.innerHTML = '<option value="" disabled selected>-- Sélectionnez votre véhicule --</option>';
                
                data.vehicles.forEach(vehicle => {
                    const vehicleId = vehicle.sql_id || vehicle._id;
                    console.log(`  - ${vehicle.brand} ${vehicle.model}: sql_id=${vehicle.sql_id}, _id=${vehicle._id}, utilisé=${vehicleId}`);
                    vehicleSelect.innerHTML += `<option value="${vehicleId}">${vehicle.brand} ${vehicle.model} (${vehicle.plate})</option>`;
                });
                
                noVehicleMessage.style.display = 'none';
                vehicleSelect.style.display = 'block';
            } else {
                vehicleSelect.innerHTML = '';
                noVehicleMessage.style.display = 'block';
                vehicleSelect.style.display = 'none';
            }
        } catch (error) {
            showNotification(`Erreur chargement véhicules: ${error.message}`, 'error');
        }
    };

    /**
     * Gestion du formulaire de proposition
     */
    if (offerRideForm) {
        // Ajouter un avertissement dynamique pour le prix
        const priceInput = document.getElementById('price');
        if (priceInput) {
            priceInput.addEventListener('input', (e) => {
                const price = parseFloat(e.target.value);
                const warningDiv = document.getElementById('price-warning');
                
                if (price > 0 && price <= 2) {
                    if (!warningDiv) {
                        const warning = document.createElement('p');
                        warning.id = 'price-warning';
                        warning.className = 'error-message';
                        warning.style.color = '#e74c3c';
                        warning.style.marginTop = '5px';
                        warning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ⚠️ Vous ne recevrez aucun crédit avec ce prix (commission plateforme de 2 crédits)';
                        priceInput.parentElement.appendChild(warning);
                    }
                } else if (warningDiv) {
                    warningDiv.remove();
                }
            });
        }
        
        offerRideForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(offerRideForm);
            
            const departureDate = formData.get('departureDate');
            const departureTime = formData.get('departureTime');
            const departure_datetime = `${departureDate} ${departureTime}:00`;
            
            const rideData = {
                vehicle_id: formData.get('vehicleId'),
                departure_city: formData.get('departure'),
                arrival_city: formData.get('arrival'),
                departure_address: formData.get('departure'),
                arrival_address: formData.get('arrival'),
                departure_datetime: departure_datetime,
                estimated_arrival: departure_datetime,
                price_per_seat: parseFloat(formData.get('price')),
                available_seats: parseInt(formData.get('availableSeats'), 10)
            };
            
            console.log('📤 Données envoyées:', rideData);
            
            if (!rideData.vehicle_id) {
                return showNotification("Veuillez sélectionner un véhicule.", "error");
            }
            
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/rides`, {
                    method: 'POST',
                    body: JSON.stringify(rideData)
                });
                
                console.log('✅ Trajet créé:', response);
                showNotification('Covoiturage proposé avec succès !', 'success');
                setTimeout(() => window.location.href = 'espace-utilisateur.html', 1500);
            } catch (error) {
                console.error('❌ Erreur création trajet:', error);
                showNotification(`Erreur : ${error.message}`, 'error');
            }
        });
    }

    // Charger les véhicules au démarrage
    loadUserVehiclesForRide();
});
