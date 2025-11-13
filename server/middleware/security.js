// SCRIPT D'AMÉLIORATION DE LA SÉCURITÉ - ECORIDE
// Fichier: server/middleware/security.js

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Configuration Rate Limiting
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// Rate limits spécifiques
const loginLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 tentatives max
    'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
);

const registerLimiter = createRateLimit(
    60 * 60 * 1000, // 1 heure
    3, // 3 inscriptions max par heure
    'Limite d\'inscriptions atteinte. Réessayez dans une heure.'
);

const generalLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    1000, // 1000 requêtes max (augmenté pour le développement)
    'Trop de requêtes. Ralentissez le rythme.'
);

// Configuration Helmet avancée
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

module.exports = {
    loginLimiter,
    registerLimiter,
    generalLimiter,
    helmetConfig
};