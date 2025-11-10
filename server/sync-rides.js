// Script pour synchroniser les trajets MySQL vers MongoDB
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
require('dotenv').config();

const Ride = require('./models/rideModel');
const Vehicle = require('./models/vehicleModel');
const User = require('./models/userModel');

async function syncRidesToMongo() {
    try {
        console.log('🔄 Synchronisation des trajets MySQL → MongoDB');
        
        // Connexion MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connecté à MongoDB');
        
        // Connexion MySQL
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
        console.log('✅ Connecté à MySQL');
        
        // Récupérer tous les trajets MySQL
        const [rides] = await connection.execute(`
            SELECT r.*, v.energy_type 
            FROM rides r
            LEFT JOIN vehicles v ON r.vehicle_id = v.id
            WHERE r.status != 'annule'
        `);
        
        console.log(`📊 ${rides.length} trajet(s) trouvé(s) dans MySQL`);
        
        for (const ride of rides) {
            // Vérifier si déjà dans MongoDB
            const existing = await Ride.findOne({ sql_id: ride.id });
            if (existing) {
                console.log(`⏭️  Trajet ${ride.id} déjà dans MongoDB`);
                continue;
            }
            
            // Trouver le user MongoDB (ou créer un placeholder)
            let userMongo = await User.findOne({ sql_id: ride.driver_id });
            if (!userMongo) {
                console.log(`🔧 Création utilisateur MongoDB pour sql_id ${ride.driver_id}`);
                // Récupérer les infos depuis MySQL
                const [users] = await connection.execute(
                    'SELECT * FROM users WHERE id = ?', 
                    [ride.driver_id]
                );
                if (users.length > 0) {
                    userMongo = new User({
                        pseudo: users[0].pseudo,
                        email: users[0].email,
                        password: users[0].password_hash,
                        sql_id: users[0].id
                    });
                    await userMongo.save();
                    console.log(`✅ Utilisateur ${users[0].pseudo} créé dans MongoDB`);
                } else {
                    console.warn(`⚠️  Utilisateur ${ride.driver_id} non trouvé`);
                    continue;
                }
            }
            
            // Trouver le véhicule MongoDB
            const vehicleMongo = await Vehicle.findOne({ sql_id: ride.vehicle_id });
            
            // Créer dans MongoDB
            const rideMongo = new Ride({
                driver: userMongo._id,
                vehicle: vehicleMongo?._id,
                departure: ride.departure_city,
                arrival: ride.arrival_city,
                departureAddress: ride.departure_address,
                arrivalAddress: ride.arrival_address,
                departureDate: new Date(ride.departure_datetime),
                departureTime: new Date(ride.departure_datetime).toTimeString().slice(0, 5),
                price: ride.price_per_seat,
                availableSeats: ride.available_seats,
                totalSeats: ride.total_seats || ride.available_seats,
                status: ride.status === 'en_attente' ? 'active' : ride.status,
                isEcologic: ride.energy_type === 'electrique' || ride.energy_type === 'hybride',
                sql_id: ride.id
            });
            
            await rideMongo.save();
            console.log(`✅ Trajet ${ride.id} (${ride.departure_city} → ${ride.arrival_city}) synchronisé`);
        }
        
        await connection.end();
        await mongoose.disconnect();
        
        console.log('🎉 Synchronisation terminée !');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

syncRidesToMongo();
