/**
 * PANNEAU D'ADMINISTRATION - JAVASCRIPT
 * Gestion complète du panneau d'administration EcoRide
 */

const API_BASE_URL = 'http://localhost:3000/api';

// ========================================
// INITIALISATION
// ========================================

// Vérification de l'authentification au chargement
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'connexion.html';
        return;
    }

    // Vérifier si l'utilisateur est admin
    verifyAdmin();

    // Charger les données du dashboard
    loadDashboardData();

    // Gestionnaires d'événements
    setupEventListeners();
});

// ========================================
// AUTHENTIFICATION
// ========================================

/**
 * Vérifier si l'utilisateur est admin ou employé
 */
async function verifyAdmin() {
    try {
        console.log('🔍 Vérification du rôle admin...');
        const token = localStorage.getItem('token');
        console.log('Token présent:', token ? 'OUI' : 'NON');

        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Status de la réponse:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erreur API:', errorText);
            throw new Error('Non autorisé');
        }

        const data = await response.json();
        console.log('Données utilisateur:', data);
        console.log('Rôle de l\'utilisateur:', data.user_type);

        if (data.user_type !== 'admin' && data.user_type !== 'employe') {
            console.warn('❌ Accès refusé - Rôle:', data.user_type);
            showNotification('Accès refusé : Vous n\'êtes pas administrateur. Votre rôle: ' + data.user_type, 'error');
            return;
        }

        console.log('✅ Accès autorisé');
        document.getElementById('admin-name').textContent = data.pseudo || 'Admin';
    } catch (error) {
        console.error('❌ Erreur de vérification:', error);
        showNotification('Erreur de connexion au serveur', 'error');
    }
}

// ========================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ========================================

/**
 * Configurer tous les gestionnaires d'événements
 */
function setupEventListeners() {
    // Navigation dans le menu
    document.querySelectorAll('.admin-menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            switchSection(section);

            // Mettre à jour l'état actif
            document.querySelectorAll('.admin-menu-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Déconnexion
    document.getElementById('admin-logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'connexion.html';
    });

    // Formulaire d'employé
    document.getElementById('employee-form').addEventListener('submit', handleEmployeeCreation);
}

// ========================================
// NAVIGATION
// ========================================

/**
 * Changer de section
 * @param {string} sectionName - Nom de la section à afficher
 */
function switchSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Afficher la section sélectionnée
    document.getElementById(sectionName).classList.add('active');

    // Mettre à jour le titre
    const titles = {
        dashboard: 'Tableau de bord',
        users: 'Gestion des Utilisateurs',
        rides: 'Gestion des Trajets',
        reviews: 'Gestion des Avis',
        employees: 'Gestion des Employés'
    };
    document.getElementById('page-title').textContent = titles[sectionName];

    // Charger les données de la section
    loadSectionData(sectionName);
}

/**
 * Charger les données d'une section spécifique
 * @param {string} section - Nom de la section
 */
async function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'users':
            loadUsers();
            break;
        case 'rides':
            loadRides();
            break;
        case 'reviews':
            loadReviews();
            break;
        case 'employees':
            loadEmployees();
            break;
    }
}

// ========================================
// TABLEAU DE BORD
// ========================================

/**
 * Charger les données du dashboard
 */
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Erreur de chargement des stats');

        const stats = await response.json();

        // Mettre à jour les stats
        document.getElementById('stat-users').textContent = stats.totalUsers || 0;
        document.getElementById('stat-rides').textContent = stats.totalRides || 0;
        document.getElementById('stat-credits').textContent = stats.totalCredits || 0;
        document.getElementById('stat-reviews').textContent = stats.pendingReviews || 0;

        // Créer le graphique
        createActivityChart(stats.ridesByDay || []);
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de chargement des statistiques', 'error');
    }
}

/**
 * Créer le graphique d'activité avec Chart.js
 * @param {Array} data - Données des trajets par jour
 */
function createActivityChart(data) {
    const ctx = document.getElementById('activity-chart');

    // Détruire le graphique existant s'il y en a un
    if (window.activityChart) {
        window.activityChart.destroy();
    }

    const labels = data.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    });
    const values = data.map(d => d.count);

    window.activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Trajets créés',
                data: values,
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ========================================
// GESTION DES UTILISATEURS
// ========================================

/**
 * Charger la liste des utilisateurs
 */
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Erreur de chargement');

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de chargement des utilisateurs', 'error');
    }
}

