/**
 * EcoRide - Configuration des données de test
 * ⚠️  ATTENTION: Ce fichier contient des données de test uniquement
 * ⚠️  NE JAMAIS UTILISER EN PRODUCTION
 * ⚠️  Les mots de passe sont des hashes bcrypt de "test123"
 * 
 * @file test-data.js
 */

/**
 * Données de test pour le chauffeur
 * Hash bcrypt de "test123" pour tests uniquement
 */
exports.TEST_DRIVER = {
    pseudo: 'Jean Dupont',
    email: 'chauffeur@ecoride.fr',
    // ⚠️  Hash bcrypt de "test123" - POUR TESTS UNIQUEMENT
    passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    userType: 'chauffeur',
    initialCredits: 20
};

/**
 * Données de test pour le passager
 * Hash bcrypt de "test123" pour tests uniquement
 */
exports.TEST_PASSENGER = {
    pseudo: 'Marie Martin',
    email: 'passager@ecoride.fr',
    // ⚠️  Hash bcrypt de "test123" - POUR TESTS UNIQUEMENT
    passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    userType: 'passager',
    initialCredits: 50
};

/**
 * Données de test pour le véhicule
 */
exports.TEST_VEHICLE = {
    brand: 'Renault',
    model: 'Zoé',
    plate: 'AB-123-CD',
    color: 'Bleu',
    energy: 'Électrique',
    seats: 4,
    year: 2022
};

/**
 * Données de test pour le trajet
 */
exports.TEST_RIDE = {
    departure: 'Paris',
    arrival: 'Lyon',
    departureTime: '08:00',
    price: 25,
    totalSeats: 3,
    isEcologic: true,
    description: 'Trajet test pour développement'
};

/**
 * Vérifie que nous sommes en environnement de développement
 * @throws {Error} Si l'environnement n'est pas development
 */
exports.ensureDevelopmentEnvironment = () => {
    if (process.env.NODE_ENV === 'production') {
        throw new Error(
            '❌ ERREUR CRITIQUE: Les scripts de test ne doivent JAMAIS être exécutés en production!\n' +
            '   Environnement détecté: production\n' +
            '   Ces scripts contiennent des données de test avec des credentials prédéfinis.'
        );
    }
    
    if (!process.env.NODE_ENV || process.env.NODE_ENV === '') {
        console.warn(
            '⚠️  AVERTISSEMENT: NODE_ENV n\'est pas défini.\n' +
            '   Assurez-vous d\'être en environnement de développement.\n' +
            '   Définissez NODE_ENV=development dans votre fichier .env'
        );
    }
    
    console.log('✅ Vérification environnement: ' + (process.env.NODE_ENV || 'non défini (assumé development)'));
};
