// ================================================
// CONTRÔLEUR DES AVIS ET NOTATIONS - ECORIDE
// Gestion des avis chauffeurs et du site
// ================================================

const { pool } = require('../config/db-mysql');

// ================================================
// AVIS SUR LES CHAUFFEURS
// ================================================

/**
 * Créer un avis sur un chauffeur
 * POST /api/reviews/driver
 */
exports.createDriverReview = async (req, res) => {
    try {
        const passengerId = req.user.id;
        const {
            driverId,
            rideId,
            bookingId,
            rating,
            punctualityRating,
            drivingQualityRating,
            vehicleCleanlinessRating,
            friendlinessRating,
            comment
        } = req.body;

        // Vérifications
        if (!driverId || !rating) {
            return res.status(400).json({ 
                success: false, 
                msg: 'Chauffeur et note obligatoires' 
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false, 
                msg: 'La note doit être entre 1 et 5' 
            });
        }

        // Vérifier que le passager ne note pas lui-même
        if (Number.parseInt(driverId) === passengerId) {
            return res.status(400).json({ 
                success: false, 
                msg: 'Vous ne pouvez pas vous noter vous-même' 
            });
        }

        // Vérifier que le passager a bien voyagé avec ce chauffeur (si rideId fourni)
        if (rideId) {
            const [bookingCheck] = await pool.query(
                `SELECT b.id FROM bookings b
                 JOIN rides r ON b.ride_id = r.id
                 WHERE b.passenger_id = ? AND r.driver_id = ? AND b.ride_id = ?
                 AND b.booking_status = 'termine'`,
                [passengerId, driverId, rideId]
            );

            if (bookingCheck.length === 0) {
                return res.status(403).json({ 
                    success: false, 
                    msg: 'Vous ne pouvez noter que les chauffeurs avec qui vous avez voyagé' 
                });
            }
        }

        // Vérifier qu'un avis n'existe pas déjà pour ce trajet
        if (rideId) {
            const [existingReview] = await pool.query(
                'SELECT id FROM driver_reviews WHERE driver_id = ? AND passenger_id = ? AND ride_id = ?',
                [driverId, passengerId, rideId]
            );

            if (existingReview.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    msg: 'Vous avez déjà noté ce chauffeur pour ce trajet' 
                });
            }
        }

        // Insérer l'avis
        const insertQuery = `
            INSERT INTO driver_reviews 
            (driver_id, passenger_id, ride_id, booking_id, rating, 
             punctuality_rating, driving_quality_rating, vehicle_cleanliness_rating, 
             friendliness_rating, comment)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(insertQuery, [
            driverId,
            passengerId,
            rideId || null,
            bookingId || null,
            rating,
            punctualityRating || null,
            drivingQualityRating || null,
            vehicleCleanlinessRating || null,
            friendlinessRating || null,
            comment || null
        ]);

        res.status(201).json({
            success: true,
            msg: 'Avis ajouté avec succès',
            reviewId: result.insertId
        });

    } catch (error) {
        console.error('Erreur création avis chauffeur:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors de l\'ajout de l\'avis' 
        });
    }
};

/**
 * Obtenir les avis d'un chauffeur
 * GET /api/reviews/driver/:driverId
 */
exports.getDriverReviews = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { limit = 10, offset = 0 } = req.query;

        const [reviews] = await pool.query(
            `SELECT * FROM v_driver_reviews_detailed 
             WHERE driver_id = ? 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?`,
            [driverId, Number.parseInt(limit), Number.parseInt(offset)]
        );

        // Récupérer les statistiques du chauffeur
        const [stats] = await pool.query(
            'SELECT * FROM v_driver_ratings_summary WHERE driver_id = ?',
            [driverId]
        );

        res.json({
            success: true,
            stats: stats[0] || {
                total_reviews: 0,
                avg_rating: 0,
                avg_punctuality: 0,
                avg_driving_quality: 0,
                avg_vehicle_cleanliness: 0,
                avg_friendliness: 0
            },
            reviews,
            pagination: {
                limit: Number.parseInt(limit),
                offset: Number.parseInt(offset),
                total: stats[0] ? stats[0].total_reviews : 0
            }
        });

    } catch (error) {
        console.error('Erreur récupération avis chauffeur:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors de la récupération des avis' 
        });
    }
};

/**
 * Obtenir la note moyenne d'un chauffeur
 * GET /api/reviews/driver/:driverId/rating
 */
exports.getDriverRating = async (req, res) => {
    try {
        const { driverId } = req.params;

        const [stats] = await pool.query(
            'SELECT * FROM v_driver_ratings_summary WHERE driver_id = ?',
            [driverId]
        );

        if (stats.length === 0) {
            return res.json({
                success: true,
                rating: {
                    avg_rating: 0,
                    total_reviews: 0
                }
            });
        }

        res.json({
            success: true,
            rating: stats[0]
        });

    } catch (error) {
        console.error('Erreur récupération note chauffeur:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors de la récupération de la note' 
        });
    }
};

// ================================================
// AVIS SUR LE SITE
// ================================================

/**
 * Créer un avis sur le site
 * POST /api/reviews/site
 */
exports.createSiteReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            overallRating,
            easeOfUseRating,
            reliabilityRating,
            customerServiceRating,
            valueForMoneyRating,
            comment,
            wouldRecommend
        } = req.body;

        // Vérifications
        if (!overallRating) {
            return res.status(400).json({ 
                success: false, 
                msg: 'Note globale obligatoire' 
            });
        }

        if (overallRating < 1 || overallRating > 5) {
            return res.status(400).json({ 
                success: false, 
                msg: 'La note doit être entre 1 et 5' 
            });
        }

        // Insérer l'avis
        const insertQuery = `
            INSERT INTO site_reviews 
            (user_id, overall_rating, ease_of_use_rating, reliability_rating, 
             customer_service_rating, value_for_money_rating, comment, would_recommend)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(insertQuery, [
            userId,
            overallRating,
            easeOfUseRating || null,
            reliabilityRating || null,
            customerServiceRating || null,
            valueForMoneyRating || null,
            comment || null,
            wouldRecommend !== undefined ? wouldRecommend : true
        ]);

        res.status(201).json({
            success: true,
            msg: 'Avis sur le site ajouté avec succès',
            reviewId: result.insertId
        });

    } catch (error) {
        console.error('Erreur création avis site:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors de l\'ajout de l\'avis' 
        });
    }
};

