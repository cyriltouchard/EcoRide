/**
 * EcoRide - Module de validation sécurisé
 * Contient des regex optimisées et sécurisées contre ReDoS
 * @file validation.js
 */

/**
 * Expression régulière pour valider les emails
 * Basée sur la RFC 5322 (simplifiée) - Sécurisée contre ReDoS
 * 
 * Cette regex évite le backtracking excessif en utilisant:
 * - Des quantificateurs bornés {0,61} au lieu de +
 * - Des groupes non-capturants (?:...)
 * - Des classes de caractères spécifiques au lieu de négations larges
 * 
 * @type {RegExp}
 * @see https://owasp.org/www-community/OWASP_Validation_Regex_Repository
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Expression régulière pour valider les numéros de téléphone français
 * Format: 0XXXXXXXXX (10 chiffres commençant par 0)
 * 
 * @type {RegExp}
 */
export const PHONE_REGEX = /^0[1-9]\d{8}$/;

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} True si l'email est valide
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    
    // Vérification de la longueur max (RFC 5321)
    if (email.length > 254) return false;
    
    return EMAIL_REGEX.test(email.trim());
};

/**
 * Valide un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} True si le numéro est valide
 */
export const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    
    // Retirer les espaces
    const cleaned = phone.replace(/\s/g, '');
    
    return PHONE_REGEX.test(cleaned);
};

/**
 * Valide un pseudo
 * @param {string} pseudo - Pseudo à valider
 * @param {number} minLength - Longueur minimale (défaut: 3)
 * @param {number} maxLength - Longueur maximale (défaut: 50)
 * @returns {boolean} True si le pseudo est valide
 */
export const isValidPseudo = (pseudo, minLength = 3, maxLength = 50) => {
    if (!pseudo || typeof pseudo !== 'string') return false;
    
    const trimmed = pseudo.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @param {number} minLength - Longueur minimale (défaut: 8)
 * @returns {boolean} True si le mot de passe est valide
 */
export const isValidPassword = (password, minLength = 8) => {
    if (!password || typeof password !== 'string') return false;
    
    return password.length >= minLength;
};

/**
 * Valide un âge minimum
 * @param {string|Date} birthDate - Date de naissance
 * @param {number} minAge - Âge minimum requis (défaut: 18)
 * @returns {boolean} True si l'âge est valide
 */
export const isValidAge = (birthDate, minAge = 18) => {
    if (!birthDate) return false;
    
    const birth = new Date(birthDate);
    const age = (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    return age >= minAge;
};
