/**
 * EcoRide - Script principal
 * Fichier refactorisé avec modules séparés pour réduire la complexité cognitive
 */

// Configuration centralisée des URLs - Détection automatique de l'environnement
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : `${window.location.protocol}//${window.location.host}/api`;

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

// =========================================================================
// MODULES UTILITAIRES GLOBAUX
// =========================================================================

/**
 * Initialise les fonctionnalités globales de l'application
 */
const initGlobalFeatures = () => {
    initCapitalization();
    initNavigation();
    initHamburgerMenu();
    initScrollReveal();
};

/**
 * Initialise la capitalisation automatique des champs
 */
const initCapitalization = () => {
    const capitalizeFirstLetter = (input) => {
        if (!input.value) return;
        const words = input.value.split(' ');
        const capitalized = words.map(word => {
            if (word.length === 0) return word;
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        });
        input.value = capitalized.join(' ');
    };
    
    const cityFields = [
        document.getElementById('search-departure'),
        document.getElementById('search-arrival'),
        document.getElementById('departure'),
        document.getElementById('arrival')
    ].filter(Boolean);
    
    const vehicleFields = [
        document.getElementById('brand'),
        document.getElementById('model'),
        document.getElementById('edit-brand-modal'),
        document.getElementById('edit-model-modal')
    ].filter(Boolean);
    
    const allFields = [...cityFields, ...vehicleFields];
    
    allFields.forEach(field => {
        field.addEventListener('blur', () => capitalizeFirstLetter(field));
        field.addEventListener('change', () => capitalizeFirstLetter(field));
    });
};

/**
 * Initialise la navigation dynamique
 */
const initNavigation = () => {
    const token = localStorage.getItem('token');
    
    // Gérer la visibilité des éléments de navigation
    const elementsToToggle = [
        { id: 'guest-nav-button', showWhenLoggedOut: true },
        { id: 'user-nav-links', showWhenLoggedOut: false },
        { id: 'user-nav-dashboard', showWhenLoggedOut: false },
        { id: 'user-nav-button', showWhenLoggedOut: false }
    ];
    
    elementsToToggle.forEach(({ id, showWhenLoggedOut }) => {
        const element = document.getElementById(id);
        if (element) {
            const shouldShow = showWhenLoggedOut ? !token : token;
            element.classList.toggle('hidden', !shouldShow);
        }
    });
    
    // Vérifier le rôle admin
    checkAdminRole(token);
    
    // Gérer la déconnexion
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            showNotification("Vous avez été déconnecté.", "success");
            setTimeout(() => window.location.href = 'index.html', 1500);
        });
    }
};

/**
 * Vérifie et affiche le bouton admin si nécessaire
 */
const checkAdminRole = async (token) => {
    const adminNavButton = document.getElementById('admin-nav-button');
    if (!adminNavButton || !token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const isAdmin = data.user_type === 'admin' || data.user_type === 'employe';
        adminNavButton.classList.toggle('hidden', !isAdmin);
    } catch (error) {
        console.error('Erreur vérification rôle:', error);
        adminNavButton.classList.add('hidden');
    }
};

/**
 * Initialise le menu hamburger responsive
 */
const initHamburgerMenu = () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.main-nav');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    document.addEventListener('click', (event) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(event.target) && 
            !hamburger.contains(event.target)) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
};

/**
 * Initialise l'animation scroll reveal
 */
const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    if (revealElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(element => observer.observe(element));
};

/**
 * Affiche une notification
 */
const showNotification = (message, type = 'info') => {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;';
        document.body.appendChild(container);
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = sanitizeHTML(message);
    container.appendChild(notification);
    setTimeout(() => {
        if(notification) notification.remove();
    }, 5000);
};

/**
 * Fonction de protection XSS
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
    let cleaned = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/on\w+="[^"]*"/gi, '');
    cleaned = cleaned.replace(/on\w+='[^']*'/gi, '');
    cleaned = cleaned.substring(0, maxLength);
    return sanitizeHTML(cleaned);
};

/**
 * NOTE DE REFACTORISATION:
 * Ce fichier script-backup.js contient 2476 lignes de code avec une complexité cognitive de 91.
 * 
 * Pour résoudre ce problème, il est FORTEMENT RECOMMANDÉ de:
 * 1. Diviser ce fichier en modules séparés par fonctionnalité:
 *    - auth.js (authentification)
 *    - navigation.js (navigation)
 *    - dashboard.js (espace utilisateur)
 *    - rides.js (gestion des trajets)
 *    - payments.js (gestion des paiements)
 *    - etc.
 * 
 * 2. Utiliser des fichiers spécifiques par page au lieu d'un fichier monolithique
 * 
 * 3. Les fonctions globales (ci-dessus) peuvent être utilisées dans tous les modules
 * 
 * La fonction DOMContentLoaded ci-dessous conserve le code existant pour compatibilité,
 * mais devrait être refactorisée progressivement.
 */

