/**
 * Tests unitaires pour reviewHybridController
 * Couvre la création et la récupération des avis chauffeurs et site
 */

const reviewHybridController = require('../../../controllers/reviewHybridController');
const { pool } = require('../../../config/db-mysql');

// Mock du pool MySQL
jest.mock('../../../config/db-mysql', () => ({
  pool: {
    query: jest.fn()
  }
}));

const mockRequest = (data = {}) => ({
  body: data.body || {},
  params: data.params || {},
  query: data.query || {},
  user: data.user || { id: 1, email: 'test@example.com' },
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('ReviewHybridController', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== CREATE DRIVER REVIEW ====================
  describe('createDriverReview', () => {
    
    it('devrait créer un avis sur un chauffeur avec des données valides', async () => {
      const req = mockRequest({
        body: {
          driverId: 2,
          rideId: 1,
          rating: 5,
          punctualityRating: 5,
          drivingQualityRating: 5,
          vehicleCleanlinessRating: 4,
          friendlinessRating: 5,
          comment: 'Excellent chauffeur'
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      // Mock vérification booking
      pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // bookingCheck
      // Mock vérification avis existant
      pool.query.mockResolvedValueOnce([[]]); // existingReview
      // Mock insertion
      pool.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert
      // Mock récupération avis
      pool.query.mockResolvedValueOnce([[{ 
        id: 1, 
        driver_id: 2, 
        passenger_id: 1,
        rating: 5,
        comment: 'Excellent chauffeur'
      }]]);

      await reviewHybridController.createDriverReview(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        review: expect.any(Object)
      }));
    });

    it('devrait rejeter si le passager tente de se noter lui-même', async () => {
      const req = mockRequest({
        body: {
          driverId: 1,
          rating: 5
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      await reviewHybridController.createDriverReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        msg: expect.stringContaining('vous-même')
      }));
    });

    it('devrait rejeter une note invalide (< 1 ou > 5)', async () => {
      const req = mockRequest({
        body: {
          driverId: 2,
          rating: 6
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      await reviewHybridController.createDriverReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        msg: expect.stringContaining('entre 1 et 5')
      }));
    });

    it('devrait rejeter si le passager n\'a pas voyagé avec ce chauffeur', async () => {
      const req = mockRequest({
        body: {
          driverId: 2,
          rideId: 1,
          rating: 5
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      pool.query.mockResolvedValueOnce([[]]); // bookingCheck vide

      await reviewHybridController.createDriverReview(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        msg: expect.stringContaining('voyagé')
      }));
    });

    it('devrait rejeter si un avis existe déjà pour ce trajet', async () => {
      const req = mockRequest({
        body: {
          driverId: 2,
          rideId: 1,
          rating: 5
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // bookingCheck OK
      pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // existingReview trouvé

      await reviewHybridController.createDriverReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        msg: expect.stringContaining('déjà noté')
      }));
    });
  });

  // ==================== GET DRIVER REVIEWS ====================
  describe('getDriverReviews', () => {
    
    it('devrait retourner les avis d\'un chauffeur', async () => {
      const req = mockRequest({
        params: { driverId: '2' }
      });
      const res = mockResponse();

      pool.query.mockResolvedValueOnce([[
        { id: 1, rating: 5, comment: 'Excellent' },
        { id: 2, rating: 4, comment: 'Très bien' }
      ]]);

      await reviewHybridController.getDriverReviews(req, res);

      expect(pool.query).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        reviews: expect.any(Array)
      }));
    });

    it('devrait retourner un tableau vide si aucun avis', async () => {
      const req = mockRequest({
        params: { driverId: '999' }
      });
      const res = mockResponse();

      pool.query.mockResolvedValueOnce([[]]);

      await reviewHybridController.getDriverReviews(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        reviews: []
      }));
    });
  });

  // ==================== CREATE SITE REVIEW ====================
  describe('createSiteReview', () => {
    
    it('devrait créer un avis sur le site', async () => {
      const req = mockRequest({
        body: {
          rating: 5,
          category: 'general',
          comment: 'Super application'
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      pool.query.mockResolvedValueOnce([{ insertId: 1 }]); // insert

      await reviewHybridController.createSiteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('devrait rejeter une note invalide', async () => {
      const req = mockRequest({
        body: {
          rating: 0,
          category: 'general',
          comment: 'Test'
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      await reviewHybridController.createSiteReview(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
      }));
    });
  });
});
