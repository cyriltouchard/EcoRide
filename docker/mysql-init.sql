-- Script d'initialisation MySQL pour EcoRide
-- Système de crédits et transactions

USE ecoride;

-- Table des transactions de crédits
CREATE TABLE IF NOT EXISTS credits_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('earning', 'spending', 'refund', 'bonus') NOT NULL,
    description TEXT,
    reference_id VARCHAR(255), -- ID de trajet ou autre référence
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des réservations de trajets
CREATE TABLE IF NOT EXISTS ride_reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id VARCHAR(255) NOT NULL,
    passenger_id VARCHAR(255) NOT NULL,
    seats_reserved INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_reservation (ride_id, passenger_id),
    INDEX idx_ride_id (ride_id),
    INDEX idx_passenger_id (passenger_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des évaluations et avis
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id VARCHAR(255) NOT NULL,
    reviewer_id VARCHAR(255) NOT NULL,
    reviewed_id VARCHAR(255) NOT NULL,
    reviewer_type ENUM('driver', 'passenger') NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_ride_id (ride_id),
    INDEX idx_reviewer_id (reviewer_id),
    INDEX idx_reviewed_id (reviewed_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des statistiques utilisateurs
CREATE TABLE IF NOT EXISTS user_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    total_rides_as_driver INT DEFAULT 0,
    total_rides_as_passenger INT DEFAULT 0,
    total_km_driven DECIMAL(10,2) DEFAULT 0.00,
    total_km_as_passenger DECIMAL(10,2) DEFAULT 0.00,
    total_credits_earned DECIMAL(10,2) DEFAULT 0.00,
    total_credits_spent DECIMAL(10,2) DEFAULT 0.00,
    average_rating_as_driver DECIMAL(3,2) DEFAULT 0.00,
    average_rating_as_passenger DECIMAL(3,2) DEFAULT 0.00,
    co2_saved_kg DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_total_rides (total_rides_as_driver),
    INDEX idx_credits_earned (total_credits_earned)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données de test
INSERT INTO credits_transactions (user_id, amount, type, description) VALUES
('admin@ecoride.fr', 100.00, 'bonus', 'Crédits de démarrage administrateur'),
('test@ecoride.fr', 20.00, 'bonus', 'Crédits de bienvenue nouvel utilisateur');

INSERT INTO user_statistics (user_id, total_credits_earned) VALUES
('admin@ecoride.fr', 100.00),
('test@ecoride.fr', 20.00);

-- Procédure stockée pour calculer le solde de crédits
DELIMITER $$

CREATE PROCEDURE GetUserCreditBalance(IN p_user_id VARCHAR(255))
BEGIN
    SELECT 
        p_user_id as user_id,
        COALESCE(SUM(CASE WHEN type IN ('earning', 'bonus') THEN amount ELSE -amount END), 0) as balance
    FROM credits_transactions 
    WHERE user_id = p_user_id AND status = 'completed';
END$$

DELIMITER ;

-- Vue pour les statistiques globales
CREATE VIEW global_statistics AS
SELECT 
    COUNT(DISTINCT user_id) as total_users,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN type IN ('earning', 'bonus') THEN amount ELSE 0 END) as total_credits_distributed,
    SUM(CASE WHEN type = 'spending' THEN amount ELSE 0 END) as total_credits_spent,
    AVG(amount) as average_transaction_amount
FROM credits_transactions 
WHERE status = 'completed';

-- Commentaires pour documentation
ALTER TABLE credits_transactions COMMENT = 'Table des transactions de crédits EcoRide';
ALTER TABLE ride_reservations COMMENT = 'Table des réservations de trajets';
ALTER TABLE reviews COMMENT = 'Table des évaluations et avis utilisateurs';
ALTER TABLE user_statistics COMMENT = 'Table des statistiques utilisateurs';

-- Affichage des résultats d'initialisation
SELECT '✅ Base de données MySQL EcoRide initialisée avec succès !' as message;
SELECT 'Tables créées : credits_transactions, ride_reservations, reviews, user_statistics' as info;
SELECT CONCAT('Crédits initiaux : ', SUM(amount), ' crédits') as credits_info 
FROM credits_transactions WHERE type = 'bonus';