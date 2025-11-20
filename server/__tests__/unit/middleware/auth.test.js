/**
 * Tests unitaires pour middleware auth.js
 * Couvre la vérification JWT et l'authentification
 */

const { authenticateToken } = require('../../../middleware/auth');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

const mockRequest = (headers = {}) => ({
  headers,
  header: function(name) {
    return this.headers[name.toLowerCase()];
  }
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Auth Middleware', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    
    it('devrait authentifier un token JWT valide', () => {
      const req = mockRequest({ 'x-auth-token': 'valid_token' });
      const res = mockResponse();

      jwt.verify.mockReturnValue({ id: 1, email: 'test@example.com' });

      authenticateToken(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid_token', expect.any(String));
      expect(req.user).toEqual({ id: 1, email: 'test@example.com' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('devrait rejeter une requête sans token', () => {
      const req = mockRequest({});
      const res = mockResponse();

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Aucun token, autorisation refusée'
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait rejeter un token invalide', () => {
      const req = mockRequest({ 'x-auth-token': 'invalid_token' });
      const res = mockResponse();

      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: expect.any(String)
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait rejeter un token expiré', () => {
      const req = mockRequest({ 'x-auth-token': 'expired_token' });
      const res = mockResponse();

      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      authenticateToken(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Token non valide'
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('devrait extraire le token de différents headers', () => {
      const req = mockRequest({ 'authorization': 'Bearer valid_token' });
      const res = mockResponse();

      jwt.verify.mockReturnValue({ id: 1, email: 'test@example.com' });

      authenticateToken(req, res, mockNext);

      expect(req.user).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
