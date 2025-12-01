// server/__tests__/unit/middleware/security.test.js
// Tests unitaires pour le middleware de sécurité

const {
    sanitizeInput,
    preventReDoS,
    rateLimiter
} = require('../../../middleware/security');

describe('Security Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('sanitizeInput', () => {
        it('devrait nettoyer les entrées malveillantes', () => {
            req.body = {
                name: '<script>alert("XSS")</script>John',
                email: 'test@example.com'
            };

            sanitizeInput(req, res, next);

            expect(req.body.name).not.toContain('<script>');
            expect(next).toHaveBeenCalled();
        });

        it('devrait nettoyer les paramètres d\'URL', () => {
            req.params = {
                id: '<img src=x onerror=alert(1)>'
            };

            sanitizeInput(req, res, next);

            expect(req.params.id).not.toContain('<img');
            expect(next).toHaveBeenCalled();
        });

        it('devrait nettoyer les query parameters', () => {
            req.query = {
                search: '<b>test</b>'
            };

            sanitizeInput(req, res, next);

            expect(req.query.search).not.toContain('<b>');
            expect(next).toHaveBeenCalled();
        });

        it('devrait gérer les valeurs null et undefined', () => {
            req.body = {
                name: null,
                email: undefined,
                age: 25
            };

            sanitizeInput(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('preventReDoS', () => {
        it('devrait autoriser les patterns normaux', () => {
            req.body = {
                email: 'test@example.com',
                description: 'Ceci est une description normale'
            };

            preventReDoS(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('devrait rejeter les patterns ReDoS suspicieux', () => {
            req.body = {
                input: 'a'.repeat(10000) + '!'
            };

            preventReDoS(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        it('devrait gérer des champs multiples', () => {
            req.body = {
                field1: 'normal',
                field2: 'aussi normal'
            };

            preventReDoS(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('rateLimiter', () => {
        it('devrait créer un limiteur de débit', () => {
            const limiter = rateLimiter(10, 60000);
            
            expect(limiter).toBeDefined();
            expect(typeof limiter).toBe('function');
        });

        it('devrait autoriser les requêtes dans la limite', async () => {
            const limiter = rateLimiter(100, 60000);
            
            await limiter(req, res, next);
            
            expect(next).toHaveBeenCalled();
        });
    });
});
