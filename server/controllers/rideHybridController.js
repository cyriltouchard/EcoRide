// server/controllers/rideHybridController.js
// Contrôleur Trajets Hybride MySQL+MongoDB pour ECF US9

const RideSQL = require('../models/rideSQLModel');
const Ride = require('../models/rideModel'); // MongoDB pour les trajets
const Vehicle = require('../models/vehicleModel'); // MongoDB pour les véhicules
const User = require('../models/userModel'); // MongoDB pour les utilisateurs
const VehicleSQL = require('../models/vehicleSQLModel');
const CreditModel = require('../models/creditModel');

// @route   POST /api/rides
// @desc    Créer un nouveau covoiturage (US9)
// @access  Private (chauffeur requis)
exports.createRide = async (req, res) => {
    try {
        const driverId = req.user.id;
        const {
            vehicle_id,
            departure_city,
            arrival_city,
            departure_address,
            arrival_address,
            departure_datetime,
            estimated_arrival,
            price_per_seat,
            available_seats
        } = req.body;
        
        // Validation des données
        const rideData = {
            driver_id: driverId,
            vehicle_id: parseInt(vehicle_id),
            departure_city: departure_city?.trim(),
            arrival_city: arrival_city?.trim(),
            departure_address: departure_address?.trim(),
            arrival_address: arrival_address?.trim(),
            departure_datetime,
            estimated_arrival,
            price_per_seat: parseFloat(price_per_seat),
            available_seats: parseInt(available_seats)
        };
        
        const validationErrors = RideSQL.validateRideData(rideData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: validationErrors
            });
        }
        
        // Vérifier que le véhicule appartient au chauffeur
        const vehicle = await VehicleSQL.getById(vehicle_id, driverId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Véhicule non trouvé ou non autorisé'
            });
        }
        
        // Vérifier les crédits (commission plateforme)
        const canAfford = await CreditModel.canAfford(driverId, 2);
        if (!canAfford) {
            return res.status(400).json({
                success: false,
                message: 'Crédits insuffisants (2 crédits requis pour la commission plateforme)'
            });
        }
        
        // Créer le trajet
        const ride = await RideSQL.create(rideData);
        
        // Prélever la commission plateforme
        await CreditModel.takePlatformCommission(
            driverId, 
            ride.id, 
            `Commission plateforme - Trajet ${ride.departure_city} → ${ride.arrival_city}`
        );
        
        res.status(201).json({
            success: true,
            message: 'Covoiturage créé avec succès',
            data: ride
        });
        
    } catch (error) {
        console.error('Erreur création trajet:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur serveur lors de la création du trajet'
        });
    }
};

// @route   GET /api/rides/search
// @desc    Rechercher des covoiturages (US3)
// @access  Public
exports.searchRides = async (req, res) => {
    try {
        const {
            departure_city,
            arrival_city,
            departure_date,
            max_price,
            ecological_only,
            min_seats = 1,
            // Alias pour compatibilité frontend
            departure,
            arrival,
            date,
            seats
        } = req.query;
        
        // Utiliser les alias si les paramètres principaux ne sont pas fournis
        const depCity = departure_city || departure;
        const arrCity = arrival_city || arrival;
        const depDate = departure_date || date;
        const minSeats = seats || min_seats;
        
        // Construire la requête MongoDB
        let query = {};
        
        if (depCity) {
            query.departure = new RegExp(depCity, 'i');
        }
        if (arrCity) {
            query.arrival = new RegExp(arrCity, 'i');
        }
        if (depDate) {
            const searchDate = new Date(depDate);
            if (!isNaN(searchDate)) {
                const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
                const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1);
                query.departureDate = {
                    $gte: startOfDay,
                    $lt: endOfDay
                };
            }
        }
        if (minSeats) {
            query.availableSeats = { $gte: parseInt(minSeats) || 1 };
        }
        if (max_price) {
            query.price = { $lte: parseFloat(max_price) };
        }
        if (ecological_only === 'true') {
            query.isEcologic = true;
        }
        
        // Exclure les trajets passés et annulés
        const now = new Date();
        if (!query.departureDate) {
            query.departureDate = { $gte: now };
        }
        query.status = { $ne: 'cancelled' };
        
        const rides = await Ride.find(query)
            .populate('driver', 'pseudo')
            .populate('vehicle', 'brand model energy')
            .sort({ departureDate: 1, departureTime: 1 });
        
        res.json({
            success: true,
            data: rides,
            rides: rides, // Alias pour compatibilité
            count: rides.length
        });
        
    } catch (error) {
        console.error('Erreur recherche trajets:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la recherche',
            error: error.message
        });
    }
};