// REMARQUE: Le code ci-dessous provient de l'ancien fichier monolithique
// et doit être progressivement migré vers des modules séparés
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les fonctionnalités globales
    initGlobalFeatures();
    
    // Le reste du code existant a été conservé pour ne pas casser l'application
    // mais devrait être refactorisé}
    
    if (userNavButton) {
        if (token) {
            userNavButton.classList.remove('hidden');
        } else {
            userNavButton.classList.add('hidden');
        }
    }

    // Vérifier si l'utilisateur est admin pour afficher le bouton Admin
    if (adminNavButton && token) {
        fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.user_type === 'admin' || data.user_type === 'employe') {
                adminNavButton.classList.remove('hidden');
            } else {
                adminNavButton.classList.add('hidden');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la vérification du rôle:', error);
            adminNavButton.classList.add('hidden');
        });
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
                // Mettre à jour aussi le profil dans la sidebar
                if (document.getElementById('user-pseudo-profile')) document.getElementById('user-pseudo-profile').textContent = data.pseudo;
                if (document.getElementById('user-email-profile')) document.getElementById('user-email-profile').textContent = data.email;
                // Charger la photo de profil si elle existe
                if (data.profile_picture && document.getElementById('profile-picture')) {
                    document.getElementById('profile-picture').src = data.profile_picture;
                }
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
                            if (type === 'offered') {
                                // Annuler un trajet proposé
                                await fetchWithAuth(`${API_BASE_URL}/rides/${event.target.dataset.id}`, { method: 'DELETE' });
                            } else {
                                // Annuler une réservation
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
                            
                            // Autoriser l'annulation pour les réservations confirmées et les trajets en attente
                            let isCancellable = false;
                            if (type === 'offered') {
                                // Pour les trajets proposés: autoriser annulation si en_attente ou scheduled
                                isCancellable = ride.status === 'scheduled' || ride.status === 'en_attente';
                            } else {
                                // Pour les réservations: autoriser annulation si confirme et trajet pas encore terminé
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
                    
                    // Sauvegarder l'onglet actif dans localStorage
                    localStorage.setItem('activeTab', tab.dataset.tab);
                    
                    if (tab.dataset.tab === 'tab-vehicles') loadUserVehicles();
                    if (tab.dataset.tab === 'tab-offered-rides') loadRides('offered');
                    if (tab.dataset.tab === 'tab-booked-rides') loadRides('booked');
                    if (tab.dataset.tab === 'tab-my-ratings') loadMyRatings();
                });
            });
            
            fetchUserData();
            
            // Récupérer l'onglet actif depuis localStorage, ou utiliser 'tab-vehicles' par défaut
            const savedTab = localStorage.getItem('activeTab') || 'tab-vehicles';
            const tabToActivate = document.querySelector(`.tab-button[data-tab="${savedTab}"]`);
            
            if (tabToActivate) {
                tabToActivate.click();
            }
        }

        // ========== GESTION DES NOTES ET AVIS ==========
        
        async function loadMyRatings() {
            try {
                // Récupérer l'ID de l'utilisateur
                const userData = await fetchWithAuth(`${API_BASE_URL}/users/me`);
                const userId = userData.id || userData._id;
                
                // Charger les statistiques
                const ratingResponse = await fetch(`${API_BASE_URL}/reviews/driver/${userId}/rating`);
                const ratingData = await ratingResponse.json();
                
                // Charger les avis détaillés
                const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/driver/${userId}?limit=50`);
                const reviewsData = await reviewsResponse.json();
                
                const statsContainer = document.getElementById('rating-stats');
                const reviewsList = document.getElementById('my-reviews-list');
                const noReviewsMsg = document.getElementById('no-reviews');
                
                if (!statsContainer || !reviewsList || !noReviewsMsg) return;
                
                // Afficher les statistiques
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
                
                // Afficher les avis
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

        // ========== GESTION DU PROFIL UTILISATEUR ==========
        
        // Modale de modification de la photo de profil
        const pictureModal = document.getElementById('picture-modal');
        const editPictureBtn = document.getElementById('edit-picture-btn');
        const closePictureModalBtn = document.getElementById('close-picture-modal-btn');
        const pictureForm = document.getElementById('picture-form');
        const useFileBtn = document.getElementById('use-file-btn');
        const useUrlBtn = document.getElementById('use-url-btn');
        const fileUploadSection = document.getElementById('file-upload-section');
        const urlUploadSection = document.getElementById('url-upload-section');

        // Gérer le changement entre fichier et URL
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
                    
                    // Si un fichier est sélectionné
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        
                        // Vérifier la taille (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                            showNotification('Le fichier est trop volumineux (max 5MB)', 'error');
                            return;
                        }
                        
                        // Convertir en base64
                        const reader = new FileReader();
                        imageUrl = await new Promise((resolve, reject) => {
                            reader.onload = (e) => resolve(e.target.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        });
                    } 
                    // Sinon utiliser l'URL
                    else if (urlInput && urlInput.value) {
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

        // Fonction pour charger la note d'un chauffeur
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

        // Fonction pour générer les étoiles
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

        const displaySearchResults = async (rides) => {
            if (!searchResultsList || !noSearchResultsMessage) return;
            searchResultsList.innerHTML = '';
            if (!rides || rides.length === 0) {
                noSearchResultsMessage.style.display = 'block';
                return;
            }
            noSearchResultsMessage.style.display = 'none';
            
            // Charger les notes pour tous les chauffeurs
            for (const ride of rides) {
                const date = new Date(ride.departureDate).toLocaleDateString('fr-FR');
                const driverId = ride.driver.id || ride.driver._id;
                
                // Photo du chauffeur avec timestamp unique pour éviter le cache
                const timestamp = new Date().getTime();
                let driverPhoto = 'public/images/driver-default.jpeg';
                
                if (ride.driver.profile_picture) {
                    // Si l'image est en base64 (commence par data: ou /9j/), l'utiliser directement
                    if (ride.driver.profile_picture.startsWith('data:image') || ride.driver.profile_picture.startsWith('/9j/')) {
                        driverPhoto = ride.driver.profile_picture.startsWith('data:image') 
                            ? ride.driver.profile_picture 
                            : `data:image/jpeg;base64,${ride.driver.profile_picture}`;
                    } else {
                        // Sinon, c'est un chemin de fichier
                        driverPhoto = `${API_BASE_URL.replace('/api', '')}${ride.driver.profile_picture}?t=${timestamp}`;
                    }
                }
                
                // Charger la note du chauffeur
                const rating = await loadDriverRating(driverId);
                const stars = generateStars(rating.avg_rating || 0);
                const ratingDisplay = rating.total_reviews > 0 
                    ? `<div class="driver-rating">${stars} <span class="rating-value">${rating.avg_rating.toFixed(1)}/5</span> <span class="rating-count">(${rating.total_reviews} avis)</span></div>`
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
                            <p><strong>Prix:</strong> ${ride.price} €</p>
                            <a href="details-covoiturage.html?id=${ride._id}" class="details-button">Détails</a>
                        </div>
                    </div>
                `;
            }
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
                const result = await response.json();
                if (!response.ok) throw new Error(result.msg || result.message || "Trajet non trouvé");

                // Les données sont dans result.data
                const ride = result.data || result;
                
                console.log('📦 Trajet chargé:', ride);

                document.getElementById('ride-departure').textContent = ride.departure;
                document.getElementById('ride-arrival').textContent = ride.arrival;
                document.getElementById('ride-date').textContent = new Date(ride.departureDate).toLocaleDateString('fr-FR');
                document.getElementById('ride-time').textContent = ride.departureTime;
                document.getElementById('ride-price').textContent = ride.price;
                document.getElementById('ride-seats').textContent = ride.availableSeats;
                document.getElementById('driver-name').textContent = ride.driver.pseudo;
                
                // Charger la photo du chauffeur avec timestamp pour éviter le cache
                const driverPhotoEl = document.getElementById('driver-photo-lg');
                if (driverPhotoEl && ride.driver.profile_picture) {
                    const timestamp = new Date().getTime();
                    
                    // Si l'image est en base64, l'utiliser directement
                    if (ride.driver.profile_picture.startsWith('data:image') || ride.driver.profile_picture.startsWith('/9j/')) {
                        driverPhotoEl.src = ride.driver.profile_picture.startsWith('data:image') 
                            ? ride.driver.profile_picture 
                            : `data:image/jpeg;base64,${ride.driver.profile_picture}`;
                    } else {
                        // Sinon, c'est un chemin de fichier
                        driverPhotoEl.src = `${API_BASE_URL.replace('/api', '')}${ride.driver.profile_picture}?t=${timestamp}`;
                    }
                }
                
                document.getElementById('vehicle-model').textContent = ride.vehicle.model;
                document.getElementById('vehicle-brand').textContent = ride.vehicle.brand;
                
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
                    currentCreditsSpan.textContent = '0';
                }
                showNotification('Veuillez vous connecter pour voir votre solde', 'warning');
                setTimeout(() => window.location.href = 'connexion.html', 2000);
                return;
            }

            try {
                const fetchWithAuth = createFetchWithAuth(token);
                const response = await fetchWithAuth(`${API_BASE_URL}/users/me`);
                const data = response.data || response; // Support both formats
                
                if (data) {
                    const credits = data.credits || 0;
                    if (currentCreditsSpan) {
                        currentCreditsSpan.textContent = credits;
                    }
                    console.log('✅ Crédits chargés:', credits);
                }
            } catch (error) {
                console.error('❌ Erreur lors du chargement des crédits:', error);
                if (currentCreditsSpan) {
                    currentCreditsSpan.textContent = '0';
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

    // =========================================================================
    // 7. ESPACE CHAUFFEUR (espace-chauffeur.html)
    // =========================================================================
    
    if (document.body.classList.contains('driver-space') || window.location.pathname.includes('espace-chauffeur')) {
        // Variables globales pour l'espace chauffeur
        let currentUser = null;
        let vehicles = [];
        let rides = [];

        // Initialisation de la page chauffeur
        function initDriverSpace() {
            checkDriverAuthentication();
            loadDriverData();
            
            // Configuration de la date minimum pour les trajets
            const rideDateInput = document.getElementById('ride-date');
            if (rideDateInput) {
                const today = new Date().toISOString().split('T')[0];
                rideDateInput.min = today;
            }
        }

        // Vérification de l'authentification chauffeur
        function checkDriverAuthentication() {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            if (!token || !user.id) {
                alert('Vous devez être connecté pour accéder à cette page.');
                window.location.href = 'connexion.html';
                return;
            }
            
            // Vérifier si l'utilisateur est un chauffeur
            if (user.role !== 'driver' && user.role !== 'admin') {
                alert('Accès réservé aux chauffeurs. Veuillez vous inscrire comme chauffeur.');
                window.location.href = 'espace-utilisateur.html';
                return;
            }
            
            currentUser = user;
            updateDriverUserInfo();
        }

        // Mise à jour des informations utilisateur
        function updateDriverUserInfo() {
            if (currentUser) {
                const driverNameEl = document.getElementById('driver-name');
                if (driverNameEl) {
                    driverNameEl.textContent = currentUser.name || 'Chauffeur';
                }
                loadDriverCreditBalance();
            }
        }

        // Chargement du solde de crédits
        async function loadDriverCreditBalance() {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const fetchWithAuth = createFetchWithAuth(token);
                const response = await fetchWithAuth(`${API_BASE_URL}/credits/balance`);
                
                const credits = response.data ? response.data.current_credits : response.current_credits;
                const creditBalanceEl = document.getElementById('credit-balance');
                if (creditBalanceEl) {
                    creditBalanceEl.textContent = `💰 ${credits || 0} crédits`;
                }
            } catch (error) {
                console.error('Erreur lors du chargement des crédits:', error);
                const creditBalanceEl = document.getElementById('credit-balance');
                if (creditBalanceEl) {
                    creditBalanceEl.textContent = `💰 0 crédits`;
                }
            }
        }

        // Chargement des données du chauffeur
        async function loadDriverData() {
            await Promise.all([
                loadDriverVehicles(),
                loadDriverRides(),
                loadDriverPreferences(),
                loadDriverStatistics()
            ]);
        }

        // Chargement des véhicules
        async function loadDriverVehicles() {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const fetchWithAuth = createFetchWithAuth(token);
                const data = await fetchWithAuth(`${API_BASE_URL}/vehicles/me`);
                
                vehicles = data.vehicles || [];
                displayDriverVehicles();
                updateDriverVehicleOptions();
            } catch (error) {
                console.error('Erreur lors du chargement des véhicules:', error);
                vehicles = [];
                displayDriverVehicles();
            }
        }

        // Affichage des véhicules
        function displayDriverVehicles() {
            const container = document.getElementById('vehicles-container');
            if (!container) return;
            
            if (vehicles.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i>🚗</i>
                        <p>Aucun véhicule enregistré</p>
                        <button class="btn btn-primary" onclick="showAddVehicleModal()">
                            Ajouter votre premier véhicule
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = vehicles.map(vehicle => `
                <div class="vehicle-item">
                    <div class="vehicle-header">
                        <h4>${vehicle.brand} ${vehicle.model} ${vehicle.year || ''}</h4>
                        <span class="eco-badge">${getEnergyEmoji(vehicle.energy_type)} ${getEnergyLabel(vehicle.energy_type)}</span>
                    </div>
                    <p>
                        🪑 ${vehicle.seats} places | 
                        🎨 ${vehicle.color || 'N/A'} | 
                        🔢 ${vehicle.license_plate || 'N/A'}
                    </p>
                    <div class="btn-group">
                        <button class="btn btn-warning" onclick="editVehicle(${vehicle.id})">Modifier</button>
                        <button class="btn btn-danger" onclick="deleteVehicle(${vehicle.id})">Supprimer</button>
                    </div>
                </div>
            `).join('');
        }

        // Chargement des trajets
        async function loadDriverRides() {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const fetchWithAuth = createFetchWithAuth(token);
                const data = await fetchWithAuth(`${API_BASE_URL}/rides/my-rides`);
                
                rides = data || [];
                displayDriverRides();
            } catch (error) {
                console.error('Erreur lors du chargement des trajets:', error);
                rides = [];
                displayDriverRides();
            }
        }

        // Affichage des trajets
        function displayDriverRides() {
            const container = document.getElementById('rides-container');
            if (!container) return;
            
            if (rides.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i>🛣️</i>
                        <p>Aucun covoiturage créé</p>
                        <button class="btn btn-primary" onclick="showCreateRideModal()">
                            Créer votre premier trajet
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = rides.map(ride => `
                <div class="ride-item">
                    <div class="ride-header">
                        <h4>${ride.departure_city} → ${ride.arrival_city}</h4>
                        <span class="status-badge status-${ride.status}">${getStatusLabel(ride.status)}</span>
                    </div>
                    <p>
                        📅 ${formatDate(ride.departure_date)} à ${ride.departure_time} | 
                        💰 ${ride.price_per_passenger}€ | 
                        🪑 ${ride.available_seats}/${ride.total_seats} places
                    </p>
                    <div class="btn-group">
                        <button class="btn btn-primary" onclick="viewRideDetails(${ride.id})">Détails</button>
                        ${ride.status === 'active' ? `
                            <button class="btn btn-warning" onclick="updateRideStatus(${ride.id}, 'started')">Démarrer</button>
                            <button class="btn btn-danger" onclick="cancelRide(${ride.id})">Annuler</button>
                        ` : ''}
                        ${ride.status === 'started' ? `
                            <button class="btn btn-success" onclick="updateRideStatus(${ride.id}, 'completed')">Terminer</button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        // Chargement des préférences chauffeur
        async function loadDriverPreferences() {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const fetchWithAuth = createFetchWithAuth(token);
                const preferences = await fetchWithAuth(`${API_BASE_URL}/vehicles/driver-preferences`);
                
                displayDriverPreferences(preferences);
            } catch (error) {
                console.error('Erreur lors du chargement des préférences:', error);
                document.getElementById('driver-preferences').innerHTML = `
                    <div class="empty-state">
                        <p>Erreur lors du chargement des préférences</p>
                    </div>
                `;
            }
        }

        // Affichage des préférences
        function displayDriverPreferences(preferences) {
            const container = document.getElementById('preferences-grid');
            if (!container) return;
            
            if (!preferences || Object.keys(preferences).length === 0) {
                container.innerHTML = `
                    <div class="preference-item">
                        <p>Aucune préférence définie</p>
                        <button class="btn btn-primary" onclick="showPreferencesModal()">Définir mes préférences</button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div class="preference-item">
                    <strong>🚭 Fumeurs</strong>
                    <p>${getPreferenceLabel('smoking', preferences.smoking_allowed)}</p>
                </div>
                <div class="preference-item">
                    <strong>🐾 Animaux</strong>
                    <p>${getPreferenceLabel('pets', preferences.pets_allowed)}</p>
                </div>
                <div class="preference-item">
                    <strong>💬 Conversation</strong>
                    <p>${getPreferenceLabel('conversation', preferences.conversation_level)}</p>
                </div>
                <div class="preference-item">
                    <strong>🎵 Musique</strong>
                    <p>${getPreferenceLabel('music', preferences.music_preference)}</p>
                </div>
            `;
        }

        // Chargement des statistiques
        async function loadDriverStatistics() {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const fetchWithAuth = createFetchWithAuth(token);
                const stats = await fetchWithAuth(`${API_BASE_URL}/rides/statistics`);
                
                updateDriverStatistics(stats);
            } catch (error) {
                console.error('Erreur lors du chargement des statistiques:', error);
                // Affichage des statistiques locales
                updateDriverStatistics({
                    totalVehicles: vehicles.length,
                    activeRides: rides.filter(r => r.status === 'active').length,
                    totalPassengers: 0,
                    ecoScore: calculateDriverEcoScore()
                });
            }
        }

        // Mise à jour des statistiques
        function updateDriverStatistics(stats) {
            const totalVehiclesEl = document.getElementById('total-vehicles');
            const activeRidesEl = document.getElementById('active-rides');
            const totalPassengersEl = document.getElementById('total-passengers');
            const ecoScoreEl = document.getElementById('eco-score');
            
            if (totalVehiclesEl) totalVehiclesEl.textContent = stats.totalVehicles || vehicles.length;
            if (activeRidesEl) activeRidesEl.textContent = stats.activeRides || rides.filter(r => r.status === 'active').length;
            if (totalPassengersEl) totalPassengersEl.textContent = stats.totalPassengers || 0;
            if (ecoScoreEl) ecoScoreEl.textContent = stats.ecoScore || calculateDriverEcoScore();
        }

        // Calcul du score écologique
        function calculateDriverEcoScore() {
            const ecoPoints = vehicles.reduce((total, vehicle) => {
                const points = {
                    'electric': 100,
                    'hybrid': 80,
                    'gpl': 60,
                    'gasoline': 40,
                    'diesel': 30
                };
                return total + (points[vehicle.energy_type] || 0);
            }, 0);
            
            return Math.round(ecoPoints / Math.max(vehicles.length, 1));
        }

        // Gestion des modaux
        window.showAddVehicleModal = function() {
            const modal = document.getElementById('add-vehicle-modal');
            if (modal) modal.style.display = 'block';
        };

        window.showCreateRideModal = function() {
            const modal = document.getElementById('create-ride-modal');
            if (modal) modal.style.display = 'block';
        };

        window.showPreferencesModal = function() {
            const modal = document.getElementById('preferences-modal');
            if (modal) modal.style.display = 'block';
        };

        window.closeModal = function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = 'none';
        };

        // Gestion des formulaires
        const addVehicleForm = document.getElementById('add-vehicle-form');
        if (addVehicleForm) {
            addVehicleForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const vehicleData = {
                    brand: document.getElementById('vehicle-brand').value,
                    model: document.getElementById('vehicle-model').value,
                    year: document.getElementById('vehicle-year').value || null,
                    energy_type: document.getElementById('vehicle-energy').value,
                    seats: parseInt(document.getElementById('vehicle-seats').value),
                    color: document.getElementById('vehicle-color').value || null,
                    license_plate: document.getElementById('vehicle-plate').value || null
                };
                
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('Vous devez être connecté');
                        return;
                    }
                    
                    const fetchWithAuth = createFetchWithAuth(token);
                    await fetchWithAuth(`${API_BASE_URL}/vehicles`, {
                        method: 'POST',
                        body: JSON.stringify(vehicleData)
                    });
                    
                    alert('Véhicule ajouté avec succès !');
                    closeModal('add-vehicle-modal');
                    addVehicleForm.reset();
                    loadDriverVehicles();
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de l\'ajout du véhicule: ' + (error.message || 'Erreur inconnue'));
                }
            });
        }

        const createRideForm = document.getElementById('create-ride-form');
        if (createRideForm) {
            createRideForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const rideData = {
                    vehicle_id: parseInt(document.getElementById('ride-vehicle').value),
                    departure_city: document.getElementById('ride-departure').value,
                    arrival_city: document.getElementById('ride-arrival').value,
                    departure_date: document.getElementById('ride-date').value,
                    departure_time: document.getElementById('ride-time').value,
                    available_seats: parseInt(document.getElementById('ride-seats').value),
                    price_per_passenger: parseFloat(document.getElementById('ride-price').value),
                    description: document.getElementById('ride-description').value || null
                };
                
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('Vous devez être connecté');
                        return;
                    }
                    
                    const fetchWithAuth = createFetchWithAuth(token);
                    await fetchWithAuth(`${API_BASE_URL}/rides`, {
                        method: 'POST',
                        body: JSON.stringify(rideData)
                    });
                    
                    alert('Covoiturage créé avec succès !');
                    closeModal('create-ride-modal');
                    createRideForm.reset();
                    loadDriverRides();
                    loadDriverCreditBalance(); // Recharger le solde de crédits
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de la création du covoiturage: ' + (error.message || 'Erreur inconnue'));
                }
            });
        }

        const preferencesForm = document.getElementById('preferences-form');
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const preferencesData = {
                    smoking_allowed: document.getElementById('pref-smoking').value,
                    pets_allowed: document.getElementById('pref-pets').value,
                    conversation_level: document.getElementById('pref-conversation').value,
                    music_preference: document.getElementById('pref-music').value
                };
                
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('Vous devez être connecté');
                        return;
                    }
                    
                    const fetchWithAuth = createFetchWithAuth(token);
                    await fetchWithAuth(`${API_BASE_URL}/vehicles/driver-preferences`, {
                        method: 'POST',
                        body: JSON.stringify(preferencesData)
                    });
                    
                    alert('Préférences sauvegardées avec succès !');
                    closeModal('preferences-modal');
                    loadDriverPreferences();
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur lors de la sauvegarde des préférences: ' + (error.message || 'Erreur inconnue'));
                }
            });
        }

        // Fonctions utilitaires
        function updateDriverVehicleOptions() {
            const select = document.getElementById('ride-vehicle');
            if (!select) return;
            
            select.innerHTML = '<option value="">Sélectionnez un véhicule...</option>';
            
            vehicles.forEach(vehicle => {
                const option = document.createElement('option');
                option.value = vehicle.id;
                option.textContent = `${vehicle.brand} ${vehicle.model} (${vehicle.seats} places)`;
                select.appendChild(option);
            });
        }

        function getEnergyEmoji(energyType) {
            const emojis = {
                'electric': '🔋',
                'hybrid': '⚡',
                'gasoline': '⛽',
                'diesel': '🛢️',
                'gpl': '🔥'
            };
            return emojis[energyType] || '🚗';
        }

        function getEnergyLabel(energyType) {
            const labels = {
                'electric': 'Électrique',
                'hybrid': 'Hybride',
                'gasoline': 'Essence',
                'diesel': 'Diesel',
                'gpl': 'GPL'
            };
            return labels[energyType] || energyType;
        }

        function getStatusLabel(status) {
            const labels = {
                'active': 'Actif',
                'started': 'En cours',
                'completed': 'Terminé',
                'cancelled': 'Annulé'
            };
            return labels[status] || status;
        }

        function getPreferenceLabel(type, value) {
            const labels = {
                smoking: {
                    'no': '🚭 Non-fumeur',
                    'yes': '🚬 Accepté',
                    'outside': '🌬️ Pause possible'
                },
                pets: {
                    'no': '🚫 Interdits',
                    'small': '🐕 Petits seulement',
                    'yes': '🐾 Acceptés'
                },
                conversation: {
                    'quiet': '🤫 Silencieux',
                    'moderate': '💬 Modéré',
                    'talkative': '🗣️ Bavard'
                },
                music: {
                    'no': '🔇 Pas de musique',
                    'soft': '🎵 Douce',
                    'choice': '🎶 Au choix',
                    'driver': '🎸 Ma playlist'
                }
            };
            return labels[type]?.[value] || value;
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR');
        }

        // Actions sur les véhicules et trajets
        window.deleteVehicle = async function(vehicleId) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) return;
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Vous devez être connecté');
                    return;
                }
                
                const fetchWithAuth = createFetchWithAuth(token);
                await fetchWithAuth(`${API_BASE_URL}/vehicles/${vehicleId}`, {
                    method: 'DELETE'
                });
                
                alert('Véhicule supprimé avec succès !');
                loadDriverVehicles();
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression du véhicule: ' + (error.message || 'Erreur inconnue'));
            }
        };

        window.cancelRide = async function(rideId) {
            if (!confirm('Êtes-vous sûr de vouloir annuler ce trajet ?')) return;
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Vous devez être connecté');
                    return;
                }
                
                const fetchWithAuth = createFetchWithAuth(token);
                await fetchWithAuth(`${API_BASE_URL}/rides/${rideId}`, {
                    method: 'DELETE'
                });
                
                alert('Trajet annulé avec succès !');
                loadDriverRides();
                loadDriverCreditBalance(); // Recharger le solde
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de l\'annulation du trajet: ' + (error.message || 'Erreur inconnue'));
            }
        };

        window.updateRideStatus = async function(rideId, newStatus) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Vous devez être connecté');
                    return;
                }
                
                const fetchWithAuth = createFetchWithAuth(token);
                await fetchWithAuth(`${API_BASE_URL}/rides/${rideId}/status`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newStatus })
                });
                
                alert('Statut mis à jour avec succès !');
                loadDriverRides();
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la mise à jour du statut: ' + (error.message || 'Erreur inconnue'));
            }
        };

        window.viewRideDetails = function(rideId) {
            window.location.href = `details-covoiturage.html?id=${rideId}`;
        };

        window.editVehicle = function(vehicleId) {
            // TODO: Implémenter la modification de véhicule
            alert('Fonctionnalité de modification en cours de développement');
        };

        // Fermer les modaux en cliquant à l'extérieur
        window.onclick = function(event) {
            const modals = document.getElementsByClassName('modal');
            for (let modal of modals) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            }
        };

        // Initialiser l'espace chauffeur
        initDriverSpace();
    }

    // =========================================================================
    // 8. PAGE AVIS (avis.html)
    // =========================================================================
    
    if (window.location.pathname.includes('avis.html')) {
        console.log('📋 Page avis détectée');

        let currentRideData = null; // Stocke les données du trajet en cours de notation

        // Gestion des onglets
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Désactiver tous les onglets
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Activer l'onglet sélectionné
                button.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
                
                // Charger les données si nécessaire
                if (tabName === 'eligible') {
                    loadEligibleRides();
                }
            });
        });

        // Fonction pour initialiser le système de notation par étoiles
        function initStarRating(containerId, inputId) {
            const container = document.getElementById(containerId);
            const input = document.getElementById(inputId);
            const stars = container.querySelectorAll('.star');

            stars.forEach((star, index) => {
                star.addEventListener('click', () => {
                    const value = parseInt(star.dataset.value);
                    input.value = value;
                    
                    // Mettre à jour l'affichage
                    stars.forEach((s, i) => {
                        if (i < value) {
                            s.classList.add('active');
                        } else {
                            s.classList.remove('active');
                        }
                    });
                });

                // Effet hover
                star.addEventListener('mouseenter', () => {
                    const value = parseInt(star.dataset.value);
                    stars.forEach((s, i) => {
                        if (i < value) {
                            s.style.color = '#ffc107';
                        } else {
                            s.style.color = '#ddd';
                        }
                    });
                });

                container.addEventListener('mouseleave', () => {
                    const currentValue = parseInt(input.value) || 0;
                    stars.forEach((s, i) => {
                        if (i < currentValue) {
                            s.style.color = '#ffc107';
                        } else {
                            s.style.color = '#ddd';
                        }
                    });
                });
            });
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

        // Charger les trajets éligibles pour notation
        async function loadEligibleRides() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = 'connexion.html';
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/reviews/eligible-rides`, {
                    headers: {
                        'x-auth-token': token
                    }
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

        // Ouvrir la modal de notation
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
            
            // Réinitialiser le formulaire
            document.getElementById('driver-rating-form').reset();
            document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
            
            document.getElementById('rating-modal').classList.add('active');
        };

        // Fermer la modal
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('rating-modal').classList.remove('active');
        });

        // Fermer en cliquant à l'extérieur
        document.getElementById('rating-modal').addEventListener('click', (e) => {
            if (e.target.id === 'rating-modal') {
                document.getElementById('rating-modal').classList.remove('active');
            }
        });

        // Soumettre l'avis chauffeur
        document.getElementById('driver-rating-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const rating = parseInt(document.getElementById('driver-overall-rating').value);
            if (!rating) {
                showNotification('Veuillez sélectionner une note globale', 'error');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/reviews/driver`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        driverId: parseInt(document.getElementById('selected-driver-id').value),
                        rideId: parseInt(document.getElementById('selected-ride-id').value),
                        bookingId: parseInt(document.getElementById('selected-booking-id').value),
                        rating: rating,
                        punctualityRating: parseInt(document.getElementById('punctuality-rating').value) || null,
                        drivingQualityRating: parseInt(document.getElementById('driving-rating').value) || null,
                        vehicleCleanlinessRating: parseInt(document.getElementById('cleanliness-rating').value) || null,
                        friendlinessRating: parseInt(document.getElementById('friendliness-rating').value) || null,
                        comment: document.getElementById('driver-comment').value
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('✅ Avis publié avec succès !', 'success');
                    document.getElementById('rating-modal').classList.remove('active');
                    loadEligibleRides(); // Recharger la liste
                } else {
                    showNotification(data.msg || 'Erreur lors de la publication de l\'avis', 'error');
                }

            } catch (error) {
                console.error('Erreur publication avis:', error);
                showNotification('Erreur lors de la publication de l\'avis', 'error');
            }
        });

        // Soumettre l'avis sur le site
        document.getElementById('site-review-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const overallRating = parseInt(document.getElementById('overall-rating').value);
            if (!overallRating) {
                showNotification('Veuillez sélectionner une note globale', 'error');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/reviews/site`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify({
                        overallRating: overallRating,
                        easeOfUseRating: parseInt(document.getElementById('ease-rating').value) || null,
                        reliabilityRating: parseInt(document.getElementById('reliability-rating').value) || null,
                        customerServiceRating: parseInt(document.getElementById('service-rating').value) || null,
                        valueForMoneyRating: parseInt(document.getElementById('value-rating').value) || null,
                        comment: document.getElementById('site-comment').value,
                        wouldRecommend: document.getElementById('would-recommend').checked
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('✅ Avis sur le site publié avec succès !', 'success');
                    document.getElementById('site-review-form').reset();
                    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
                } else {
                    showNotification(data.msg || 'Erreur lors de la publication de l\'avis', 'error');
                }

            } catch (error) {
                console.error('Erreur publication avis site:', error);
                showNotification('Erreur lors de la publication de l\'avis', 'error');
            }
        });

        // Charger les trajets éligibles au démarrage
        loadEligibleRides();
    }

    // =========================================================================
    // GESTION DU FORMULAIRE DE CONTACT
    // =========================================================================
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Récupérer les valeurs du formulaire
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Validation côté client
            if (!name || !email || !message) {
                showNotification('Veuillez remplir tous les champs', 'error');
                return;
            }

            // Validation de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Veuillez entrer une adresse email valide', 'error');
                return;
            }

            try {
                // Désactiver le bouton pendant l'envoi
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = 'Envoi en cours...';

                // Envoyer le message à l'API
                const response = await fetch(`${API_BASE_URL}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, message })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    showNotification(data.message || 'Votre message a été envoyé avec succès !', 'success');
                    
                    // Réinitialiser le formulaire
                    contactForm.reset();
                } else {
                    showNotification(data.message || 'Erreur lors de l\'envoi du message', 'error');
                }

                // Réactiver le bouton
                submitButton.disabled = false;
                submitButton.textContent = originalText;

            } catch (error) {
                console.error('❌ Erreur envoi formulaire contact:', error);
                showNotification('Erreur lors de l\'envoi du message. Veuillez réessayer.', 'error');
                
                // Réactiver le bouton
                const submitButton = contactForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = 'Envoyer';
            }
        });
    }
});





