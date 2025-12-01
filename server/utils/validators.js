/**
 * Utilitaires de validation et sanitization réutilisables
 * Réduit la duplication de code dans les contrôleurs
 */

/**
 * Sanitize une chaîne de caractères
 * @param {*} s - Valeur à sanitizer
 * @returns {string} Chaîne sanitizée
 */
const sanitizeString = (s) => (typeof s === 'string' ? s.trim() : '');

/**
 * Normalise une plaque d'immatriculation
 * @param {string} plate - Plaque à normaliser
 * @returns {string} Plaque normalisée (majuscules, limitée à 20 caractères)
 */
const normalizePlate = (plate) => {
    const normalized = sanitizeString(plate).toUpperCase();
    return normalized.length > 20 ? normalized.slice(0, 20) : normalized;
};

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} true si valide
 */
const isValidEmail = (email) => {
    const sanitized = sanitizeString(email).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) && sanitized.length <= 100;
};

/**
 * Parse de manière sécurisée un ID en entier
 * @param {*} id - ID à parser
 * @returns {number|null} ID parsé ou null si invalide
 */
const parseId = (id) => {
    const parsed = Number.parseInt(id, 10);
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
};

/**
 * Formatte une réponse d'erreur standard
 * @param {object} res - Objet response Express
 * @param {number} status - Code HTTP
 * @param {string} message - Message d'erreur
 * @returns {object} Réponse JSON
 */
const errorResponse = (res, status, message) => {
    return res.status(status).json({ msg: message });
};

/**
 * Formatte une réponse de succès standard
 * @param {object} res - Objet response Express
 * @param {number} status - Code HTTP
 * @param {string} message - Message de succès
 * @param {object} data - Données à retourner
 * @returns {object} Réponse JSON
 */
const successResponse = (res, status, message, data = null) => {
    const response = { msg: message };
    if (data) {
        Object.assign(response, data);
    }
    return res.status(status).json(response);
};

/**
 * Gère les erreurs de validation Mongoose
 * @param {Error} err - Erreur Mongoose
 * @returns {string} Message d'erreur formaté
 */
const formatValidationErrors = (err) => {
    if (err.name === 'ValidationError') {
        return Object.values(err.errors).map(el => el.message).join(', ');
    }
    return 'Erreur de validation';
};

/**
 * Vérifie si un ObjectId est valide
 * @param {string} id - ID à vérifier
 * @returns {boolean} true si valide
 */
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Extrait et valide les champs requis du body
 * @param {object} body - Objet req.body
 * @param {string[]} requiredFields - Champs requis
 * @returns {object} { isValid: boolean, missingFields: string[] }
 */
const validateRequiredFields = (body, requiredFields) => {
    const missingFields = requiredFields.filter(field => !body[field]);
    return {
        isValid: missingFields.length === 0,
        missingFields
    };
};

/**
 * Limite la longueur d'une chaîne
 * @param {string} str - Chaîne à limiter
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Chaîne limitée
 */
const limitString = (str, maxLength) => {
    const sanitized = sanitizeString(str);
    return sanitized.length > maxLength ? sanitized.slice(0, maxLength) : sanitized;
};

module.exports = {
    sanitizeString,
    normalizePlate,
    isValidEmail,
    parseId,
    errorResponse,
    successResponse,
    formatValidationErrors,
    isValidObjectId,
    validateRequiredFields,
    limitString
};
