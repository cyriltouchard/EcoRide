const User = require('../models/userModel');
const Ride = require('../models/rideModel');
const Review = require('../models/reviewModel');

// Helper: sanitize simple strings and validate emails to prevent NoSQL injection
const sanitizeString = (s) => (typeof s === 'string' ? s.trim() : '');

/**
 * Valide une adresse email (sécurisé contre ReDoS)
 * Utilise une regex optimisée basée sur RFC 5322 (simplifiée)
 * Évite le backtracking excessif avec quantificateurs bornés
 */
const isValidEmail = (e) => {
    if (typeof e !== 'string') return false;
    const email = e.trim();
    if (email.length === 0 || email.length > 254) return false;
    
    // Regex sécurisée contre ReDoS avec quantificateurs bornés
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
};

// Créer un employé
exports.createEmployee = async (req, res) => {
    let { pseudo, email, password } = req.body;
    try {
        if (!pseudo || !email || !password) {
            return res.status(400).json({ msg: 'Veuillez remplir tous les champs.' });
        }
        pseudo = sanitizeString(pseudo);
        email = sanitizeString(email).toLowerCase();
        if (!isValidEmail(email)) {
            return res.status(400).json({ msg: 'Email invalide.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Cet email est déjà utilisé.' });
        }
        const newEmployee = new User({
            pseudo,
            email,
            password,
            role: 'employe'
        });
        await newEmployee.save();
        res.status(201).json({ msg: 'Compte employé créé avec succès.' });
    } catch (error) {
        res.status(500).json({ msg: 'Erreur serveur.' });
    }
};

// Obtenir tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ msg: 'Erreur serveur.' });
    }
};

// Suspendre / Réactiver un utilisateur
exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'Utilisateur non trouvé.' });
        }
        // L'admin ne peut pas se suspendre lui-même
        if (user.role === 'admin') {
             return res.status(400).json({ msg: 'Un administrateur ne peut pas être suspendu.' });
        }
        user.isSuspended = !user.isSuspended;
        await user.save();
        res.json({ msg: `Utilisateur ${user.isSuspended ? 'suspendu' : 'réactivé'}.`});
    } catch (error) {
        res.status(500).json({ msg: 'Erreur serveur.' });
    }
};

// Obtenir les statistiques
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRides = await Ride.countDocuments();
        const pendingReviews = await Review.countDocuments({ status: 'pending' });
        
        // Calcul des crédits (simplifié)
        const completedRides = await Ride.find({ status: 'completed' });
        const totalCredits = completedRides.length * 2; // 2 crédits par trajet terminé

        // Données pour les graphiques
        const ridesByDay = await Ride.aggregate([
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalUsers,
            totalRides,
            pendingReviews,
            totalCredits,
            ridesByDay
        });
    } catch (error) {
        res.status(500).json({ msg: 'Erreur serveur.' });
    }
};
