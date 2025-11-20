/**
 * Tests unitaires pour vehicleHybridController
 * Couvre l'ajout, la mise à jour, la suppression et la récupération de véhicules
 */

const vehicleHybridController = require('../../../controllers/vehicleHybridController');
const VehicleSQL = require('../../../models/vehicleSQLModel');
const Vehicle = require('../../../models/vehicleModel');
const DriverPreferences = require('../../../models/driverPreferencesModel');
const UserSQL = require('../../../models/userSQLModel');

// Mock des modèles
jest.mock('../../../models/vehicleSQLModel', () => ({
  validateVehicleData: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));
jest.mock('../../../models/vehicleModel');
jest.mock('../../../models/driverPreferencesModel');
jest.mock('../../../models/userSQLModel', () => ({
  findById: jest.fn(),
  updateUserType: jest.fn()
}));

// Helper pour créer des mock request/response
const mockRequest = (data = {}) => ({
  body: data.body || {},
  params: data.params || {},
  query: data.query || {},
  user: data.user || { userId: 1, email: 'test@example.com' },
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('VehicleHybridController', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== ADD VEHICLE ====================
  describe('addVehicle', () => {
    
    it('devrait créer un véhicule avec des données valides', async () => {
      const req = mockRequest({
        body: {
          brand: 'Renault',
          model: 'Clio',
          plate: 'AB123CD',
          energy: 'essence',
          seats: 4
        },
        user: { id: 1, user_type: 'chauffeur_passager' }
      });
      const res = mockResponse();

      UserSQL.findById.mockResolvedValue({ id: 1, user_type: 'chauffeur_passager' });
      VehicleSQL.validateVehicleData.mockReturnValue([]);
      VehicleSQL.create.mockResolvedValue({ 
        id: 1, 
        user_id: 1, 
        brand: 'Renault', 
        model: 'Clio',
        license_plate: 'AB123CD',
        energy_type: 'essence',
        available_seats: 4
      });
      Vehicle.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ _id: 'mongo123' })
      }));

      await vehicleHybridController.addVehicle(req, res);

      expect(UserSQL.findById).toHaveBeenCalledWith(1);
      expect(VehicleSQL.validateVehicleData).toHaveBeenCalled();
      expect(VehicleSQL.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: 1,
        brand: 'Renault',
        model: 'Clio',
        license_plate: 'AB123CD',
        energy_type: 'essence',
        available_seats: 4
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.any(String),
        vehicle: expect.any(Object)
      }));
    });

    it('devrait normaliser les accents dans le champ énergie (électrique → electrique)', async () => {
      const req = mockRequest({
        body: {
          brand: 'Tesla',
          model: 'Model 3',
          plate: 'EL123CT',
          energy: 'électrique',
          seats: 5
        },
        user: { id: 1, user_type: 'chauffeur_passager' }
      });
      const res = mockResponse();

      UserSQL.findById.mockResolvedValue({ id: 1, user_type: 'chauffeur_passager' });
      VehicleSQL.validateVehicleData.mockReturnValue([]);
      VehicleSQL.create.mockResolvedValue({ 
        id: 1, 
        user_id: 1, 
        energy_type: 'electrique',
        license_plate: 'EL123CT',
        available_seats: 5
      });
      Vehicle.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ _id: 'mongo123' })
      }));

      await vehicleHybridController.addVehicle(req, res);

      expect(VehicleSQL.create).toHaveBeenCalledWith(expect.objectContaining({
        energy_type: 'électrique'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devrait supporter le format alternatif des champs (license_plate, energy_type, available_seats)', async () => {
      const req = mockRequest({
        body: {
          brand: 'Peugeot',
          model: '208',
          license_plate: 'PG456EO',
          energy_type: 'diesel',
          available_seats: 3
        },
        user: { id: 1, user_type: 'chauffeur_passager' }
      });
      const res = mockResponse();

      UserSQL.findById.mockResolvedValue({ id: 1, user_type: 'chauffeur_passager' });
      VehicleSQL.validateVehicleData.mockReturnValue([]);
      VehicleSQL.create.mockResolvedValue({ 
        id: 1, 
        user_id: 1, 
        license_plate: 'PG456EO',
        energy_type: 'diesel',
        available_seats: 3
      });
      Vehicle.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ _id: 'mongo123' })
      }));

      await vehicleHybridController.addVehicle(req, res);

      expect(VehicleSQL.create).toHaveBeenCalledWith(expect.objectContaining({
        license_plate: 'PG456EO',
        energy_type: 'diesel',
        available_seats: 3
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('devrait rejeter un véhicule avec des données invalides', async () => {
      const req = mockRequest({
        body: {
          brand: 'R',
          model: 'C',
          plate: 'INVALID',
          energy: 'essence',
          seats: 10
        },
        user: { id: 1, user_type: 'chauffeur_passager' }
      });
      const res = mockResponse();

      UserSQL.findById.mockResolvedValue({ id: 1, user_type: 'chauffeur_passager' });
      VehicleSQL.validateVehicleData.mockReturnValue([
        'La marque doit contenir entre 2 et 50 caractères',
        'Le modèle doit contenir entre 2 et 50 caractères',
        'La plaque d\'immatriculation doit être au format valide'
      ]);

      await vehicleHybridController.addVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Données invalides',
        errors: expect.arrayContaining([expect.any(String)])
      }));
    });

    it('devrait gérer les erreurs de base de données', async () => {
      const req = mockRequest({
        body: {
          brand: 'Renault',
          model: 'Clio',
          plate: 'AB123CD',
          energy: 'essence',
          seats: 4
        },
        user: { id: 1, user_type: 'chauffeur_passager' }
      });
      const res = mockResponse();

      UserSQL.findById.mockResolvedValue({ id: 1, user_type: 'chauffeur_passager' });
      VehicleSQL.validateVehicleData.mockReturnValue([]);
      VehicleSQL.create.mockRejectedValue(new Error('Database error'));

      await vehicleHybridController.addVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.any(String)
      }));
    });
  });

  // ==================== UPDATE VEHICLE ====================
  describe('updateVehicle', () => {
    
    it('devrait mettre à jour un véhicule existant', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: {
          brand: 'Renault',
          model: 'Clio V',
          available_seats: 3
        },
        user: { id: 1 }
      });
      const res = mockResponse();

      VehicleSQL.findById.mockResolvedValue({ 
        id: 1, 
        user_id: 1,
        brand: 'Renault',
        model: 'Clio'
      });
      VehicleSQL.update.mockResolvedValue({ 
        id: 1, 
        brand: 'Renault', 
        model: 'Clio V',
        available_seats: 3
      });
      Vehicle.findOne = jest.fn().mockResolvedValue({
        vehicleId: 1,
        save: jest.fn().mockResolvedValue({ _id: 'mongo123' })
      });

      await vehicleHybridController.updateVehicle(req, res);

      expect(VehicleSQL.update).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        vehicle: expect.any(Object)
      }));
    });

    it('devrait rejeter la mise à jour d\'un véhicule qui n\'appartient pas à l\'utilisateur', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { model: 'Clio V' },
        user: { id: 2 }
      });
      const res = mockResponse();

      VehicleSQL.findById.mockResolvedValue({ 
        id: 1, 
        user_id: 1
      });

      await vehicleHybridController.updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('autorisé')
      }));
    });

    it('devrait retourner 404 si le véhicule n\'existe pas', async () => {
      const req = mockRequest({
        params: { id: '999' },
        body: { model: 'Clio V' },
        user: { id: 1 }
      });
      const res = mockResponse();

      VehicleSQL.findById.mockResolvedValue(null);

      await vehicleHybridController.updateVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('trouvé')
      }));
    });
  });

  // ==================== DELETE VEHICLE ====================
  describe('deleteVehicle', () => {
    
    it('devrait supprimer un véhicule existant', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { id: 1 }
      });
      const res = mockResponse();

      VehicleSQL.findById.mockResolvedValue({ 
        id: 1, 
        user_id: 1
      });
      VehicleSQL.delete.mockResolvedValue(true);
      Vehicle.findOneAndDelete = jest.fn().mockResolvedValue({ _id: 'mongo123' });

      await vehicleHybridController.deleteVehicle(req, res);

      expect(VehicleSQL.delete).toHaveBeenCalledWith(1);
      expect(Vehicle.findOneAndDelete).toHaveBeenCalledWith({ vehicleId: 1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('supprimé')
      }));
    });

    it('devrait rejeter la suppression d\'un véhicule qui n\'appartient pas à l\'utilisateur', async () => {
      const req = mockRequest({
        params: { id: '1' },
        user: { id: 2 }
      });
      const res = mockResponse();

      VehicleSQL.findById.mockResolvedValue({ 
        id: 1, 
        user_id: 1
      });

      await vehicleHybridController.deleteVehicle(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.stringContaining('autorisé')
      }));
    });
  });

  // ==================== GET VEHICLES ====================
  describe('getVehicles', () => {
    
    it('devrait retourner tous les véhicules de l\'utilisateur', async () => {
      const req = mockRequest({
        user: { id: 1 }
      });
      const res = mockResponse();

      VehicleSQL.findByUserId.mockResolvedValue([
        { id: 1, brand: 'Renault', model: 'Clio' },
        { id: 2, brand: 'Peugeot', model: '208' }
      ]);

      await vehicleHybridController.getVehicles(req, res);

      expect(VehicleSQL.findByUserId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        vehicles: expect.arrayContaining([expect.any(Object)])
      }));
    });

    it('devrait retourner un tableau vide si l\'utilisateur n\'a pas de véhicules', async () => {
      const req = mockRequest({
        user: { id: 1 }
      });
      const res = mockResponse();

      VehicleSQL.findByUserId.mockResolvedValue([]);

      await vehicleHybridController.getVehicles(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        vehicles: []
      }));
    });
  });
});
