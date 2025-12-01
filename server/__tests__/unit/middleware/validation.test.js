// server/__tests__/unit/middleware/validation.test.js
// Tests unitaires pour le middleware de validation

const {
    validateRegister,
    validateLogin,
    validateRide,
    validateVehicle
} = require('../../../middleware/validation');

describe('Validation Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('validateRegister', () => {
        it('devrait valider une inscription correcte', () => {
            req.body = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'SecureP@ss123',
                phone: '0612345678'
            };

            validateRegister(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('devrait rejeter un email invalide', () => {
            req.body = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'invalid-email',
                password: 'SecureP@ss123',
                phone: '0612345678'
            };

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        it('devrait rejeter un mot de passe trop court', () => {
            req.body = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: '123',
                phone: '0612345678'
            };

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        it('devrait rejeter des champs manquants', () => {
            req.body = {
                firstName: 'John'
            };

            validateRegister(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validateLogin', () => {
        it('devrait valider une connexion correcte', () => {
            req.body = {
                email: 'john.doe@example.com',
                password: 'SecureP@ss123'
            };

            validateLogin(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('devrait rejeter un email manquant', () => {
            req.body = {
                password: 'SecureP@ss123'
            };

            validateLogin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validateRide', () => {
        it('devrait valider un trajet correct', () => {
            req.body = {
                departure: 'Paris',
                destination: 'Lyon',
                departureTime: new Date().toISOString(),
                availableSeats: 3,
                pricePerSeat: 20
            };

            validateRide(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('devrait rejeter un nombre de places invalide', () => {
            req.body = {
                departure: 'Paris',
                destination: 'Lyon',
                departureTime: new Date().toISOString(),
                availableSeats: 0,
                pricePerSeat: 20
            };

            validateRide(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        it('devrait rejeter un prix négatif', () => {
            req.body = {
                departure: 'Paris',
                destination: 'Lyon',
                departureTime: new Date().toISOString(),
                availableSeats: 3,
                pricePerSeat: -10
            };

            validateRide(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('validateVehicle', () => {
        it('devrait valider un véhicule correct', () => {
            req.body = {
                brand: 'Peugeot',
                model: '308',
                licensePlate: 'AB-123-CD',
                seats: 5,
                energyType: 'essence'
            };

            validateVehicle(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('devrait rejeter un type d\'énergie invalide', () => {
            req.body = {
                brand: 'Peugeot',
                model: '308',
                licensePlate: 'AB-123-CD',
                seats: 5,
                energyType: 'charbon'
            };

            validateVehicle(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        it('devrait rejeter un nombre de places invalide', () => {
            req.body = {
                brand: 'Peugeot',
                model: '308',
                licensePlate: 'AB-123-CD',
                seats: 10,
                energyType: 'essence'
            };

            validateVehicle(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
