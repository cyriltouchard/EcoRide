// server/__tests__/unit/controllers/adminController.test.js
// Tests unitaires pour le contrôleur admin

const adminController = require('../../../controllers/adminController');
const UserSQL = require('../../../models/userSQLModel');
const bcrypt = require('bcryptjs');

jest.mock('../../../models/userSQLModel');
jest.mock('../../../models/userModel');
jest.mock('../../../models/rideModel');
jest.mock('../../../models/reviewModel');
jest.mock('bcryptjs');

describe('AdminController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { id: 1, role: 'admin' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createEmployee', () => {
        it('devrait créer un employé avec des données valides', async () => {
            req.body = {
                pseudo: 'employee1',
                email: 'employee@ecoride.com',
                password: 'SecurePass123'
            };

            UserSQL.findByEmail.mockResolvedValue(null);
            UserSQL.create.mockResolvedValue({
                insertId: 10,
                pseudo: 'employee1',
                email: 'employee@ecoride.com'
            });
            bcrypt.hash.mockResolvedValue('hashed_password');

            await adminController.createEmployee(req, res);

            expect(UserSQL.findByEmail).toHaveBeenCalledWith('employee@ecoride.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123', 12);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    msg: expect.any(String)
                })
            );
        });

        it('devrait rejeter si des champs sont manquants', async () => {
            req.body = {
                pseudo: 'employee1'
            };

            await adminController.createEmployee(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        it('devrait rejeter un email invalide', async () => {
            req.body = {
                pseudo: 'employee1',
                email: 'invalid-email',
                password: 'SecurePass123'
            };

            await adminController.createEmployee(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    msg: 'Email invalide.'
                })
            );
        });

        it('devrait rejeter si l\'email existe déjà', async () => {
            req.body = {
                pseudo: 'employee1',
                email: 'existing@ecoride.com',
                password: 'SecurePass123'
            };

            UserSQL.findByEmail.mockResolvedValue({
                id: 5,
                email: 'existing@ecoride.com'
            });

            await adminController.createEmployee(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    msg: 'Cet email est déjà utilisé.'
                })
            );
        });

        it('devrait gérer les erreurs serveur', async () => {
            req.body = {
                pseudo: 'employee1',
                email: 'employee@ecoride.com',
                password: 'SecurePass123'
            };

            UserSQL.findByEmail.mockRejectedValue(new Error('DB Error'));

            await adminController.createEmployee(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });
    });

    describe('deleteEmployee', () => {
        it('devrait supprimer un employé existant', async () => {
            req.params.id = '10';

            UserSQL.findById.mockResolvedValue({
                id: 10,
                role: 'employee'
            });
            UserSQL.delete.mockResolvedValue({ affectedRows: 1 });

            await adminController.deleteEmployee(req, res);

            expect(UserSQL.delete).toHaveBeenCalledWith(10);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        });

        it('devrait retourner 404 si l\'employé n\'existe pas', async () => {
            req.params.id = '999';

            UserSQL.findById.mockResolvedValue(null);

            await adminController.deleteEmployee(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false
                })
            );
        });

        it('devrait gérer les erreurs serveur', async () => {
            req.params.id = '10';

            UserSQL.findById.mockRejectedValue(new Error('DB Error'));

            await adminController.deleteEmployee(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getStatistics', () => {
        it('devrait retourner les statistiques de la plateforme', async () => {
            UserSQL.getCount.mockResolvedValue(100);
            
            await adminController.getStatistics(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.any(Object)
                })
            );
        });

        it('devrait gérer les erreurs lors de la récupération des stats', async () => {
            UserSQL.getCount.mockRejectedValue(new Error('DB Error'));

            await adminController.getStatistics(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});
