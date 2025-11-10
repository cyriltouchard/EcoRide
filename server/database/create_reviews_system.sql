-- ================================================
-- SYSTÈME DE NOTATION ET AVIS ECORIDE
-- ================================================

USE ecoride_sql;

-- ================================================
-- TABLE DRIVER_REVIEWS (Avis sur les chauffeurs)
-- ================================================
CREATE TABLE IF NOT EXISTS driver_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    passenger_id INT NOT NULL,
    ride_id INT,
    booking_id INT,
    
    -- Notation sur 5 étoiles
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    
    -- Critères détaillés (optionnels)
    punctuality_rating INT CHECK (punctuality_rating BETWEEN 1 AND 5),
    driving_quality_rating INT CHECK (driving_quality_rating BETWEEN 1 AND 5),
    vehicle_cleanliness_rating INT CHECK (vehicle_cleanliness_rating BETWEEN 1 AND 5),
    friendliness_rating INT CHECK (friendliness_rating BETWEEN 1 AND 5),
    
    -- Commentaire
    comment TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_visible BOOLEAN DEFAULT TRUE,
    is_reported BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Un passager ne peut noter un chauffeur qu'une fois par trajet
    UNIQUE KEY unique_review_per_ride (driver_id, passenger_id, ride_id),
    
    INDEX idx_driver_reviews (driver_id),
    INDEX idx_passenger_reviews (passenger_id),
    INDEX idx_rating (rating),
    INDEX idx_created_date (created_at)
);

-- ================================================
-- TABLE SITE_REVIEWS (Avis généraux sur le site)
-- ================================================
CREATE TABLE IF NOT EXISTS site_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Notation globale du site
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    
    -- Critères spécifiques
    ease_of_use_rating INT CHECK (ease_of_use_rating BETWEEN 1 AND 5),
    reliability_rating INT CHECK (reliability_rating BETWEEN 1 AND 5),
    customer_service_rating INT CHECK (customer_service_rating BETWEEN 1 AND 5),
    value_for_money_rating INT CHECK (value_for_money_rating BETWEEN 1 AND 5),
    
    -- Commentaire
    comment TEXT,
    
    -- Recommandation
    would_recommend BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_visible BOOLEAN DEFAULT TRUE,
    is_reported BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_reviews (user_id),
    INDEX idx_overall_rating (overall_rating),
    INDEX idx_created_date (created_at)
);

-- ================================================
-- TABLE REVIEW_RESPONSES (Réponses aux avis)
-- ================================================
CREATE TABLE IF NOT EXISTS review_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    review_type ENUM('driver', 'site') NOT NULL,
    responder_id INT NOT NULL,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_review_responses (review_id, review_type)
);

-- ================================================
-- VUE : Statistiques moyennes des chauffeurs
-- ================================================
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
    
    -- Distribution des notes
    SUM(CASE WHEN dr.rating = 5 THEN 1 ELSE 0 END) as five_stars,
    SUM(CASE WHEN dr.rating = 4 THEN 1 ELSE 0 END) as four_stars,
    SUM(CASE WHEN dr.rating = 3 THEN 1 ELSE 0 END) as three_stars,
    SUM(CASE WHEN dr.rating = 2 THEN 1 ELSE 0 END) as two_stars,
    SUM(CASE WHEN dr.rating = 1 THEN 1 ELSE 0 END) as one_star
    
FROM driver_reviews dr
JOIN users u ON dr.driver_id = u.id
WHERE dr.is_visible = TRUE
GROUP BY dr.driver_id, u.pseudo;

-- ================================================
-- VUE : Statistiques globales du site
-- ================================================
CREATE OR REPLACE VIEW v_site_ratings_summary AS
SELECT 
    COUNT(id) as total_reviews,
    ROUND(AVG(overall_rating), 2) as avg_overall_rating,
    ROUND(AVG(ease_of_use_rating), 2) as avg_ease_of_use,
    ROUND(AVG(reliability_rating), 2) as avg_reliability,
    ROUND(AVG(customer_service_rating), 2) as avg_customer_service,
    ROUND(AVG(value_for_money_rating), 2) as avg_value_for_money,
    
    -- Taux de recommandation
    ROUND(
        (SUM(CASE WHEN would_recommend = TRUE THEN 1 ELSE 0 END) / COUNT(id)) * 100, 
        2
    ) as recommendation_percentage,
    
    -- Distribution des notes
    SUM(CASE WHEN overall_rating = 5 THEN 1 ELSE 0 END) as five_stars,
    SUM(CASE WHEN overall_rating = 4 THEN 1 ELSE 0 END) as four_stars,
    SUM(CASE WHEN overall_rating = 3 THEN 1 ELSE 0 END) as three_stars,
    SUM(CASE WHEN overall_rating = 2 THEN 1 ELSE 0 END) as two_stars,
    SUM(CASE WHEN overall_rating = 1 THEN 1 ELSE 0 END) as one_star
    
FROM site_reviews
WHERE is_visible = TRUE;

-- ================================================
-- VUE : Avis détaillés des chauffeurs
-- ================================================
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
ORDER BY dr.created_at DESC;

-- ================================================
-- TRIGGER : Mise à jour automatique du champ passenger_rating dans bookings
-- ================================================
DELIMITER //
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
END//
DELIMITER ;

COMMIT;
