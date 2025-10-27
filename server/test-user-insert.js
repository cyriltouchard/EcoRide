// Test d'insertion utilisateur
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testInsert() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('📊 Configuration MySQL:');
        console.log('   Host:', process.env.DB_HOST);
        console.log('   User:', process.env.DB_USER);
        console.log('   Database:', process.env.DB_NAME);
        console.log('   Port:', process.env.DB_PORT);
        console.log('');

        const connection = await pool.getConnection();
        console.log('✅ Connexion établie');

        // Test de transaction
        await connection.beginTransaction();
        console.log('✅ Transaction démarrée');

        // Test INSERT utilisateur
        const [userResult] = await connection.execute(
            'INSERT INTO users (pseudo, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
            ['testuser2', 'test2@ecoride.fr', 'hashtest123', 'passager']
        );
        console.log('✅ Utilisateur inséré, ID:', userResult.insertId);

        // Test INSERT crédits
        const [creditResult] = await connection.execute(
            'INSERT INTO user_credits (user_id, current_credits, total_earned, total_spent) VALUES (?, 20, 0, 0)',
            [userResult.insertId]
        );
        console.log('✅ Crédits insérés, ID:', creditResult.insertId);

        await connection.commit();
        console.log('✅ Transaction validée');

        // Vérification
        const [rows] = await connection.execute(
            'SELECT u.*, uc.current_credits FROM users u LEFT JOIN user_credits uc ON u.id = uc.user_id WHERE u.id = ?',
            [userResult.insertId]
        );
        console.log('');
        console.log('📋 Utilisateur créé:');
        console.log(rows[0]);

        connection.release();
        await pool.end();

    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        console.error('Stack:', error.stack);
    }
}

testInsert();
