const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, isAdmin } = require('../middleware/auth'); // Utilise le nouveau middleware isAdmin

// Toutes les routes ici sont protégées et nécessitent le rôle admin
router.use(auth, isAdmin);

// Routes
router.post('/employees', adminController.createEmployee);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/stats', adminController.getStats);

module.exports = router;
