// routes/vehicleRoutes.js - Version hybride MySQL+MongoDB pour ECF US8
const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleHybridController'); // Contrôleur hybride
const { authenticateToken, requireDriver } = require('../middleware/auth'); // Nouveau middleware hybride

// --- Routes pour les véhicules (US8) ---

// @route   GET /api/vehicles/me
// @desc    Obtenir tous les véhicules de l'utilisateur connecté
// @access  Private
router.get('/me', authenticateToken, vehicleController.getVehicles);

// @route   POST /api/vehicles
// @desc    Ajouter un nouveau véhicule (US8 - chauffeur requis)
// @access  Private (chauffeur)
router.post('/', requireDriver, vehicleController.addVehicle);

// @route   GET /api/vehicles/:id
// @desc    Obtenir un véhicule spécifique par ID
// @access  Private
router.get('/:id', authenticateToken, vehicleController.getVehicleById);

// @route   PUT /api/vehicles/:id
// @desc    Mettre à jour un véhicule spécifique par ID
// @access  Private
router.put('/:id', authenticateToken, vehicleController.updateVehicle);

// @route   DELETE /api/vehicles/:id
// @desc    Supprimer un véhicule spécifique par ID
// @access  Private
router.delete('/:id', authenticateToken, vehicleController.deleteVehicle);

// --- Nouvelles routes pour US8 : Préférences chauffeur ---

// @route   POST /api/vehicles/preferences
// @desc    Définir les préférences de chauffeur (US8)
// @access  Private (chauffeur requis)
router.post('/preferences', requireDriver, vehicleController.setDriverPreferences);

// @route   GET /api/vehicles/preferences
// @desc    Obtenir les préférences de chauffeur
// @access  Private
router.get('/preferences', authenticateToken, vehicleController.getDriverPreferences);

// @route   GET /api/vehicles/driver-profile
// @desc    Obtenir le profil complet de chauffeur (US8)
// @access  Private
router.get('/driver-profile', authenticateToken, vehicleController.getDriverProfile);


module.exports = router;