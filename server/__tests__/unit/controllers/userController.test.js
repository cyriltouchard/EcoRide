/**
 * Tests unitaires pour userController
 * Couvre l'inscription, la connexion, la gestion du profil
 */

const userController = require('../../../controllers/userController');
const UserSQL = require('../../../models/userSQLModel');
const User = require('../../../models/userModel');
const CreditModel = require('../../../models/creditModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock des modèles
jest.mock('../../../models/userSQLModel');
jest.mock('../../../models/userModel');
jest.mock('../../../models/creditModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('UserController', () => {
  
  // ==================== REGISTER ====================
  describe('register', () => {
    
    it('devrait créer un nouvel utilisateur avec des données valides', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          pseudo: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Mock des appels
      UserSQL.findByEmail.mockResolvedValue(null);
      UserSQL.findByPseudo.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed_password');
      UserSQL.create.mockResolvedValue({ 
        id: 1, 
        pseudo: 'testuser', 
        email: 'test@example.com' 
      });
      User.prototype.save = jest.fn().mockResolvedValue({ 
        _id: 'mongo123', 
        email: 'test@example.com' 
      });
      jwt.sign.mockReturnValue('fake_jwt_token');
      CreditModel.getUserCredits.mockResolvedValue({ current_credits: 20 });

      // Act
      await userController.register(req, res);

      // Assert
      expect(UserSQL.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(UserSQL.findByPseudo).toHaveBeenCalledWith('testuser');
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(UserSQL.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Compte créé avec succès',
          data: expect.objectContaining({
            token: 'fake_jwt_token',
            user: expect.any(Object)
          })
        })
      );
    });

    it('devrait rejeter une inscription avec un email existant', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          pseudo: 'testuser',
          email: 'existing@example.com',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      UserSQL.findByEmail.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('déjà utilisé')
        })
      );
    });

    it('devrait rejeter une inscription avec un email invalide', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          pseudo: 'testuser',
          email: 'invalid-email',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('invalide')
        })
      );
    });

    it('devrait rejeter une inscription avec des champs manquants', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          pseudo: 'testuser'
          // email et password manquants
        }
      });
      const res = mockResponse();

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    });
  });

  // ==================== LOGIN ====================
  describe('login', () => {
    
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      const mockUser = {
        id: 1,
        pseudo: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        user_type: 'passager',
        current_credits: 20
      };

      UserSQL.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ 
          _id: 'mongo123', 
          email: 'test@example.com' 
        })
      });
      jwt.sign.mockReturnValue('fake_jwt_token');

      // Act
      await userController.login(req, res);

      // Assert
      expect(UserSQL.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashed_password');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Connexion réussie',
          data: expect.objectContaining({
            token: 'fake_jwt_token'
          })
        })
      );
    });

    it('devrait rejeter une connexion avec un email inexistant', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      UserSQL.findByEmail.mockResolvedValue(null);

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    });

    it('devrait rejeter une connexion avec un mauvais mot de passe', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'WrongPassword'
        }
      });
      const res = mockResponse();

      UserSQL.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password'
      });
      bcrypt.compare.mockResolvedValue(false);

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    });
  });

  // ==================== GET USER PROFILE ====================
  describe('getUserProfile', () => {
    
    it('devrait retourner le profil d\'un utilisateur existant', async () => {
      // Arrange
      const req = mockRequest({
        user: { id: 1, pseudo: 'testuser' }
      });
      const res = mockResponse();

      const mockUserSQL = {
        id: 1,
        pseudo: 'testuser',
        email: 'test@example.com',
        user_type: 'passager',
        current_credits: 20
      };

      UserSQL.findById.mockResolvedValue(mockUserSQL);
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({})
      });
      CreditModel.getUserCredits.mockResolvedValue({ current_credits: 20 });

      // Act
      await userController.getUserProfile(req, res);

      // Assert
      expect(UserSQL.findById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1,
            pseudo: 'testuser',
            email: 'test@example.com'
          })
        })
      );
    });

    it('devrait retourner une erreur si l\'utilisateur n\'existe pas', async () => {
      // Arrange
      const req = mockRequest({
        user: { id: 999 }
      });
      const res = mockResponse();

      UserSQL.findById.mockResolvedValue(null);

      // Act
      await userController.getUserProfile(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('trouvé')
        })
      );
    });
  });

  // ==================== UPDATE PROFILE ====================
  describe('updateProfile', () => {
    
    it('devrait mettre à jour le profil avec des données valides', async () => {
      // Arrange
      const req = mockRequest({
        user: { id: 1 },
        body: {
          pseudo: 'newpseudo',
          email: 'newemail@example.com'
        }
      });
      const res = mockResponse();

      UserSQL.updateProfile.mockResolvedValue(true);

      // Act
      await userController.updateProfile(req, res);

      // Assert
      expect(UserSQL.updateProfile).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('mis à jour')
        })
      );
    });
  });

  // ==================== UPDATE PROFILE PICTURE ====================
  describe('updateProfilePicture', () => {
    
    it('devrait mettre à jour la photo de profil avec une image valide', async () => {
      // Arrange
      const req = mockRequest({
        user: { id: 1 },
        body: {
          profile_picture: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
        }
      });
      const res = mockResponse();

      UserSQL.updateProfile.mockResolvedValue(true);

      // Act
      await userController.updateProfilePicture(req, res);

      // Assert
      expect(UserSQL.updateProfile).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.stringContaining('Photo de profil')
        })
      );
    });

    it('devrait rejeter une image trop volumineuse', async () => {
      // Arrange
      const largeImage = 'data:image/jpeg;base64,' + 'A'.repeat(10 * 1024 * 1024); // > 5MB
      const req = mockRequest({
        user: { id: 1 },
        body: {
          profile_picture: largeImage
        }
      });
      const res = mockResponse();

      // Act
      await userController.updateProfilePicture(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('volumineuse')
        })
      );
    });
  });
});