// @route   GET /api/rides/my-rides
// @desc    Obtenir tous les trajets de l'utilisateur chauffeur (US9)
// @access  Private (chauffeur requis)
exports.getMyRides = async (req, res) => {
    try {
        const driverId = req.user.id;
        const { status } = req.query;
        
        const rides = await RideSQL.getDriverRides(driverId, status);
        
        res.json({
            success: true,
            data: rides,
            count: rides.length
        });
        
    } catch (error) {
        console.error('Erreur récupération trajets:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des trajets'
        });
    }
};

// @route   GET /api/rides/:id
// @desc    Obtenir un trajet spécifique (US5)
// @access  Public
exports.getRideById = async (req, res) => {
    try {
        const rideIdParam = req.params.id;
        
        // Détecter si c'est un ID MongoDB (24 caractères hexadécimaux) ou MySQL (numérique)
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(rideIdParam);
        
        let ride;
        
        if (isMongoId) {
            // Chercher dans MongoDB
            ride = await Ride.findById(rideIdParam);
            if (!ride) {
                return res.status(404).json({
                    success: false,
                    message: 'Trajet non trouvé'
                });
            }
            
            // Convertir en format compatible
            ride = {
                id: ride._id.toString(),
                depart: ride.depart,
                destination: ride.destination,
                date_depart: ride.date_depart,
                heure_depart: ride.heure_depart,
                prix: ride.prix,
                places_disponibles: ride.places_disponibles,
                conducteur_id: ride.conducteur_id,
                description: ride.description,
                status: ride.status,
                vehicle_id: ride.vehicle_id,
                arrets_intermediaires: ride.arrets_intermediaires,
                preferences: ride.preferences
            };
        } else {
            // Chercher dans MySQL
            const rideId = parseInt(rideIdParam);
            
            if (isNaN(rideId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID trajet invalide'
                });
            }
            
            ride = await RideSQL.getById(rideId);
            
            if (!ride) {
                return res.status(404).json({
                    success: false,
                    message: 'Trajet non trouvé'
                });
            }
        }
        
        res.json({
            success: true,
            data: ride
        });
        
    } catch (error) {
        console.error('Erreur récupération trajet:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @route   PUT /api/rides/:id/status
// @desc    Changer le statut d'un trajet (US11 - démarrer/arrêter)
// @access  Private (chauffeur propriétaire)
exports.updateRideStatus = async (req, res) => {
    try {
        const rideId = parseInt(req.params.id);
        const driverId = req.user.id;
        const { status } = req.body;
        
        if (isNaN(rideId)) {
            return res.status(400).json({
                success: false,
                message: 'ID trajet invalide'
            });
        }
        
        const validTransitions = {
            'en_attente': ['confirme', 'annule'],
            'confirme': ['en_cours', 'annule'],
            'en_cours': ['termine'],
            'termine': [],
            'annule': []
        };
        
        const ride = await RideSQL.updateStatus(rideId, driverId, status);
        
        // Actions spéciales selon le nouveau statut
        let message = 'Statut mis à jour avec succès';
        if (status === 'en_cours') {
            message = 'Trajet démarré avec succès';
        } else if (status === 'termine') {
            message = 'Trajet terminé avec succès';
            // Ici on pourrait notifier les passagers pour qu'ils valident le trajet
        }
        
        res.json({
            success: true,
            message,
            data: ride
        });
        
    } catch (error) {
        console.error('Erreur mise à jour statut:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur serveur'
        });
    }
};

// @route   DELETE /api/rides/:id
// @desc    Annuler un trajet (US10)
// @access  Private (chauffeur propriétaire)
exports.cancelRide = async (req, res) => {
    try {
        const rideId = parseInt(req.params.id);
        const driverId = req.user.id;
        const { reason } = req.body;
        
        if (isNaN(rideId)) {
            return res.status(400).json({
                success: false,
                message: 'ID trajet invalide'
            });
        }
        
        const result = await RideSQL.cancel(rideId, driverId, reason);
        
        res.json({
            success: true,
            message: 'Trajet annulé avec succès',
            data: result
        });
        
    } catch (error) {
        console.error('Erreur annulation trajet:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur serveur'
        });
    }
};

