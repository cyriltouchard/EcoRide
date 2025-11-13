-- ================================================
-- SCHEMA SQL ECORIDE - Version Docker (sans triggers)
-- ================================================

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

-- ================================================
-- Compte Admin pour tests
-- ================================================
-- Mot de passe : Admin123! (hash bcrypt)
INSERT IGNORE INTO users (pseudo, email, password_hash, user_type) VALUES 
('admin', 'admin@ecoride.fr', '$2b$10$rZ5qVGxJ9vF7KQYqJ5Hqp.YxKjH3M9LN4rZ8F9VGxJ9vF7KQYqJ5Hq', 'admin');

-- Crédits pour l'admin
INSERT IGNORE INTO user_credits (user_id, current_credits) 
SELECT id, 100 FROM users WHERE email = 'admin@ecoride.fr';
