// server/__tests__/unit/routes/creditRoutes.test.js
// Tests unitaires pour les routes de crédits

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const creditRoutes = require('../../../routes/creditRoutes');
const CreditModel = require('../../../models/creditModel');

// Mock du CreditModel
jest.mock('../../../models/creditModel');

// Configuration de l'app Express pour les tests
const app = express();
app.use(express.json());
app.use('/api/credits', creditRoutes);

// JWT secret pour les tests
process.env.JWT_SECRET = 'test-secret-key';

describe('Credit Routes', () => {
    let validToken;
    const mockUserId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
        // Créer un token valide pour les tests
        validToken = jwt.sign(
            { id: mockUserId, email: 'test@example.com' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    describe('GET /api/credits/balance', () => {
        it('devrait retourner le solde de crédits', async () => {
            const mockCredits = {
                current_credits: 100,
                total_earned: 200,
                total_spent: 100,
                last_transaction: new Date()
            };

            CreditModel.getUserCredits.mockResolvedValue(mockCredits);

            const response = await request(app)
                .get('/api/credits/balance')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.current_credits).toBe(100);
            expect(CreditModel.getUserCredits).toHaveBeenCalledWith(mockUserId);
        });

        it('devrait retourner 404 si le compte crédits n\'existe pas', async () => {
            CreditModel.getUserCredits.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/credits/balance')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('devrait retourner 401 sans token', async () => {
            const response = await request(app)
                .get('/api/credits/balance');

            expect(response.status).toBe(401);
        });

        it('devrait gérer les erreurs serveur', async () => {
            CreditModel.getUserCredits.mockRejectedValue(new Error('Erreur DB'));

            const response = await request(app)
                .get('/api/credits/balance')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /api/credits/history', () => {
        it('devrait retourner l\'historique des transactions', async () => {
            const mockTransactions = [
                { id: 1, amount: 50, type: 'credit', date: new Date() },
                { id: 2, amount: 20, type: 'debit', date: new Date() }
            ];

            CreditModel.getTransactionHistory.mockResolvedValue(mockTransactions);

            const response = await request(app)
                .get('/api/credits/history')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(CreditModel.getTransactionHistory).toHaveBeenCalledWith(mockUserId, 50);
        });

        it('devrait respecter la limite de transactions', async () => {
            CreditModel.getTransactionHistory.mockResolvedValue([]);

            const response = await request(app)
                .get('/api/credits/history?limit=10')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(CreditModel.getTransactionHistory).toHaveBeenCalledWith(mockUserId, 10);
        });

        it('devrait gérer les erreurs serveur', async () => {
            CreditModel.getTransactionHistory.mockRejectedValue(new Error('Erreur DB'));

            const response = await request(app)
                .get('/api/credits/history')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });
    });
});
