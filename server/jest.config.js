module.exports = {
  // Environnement de test
  testEnvironment: 'node',

  // Répertoires de tests
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Fichiers à ignorer
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],

  // Configuration de la couverture
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/__tests__/**',
    '!**/coverage/**'
  ],

  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Répertoire de sortie de la couverture
  coverageDirectory: 'coverage',

  // Reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/testSetup.js'],

  // Timeout
  testTimeout: 10000,

  // Verbose
  verbose: true,

  // Forcer la sortie après les tests
  forceExit: true,

  // Nettoyer les mocks automatiquement
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
