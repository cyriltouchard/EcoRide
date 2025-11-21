/**
 * PANNEAU D'ADMINISTRATION - JAVASCRIPT
 * Gestion complète du dashboard EcoRide
 * Refactorisé pour sécurité et performance
 */

// ========================================
// CONFIGURATION & UTILITAIRES
// ========================================

const API_ENDPOINTS = {
    ME: '/users/me',
    STATS: '/admin/stats',
    USERS: '/admin/users',
    RIDES: '/rides/search?seats=1', // Idéalement, créer une route /admin/rides côté back
    REVIEWS: '/reviews/pending',    // Route MongoDB pour les avis
    EMPLOYEES: '/admin/employees',
    TOGGLE_USER: (id) => `/admin/users/${id}/toggle-status`
};

/**
 * Fonction générique pour les appels API sécurisés
 * @param {string} endpoint - L'URL relative
 * @param {Object} options - Options fetch (method, body...)
 */
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    // Configuration par défaut
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const config = {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Gestion spécifique de l'expiration du token (401)
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'connexion.html';
            return null;
        }

        // Si erreur API (400, 403, 500...)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
            throw new Error(errorData.message || `Erreur ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erreur API [${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Échapper les caractères HTML pour prévenir les failles XSS
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'connexion.html';
        return;
    }

    initAdminPanel();
});

async function initAdminPanel() {
    try {
        await verifyAdminAccess();
        setupEventListeners();
        // Charger le dashboard par défaut
        loadSectionData('dashboard');
    } catch (error) {
        console.error('Echec initialisation:', error);
    }
}

// ========================================
// AUTHENTIFICATION & RÔLES
// ========================================

async function verifyAdminAccess() {
    try {
        console.log('🔍 Vérification des droits...');
        const user = await fetchAPI(API_ENDPOINTS.ME);

        // Correction du bug "role undefined": on vérifie user_type
        const role = user.user_type || user.role; 

        if (role !== 'admin' && role !== 'employe') {
            throw new Error('Droits insuffisants');
        }

        console.log('✅ Accès autorisé:', role);
        
        // Mise à jour de l'interface
        const nameElement = document.getElementById('admin-name');
        if (nameElement) nameElement.textContent = user.pseudo || 'Admin';

        // Masquer certaines sections pour les employés si nécessaire
        if (role === 'employe') {
            const employeeMenu = document.querySelector('[data-section="employees"]');
            if (employeeMenu) employeeMenu.style.display = 'none';
        }

    } catch (error) {
        console.warn('❌ Accès refusé:', error.message);
        showNotification('Accès refusé. Redirection...', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
    }
}

// ========================================
// NAVIGATION & ÉVÉNEMENTS
// ========================================

function setupEventListeners() {
    // Menu de navigation
    document.querySelectorAll('.admin-menu-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Gestion UI
            document.querySelectorAll('.admin-menu-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Logique section
            const section = btn.dataset.section;
            switchSection(section);
        });
    });

    // Déconnexion
    document.getElementById('admin-logout')?.addEventListener('click', () => {
        if(confirm('Voulez-vous vraiment vous déconnecter ?')) {
            localStorage.removeItem('token');
            window.location.href = 'connexion.html';
        }
    });

    // Formulaire Création Employé
    const empForm = document.getElementById('employee-form');
    if (empForm) {
        empForm.addEventListener('submit', handleEmployeeCreation);
    }
}

function switchSection(sectionName) {
    // Masquer toutes les sections
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    
    // Afficher la cible
    const target = document.getElementById(sectionName);
    if (target) target.classList.add('active');

    // Titre dynamique
    const titles = {
        dashboard: 'Tableau de bord',
        users: 'Gestion des Utilisateurs',
        rides: 'Gestion des Trajets',
        reviews: 'Gestion des Avis',
        employees: 'Gestion des Employés'
    };
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = titles[sectionName] || 'Administration';

    // Charger les données
    loadSectionData(sectionName);
}

// ========================================
// CHARGEMENT DES DONNÉES
// ========================================

async function loadSectionData(section) {
    // Spinner de chargement (optionnel, bonne pratique)
    // showLoader(); 

    try {
        switch (section) {
            case 'dashboard': await loadDashboardData(); break;
            case 'users':     await loadUsers(); break;
            case 'rides':     await loadRides(); break;
            case 'reviews':   await loadReviews(); break;
            case 'employees': await loadEmployees(); break;
        }
    } catch (error) {
        showNotification(`Erreur chargement ${section}: ${error.message}`, 'error');
    }
}

// ----------------------------------------
// 1. DASHBOARD
// ----------------------------------------

async function loadDashboardData() {
    const stats = await fetchAPI(API_ENDPOINTS.STATS);
    
    if (!stats) return;

    // Mise à jour sécurisée des compteurs
    const updateCount = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || 0;
    };

    updateCount('stat-users', stats.totalUsers);
    updateCount('stat-rides', stats.totalRides);
    updateCount('stat-credits', stats.totalCredits);
    updateCount('stat-reviews', stats.pendingReviews);

    createActivityChart(stats.ridesByDay || []);
}

function createActivityChart(data) {
    const ctx = document.getElementById('activity-chart');
    if (!ctx) return;

    if (window.activityChart instanceof Chart) {
        window.activityChart.destroy();
    }

    // Protection contre données vides
    if (!Array.isArray(data)) data = [];

    const labels = data.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
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
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

// ----------------------------------------
// 2. UTILISATEURS
// ----------------------------------------

async function loadUsers() {
    const users = await fetchAPI(API_ENDPOINTS.USERS);
    const tbody = document.getElementById('users-table');
    
    if (!tbody) return;
    tbody.innerHTML = '';

    // BUG FIX: Vérification Array
    if (!Array.isArray(users) || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Aucun utilisateur trouvé</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${escapeHtml(user.pseudo)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td><span class="badge ${getBadgeClass(user.user_type)}">${user.user_type}</span></td>
            <td><span class="badge ${user.isSuspended ? 'danger' : 'success'}">${user.isSuspended ? 'Suspendu' : 'Actif'}</span></td>
            <td>${new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}</td>
            <td>
                ${user.user_type !== 'admin' ? `
                <button class="btn btn-sm ${user.isSuspended ? 'btn-primary' : 'btn-warning'}" 
                        onclick="toggleUserStatus(${user.id}, ${user.isSuspended})">
                    <i class="fas fa-${user.isSuspended ? 'check' : 'ban'}"></i>
                </button>` : ''}
            </td>
        </tr>
    `).join('');
    
    tbody.innerHTML = html;
}

