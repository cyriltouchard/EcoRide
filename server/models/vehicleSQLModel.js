// server/models/vehicleSQLModel.js
// Modèle Véhicule MySQL pour conformité ECF US8

const { pool } = require('../config/db-mysql');

class VehicleSQL {
    
    // Créer un nouveau véhicule
    static async create(vehicleData) {
        const { 
            user_id, 
            brand, 
            model, 
            color, 
            license_plate, 
            first_registration, 
            energy_type, 
            available_seats 
        } = vehicleData;
        
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Vérifier que l'utilisateur peut être chauffeur
            const [userCheck] = await connection.execute(
                'SELECT user_type FROM users WHERE id = ?',
                [user_id]
            );
            
            if (!userCheck[0] || !['chauffeur', 'chauffeur_passager'].includes(userCheck[0].user_type)) {
                throw new Error('Utilisateur non autorisé à ajouter des véhicules');
            }
            
            // Vérifier que la plaque n'existe pas déjà
            const [plateCheck] = await connection.execute(
                'SELECT id FROM vehicles WHERE license_plate = ?',
                [license_plate]
            );
            
            if (plateCheck.length > 0) {
                throw new Error('Cette plaque d\'immatriculation est déjà enregistrée');
            }
            
            // Insérer le véhicule
            const [result] = await connection.execute(
                `INSERT INTO vehicles 
                 (user_id, brand, model, color, license_plate, first_registration, energy_type, available_seats) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, brand, model, color, license_plate, first_registration, energy_type, available_seats]
            );
            
            await connection.commit();
            
            return {
                id: result.insertId,
                user_id,
                brand,
                model,
                color,
                license_plate,
                first_registration,
                energy_type,
                available_seats,
                is_ecological: energy_type === 'electrique'
            };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Obtenir tous les véhicules d'un utilisateur
    static async getUserVehicles(userId) {
        const [rows] = await pool.execute(
            `SELECT v.*, 
                    CASE WHEN v.energy_type = 'electrique' THEN true ELSE false END as is_ecological,
                    COUNT(r.id) as rides_count
             FROM vehicles v
             LEFT JOIN rides r ON v.id = r.vehicle_id
             WHERE v.user_id = ? AND v.is_active = TRUE
             GROUP BY v.id
             ORDER BY v.created_at DESC`,
            [userId]
        );
        
        return rows;
    }
    
    // Obtenir un véhicule par ID
    static async getById(vehicleId, userId = null) {
        let query = `
            SELECT v.*, 
                   CASE WHEN v.energy_type = 'electrique' THEN true ELSE false END as is_ecological,
                   u.pseudo as owner_pseudo
            FROM vehicles v
            JOIN users u ON v.user_id = u.id
            WHERE v.id = ? AND v.is_active = TRUE
        `;
        
        const params = [vehicleId];
        
        if (userId) {
            query += ' AND v.user_id = ?';
            params.push(userId);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows[0] || null;
    }
    
    // Mettre à jour un véhicule
    static async update(vehicleId, userId, updateData) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Vérifier que le véhicule appartient à l'utilisateur
            const [ownerCheck] = await connection.execute(
                'SELECT id FROM vehicles WHERE id = ? AND user_id = ?',
                [vehicleId, userId]
            );
            
            if (ownerCheck.length === 0) {
                throw new Error('Véhicule non trouvé ou non autorisé');
            }
            
            // Construire la requête de mise à jour dynamiquement
            const allowedFields = ['brand', 'model', 'color', 'energy_type', 'available_seats'];
            const updates = [];
            const values = [];
            
            Object.keys(updateData).forEach(key => {
                if (allowedFields.includes(key) && updateData[key] !== undefined) {
                    updates.push(`${key} = ?`);
                    values.push(updateData[key]);
                }
            });
            
            if (updates.length === 0) {
                throw new Error('Aucune donnée valide à mettre à jour');
            }
            
            values.push(vehicleId, userId);
            
            const [result] = await connection.execute(
                `UPDATE vehicles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ? AND user_id = ?`,
                values
            );
            
            await connection.commit();
            
            if (result.affectedRows === 0) {
                throw new Error('Échec de la mise à jour');
            }
            
            return await this.getById(vehicleId, userId);
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Supprimer (désactiver) un véhicule
    static async delete(vehicleId, userId) {
        const [result] = await pool.execute(
            'UPDATE vehicles SET is_active = FALSE WHERE id = ? AND user_id = ?',
            [vehicleId, userId]
        );
        
        return result.affectedRows > 0;
    }
    
    // Valider les données de véhicule
    static validateVehicleData(data) {
        const errors = [];
        
        if (!data.brand || data.brand.trim().length < 2) {
            errors.push('La marque doit contenir au moins 2 caractères');
        }
        
        if (!data.model || data.model.trim().length < 2) {
            errors.push('Le modèle doit contenir au moins 2 caractères');
        }
        
        if (!data.license_plate || !/^[A-Z0-9-]{6,10}$/i.test(data.license_plate)) {
            errors.push('Plaque d\'immatriculation invalide');
        }
        
        const validEnergyTypes = ['essence', 'diesel', 'electrique', 'hybride'];
        if (!validEnergyTypes.includes(data.energy_type)) {
            errors.push('Type d\'énergie invalide');
        }
        
        if (!data.available_seats || data.available_seats < 1 || data.available_seats > 8) {
            errors.push('Nombre de places disponibles invalide (1-8)');
        }
        
        return errors;
    }
}

module.exports = VehicleSQL;