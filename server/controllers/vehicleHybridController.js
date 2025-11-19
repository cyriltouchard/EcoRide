// server/controllers/vehicleHybridController.js
// Contrôleur Véhicules Hybride MySQL+MongoDB pour ECF US8

const VehicleSQL = require('../models/vehicleSQLModel');
const DriverPreferences = require('../models/driverPreferencesModel');
const Vehicle = require('../models/vehicleModel'); // MongoDB pour données étendues

// @route   POST /api/vehicles
// @desc    Ajouter un nouveau véhicule (US8)
// @access  Private (promotion automatique en chauffeur)
exports.addVehicle = async (req, res) => {
    try {
        const userId = req.user.id;
        const UserSQL = require('../models/userSQLModel');
        
        // Vérifier le rôle actuel de l'utilisateur
        const currentUser = await UserSQL.findById(userId);
        
        // Si l'utilisateur n'est pas déjà chauffeur, le promouvoir automatiquement
        if (currentUser && currentUser.user_type === 'passager') {
            console.log(`🚗 Promotion automatique de l'utilisateur ${userId} en chauffeur_passager`);
            await UserSQL.updateUserType(userId, 'chauffeur_passager');
            req.user.user_type = 'chauffeur_passager'; // Mettre à jour dans la session
        }
        
        // Support des DEUX formats (ancien et nouveau)
        const {
            brand,
            model,
            color,
            license_plate,
            plate,
            first_registration,
            energy_type,
            energy,
            available_seats,
            seats
        } = req.body;
        
        // Validation des données avec support des deux formats
        const vehicleData = {
            user_id: userId,
            brand: brand?.trim(),
            model: model?.trim(),
            color: color?.trim() || 'Non spécifié',
            license_plate: (license_plate || plate)?.trim().toUpperCase(),
            first_registration: first_registration || new Date().toISOString().split('T')[0],
            energy_type: (energy_type || energy)?.toLowerCase(),
            available_seats: parseInt(available_seats || seats)
        };
        
        const validationErrors = VehicleSQL.validateVehicleData(vehicleData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: validationErrors
            });
        }
        
        // Créer le véhicule en MySQL
        const vehicle = await VehicleSQL.create(vehicleData);
        
        // Créer aussi en MongoDB pour données étendues (optionnel)
        try {
            console.log('🔵 Tentative création MongoDB - mongo_id:', req.user.mongo_id);
            if (!req.user.mongo_id) {
                console.warn('⚠️  mongo_id manquant dans req.user, recherche dans MongoDB...');
                
                // Validation stricte de userId pour prévenir l'injection NoSQL
                const sanitizedUserId = parseInt(userId, 10);
                if (isNaN(sanitizedUserId) || sanitizedUserId <= 0) {
                    throw new Error('ID utilisateur invalide');
                }
                
                const UserModel = require('../models/user');
                const existingUser = await UserModel.findOne({ 
                    sql_id: sanitizedUserId  // Utiliser l'ID validé
                });
                if (existingUser) {
                    req.user.mongo_id = existingUser._id;
                    console.log('✅ mongo_id trouvé:', req.user.mongo_id);
                }
            }
            
            // Convertir energy_type pour MongoDB (Essence, Diesel, etc.)
            const energyMap = {
                'essence': 'Essence',
                'diesel': 'Diesel',
                'electrique': 'Électrique',
                'hybride': 'Hybride',
                'gpl': 'GPL'
            };
            
            const vehicleMongo = new Vehicle({
                userId: req.user.mongo_id,
                brand: vehicle.brand,
                model: vehicle.model,
                plate: vehicle.license_plate,
                energy: energyMap[vehicle.energy_type] || vehicle.energy_type,
                seats: vehicle.available_seats,
                sql_id: vehicle.id
            });
            await vehicleMongo.save();
            console.log('✅ Véhicule créé dans MongoDB:', vehicleMongo._id);
        } catch (mongoError) {
            console.error('❌ Erreur MongoDB véhicule:', mongoError.message);
            console.error('Stack:', mongoError.stack);
        }
        
        res.status(201).json({
            success: true,
            message: 'Véhicule ajouté avec succès',
            data: vehicle
        });
        
    } catch (error) {
        console.error('Erreur ajout véhicule:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur serveur lors de l\'ajout du véhicule'
        });
    }
};

// @route   GET /api/vehicles/me
// @desc    Obtenir tous les véhicules de l'utilisateur (US8)
// @access  Private
exports.getVehicles = async (req, res) => {
    try {
        const userId = req.user.id; // Utiliser l'ID MySQL
        
        // Récupérer depuis MySQL
        const vehicles = await VehicleSQL.getUserVehicles(userId);
        
        // Transformer pour compatibilité frontend (qui attend le format MongoDB)
        const vehiclesFormatted = vehicles.map(v => ({
            _id: v.id, // Utiliser l'ID MySQL comme _id pour compatibilité
            sql_id: v.id, // Ajouter aussi sql_id explicitement
            userId: userId,
            brand: v.brand,
            model: v.model,
            plate: v.license_plate,
            energy: v.energy_type,
            seats: v.available_seats,
            color: v.color,
            first_registration: v.first_registration,
            is_active: v.is_active,
            createdAt: v.created_at
        }));
        
        res.json({
            success: true,
            vehicles: vehiclesFormatted,
            data: vehiclesFormatted,
            count: vehiclesFormatted.length
        });
        
    } catch (error) {
        console.error('Erreur récupération véhicules:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des véhicules',
            error: error.message
        });
    }
};

