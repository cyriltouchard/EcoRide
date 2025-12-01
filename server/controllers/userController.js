const User = require('../models/userModel'); // MongoDB pour sessions/profils étendus
const UserSQL = require('../models/userSQLModel'); // MySQL pour données relationnelles
const CreditModel = require('../models/creditModel'); // Système de crédits
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { 
    sanitizeString, 
    isValidEmail, 
    errorResponse, 
    successResponse,
    limitString 
} = require('../utils/validators');
const { handleError } = require('../utils/errorHandler');

// --- CONTRÔLEURS ---

/**
 * INSCRIPTION HYBRIDE (MySQL + MongoDB)
 */
exports.register = async (req, res) => {
    try {
        // 1. Validation des entrées
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: "Erreurs de validation", errors: errors.array() });
        }

        let { pseudo, email, password } = req.body;
        pseudo = sanitizeString(pseudo);
        email = sanitizeString(email).toLowerCase();

        if (!pseudo || !email || !password) {
            return errorResponse(res, 400, "Tous les champs sont requis");
        }

        if (!isValidEmail(email)) {
            return errorResponse(res, 400, 'Email invalide');
        }

        // 2. Vérifications d'unicité (MySQL)
        const existingUserSQL = await UserSQL.findByEmail(email);
        if (existingUserSQL) {
            return errorResponse(res, 400, "Cet email est déjà utilisé.");
        }

        const existingPseudo = await UserSQL.findByPseudo(pseudo);
        if (existingPseudo) {
            return errorResponse(res, 400, "Ce pseudo est déjà utilisé.");
        }

        // 3. Hashage du mot de passe
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 4. Création MySQL (Données critiques + Crédits initiaux)
        const newUserSQL = await UserSQL.create({
            pseudo,
            email,
            password_hash,
            user_type: 'passager' // Par défaut
        });

        // 5. Création MongoDB (Données étendues / Profil)
        // On lie les deux via sql_id
        const newUserMongo = new User({
            pseudo,
            email,
            password: password_hash,
            sql_id: newUserSQL.id 
        });
        await newUserMongo.save();

        // 6. Génération du Token JWT
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

        // 7. Récupération des crédits (Normalement 20 à la création)
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
                    role: newUserSQL.user_type, // Important pour le front
                    user_type: newUserSQL.user_type,
                    credits: credits?.current_credits || 20
                }
            }
        });

    } catch (err) {
        console.error('Erreur inscription:', err);
        return handleError(err, res, "Erreur serveur lors de l'inscription");
    }
};

/**
 * CONNEXION (Authentification MySQL)
 */
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: "Erreurs de validation", errors: errors.array() });
        }

        let { email, password } = req.body;
        email = sanitizeString(email).toLowerCase();

        if (!email || !password) {
            return errorResponse(res, 400, "Email et mot de passe requis");
        }

        // 1. Recherche utilisateur (MySQL)
        const userSQL = await UserSQL.findByEmail(email);
        if (!userSQL) {
            return errorResponse(res, 400, "Identifiants invalides.");
        }

        // 2. Vérification mot de passe
        const isMatch = await bcrypt.compare(password, userSQL.password_hash);
        if (!isMatch) {
            return errorResponse(res, 400, "Identifiants invalides.");
        }

        // 3. Récupération infos MongoDB (Optionnel mais recommandé pour cohérence)
        const userMongo = await User.findOne({ email: email }).select('-password');

        // 4. Génération Token
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
                    // ✅ CORRECTION IMPORTANTE POUR L'ADMIN : 
                    // On mappe user_type vers role pour que admin.js comprenne
                    role: userSQL.user_type, 
                    user_type: userSQL.user_type,
                    credits: userSQL.current_credits || 0
                }
            }
        });

    } catch (err) {
        console.error('Erreur connexion:', err);
        res.status(500).json({ success: false, message: "Erreur serveur lors de la connexion" });
    }
};

