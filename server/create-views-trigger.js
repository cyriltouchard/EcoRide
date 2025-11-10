// ================================================
// SCRIPT - CRÉATION DES VUES ET TRIGGER
// ================================================

const { pool } = require('./config/db-mysql');

async function createViewsAndTrigger() {
    try {
        console.log('🚀 Création des vues et trigger...\n');

        // Vue 1: v_driver_ratings_summary
        console.log('📊 Création de v_driver_ratings_summary...');
        await pool.query(`
            CREATE OR REPLACE VIEW v_driver_ratings_summary AS
            SELECT 
                dr.driver_id,
                u.pseudo as driver_pseudo,
                COUNT(dr.id) as total_reviews,
                ROUND(AVG(dr.rating), 2) as avg_rating,
                ROUND(AVG(dr.punctuality_rating), 2) as avg_punctuality,
                ROUND(AVG(dr.driving_quality_rating), 2) as avg_driving_quality,
                ROUND(AVG(dr.vehicle_cleanliness_rating), 2) as avg_vehicle_cleanliness,
                ROUND(AVG(dr.friendliness_rating), 2) as avg_friendliness,
                SUM(CASE WHEN dr.rating = 5 THEN 1 ELSE 0 END) as five_stars,
                SUM(CASE WHEN dr.rating = 4 THEN 1 ELSE 0 END) as four_stars,
                SUM(CASE WHEN dr.rating = 3 THEN 1 ELSE 0 END) as three_stars,
                SUM(CASE WHEN dr.rating = 2 THEN 1 ELSE 0 END) as two_stars,
                SUM(CASE WHEN dr.rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM driver_reviews dr
            JOIN users u ON dr.driver_id = u.id
            WHERE dr.is_visible = TRUE
            GROUP BY dr.driver_id, u.pseudo
        `);
        console.log('✅ v_driver_ratings_summary créée\n');

        // Vue 2: v_site_ratings_summary
        console.log('📊 Création de v_site_ratings_summary...');
        await pool.query(`
            CREATE OR REPLACE VIEW v_site_ratings_summary AS
            SELECT 
                COUNT(id) as total_reviews,
                ROUND(AVG(overall_rating), 2) as avg_overall_rating,
                ROUND(AVG(ease_of_use_rating), 2) as avg_ease_of_use,
                ROUND(AVG(reliability_rating), 2) as avg_reliability,
                ROUND(AVG(customer_service_rating), 2) as avg_customer_service,
                ROUND(AVG(value_for_money_rating), 2) as avg_value_for_money,
                ROUND(
                    (SUM(CASE WHEN would_recommend = TRUE THEN 1 ELSE 0 END) / COUNT(id)) * 100, 
                    2
                ) as recommendation_percentage,
                SUM(CASE WHEN overall_rating = 5 THEN 1 ELSE 0 END) as five_stars,
                SUM(CASE WHEN overall_rating = 4 THEN 1 ELSE 0 END) as four_stars,
                SUM(CASE WHEN overall_rating = 3 THEN 1 ELSE 0 END) as three_stars,
                SUM(CASE WHEN overall_rating = 2 THEN 1 ELSE 0 END) as two_stars,
                SUM(CASE WHEN overall_rating = 1 THEN 1 ELSE 0 END) as one_star
            FROM site_reviews
            WHERE is_visible = TRUE
        `);
        console.log('✅ v_site_ratings_summary créée\n');

        // Vue 3: v_driver_reviews_detailed
        console.log('📊 Création de v_driver_reviews_detailed...');
        await pool.query(`
            CREATE OR REPLACE VIEW v_driver_reviews_detailed AS
            SELECT 
                dr.id as review_id,
                dr.driver_id,
                u_driver.pseudo as driver_pseudo,
                dr.passenger_id,
                u_passenger.pseudo as passenger_pseudo,
                dr.ride_id,
                r.departure_city,
                r.arrival_city,
                r.departure_datetime,
                dr.rating,
                dr.punctuality_rating,
                dr.driving_quality_rating,
                dr.vehicle_cleanliness_rating,
                dr.friendliness_rating,
                dr.comment,
                dr.created_at,
                dr.is_visible,
                dr.is_reported,
                rr.response_text as driver_response,
                rr.created_at as response_date
            FROM driver_reviews dr
            JOIN users u_driver ON dr.driver_id = u_driver.id
            JOIN users u_passenger ON dr.passenger_id = u_passenger.id
            LEFT JOIN rides r ON dr.ride_id = r.id
            LEFT JOIN review_responses rr ON dr.id = rr.review_id AND rr.review_type = 'driver'
            WHERE dr.is_visible = TRUE
            ORDER BY dr.created_at DESC
        `);
        console.log('✅ v_driver_reviews_detailed créée\n');

        // Trigger: tr_update_booking_rating
        console.log('🔧 Création du trigger tr_update_booking_rating...');
        
        // Supprimer le trigger s'il existe déjà
        try {
            await pool.query('DROP TRIGGER IF EXISTS tr_update_booking_rating');
        } catch (err) {
            // Ignorer si le trigger n'existe pas
        }
        
        await pool.query(`
            CREATE TRIGGER tr_update_booking_rating
            AFTER INSERT ON driver_reviews
            FOR EACH ROW
            BEGIN
                IF NEW.booking_id IS NOT NULL THEN
                    UPDATE bookings 
                    SET passenger_rating = NEW.rating,
                        passenger_comment = NEW.comment
                    WHERE id = NEW.booking_id;
                END IF;
            END
        `);
        console.log('✅ Trigger tr_update_booking_rating créé\n');

        console.log('✅ Toutes les vues et le trigger ont été créés avec succès!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

createViewsAndTrigger();
