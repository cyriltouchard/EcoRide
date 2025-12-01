const request = require('supertest');
const express = require('express');
const vehicleRoutes = require('../../../routes/vehicleRoutes');
const vehicleController = require('../../../controllers/vehicleHybridController');
const { authenticateToken } = require('../../../middleware/auth');

// Mock du middleware et du contrôleur
jest.mock('../../../middleware/auth');
jest.mock('../../../controllers/vehicleHybridController');

const app = express();
app.use(express.json());
app.use('/api/vehicles', vehicleRoutes);

describe('Vehicle Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock authenticateToken pour autoriser toutes les requêtes
        authenticateToken.mockImplementation((req, res, next) => {
            req.user = { id: 'user123' };
            next();
        });
    });

    describe('GET /api/vehicles/me', () => {
        it('devrait appeler getVehicles', async () => {
            vehicleController.getVehicles.mockImplementation((req, res) => {
                res.status(200).json({ vehicles: [] });
            });

            const response = await request(app).get('/api/vehicles/me');

            expect(authenticateToken).toHaveBeenCalled();
            expect(vehicleController.getVehicles).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
    });

    describe('POST /api/vehicles', () => {
        it('devrait appeler addVehicle', async () => {
            vehicleController.addVehicle.mockImplementation((req, res) => {
                res.status(201).json({ msg: 'Véhicule ajouté' });
            });

            const response = await request(app)
                .post('/api/vehicles')
                .send({ brand: 'Renault', model: 'Clio' });

            expect(authenticateToken).toHaveBeenCalled();
            expect(vehicleController.addVehicle).toHaveBeenCalled();
            expect(response.status).toBe(201);
        });
    });

    describe('GET /api/vehicles/:id', () => {
        it('devrait appeler getVehicleById', async () => {
            vehicleController.getVehicleById.mockImplementation((req, res) => {
                res.status(200).json({ vehicle: { id: 'vehicle123' } });
            });

            const response = await request(app).get('/api/vehicles/vehicle123');

            expect(authenticateToken).toHaveBeenCalled();
            expect(vehicleController.getVehicleById).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
    });

    describe('PUT /api/vehicles/:id', () => {
        it('devrait appeler updateVehicle', async () => {
            vehicleController.updateVehicle.mockImplementation((req, res) => {
                res.status(200).json({ msg: 'Véhicule mis à jour' });
            });

            const response = await request(app)
                .put('/api/vehicles/vehicle123')
                .send({ brand: 'Peugeot' });

            expect(authenticateToken).toHaveBeenCalled();
            expect(vehicleController.updateVehicle).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
    });

    describe('DELETE /api/vehicles/:id', () => {
        it('devrait appeler deleteVehicle', async () => {
            vehicleController.deleteVehicle.mockImplementation((req, res) => {
                res.status(200).json({ msg: 'Véhicule supprimé' });
            });

            const response = await request(app).delete('/api/vehicles/vehicle123');

            expect(authenticateToken).toHaveBeenCalled();
            expect(vehicleController.deleteVehicle).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
    });

    describe('POST /api/vehicles/preferences', () => {
        it('devrait appeler setDriverPreferences', async () => {
            vehicleController.setDriverPreferences.mockImplementation((req, res) => {
                res.status(200).json({ msg: 'Préférences enregistrées' });
            });

            const response = await request(app)
                .post('/api/vehicles/preferences')
                .send({ music: true });

            expect(authenticateToken).toHaveBeenCalled();
            expect(vehicleController.setDriverPreferences).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
    });

    describe('GET /api/vehicles/preferences', () => {
        it('devrait appeler getDriverPreferences', async () => {
            vehicleController.getDriverPreferences.mockImplementation((req, res) => {
                res.status(200).json({ preferences: {} });
            });

            const response = await request(app).get('/api/vehicles/preferences');

            expect(authenticateToken).toHaveBeenCalled();
            expect(vehicleController.getDriverPreferences).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
    });

    describe('GET /api/vehicles/driver-profile', () => {
        it('devrait appeler getDriverProfile', async () => {
            vehicleController.getDriverProfile.mockImplementation((req, res) => {
                res.status(200).json({ profile: {} });
            });

            const response = await request(app).get('/api/vehicles/driver-profile');

            expect(authenticateToken).toHaveBeenCalled();
            expect(vehicleController.getDriverProfile).toHaveBeenCalled();
            expect(response.status).toBe(200);
        });
    });
});
