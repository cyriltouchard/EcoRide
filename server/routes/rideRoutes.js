// routes/rideRoutes.js - Routes pour ECF US9 (Gestion des covoiturages)
const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideHybridController'); // Contrôleur hybride
const { authenticateToken, requireDriver, requireAdmin } = require('../middleware/auth'); // Import hybride

// --- Routes pour les covoiturages (US9) ---

// @route   POST /api/rides
// @desc    Créer un nouveau covoiturage (US9)
// @access  Private (chauffeur requis)
router.post('/', requireDriver, rideController.createRide);

// @route   GET /api/rides/search
// @desc    Rechercher des covoiturages (US3)
// @access  Public
router.get('/search', rideController.searchRides);

// @route   GET /api/rides/my-rides
// @desc    Obtenir tous les trajets du chauffeur connecté (US9)
// @access  Private (chauffeur requis)
router.get('/my-rides', requireDriver, rideController.getMyRides);

// @route   GET /api/rides/statistics
// @desc    Statistiques des trajets (admin)
// @access  Private (admin requis)
router.get('/statistics', requireAdmin, rideController.getStatistics);

// @route   GET /api/rides/:id
// @desc    Obtenir un trajet spécifique (US5)
// @access  Public
router.get('/:id', rideController.getRideById);

// @route   PUT /api/rides/:id/status
// @desc    Changer le statut d'un trajet (US11 - démarrer/arrêter)
// @access  Private (chauffeur propriétaire)
router.put('/:id/status', requireDriver, rideController.updateRideStatus);

// @route   DELETE /api/rides/:id
// @desc    Annuler un trajet (US10)
// @access  Private (chauffeur propriétaire)
router.delete('/:id', requireDriver, rideController.cancelRide);

// @route   POST /api/rides/:id/book
// @desc    Réserver une place dans un covoiturage (US4)
// @access  Private (passager)
router.post('/:id/book', authenticateToken, rideController.bookRide);


module.exports = router;