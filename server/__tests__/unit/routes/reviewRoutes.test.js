const request = require('supertest');
const express = require('express');
const reviewRoutes = require('../../../routes/reviewRoutes');
const reviewController = require('../../../controllers/reviewHybridController');
const { authenticateToken } = require('../../../middleware/auth');

// Mock du middleware et du contrôleur
jest.mock('../../../middleware/auth');
jest.mock('../../../controllers/reviewHybridController');

const app = express();
app.use(express.json());
app.use('/api/reviews', reviewRoutes);

describe('Review Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock authenticateToken pour autoriser les requêtes protégées
        authenticateToken.mockImplementation((req, res, next) => {
            req.user = { id: 'user123' };
            next();
        });
    });

    describe('Routes publiques', () => {
        describe('GET /api/reviews/driver/:driverId', () => {
            it('devrait appeler getDriverReviews sans authentification', async () => {
                reviewController.getDriverReviews.mockImplementation((req, res) => {
                    res.status(200).json({ reviews: [] });
                });

                const response = await request(app).get('/api/reviews/driver/driver123');

                expect(reviewController.getDriverReviews).toHaveBeenCalled();
                expect(response.status).toBe(200);
            });
        });

        describe('GET /api/reviews/driver/:driverId/rating', () => {
            it('devrait appeler getDriverRating', async () => {
                reviewController.getDriverRating.mockImplementation((req, res) => {
                    res.status(200).json({ rating: 4.5 });
                });

                const response = await request(app).get('/api/reviews/driver/driver123/rating');

                expect(reviewController.getDriverRating).toHaveBeenCalled();
                expect(response.status).toBe(200);
            });
        });

        describe('GET /api/reviews/site', () => {
            it('devrait appeler getSiteReviews', async () => {
                reviewController.getSiteReviews.mockImplementation((req, res) => {
                    res.status(200).json({ reviews: [] });
                });

                const response = await request(app).get('/api/reviews/site');

                expect(reviewController.getSiteReviews).toHaveBeenCalled();
                expect(response.status).toBe(200);
            });
        });

        describe('GET /api/reviews/site/stats', () => {
            it('devrait appeler getSiteStats', async () => {
                reviewController.getSiteStats.mockImplementation((req, res) => {
                    res.status(200).json({ stats: {} });
                });

                const response = await request(app).get('/api/reviews/site/stats');

                expect(reviewController.getSiteStats).toHaveBeenCalled();
                expect(response.status).toBe(200);
            });
        });
    });

    describe('Routes protégées', () => {
        describe('POST /api/reviews/driver', () => {
            it('devrait appeler createDriverReview avec authentification', async () => {
                reviewController.createDriverReview.mockImplementation((req, res) => {
                    res.status(201).json({ msg: 'Avis créé' });
                });

                const response = await request(app)
                    .post('/api/reviews/driver')
                    .send({ rating: 5 });

                expect(authenticateToken).toHaveBeenCalled();
                expect(reviewController.createDriverReview).toHaveBeenCalled();
                expect(response.status).toBe(201);
            });
        });

        describe('POST /api/reviews/site', () => {
            it('devrait appeler createSiteReview avec authentification', async () => {
                reviewController.createSiteReview.mockImplementation((req, res) => {
                    res.status(201).json({ msg: 'Avis site créé' });
                });

                const response = await request(app)
                    .post('/api/reviews/site')
                    .send({ rating: 4 });

                expect(authenticateToken).toHaveBeenCalled();
                expect(reviewController.createSiteReview).toHaveBeenCalled();
                expect(response.status).toBe(201);
            });
        });

        describe('GET /api/reviews/eligible-rides', () => {
            it('devrait appeler getEligibleRides', async () => {
                reviewController.getEligibleRides.mockImplementation((req, res) => {
                    res.status(200).json({ rides: [] });
                });

                const response = await request(app).get('/api/reviews/eligible-rides');

                expect(authenticateToken).toHaveBeenCalled();
                expect(reviewController.getEligibleRides).toHaveBeenCalled();
                expect(response.status).toBe(200);
            });
        });

        describe('GET /api/reviews/my-reviews', () => {
            it('devrait appeler getMyReviews', async () => {
                reviewController.getMyReviews.mockImplementation((req, res) => {
                    res.status(200).json({ reviews: [] });
                });

                const response = await request(app).get('/api/reviews/my-reviews');

                expect(authenticateToken).toHaveBeenCalled();
                expect(reviewController.getMyReviews).toHaveBeenCalled();
                expect(response.status).toBe(200);
            });
        });

        describe('POST /api/reviews/:reviewId/response', () => {
            it('devrait appeler respondToReview', async () => {
                reviewController.respondToReview.mockImplementation((req, res) => {
                    res.status(200).json({ msg: 'Réponse ajoutée' });
                });

                const response = await request(app)
                    .post('/api/reviews/review123/response')
                    .send({ response: 'Merci' });

                expect(authenticateToken).toHaveBeenCalled();
                expect(reviewController.respondToReview).toHaveBeenCalled();
                expect(response.status).toBe(200);
            });
        });

        describe('POST /api/reviews/:reviewId/report', () => {
            it('devrait appeler reportReview', async () => {
                reviewController.reportReview.mockImplementation((req, res) => {
                    res.status(200).json({ msg: 'Avis signalé' });
                });

                const response = await request(app)
                    .post('/api/reviews/review123/report')
                    .send({ reason: 'Spam' });

                expect(authenticateToken).toHaveBeenCalled();
                expect(reviewController.reportReview).toHaveBeenCalled();
                expect(response.status).toBe(200);
            });
        });
    });
});
