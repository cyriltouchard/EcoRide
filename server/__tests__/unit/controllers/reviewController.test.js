const reviewController = require('../../../controllers/reviewController');
const Review = require('../../../models/reviewModel');

// Mock du modèle Review
jest.mock('../../../models/reviewModel');

describe('reviewController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getPendingReviews', () => {
        it('devrait retourner tous les avis en attente', async () => {
            const mockReviews = [
                {
                    _id: 'review1',
                    status: 'pending',
                    authorId: { pseudo: 'user1' },
                    driverId: { pseudo: 'driver1' },
                    rating: 5
                },
                {
                    _id: 'review2',
                    status: 'pending',
                    authorId: { pseudo: 'user2' },
                    driverId: { pseudo: 'driver2' },
                    rating: 4
                }
            ];

            const mockChain = {
                populate: jest.fn().mockReturnThis()
            };
            mockChain.populate.mockResolvedValueOnce(mockReviews);

            Review.find.mockReturnValue(mockChain);

            await reviewController.getPendingReviews(req, res);

            expect(Review.find).toHaveBeenCalledWith({ status: 'pending' });
            expect(res.json).toHaveBeenCalledWith(mockReviews);
        });

        it('devrait gérer les erreurs serveur', async () => {
            const mockChain = {
                populate: jest.fn().mockReturnThis()
            };
            mockChain.populate.mockRejectedValueOnce(new Error('Erreur DB'));

            Review.find.mockReturnValue(mockChain);

            await reviewController.getPendingReviews(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Erreur serveur' });
        });

        it('devrait retourner un tableau vide si aucun avis en attente', async () => {
            const mockChain = {
                populate: jest.fn().mockReturnThis()
            };
            mockChain.populate.mockResolvedValueOnce([]);

            Review.find.mockReturnValue(mockChain);

            await reviewController.getPendingReviews(req, res);

            expect(res.json).toHaveBeenCalledWith([]);
        });
    });

    describe('updateReviewStatus', () => {
        it('devrait approuver un avis avec succès', async () => {
            req.params.id = 'review123';
            req.body = { status: 'approved' };

            const mockReview = {
                _id: 'review123',
                status: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };

            Review.findById.mockResolvedValue(mockReview);

            await reviewController.updateReviewStatus(req, res);

            expect(mockReview.status).toBe('approved');
            expect(mockReview.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ msg: 'Avis approuvé.' });
        });

        it('devrait rejeter un avis avec succès', async () => {
            req.params.id = 'review123';
            req.body = { status: 'rejected' };

            const mockReview = {
                _id: 'review123',
                status: 'pending',
                save: jest.fn().mockResolvedValue(true)
            };

            Review.findById.mockResolvedValue(mockReview);

            await reviewController.updateReviewStatus(req, res);

            expect(mockReview.status).toBe('rejected');
            expect(mockReview.save).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ msg: 'Avis rejeté.' });
        });

        it('devrait retourner 400 si le statut est invalide', async () => {
            req.params.id = 'review123';
            req.body = { status: 'invalid_status' };

            await reviewController.updateReviewStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Statut invalide.' });
        });

        it('devrait retourner 404 si l\'avis n\'existe pas', async () => {
            req.params.id = 'review123';
            req.body = { status: 'approved' };

            Review.findById.mockResolvedValue(null);

            await reviewController.updateReviewStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Avis non trouvé.' });
        });

        it('devrait gérer les erreurs serveur', async () => {
            req.params.id = 'review123';
            req.body = { status: 'approved' };

            Review.findById.mockRejectedValue(new Error('Erreur DB'));

            await reviewController.updateReviewStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Erreur serveur' });
        });
    });
});
