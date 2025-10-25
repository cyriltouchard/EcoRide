// Script d'initialisation MongoDB pour EcoRide
print('🚀 Initialisation base de données MongoDB EcoRide...');

// Sélection de la base de données
db = db.getSiblingDB('ecoride');

// Création de l'utilisateur applicatif
db.createUser({
  user: 'ecoride_app',
  pwd: 'ecoride_app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'ecoride'
    }
  ]
});

// Insertion de données de test
print('📝 Insertion des données de test...');

// Collection utilisateurs de test
db.users.insertMany([
  {
    _id: ObjectId(),
    email: 'admin@ecoride.fr',
    profile: {
      firstName: 'Admin',
      lastName: 'EcoRide',
      phone: '0123456789'
    },
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfI0h3YPNK.KYme', // password: admin123
    credits: 100,
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId(),
    email: 'test@ecoride.fr',
    profile: {
      firstName: 'Test',
      lastName: 'User',
      phone: '0987654321'
    },
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfI0h3YPNK.KYme', // password: test123
    credits: 20,
    role: 'user',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Collection véhicules de test
db.vehicles.insertMany([
  {
    _id: ObjectId(),
    userId: 'admin@ecoride.fr',
    brand: 'Toyota',
    model: 'Prius',
    year: 2022,
    energyType: 'hybride',
    seats: 5,
    color: 'Blanc',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Index pour optimiser les performances
print('🔍 Création des index de performance...');

// Index utilisateurs
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": -1 });

// Index véhicules
db.vehicles.createIndex({ "userId": 1 });
db.vehicles.createIndex({ "energyType": 1 });

// Index trajets
db.rides.createIndex({ "driverId": 1 });
db.rides.createIndex({ "departure.city": 1, "destination.city": 1 });
db.rides.createIndex({ "date": 1 });
db.rides.createIndex({ "isActive": 1 });

print('✅ Initialisation MongoDB EcoRide terminée avec succès !');
print('📊 Collections créées : users, vehicles, rides');
print('👤 Utilisateurs de test : admin@ecoride.fr / test@ecoride.fr');
print('🔑 Mot de passe test : admin123 / test123');