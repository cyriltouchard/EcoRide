/**
 * Gestionnaire centralisé des erreurs
 * Réduit la duplication des blocs try-catch
 */

/**
 * Wrapper asynchrone pour les routes Express
 * Capture automatiquement les erreurs et les passe au middleware d'erreur
 * 
 * @param {Function} fn - Fonction async du contrôleur
 * @returns {Function} Fonction wrappée
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Gère les erreurs courantes et retourne une réponse appropriée
 * 
 * @param {Error} error - Erreur à traiter
 * @param {object} res - Objet response Express
 * @param {string} defaultMessage - Message par défaut si erreur inconnue
 */
const handleError = (error, res, defaultMessage = 'Erreur serveur') => {
    console.error('Error:', error);

    // Erreur de validation Mongoose
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(el => el.message);
        return res.status(400).json({ msg: errors.join(', ') });
    }

    // Erreur ObjectId invalide
    if (error.kind === 'ObjectId' || error.name === 'CastError') {
        return res.status(404).json({ msg: 'Ressource non trouvée.' });
    }

    // Erreur de duplication (clé unique)
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({ msg: `${field} déjà utilisé.` });
    }

    // Erreur JWT
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ msg: 'Token invalide.' });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ msg: 'Token expiré.' });
    }

    // Erreur par défaut
    return res.status(500).json({ msg: defaultMessage });
};

/**
 * Middleware d'erreur global pour Express
 * À placer en fin de stack de middlewares
 */
const errorMiddleware = (err, req, res, next) => {
    console.error('Global error handler:', err);
    handleError(err, res);
};

module.exports = {
    asyncHandler,
    handleError,
    errorMiddleware
};
