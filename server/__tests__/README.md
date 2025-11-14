# 🧪 Tests EcoRide

Tests unitaires et d'intégration pour l'application EcoRide.

## 🚀 Démarrage Rapide

### Installation des dépendances

```bash
cd server
npm install
```

### Lancer les tests

```bash
# Tous les tests
npm test

# Tests en mode watch (recommandé pour le développement)
npm run test:watch

# Tests avec couverture de code
npm run test:coverage

# Tests unitaires seulement
npm run test:unit

# Tests d'intégration seulement
npm run test:integration

# Tests verbose (plus de détails)
npm run test:verbose
```

## 📁 Structure

```
__tests__/
├── unit/                    # Tests unitaires
│   ├── controllers/        # Tests des contrôleurs
│   ├── models/            # Tests des modèles
│   └── middleware/        # Tests des middleware
├── integration/            # Tests d'intégration
└── setup/                  # Configuration des tests
    ├── testSetup.js       # Setup global
    └── testDatabase.js    # Setup base de données test
```

## ✅ Tests Disponibles

### Controllers
- ✅ `userController.test.js` - Tests complets (register, login, profile)
- 📝 `rideController.test.js` - À créer
- 📝 `vehicleController.test.js` - À créer
- 📝 `creditController.test.js` - À créer

### Models
- 📝 `userModel.test.js` - À créer
- 📝 `rideModel.test.js` - À créer

### Middleware
- 📝 `auth.test.js` - À créer
- 📝 `security.test.js` - À créer

## 📊 Couverture Actuelle

| Module | Couverture | Objectif |
|--------|-----------|----------|
| Controllers | 15% | 90% |
| Models | 0% | 85% |
| Middleware | 0% | 80% |
| **TOTAL** | **5%** | **80%** |

## 💡 Exemple de Test

```javascript
describe('UserController', () => {
  describe('register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      // Arrange
      const req = mockRequest({
        body: {
          pseudo: 'testuser',
          email: 'test@test.com',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      // Act
      await userController.register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true
        })
      );
    });
  });
});
```

## 🔧 Configuration

### Jest Config (`jest.config.js`)
- Environment: Node
- Coverage threshold: 80%
- Timeout: 10 seconds

### Test Setup (`__tests__/setup/testSetup.js`)
- Variables d'environnement de test
- Helpers globaux (`mockRequest`, `mockResponse`, `mockNext`)
- Configuration console

## 📝 Bonnes Pratiques

1. **Nommage** : Utilisez des descriptions claires
   ```javascript
   it('devrait faire X quand Y')
   ```

2. **Structure AAA** : Arrange-Act-Assert
   ```javascript
   // Arrange - Préparer
   // Act - Exécuter
   // Assert - Vérifier
   ```

3. **Isolation** : Chaque test doit être indépendant

4. **Mocking** : Mocker les dépendances externes

5. **Couverture** : Viser 80%+ de couverture

## 🎯 Prochaines Étapes

1. ✅ Configuration Jest
2. ✅ Premier test (userController)
3. 🔄 Tests rideController
4. 📝 Tests vehicleController
5. 📝 Tests models
6. 📝 Tests middleware
7. 📝 Tests d'intégration

## 📚 Documentation

- [Guide complet des tests](../document/technique/TESTS-UNITAIRES-GUIDE.md)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

**Objectif : 80% de couverture en 2 semaines** 🎯
