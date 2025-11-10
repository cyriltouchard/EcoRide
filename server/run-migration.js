// Script de migration pour ajouter les colonnes de profil
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecoride_sql',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

async function runMigration() {
    let connection;
    
    try {
        console.log('🔄 Connexion à MySQL...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connecté à MySQL');

        console.log('\n📝 Lecture du fichier de migration...');
        const sqlFile = await fs.readFile(
            path.join(__dirname, 'database', 'add_profile_columns.sql'),
            'utf8'
        );

        console.log('🚀 Exécution de la migration...');
        const [results] = await connection.query(sqlFile);
        
        console.log('✅ Migration terminée avec succès !');
        console.log('\n📊 Vérification de la structure de la table users :');
        
        const [columns] = await connection.query('DESCRIBE users');
        console.table(columns);

    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Connexion fermée');
        }
    }
}

runMigration();
