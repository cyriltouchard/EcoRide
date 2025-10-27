const express = require('express');
const router = express.Router();
const { check } = require('express-validator'); 
const userController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth'); // Nouveau middleware hybride
const User = require('../models/userModel'); // Pas directement utilisé dans les routes si la logique est dans le contrôleur


// @route   POST api/users/register
// @desc    Enregistrer un nouvel utilisateur (HYBRIDE MySQL + MongoDB)
// @access  Public
router.post('/register', [
    check('pseudo', 'Le pseudo est requis').not().isEmpty(),
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe doit contenir 6 caractères ou plus').isLength({ min: 6 })
], userController.register);

// @route   POST api/users/login
// @desc    Authentifier un utilisateur et obtenir un token (HYBRIDE)
// @access  Public
router.post('/login', [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists()
], userController.login);

// @route   GET api/users/me
// @desc    Obtenir les données de l'utilisateur connecté (HYBRIDE)
// @access  Private
router.get('/me', authenticateToken, userController.getUserProfile);

// @route   PUT api/users/profile
// @desc    Mettre à jour le profil utilisateur (pseudo, email, phone, bio)
// @access  Private
router.put('/profile', authenticateToken, userController.updateProfile);

// @route   PUT api/users/profile-picture
// @desc    Mettre à jour la photo de profil
// @access  Private
router.put('/profile-picture', authenticateToken, userController.updateProfilePicture);

// @route   PUT api/users/type
// @desc    Mettre à jour le type d'utilisateur (passager/chauffeur/chauffeur_passager)
// @access  Private
router.put('/type', authenticateToken, userController.updateUserType);

module.exports = router;