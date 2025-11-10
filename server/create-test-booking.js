// Script pour créer une réservation test terminée
require('dotenv').config();
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

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
            database: process.env.DB_NAME || 'ecoride' // Utiliser ecoride par défaut (pas ecoride_sql)
        });
        console.log('✅ Connecté à MySQL (base:', process.env.DB_NAME || 'ecoride', ')');

        // Trouver un utilisateur passager (utilisateur connecté)
        const passenger = await User.findOne({ email: 'admin@ecoride.fr' });
        if (!passenger) {
            console.log('❌ Utilisateur passager non trouvé (admin@ecoride.fr)');
            console.log('💡 Créez d\'abord un compte avec cet email');
            process.exit(1);
        }
        
        // Vérifier que l'utilisateur a un sql_id
        if (!passenger.sql_id) {
            console.log('⚠️  L\'utilisateur n\'a pas de sql_id, recherche dans MySQL...');
            const [sqlUsers] = await connection.execute(
                `SELECT id FROM users WHERE email = ?`,
                [passenger.email]
            );
            
            if (sqlUsers.length > 0) {
                passenger.sql_id = sqlUsers[0].id;
                await passenger.save();
                console.log('✅ sql_id trouvé et mis à jour:', passenger.sql_id);
            } else {
                console.log('❌ Utilisateur non trouvé dans MySQL');
                process.exit(1);
            }
        }
        
        console.log('✅ Passager trouvé:', passenger.pseudo, '(Mongo ID:', passenger._id.toString(), ', SQL ID:', passenger.sql_id, ')');

        // Créer ou trouver un chauffeur différent dans MongoDB
        let driver = await User.findOne({ email: 'chauffeur@ecoride.fr' });
        let driverSqlId;
        
        if (!driver) {
            // Créer d'abord dans MySQL
            const [driverResult] = await connection.execute(
                `INSERT INTO users (pseudo, email, password_hash, user_type) 
                 VALUES (?, ?, ?, ?)`,
                ['Jean Dupont', 'chauffeur@ecoride.fr', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'chauffeur']
            );
            
            driverSqlId = driverResult.insertId;
            
            // Puis dans MongoDB
            driver = new User({
                pseudo: 'Jean Dupont',
                email: 'chauffeur@ecoride.fr',
                password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
                sql_id: driverSqlId
            });
            await driver.save();
            console.log('✅ Chauffeur créé:', driver.pseudo, '(SQL ID:', driverSqlId, ')');
            
            // Créer les crédits pour le chauffeur
            await connection.execute(
                `INSERT INTO user_credits (user_id, current_credits) VALUES (?, ?)`,
                [driverSqlId, 20]
            );
        } else {
            // Vérifier que le chauffeur existe dans MySQL
            const [sqlDrivers] = await connection.execute(
                `SELECT id FROM users WHERE email = ?`,
                [driver.email]
            );
            
            if (sqlDrivers.length > 0) {
                driverSqlId = sqlDrivers[0].id;
                // Mettre à jour le sql_id dans MongoDB si nécessaire
                if (driver.sql_id !== driverSqlId) {
                    driver.sql_id = driverSqlId;
                    await driver.save();
                }
                console.log('✅ Chauffeur trouvé:', driver.pseudo, '(SQL ID:', driverSqlId, ')');
            } else {
                // Le chauffeur existe dans MongoDB mais pas dans MySQL, le créer
                console.log('⚠️  Chauffeur existe dans MongoDB mais pas dans MySQL, création...');
                const [driverResult] = await connection.execute(
                    `INSERT INTO users (pseudo, email, password_hash, user_type) 
                     VALUES (?, ?, ?, ?)`,
                    [driver.pseudo, driver.email, driver.password, 'chauffeur']
                );
                
                driverSqlId = driverResult.insertId;
                driver.sql_id = driverSqlId;
                await driver.save();
                console.log('✅ Chauffeur créé dans MySQL (SQL ID:', driverSqlId, ')');
                
                // Créer les crédits
                await connection.execute(
                    `INSERT INTO user_credits (user_id, current_credits) VALUES (?, ?)`,
                    [driverSqlId, 20]
                );
            }
        }

        // Créer un véhicule pour le chauffeur
        let vehicle = await Vehicle.findOne({ userId: driver._id });
        let vehicleSqlId;
        
        if (!vehicle) {
            // Créer dans MySQL d'abord
            console.log('🚗 Création du véhicule dans MySQL avec driver sql_id =', driverSqlId);
            const [vehicleResult] = await connection.execute(
                `INSERT INTO vehicles (user_id, brand, model, color, license_plate, energy_type, available_seats)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [driverSqlId, 'Renault', 'Zoé', 'Bleu', 'EL-456-EC', 'electrique', 4]
            );
            vehicleSqlId = vehicleResult.insertId;
            
            // Puis dans MongoDB
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
            // Trouver l'ID SQL du véhicule
            const [sqlVehicles] = await connection.execute(
                `SELECT id FROM vehicles WHERE license_plate = ?`,
                [vehicle.plate]
            );
            if (sqlVehicles.length > 0) {
                vehicleSqlId = sqlVehicles[0].id;
                console.log('✅ Véhicule trouvé:', vehicle.brand, vehicle.model, '(SQL ID:', vehicleSqlId, ')');
            } else {
                console.log('❌ Véhicule non trouvé dans MySQL, création...');
                const [vehicleResult] = await connection.execute(
                    `INSERT INTO vehicles (user_id, brand, model, color, license_plate, energy_type, available_seats)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [driverSqlId, vehicle.brand, vehicle.model, vehicle.color, vehicle.plate, vehicle.energy === 'electric' ? 'electrique' : vehicle.energy, vehicle.seats]
                );
                vehicleSqlId = vehicleResult.insertId;
                console.log('✅ Véhicule créé dans MySQL (SQL ID:', vehicleSqlId, ')');
            }
        }

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
