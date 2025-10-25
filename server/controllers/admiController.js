const User = require('../models/userModel');
const Ride = require('../models/rideModel');
const Review = require('../models/reviewModel');

// Créer un employé
exports.createEmployee = async (req, res) => {
    const { pseudo, email, password } = req.body;
    try {
        if (!pseudo || !email || !password) {
            return res.status(400).json({ msg: 'Veuillez remplir tous les champs.' });
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
