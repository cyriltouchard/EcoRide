const User = require('../models/userModel'); // MongoDB pour sessions/profils
const UserSQL = require('../models/userSQLModel'); // MySQL pour données relationnelles
const CreditModel = require('../models/creditModel'); // Système de crédits
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator'); // Validation des requêtes

// --- Inscription HYBRIDE (MySQL + MongoDB) ---
exports.register = async (req, res) => {
    try {
        // Vérifier les erreurs de validation express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                message: "Erreurs de validation",
                errors: errors.array()
            });
        }

        const { pseudo, email, password } = req.body;
        
        // Validation des données
        if (!pseudo || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Tous les champs sont requis" 
            });
        }
        
        // Vérifier si l'email existe déjà en MySQL
        const existingUserSQL = await UserSQL.findByEmail(email);
        if (existingUserSQL) {
            return res.status(400).json({ 
                success: false,
                message: "Cet email est déjà utilisé." 
            });
        }
        
        // Vérifier si le pseudo existe en MySQL
        const existingPseudo = await UserSQL.findByPseudo(pseudo);
        if (existingPseudo) {
            return res.status(400).json({ 
                success: false,
                message: "Ce pseudo est déjà utilisé." 
            });
        }
        
        // Hasher le mot de passe
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);
        
        // Créer l'utilisateur en MySQL (avec crédits automatiques)
        const newUserSQL = await UserSQL.create({
            pseudo,
            email,
            password_hash,
            user_type: 'passager'
        });
        
        // Créer aussi en MongoDB pour les sessions/profils étendus
        const newUserMongo = new User({ 
            pseudo, 
            email, 
            password: password_hash,
            sql_id: newUserSQL.id // Référence vers MySQL
        });
        await newUserMongo.save();
        
        // Générer le token JWT
        const token = jwt.sign(
            { 
                id: newUserSQL.id, 
                pseudo: newUserSQL.pseudo,
                user_type: newUserSQL.user_type,
                mongo_id: newUserMongo._id
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        // Récupérer les crédits initiaux
        const credits = await CreditModel.getUserCredits(newUserSQL.id);
        
        res.status(201).json({ 
            success: true,
            message: "Compte créé avec succès",
            data: {
                token,
                user: {
                    id: newUserSQL.id,
                    pseudo: newUserSQL.pseudo,
                    email: newUserSQL.email,
                    user_type: newUserSQL.user_type,
                    credits: credits?.current_credits || 20
                }
            }
        });

    } catch (err) {
        console.error('Erreur inscription:', err);
        res.status(500).json({ 
            success: false,
            message: "Erreur serveur lors de l'inscription",
            error: err.message 
        });
    }
};

// --- Connexion HYBRIDE ---
exports.login = async (req, res) => {
    try {
        // Vérifier les erreurs de validation express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                message: "Erreurs de validation",
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Email et mot de passe requis" 
            });
        }
        
        // Trouver l'utilisateur en MySQL
        const userSQL = await UserSQL.findByEmail(email);
        if (!userSQL) {
            return res.status(400).json({ 
                success: false,
                message: "Identifiants invalides." 
            });
        }
        
        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, userSQL.password_hash);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: "Identifiants invalides." 
            });
        }
        
        // Trouver l'utilisateur MongoDB correspondant
        const userMongo = await User.findOne({ email });
        
        // Générer le token JWT avec toutes les infos
        const token = jwt.sign(
            { 
                id: userSQL.id, 
                pseudo: userSQL.pseudo,
                user_type: userSQL.user_type,
                mongo_id: userMongo?._id
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.json({ 
            success: true,
            message: "Connexion réussie",
            data: {
                token,
                user: {
                    id: userSQL.id,
                    pseudo: userSQL.pseudo,
                    email: userSQL.email,
                    user_type: userSQL.user_type,
                    credits: userSQL.current_credits || 0
                }
            }
        });

    } catch (err) {
        console.error('Erreur connexion:', err);
        res.status(500).json({ 
            success: false,
            message: "Erreur serveur lors de la connexion",
            error: err.message 
        });
    }
};

// --- Profil utilisateur HYBRIDE ---
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Récupérer les données depuis MySQL
        const userSQL = await UserSQL.findById(userId);
        if (!userSQL) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé.' 
            });
        }
        
        // Récupérer les données étendues depuis MongoDB (optionnel)
        const userMongo = await User.findOne({ 
            $or: [
                { sql_id: userId },
                { email: userSQL.email }
            ]
        }).select('-password');
        
        // Récupérer les crédits
        const credits = await CreditModel.getUserCredits(userId);
        
        res.json({
            success: true,
            data: {
                // Données de base (MySQL)
                id: userSQL.id,
                pseudo: userSQL.pseudo,
                email: userSQL.email,
                user_type: userSQL.user_type,
                created_at: userSQL.created_at,
                
                // Système de crédits
                credits: userSQL.current_credits || credits?.current_credits || 0,
                total_earned: credits?.total_earned || 0,
                total_spent: credits?.total_spent || 0,
                
                // Données étendues (MongoDB) si disponibles
                preferences: userMongo?.preferences || {},
                settings: userMongo?.settings || {}
            }
        });
        
    } catch (err) {
        console.error('Erreur profil utilisateur:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération du profil'
        });
    }
};

// --- Mettre à jour le type d'utilisateur ---
exports.updateUserType = async (req, res) => {
    try {
        const userId = req.user.id;
        const { user_type } = req.body;
        
        const validTypes = ['passager', 'chauffeur', 'chauffeur_passager'];
        if (!validTypes.includes(user_type)) {
            return res.status(400).json({
                success: false,
                message: 'Type d\'utilisateur invalide'
            });
        }
        
        const success = await UserSQL.updateUserType(userId, user_type);
        
        if (success) {
            res.json({
                success: true,
                message: 'Type d\'utilisateur mis à jour',
                data: { user_type }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Échec de la mise à jour'
            });
        }
        
    } catch (err) {
        console.error('Erreur mise à jour type:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};


// --- Mettre à jour le profil utilisateur ---
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pseudo, email, phone, bio } = req.body;
        
        const updateData = {};
        if (pseudo) updateData.pseudo = pseudo;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (bio !== undefined) updateData.bio = bio;
        
        const success = await UserSQL.updateProfile(userId, updateData);
        
        res.json({ success: true, message: 'Profil mis à jour avec succés' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profile_picture } = req.body;
        
        await UserSQL.updateProfile(userId, { profile_picture });
        
        res.json({ success: true, message: 'Photo mise à jour' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// --- Mettre à jour le profil utilisateur ---
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pseudo, email, phone, bio } = req.body;
        const updateData = {};
        if (pseudo) updateData.pseudo = pseudo;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (bio !== undefined) updateData.bio = bio;
        await UserSQL.updateProfile(userId, updateData);
        res.json({ success: true, message: 'Profil mis à jour' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profile_picture } = req.body;
        await UserSQL.updateProfile(userId, { profile_picture });
        res.json({ success: true, message: 'Photo mise à jour' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// --- Devenir chauffeur ---
exports.becomeDriver = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Récupérer l'utilisateur actuel
        const user = await UserSQL.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
        }
        
        // Mettre à jour le type d'utilisateur
        let newUserType = 'chauffeur';
        if (user.user_type === 'passager') {
            newUserType = 'chauffeur_passager';
        }
        
        await UserSQL.updateUserType(userId, newUserType);
        
        res.json({ 
            success: true, 
            message: 'Vous êtes maintenant chauffeur !',
            data: {
                user_type: newUserType
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