/**
 * Obtenir les avis du site
 * GET /api/reviews/site
 */
exports.getSiteReviews = async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;

        const [reviews] = await pool.query(
            `SELECT 
                sr.id,
                sr.user_id,
                u.pseudo as user_pseudo,
                sr.overall_rating,
                sr.ease_of_use_rating,
                sr.reliability_rating,
                sr.customer_service_rating,
                sr.value_for_money_rating,
                sr.comment,
                sr.would_recommend,
                sr.created_at,
                rr.response_text,
                rr.created_at as response_date
             FROM site_reviews sr
             JOIN users u ON sr.user_id = u.id
             LEFT JOIN review_responses rr ON sr.id = rr.review_id AND rr.review_type = 'site'
             WHERE sr.is_visible = TRUE
             ORDER BY sr.created_at DESC
             LIMIT ? OFFSET ?`,
            [Number.parseInt(limit), Number.parseInt(offset)]
        );

        // Récupérer les statistiques globales (sans vue, calcul direct)
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_reviews,
                COALESCE(AVG(overall_rating), 0) as avg_overall_rating
            FROM site_reviews
            WHERE is_visible = TRUE
        `);

        res.json({
            success: true,
            stats: stats[0] || {
                total_reviews: 0,
                avg_overall_rating: 0
            },
            reviews,
            pagination: {
                limit: Number.parseInt(limit),
                offset: Number.parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Erreur récupération avis site:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors de la récupération des avis' 
        });
    }
};

/**
 * Obtenir les statistiques globales du site
 * GET /api/reviews/site/stats
 */
exports.getSiteStats = async (req, res) => {
    try {
        const [stats] = await pool.query('SELECT * FROM v_site_ratings_summary');

        res.json({
            success: true,
            stats: stats[0] || {
                total_reviews: 0,
                avg_overall_rating: 0,
                recommendation_percentage: 0
            }
        });

    } catch (error) {
        console.error('Erreur récupération stats site:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors de la récupération des statistiques' 
        });
    }
};

// ================================================
// RÉPONSES AUX AVIS
// ================================================

/**
 * Répondre à un avis (chauffeur ou admin)
 * POST /api/reviews/:reviewId/response
 */
exports.respondToReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reviewType, responseText } = req.body;
        const responderId = req.user.id;

        // Vérifications
        if (!reviewType || !['driver', 'site'].includes(reviewType)) {
            return res.status(400).json({ 
                success: false, 
                msg: 'Type d\'avis invalide' 
            });
        }

        if (!responseText || responseText.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                msg: 'Réponse vide' 
            });
        }

        // Vérifier que l'avis existe et que l'utilisateur a le droit de répondre
        if (reviewType === 'driver') {
            const [review] = await pool.query(
                'SELECT driver_id FROM driver_reviews WHERE id = ?',
                [reviewId]
            );

            if (review.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    msg: 'Avis non trouvé' 
                });
            }

            // Seul le chauffeur concerné ou un admin peut répondre
            if (review[0].driver_id !== responderId && req.user.user_type !== 'admin') {
                return res.status(403).json({ 
                    success: false, 
                    msg: 'Non autorisé à répondre à cet avis' 
                });
            }
        } else {
            // Seuls les admins peuvent répondre aux avis du site
            if (req.user.user_type !== 'admin' && req.user.user_type !== 'employe') {
                return res.status(403).json({ 
                    success: false, 
                    msg: 'Seuls les administrateurs peuvent répondre aux avis du site' 
                });
            }
        }

        // Insérer la réponse
        const [result] = await pool.query(
            `INSERT INTO review_responses (review_id, review_type, responder_id, response_text)
             VALUES (?, ?, ?, ?)`,
            [reviewId, reviewType, responderId, responseText]
        );

        res.status(201).json({
            success: true,
            msg: 'Réponse ajoutée avec succès',
            responseId: result.insertId
        });

    } catch (error) {
        console.error('Erreur ajout réponse:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors de l\'ajout de la réponse' 
        });
    }
};

/**
 * Signaler un avis inapproprié
 * POST /api/reviews/:reviewId/report
 */
exports.reportReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reviewType } = req.body;

        if (!reviewType || !['driver', 'site'].includes(reviewType)) {
            return res.status(400).json({ 
                success: false, 
                msg: 'Type d\'avis invalide' 
            });
        }

        const table = reviewType === 'driver' ? 'driver_reviews' : 'site_reviews';

        await pool.query(
            `UPDATE ${table} SET is_reported = TRUE WHERE id = ?`,
            [reviewId]
        );

        res.json({
            success: true,
            msg: 'Avis signalé avec succès'
        });

    } catch (error) {
        console.error('Erreur signalement avis:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors du signalement de l\'avis' 
        });
    }
};

/**
 * Obtenir les trajets terminés d'un utilisateur (pour pouvoir noter)
 * GET /api/reviews/eligible-rides
 */
exports.getEligibleRides = async (req, res) => {
    try {
        const userId = req.user.id;

        // Récupérer les trajets terminés où l'utilisateur était passager
        // et où il n'a pas encore noté le chauffeur
        const [rides] = await pool.query(
            `SELECT 
                b.id as booking_id,
                r.id as ride_id,
                r.driver_id,
                u.pseudo as driver_pseudo,
                r.departure_city,
                r.arrival_city,
                r.departure_datetime,
                r.status,
                b.booking_status
             FROM bookings b
             JOIN rides r ON b.ride_id = r.id
             JOIN users u ON r.driver_id = u.id
             LEFT JOIN driver_reviews dr ON (dr.ride_id = r.id AND dr.passenger_id = ?)
             WHERE b.passenger_id = ?
             AND b.booking_status = 'termine'
             AND dr.id IS NULL
             ORDER BY r.departure_datetime DESC`,
            [userId, userId]
        );

        res.json({
            success: true,
            rides
        });

    } catch (error) {
        console.error('Erreur récupération trajets éligibles:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors de la récupération des trajets' 
        });
    }
};

/**
 * Obtenir les avis donnés par l'utilisateur connecté
 * GET /api/reviews/my-reviews
 */
exports.getMyReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        // Récupérer les avis chauffeur
        const [driverReviews] = await pool.query(
            `SELECT 
                dr.*,
                'driver' as review_type,
                u.pseudo as driver_name,
                r.departure_city,
                r.arrival_city,
                r.departure_datetime
             FROM driver_reviews dr
             JOIN users u ON dr.driver_id = u.id
             LEFT JOIN rides r ON dr.ride_id = r.id
             WHERE dr.passenger_id = ?
             ORDER BY dr.created_at DESC`,
            [userId]
        );

        // Récupérer les avis site
        const [siteReviews] = await pool.query(
            `SELECT 
                sr.*,
                'site' as review_type
             FROM site_reviews sr
             WHERE sr.user_id = ?
             ORDER BY sr.created_at DESC`,
            [userId]
        );

        // Formater les avis chauffeur
        const formattedDriverReviews = driverReviews.map(review => ({
            ...review,
            review_type: 'driver'
        }));

        // Combiner et trier par date
        const allReviews = [...formattedDriverReviews, ...siteReviews]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({
            success: true,
            reviews: allReviews,
            count: allReviews.length
        });

    } catch (error) {
        console.error('Erreur récupération mes avis:', error);
        res.status(500).json({ 
            success: false, 
            msg: 'Erreur lors de la récupération de vos avis' 
        });
    }
};

module.exports = exports;
