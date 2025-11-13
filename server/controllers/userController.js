const User = require('../models/userModel'); // MongoDB pour sessions/profils
const UserSQL = require('../models/userSQLModel'); // MySQL pour données relationnelles
const CreditModel = require('../models/creditModel'); // Système de crédits
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator'); // Validation des requêtes

// Helper: sanitize and validate inputs to avoid NoSQL injection
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

        let { pseudo, email, password } = req.body;
        
        // Validation des données
        pseudo = sanitizeString(pseudo);
        email = sanitizeString(email).toLowerCase();

        if (!pseudo || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Tous les champs sont requis" 
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Email invalide' });
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

        let { email, password } = req.body;
        email = sanitizeString(email).toLowerCase();
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Email et mot de passe requis" 
            });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: 'Email invalide' });
        }
        
        // Trouver l'utilisateur en MySQL
        // Use sanitized email to query SQL
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
    // Prevent NoSQL injection by ensuring email is a string and sanitized
    const safeEmail = sanitizeString(email).toLowerCase();
    const userMongo = await User.findOne({ email: safeEmail }).select('-password');
        
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
                profile_picture: userSQL.profile_picture || null,
                
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

// --- Mettre à jour la photo de profil ---
exports.updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profile_picture } = req.body;
        
        // Validation basique de l'image (base64 ou URL)
        if (!profile_picture) {
            return res.status(400).json({ 
                success: false, 
                message: 'Image requise' 
            });
        }

        // Vérifier la taille de l'image (limite à 5MB en base64)
        const base64SizeInBytes = profile_picture.length * 0.75; // Approximation
        if (base64SizeInBytes > 5 * 1024 * 1024) {
            return res.status(413).json({ 
                success: false, 
                message: 'Image trop volumineuse. Maximum 5MB.' 
            });
        }
        
        await UserSQL.updateProfile(userId, { profile_picture });
        
        res.json({ 
            success: true, 
            message: 'Photo de profil mise à jour avec succès',
            data: { profile_picture }
        });
    } catch (err) {
        console.error('Erreur updateProfilePicture:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la mise à jour de la photo',
            error: err.message 
        });
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
