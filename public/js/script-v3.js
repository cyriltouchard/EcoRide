/**
 * EcoRide - Script principal
 * Fichier original complet, avec corrections ciblées pour la gestion des véhicules, 
 * des statuts de trajet et de la réservation de place.
 */

// Configuration centralisée des URLs
const API_BASE_URL = 'http://localhost:3000/api';

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

        const fetchWithAuth = async (url, options = {}) => {
            const headers = { ...options.headers, 'Content-Type': 'application/json', 'x-auth-token': userToken };
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = 'connexion.html';
                }
                throw new Error(data.message || 'Erreur serveur.');
            }
            return data;
        };

        const fetchUserData = async () => {
            try {
                const data = await fetchWithAuth(`${API_BASE_URL}/users/me`);
                if (document.getElementById('user-pseudo')) document.getElementById('user-pseudo').textContent = data.pseudo;
                if (document.getElementById('user-email')) document.getElementById('user-email').textContent = data.email;
                if (document.getElementById('user-credits')) document.getElementById('user-credits').textContent = data.credits;
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

        const loadRides = async (type) => {
            const listId = type === 'offered' ? 'offered-rides-list' : 'booked-rides-list';
            const noItemsId = type === 'offered' ? 'no-offered-rides' : 'no-booked-rides';
            const container = document.getElementById(listId);
            const noMsg = document.getElementById(noItemsId);
            if (!container || !noMsg) return;

            const statusMap = {
                scheduled: 'Ouvert',
                started: 'En cours',
                completed: 'Terminé',
                cancelled: 'Annulé'
            };

            try {
                const data = await fetchWithAuth(`${API_BASE_URL}/rides/${type}`);
                container.innerHTML = '';
                if (data.rides && data.rides.length > 0) {
                    noMsg.style.display = 'none';
                    data.rides.forEach(ride => {
                        const date = new Date(ride.departureDate).toLocaleDateString('fr-FR');
                        const statusText = statusMap[ride.status] || ride.status;
                        const isCancellable = ride.status === 'scheduled';
                        
                        let cardHtml = '';
                        if (type === 'offered') {
                            cardHtml = `<h3>${ride.departure} → ${ride.arrival}</h3><p>Date et heure: ${date} à ${ride.departureTime}</p><p>Statut: ${statusText}</p><div class="ride-actions"><button class="cancel-ride-btn button button-danger" data-id="${ride._id}" ${!isCancellable ? 'disabled' : ''}>Annuler le trajet</button></div>`;
                        } else {
                            cardHtml = `<h3>${ride.departure} → ${ride.arrival}</h3><p>Avec ${ride.driver.pseudo}</p><p>Date: ${date}</p><p>Statut: ${statusText}</p><div class="ride-actions"><button class="cancel-booking-btn button button-danger" data-id="${ride._id}" ${!isCancellable ? 'disabled' : ''}>Annuler la réservation</button></div>`;
                        }
                        container.innerHTML += `<div class="ride-card">${cardHtml}</div>`;
                    });
                } else {
                    noMsg.style.display = 'block';
                }
                addRideActionListeners(type);
            } catch (error) {
                showNotification(`Erreur chargement trajets: ${error.message}`, 'error');
            }
        };
        
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
                const data = Object.fromEntries(new FormData(e.target).entries());
                try {
                    await fetchWithAuth(`${API_BASE_URL}/vehicles`, { method: 'POST', body: JSON.stringify(data) });
                    showNotification('Véhicule ajouté !', 'success');
                    addModal.classList.remove('active');
                    e.target.reset();
                    loadUserVehicles();
                } catch (error) {
                    showNotification(`Erreur: ${error.message}`, 'error');
                }
            });

            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.target).entries());
                const vehicleId = data['edit-vehicle-id'];
                delete data['edit-vehicle-id'];
                try {
                    await fetchWithAuth(`${API_BASE_URL}/vehicles/${vehicleId}`, { method: 'PUT', body: JSON.stringify(data) });
                    showNotification('Véhicule mis à jour !', 'success');
                    editModal.classList.remove('active');
                    loadUserVehicles();
                } catch (error) {
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
    }

    // --- PAGE: proposer-covoiturage.html ---
    if (document.body.classList.contains('offer-ride-page')) {
        const userToken = localStorage.getItem('token');
        if (!userToken) {
            showNotification("Vous devez être connecté pour accéder à cette page.", "error");
            return setTimeout(() => window.location.href = 'connexion.html', 2000);
        }

        const fetchWithAuth = async (url, options = {}) => {
            const headers = { ...options.headers, 'Content-Type': 'application/json', 'x-auth-token': userToken };
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = 'connexion.html';
                }
                throw new Error(data.message || 'Erreur serveur.');
            }
            return data;
        };

        const vehicleSelect = document.getElementById('vehicleSelect');
        const noVehicleMessage = document.getElementById('no-vehicle-message');
        const offerRideForm = document.getElementById('offer-ride-form');

        const loadUserVehiclesForRide = async () => {
            if (!vehicleSelect || !noVehicleMessage) return;
            try {
                const data = await fetchWithAuth(`${API_BASE_URL}/vehicles/me`);
                if (data.vehicles && data.vehicles.length > 0) {
                    vehicleSelect.innerHTML = '<option value="" disabled selected>-- Sélectionnez votre véhicule --</option>';
                    data.vehicles.forEach(vehicle => {
                        vehicleSelect.innerHTML += `<option value="${vehicle._id}">${vehicle.brand} ${vehicle.model} (${vehicle.plate})</option>`;
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
                const rideData = {
                    ...Object.fromEntries(formData.entries()),
                    price: parseFloat(formData.get('price')),
                    availableSeats: parseInt(formData.get('availableSeats'), 10),
                    isEcologic: formData.get('isEcologic') === 'on'
                };
                if (!rideData.vehicleId) {
                    return showNotification("Veuillez sélectionner un véhicule.", "error");
                }
                try {
                    await fetchWithAuth(`${API_BASE_URL}/rides`, {
                        method: 'POST',
                        body: JSON.stringify(rideData)
                    });
                    showNotification('Covoiturage proposé avec succès !', 'success');
                    setTimeout(() => window.location.href = 'espace-utilisateur.html', 1500);
                } catch (error) {
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
            const headers = { ...options.headers, 'Content-Type': 'application/json' };
            if(userToken) headers['x-auth-token'] = userToken;
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Erreur serveur.');
            return data;
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
    // 10. GESTION DU CHAT EN DIRECT
    // =========================================================================
    
    const chatWidget = document.getElementById('chat-widget');
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Ouvrir le chat
    if (chatToggleBtn) {
        chatToggleBtn.addEventListener('click', () => {
            if (chatWidget) {
                chatWidget.classList.remove('hidden');
                chatInput.focus();
            }
        });
    }

    // Fermer le chat
    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => {
            if (chatWidget) {
                chatWidget.classList.add('hidden');
            }
        });
    }

    // Envoyer un message
    const sendMessage = () => {
        const message = chatInput.value.trim();
        if (message === '') return;

        // Ajouter le message de l'utilisateur
        addMessageToChat(message, 'user');
        chatInput.value = '';

        // Simuler une réponse automatique après un délai
        setTimeout(() => {
            const botResponse = generateBotResponse(message);
            addMessageToChat(botResponse, 'bot');
        }, 1000);
    };

    // Fonction pour ajouter un message au chat
    const addMessageToChat = (message, sender) => {
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        
        const senderName = sender === 'user' ? 'Vous' : 'Assistant EcoRide';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <strong>${senderName} :</strong><br>
                ${message}
            </div>
            <div class="message-time">${timeString}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Générer une réponse automatique du bot
    const generateBotResponse = (userMessage) => {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
            return "Bonjour ! 😊 Je suis votre assistant EcoRide. Comment puis-je vous aider ?";
        } else if (lowerMessage.includes('covoiturage') || lowerMessage.includes('trajet')) {
            return "Je peux vous aider à trouver un covoiturage ! Consultez notre page <strong>Covoiturages</strong> pour voir les trajets disponibles.";
        } else if (lowerMessage.includes('prix') || lowerMessage.includes('tarif')) {
            return "Les prix des trajets sont fixés par les conducteurs. Vous pouvez voir le prix avant de réserver !";
        } else if (lowerMessage.includes('réservation') || lowerMessage.includes('réserver')) {
            return "Pour réserver un trajet, connectez-vous à votre compte, puis cliquez sur 'Réserver' sur le trajet de votre choix.";
        } else if (lowerMessage.includes('compte') || lowerMessage.includes('inscription')) {
            return "Vous pouvez créer un compte gratuitement en cliquant sur 'Se connecter' puis 'Créer un compte'.";
        } else if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
            return "Je suis là pour vous aider ! Vous pouvez me poser des questions sur les covoiturages, les réservations, ou naviguer vers la page <strong>Contact</strong> pour plus d'aide.";
        } else if (lowerMessage.includes('merci')) {
            return "De rien ! 😊 N'hésitez pas si vous avez d'autres questions !";
        } else {
            return "Je comprends votre question. Pour une assistance plus détaillée, vous pouvez consulter notre page <strong>Contact</strong> ou essayer de reformuler votre demande.";
        }
    };

    // Événements pour envoyer le message
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

