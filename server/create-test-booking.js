// Script pour créer une réservation test terminée
// ⚠️  ATTENTION: Ce script est destiné au développement/tests uniquement
// ⚠️  NE JAMAIS EXÉCUTER EN PRODUCTION
require('dotenv').config();
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const { TEST_DRIVER, ensureDevelopmentEnvironment } = require('./config/test-data');

// Vérification environnement avant toute opération
ensureDevelopmentEnvironment();

// Schémas MongoDB
const userSchema = new mongoose.Schema({
    pseudo: String,
    email: String,
    password: String,
    sql_id: Number
});

const vehicleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    brand: String,
    model: String,
    plate: String,
    color: String,
    energy: String,
    seats: Number,
    year: Number
});

const rideSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    departure: String,
    arrival: String,
    departureDate: Date,
    departureTime: String,
    price: Number,
    totalSeats: Number,
    availableSeats: Number,
    status: String,
    isEcologic: Boolean,
    description: String
});

const User = mongoose.model('User', userSchema);
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
const Ride = mongoose.model('Ride', rideSchema);

/**
 * Trouve ou synchronise l'ID SQL d'un utilisateur
 * @param {Object} user - Utilisateur MongoDB
 * @param {Object} connection - Connexion MySQL
 * @returns {Promise<number>} ID SQL de l'utilisateur
 */
async function ensureSqlId(user, connection) {
    if (user.sql_id) {
        return user.sql_id;
    }
    
    console.log('⚠️  L\'utilisateur n\'a pas de sql_id, recherche dans MySQL...');
    const [sqlUsers] = await connection.execute(
        `SELECT id FROM users WHERE email = ?`,
        [user.email]
    );
    
    if (sqlUsers.length === 0) {
        console.log('❌ Utilisateur non trouvé dans MySQL');
        process.exit(1);
    }
    
    user.sql_id = sqlUsers[0].id;
    await user.save();
    console.log('✅ sql_id trouvé et mis à jour:', user.sql_id);
    return user.sql_id;
}

/**
 * Crée ou trouve un chauffeur dans les deux bases
 * @param {Object} connection - Connexion MySQL
 * @returns {Promise<{driver: Object, driverSqlId: number}>}
 */
async function getOrCreateDriver(connection) {
    let driver = await User.findOne({ email: TEST_DRIVER.email });
    let driverSqlId;
    
    if (!driver) {
        // Créer dans MySQL puis MongoDB avec données de test
        const [driverResult] = await connection.execute(
            `INSERT INTO users (pseudo, email, password_hash, user_type) 
             VALUES (?, ?, ?, ?)`,
            [TEST_DRIVER.pseudo, TEST_DRIVER.email, TEST_DRIVER.passwordHash, TEST_DRIVER.userType]
        );
        
        driverSqlId = driverResult.insertId;
        driver = new User({
            pseudo: TEST_DRIVER.pseudo,
            email: TEST_DRIVER.email,
            password: TEST_DRIVER.passwordHash, // Hash bcrypt de "test123" - pour tests uniquement
            sql_id: driverSqlId
        });
        await driver.save();
        console.log('✅ Chauffeur créé:', driver.pseudo, '(SQL ID:', driverSqlId, ')');
        
        await connection.execute(
            `INSERT INTO user_credits (user_id, current_credits) VALUES (?, ?)`,
            [driverSqlId, TEST_DRIVER.initialCredits]
        );
    } else {
        driverSqlId = await syncDriverToMySQL(driver, connection);
    }
    
    return { driver, driverSqlId };
}

/**
 * Synchronise un chauffeur existant avec MySQL
 * @param {Object} driver - Chauffeur MongoDB
 * @param {Object} connection - Connexion MySQL
 * @returns {Promise<number>} ID SQL du chauffeur
 */