/**
 * Afficher les utilisateurs dans le tableau
 * @param {Array} users - Liste des utilisateurs
 */
function displayUsers(users) {
    const tbody = document.getElementById('users-table');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Aucun utilisateur trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.pseudo || 'N/A'}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge ${user.user_type === 'admin' ? 'danger' : user.user_type === 'employe' ? 'warning' : 'info'}">
                    ${user.user_type || 'utilisateur'}
                </span>
            </td>
            <td>
                <span class="badge ${user.isSuspended ? 'danger' : 'success'}">
                    ${user.isSuspended ? 'Suspendu' : 'Actif'}
                </span>
            </td>
            <td>${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
            <td>
                ${user.user_type !== 'admin' ? `
                    <button class="btn btn-sm ${user.isSuspended ? 'btn-primary' : 'btn-warning'}" 
                            onclick="toggleUserStatus(${user.id}, ${user.isSuspended})">
                        <i class="fas fa-${user.isSuspended ? 'check' : 'ban'}"></i>
                        ${user.isSuspended ? 'Activer' : 'Suspendre'}
                    </button>
                ` : '<span style="color: #718096;">-</span>'}
            </td>
        </tr>
    `).join('');
}

/**
 * Basculer le statut d'un utilisateur (actif/suspendu)
 * @param {number} userId - ID de l'utilisateur
 * @param {boolean} isSuspended - État actuel
 */
async function toggleUserStatus(userId, isSuspended) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Erreur de mise à jour');

        showNotification(
            isSuspended ? 'Utilisateur activé avec succès' : 'Utilisateur suspendu avec succès',
            'success'
        );
        loadUsers();
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de mise à jour du statut', 'error');
    }
}

// ========================================
// GESTION DES TRAJETS
// ========================================

/**
 * Charger la liste des trajets
 */
async function loadRides() {
    try {
        const response = await fetch(`${API_BASE_URL}/rides/search?seats=1`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Erreur de chargement');

        const rides = await response.json();
        displayRides(rides);
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de chargement des trajets', 'error');
    }
}

/**
 * Afficher les trajets dans le tableau
 * @param {Array} rides - Liste des trajets
 */
function displayRides(rides) {
    const tbody = document.getElementById('rides-table');

    if (rides.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">Aucun trajet trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = rides.map(ride => `
        <tr>
            <td>${ride.departure_city}</td>
            <td>${ride.arrival_city}</td>
            <td>${ride.driver?.pseudo || 'N/A'}</td>
            <td>${new Date(ride.departure_datetime).toLocaleDateString('fr-FR')}</td>
            <td>${ride.price}€</td>
            <td>${ride.available_seats}/${ride.available_seats}</td>
            <td>
                <span class="badge success">Actif</span>
            </td>
        </tr>
    `).join('');
}

// ========================================
// GESTION DES AVIS
// ========================================

/**
 * Charger la liste des avis
 */
async function loadReviews() {
    // Pour l'instant, affichage d'un message
    const tbody = document.getElementById('reviews-table');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Fonctionnalité en cours de développement</td></tr>';
}

// ========================================
// GESTION DES EMPLOYÉS
// ========================================

/**
 * Charger la liste des employés
 */
async function loadEmployees() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Erreur de chargement');

        const users = await response.json();
        const employees = users.filter(u => u.user_type === 'employe');
        displayEmployees(employees);
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de chargement des employés', 'error');
    }
}

/**
 * Afficher les employés dans le tableau
 * @param {Array} employees - Liste des employés
 */
function displayEmployees(employees) {
    const tbody = document.getElementById('employees-table');

    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px;">Aucun employé trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td>${emp.pseudo || 'N/A'}</td>
            <td>${emp.email}</td>
            <td>${new Date(emp.createdAt).toLocaleDateString('fr-FR')}</td>
        </tr>
    `).join('');
}

/**
 * Gérer la création d'un nouvel employé
 * @param {Event} e - Événement de soumission du formulaire
 */
async function handleEmployeeCreation(e) {
    e.preventDefault();

    const formData = {
        pseudo: document.getElementById('emp-pseudo').value,
        email: document.getElementById('emp-email').value,
        password: document.getElementById('emp-password').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/admin/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur de création');
        }

        showNotification('Employé créé avec succès', 'success');
        document.getElementById('employee-form').reset();
        loadEmployees();
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message || 'Erreur de création de l\'employé', 'error');
    }
}

// ========================================
// NOTIFICATIONS
// ========================================

/**
 * Afficher une notification
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
