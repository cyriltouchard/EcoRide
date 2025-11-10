const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'ecoride_user',
            password: 'ecoride_secure_password',
            database: 'ecoride',
            port: 3306
        });

        // Afficher les réservations actuelles
        const [bookings] = await conn.execute(`
            SELECT b.id, b.ride_id, b.status, r.departure_city, r.arrival_city, r.driver_id, r.departure_date
            FROM bookings b 
            LEFT JOIN rides r ON b.ride_id = r.id 
            WHERE b.passenger_id = 1 
            ORDER BY r.departure_date DESC
            LIMIT 5
        `);

        console.log('\n📋 VOS RÉSERVATIONS ACTUELLES:\n');
        bookings.forEach((b, index) => {
            console.log(`${index + 1}. Réservation ID: ${b.id}`);
            console.log(`   Trajet: ${b.departure_city} → ${b.arrival_city}`);
            console.log(`   Date: ${b.departure_date}`);
            console.log(`   Statut: ${b.status}`);
            console.log(`   Chauffeur ID: ${b.driver_id}`);
            console.log('');
        });

        if (bookings.length > 0) {
            // Marquer la première réservation comme terminée
            const firstBooking = bookings[0];
            await conn.execute(
                'UPDATE bookings SET status = ? WHERE id = ?',
                ['completed', firstBooking.id]
            );
            
            await conn.execute(
                'UPDATE rides SET status = ? WHERE id = ?',
                ['completed', firstBooking.ride_id]
            );

            console.log(`✅ La réservation #${firstBooking.id} a été marquée comme TERMINÉE`);
            console.log(`✅ Le trajet #${firstBooking.ride_id} a été marqué comme TERMINÉ`);
            console.log('\n🎯 Vous pouvez maintenant tester la page avis !');
        } else {
            console.log('❌ Aucune réservation trouvée');
        }

        await conn.end();
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
})();
