/**
 * EcoRide - Espace utilisateur
 * Gestion du dashboard utilisateur (profil, véhicules, trajets, notes)
 * @file espace-utilisateur.js
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('dashboard-page')) return;
    
    console.log('👤 Page espace utilisateur initialisée');
    
    const userToken = localStorage.getItem('token');
    if (!userToken) {
        window.location.href = 'connexion.html';
        return;
    }

    const fetchWithAuth = createFetchWithAuth(userToken);

    /**
     * Charge le nombre de trajets à noter
     */
    const loadPendingReviews = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/eligible-rides`, {
                headers: { 'x-auth-token': userToken }
            });
            
            if (response.ok) {
                const data = await response.json();
                const count = data.rides ? data.rides.length : 0;
                
                const banner = document.getElementById('pending-reviews-banner');
                const countText = document.getElementById('pending-count');
                
                if (count > 0 && banner && countText) {
                    countText.textContent = `${count} trajet${count > 1 ? 's' : ''} à noter`;
                    banner.style.display = 'block';
                }
            }
        } catch (error) {
            console.log('Erreur chargement avis en attente:', error);
        }
    };

    /**
     * Charge les données utilisateur
     */
    const fetchUserData = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/users/me`);
            const data = response.data || response;
            
            if (document.getElementById('user-pseudo')) document.getElementById('user-pseudo').textContent = data.pseudo;
            if (document.getElementById('user-email')) document.getElementById('user-email').textContent = data.email;
            if (document.getElementById('user-credits')) document.getElementById('user-credits').textContent = data.credits || 0;
            if (document.getElementById('user-pseudo-welcome')) document.getElementById('user-pseudo-welcome').textContent = data.pseudo;
            if (document.getElementById('user-pseudo-profile')) document.getElementById('user-pseudo-profile').textContent = data.pseudo;
            if (document.getElementById('user-email-profile')) document.getElementById('user-email-profile').textContent = data.email;
            
            if (data.profile_picture && document.getElementById('profile-picture')) {
                document.getElementById('profile-picture').src = data.profile_picture;
            }
        } catch (error) {
            showNotification(`Erreur chargement profil: ${error.message}`, 'error');
        }
    };

    /**
     * Charge les véhicules de l'utilisateur
     */
    const loadUserVehicles = async () => {
        const container = document.getElementById('vehicle-list');
        const noMsg = document.getElementById('no-vehicles-message');
        if (!container || !noMsg) return;

        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/vehicles/me`);
            container.innerHTML = '';
            
            if (data.vehicles && data.vehicles.length > 0) {
                noMsg.style.display = 'none';
                data.vehicles.forEach(v => {
                    container.innerHTML += `<div class="vehicle-card" data-brand="${v.brand}" data-model="${v.model}" data-plate="${v.plate}" data-energy="${v.energy}" data-seats="${v.seats}"><h3>${v.brand} ${v.model}</h3><p>Immatriculation: ${v.plate}</p><p>Énergie: ${v.energy}</p><p>Nombre de sièges: ${v.seats}</p><div class="vehicle-actions"><button class="edit-vehicle-btn button button-secondary" data-id="${v._id}">Modifier</button><button class="delete-vehicle-btn button button-danger" data-id="${v._id}">Supprimer</button></div></div>`;
                });
            } else {
                noMsg.style.display = 'block';
            }
            addVehicleActionListeners();
        } catch (error) {
            showNotification(`Erreur chargement véhicules: ${error.message}`, 'error');
        }
    };

    /**
     * Ajoute les listeners sur les boutons d'action des véhicules
     */
    const addVehicleActionListeners = () => {
        document.querySelectorAll('.edit-vehicle-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const cardData = event.target.closest('.vehicle-card').dataset;
                openEditModal(event.target.dataset.id, cardData);
            });
        });

        document.querySelectorAll('.delete-vehicle-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                if (confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
                    try {
                        await fetchWithAuth(`${API_BASE_URL}/vehicles/${event.target.dataset.id}`, { method: 'DELETE' });
                        showNotification('Véhicule supprimé.', 'success');
                        loadUserVehicles();
                    } catch (error) {
                        showNotification(`Erreur : ${error.message}`, 'error');
                    }
                }
            });
        });
    };

    /**
     * Ajoute les listeners sur les boutons d'action des trajets
     */
    const addRideActionListeners = (type) => {
        const selector = type === 'offered' ? '.cancel-ride-btn' : '.cancel-booking-btn';
        document.querySelectorAll(selector).forEach(button => {
            button.addEventListener('click', async (event) => {
                const action = type === 'offered' ? 'trajet' : 'réservation';
                if (confirm(`Êtes-vous sûr de vouloir annuler cette ${action} ?`)) {
                    try {
                        if (type === 'offered') {
                            await fetchWithAuth(`${API_BASE_URL}/rides/${event.target.dataset.id}`, { method: 'DELETE' });
                        } else {
                            await fetchWithAuth(`${API_BASE_URL}/rides/bookings/${event.target.dataset.id}`, { method: 'DELETE' });
                        }
                        showNotification(`${action.charAt(0).toUpperCase() + action.slice(1)} annulé(e).`, 'success');
                        loadRides('offered');
                        loadRides('booked');
                    } catch (error) {
                        showNotification(`Erreur : ${error.message}`, 'error');
                    }
                }
            });
        });
    };

    /**
     * Charge les trajets (proposés ou réservés)
     */
    const loadRides = async (type) => {
        const listId = type === 'offered' ? 'offered-rides-list' : 'booked-rides-list';
        const noItemsId = type === 'offered' ? 'no-offered-rides' : 'no-booked-rides';
        const container = document.getElementById(listId);
        const noMsg = document.getElementById(noItemsId);
        if (!container || !noMsg) return;

        const statusMap = {
            en_attente: 'En attente',
            scheduled: 'Ouvert',
            started: 'En cours',
            completed: 'Terminé',
            cancelled: 'Annulé'
        };

        try {
            const data = await fetchWithAuth(`${API_BASE_URL}/rides/${type}`);
            container.innerHTML = '';
            
            if (data.rides && data.rides.length > 0) {
                const activeRides = data.rides.filter(ride => ride.status !== 'cancelled' && ride.status !== 'annule');
                
                if (activeRides.length > 0) {
                    noMsg.style.display = 'none';
                    activeRides.forEach(ride => {
                        const date = new Date(ride.departureDate).toLocaleDateString('fr-FR');
                        const statusText = statusMap[ride.status] || ride.status;
                        
                        let isCancellable = false;
                        if (type === 'offered') {
                            isCancellable = ride.status === 'scheduled' || ride.status === 'en_attente';
                        } else {
                            isCancellable = ride.status === 'confirme' || ride.status === 'scheduled' || ride.status === 'en_attente';
                        }
                        
                        let cardHtml = '';
                        if (type === 'offered') {
                            cardHtml = `
                                <div class="ride-card-content">
                                    <h3>${ride.departure} → ${ride.arrival}</h3>
                                    <p>Date et heure: ${date} à ${ride.departureTime}</p>
                                    <p>Statut: ${statusText}</p>
                                </div>
                                <div class="ride-actions">
                                    <button class="cancel-ride-btn button button-danger" data-id="${ride._id}" ${!isCancellable ? 'disabled' : ''}>Annuler</button>
                                </div>`;
                        } else {
                            // Vérifier si le trajet est terminé et peut être noté
                            const isCompleted = ride.status === 'completed' || ride.status === 'termine';
                            const canRate = isCompleted && ride.driver && ride.driver.id;
                            
                            cardHtml = `
                                <div class="ride-card-content">
                                    <h3>${ride.departure} → ${ride.arrival}</h3>
                                    <p>Avec ${ride.driver.pseudo}</p>
                                    <p>Date: ${date}</p>
                                    <p>Statut: ${statusText}</p>
                                </div>
                                <div class="ride-actions">
                                    <button class="cancel-booking-btn button button-danger" data-id="${ride._id}" ${!isCancellable ? 'disabled' : ''}>Annuler</button>
                                    ${canRate ? `<a href="avis.html" class="button button-primary rate-driver-btn" style="text-decoration: none;">⭐ Noter</a>` : ''}
                                </div>`;
                        }
                        container.innerHTML += `<div class="ride-card">${cardHtml}</div>`;
                    });
                } else {
                    noMsg.style.display = 'block';
                }
            } else {
                noMsg.style.display = 'block';
            }
            addRideActionListeners(type);
        } catch (error) {
            showNotification(`Erreur chargement trajets: ${error.message}`, 'error');
        }
    };
    
    /**
     * Gestion des modales de véhicules
     */
    const addModal = document.getElementById('add-vehicle-modal');
    const editModal = document.getElementById('edit-vehicle-modal');
    const addForm = document.getElementById('add-vehicle-form-modal');
    const editForm = document.getElementById('edit-vehicle-form-modal');

    if (addModal && editModal && addForm && editForm) {
        document.getElementById('add-vehicle-btn')?.addEventListener('click', () => addModal.classList.add('active'));
        document.getElementById('close-modal-btn')?.addEventListener('click', () => addModal.classList.remove('active'));
        document.getElementById('close-edit-modal-btn')?.addEventListener('click', () => editModal.classList.remove('active'));
        
        window.addEventListener('click', (e) => {
            if (e.target === addModal) addModal.classList.remove('active');
            if (e.target === editModal) editModal.classList.remove('active');
        });

        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const vehicleData = {
                brand: formData.get('brand'),
                model: formData.get('model'),
                license_plate: formData.get('plate'),
                energy_type: formData.get('energy').toLowerCase(),
                available_seats: parseInt(formData.get('seats')),
                color: 'Non spécifié',
                first_registration: new Date().toISOString().split('T')[0]
            };
            
            console.log('📤 Véhicule à créer:', vehicleData);
            
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/vehicles`, { 
                    method: 'POST', 
                    body: JSON.stringify(vehicleData) 
                });
                console.log('✅ Véhicule créé:', response);
                showNotification('Véhicule ajouté !', 'success');
                addModal.classList.remove('active');
                e.target.reset();
                loadUserVehicles();
            } catch (error) {
                console.error('❌ Erreur création véhicule:', error);
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        });

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const vehicleId = formData.get('edit-vehicle-id');
            
            const vehicleData = {
                brand: formData.get('brand'),
                model: formData.get('model'),
                license_plate: formData.get('plate'),
                energy_type: formData.get('energy').toLowerCase(),
                available_seats: parseInt(formData.get('seats')),
            };
            
            console.log('📤 Véhicule à modifier:', vehicleId, vehicleData);
            
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/vehicles/${vehicleId}`, { 
                    method: 'PUT', 
                    body: JSON.stringify(vehicleData) 
                });
                console.log('✅ Véhicule modifié:', response);
                showNotification('Véhicule mis à jour !', 'success');
                editModal.classList.remove('active');
                loadUserVehicles();
            } catch (error) {
                console.error('❌ Erreur modification véhicule:', error);
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        });
    }
    
    /**
     * Ouvre la modale d'édition de véhicule
     */
    const openEditModal = (id, data) => {
        if (editForm) {
            editForm.elements['edit-vehicle-id'].value = id;
            editForm.elements['brand'].value = data.brand;
            editForm.elements['model'].value = data.model;
            editForm.elements['plate'].value = data.plate;
            editForm.elements['energy'].value = data.energy;
            editForm.elements['seats'].value = data.seats;
            editModal.classList.add('active');
        }
    };

    /**
     * Charge les notes et avis reçus
     */
    async function loadMyRatings() {
        try {
            const userData = await fetchWithAuth(`${API_BASE_URL}/users/me`);
            const userId = userData.id || userData._id;
            
            const ratingResponse = await fetch(`${API_BASE_URL}/reviews/driver/${userId}/rating`);
            const ratingData = await ratingResponse.json();
            
            const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/driver/${userId}?limit=50`);
            const reviewsData = await reviewsResponse.json();
            
            const statsContainer = document.getElementById('rating-stats');
            const reviewsList = document.getElementById('my-reviews-list');
            const noReviewsMsg = document.getElementById('no-reviews');
            
            if (!statsContainer || !reviewsList || !noReviewsMsg) return;
            
            if (ratingData.success && ratingData.rating && ratingData.rating.total_reviews > 0) {
                const stats = ratingData.rating;
                const stars = '⭐'.repeat(Math.round(stats.avg_rating));
                
                statsContainer.innerHTML = `
                    <div class="rating-overview">
                        <div class="rating-score">
                            <div class="score-number">${stats.avg_rating.toFixed(1)}</div>
                            <div class="score-stars">${stars}</div>
                            <div class="score-count">${stats.total_reviews} avis</div>
                        </div>
                        <div class="rating-breakdown">
                            <div class="rating-criteria">
                                <span>⏰ Ponctualité:</span>
                                <strong>${stats.avg_punctuality ? stats.avg_punctuality.toFixed(1) : 'N/A'}/5</strong>
                            </div>
                            <div class="rating-criteria">
                                <span>🚗 Conduite:</span>
                                <strong>${stats.avg_driving_quality ? stats.avg_driving_quality.toFixed(1) : 'N/A'}/5</strong>
                            </div>
                            <div class="rating-criteria">
                                <span>✨ Propreté:</span>
                                <strong>${stats.avg_vehicle_cleanliness ? stats.avg_vehicle_cleanliness.toFixed(1) : 'N/A'}/5</strong>
                            </div>
                            <div class="rating-criteria">
                                <span>😊 Amabilité:</span>
                                <strong>${stats.avg_friendliness ? stats.avg_friendliness.toFixed(1) : 'N/A'}/5</strong>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                statsContainer.innerHTML = `
                    <div class="no-rating-yet">
                        <p>Vous n'avez pas encore reçu de notes.</p>
                        <p>Proposez des trajets pour commencer à recevoir des avis !</p>
                    </div>
                `;
            }
            
            if (reviewsData.success && reviewsData.reviews && reviewsData.reviews.length > 0) {
                noReviewsMsg.classList.add('hidden');
                reviewsList.innerHTML = reviewsData.reviews.map(review => {
                    const stars = '⭐'.repeat(review.rating);
                    const date = new Date(review.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    });
                    
                    return `
                        <div class="review-item">
                            <div class="review-header">
                                <div>
                                    <strong>${review.passenger_pseudo || 'Passager'}</strong>
                                    <div class="review-stars">${stars}</div>
                                </div>
                                <span class="review-date">${date}</span>
                            </div>
                            ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
                            ${review.departure_city && review.arrival_city ? 
                                `<p class="review-trip"><i class="fas fa-route"></i> ${review.departure_city} → ${review.arrival_city}</p>` 
                                : ''}
                        </div>
                    `;
                }).join('');
            } else {
                noReviewsMsg.classList.remove('hidden');
                reviewsList.innerHTML = '';
            }
            
        } catch (error) {
            console.error('Erreur chargement notes:', error);
            showNotification('Erreur lors du chargement des notes', 'error');
        }
    }

    /**
     * Gestion de la photo de profil
     */
    const pictureModal = document.getElementById('picture-modal');
    const editPictureBtn = document.getElementById('edit-picture-btn');
    const closePictureModalBtn = document.getElementById('close-picture-modal-btn');
    const pictureForm = document.getElementById('picture-form');
    const useFileBtn = document.getElementById('use-file-btn');
    const useUrlBtn = document.getElementById('use-url-btn');
    const fileUploadSection = document.getElementById('file-upload-section');
    const urlUploadSection = document.getElementById('url-upload-section');

    if (useFileBtn && useUrlBtn && fileUploadSection && urlUploadSection) {
        useFileBtn.addEventListener('click', () => {
            fileUploadSection.style.display = 'block';
            urlUploadSection.style.display = 'none';
            useFileBtn.style.background = '#4CAF50';
            useUrlBtn.style.background = '#2196F3';
        });

        useUrlBtn.addEventListener('click', () => {
            fileUploadSection.style.display = 'none';
            urlUploadSection.style.display = 'block';
            useFileBtn.style.background = '#2196F3';
            useUrlBtn.style.background = '#4CAF50';
        });
    }

    if (editPictureBtn && pictureModal) {
        editPictureBtn.addEventListener('click', () => {
            pictureModal.classList.add('active');
        });
    }

    if (closePictureModalBtn && pictureModal) {
        closePictureModalBtn.addEventListener('click', () => {
            pictureModal.classList.remove('active');
        });
    }

    if (pictureModal) {
        window.addEventListener('click', (e) => {
            if (e.target === pictureModal) {
                pictureModal.classList.remove('active');
            }
        });
    }

    if (pictureForm) {
        pictureForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fileInput = document.getElementById('profileImageFile');
            const urlInput = document.getElementById('profileImageUrl');
            
            try {
                let imageUrl = '';
                
                if (fileInput && fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    
                    if (file.size > 5 * 1024 * 1024) {
                        showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
                        return;
                    }
                    
                    const reader = new FileReader();
                    imageUrl = await new Promise((resolve, reject) => {
                        reader.onload = (e) => resolve(e.target.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                } else if (urlInput && urlInput.value) {
                    imageUrl = urlInput.value;
                } else {
                    showNotification('Veuillez sélectionner une image ou entrer une URL', 'warning');
                    return;
                }
                
                const response = await fetchWithAuth(`${API_BASE_URL}/users/profile-picture`, {
                    method: 'PUT',
                    body: JSON.stringify({ profile_picture: imageUrl })
                });
                
                document.getElementById('profile-picture').src = imageUrl;
                showNotification('Photo de profil mise à jour !', 'success');
                pictureModal.classList.remove('active');
                pictureForm.reset();
            } catch (error) {
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        });
    }

    /**
     * Gestion du profil utilisateur
     */
    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const closeEditProfileModalBtn = document.getElementById('close-edit-profile-modal-btn');
    const editProfileForm = document.getElementById('edit-profile-form');

    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener('click', async () => {
            try {
                const data = await fetchWithAuth(`${API_BASE_URL}/users/me`);
                document.getElementById('edit-pseudo').value = data.pseudo || '';
                document.getElementById('edit-email').value = data.email || '';
                document.getElementById('edit-phone').value = data.phone || '';
                document.getElementById('edit-bio').value = data.bio || '';
                editProfileModal.classList.add('active');
            } catch (error) {
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        });
    }

    if (closeEditProfileModalBtn && editProfileModal) {
        closeEditProfileModalBtn.addEventListener('click', () => {
            editProfileModal.classList.remove('active');
        });
    }

    if (editProfileModal) {
        window.addEventListener('click', (e) => {
            if (e.target === editProfileModal) {
                editProfileModal.classList.remove('active');
            }
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const profileData = {
                pseudo: formData.get('pseudo'),
                email: formData.get('email'),
                phone: formData.get('phone') || null,
                bio: formData.get('bio') || null
            };

            console.log('📤 Profil à mettre à jour:', profileData);
            
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
                    method: 'PUT',
                    body: JSON.stringify(profileData)
                });
                
                console.log('✅ Profil mis à jour:', response);
                
                document.getElementById('user-pseudo-profile').textContent = profileData.pseudo;
                document.getElementById('user-email-profile').textContent = profileData.email;
                
                showNotification('Profil mis à jour avec succès !', 'success');
                editProfileModal.classList.remove('active');
            } catch (error) {
                console.error('❌ Erreur modification profil:', error);
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        });
    }

    /**
     * Gestion des onglets
     */
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');
    
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
                
                localStorage.setItem('activeTab', tab.dataset.tab);
                
                if (tab.dataset.tab === 'tab-vehicles') loadUserVehicles();
                if (tab.dataset.tab === 'tab-offered-rides') loadRides('offered');
                if (tab.dataset.tab === 'tab-booked-rides') loadRides('booked');
                if (tab.dataset.tab === 'tab-my-ratings') loadMyRatings();
            });
        });
        
        fetchUserData();
        loadPendingReviews();
        
        const savedTab = localStorage.getItem('activeTab') || 'tab-vehicles';
        const tabToActivate = document.querySelector(`.tab-button[data-tab="${savedTab}"]`);
        
        if (tabToActivate) {
            tabToActivate.click();
        }
    }
});
