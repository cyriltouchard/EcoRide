/**
 * Configuration globale pour tous les tests
 */

// Variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_NAME = 'ecoride_test';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.MONGODB_URI = 'mongodb://localhost:27017/ecoride_test';

// Augmenter le timeout pour les tests d'intégration
jest.setTimeout(10000);

// Mock console pour éviter le spam dans les tests
global.console = {
  ...console,
  log: jest.fn(), // Désactiver console.log
  error: jest.fn(), // Désactiver console.error (ou laisser pour debug)
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Nettoyer après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

// Helper pour créer des mocks de requête/réponse Express
global.mockRequest = (data = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
    headers: data.headers || {},
    user: data.user || null,
    ...data
  };
};

global.mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

global.mockNext = () => jest.fn();

console.log('✅ Test setup initialized');