// @route   GET /api/rides/statistics
// @desc    Statistiques des trajets (admin)
// @access  Private (admin requis)
exports.getStatistics = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé - Admin requis'
            });
        }
        
        const { date_start, date_end } = req.query;
        
        const stats = await RideSQL.getStatistics(date_start, date_end);
        
        res.json({
            success: true,
            data: stats,
            period: {
                start: date_start || 'Début',
                end: date_end || 'Aujourd\'hui'
            }
        });
        
    } catch (error) {
        console.error('Erreur statistiques trajets:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @route   POST /api/rides/:id/book
// @desc    Réserver une place dans un covoiturage (US4)
// @access  Private (passager)
exports.bookRide = async (req, res) => {
    try {
        const rideIdParam = req.params.id;
        const passengerId = req.user.id;
        const { passengers = 1 } = req.body;

        // Détecter si c'est un ID MongoDB (24 caractères hexadécimaux) ou MySQL (numérique)
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(rideIdParam);
        
        let ride;
        
        if (isMongoId) {
            // Chercher dans MongoDB
            ride = await Ride.findById(rideIdParam);
            if (!ride) {
                return res.status(404).json({
                    success: false,
                    message: 'Trajet non trouvé'
                });
            }

            if (ride.status !== 'active' && ride.status !== 'en_attente') {
                return res.status(400).json({
                    success: false,
                    message: 'Ce trajet n\'est plus disponible'
                });
            }

            if (ride.conducteur_id === passengerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vous ne pouvez pas réserver votre propre trajet'
                });
            }

            if (ride.places_disponibles < passengers) {
                return res.status(400).json({
                    success: false,
                    message: 'Pas assez de places disponibles'
                });
            }

            // Mettre à jour les places disponibles dans MongoDB
            ride.places_disponibles -= passengers;
            await ride.save();

            return res.json({
                success: true,
                message: 'Réservation effectuée avec succès',
                data: {
                    rideId: ride._id.toString(),
                    passengers,
                    remaining_seats: ride.places_disponibles
                }
            });
            
        } else {
            // Chercher dans MySQL
            const rideId = parseInt(rideIdParam);
            
            if (isNaN(rideId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de trajet invalide'
                });
            }

            // Vérifier que le trajet existe et est disponible
            ride = await RideSQL.getById(rideId);
            if (!ride) {
                return res.status(404).json({
                    success: false,
                    message: 'Trajet non trouvé'
                });
            }

            if (ride.status !== 'active') {
                return res.status(400).json({
                    success: false,
                    message: 'Ce trajet n\'est plus disponible'
                });
            }

            if (ride.driver_id === passengerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Vous ne pouvez pas réserver votre propre trajet'
                });
            }

            if (ride.available_seats < passengers) {
                return res.status(400).json({
                    success: false,
                    message: 'Pas assez de places disponibles'
                });
            }

            // Créer la réservation
            await RideSQL.updateAvailableSeats(rideId, ride.available_seats - passengers);

            return res.json({
                success: true,
                message: 'Réservation effectuée avec succès',
                data: {
                    rideId,
                    passengers,
                    remaining_seats: ride.available_seats - passengers
                }
            });
        }

    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la réservation'
        });
    }
};

// Récupérer les trajets proposés par l'utilisateur
exports.getOfferedRides = async (req, res) => {
    try {
        const userId = req.user.id; // Utiliser l'ID MySQL
        console.log('🔍 getOfferedRides - userId:', userId);

        // Récupérer les trajets depuis MySQL
        const rides = await RideSQL.getDriverRides(userId);
        console.log('📊 Trajets trouvés:', rides.length);

        // Transformer pour compatibilité frontend
        const ridesFormatted = rides.map(r => {
            console.log('🔄 Transformation trajet:', r.id, r.departure_city, '→', r.arrival_city);
            // Extraire la date et l'heure du datetime MySQL
            const datetime = new Date(r.departure_datetime);
            const date = datetime.toISOString().split('T')[0];
            const time = datetime.toTimeString().split(' ')[0].substring(0, 5);
            
            return {
                _id: r.id,
                departure: r.departure_city,
                arrival: r.arrival_city,
                departureDate: date,
                departureTime: time,
                status: r.status,
                availableSeats: r.available_seats,
                price: r.price_per_seat,
                driver: {
                    pseudo: 'Vous'
                }
            };
        });

        console.log('✅ Réponse formatée:', ridesFormatted.length, 'trajets');
        res.json({
            success: true,
            rides: ridesFormatted,
            count: ridesFormatted.length
        });

    } catch (error) {
        console.error('❌ Erreur lors de la récupération des trajets proposés:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des trajets',
            error: error.message
        });
    }
};

// Récupérer les trajets réservés par l'utilisateur
exports.getBookedRides = async (req, res) => {
    try {
        const mongoId = req.user.mongo_id;

        if (!mongoId) {
            return res.status(400).json({
                success: false,
                message: 'ID MongoDB manquant dans le token'
            });
        }

        const rides = await Ride.find({ passengers: mongoId })
            .populate('driver', 'pseudo email')
            .populate('vehicle', 'brand model licensePlate')
            .sort({ departureDate: 1 });

        res.json({
            success: true,
            rides: rides,
            count: rides.length
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des trajets réservés:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des trajets'
        });
    }
};

module.exports = exports;