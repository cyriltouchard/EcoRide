// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// @route   POST /api/contact
// @desc    Envoyer un message de contact
// @access  Public
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Le nom est requis'),
        body('email').isEmail().withMessage('Email invalide'),
        body('message').trim().notEmpty().withMessage('Le message est requis')
    ],
    async (req, res) => {
        try {
            // Vérifier les erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Erreurs de validation',
                    errors: errors.array()
                });
            }

            const { name, email, message } = req.body;

            // Log du message de contact (en production, vous pourriez l'envoyer par email ou le stocker en base de données)
            console.log('📧 Nouveau message de contact:');
            console.log(`   Nom: ${name}`);
            console.log(`   Email: ${email}`);
            console.log(`   Message: ${message}`);

            // TODO: Implémenter l'envoi d'email avec nodemailer
            // ou stocker le message dans une table "contact_messages" en base de données

            res.status(200).json({
                success: true,
                message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
            });

        } catch (error) {
            console.error('❌ Erreur envoi message contact:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi du message'
            });
        }
    }
);

module.exports = router;
