// ================================================
// SCRIPT DE MIGRATION - SYSTÈME D'AVIS
// Exécute le script SQL de création des tables d'avis
// ================================================

const fs = require('fs');
const path = require('path');
const { pool } = require('./config/db-mysql');

/**
 * Parse le fichier SQL en statements individuels
 * Gère les triggers et vues multi-lignes
 * @param {string} sql - Contenu du fichier SQL
 * @returns {string[]} Liste des statements SQL
 */
function parseSQLStatements(sql) {
    // Enlever les commentaires
    sql = sql.replaceAll(/--[^\n]*/g, '');
    
    const statements = [];
    let current = '';
    let inTrigger = false;
    
    const lines = sql.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.includes('CREATE TRIGGER') || trimmed.includes('CREATE OR REPLACE VIEW')) {
            inTrigger = true;
        }
        
        current += line + '\n';
        
        if (trimmed.endsWith(';')) {
            if (!inTrigger || trimmed.includes('END;')) {
                statements.push(current.trim());
                current = '';
                inTrigger = false;
            }
        }
    }
    
    // Filtrer les statements vides et DELIMITER
    return statements.filter(s => {
        const clean = s.replaceAll(/\s/g, '');
        return clean.length > 0 && 
               !s.includes('DELIMITER') && 
               clean !== 'COMMIT;' &&
               clean !== 'USEecoride_sql;';
    });
}

/**
 * Normalise un statement SQL (enlève les DELIMITER pour triggers)
 * @param {string} statement - Statement SQL
 * @returns {string} Statement normalisé
 */
function normalizeStatement(statement) {
    if (!statement.includes('CREATE TRIGGER')) {
        return statement;
    }
    
    return statement
        .replaceAll('//', '')
        .replaceAll('DELIMITER', '')
        .replaceAll('END$$', 'END');
}

/**
 * Exécute un statement SQL avec gestion d'erreurs
 * @param {string} statement - Statement SQL
 * @param {number} index - Index du statement
 * @param {number} total - Nombre total de statements
 */
async function executeStatement(statement, index, total) {
    const normalized = normalizeStatement(statement);
    
    try {
        await pool.query(normalized);
        const preview = normalized.substring(0, 60).replaceAll(/\s+/g, ' ');
        console.log(`✅ ${index + 1}/${total}: ${preview}...`);
    } catch (err) {
        // Ignorer les erreurs "already exists"
        if (err.code === 'ER_TABLE_EXISTS_ERR' || err.message?.includes('already exists')) {
            console.log(`⚠️  ${index + 1}/${total}: Déjà existant`);
        } else {
            console.error(`❌ Erreur ${index + 1}:`, err.message);
            throw err;
        }
    }
}

/**
 * Affiche le résumé de la migration
 */
function displayMigrationSummary() {
    console.log('\n✅ Migration terminée avec succès!');
    console.log('\n📊 Tables créées:');
    console.log('   - driver_reviews (avis sur les chauffeurs)');
    console.log('   - site_reviews (avis sur le site)');
    console.log('   - review_responses (réponses aux avis)');
    console.log('\n📈 Vues créées:');
    console.log('   - v_driver_ratings_summary');
    console.log('   - v_site_ratings_summary');
    console.log('   - v_driver_reviews_detailed');
    console.log('\n🔧 Trigger créé:');
    console.log('   - tr_update_booking_rating');
}

async function runMigration() {
    try {
        console.log('🚀 Démarrage de la migration du système d\'avis...');
        
        // Lire et parser le fichier SQL
        const sqlFile = path.join(__dirname, 'database', 'create_reviews_system.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        const statements = parseSQLStatements(sql);
        
        console.log(`📄 ${statements.length} requêtes SQL à exécuter\n`);
        
        // Exécuter chaque statement
        for (let i = 0; i < statements.length; i++) {
            await executeStatement(statements[i], i, statements.length);
        }
        
        displayMigrationSummary();
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Erreur migration:', error.message);
        process.exit(1);
    }
}

// Exécuter la migration
runMigration();
