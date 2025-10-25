// server/models/userSQLModel.js
// Modèle utilisateur pour la base MySQL (données relationnelles)

const { pool } = require('../config/db-mysql');

class UserSQL {
    // Créer un utilisateur en MySQL avec crédits initiaux
    static async create(userData) {
        const { pseudo, email, password_hash, user_type = 'passager' } = userData;
        
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Insérer l'utilisateur
            const [userResult] = await connection.execute(
                'INSERT INTO users (pseudo, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
                [pseudo, email, password_hash, user_type]
            );
            
            const userId = userResult.insertId;
            
            // Le trigger se charge automatiquement des crédits, mais on peut aussi le faire manuellement
            // await connection.execute(
            //     'INSERT INTO user_credits (user_id, current_credits) VALUES (?, 20)',
            //     [userId]
            // );
            
            await connection.commit();
            
            return { id: userId, pseudo, email, user_type };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Trouver un utilisateur par email
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            `SELECT u.*, uc.current_credits, uc.total_earned, uc.total_spent 
             FROM users u 
             LEFT JOIN user_credits uc ON u.id = uc.user_id 
             WHERE u.email = ? AND u.is_active = TRUE`,
            [email]
        );
        
        return rows[0] || null;
    }
    
    // Trouver un utilisateur par ID
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT u.*, uc.current_credits, uc.total_earned, uc.total_spent 
             FROM users u 
             LEFT JOIN user_credits uc ON u.id = uc.user_id 
             WHERE u.id = ? AND u.is_active = TRUE`,
            [id]
        );
        
        return rows[0] || null;
    }
    
    // Trouver un utilisateur par pseudo
    static async findByPseudo(pseudo) {
        const [rows] = await pool.execute(
            `SELECT u.*, uc.current_credits 
             FROM users u 
             LEFT JOIN user_credits uc ON u.id = uc.user_id 
             WHERE u.pseudo = ? AND u.is_active = TRUE`,
            [pseudo]
        );
        
        return rows[0] || null;
    }
    
    // Mettre à jour le type d'utilisateur
    static async updateUserType(userId, userType) {
        const [result] = await pool.execute(
            'UPDATE users SET user_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [userType, userId]
        );
        
        return result.affectedRows > 0;
    }
    
    // Obtenir le profil complet d'un utilisateur
    static async getProfile(userId) {
        const [rows] = await pool.execute(
            'SELECT * FROM v_user_profile WHERE id = ?',
            [userId]
        );
        
        return rows[0] || null;
    }
    
    // Suspendre/désactiver un compte
    static async suspend(userId, isActive = false) {
        const [result] = await pool.execute(
            'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [isActive, userId]
        );
        
        return result.affectedRows > 0;
    }
    
    // Lister tous les utilisateurs (pour admin)
    static async getAll(userType = null) {
        let query = `
            SELECT u.id, u.pseudo, u.email, u.user_type, u.created_at, u.is_active,
                   uc.current_credits, uc.total_earned, uc.total_spent
            FROM users u 
            LEFT JOIN user_credits uc ON u.id = uc.user_id
        `;
        
        const params = [];
        
        if (userType) {
            query += ' WHERE u.user_type = ?';
            params.push(userType);
        }
        
        query += ' ORDER BY u.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }
}

module.exports = UserSQL;