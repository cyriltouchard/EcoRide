// VALIDATION AVANCÉE - ECORIDE
// Fichier: server/middleware/validation.js

const { body, validationResult } = require('express-validator');

// Validation pour l'inscription
const validateRegister = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide')
        .isLength({ max: 255 })
        .withMessage('Email trop long'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
    
    body('prenom')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .withMessage('Le prénom ne peut contenir que des lettres, espaces et tirets'),
    
    body('nom')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères')
        .matches(/^[a-zA-ZÀ-ÿ\s-]+$/)
        .withMessage('Le nom ne peut contenir que des lettres, espaces et tirets'),
    
    body('telephone')
        .optional()
        .matches(/^(?:\+33|0)[1-9](?:[0-9]{8})$/)
        .withMessage('Numéro de téléphone français invalide')
];

// Validation pour la connexion
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    
    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis')
];

// Validation pour les trajets
const validateRide = [
    body('depart')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le lieu de départ doit contenir entre 2 et 100 caractères'),
    
    body('arrivee')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Le lieu d\'arrivée doit contenir entre 2 et 100 caractères'),
    
    body('date_depart')
        .isISO8601()
        .withMessage('Date de départ invalide')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('La date de départ doit être dans le futur');
            }
            return true;
        }),
    
    body('places_disponibles')
        .isInt({ min: 1, max: 8 })
        .withMessage('Le nombre de places doit être entre 1 et 8'),
    
    body('prix')
        .isFloat({ min: 0, max: 200 })
        .withMessage('Le prix doit être entre 0 et 200 euros')
];

// Middleware pour traiter les erreurs de validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: errors.array()
        });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateRide,
    handleValidationErrors
};