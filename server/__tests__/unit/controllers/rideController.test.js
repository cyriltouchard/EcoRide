/**
 * Tests unitaires pour rideController
 * @file rideController.test.js
 */

// Mock des modèles AVANT l'import du controller
jest.mock('../../../models/rideModel');
jest.mock('../../../models/vehicleModel');
jest.mock('../../../models/userModel');

const rideController = require('../../../controllers/rideController');
const Ride = require('../../../models/rideModel');
const Vehicle = require('../../../models/vehicleModel');

describe('RideController', () => {

    describe('createRide', () => {
        it('devrait créer un nouveau trajet avec des données valides', async () => {
            const req = mockRequest({
                body: {
                    departure: 'Paris',
                    arrival: 'Lyon',
                    departureDate: '2025-12-25',
                    departureTime: '10:00',
                    price: 25,
                    availableSeats: 3,
                    vehicleId: 'vehicle123',
                    description: 'Trajet sympa',
                    isEcologic: true
                },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            // Mock du véhicule existant
            Vehicle.findOne.mockResolvedValue({
                _id: 'vehicle123',
                userId: 'user123',
                seats: 4,
                available_seats: 4
            });

            // Mock de la sauvegarde du trajet
            const mockSave = jest.fn().mockResolvedValue({
                _id: 'ride123',
                driver: 'user123',
                departure: 'Paris',
                arrival: 'Lyon'
            });
            Ride.mockImplementation(() => ({
                save: mockSave
            }));

            await rideController.createRide(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: 'Covoiturage proposé avec succès.'
                })
            );
        });

        it('devrait rejeter si des champs obligatoires manquent', async () => {
            const req = mockRequest({
                body: { departure: 'Paris' },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            await rideController.createRide(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: expect.stringContaining('champs obligatoires')
                })
            );
        });

        it('devrait rejeter si le véhicule n\'existe pas', async () => {
            const req = mockRequest({
                body: {
                    departure: 'Paris',
                    arrival: 'Lyon',
                    departureDate: '2025-12-25',
                    departureTime: '10:00',
                    price: 25,
                    availableSeats: 3,
                    vehicleId: 'vehicleInexistant'
                },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            Vehicle.findOne.mockResolvedValue(null);

            await rideController.createRide(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: expect.stringContaining('Véhicule non trouvé')
                })
            );
        });

        it('devrait rejeter si availableSeats dépasse la capacité du véhicule', async () => {
            const req = mockRequest({
                body: {
                    departure: 'Paris',
                    arrival: 'Lyon',
                    departureDate: '2025-12-25',
                    departureTime: '10:00',
                    price: 25,
                    availableSeats: 5,
                    vehicleId: 'vehicle123'
                },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            Vehicle.findOne.mockResolvedValue({
                _id: 'vehicle123',
                userId: 'user123',
                seats: 4
            });

            await rideController.createRide(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: expect.stringContaining('ne peut excéder la capacité du véhicule')
                })
            );
        });
    });

    describe('getRideById', () => {
        it('devrait retourner un trajet existant avec détails du conducteur et véhicule', async () => {
            const req = mockRequest({
                params: { id: 'ride123' }
            });
            const res = mockResponse();

            const mockRide = {
                _id: 'ride123',
                departure: 'Paris',
                arrival: 'Lyon',
                driver: { _id: 'user123', pseudo: 'Jean', email: 'jean@test.fr' },
                vehicle: { _id: 'vehicle123', brand: 'Peugeot', model: '308' },
                passengers: []
            };

            // 3 populate() chaînés : driver, vehicle, passengers
            const mockPopulate3 = {
                populate: jest.fn().mockResolvedValue(mockRide)
            };
            const mockPopulate2 = {
                populate: jest.fn().mockReturnValue(mockPopulate3)
            };
            const mockPopulate1 = {
                populate: jest.fn().mockReturnValue(mockPopulate2)
            };
            
            Ride.findById.mockReturnValue(mockPopulate1);

            await rideController.getRideById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    _id: 'ride123',
                    departure: 'Paris',
                    arrival: 'Lyon'
                })
            );
        });

        it('devrait retourner 404 si le trajet n\'existe pas', async () => {
            const req = mockRequest({
                params: { id: 'rideInexistant' }
            });
            const res = mockResponse();

            // 3 populate() chaînés qui retournent null
            const mockPopulate3 = {
                populate: jest.fn().mockResolvedValue(null)
            };
            const mockPopulate2 = {
                populate: jest.fn().mockReturnValue(mockPopulate3)
            };
            const mockPopulate1 = {
                populate: jest.fn().mockReturnValue(mockPopulate2)
            };
            
            Ride.findById.mockReturnValue(mockPopulate1);

            await rideController.getRideById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: expect.stringContaining('Trajet non trouvé')
                })
            );
        });
    });

    describe('searchRides', () => {
        it('devrait rechercher des trajets avec des filtres', async () => {
            const req = mockRequest({
                query: {
                    departure: 'Paris',
                    arrival: 'Lyon',
                    date: '2025-12-25'
                }
            });
            const res = mockResponse();

            const mockRides = [
                {
                    _id: 'ride1',
                    departure: 'Paris',
                    arrival: 'Lyon',
                    driver: { pseudo: 'Jean' },
                    vehicle: { brand: 'Peugeot' }
                }
            ];

            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockRides)
            };

            Ride.find.mockReturnValue(mockQuery);

            await rideController.searchRides(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: 'Covoiturages trouvés',
                    rides: expect.arrayContaining([
                        expect.objectContaining({
                            departure: 'Paris',
                            arrival: 'Lyon'
                        })
                    ])
                })
            );
        });

        it('devrait retourner un tableau vide si aucun trajet ne correspond', async () => {
            const req = mockRequest({
                query: {
                    departure: 'Paris',
                    arrival: 'Tokyo'
                }
            });
            const res = mockResponse();

            const mockQuery = {
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            };

            Ride.find.mockReturnValue(mockQuery);

            await rideController.searchRides(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: 'Aucun covoiturage trouvé pour ces critères.',
                    rides: []
                })
            );
        });
    });

    describe('bookRide', () => {
        it('devrait réserver une place sur un trajet disponible', async () => {
            const req = mockRequest({
                params: { id: 'ride123' },
                body: { seatsToBook: 2 },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            const mockPassengers = [];
            const mockRide = {
                _id: 'ride123',
                driver: {
                    toString: () => 'otherUser'
                },
                availableSeats: 3,
                status: 'scheduled',
                passengers: mockPassengers,
                save: jest.fn().mockResolvedValue(true)
            };

            Ride.findById.mockResolvedValue(mockRide);

            await rideController.bookRide(req, res);

            expect(mockRide.passengers).toHaveLength(1);
            expect(mockRide.availableSeats).toBe(1);
            expect(mockRide.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: 'Réservation effectuée avec succès !'
                })
            );
        });

        it('devrait rejeter si le conducteur tente de réserver son propre trajet', async () => {
            const req = mockRequest({
                params: { id: 'ride123' },
                body: { seatsToBook: 1 },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            const mockRide = {
                _id: 'ride123',
                driver: 'user123', // Même utilisateur
                availableSeats: 3
            };

            Ride.findById.mockResolvedValue(mockRide);

            await rideController.bookRide(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: expect.stringMatching(/propre trajet/)
                })
            );
        });

        it('devrait rejeter si pas assez de places disponibles', async () => {
            const req = mockRequest({
                params: { id: 'ride123' },
                body: { seatsToBook: 5 },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            const mockRide = {
                _id: 'ride123',
                driver: {
                    toString: () => 'otherUser'
                },
                availableSeats: 2,
                status: 'scheduled',
                passengers: []
            };

            Ride.findById.mockResolvedValue(mockRide);

            await rideController.bookRide(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: expect.stringMatching(/Il ne reste pas assez de places/)
                })
            );
        });

        it('devrait rejeter une réservation en double', async () => {
            const req = mockRequest({
                params: { id: 'ride123' },
                body: { seatsToBook: 1 },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            const mockRide = {
                _id: 'ride123',
                driver: 'otherUser',
                availableSeats: 3,
                status: 'scheduled',
                passengers: ['user123'],
                includes: jest.fn((id) => id === 'user123')
            };

            Ride.findById.mockResolvedValue(mockRide);

            await rideController.bookRide(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: expect.stringMatching(/déjà réservé/)
                })
            );
        });
    });

    describe('cancelRide', () => {
        it('devrait annuler un trajet si l\'utilisateur est le conducteur', async () => {
            const req = mockRequest({
                params: { id: 'ride123' },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            const mockRide = {
                _id: 'ride123',
                driver: {
                    toString: () => 'user123'
                },
                status: 'scheduled',
                passengers: [],
                save: jest.fn().mockResolvedValue(true)
            };

            Ride.findById.mockResolvedValue(mockRide);

            await rideController.cancelRide(req, res);

            expect(mockRide.status).toBe('cancelled');
            expect(mockRide.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('devrait rejeter si l\'utilisateur n\'est pas le conducteur', async () => {
            const req = mockRequest({
                params: { id: 'ride123' },
                user: { id: 'user123' }
            });
            const res = mockResponse();

            const mockRide = {
                _id: 'ride123',
                driver: {
                    toString: () => 'otherUser'
                },
                status: 'scheduled',
                passengers: []
            };

            Ride.findById.mockResolvedValue(mockRide);

            await rideController.cancelRide(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: 'Non autorisé à annuler ce trajet ou cette réservation.'
                })
            );
        });
    });
});
