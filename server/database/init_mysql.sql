-- ================================================
-- SCHEMA SQL ECORIDE - Titre Professionnel DWWM
-- Base de données relationnelle obligatoire ECF
-- ================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS ecoride_sql CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecoride_sql;

-- ================================================
-- TABLE USERS (Relationnelle - données de base)
-- ================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('passager', 'chauffeur', 'chauffeur_passager', 'employe', 'admin') DEFAULT 'passager',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Index pour optimiser les recherches
    INDEX idx_email (email),
    INDEX idx_pseudo (pseudo),
    INDEX idx_user_type (user_type)
);

-- ================================================
-- TABLE CREDITS (Système de crédits ECF)
-- ================================================
CREATE TABLE user_credits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_credits INT DEFAULT 20, -- 20 crédits à la création selon ECF
    total_earned INT DEFAULT 0,
    total_spent INT DEFAULT 0,
    last_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_credits (user_id)
);

-- ================================================
-- TABLE VEHICLES (Véhicules des chauffeurs)
-- ================================================
CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    color VARCHAR(30),
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    first_registration DATE,
    energy_type ENUM('essence', 'diesel', 'electrique', 'hybride') NOT NULL,
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
CREATE TABLE driver_preferences (
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
CREATE TABLE rides (
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
    platform_commission DECIMAL(6,2) DEFAULT 2.00, -- 2 crédits pour la plateforme
    available_seats INT NOT NULL,
    total_seats INT NOT NULL,
    status ENUM('en_attente', 'confirme', 'en_cours', 'termine', 'annule') DEFAULT 'en_attente',
    is_ecological BOOLEAN GENERATED ALWAYS AS (
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM vehicles v 
                WHERE v.id = vehicle_id AND v.energy_type = 'electrique'
            ) THEN TRUE 
            ELSE FALSE 
        END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    
    -- Index pour les recherches de covoiturages
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
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL,
    passenger_id INT NOT NULL,
    seats_booked INT DEFAULT 1,
    total_cost DECIMAL(6,2) NOT NULL,
    booking_status ENUM('confirme', 'annule', 'termine') DEFAULT 'confirme',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_by_passenger BOOLEAN DEFAULT FALSE,
    passenger_rating INT CHECK (passenger_rating BETWEEN 1 AND 5),
    passenger_comment TEXT,
    
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Éviter les doublons de réservation
    UNIQUE KEY unique_passenger_ride (ride_id, passenger_id),
    INDEX idx_passenger_bookings (passenger_id),
    INDEX idx_ride_bookings (ride_id)
);

-- ================================================
-- TABLE CREDIT_TRANSACTIONS (Historique crédits)
-- ================================================
CREATE TABLE credit_transactions (
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


-- NOTE: Removed hard-coded password hashes and test accounts from the script for security reasons.
-- If you require initial accounts for local development, create them securely outside of version control.
-- Recommended approaches:
-- 1) Create accounts manually on your local DB using a secure password and do NOT commit those statements.
-- 2) Use a secure seeding script (outside the repo or ignored) that reads passwords from environment variables or a secret manager.
-- Example (DO NOT commit real passwords):
-- SET @admin_password_hash = 'REPLACE_WITH_BCRYPT_HASH_GENERATED_LOCALLY';
-- INSERT INTO users (pseudo, email, password_hash, user_type) VALUES ('admin', 'admin@ecoride.fr', @admin_password_hash, 'admin');
-- INSERT INTO user_credits (user_id, current_credits) VALUES ((SELECT id FROM users WHERE pseudo = 'admin'), 100);

-- For CI: generate accounts dynamically during test runs and read credentials from the CI secret store.

-- ================================================
-- TRIGGERS pour maintenir la cohérence
-- ================================================

-- Trigger : Attribution automatique de crédits à la création d'utilisateur
DELIMITER //
CREATE TRIGGER tr_create_user_credits 
    AFTER INSERT ON users 
    FOR EACH ROW 
BEGIN
    INSERT INTO user_credits (user_id, current_credits) 
    VALUES (NEW.id, 20);
END//
DELIMITER ;

-- Trigger : Mise à jour des crédits lors d'une transaction
DELIMITER //
CREATE TRIGGER tr_update_credits
    AFTER INSERT ON credit_transactions
    FOR EACH ROW
BEGIN
    UPDATE user_credits 
    SET 
        current_credits = CASE 
            WHEN NEW.transaction_type IN ('gain', 'remboursement') THEN current_credits + NEW.amount
            WHEN NEW.transaction_type IN ('depense', 'commission') THEN current_credits - NEW.amount
            ELSE current_credits
        END,
        total_earned = CASE 
            WHEN NEW.transaction_type IN ('gain', 'remboursement') THEN total_earned + NEW.amount
            ELSE total_earned
        END,
        total_spent = CASE 
            WHEN NEW.transaction_type IN ('depense', 'commission') THEN total_spent + NEW.amount
            ELSE total_spent
        END,
        last_transaction = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;
END//
DELIMITER ;

-- ================================================
-- VUES utiles pour l'application
-- ================================================

-- Vue des covoiturages avec détails complets
CREATE VIEW v_rides_complete AS
SELECT 
    r.id as ride_id,
    r.departure_city,
    r.arrival_city,
    r.departure_datetime,
    r.estimated_arrival,
    r.price_per_seat,
    r.available_seats,
    r.total_seats,
    r.is_ecological,
    r.status,
    
    u.pseudo as driver_pseudo,
    u.id as driver_id,
    
    v.brand,
    v.model,
    v.color,
    v.energy_type,
    
    uc.current_credits as driver_credits,
    
    -- Calcul de la note moyenne du chauffeur (depuis MongoDB)
    0 as driver_rating -- À calculer depuis MongoDB
    
FROM rides r
JOIN users u ON r.driver_id = u.id
JOIN vehicles v ON r.vehicle_id = v.id
JOIN user_credits uc ON u.id = uc.user_id
WHERE r.status IN ('en_attente', 'confirme') 
AND r.available_seats > 0;

-- Vue du profil complet utilisateur
CREATE VIEW v_user_profile AS
SELECT 
    u.id,
    u.pseudo,
    u.email,
    u.user_type,
    u.created_at,
    uc.current_credits,
    uc.total_earned,
    uc.total_spent,
    
    COUNT(DISTINCT v.id) as vehicles_count,
    COUNT(DISTINCT r.id) as rides_created,
    COUNT(DISTINCT b.id) as rides_booked
    
FROM users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
LEFT JOIN vehicles v ON u.id = v.user_id AND v.is_active = TRUE
LEFT JOIN rides r ON u.id = r.driver_id
LEFT JOIN bookings b ON u.id = b.passenger_id
GROUP BY u.id;

COMMIT;