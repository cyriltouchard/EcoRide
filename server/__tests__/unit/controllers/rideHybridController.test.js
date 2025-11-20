/**
 * Tests unitaires pour rideHybridController
 * Couvre la création, recherche et gestion des trajets
 */

const rideHybridController = require('../../../controllers/rideHybridController');
const RideSQL = require('../../../models/rideSQLModel');
const Ride = require('../../../models/rideModel');

// Mock des modèles
jest.mock('../../../models/rideSQLModel', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  search: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));
jest.mock('../../../models/rideModel');

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

describe('RideHybridController', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== CREATE RIDE ====================
  describe('createRide', () => {
    
    it('devrait créer un trajet avec des données valides', async () => {
      const req = mockRequest({
        body: {
          vehicleId: 1,
          departureCity: 'Paris',
          arrivalCity: 'Lyon',
          departureDate: '2025-12-01',
          departureTime: '10:00',
          availableSeats: 3,
          pricePerSeat: 25
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      RideSQL.create.mockResolvedValue({
        id: 1,
        driver_id: 1,
        vehicle_id: 1,
        departure_city: 'Paris',
        arrival_city: 'Lyon',
        available_seats: 3,
        price_per_seat: 25
      });
      Ride.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ _id: 'mongo123' })
      }));

      await rideHybridController.createRide(req, res);

      expect(RideSQL.create).toHaveBeenCalledWith(expect.objectContaining({
        driver_id: 1,
        vehicle_id: 1,
        departure_city: 'Paris',
        arrival_city: 'Lyon'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        ride: expect.any(Object)
      }));
    });

    it('devrait rejeter si des champs obligatoires manquent', async () => {
      const req = mockRequest({
        body: {
          vehicleId: 1,
          departureCity: 'Paris'
          // arrivalCity manquante
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      await rideHybridController.createRide(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.any(String)
      }));
    });

    it('devrait gérer les erreurs de base de données', async () => {
      const req = mockRequest({
        body: {
          vehicleId: 1,
          departureCity: 'Paris',
          arrivalCity: 'Lyon',
          departureDate: '2025-12-01',
          departureTime: '10:00',
          availableSeats: 3,
          pricePerSeat: 25
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      RideSQL.create.mockRejectedValue(new Error('Database error'));

      await rideHybridController.createRide(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.any(String)
      }));
    });
  });

  // ==================== GET RIDE BY ID ====================
  describe('getRideById', () => {
    
    it('devrait retourner un trajet existant', async () => {
      const req = mockRequest({
        params: { id: '1' }
      });
      const res = mockResponse();

      RideSQL.findById.mockResolvedValue({
        id: 1,
        driver_id: 1,
        departure_city: 'Paris',
        arrival_city: 'Lyon',
        available_seats: 3,
        driver: { pseudo: 'Driver1' },
        vehicle: { brand: 'Renault', model: 'Clio' }
      });

      await rideHybridController.getRideById(req, res);

      expect(RideSQL.findById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        ride: expect.any(Object)
      }));
    });

    it('devrait retourner 404 si le trajet n\'existe pas', async () => {
      const req = mockRequest({
        params: { id: '999' }
      });
      const res = mockResponse();

      RideSQL.findById.mockResolvedValue(null);

      await rideHybridController.getRideById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('trouvé')
      }));
    });
  });

  // ==================== SEARCH RIDES ====================
  describe('searchRides', () => {
    
    it('devrait rechercher des trajets avec des filtres', async () => {
      const req = mockRequest({
        query: {
          departureCity: 'Paris',
          arrivalCity: 'Lyon',
          date: '2025-12-01'
        }
      });
      const res = mockResponse();

      RideSQL.search.mockResolvedValue([
        { id: 1, departure_city: 'Paris', arrival_city: 'Lyon' },
        { id: 2, departure_city: 'Paris', arrival_city: 'Lyon' }
      ]);

      await rideHybridController.searchRides(req, res);

      expect(RideSQL.search).toHaveBeenCalledWith(expect.objectContaining({
        departureCity: 'Paris',
        arrivalCity: 'Lyon',
        date: '2025-12-01'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        rides: expect.any(Array)
      }));
    });

    it('devrait retourner un tableau vide si aucun trajet ne correspond', async () => {
      const req = mockRequest({
        query: {
          departureCity: 'Paris',
          arrivalCity: 'Tokyo'
        }
      });
      const res = mockResponse();

      RideSQL.search.mockResolvedValue([]);

      await rideHybridController.searchRides(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        rides: []
      }));
    });
  });

  // ==================== UPDATE RIDE ====================
  describe('updateRide', () => {
    
    it('devrait mettre à jour un trajet si l\'utilisateur est le conducteur', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {
          availableSeats: 2,
          pricePerSeat: 30
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      RideSQL.findById.mockResolvedValue({
        id: 1,
        driver_id: 1
      });
      RideSQL.update.mockResolvedValue({
        id: 1,
        available_seats: 2,
        price_per_seat: 30
      });

      await rideHybridController.updateRide(req, res);

      expect(RideSQL.update).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        ride: expect.any(Object)
      }));
    });

    it('devrait rejeter si l\'utilisateur n\'est pas le conducteur', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { availableSeats: 2 },
        user: { id: 2 }
      });
      const res = mockResponse();

      RideSQL.findById.mockResolvedValue({
        id: 1,
        driver_id: 1
      });

      await rideHybridController.updateRide(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('autorisé')
      }));
    });
  });

  // ==================== DELETE RIDE ====================
  describe('deleteRide', () => {
    
    it('devrait supprimer un trajet si l\'utilisateur est le conducteur', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { id: 1 }
      });
      const res = mockResponse();

      RideSQL.findById.mockResolvedValue({
        id: 1,
        driver_id: 1
      });
      RideSQL.delete.mockResolvedValue(true);

      await rideHybridController.deleteRide(req, res);

      expect(RideSQL.delete).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('supprimé')
      }));
    });

    it('devrait rejeter si l\'utilisateur n\'est pas le conducteur', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { id: 2 }
      });
      const res = mockResponse();

      RideSQL.findById.mockResolvedValue({
        id: 1,
        driver_id: 1
      });

      await rideHybridController.deleteRide(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('autorisé')
      }));
    });
  });
});
