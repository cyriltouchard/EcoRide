/**
 * Tests unitaires pour rideHybridController
 * Couvre la création, recherche et gestion des trajets
 */

const rideHybridController = require('../../../controllers/rideHybridController');
const RideSQL = require('../../../models/rideSQLModel');
const Ride = require('../../../models/rideModel');
const UserSQL = require('../../../models/userSQLModel');
const VehicleSQL = require('../../../models/vehicleSQLModel');
const CreditModel = require('../../../models/creditModel');

// Mock des modèles
jest.mock('../../../models/rideSQLModel', () => ({
  create: jest.fn(),
  getById: jest.fn(),
  search: jest.fn(),
  cancel: jest.fn(),
  validateRideData: jest.fn()
}));
jest.mock('../../../models/rideModel');
jest.mock('../../../models/userSQLModel', () => ({
  findById: jest.fn(),
  updateUserType: jest.fn()
}));
jest.mock('../../../models/vehicleSQLModel', () => ({
  getById: jest.fn()
}));
jest.mock('../../../models/creditModel', () => ({
  canAfford: jest.fn(),
  takePlatformCommission: jest.fn()
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

describe('RideHybridController', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== CREATE RIDE ====================
  describe('createRide', () => {
    
    it('devrait créer un trajet avec des données valides', async () => {
      const req = mockRequest({
        body: {
          vehicle_id: 1,
          departure_city: 'Paris',
          arrival_city: 'Lyon',
          departure_datetime: '2025-12-01 10:00:00',
          available_seats: 3,
          price_per_seat: 25
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      UserSQL.findById.mockResolvedValue({ id: 1, user_type: 'chauffeur' });
      RideSQL.validateRideData.mockReturnValue([]);
      VehicleSQL.getById.mockResolvedValue({
        id: 1,
        brand: 'Renault',
        model: 'Clio',
        energy_type: 'essence'
      });
      CreditModel.canAfford.mockResolvedValue(true);
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
      CreditModel.takePlatformCommission.mockResolvedValue(true);

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
        data: expect.any(Object)
      }));
    });

    it('devrait rejeter si des champs obligatoires manquent', async () => {
      const req = mockRequest({
        body: {
          vehicle_id: 1,
          departure_city: 'Paris'
          // arrival_city manquante
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      UserSQL.findById.mockResolvedValue({ id: 1, user_type: 'chauffeur' });
      RideSQL.validateRideData.mockReturnValue(['Ville d\'arrivée requise']);

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
          vehicle_id: 1,
          departure_city: 'Paris',
          arrival_city: 'Lyon',
          departure_datetime: '2025-12-01 10:00:00',
          available_seats: 3,
          price_per_seat: 25
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      UserSQL.findById.mockResolvedValue({ id: 1, user_type: 'chauffeur' });
      RideSQL.validateRideData.mockReturnValue([]);
      VehicleSQL.getById.mockResolvedValue({ id: 1 });
      CreditModel.canAfford.mockResolvedValue(true);
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

      RideSQL.getById.mockResolvedValue({
        id: 1,
        driver_id: 1,
        departure_city: 'Paris',
        arrival_city: 'Lyon',
        available_seats: 3,
        driver: { pseudo: 'Driver1' },
        vehicle: { brand: 'Renault', model: 'Clio' }
      });

      await rideHybridController.getRideById(req, res);

      expect(RideSQL.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.any(Object)
      }));
    });

    it('devrait retourner 404 si le trajet n\'existe pas', async () => {
      const req = mockRequest({
        params: { id: '999' }
      });
      const res = mockResponse();

      RideSQL.getById.mockResolvedValue(null);

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
          departure_city: 'Paris',
          arrival_city: 'Lyon',
          departure_date: '2025-12-01'
        }
      });
      const res = mockResponse();

      RideSQL.search.mockResolvedValue([
        { id: 1, departure_city: 'Paris', arrival_city: 'Lyon' },
        { id: 2, departure_city: 'Paris', arrival_city: 'Lyon' }
      ]);

      await rideHybridController.searchRides(req, res);

      expect(RideSQL.search).toHaveBeenCalledWith(expect.objectContaining({
        departure_city: 'Paris',
        arrival_city: 'Lyon',
        departure_date: '2025-12-01'
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        rides: expect.any(Array)
      }));
    });

    it('devrait retourner un tableau vide si aucun trajet ne correspond', async () => {
      const req = mockRequest({
        query: {
          departure_city: 'Paris',
          arrival_city: 'Tokyo'
        }
      });
      const res = mockResponse();

      RideSQL.search.mockResolvedValue([]);

      await rideHybridController.searchRides(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        rides: []
      }));
    });
  });

  // ==================== CANCEL RIDE ====================
  describe('cancelRide', () => {
    
    it('devrait annuler un trajet si l\'utilisateur est le conducteur', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { reason: 'Problème mécanique' },
        user: { id: 1 }
      });
      const res = mockResponse();

      RideSQL.cancel.mockResolvedValue({
        id: 1,
        status: 'annule',
        cancellation_reason: 'Problème mécanique'
      });

      await rideHybridController.cancelRide(req, res);

      expect(RideSQL.cancel).toHaveBeenCalledWith(1, 1, 'Problème mécanique');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('annulé')
      }));
    });

    it('devrait gérer les erreurs lors de l\'annulation', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { reason: 'Test' },
        user: { id: 2 }
      });
      const res = mockResponse();

      RideSQL.cancel.mockRejectedValue(new Error('Non autorisé'));

      await rideHybridController.cancelRide(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false
      }));
    });
  });
});
