const Vehicle = require('../models/vehicleModel');
const { 
    sanitizeString, 
    normalizePlate, 
    errorResponse, 
    successResponse,
    formatValidationErrors 
} = require('../utils/validators');
const { handleError } = require('../utils/errorHandler');

// @route   POST /api/vehicles
// @desc    Ajouter un nouveau véhicule
// @access  Private
exports.addVehicle = async (req, res) => {
    console.log('🚗 Données reçues pour nouveau véhicule:', req.body);
    let { brand, model, plate, energy, seats } = req.body;
    const userId = req.user.id;

    try {
        brand = sanitizeString(brand);
        model = sanitizeString(model);
        plate = normalizePlate(plate);
        energy = sanitizeString(energy);
        seats = Number.parseInt(seats, 10);

        console.log('🔍 Après traitement:', { brand, model, plate, energy, seats, userId });

        if (!brand || !model || !plate || !energy || !seats) {
            console.log('❌ Validation échouée:', { brand: !!brand, model: !!model, plate: !!plate, energy: !!energy, seats: !!seats });
            return errorResponse(res, 400, 'Veuillez remplir tous les champs obligatoires.');
        }
        const existingVehicle = await Vehicle.findOne({ userId, plate });
        if (existingVehicle) {
            return errorResponse(res, 400, 'Vous avez déjà enregistré un véhicule avec cette immatriculation.');
        }

        const newVehicle = new Vehicle({
            userId,
            brand,
            model,
            plate,
            energy,
            seats
        });

        await newVehicle.save();
        return successResponse(res, 201, 'Véhicule ajouté avec succès.', { vehicle: newVehicle });

    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return errorResponse(res, 400, formatValidationErrors(err));
        }
        return handleError(err, res, 'Erreur serveur');
    }
};

// @route   GET /api/vehicles
// @desc    Obtenir tous les véhicules de l'utilisateur connecté
// @access  Private
exports.getVehicles = async (req, res) => {
    const userId = req.user.id;

    try {
        const vehicles = await Vehicle.find({ userId }).sort({ createdAt: -1 });

        if (!vehicles || vehicles.length === 0) {
            return successResponse(res, 200, 'Aucun véhicule enregistré pour cet utilisateur.', { vehicles: [] });
        }

        return successResponse(res, 200, 'Véhicules récupérés avec succès.', { vehicles });

    } catch (err) {
        return handleError(err, res, 'Erreur serveur');
    }
};

// @route   GET /api/vehicles/:id
// @desc    Obtenir un véhicule par son ID (pour l'utilisateur connecté)
// @access  Private
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return errorResponse(res, 404, 'Véhicule non trouvé.');
        }

        // Vérifier que le véhicule appartient bien à l'utilisateur connecté
        if (vehicle.userId.toString() !== req.user.id) {
            return errorResponse(res, 401, 'Non autorisé à accéder à ce véhicule.');
        }

        return res.status(200).json(vehicle);

    } catch (err) {
        return handleError(err, res, 'Erreur serveur');
    }
};
// @route   PUT /api/vehicles/:id
// @route   PUT /api/vehicles/:id
// @desc    Mettre à jour un véhicule existant (pour l'utilisateur connecté)
// @access  Private
exports.updateVehicle = async (req, res) => {
    let { brand, model, plate, energy, seats } = req.body;

    try {
        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return errorResponse(res, 404, 'Véhicule non trouvé.');
        }

        // Vérifier que le véhicule appartient bien à l'utilisateur connecté
        if (vehicle.userId.toString() !== req.user.id) {
            return errorResponse(res, 401, 'Non autorisé à modifier ce véhicule.');
        }

        // Vérifier l'unicité de la plaque si elle est modifiée et différente de l'ancienne
        if (plate && normalizePlate(plate) !== vehicle.plate) {
            const newPlate = normalizePlate(plate);
            const existingVehicleWithNewPlate = await Vehicle.findOne({ userId: req.user.id, plate: newPlate });
            if (existingVehicleWithNewPlate) {
                return errorResponse(res, 400, 'Vous avez déjà un autre véhicule avec cette immatriculation.');
            }
        }
        
        // Construire l'objet du champ à mettre à jour
        const vehicleFields = {};
        if (brand) vehicleFields.brand = sanitizeString(brand);
        if (model) vehicleFields.model = sanitizeString(model);
        if (plate) vehicleFields.plate = normalizePlate(plate);
        if (energy) vehicleFields.energy = sanitizeString(energy);
        if (seats) vehicleFields.seats = Number.parseInt(seats, 10);
        
        vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { $set: vehicleFields },
            { new: true }
        );

        return successResponse(res, 200, 'Véhicule mis à jour avec succès.', { vehicle });

    } catch (err) {
        return handleError(err, res, 'Erreur serveur');
    }
};

// @route   DELETE /api/vehicles/:id
// @desc    Supprimer un véhicule (pour l'utilisateur connecté)
// @access  Private
exports.deleteVehicle = async (req, res) => {
    try {
        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return errorResponse(res, 404, 'Véhicule non trouvé.');
        }

        // Vérifier que le véhicule appartient bien à l'utilisateur connecté
        if (vehicle.userId.toString() !== req.user.id) {
            return errorResponse(res, 401, 'Non autorisé à supprimer ce véhicule.');
        }

        await Vehicle.findByIdAndDelete(req.params.id);

        return successResponse(res, 200, 'Véhicule supprimé avec succès.');

    } catch (err) {
        return handleError(err, res, 'Erreur serveur');
    }
};