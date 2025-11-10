/**
 * EcoRide - Page employé
 * Gestion de l'espace employé
 * @file employe.js
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('👔 Page employé initialisée');
    
    const userToken = localStorage.getItem('token');
    
    if (!userToken) {
        showNotification("Vous devez être connecté pour accéder à cette page.", "error");
        return setTimeout(() => window.location.href = 'connexion.html', 2000);
    }
    
    // Vérifier les droits d'accès employé
    const checkEmployeeAccess = async () => {
        try {
            const fetchWithAuth = createFetchWithAuth(userToken);
            const response = await fetchWithAuth(`${API_BASE_URL}/users/me`);
            const data = response.data || response;
            
            if (data.user_type !== 'employe' && data.user_type !== 'admin') {
                showNotification("Accès réservé aux employés", "error");
                setTimeout(() => window.location.href = 'index.html', 2000);
            }
        } catch (error) {
            console.error('❌ Erreur vérification accès:', error);
            showNotification("Erreur de vérification des droits d'accès", "error");
        }
    };
    
    checkEmployeeAccess();
    
    // Ajouter ici la logique spécifique de la page employé
    // (gestion des utilisateurs, modération, etc.)
});
