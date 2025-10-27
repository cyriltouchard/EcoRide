/**
 * EcoRide - Script principal
 * Fichier original complet, avec corrections ciblées pour la gestion des véhicules, 
 * des statuts de trajet et de la réservation de place.
 */

// Configuration centralisée des URLs
const API_BASE_URL = 'http://localhost:3000/api';

// Fonction globale pour les requêtes authentifiées
const createFetchWithAuth = (token) => {
    return async (url, options = {}) => {
        console.log('🔵 Requête authentifiée:', url, 'Token présent:', !!token);
        const headers = { ...options.headers, 'Content-Type': 'application/json', 'x-auth-token': token };
        const response = await fetch(url, { ...options, headers });
        
        console.log('📡 Réponse:', response.status, response.statusText);
        
        // Tenter de parser le JSON, sinon retourner null
        let data = null;
        try {
            const text = await response.text();
            data = text ? JSON.parse(text) : null;
            console.log('📦 Data reçue:', data);
        } catch (e) {
            console.error('❌ Erreur de parsing JSON:', e);
        }
        
        if (!response.ok) {
            console.error('❌ Erreur HTTP:', response.status, data?.message);
            if (response.status === 401) {
                console.warn('⚠️ Token invalide - déconnexion');
                localStorage.removeItem('token');
                window.location.href = 'connexion.html';
            }
            throw new Error(data?.message || `Erreur ${response.status}`);
        }
        return data;
    };
};

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. LOGIQUES GLOBALES (exécutées sur toutes les pages)
    // =========================================================================
    
    /**
     * Affiche une notification non bloquante à l'écran.
     * Remplace les alert() pour une meilleure expérience utilisateur.
     */
    const showNotification = (message, type = 'info') => {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = sanitizeHTML(message); // Sécurisation XSS
        container.appendChild(notification);
        setTimeout(() => {
            if(notification) notification.remove();
        }, 5000);
    };

    /**
     * Fonction de protection XSS - Nettoie le HTML dangereux
     */
    const sanitizeHTML = (str) => {
        if (typeof str !== 'string') return str;
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    /**
     * Validation et nettoyage des entrées utilisateur
     */
    const validateAndSanitizeInput = (input, maxLength = 500) => {
        if (typeof input !== 'string') return '';
        
        // Supprimer les scripts malveillants
        let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Supprimer les événements JavaScript
        cleaned = cleaned.replace(/on\w+="[^"]*"/gi, '');
        cleaned = cleaned.replace(/on\w+='[^']*'/gi, '');
        
        // Limiter la longueur
        cleaned = cleaned.substring(0, maxLength);
        
        // Échapper les caractères HTML
        return sanitizeHTML(cleaned);
    };

    // --- GESTION DE LA NAVIGATION DYNAMIQUE ---
    const token = localStorage.getItem('token');
    const guestNavButton = document.getElementById('guest-nav-button');
    const userNavLinks = document.getElementById('user-nav-links');
    const userNavDashboard = document.getElementById('user-nav-dashboard');
    const userNavButton = document.getElementById('user-nav-button');
    const logoutButton = document.getElementById('logout-button');

    if (guestNavButton) {
        if (token) {
            guestNavButton.classList.add('hidden');
        } else {
            guestNavButton.classList.remove('hidden');
        }
    }
    
    if (userNavLinks) {
        if (token) {
            userNavLinks.classList.remove('hidden');
        } else {
            userNavLinks.classList.add('hidden');
        }
    }
    
    if (userNavDashboard) {
        if (token) {
            userNavDashboard.classList.remove('hidden');
        } else {
            userNavDashboard.classList.add('hidden');
        }
    }
    
    if (userNavButton) {
        if (token) {
            userNavButton.classList.remove('hidden');
        } else {
            userNavButton.classList.add('hidden');
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            showNotification("Vous avez été déconnecté.", "success");
            setTimeout(() => window.location.href = 'index.html', 1500);
        });
    }

    // --- MENU HAMBURGER (RESPONSIVE) ---
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        document.addEventListener('click', (event) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(event.target) && !hamburger.contains(event.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    // --- SCROLL REVEAL ANIMATION ---
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(element => observer.observe(element));
    }


    // =========================================================================
    // 2. LOGIQUES SPÉCIFIQUES AUX PAGES
    // =========================================================================

    // --- LOGIQUE POUR LA PAGE creation-compte.html ---
    if (document.body.classList.contains('creation-compte-page')) {
        const registerForm = document.querySelector('.auth-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const pseudo = document.getElementById('pseudo').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                try {
                    const response = await fetch(`${API_BASE_URL}/users/register`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ pseudo, email, password }),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || 'Une erreur est survenue.');
                    showNotification('Inscription réussie ! Vous allez être redirigé.', 'success');
                    localStorage.setItem('token', data.data.token);
                    setTimeout(() => window.location.href = 'espace-utilisateur.html', 1500);
                } catch (error) {
                    showNotification(`Erreur : ${error.message}`, 'error');
                }
            });
        }
    }

    // --- LOGIQUE POUR LA PAGE connexion.html ---
    if (document.body.classList.contains('connexion-page')) {
        const loginForm = document.querySelector('.auth-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                try {
                    const response = await fetch(`${API_BASE_URL}/users/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || 'Identifiants invalides.');
                    showNotification('Connexion réussie ! Bienvenue.', 'success');
                    localStorage.setItem('token', data.data.token);
                    setTimeout(() => window.location.href = 'espace-utilisateur.html', 1500);
                } catch (error) {
                    showNotification(`Erreur : ${error.message}`, 'error');
                }
            });
        }
    }

    // --- PAGE: espace-utilisateur.html ---
    if (document.body.classList.contains('dashboard-page')) {
        const userToken = localStorage.getItem('token');
        if (!userToken) {
            window.location.href = 'connexion.html';
            return;
        }

        const fetchWithAuth = createFetchWithAuth(userToken);

        const fetchUserData = async () => {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/users/me`);
                const data = response.data || response; // Support both formats
                if (document.getElementById('user-pseudo')) document.getElementById('user-pseudo').textContent = data.pseudo;
                if (document.getElementById('user-email')) document.getElementById('user-email').textContent = data.email;
                if (document.getElementById('user-credits')) document.getElementById('user-credits').textContent = data.credits || 0;
                if (document.getElementById('user-pseudo-welcome')) document.getElementById('user-pseudo-welcome').textContent = data.pseudo;
            } catch (error) {
                showNotification(`Erreur chargement profil: ${error.message}`, 'error');
            }
        };

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

        // Définir addRideActionListeners AVANT loadRides
        const addRideActionListeners = (type) => {
            const selector = type === 'offered' ? '.cancel-ride-btn' : '.cancel-booking-btn';
            document.querySelectorAll(selector).forEach(button => {
                button.addEventListener('click', async (event) => {
                    const action = type === 'offered' ? 'trajet' : 'réservation';
                    if (confirm(`Êtes-vous sûr de vouloir annuler cette ${action} ?`)) {
                        try {
                            await fetchWithAuth(`${API_BASE_URL}/rides/${event.target.dataset.id}`, { method: 'DELETE' });
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
                    // Filtrer les trajets annulés
                    const activeRides = data.rides.filter(ride => ride.status !== 'cancelled' && ride.status !== 'annule');
                    
                    if (activeRides.length > 0) {
                        noMsg.style.display = 'none';
                        activeRides.forEach(ride => {
                            const date = new Date(ride.departureDate).toLocaleDateString('fr-FR');
                            const statusText = statusMap[ride.status] || ride.status;
                            // Autoriser l'annulation pour les statuts "en_attente" et "scheduled"
                            const isCancellable = ride.status === 'scheduled' || ride.status === 'en_attente';
                            
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
                                cardHtml = `
                                    <div class="ride-card-content">
                                        <h3>${ride.departure} → ${ride.arrival}</h3>
                                        <p>Avec ${ride.driver.pseudo}</p>
                                        <p>Date: ${date}</p>
                                        <p>Statut: ${statusText}</p>
                                    </div>
                                    <div class="ride-actions">
                                        <button class="cancel-booking-btn button button-danger" data-id="${ride._id}" ${!isCancellable ? 'disabled' : ''}>Annuler</button>
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
        
        // Gestionnaires d'ajout et modification de véhicules
        const addModal = document.getElementById('add-vehicle-modal');
        const editModal = document.getElementById('edit-vehicle-modal');
        const addForm = document.getElementById('add-vehicle-form-modal');
        const editForm = document.getElementById('edit-vehicle-form-modal');

        if (addModal && editModal && addForm && editForm) {
            document.getElementById('add-vehicle-btn').addEventListener('click', () => addModal.classList.add('active'));
            document.getElementById('close-modal-btn').addEventListener('click', () => addModal.classList.remove('active'));
            document.getElementById('close-edit-modal-btn').addEventListener('click', () => editModal.classList.remove('active'));
            window.addEventListener('click', (e) => {
                if (e.target === addModal) addModal.classList.remove('active');
                if (e.target === editModal) editModal.classList.remove('active');
            });

            addForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                
                // Transformer les données pour le backend
                const vehicleData = {
                    brand: formData.get('brand'),
                    model: formData.get('model'),
                    license_plate: formData.get('plate'), // plate → license_plate
                    energy_type: formData.get('energy').toLowerCase(), // Convertir en minuscules
                    available_seats: parseInt(formData.get('seats')), // seats → available_seats
                    color: 'Non spécifié', // Champ obligatoire
                    first_registration: new Date().toISOString().split('T')[0] // Date du jour
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
                
                // Transformer les données pour le backend (même format que la création)
                const vehicleData = {
                    brand: formData.get('brand'),
                    model: formData.get('model'),
                    license_plate: formData.get('plate'), // plate → license_plate
                    energy_type: formData.get('energy').toLowerCase(), // Convertir en minuscules
                    available_seats: parseInt(formData.get('seats')), // seats → available_seats
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

        const tabs = document.querySelectorAll('.tab-button');
        const contents = document.querySelectorAll('.tab-content');
        if (tabs.length > 0) {
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    contents.forEach(c => c.classList.remove('active'));
                    tab.classList.add('active');
                    document.getElementById(tab.dataset.tab).classList.add('active');
                    if (tab.dataset.tab === 'tab-vehicles') loadUserVehicles();
                    if (tab.dataset.tab === 'tab-offered-rides') loadRides('offered');
                    if (tab.dataset.tab === 'tab-booked-rides') loadRides('booked');
                });
            });
            fetchUserData();
            const profileTab = document.querySelector('.tab-button[data-tab="tab-profile"]');
            if (profileTab) {
                profileTab.click();
            }
        }

        // ========== GESTION DU PROFIL UTILISATEUR ==========
        
        // Modale de modification de la photo de profil
        const pictureModal = document.getElementById('picture-modal');
        const editPictureBtn = document.getElementById('edit-picture-btn');
        const closePictureModalBtn = document.getElementById('close-picture-modal-btn');
        const pictureForm = document.getElementById('picture-form');

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
                const imageUrl = document.getElementById('profileImageUrl').value;
                
                try {
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

        // Modale de modification du profil
        const editProfileModal = document.getElementById('edit-profile-modal');
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const closeEditProfileModalBtn = document.getElementById('close-edit-profile-modal-btn');
        const editProfileForm = document.getElementById('edit-profile-form');

        if (editProfileBtn && editProfileModal) {
            editProfileBtn.addEventListener('click', async () => {
                // Charger les données actuelles de l'utilisateur
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
                    
                    // Mettre à jour l'affichage
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
    }

    // --- PAGE: proposer-covoiturage.html ---
    if (document.body.classList.contains('offer-ride-page')) {
        const userToken = localStorage.getItem('token');
        if (!userToken) {
            showNotification("Vous devez être connecté pour accéder à cette page.", "error");
            return setTimeout(() => window.location.href = 'connexion.html', 2000);
        }

        const fetchWithAuth = createFetchWithAuth(userToken);

        const vehicleSelect = document.getElementById('vehicleSelect');
        const noVehicleMessage = document.getElementById('no-vehicle-message');
        const offerRideForm = document.getElementById('offer-ride-form');

        const loadUserVehiclesForRide = async () => {
            if (!vehicleSelect || !noVehicleMessage) return;
            try {
                const data = await fetchWithAuth(`${API_BASE_URL}/vehicles/me`);
                console.log('🚗 Véhicules chargés:', data.vehicles);
                if (data.vehicles && data.vehicles.length > 0) {
                    vehicleSelect.innerHTML = '<option value="" disabled selected>-- Sélectionnez votre véhicule --</option>';
                    data.vehicles.forEach(vehicle => {
                        // Utiliser sql_id (MySQL) au lieu de _id (MongoDB)
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

        loadUserVehiclesForRide();

        if (offerRideForm) {
            offerRideForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                const formData = new FormData(offerRideForm);
                
                // Transformer les données pour correspondre au format attendu par le backend
                const departureDate = formData.get('departureDate');
                const departureTime = formData.get('departureTime');
                const departure_datetime = `${departureDate} ${departureTime}:00`;
                
                const rideData = {
                    vehicle_id: formData.get('vehicleId'),
                    departure_city: formData.get('departure'),
                    arrival_city: formData.get('arrival'),
                    departure_address: formData.get('departure'), // Utiliser la ville comme adresse
                    arrival_address: formData.get('arrival'),
                    departure_datetime: departure_datetime,
                    estimated_arrival: departure_datetime, // À améliorer plus tard
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
    }

    // --- PAGE: covoiturages.html ---
    if (document.body.classList.contains('covoiturages-page')) {
        const mainSearchForm = document.getElementById('main-search-form');
        const searchResultsList = document.getElementById('search-results-list');
        const noSearchResultsMessage = document.getElementById('no-search-results');
        let allRides = [];

        const displaySearchResults = (rides) => {
            if (!searchResultsList || !noSearchResultsMessage) return;
            searchResultsList.innerHTML = '';
            if (!rides || rides.length === 0) {
                noSearchResultsMessage.style.display = 'block';
                return;
            }
            noSearchResultsMessage.style.display = 'none';
            rides.forEach(ride => {
                const date = new Date(ride.departureDate).toLocaleDateString('fr-FR');
                searchResultsList.innerHTML += `<div class="covoiturage-card"><div class="card-header"><img src="public/images/driver-default.jpeg" alt="Photo" class="driver-photo"><div class="driver-info"><strong>${ride.driver.pseudo}</strong></div></div><div class="card-body"><p><strong>Trajet:</strong> ${ride.departure} → ${ride.arrival}</p><p><strong>Date:</strong> ${date} à ${ride.departureTime}</p><p><strong>Prix:</strong> ${ride.price} €</p><a href="details-covoiturage.html?id=${ride._id}" class="details-button">Détails</a></div></div>`;
            });
        };

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
    }

    // --- PAGE: details-covoiturage.html ---
    if (document.body.classList.contains('details-page')) {
        const rideId = new URLSearchParams(window.location.search).get('id');
        if (!rideId) {
            document.querySelector('main').innerHTML = `<h1>Trajet non trouvé</h1>`;
            return;
        }

        const fetchWithAuth = async (url, options = {}) => {
            const userToken = localStorage.getItem('token');
            if (!userToken) return fetch(url, options).then(r => r.json());
            return createFetchWithAuth(userToken)(url, options);
        };

        const loadRideDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/rides/${rideId}`);
                const ride = await response.json();
                if (!response.ok) throw new Error(ride.msg || "Trajet non trouvé");

                document.getElementById('ride-departure').textContent = ride.departure;
                document.getElementById('ride-arrival').textContent = ride.arrival;
                document.getElementById('ride-date').textContent = new Date(ride.departureDate).toLocaleDateString('fr-FR');
                document.getElementById('ride-time').textContent = ride.departureTime;
                document.getElementById('ride-price').textContent = ride.price;
                document.getElementById('ride-seats').textContent = ride.availableSeats;
                document.getElementById('driver-name').textContent = ride.driver.pseudo;
                document.getElementById('vehicle-model').textContent = ride.vehicle.model;
                document.getElementById('vehicle-brand').textContent = ride.vehicle.brand;
                const button = document.getElementById('participate-button');
                if (ride.availableSeats <= 0) {
                    button.disabled = true;
                    button.textContent = "Complet";
                }
            } catch (error) {
                showNotification(`Erreur de chargement: ${error.message}`, 'error');
            }
        };

        document.getElementById('participate-button').addEventListener('click', async () => {
            const userToken = localStorage.getItem('token');
            if (!userToken) {
                showNotification("Veuillez vous connecter pour participer.", "info");
                return setTimeout(() => window.location.href = 'connexion.html', 2000);
            }
            try {
                // CORRECTION: Ajouter le body avec le nombre de places à réserver
                await fetchWithAuth(`${API_BASE_URL}/rides/${rideId}/book`, { 
                    method: 'POST',
                    body: JSON.stringify({ seatsToBook: 1 }) // Le back-end attend de savoir combien de places on réserve
                });
                showNotification("Réservation réussie !", "success");
                const button = document.getElementById('participate-button');
                button.textContent = "Réservé !";
                button.disabled = true;
                const seatsEl = document.getElementById('ride-seats');
                seatsEl.textContent = parseInt(seatsEl.textContent) - 1;
            } catch (error) {
                showNotification(`Erreur: ${error.message}`, 'error');
            }
        });
        
        loadRideDetails();
    }
    // =========================================================================
    // PAGE D'ACHAT DE CRÉDITS
    // =========================================================================

    if (document.querySelector('.buy-credits-page')) {
        const currentCreditsSpan = document.getElementById('current-credits');
        const buyButtons = document.querySelectorAll('.buy-button');
        const paymentModal = document.getElementById('payment-modal');
        const closePaymentModal = document.getElementById('close-payment-modal');
        const paymentForm = document.getElementById('payment-form');
        const cardPaymentFields = document.getElementById('card-payment-fields');
        const paypalPaymentFields = document.getElementById('paypal-payment-fields');
        const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');

        let selectedPackage = null;

        // Charger le solde de crédits actuel
        const loadCurrentCredits = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                if (currentCreditsSpan) {
                    currentCreditsSpan.textContent = '0 crédit';
                }
                showNotification('Veuillez vous connecter pour voir votre solde', 'warning');
                setTimeout(() => window.location.href = 'connexion.html', 2000);
                return;
            }

            try {
                const fetchWithAuth = createFetchWithAuth(token);
                const response = await fetchWithAuth(`${API_BASE_URL}/users/me`);
                
                if (response && response.user) {
                    const credits = response.user.credits || 0;
                    if (currentCreditsSpan) {
                        currentCreditsSpan.textContent = `${credits} crédit${credits > 1 ? 's' : ''}`;
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement des crédits:', error);
                if (currentCreditsSpan) {
                    currentCreditsSpan.textContent = '0 crédit';
                }
            }
        };

        // Ouvrir la modale de paiement
        const openPaymentModal = (packageData) => {
            selectedPackage = packageData;
            
            document.getElementById('summary-package').textContent = packageData.name;
            document.getElementById('summary-credits').textContent = `${packageData.credits} crédits`;
            document.getElementById('summary-price').textContent = `${packageData.price} €`;
            
            paymentModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        // Fermer la modale
        const closeModal = () => {
            paymentModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            paymentForm.reset();
        };

        // Gestion des boutons d'achat
        buyButtons.forEach(button => {
            button.addEventListener('click', () => {
                const packageName = button.getAttribute('data-package');
                const credits = parseInt(button.getAttribute('data-credits'));
                const price = parseFloat(button.getAttribute('data-price'));
                
                const packageNames = {
                    'discovery': 'Pack Découverte',
                    'standard': 'Pack Standard',
                    'premium': 'Pack Premium'
                };
                
                openPaymentModal({
                    type: packageName,
                    name: packageNames[packageName],
                    credits: credits,
                    price: price
                });
            });
        });

        // Fermer la modale
        if (closePaymentModal) {
            closePaymentModal.addEventListener('click', closeModal);
        }

        paymentModal?.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                closeModal();
            }
        });

        // Basculer entre les méthodes de paiement
        paymentMethodRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'card') {
                    cardPaymentFields.style.display = 'block';
                    paypalPaymentFields.style.display = 'none';
                } else {
                    cardPaymentFields.style.display = 'none';
                    paypalPaymentFields.style.display = 'block';
                }
            });
        });

        // Format du numéro de carte
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        // Format de la date d'expiration
        const cardExpiryInput = document.getElementById('card-expiry');
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // Soumettre le paiement
        if (paymentForm) {
            paymentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (!selectedPackage) {
                    showNotification('Erreur: aucun pack sélectionné', 'danger');
                    return;
                }

                const token = localStorage.getItem('token');
                if (!token) {
                    showNotification('Veuillez vous connecter', 'warning');
                    window.location.href = 'connexion.html';
                    return;
                }

                const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
                
                // Validation des champs selon la méthode
                if (paymentMethod === 'card') {
                    const cardNumber = document.getElementById('card-number').value;
                    const cardExpiry = document.getElementById('card-expiry').value;
                    const cardCvv = document.getElementById('card-cvv').value;
                    const cardName = document.getElementById('card-name').value;
                    
                    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
                        showNotification('Veuillez remplir tous les champs de la carte', 'warning');
                        return;
                    }
                    
                    // Validation simple du numéro de carte (16 chiffres)
                    if (cardNumber.replace(/\s/g, '').length !== 16) {
                        showNotification('Numéro de carte invalide (16 chiffres requis)', 'danger');
                        return;
                    }
                    
                    // Validation de la date d'expiration
                    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                        showNotification('Format de date invalide (MM/AA)', 'danger');
                        return;
                    }
                    
                    // Validation du CVV
                    if (!/^\d{3}$/.test(cardCvv)) {
                        showNotification('CVV invalide (3 chiffres requis)', 'danger');
                        return;
                    }
                }

                try {
                    const fetchWithAuth = createFetchWithAuth(token);
                    
                    // Simuler un délai de traitement
                    showNotification('Traitement du paiement en cours...', 'info');
                    
                    const response = await fetchWithAuth(`${API_BASE_URL}/credits/purchase`, {
                        method: 'POST',
                        body: JSON.stringify({
                            packageType: selectedPackage.type,
                            credits: selectedPackage.credits,
                            amount: selectedPackage.price,
                            paymentMethod: paymentMethod
                        })
                    });

                    if (response && response.success) {
                        closeModal();
                        showNotification(`✅ Paiement réussi ! Vous avez reçu ${selectedPackage.credits} crédits`, 'success');
                        
                        // Recharger le solde
                        setTimeout(() => {
                            loadCurrentCredits();
                        }, 1000);
                    } else {
                        showNotification('Erreur lors du paiement', 'danger');
                    }
                } catch (error) {
                    console.error('Erreur paiement:', error);
                    showNotification(error.message || 'Erreur lors du traitement du paiement', 'danger');
                }
            });
        }

        // Charger le solde au chargement de la page
        loadCurrentCredits();
    }
});