async function syncDriverToMySQL(driver, connection) {
    const [sqlDrivers] = await connection.execute(
        `SELECT id FROM users WHERE email = ?`,
        [driver.email]
    );
    
    if (sqlDrivers.length > 0) {
        const driverSqlId = sqlDrivers[0].id;
        if (driver.sql_id !== driverSqlId) {
            driver.sql_id = driverSqlId;
            await driver.save();
        }
        console.log('✅ Chauffeur trouvé:', driver.pseudo, '(SQL ID:', driverSqlId, ')');
        return driverSqlId;
    }
    
    // Créer dans MySQL si absent
    console.log('⚠️  Chauffeur existe dans MongoDB mais pas dans MySQL, création...');
    const [driverResult] = await connection.execute(
        `INSERT INTO users (pseudo, email, password_hash, user_type) 
         VALUES (?, ?, ?, ?)`,
        [driver.pseudo, driver.email, driver.password, 'chauffeur']
    );
    
    const driverSqlId = driverResult.insertId;
    driver.sql_id = driverSqlId;
    await driver.save();
    console.log('✅ Chauffeur créé dans MySQL (SQL ID:', driverSqlId, ')');
    
    await connection.execute(
        `INSERT INTO user_credits (user_id, current_credits) VALUES (?, ?)`,
        [driverSqlId, 20]
    );
    
    return driverSqlId;
}

/**
 * Crée ou trouve un véhicule dans les deux bases
 * @param {Object} driver - Chauffeur MongoDB
 * @param {number} driverSqlId - ID SQL du chauffeur
 * @param {Object} connection - Connexion MySQL
 * @returns {Promise<{vehicle: Object, vehicleSqlId: number}>}
 */
