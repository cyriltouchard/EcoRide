// server/config/db-mysql.js
require('dotenv').config();
const mysql = require('mysql2');

// Crée un "pool" de connexions. C'est plus efficace qu'une seule connexion
// pour gérer plusieurs requêtes simultanées depuis une application web.
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecoride_sql',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion au démarrage
const testConnection = async () => {
    try {
        const connection = await pool.promise().getConnection();
        console.log('✅ Connexion MySQL réussie ! Base:', process.env.DB_NAME || 'ecoride_sql');
        connection.release();
        return true;
    } catch (error) {
        console.warn('⚠️ MySQL non disponible:', error.message);
        console.log('💡 Assurez-vous que MySQL/XAMPP est démarré');
        return false;
    }
};

// Exporte une version "promise-based" du pool pour utiliser async/await
module.exports = {
    pool: pool.promise(),
    testConnection
};