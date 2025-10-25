// middleware/auth.js - Authentification hybride pour EcoRide
const jwt = require('jsonwebtoken');

// Middleware d'authentification principal
const authenticateToken = function (req, res, next) {
    // Obtenir le token depuis l'en-tête Authorization ou x-auth-token
    let token = req.header('x-auth-token') || req.header('Authorization');
    
    // Si le token commence par "Bearer ", on l'enlève
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
    }

    // Vérifier si pas de token
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Aucun token, autorisation refusée' 
        });
    }

    // Vérifier le token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contient { id, pseudo, user_type, mongo_id }
        next();
    } catch (err) {
        res.status(401).json({ 
            success: false,
            message: 'Token non valide' 
        });
    }
};

// Middleware pour vérifier les rôles spécifiques
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentification requise'
            });
        }
        
        const userRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!userRoles.includes(req.user.user_type)) {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - Rôle insuffisant'
            });
        }
        
        next();
    };
};

// Middleware pour les administrateurs
const requireAdmin = requireRole('admin');

// Middleware pour les employés et admin
const requireEmployee = requireRole(['employe', 'admin']);

// Middleware pour les chauffeurs
const requireDriver = requireRole(['chauffeur', 'chauffeur_passager']);

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireEmployee,
    requireDriver
};