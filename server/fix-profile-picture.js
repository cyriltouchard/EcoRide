// Script pour corriger la taille de la colonne profile_picture
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixProfilePictureColumn() {
    let connection;
    
    try {
        console.log('🔧 Connexion à MySQL...');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ecoride',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });
        
        console.log('✅ Connecté à MySQL');
        
        // Lire le fichier SQL
        const sqlPath = path.join(__dirname, 'database', 'fix_profile_picture.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📝 Exécution de la migration...');
        
        // Exécuter le script SQL
        const [results] = await connection.query(sql);
        
        console.log('✅ Migration réussie !');
        console.log('📊 Résultat:', results);
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Connexion MySQL fermée');
        }
    }
}

// Exécuter la migration
fixProfilePictureColumn();