// Activer/désactiver un utilisateur
async function toggleUserStatus(userId, isSuspended) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
            method: 'PUT'
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(
                isSuspended ? 'Utilisateur activé avec succès' : 'Utilisateur suspendu avec succès',
                'success'
            );
            loadUsers();
        } else {
            throw new Error('Erreur lors de la mise à jour du statut');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de mise à jour du statut', 'error');
    }
}

// ========================================
// GESTION DES TRAJETS
// ========================================
async function loadRides() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/rides/search?seats=1`);
        if (!response.ok) throw new Error('Erreur de chargement');
        
        const data = await response.json();
        const tbody = document.getElementById('rides-table');
        
        if (!data.success || !data.rides || data.rides.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">Aucun trajet trouvé</td></tr>';
            return;
        }

        const html = data.rides.map(ride => `
            <tr>
                <td>${escapeHtml(ride.departure)}</td>
                <td>${escapeHtml(ride.destination)}</td>
                <td>${escapeHtml(ride.driverName || 'N/A')}</td>
                <td>${new Date(ride.departure_date).toLocaleDateString('fr-FR')}</td>
                <td>${ride.price_per_seat} €</td>
                <td>${ride.available_seats}</td>
                <td><span class="badge ${ride.status === 'active' ? 'success' : 'danger'}">${ride.status}</span></td>
            </tr>
        `).join('');
        
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('rides-table').innerHTML = 
            '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #e74c3c;">Erreur de chargement des trajets</td></tr>';
    }
}

// ========================================
// GESTION DES EMPLOYÉS
// ========================================
async function loadEmployees() {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/users`);
        if (!response.ok) throw new Error('Erreur de chargement');
        
        const data = await response.json();
        const tbody = document.getElementById('employees-table');
        
        const employees = data.users.filter(u => u.user_type === 'employe');
        
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 40px;">Aucun employé trouvé</td></tr>';
            return;
        }

        const html = employees.map(emp => `
            <tr>
                <td>${escapeHtml(emp.pseudo)}</td>
                <td>${escapeHtml(emp.email)}</td>
                <td>${new Date(emp.createdAt || Date.now()).toLocaleDateString('fr-FR')}</td>
            </tr>
        `).join('');
        
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur de chargement des employés', 'error');
    }
}

// Créer un employé
document.getElementById('employee-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        pseudo: document.getElementById('emp-pseudo').value.trim(),
        email: document.getElementById('emp-email').value.trim(),
        password: document.getElementById('emp-password').value
    };
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/admin/employees`, {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Employé créé avec succès', 'success');
            e.target.reset();
            loadEmployees();
        } else {
            showNotification(result.msg || 'Erreur de création', 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message || 'Erreur de création de l\'employé', 'error');
    }
});

// ========================================
// NOTIFICATIONS
// ========================================
// showNotification est défini dans common.js