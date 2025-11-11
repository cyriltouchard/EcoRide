const express = require('express');
const router = express.Router();
const reviewHybridController = require('../controllers/reviewHybridController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ================================================
// ROUTES PUBLIQUES (Lecture des avis)
// ================================================

// Obtenir les avis d'un chauffeur (public)
router.get('/driver/:driverId', reviewHybridController.getDriverReviews);

// Obtenir la note moyenne d'un chauffeur (public)
router.get('/driver/:driverId/rating', reviewHybridController.getDriverRating);

// Obtenir les avis du site (public)
router.get('/site', reviewHybridController.getSiteReviews);

// Obtenir les statistiques du site (public)
router.get('/site/stats', reviewHybridController.getSiteStats);

// ================================================
// ROUTES PROTÉGÉES (Nécessitent authentification)
// ================================================

// Créer un avis sur un chauffeur
router.post('/driver', authenticateToken, reviewHybridController.createDriverReview);

// Créer un avis sur le site
router.post('/site', authenticateToken, reviewHybridController.createSiteReview);

// Obtenir les trajets éligibles pour notation
router.get('/eligible-rides', authenticateToken, reviewHybridController.getEligibleRides);

// Obtenir mes propres avis donnés
router.get('/my-reviews', authenticateToken, reviewHybridController.getMyReviews);

// Répondre à un avis
router.post('/:reviewId/response', authenticateToken, reviewHybridController.respondToReview);

// Signaler un avis
router.post('/:reviewId/report', authenticateToken, reviewHybridController.reportReview);

module.exports = router;
