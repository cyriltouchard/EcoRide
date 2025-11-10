// server/models/creditModel.js
// Système de gestion des crédits selon les exigences ECF

const { pool } = require('../config/db-mysql');

class CreditModel {
    
    // Obtenir les crédits d'un utilisateur
    static async getUserCredits(userId) {
        const [rows] = await pool.execute(
            'SELECT * FROM user_credits WHERE user_id = ?',
            [userId]
        );
        
        return rows[0] || null;
    }
    
    // Ajouter des crédits (gain de trajets, remboursement)
    static async addCredits(userId, amount, description, relatedData = {}) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Enregistrer la transaction
            await connection.execute(
                `INSERT INTO credit_transactions 
                 (user_id, transaction_type, amount, description, related_booking_id, related_ride_id) 
                 VALUES (?, 'gain', ?, ?, ?, ?)`,
                [
                    userId, 
                    amount, 
                    description,
                    relatedData.booking_id || null,
                    relatedData.ride_id || null
                ]
            );
            
            // Le trigger met à jour automatiquement user_credits
            await connection.commit();
            
            return await this.getUserCredits(userId);
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Dépenser des crédits (réservation covoiturage)
    static async spendCredits(userId, amount, description, relatedData = {}) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Vérifier si l'utilisateur a assez de crédits
            const [creditCheck] = await connection.execute(
                'SELECT current_credits FROM user_credits WHERE user_id = ?',
                [userId]
            );
            
            if (!creditCheck[0] || creditCheck[0].current_credits < amount) {
                throw new Error('Crédits insuffisants');
            }
            
            // Enregistrer la transaction de dépense
            await connection.execute(
                `INSERT INTO credit_transactions 
                 (user_id, transaction_type, amount, description, related_booking_id, related_ride_id) 
                 VALUES (?, 'depense', ?, ?, ?, ?)`,
                [
                    userId, 
                    amount, 
                    description,
                    relatedData.booking_id || null,
                    relatedData.ride_id || null
                ]
            );
            
            await connection.commit();
            
            return await this.getUserCredits(userId);
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Commission plateforme (2 crédits selon ECF)
    static async takePlatformCommission(userId, rideId, description = 'Commission plateforme') {
        return await this.spendCredits(userId, 2, description, { ride_id: rideId });
    }
    
    // Remboursement (annulation de trajet)
    static async refundCredits(userId, amount, description, relatedData = {}) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            await connection.execute(
                `INSERT INTO credit_transactions 
                 (user_id, transaction_type, amount, description, related_booking_id, related_ride_id) 
                 VALUES (?, 'remboursement', ?, ?, ?, ?)`,
                [
                    userId, 
                    amount, 
                    description,
                    relatedData.booking_id || null,
                    relatedData.ride_id || null
                ]
            );
            
            await connection.commit();
            
            return await this.getUserCredits(userId);
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    
    // Historique des transactions d'un utilisateur
    static async getTransactionHistory(userId, limit = 50) {
        const [rows] = await pool.execute(
            `SELECT ct.*, r.departure_city, r.arrival_city, r.departure_datetime
             FROM credit_transactions ct
             LEFT JOIN rides r ON ct.related_ride_id = r.id
             WHERE ct.user_id = ?
             ORDER BY ct.created_at DESC
             LIMIT ?`,
            [userId, limit]
        );
        
        return rows;
    }
    
    // Statistiques de crédits pour les graphiques admin
    static async getPlatformEarnings(dateStart = null, dateEnd = null) {
        let query = `
            SELECT 
                DATE(created_at) as date,
                SUM(CASE WHEN transaction_type = 'commission' THEN amount ELSE 0 END) as daily_earnings,
                COUNT(CASE WHEN transaction_type = 'commission' THEN 1 END) as transactions_count
            FROM credit_transactions
        `;
        
        const params = [];
        
        if (dateStart && dateEnd) {
            query += ' WHERE DATE(created_at) BETWEEN ? AND ?';
            params.push(dateStart, dateEnd);
        } else if (dateStart) {
            query += ' WHERE DATE(created_at) >= ?';
            params.push(dateStart);
        }
        
        query += ' GROUP BY DATE(created_at) ORDER BY date DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }
    
    // Total des gains de la plateforme
    static async getTotalPlatformEarnings() {
        const [rows] = await pool.execute(
            'SELECT SUM(amount) as total_earnings FROM credit_transactions WHERE transaction_type = "commission"'
        );
        
        return rows[0]?.total_earnings || 0;
    }
    
    // Vérifier si un utilisateur peut payer un montant
    static async canAfford(userId, amount) {
        const credits = await this.getUserCredits(userId);
        return credits && credits.current_credits >= amount;
    }
    
    // Processus complet de réservation avec crédits
    static async processBooking(passengerId, driverId, amount, rideId, bookingId) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 1. Vérifier que le passager peut payer
            if (!(await this.canAfford(passengerId, amount))) {
                throw new Error('Crédits insuffisants pour cette réservation');
            }
            
            // 2. Dépenser les crédits du passager
            await connection.execute(
                `INSERT INTO credit_transactions 
                 (user_id, transaction_type, amount, description, related_booking_id, related_ride_id) 
                 VALUES (?, 'depense', ?, ?, ?, ?)`,
                [passengerId, amount, `Réservation covoiturage`, bookingId, rideId]
            );
            
            // 3. Commission plateforme (2 crédits)
            const netAmount = amount - 2;
            await connection.execute(
                `INSERT INTO credit_transactions 
                 (user_id, transaction_type, amount, description, related_booking_id, related_ride_id) 
                 VALUES (?, 'commission', ?, ?, ?, ?)`,
                [passengerId, 2, `Commission plateforme`, bookingId, rideId]
            );
            
            // 4. Créditer le chauffeur (montant - commission)
            await connection.execute(
                `INSERT INTO credit_transactions 
                 (user_id, transaction_type, amount, description, related_booking_id, related_ride_id) 
                 VALUES (?, 'gain', ?, ?, ?, ?)`,
                [driverId, netAmount, `Paiement trajet`, bookingId, rideId]
            );
            
            await connection.commit();
            
            return {
                passenger_credits: await this.getUserCredits(passengerId),
                driver_credits: await this.getUserCredits(driverId),
                amount_charged: amount,
                platform_commission: 2,
                driver_earned: netAmount
            };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = CreditModel;