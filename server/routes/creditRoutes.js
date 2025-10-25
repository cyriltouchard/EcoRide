// server/routes/creditRoutes.js
// Routes API pour le système de crédits EcoRide

const express = require('express');
const router = express.Router();
const CreditModel = require('../models/creditModel');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// GET /api/credits/balance - Obtenir le solde de crédits
// ============================================
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const credits = await CreditModel.getUserCredits(userId);
        
        if (!credits) {
            return res.status(404).json({ 
                success: false, 
                message: 'Compte crédits introuvable' 
            });
        }
        
        res.json({
            success: true,
            data: {
                current_credits: credits.current_credits,
                total_earned: credits.total_earned,
                total_spent: credits.total_spent,
                last_transaction: credits.last_transaction
            }
        });
        
    } catch (error) {
        console.error('Erreur récupération crédits:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de la récupération des crédits' 
        });
    }
});

// ============================================
// GET /api/credits/history - Historique des transactions
// ============================================
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;
        
        const transactions = await CreditModel.getTransactionHistory(userId, limit);
        
        res.json({
            success: true,
            data: transactions,
            count: transactions.length
        });
        
    } catch (error) {
        console.error('Erreur historique crédits:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de la récupération de l\'historique' 
        });
    }
});

// ============================================
// POST /api/credits/add - Ajouter des crédits (admin seulement)
// ============================================
router.post('/add', authenticateToken, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Admin requis' 
            });
        }
        
        const { user_id, amount, description } = req.body;
        
        if (!user_id || !amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données invalides pour l\'ajout de crédits' 
            });
        }
        
        const result = await CreditModel.addCredits(
            user_id, 
            amount, 
            description || 'Ajout manuel par administrateur'
        );
        
        res.json({
            success: true,
            message: `${amount} crédits ajoutés avec succès`,
            data: result
        });
        
    } catch (error) {
        console.error('Erreur ajout crédits:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de l\'ajout de crédits' 
        });
    }
});

// ============================================
// POST /api/credits/spend - Dépenser des crédits (système interne)
// ============================================
router.post('/spend', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, description, booking_id, ride_id } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Montant invalide' 
            });
        }
        
        // Vérifier si l'utilisateur peut payer
        const canAfford = await CreditModel.canAfford(userId, amount);
        if (!canAfford) {
            return res.status(400).json({ 
                success: false, 
                message: 'Crédits insuffisants' 
            });
        }
        
        const result = await CreditModel.spendCredits(
            userId, 
            amount, 
            description || 'Dépense de crédits',
            { booking_id, ride_id }
        );
        
        res.json({
            success: true,
            message: `${amount} crédits dépensés`,
            data: result
        });
        
    } catch (error) {
        console.error('Erreur dépense crédits:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Erreur serveur lors de la dépense' 
        });
    }
});

// ============================================
// POST /api/credits/refund - Rembourser des crédits
// ============================================
router.post('/refund', authenticateToken, async (req, res) => {
    try {
        const { user_id, amount, description, booking_id, ride_id } = req.body;
        
        // Seuls admins et employés peuvent faire des remboursements
        if (!['admin', 'employe'].includes(req.user.user_type)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Autorisation insuffisante' 
            });
        }
        
        if (!user_id || !amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données invalides pour le remboursement' 
            });
        }
        
        const result = await CreditModel.refundCredits(
            user_id, 
            amount, 
            description || 'Remboursement',
            { booking_id, ride_id }
        );
        
        res.json({
            success: true,
            message: `Remboursement de ${amount} crédits effectué`,
            data: result
        });
        
    } catch (error) {
        console.error('Erreur remboursement:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors du remboursement' 
        });
    }
});

// ============================================
// GET /api/credits/stats - Statistiques plateforme (admin)
// ============================================
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Accès refusé - Admin requis' 
            });
        }
        
        const { date_start, date_end } = req.query;
        
        const earnings = await CreditModel.getPlatformEarnings(date_start, date_end);
        const totalEarnings = await CreditModel.getTotalPlatformEarnings();
        
        res.json({
            success: true,
            data: {
                daily_earnings: earnings,
                total_platform_earnings: totalEarnings,
                period: {
                    start: date_start || 'Début',
                    end: date_end || 'Aujourd\'hui'
                }
            }
        });
        
    } catch (error) {
        console.error('Erreur statistiques crédits:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erreur serveur lors de la récupération des statistiques' 
        });
    }
});

// ============================================
// POST /api/credits/process-booking - Processus complet de réservation
// ============================================
router.post('/process-booking', authenticateToken, async (req, res) => {
    try {
        const passengerId = req.user.id;
        const { driver_id, amount, ride_id, booking_id } = req.body;
        
        if (!driver_id || !amount || !ride_id || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Données invalides pour la réservation' 
            });
        }
        
        const result = await CreditModel.processBooking(
            passengerId, 
            driver_id, 
            amount, 
            ride_id, 
            booking_id
        );
        
        res.json({
            success: true,
            message: 'Réservation effectuée avec succès',
            data: result
        });
        
    } catch (error) {
        console.error('Erreur processus réservation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Erreur lors de la réservation' 
        });
    }
});

module.exports = router;