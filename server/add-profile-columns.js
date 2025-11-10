// Script simple pour ajouter les colonnes de profil
require('dotenv').config();
const pool = require('./config/db-mysql').pool;

async function addProfileColumns() {
    try {
        console.log('🔄 Ajout des colonnes de profil...\n');

        // Vérifier si les colonnes existent déjà
        const [columns] = await pool.query('DESCRIBE users');
        const columnNames = columns.map(col => col.Field);
        
        console.log('📋 Colonnes actuelles:', columnNames.join(', '));

        // Ajouter phone si elle n'existe pas
        if (!columnNames.includes('phone')) {
            await pool.query(
                'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email'
            );
            console.log('✅ Colonne "phone" ajoutée');
        } else {
            console.log('ℹ️  Colonne "phone" existe déjà');
        }

        // Ajouter bio si elle n'existe pas
        if (!columnNames.includes('bio')) {
            await pool.query(
                'ALTER TABLE users ADD COLUMN bio TEXT NULL AFTER user_type'
            );
            console.log('✅ Colonne "bio" ajoutée');
        } else {
            console.log('ℹ️  Colonne "bio" existe déjà');
        }

        // Ajouter profile_picture si elle n'existe pas
        if (!columnNames.includes('profile_picture')) {
            await pool.query(
                'ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500) NULL AFTER bio'
            );
            console.log('✅ Colonne "profile_picture" ajoutée');
        } else {
            console.log('ℹ️  Colonne "profile_picture" existe déjà');
        }

        // Afficher la nouvelle structure
        console.log('\n📊 Nouvelle structure de la table users:');
        const [newColumns] = await pool.query('DESCRIBE users');
        console.table(newColumns);

        console.log('\n✅ Migration terminée avec succès !');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

addProfileColumns();
