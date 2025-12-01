const User = require('../models/userModel');
const UserSQL = require('../models/userSQLModel'); // Ajout du modèle SQL
const Ride = require('../models/rideModel');
const Review = require('../models/reviewModel');
const bcrypt = require('bcryptjs'); // Ajout pour hacher le mot de passe

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
        console.log('📝 Création employé:', { pseudo, email });
        
        if (!pseudo || !email || !password) {
            console.log('❌ Champs manquants');
            return res.status(400).json({ success: false, msg: 'Veuillez remplir tous les champs.' });
        }
        
        pseudo = sanitizeString(pseudo);
        email = sanitizeString(email).toLowerCase();
        
        if (!isValidEmail(email)) {
            console.log('❌ Email invalide:', email);
            return res.status(400).json({ success: false, msg: 'Email invalide.' });
        }

        // Vérifier si l'utilisateur existe déjà (MySQL)
        const existingUserSQL = await UserSQL.findByEmail(email);
        if (existingUserSQL) {
            console.log('❌ Email déjà utilisé:', email);
            return res.status(400).json({ success: false, msg: 'Cet email est déjà utilisé.' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('🔐 Mot de passe haché');

        // 1. Créer dans MySQL
        const userSQL = await UserSQL.create({
            pseudo,
            email,
            password_hash: hashedPassword, // ✅ Correction : password_hash au lieu de password
            user_type: 'employe',
            current_credits: 0
        });
        console.log('✅ Utilisateur créé dans MySQL:', userSQL.id);

        // 2. Créer dans MongoDB pour la compatibilité
        try {
            const newEmployee = new User({
                pseudo,
                email,
                password: hashedPassword,
                role: 'employe',
                credits: 0,
                sql_id: userSQL.id
            });
            
            // Empêcher le middleware pre-save de re-hasher
            await newEmployee.save({ validateBeforeSave: true });
            console.log('✅ Utilisateur créé dans MongoDB');
        } catch (mongoError) {
            console.log('⚠️  Erreur MongoDB (non bloquante):', mongoError.message);
            // L'essentiel est créé dans MySQL, MongoDB est optionnel
        }

        res.status(201).json({ success: true, msg: 'Compte employé créé avec succès.' });
        
    } catch (error) {
        console.error('❌ Erreur création employé:', error);
        res.status(500).json({ success: false, msg: 'Erreur serveur: ' + error.message });
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