async function getOrCreateVehicle(driver, driverSqlId, connection) {
    let vehicle = await Vehicle.findOne({ userId: driver._id });
    let vehicleSqlId;
    
    if (!vehicle) {
        console.log('🚗 Création du véhicule dans MySQL avec driver sql_id =', driverSqlId);
        const [vehicleResult] = await connection.execute(
            `INSERT INTO vehicles (user_id, brand, model, color, license_plate, energy_type, available_seats)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [driverSqlId, 'Renault', 'Zoé', 'Bleu', 'EL-456-EC', 'electrique', 4]
        );
        vehicleSqlId = vehicleResult.insertId;
        
        vehicle = new Vehicle({
            userId: driver._id,
            brand: 'Renault',
            model: 'Zoé',
            plate: 'EL-456-EC',
            color: 'Bleu',
            energy: 'electric',
            seats: 4,
            year: 2022
        });
        await vehicle.save();
        console.log('✅ Véhicule créé:', vehicle.brand, vehicle.model, '(SQL ID:', vehicleSqlId, ')');
    } else {
        vehicleSqlId = await syncVehicleToMySQL(vehicle, driverSqlId, connection);
    }
    
    return { vehicle, vehicleSqlId };
}

/**
 * Synchronise un véhicule existant avec MySQL
 * @param {Object} vehicle - Véhicule MongoDB
 * @param {number} driverSqlId - ID SQL du chauffeur
 * @param {Object} connection - Connexion MySQL
 * @returns {Promise<number>} ID SQL du véhicule
 */
async function syncVehicleToMySQL(vehicle, driverSqlId, connection) {
    const [sqlVehicles] = await connection.execute(
        `SELECT id FROM vehicles WHERE license_plate = ?`,
        [vehicle.plate]
    );
    
    if (sqlVehicles.length > 0) {
        console.log('✅ Véhicule trouvé:', vehicle.brand, vehicle.model, '(SQL ID:', sqlVehicles[0].id, ')');
        return sqlVehicles[0].id;
    }
    
    console.log('❌ Véhicule non trouvé dans MySQL, création...');
    const energyType = vehicle.energy === 'electric' ? 'electrique' : vehicle.energy;
    const [vehicleResult] = await connection.execute(
        `INSERT INTO vehicles (user_id, brand, model, color, license_plate, energy_type, available_seats)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [driverSqlId, vehicle.brand, vehicle.model, vehicle.color, vehicle.plate, energyType, vehicle.seats]
    );
    
    console.log('✅ Véhicule créé dans MySQL (SQL ID:', vehicleResult.insertId, ')');
    return vehicleResult.insertId;
}

async function createTestBooking() {
    let connection;
    
    try {
        // Connexion MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB');

        // Connexion MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'rootpassword',
            database: process.env.DB_NAME || 'ecoride'
        });
        console.log('✅ Connecté à MySQL (base:', process.env.DB_NAME || 'ecoride', ')');

        // Trouver le passager
        const passenger = await User.findOne({ email: 'admin@ecoride.fr' });
        if (!passenger) {
            console.log('❌ Utilisateur passager non trouvé (admin@ecoride.fr)');
            console.log('💡 Créez d\'abord un compte avec cet email');
            process.exit(1);
        }
        
        await ensureSqlId(passenger, connection);
        console.log('✅ Passager trouvé:', passenger.pseudo, '(Mongo ID:', passenger._id.toString(), ', SQL ID:', passenger.sql_id, ')');

        // Créer ou trouver le chauffeur
        const { driver, driverSqlId } = await getOrCreateDriver(connection);

        // Créer ou trouver le véhicule
        const { vehicle, vehicleSqlId } = await getOrCreateVehicle(driver, driverSqlId, connection);

        // Créer un trajet terminé (dans le passé)
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 3); // Il y a 3 jours
        pastDate.setHours(8, 0, 0, 0); // 08:00
        
        // Créer dans MySQL d'abord
        const [rideResult] = await connection.execute(
            `INSERT INTO rides 
            (driver_id, vehicle_id, departure_city, arrival_city, departure_datetime, 
             price_per_seat, total_seats, available_seats, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                driverSqlId,
                vehicleSqlId,
                'Paris',
                'Lyon',
                pastDate.toISOString().slice(0, 19).replace('T', ' '), // Format MySQL DATETIME
                35,
                3,
                2, // Une place réservée
                'termine' // IMPORTANT: statut terminé
            ]
        );
        
        const rideSqlId = rideResult.insertId;
        console.log('✅ Trajet créé dans MySQL (ID:', rideSqlId, ')');

        // Puis créer dans MongoDB
        const ride = new Ride({
            driver: driver._id,
            vehicle: vehicle._id,
            departure: 'Paris',
            arrival: 'Lyon',
            departureDate: pastDate,
            departureTime: '08:00',
            price: 35,
            totalSeats: 3,
            availableSeats: 2,
            status: 'completed',
            isEcologic: true,
            description: 'Trajet test terminé pour les avis'
        });
        await ride.save();
        console.log('✅ Trajet créé dans MongoDB (ID:', ride._id.toString(), ')');

        // Créer la réservation dans MySQL
        const [bookingResult] = await connection.execute(
            `INSERT INTO bookings 
            (ride_id, passenger_id, seats_booked, total_cost, booking_status, booking_date)
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [
                rideSqlId, // Utiliser l'ID SQL du trajet
                passenger.sql_id, // Utiliser l'ID SQL du passager
                1,
                ride.price,
                'termine' // IMPORTANT: réservation terminée
            ]
        );
        
        console.log('✅ Réservation créée dans MySQL (ID:', bookingResult.insertId, ')');
        console.log('\n✅ Données de test créées avec succès !');
        console.log('\n📋 Résumé:');
        console.log('   - Passager:', passenger.pseudo, '(' + passenger.email + ')');
        console.log('   - Chauffeur:', driver.pseudo, '(' + driver.email + ')');
        console.log('   - Trajet:', 'Paris -> Lyon');
        console.log('   - Date du trajet:', pastDate.toLocaleDateString('fr-FR'));
        console.log('   - Statut: TERMINÉ (termine)');
        console.log('   - ID MySQL trajet:', rideSqlId);
        console.log('   - ID MySQL réservation:', bookingResult.insertId);
        console.log('\n🎯 Vous pouvez maintenant:');
        console.log('   1. Vous connecter avec: admin@ecoride.fr');
        console.log('   2. Aller sur la page "Mes Réservations"');
        console.log('   3. Voir le bouton "Laisser un avis" pour ce trajet');
        console.log('   4. Tester la page avis.html !');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error(error);
    } finally {
        if (connection) await connection.end();
        await mongoose.connection.close();
        console.log('\n👋 Connexions fermées');
    }
}

// Exécuter le script
createTestBooking();
