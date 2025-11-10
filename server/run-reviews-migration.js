// ================================================
// SCRIPT DE MIGRATION - SYSTÈME D'AVIS
// Exécute le script SQL de création des tables d'avis
// ================================================

const fs = require('fs');
const path = require('path');
const { pool } = require('./config/db-mysql');

async function runMigration() {
    try {
        console.log('🚀 Démarrage de la migration du système d\'avis...');
        
        // Lire le fichier SQL
        const sqlFile = path.join(__dirname, 'database', 'create_reviews_system.sql');
        let sql = fs.readFileSync(sqlFile, 'utf8');
        
        // Enlever les commentaires de bloc
        sql = sql.replace(/--[^\n]*/g, '');
        
        // Séparer par les points-virgules (hors des triggers)
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
        const cleanStatements = statements.filter(s => {
            const clean = s.replace(/\s/g, '');
            return clean.length > 0 && 
                   !s.includes('DELIMITER') && 
                   clean !== 'COMMIT;' &&
                   clean !== 'USEecoride_sql;';
        });
        
        console.log(`📄 ${cleanStatements.length} requêtes SQL à exécuter\n`);
        
        // Exécuter chaque statement
        for (let i = 0; i < cleanStatements.length; i++) {
            let statement = cleanStatements[i];
            
            // Remplacer les triggers avec DELIMITER par version compatible
            if (statement.includes('CREATE TRIGGER')) {
                statement = statement.replace(/\/\//g, '');
                statement = statement.replace(/DELIMITER/g, '');
                statement = statement.replace(/END\$\$/g, 'END');
            }
            
            try {
                await pool.query(statement);
                const preview = statement.substring(0, 60).replace(/\s+/g, ' ');
                console.log(`✅ ${i + 1}/${cleanStatements.length}: ${preview}...`);
            } catch (err) {
                // Ignorer les erreurs "already exists"
                if (err.code === 'ER_TABLE_EXISTS_ERR' || 
                    err.message?.includes('already exists')) {
                    console.log(`⚠️  ${i + 1}/${cleanStatements.length}: Déjà existant`);
                } else {
                    console.error(`❌ Erreur ${i + 1}:`, err.message);
                    throw err;
                }
            }
        }
        
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
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Erreur migration:', error.message);
        process.exit(1);
    }
}

// Exécuter la migration
runMigration();