// @route   GET /api/vehicles/:id
// @desc    Obtenir un véhicule spécifique
// @access  Private
exports.getVehicleById = async (req, res) => {
    try {
        const vehicleId = parseInt(req.params.id);
        const userId = req.user.id;
        
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: 'ID véhicule invalide'
            });
        }
        
        const vehicle = await VehicleSQL.getById(vehicleId, userId);
        
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Véhicule non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: vehicle
        });
        
    } catch (error) {
        console.error('Erreur récupération véhicule:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @route   PUT /api/vehicles/:id
// @desc    Mettre à jour un véhicule
// @access  Private
exports.updateVehicle = async (req, res) => {
    try {
        const vehicleId = parseInt(req.params.id);
        const userId = req.user.id;
        
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: 'ID véhicule invalide'
            });
        }
        
        const updateData = {};
        const allowedFields = ['brand', 'model', 'color', 'energy_type', 'available_seats'];
        
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Aucune donnée à mettre à jour'
            });
        }
        
        // Valider les nouvelles données
        const validationErrors = VehicleSQL.validateVehicleData({ ...updateData, license_plate: 'TEMP-123' });
        if (validationErrors.length > 1) { // Ignorer l'erreur de plaque temporaire
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: validationErrors.filter(err => !err.includes('Plaque'))
            });
        }
        
        const vehicle = await VehicleSQL.update(vehicleId, userId, updateData);
        
        res.json({
            success: true,
            message: 'Véhicule mis à jour avec succès',
            data: vehicle
        });
        
    } catch (error) {
        console.error('Erreur mise à jour véhicule:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur serveur'
        });
    }
};

// @route   DELETE /api/vehicles/:id
// @desc    Supprimer un véhicule
// @access  Private
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicleId = parseInt(req.params.id);
        const userId = req.user.id;
        
        if (isNaN(vehicleId)) {
            return res.status(400).json({
                success: false,
                message: 'ID véhicule invalide'
            });
        }
        
        const success = await VehicleSQL.delete(vehicleId, userId);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Véhicule non trouvé ou déjà supprimé'
            });
        }
        
        res.json({
            success: true,
            message: 'Véhicule supprimé avec succès'
        });
        
    } catch (error) {
        console.error('Erreur suppression véhicule:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur serveur'
        });
    }
};

// @route   POST /api/vehicles/preferences
// @desc    Définir les préférences de chauffeur (US8)
// @access  Private (chauffeur requis)
exports.setDriverPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const UserSQL = require('../models/userSQLModel');
        
        // Vérifier le rôle actuel de l'utilisateur
        const currentUser = await UserSQL.findById(userId);
        
        // Si l'utilisateur n'est pas déjà chauffeur, le promouvoir automatiquement
        if (currentUser && currentUser.user_type === 'passager') {
            console.log(`🚗 Promotion automatique de l'utilisateur ${userId} en chauffeur_passager (préférences)`);
            await UserSQL.updateUserType(userId, 'chauffeur_passager');
            req.user.user_type = 'chauffeur_passager';
        }
        
        const {
            smoking_allowed,
            pets_allowed,
            music_preference,
            conversation_level,
            custom_preferences
        } = req.body;
        
        const preferences = {
            smoking_allowed: Boolean(smoking_allowed),
            pets_allowed: Boolean(pets_allowed),
            music_preference: music_preference?.trim() || '',
            conversation_level: conversation_level || 'sociable',
            custom_preferences: custom_preferences?.trim() || ''
        };
        
        // Validation
        const validationErrors = DriverPreferences.validatePreferences(preferences);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: validationErrors
            });
        }
        
        const result = await DriverPreferences.upsert(userId, preferences);
        
        res.json({
            success: true,
            message: 'Préférences mises à jour avec succès',
            data: result
        });
        
    } catch (error) {
        console.error('Erreur préférences chauffeur:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur serveur'
        });
    }
};

// @route   GET /api/vehicles/preferences
// @desc    Obtenir les préférences de chauffeur
// @access  Private
exports.getDriverPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const preferences = await DriverPreferences.getByUserId(userId);
        
        if (!preferences) {
            return res.status(404).json({
                success: false,
                message: 'Aucune préférence définie'
            });
        }
        
        res.json({
            success: true,
            data: preferences
        });
        
    } catch (error) {
        console.error('Erreur récupération préférences:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

// @route   GET /api/vehicles/driver-profile
// @desc    Obtenir le profil complet de chauffeur (US8)
// @access  Private
exports.getDriverProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const profile = await DriverPreferences.getDriverProfile(userId);
        
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profil chauffeur non trouvé'
            });
        }
        
        res.json({
            success: true,
            data: profile
        });
        
    } catch (error) {
        console.error('Erreur profil chauffeur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur'
        });
    }
};

module.exports = exports;