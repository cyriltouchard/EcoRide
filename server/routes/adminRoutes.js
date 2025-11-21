const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Toutes les routes ici sont protégées et nécessitent le rôle admin
router.use(authenticateToken, requireAdmin);

// Routes
router.post('/employees', adminController.createEmployee);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/stats', adminController.getStats);

module.exports = router;
