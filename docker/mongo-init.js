// Script d'initialisation MongoDB pour EcoRide
print('🚀 Initialisation base de données MongoDB EcoRide...');

// Création d'un utilisateur pour la base ecoride
db = db.getSiblingDB('ecoride');

// Créer un utilisateur avec les droits readWrite sur ecoride
db.createUser({
  user: 'ecoride_user',
  pwd: 'ecoride_user_2025',
  roles: [
    { role: 'readWrite', db: 'ecoride' }
  ]
});

print('✅ Utilisateur ecoride_user créé avec succès');

print('📝 Initialisation des collections et des index...');

// Collection véhicules de test (seed minimal sans données sensibles)
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