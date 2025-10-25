// Script d'initialisation simple pour MySQL
require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    try {
        console.log('🔄 Initialisation de la base MySQL...');
        
        // Connexion sans spécifier de base
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });
        
        console.log('✅ Connexion MySQL établie');
        
        // Créer la base si elle n'existe pas
        await connection.query('CREATE DATABASE IF NOT EXISTS ecoride_sql CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        console.log('✅ Base de données ecoride_sql prête');
        
        // Utiliser la base
        await connection.query('USE ecoride_sql');
        
        // Créer la table users
        await connection.query(`
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
            )
        `);
        console.log('✅ Table users créée');
        
        // Créer la table user_credits
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_credits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                current_credits INT DEFAULT 20,
                total_earned INT DEFAULT 0,
                total_spent INT DEFAULT 0,
                last_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_credits (user_id)
            )
        `);
        console.log('✅ Table user_credits créée');
        
        // Créer la table vehicles
        await connection.query(`
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
            )
        `);
        console.log('✅ Table vehicles créée');
        
        // Créer la table driver_preferences
        await connection.query(`
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
            )
        `);
        console.log('✅ Table driver_preferences créée');
        
        // Créer la table rides (pour US9)
        await connection.query(`
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
                INDEX idx_departure_city (departure_city),
                INDEX idx_arrival_city (arrival_city),
                INDEX idx_departure_date (departure_datetime),
                INDEX idx_price (price_per_seat),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ Table rides créée');
        
        // Créer la table credit_transactions
        await connection.query(`
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
                INDEX idx_user_transactions (user_id),
                INDEX idx_transaction_date (created_at),
                INDEX idx_transaction_type (transaction_type)
            )
        `);
        console.log('✅ Table credit_transactions créée');
        
        // Créer le trigger pour les crédits automatiques
        await connection.query(`
            CREATE TRIGGER IF NOT EXISTS tr_create_user_credits 
            AFTER INSERT ON users 
            FOR EACH ROW 
            INSERT INTO user_credits (user_id, current_credits) VALUES (NEW.id, 20)
        `);
        console.log('✅ Trigger crédits automatiques créé');
        
        // Créer un utilisateur admin par défaut
        const [existing] = await connection.query('SELECT id FROM users WHERE email = "admin@ecoride.fr"');
        if (existing.length === 0) {
            await connection.query(`
                INSERT INTO users (pseudo, email, password_hash, user_type) VALUES 
                ('admin', 'admin@ecoride.fr', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
            `);
            console.log('✅ Utilisateur admin créé (admin@ecoride.fr / password)');
        } else {
            console.log('ℹ️ Utilisateur admin existe déjà');
        }
        
        // Créer la vue v_user_profile pour les profils utilisateur
        await connection.query(`
            CREATE OR REPLACE VIEW v_user_profile AS
            SELECT 
                u.id,
                u.pseudo,
                u.email,
                u.user_type,
                u.created_at,
                u.updated_at,
                u.is_active,
                COALESCE(uc.current_credits, 0) as current_credits,
                COALESCE(uc.total_earned, 0) as total_earned,
                COALESCE(uc.total_spent, 0) as total_spent
            FROM users u
            LEFT JOIN user_credits uc ON u.id = uc.user_id
        `);
        console.log('✅ Vue v_user_profile créée');
        
        await connection.end();
        
        console.log('\n🎉 INITIALISATION RÉUSSIE !');
        console.log('🔧 Vous pouvez maintenant démarrer le serveur avec: npm start');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solutions possibles:');
            console.log('   - Démarrer XAMPP et activer MySQL');
            console.log('   - Vérifier que MySQL est installé');
            console.log('   - Vérifier les paramètres dans .env');
        }
    }
}

initializeDatabase();