/**
 * PROFIL UTILISATEUR (Agrégation MySQL + MongoDB)
 */
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Données Relationnelles (MySQL)
        const userSQL = await UserSQL.findById(userId);
        if (!userSQL) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
        }

        // 2. Données Non-Relationnelles (MongoDB)
        // On cherche soit par ID SQL, soit par email pour être sûr
        const userMongo = await User.findOne({
            $or: [{ sql_id: userId }, { email: userSQL.email }]
        }).select('-password');

        // 3. Crédits
        const credits = await CreditModel.getUserCredits(userId);

        res.json({
            success: true,
            data: {
                // Info Base
                id: userSQL.id,
                pseudo: userSQL.pseudo,
                email: userSQL.email,
                
                // ✅ CORRECTION IMPORTANTE POUR L'ADMIN :
                role: userSQL.user_type,
                user_type: userSQL.user_type,
                
                created_at: userSQL.created_at,
                profile_picture: userSQL.profile_picture || null,

                // Info Crédits
                credits: userSQL.current_credits || credits?.current_credits || 0,
                total_earned: credits?.total_earned || 0,
                total_spent: credits?.total_spent || 0,

                // Info Mongo (Préférences, etc.)
                preferences: userMongo?.preferences || {},
                settings: userMongo?.settings || {}
            }
        });

    } catch (err) {
        console.error('Erreur profil utilisateur:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur récupération profil' });
    }
};

/**
 * MISE À JOUR TYPE UTILISATEUR (Passager -> Chauffeur)
 */
exports.updateUserType = async (req, res) => {
    try {
        const userId = req.user.id;
        const { user_type } = req.body;

        const validTypes = ['passager', 'chauffeur', 'chauffeur_passager'];
        if (!validTypes.includes(user_type)) {
            return res.status(400).json({ success: false, message: 'Type d\'utilisateur invalide' });
        }

        const success = await UserSQL.updateUserType(userId, user_type);

        if (success) {
            res.json({
                success: true,
                message: 'Type d\'utilisateur mis à jour',
                data: { user_type }
            });
        } else {
            res.status(400).json({ success: false, message: 'Échec de la mise à jour' });
        }

    } catch (err) {
        console.error('Erreur mise à jour type:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

/**
 * MISE À JOUR PROFIL (MySQL)
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { pseudo, email, phone, bio } = req.body;

        const updateData = {};
        if (pseudo) updateData.pseudo = sanitizeString(pseudo);
        if (email) updateData.email = sanitizeString(email);
        if (phone !== undefined) updateData.phone = sanitizeString(phone);
        if (bio !== undefined) updateData.bio = sanitizeString(bio);

        await UserSQL.updateProfile(userId, updateData);

        // TODO: Penser à mettre à jour MongoDB ici aussi si on veut synchro le pseudo/email

        res.json({ success: true, message: 'Profil mis à jour avec succès' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * MISE À JOUR PHOTO DE PROFIL
 */
exports.updateProfilePicture = async (req, res) => {
    try {
        const userId = req.user.id;
        const { profile_picture } = req.body;

        if (!profile_picture) {
            return res.status(400).json({ success: false, message: 'Image requise' });
        }

        // Vérification taille (approx 5MB max en base64)
        const base64SizeInBytes = profile_picture.length * 0.75;
        if (base64SizeInBytes > 5 * 1024 * 1024) {
            return res.status(413).json({ success: false, message: 'Image trop volumineuse. Maximum 5MB.' });
        }

        await UserSQL.updateProfile(userId, { profile_picture });

        res.json({
            success: true,
            message: 'Photo de profil mise à jour avec succès',
            data: { profile_picture }
        });
    } catch (err) {
        console.error('Erreur updateProfilePicture:', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la photo' });
    }
};

/**
 * DEVENIR CHAUFFEUR (Raccourci métier)
 */
exports.becomeDriver = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await UserSQL.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        let newUserType = 'chauffeur';
        // Si déjà passager, on devient hybride
        if (user.user_type === 'passager') {
            newUserType = 'chauffeur_passager';
        }

        await UserSQL.updateUserType(userId, newUserType);

        res.json({
            success: true,
            message: 'Vous êtes maintenant chauffeur !',
            data: { user_type: newUserType }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};