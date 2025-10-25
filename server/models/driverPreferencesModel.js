// server/models/driverPreferencesModel.js
// Modèle Préférences Chauffeur pour ECF US8

const { pool } = require('../config/db-mysql');

class DriverPreferences {
    
    // Créer ou mettre à jour les préférences d'un chauffeur
    static async upsert(userId, preferences) {
        const {
            smoking_allowed = false,
            pets_allowed = false,
            music_preference = '',
            conversation_level = 'sociable',
            custom_preferences = ''
        } = preferences;
        
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Vérifier que l'utilisateur est chauffeur
            const [userCheck] = await connection.execute(
                'SELECT user_type FROM users WHERE id = ?',
                [userId]
            );
            
            if (!userCheck[0] || !['chauffeur', 'chauffeur_passager'].includes(userCheck[0].user_type)) {
                throw new Error('Seuls les chauffeurs peuvent définir des préférences');
            }
            
            // Utiliser INSERT ... ON DUPLICATE KEY UPDATE
            const [result] = await connection.execute(
                `INSERT INTO driver_preferences 
                 (user_id, smoking_allowed, pets_allowed, music_preference, conversation_level, custom_preferences)
                 VALUES (?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 smoking_allowed = VALUES(smoking_allowed),
                 pets_allowed = VALUES(pets_allowed),
                 music_preference = VALUES(music_preference),
                 conversation_level = VALUES(conversation_level),
                 custom_preferences = VALUES(custom_preferences)`,
                [userId, smoking_allowed, pets_allowed, music_preference, conversation_level, custom_preferences]
            );
            
            await connection.commit();
            
            return await this.getByUserId(userId);
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Obtenir les préférences d'un chauffeur
    static async getByUserId(userId) {
        const [rows] = await pool.execute(
            `SELECT dp.*, u.pseudo
             FROM driver_preferences dp
             JOIN users u ON dp.user_id = u.id
             WHERE dp.user_id = ?`,
            [userId]
        );
        
        return rows[0] || null;
    }
    
    // Obtenir les préférences avec profil chauffeur complet
    static async getDriverProfile(userId) {
        const [rows] = await pool.execute(
            `SELECT 
                u.id, u.pseudo, u.user_type, u.created_at,
                dp.smoking_allowed, dp.pets_allowed, dp.music_preference, 
                dp.conversation_level, dp.custom_preferences,
                COUNT(DISTINCT v.id) as vehicles_count,
                COUNT(DISTINCT r.id) as rides_created,
                AVG(CASE WHEN r.status = 'termine' THEN 5 ELSE NULL END) as avg_rating
             FROM users u
             LEFT JOIN driver_preferences dp ON u.id = dp.user_id
             LEFT JOIN vehicles v ON u.id = v.user_id AND v.is_active = TRUE
             LEFT JOIN rides r ON u.id = r.driver_id
             WHERE u.id = ? AND u.user_type IN ('chauffeur', 'chauffeur_passager')
             GROUP BY u.id`,
            [userId]
        );
        
        return rows[0] || null;
    }
    
    // Valider les préférences
    static validatePreferences(data) {
        const errors = [];
        
        const validConversationLevels = ['silencieux', 'peu_bavard', 'sociable'];
        if (data.conversation_level && !validConversationLevels.includes(data.conversation_level)) {
            errors.push('Niveau de conversation invalide');
        }
        
        if (data.music_preference && data.music_preference.length > 100) {
            errors.push('Préférence musicale trop longue (max 100 caractères)');
        }
        
        if (data.custom_preferences && data.custom_preferences.length > 500) {
            errors.push('Préférences personnalisées trop longues (max 500 caractères)');
        }
        
        return errors;
    }
}

module.exports = DriverPreferences;