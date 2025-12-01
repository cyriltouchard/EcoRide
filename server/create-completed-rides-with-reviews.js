/**
 * Script pour créer des courses terminées et des avis de test
 * Permet de tester le système d'avis dans l'admin
 */

require('dotenv').config();
const { pool } = require('./config/db-mysql');

async function createCompletedRidesWithReviews() {
    const connection = await pool.getConnection();
    
    try {
        console.log('🚀 Création de courses terminées avec avis...\n');

        // 1. Récupérer ou créer des utilisateurs de test
        const [users] = await connection.query(`
            SELECT id, pseudo, email FROM users 
            WHERE user_type IN ('chauffeur', 'passager', 'admin')
            LIMIT 5
        `);

        if (users.length < 2) {
            console.log('❌ Pas assez d\'utilisateurs. Créez-en quelques-uns d\'abord.');
            return;
        }

        const driver = users[0];
        const passengers = users.slice(1, 4);

        console.log(`✅ Chauffeur: ${driver.pseudo} (${driver.email})`);
        console.log(`✅ Passagers: ${passengers.map(p => p.pseudo).join(', ')}\n`);

        // 2. Vérifier si le chauffeur a un véhicule
        const [vehicles] = await connection.query(
            'SELECT id FROM vehicles WHERE user_id = ? LIMIT 1',
            [driver.id]
        );

        let vehicleId;
        if (vehicles.length === 0) {
            // Créer un véhicule pour le chauffeur
            const [vehicleResult] = await connection.execute(
                `INSERT INTO vehicles (user_id, brand, model, color, license_plate, energy_type, available_seats, first_registration)
                 VALUES (?, 'Renault', 'Zoe', 'Blanc', 'AB-123-CD', 'electrique', 4, '2023-01-01')`,
                [driver.id]
            );
            vehicleId = vehicleResult.insertId;
            console.log('✅ Véhicule créé pour le chauffeur\n');
        } else {
            vehicleId = vehicles[0].id;
            console.log('✅ Véhicule existant utilisé\n');
        }

        // 3. Créer des trajets terminés
        const ridesData = [
            {
                departure: 'Paris',
                arrival: 'Lyon',
                date: '2024-11-15',
                price: 35
            },
            {
                departure: 'Lyon',
                arrival: 'Marseille',
                date: '2024-11-20',
                price: 25
            },
            {
                departure: 'Paris',
                arrival: 'Bordeaux',
                date: '2024-11-25',
                price: 40
            }
        ];

        const rideIds = [];

        for (const ride of ridesData) {
            // Créer le trajet avec statut "termine"
            const [rideResult] = await connection.execute(
                `INSERT INTO rides 
                (driver_id, vehicle_id, departure_city, arrival_city, departure_datetime, 
                 price_per_seat, total_seats, available_seats, status, platform_commission)
                VALUES (?, ?, ?, ?, ?, ?, 3, 0, 'termine', 2)`,
                [driver.id, vehicleId, ride.departure, ride.arrival, ride.date + ' 10:00:00', ride.price]
            );

            const rideId = rideResult.insertId;
            rideIds.push(rideId);

            console.log(`✅ Trajet créé: ${ride.departure} → ${ride.arrival} (ID: ${rideId})`);

            // Créer des réservations pour ce trajet
            for (let i = 0; i < Math.min(passengers.length, 2); i++) {
                const passenger = passengers[i];
                
                await connection.execute(
                    `INSERT INTO bookings 
                    (ride_id, passenger_id, seats_booked, total_cost, booking_status)
                    VALUES (?, ?, 1, ?, 'confirme')`,
                    [rideId, passenger.id, ride.price]
                );

                console.log(`  ✅ Réservation créée pour ${passenger.pseudo}`);
            }
        }

        console.log('\n📝 Création des avis du site...\n');

        // 4. Créer des avis pour le site (pas pour les trajets individuels)
        const reviewComments = [
            'Excellente plateforme, facile à utiliser !',
            'Très satisfait du service EcoRide.',
            'Interface intuitive, je recommande.',
            'Super concept, continuez comme ça !',
            'Bonne expérience globale avec EcoRide.',
            'Plateforme fiable et pratique.'
        ];

        let reviewCount = 0;

        // Créer des avis site pour différents utilisateurs
        for (let i = 0; i < Math.min(passengers.length, 3); i++) {
            const passenger = passengers[i];
            const overallRating = Math.floor(Math.random() * 2) + 4; // Entre 4 et 5
            const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];

            await connection.execute(
                `INSERT INTO site_reviews 
                (user_id, overall_rating, ease_of_use_rating, reliability_rating, 
                 customer_service_rating, value_for_money_rating, comment, would_recommend, is_visible)
                VALUES (?, ?, ?, ?, ?, ?, ?, true, true)`,
                [passenger.id, overallRating, overallRating, overallRating, 
                 overallRating, overallRating, comment]
            );

            reviewCount++;
            console.log(`  ⭐ Avis ${overallRating}/5 par ${passenger.pseudo}: "${comment}"`);
        }

        console.log(`\n🎉 Terminé ! ${rideIds.length} trajets et ${reviewCount} avis créés avec succès!`);
        console.log(`\n💡 Maintenant, allez sur la page admin pour voir les avis.`);

    } catch (error) {
        console.error('❌ Erreur:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// Exécuter le script
createCompletedRidesWithReviews()
    .then(() => {
        console.log('\n✅ Script terminé');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    });
