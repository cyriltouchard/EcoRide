const vehicleController = require('../../../controllers/vehicleController');
const Vehicle = require('../../../models/vehicleModel');

// Mock du modèle Vehicle
jest.mock('../../../models/vehicleModel');

describe('vehicleController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { id: 'user123' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('addVehicle', () => {
        it('devrait ajouter un véhicule avec succès', async () => {
            req.body = {
                brand: 'Renault',
                model: 'Clio',
                plate: 'AB-123-CD',
                energy: 'essence',
                seats: '5'
            };

            Vehicle.findOne.mockResolvedValue(null);
            Vehicle.prototype.save = jest.fn().mockResolvedValue({
                userId: 'user123',
                brand: 'Renault',
                model: 'Clio',
                plate: 'AB-123-CD',
                energy: 'essence',
                seats: 5
            });

            await vehicleController.addVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: 'Véhicule ajouté avec succès.',
                    vehicle: expect.any(Object)
                })
            );
        });

        it('devrait retourner 400 si des champs sont manquants', async () => {
            req.body = {
                brand: 'Renault',
                model: 'Clio'
                // plate, energy, seats manquants
            };

            await vehicleController.addVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Veuillez remplir tous les champs obligatoires.'
            });
        });

        it('devrait retourner 400 si la plaque existe déjà', async () => {
            req.body = {
                brand: 'Renault',
                model: 'Clio',
                plate: 'AB-123-CD',
                energy: 'essence',
                seats: '5'
            };

            Vehicle.findOne.mockResolvedValue({ plate: 'AB-123-CD' });

            await vehicleController.addVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Vous avez déjà enregistré un véhicule avec cette immatriculation.'
            });
        });

        it('devrait gérer les erreurs serveur', async () => {
            req.body = {
                brand: 'Renault',
                model: 'Clio',
                plate: 'AB-123-CD',
                energy: 'essence',
                seats: '5'
            };

            Vehicle.findOne.mockRejectedValue(new Error('Erreur DB'));

            await vehicleController.addVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Erreur serveur');
        });
    });

    describe('getVehicles', () => {
        it('devrait retourner tous les véhicules de l\'utilisateur', async () => {
            const mockVehicles = [
                { brand: 'Renault', model: 'Clio', plate: 'AB-123-CD' },
                { brand: 'Peugeot', model: '208', plate: 'EF-456-GH' }
            ];

            Vehicle.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockVehicles)
            });

            await vehicleController.getVehicles(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Véhicules récupérés avec succès.',
                vehicles: mockVehicles
            });
        });

        it('devrait retourner un tableau vide si aucun véhicule', async () => {
            Vehicle.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([])
            });

            await vehicleController.getVehicles(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Aucun véhicule enregistré pour cet utilisateur.',
                vehicles: []
            });
        });

        it('devrait gérer les erreurs serveur', async () => {
            Vehicle.find.mockReturnValue({
                sort: jest.fn().mockRejectedValue(new Error('Erreur DB'))
            });

            await vehicleController.getVehicles(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Erreur serveur');
        });
    });

    describe('getVehicleById', () => {
        it('devrait retourner un véhicule par son ID', async () => {
            req.params.id = 'vehicle123';
            const mockVehicle = {
                _id: 'vehicle123',
                userId: { toString: () => 'user123' },
                brand: 'Renault',
                model: 'Clio'
            };

            Vehicle.findById.mockResolvedValue(mockVehicle);

            await vehicleController.getVehicleById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockVehicle);
        });

        it('devrait retourner 404 si le véhicule n\'existe pas', async () => {
            req.params.id = 'vehicle123';
            Vehicle.findById.mockResolvedValue(null);

            await vehicleController.getVehicleById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Véhicule non trouvé.' });
        });

        it('devrait retourner 401 si l\'utilisateur n\'est pas le propriétaire', async () => {
            req.params.id = 'vehicle123';
            const mockVehicle = {
                userId: { toString: () => 'otherUser' }
            };

            Vehicle.findById.mockResolvedValue(mockVehicle);

            await vehicleController.getVehicleById(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Non autorisé à accéder à ce véhicule.'
            });
        });
    });

    describe('updateVehicle', () => {
        it('devrait mettre à jour un véhicule avec succès', async () => {
            req.params.id = 'vehicle123';
            req.body = {
                brand: 'Renault',
                model: 'Megane'
            };

            const mockVehicle = {
                _id: 'vehicle123',
                userId: { toString: () => 'user123' },
                plate: 'AB-123-CD'
            };

            const updatedVehicle = { ...mockVehicle, ...req.body };

            Vehicle.findById.mockResolvedValue(mockVehicle);
            Vehicle.findByIdAndUpdate.mockResolvedValue(updatedVehicle);

            await vehicleController.updateVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Véhicule mis à jour avec succès.',
                vehicle: updatedVehicle
            });
        });

        it('devrait retourner 404 si le véhicule n\'existe pas', async () => {
            req.params.id = 'vehicle123';
            req.body = { brand: 'Renault' };

            Vehicle.findById.mockResolvedValue(null);

            await vehicleController.updateVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Véhicule non trouvé.' });
        });

        it('devrait retourner 401 si l\'utilisateur n\'est pas le propriétaire', async () => {
            req.params.id = 'vehicle123';
            req.body = { brand: 'Renault' };

            const mockVehicle = {
                userId: { toString: () => 'otherUser' }
            };

            Vehicle.findById.mockResolvedValue(mockVehicle);

            await vehicleController.updateVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Non autorisé à modifier ce véhicule.'
            });
        });
    });

    describe('deleteVehicle', () => {
        it('devrait supprimer un véhicule avec succès', async () => {
            req.params.id = 'vehicle123';

            const mockVehicle = {
                _id: 'vehicle123',
                userId: { toString: () => 'user123' }
            };

            Vehicle.findById.mockResolvedValue(mockVehicle);
            Vehicle.findByIdAndDelete = jest.fn().mockResolvedValue(mockVehicle);

            await vehicleController.deleteVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Véhicule supprimé avec succès.'
            });
        });

        it('devrait retourner 404 si le véhicule n\'existe pas', async () => {
            req.params.id = 'vehicle123';
            Vehicle.findById.mockResolvedValue(null);

            await vehicleController.deleteVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Véhicule non trouvé.' });
        });

        it('devrait retourner 401 si l\'utilisateur n\'est pas le propriétaire', async () => {
            req.params.id = 'vehicle123';

            const mockVehicle = {
                userId: { toString: () => 'otherUser' }
            };

            Vehicle.findById.mockResolvedValue(mockVehicle);

            await vehicleController.deleteVehicle(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                msg: 'Non autorisé à supprimer ce véhicule.'
            });
        });
    });
});
