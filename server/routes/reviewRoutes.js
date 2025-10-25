const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth, isEmployee } = require('../middleware/auth'); // Utilise le nouveau middleware isEmployee

// Toutes les routes ici sont protégées et nécessitent au minimum le rôle employé
router.use(auth, isEmployee);

// Routes
router.get('/pending', reviewController.getPendingReviews);
router.put('/:id/status', reviewController.updateReviewStatus);

module.exports = router;
