-- Script d'initialisation MySQL pour EcoRide
-- Base de données complète pour le système de covoiturage

USE ecoride;

-- ================================================
-- TABLE USERS (Relationnelle - données de base)
-- ================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('passager', 'chauffeur', 'chauffeur_passager', 'employe', 'admin') DEFAULT 'passager',
    profile_picture TEXT NULL,
    bio TEXT NULL,
    phone VARCHAR(20) NULL,
    address VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_email (email),
    INDEX idx_pseudo (pseudo),
    INDEX idx_user_type (user_type)
);

-- ================================================
-- TABLE CREDITS (Système de crédits ECF)
-- ================================================
CREATE TABLE IF NOT EXISTS user_credits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_credits INT DEFAULT 20,
    total_earned INT DEFAULT 0,
    total_spent INT DEFAULT 0,
    last_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_credits (user_id)
);

-- ================================================
-- TABLE VEHICLES (Véhicules des chauffeurs)
-- ================================================
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    color VARCHAR(30),
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    first_registration DATE,
    energy_type ENUM('essence', 'diesel', 'electrique', 'hybride', 'gpl') NOT NULL,
    available_seats INT DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_vehicles (user_id),
    INDEX idx_energy_type (energy_type),
    INDEX idx_license_plate (license_plate)
);

-- ================================================
-- TABLE DRIVER_PREFERENCES (Préférences chauffeurs)
-- ================================================
CREATE TABLE IF NOT EXISTS driver_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    pets_allowed BOOLEAN DEFAULT FALSE,
    music_preference VARCHAR(100),
    conversation_level ENUM('silencieux', 'peu_bavard', 'sociable') DEFAULT 'sociable',
    custom_preferences TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preference (user_id)
);

-- ================================================
-- TABLE RIDES (Trajets/Covoiturages)
-- ================================================
CREATE TABLE IF NOT EXISTS rides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    departure_city VARCHAR(100) NOT NULL,
    arrival_city VARCHAR(100) NOT NULL,
    departure_address TEXT,
    arrival_address TEXT,
    departure_datetime DATETIME NOT NULL,
    estimated_arrival DATETIME,
    price_per_seat DECIMAL(6,2) NOT NULL,
    platform_commission DECIMAL(6,2) DEFAULT 2.00,
    available_seats INT NOT NULL,
    total_seats INT NOT NULL,
    description TEXT,
    -- NOSONAR: 'confirme' est un statut métier standardisé utilisé dans rides et bookings
    status ENUM('en_attente', 'confirme', 'en_cours', 'termine', 'annule') DEFAULT 'en_attente',
    is_ecological BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    
    INDEX idx_departure_city (departure_city),
    INDEX idx_arrival_city (arrival_city),
    INDEX idx_departure_date (departure_datetime),
    INDEX idx_price (price_per_seat),
    INDEX idx_status (status),
    INDEX idx_ecological (is_ecological)
);

-- ================================================
-- TABLE BOOKINGS (Réservations passagers)
-- ================================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    passenger_id INT NOT NULL,
    seats_booked INT DEFAULT 1,
    total_cost DECIMAL(6,2) NOT NULL,
    -- NOSONAR: Statut 'confirme' est cohérent avec le statut des rides
    booking_status ENUM('confirme', 'annule', 'termine') DEFAULT 'confirme',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_by_passenger BOOLEAN DEFAULT FALSE,
    passenger_rating INT CHECK (passenger_rating BETWEEN 1 AND 5),
    passenger_comment TEXT,
    
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_passenger_ride (ride_id, passenger_id),
    INDEX idx_passenger_bookings (passenger_id),
    INDEX idx_ride_bookings (ride_id)
);

-- ================================================
-- TABLE CREDIT_TRANSACTIONS (Historique crédits)
-- ================================================
CREATE TABLE IF NOT EXISTS credit_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_type ENUM('gain', 'depense', 'remboursement', 'commission') NOT NULL,
    amount INT NOT NULL,
    description VARCHAR(255),
    related_booking_id INT,
    related_ride_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    FOREIGN KEY (related_ride_id) REFERENCES rides(id) ON DELETE SET NULL,
    
    INDEX idx_user_transactions (user_id),
    INDEX idx_transaction_date (created_at),
    INDEX idx_transaction_type (transaction_type)
);

-- =====================================================
-- CONSTANTES GLOBALES (conservées pour compatibilité)
-- =====================================================
SET @TYPE_EARNING = 'earning';
SET @TYPE_SPENDING = 'spending';
SET @TYPE_BONUS = 'bonus';
SET @STATUS_COMPLETED = 'completed';
SET @VARCHAR_255 = 255;

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
('admin@ecoride.fr', 100.00, @TYPE_BONUS, 'Crédits de démarrage administrateur'),
('test@ecoride.fr', 20.00, @TYPE_BONUS, 'Crédits de bienvenue nouvel utilisateur');

INSERT INTO user_statistics (user_id, total_credits_earned) VALUES
('admin@ecoride.fr', 100.00),
('test@ecoride.fr', 20.00);

-- Procédure stockée pour calculer le solde de crédits
DELIMITER $$

CREATE PROCEDURE GetUserCreditBalance(IN p_user_id VARCHAR(255))
BEGIN
    DECLARE co_status_completed VARCHAR(10) DEFAULT 'completed';
    DECLARE co_type_earning VARCHAR(10) DEFAULT 'earning';
    DECLARE co_type_bonus VARCHAR(10) DEFAULT 'bonus';
    
    SELECT 
        p_user_id as user_id,
        COALESCE(SUM(CASE WHEN type IN (co_type_earning, co_type_bonus) THEN amount ELSE -amount END), 0) as balance
    FROM credits_transactions 
    WHERE user_id = p_user_id AND status = co_status_completed;
END$$

DELIMITER ;

-- Vue pour les statistiques globales
CREATE VIEW global_statistics AS
SELECT 
    COUNT(DISTINCT user_id) as total_users,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN type IN (@TYPE_EARNING, @TYPE_BONUS) THEN amount ELSE 0 END) as total_credits_distributed,
    SUM(CASE WHEN type = @TYPE_SPENDING THEN amount ELSE 0 END) as total_credits_spent,
    AVG(amount) as average_transaction_amount
FROM credits_transactions 
WHERE status = @STATUS_COMPLETED;

-- Commentaires pour documentation
ALTER TABLE credits_transactions COMMENT = 'Table des transactions de crédits EcoRide';
ALTER TABLE ride_reservations COMMENT = 'Table des réservations de trajets';
ALTER TABLE reviews COMMENT = 'Table des évaluations et avis utilisateurs';
ALTER TABLE user_statistics COMMENT = 'Table des statistiques utilisateurs';

-- Affichage des résultats d'initialisation
SELECT '✅ Base de données MySQL EcoRide initialisée avec succès !' as message;
SELECT 'Tables créées : credits_transactions, ride_reservations, reviews, user_statistics' as info;
SELECT CONCAT('Crédits initiaux : ', SUM(amount), ' crédits') as credits_info 
FROM credits_transactions WHERE type = @TYPE_BONUS;