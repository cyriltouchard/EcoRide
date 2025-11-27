const Vehicle = require('../models/vehicleModel');
const User = require('../models/userModel'); // Pas directement utilisé ici mais utile pour d'autres contrôleurs

// Helper to sanitize user-controlled strings before using in DB queries
const sanitizeString = (s) => (typeof s === 'string' ? s.trim() : '');
const normalizePlate = (p) => {
    const plate = sanitizeString(p).toUpperCase();
    // Limit length to reasonable size to avoid abusive input
    return plate.length > 20 ? plate.slice(0, 20) : plate;
};

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
            return res.status(400).json({ msg: 'Veuillez remplir tous les champs obligatoires.' });
        }
        const existingVehicle = await Vehicle.findOne({ userId, plate });
        if (existingVehicle) {
            return res.status(400).json({ msg: 'Vous avez déjà enregistré un véhicule avec cette immatriculation.' });
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
        res.status(201).json({ msg: 'Véhicule ajouté avec succès.', vehicle: newVehicle });

    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        res.status(500).send('Erreur serveur');
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
            return res.status(200).json({ msg: 'Aucun véhicule enregistré pour cet utilisateur.', vehicles: [] });
        }

        res.status(200).json({ msg: 'Véhicules récupérés avec succès.', vehicles });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// @route   GET /api/vehicles/:id
// @desc    Obtenir un véhicule par son ID (pour l'utilisateur connecté)
// @access  Private
exports.getVehicleById = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ msg: 'Véhicule non trouvé.' });
        }

        // Vérifier que le véhicule appartient bien à l'utilisateur connecté
        if (vehicle.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Non autorisé à accéder à ce véhicule.' });
        }

        res.status(200).json(vehicle); // Retourne directement l'objet véhicule

    } catch (err) {
        console.error(err.message);
        // Gérer le cas où l'ID n'est pas un ObjectId valide
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Véhicule non trouvé.' });
        }
        res.status(500).send('Erreur serveur');
    }
};

// @route   PUT /api/vehicles/:id
// @desc    Mettre à jour un véhicule existant (pour l'utilisateur connecté)
// @access  Private
exports.updateVehicle = async (req, res) => {
    let { brand, model, plate, energy, seats } = req.body;
    // Construire l'objet du champ à mettre à jour
    const vehicleFields = {};
    if (brand) vehicleFields.brand = sanitizeString(brand);
    if (model) vehicleFields.model = sanitizeString(model);
    if (plate) vehicleFields.plate = normalizePlate(plate); // Assurer majuscules et longueur limitée
    if (energy) vehicleFields.energy = sanitizeString(energy);
    if (seats) vehicleFields.seats = Number.parseInt(seats, 10);

    try {
        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ msg: 'Véhicule non trouvé.' });
        }

        // Vérifier que le véhicule appartient bien à l'utilisateur connecté
        if (vehicle.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Non autorisé à modifier ce véhicule.' });
        }

        // Vérifier l'unicité de la plaque si elle est modifiée et différente de l'ancienne
        if (plate && normalizePlate(plate) !== vehicle.plate) {
            const newPlate = normalizePlate(plate);
            const existingVehicleWithNewPlate = await Vehicle.findOne({ userId: req.user.id, plate: newPlate });
            if (existingVehicleWithNewPlate) {
                return res.status(400).json({ msg: 'Vous avez déjà un autre véhicule avec cette immatriculation.' });
            }
        }
        
        vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { $set: vehicleFields },
            { new: true } // Renvoie le document mis à jour
        );

        res.status(200).json({ msg: 'Véhicule mis à jour avec succès.', vehicle });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Véhicule non trouvé.' });
        }
        res.status(500).send('Erreur serveur');
    }
};

// @route   DELETE /api/vehicles/:id
// @desc    Supprimer un véhicule (pour l'utilisateur connecté)
// @access  Private
exports.deleteVehicle = async (req, res) => {
    try {
        let vehicle = await Vehicle.findById(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ msg: 'Véhicule non trouvé.' });
        }

        // Vérifier que le véhicule appartient bien à l'utilisateur connecté
        if (vehicle.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Non autorisé à supprimer ce véhicule.' });
        }

        await Vehicle.findByIdAndDelete(req.params.id);

        res.status(200).json({ msg: 'Véhicule supprimé avec succès.' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Véhicule non trouvé.' });
        }
        res.status(500).send('Erreur serveur');
    }
};