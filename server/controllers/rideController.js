// controllers/rideController.js
const Ride = require('../models/rideModel');
const Vehicle = require('../models/vehicleModel');
const User = require('../models/userModel');

// @route   POST /api/rides
// @desc    Proposer un nouveau covoiturage
// @access  Private
const createRide = async (req, res) => { // <-- CHANGEMENT ICI: 'const createRide =' au lieu de 'exports.createRide ='
    const { departure, arrival, departureDate, departureTime, price, availableSeats, vehicleId, description, isEcologic, stops } = req.body;
    const driverId = req.user.id; // L'ID du conducteur vient du token

    try {
        // ... (votre logique createRide reste la même) ...
        // 1. Valider les champs essentiels
        if (!departure || !arrival || !departureDate || !departureTime || !price || !availableSeats || !vehicleId) {
            return res.status(400).json({ msg: 'Veuillez remplir tous les champs obligatoires du trajet.' });
        }

        // 2. Vérifier que le véhicule existe et appartient bien au conducteur
        const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: driverId });
        if (!vehicle) {
            return res.status(404).json({ msg: 'Véhicule non trouvé ou n\'appartient pas à cet utilisateur.' });
        }

        // 3. Assurer que availableSeats ne dépasse pas la capacité du véhicule
        if (availableSeats > vehicle.seats) {
            return res.status(400).json({ msg: `Le nombre de places disponibles (${availableSeats}) ne peut excéder la capacité du véhicule (${vehicle.seats}).` });
        }

        // 4. Créer le nouveau trajet
        const newRide = new Ride({
            driver: driverId,
            vehicle: vehicleId,
            departure,
            arrival,
            departureDate: new Date(departureDate),
            departureTime,
            price,
            totalSeats: availableSeats,
            availableSeats,
            description,
            isEcologic,
            stops: stops || [],
            status: 'scheduled'
        });

        // 5. Sauvegarder le trajet
        await newRide.save();

        res.status(201).json({ msg: 'Covoiturage proposé avec succès.', ride: newRide });

    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            return res.status(400).json({ msg: errors.join(', ') });
        }
        res.status(500).send('Erreur serveur');
    }
};

// @route   GET /api/rides
// @desc    Obtenir tous les covoiturages disponibles (pour la page de recherche)
// @access  Public (ou Private si vous voulez que seuls les connectés voient)
const getAllRides = async (req, res) => { // <-- CHANGEMENT ICI
    try {
        const rides = await Ride.find({ status: 'scheduled', availableSeats: { $gt: 0 } })
            .populate('driver', 'pseudo email')
            .populate('vehicle', 'brand model plate');
        
        res.status(200).json({ msg: 'Liste des covoiturages.', rides });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// @route   GET /api/rides/search
// @desc    Rechercher des covoiturages avec des critères
// @access  Public
const searchRides = async (req, res) => { // <-- CHANGEMENT ICI
    try {
        const { departure, arrival, date, seats } = req.query;
        let query = {};

        // Security: do not build RegExp directly from user input (ReDoS risk).
        // Escape regex metacharacters and limit the input length.
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
        const normalizeSearchInput = (s) => {
            if (typeof s !== 'string') return null;
            const trimmed = s.trim();
            if (trimmed.length === 0) return null;
            // Limit length to avoid extremely long patterns (ReDoS / performance)
            const maxLen = 100;
            return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
        };

        const depSafe = normalizeSearchInput(departure);
        if (depSafe) {
            const escaped = escapeRegex(depSafe);
            // Use anchored / substring match via $regex with escaped pattern
            query.departure = { $regex: escaped, $options: 'i' };
        }

        const arrSafe = normalizeSearchInput(arrival);
        if (arrSafe) {
            const escaped = escapeRegex(arrSafe);
            query.arrival = { $regex: escaped, $options: 'i' };
        }
        if (date) {
            const searchDate = new Date(date);
            if (isNaN(searchDate)) {
                return res.status(400).json({ msg: 'Format de date invalide.' });
            }
            const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
            const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1);
            query.departureDate = {
                $gte: startOfDay,
                $lt: endOfDay
            };
        }
        if (seats) {
            query.availableSeats = { $gte: parseInt(seats, 10) };
        }

        const now = new Date();
        if (!query.departureDate) {
            query.departureDate = { $gte: now };
        } else {
            if (query.departureDate.$gte && query.departureDate.$gte < now) {
                query.departureDate.$gte = now;
            }
        }

        query.status = { $ne: 'cancelled' };

        const rides = await Ride.find(query)
                                .populate('driver', 'pseudo')
                                .populate('vehicle', 'brand model plate energy seats')
                                .sort({ departureDate: 1, departureTime: 1 });

        if (rides.length === 0) {
            return res.status(200).json({ msg: 'Aucun covoiturage trouvé pour ces critères.', rides: [] });
        }

        res.json({ msg: 'Covoiturages trouvés', rides });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur Serveur');
    }
};

// @route   GET /api/rides/offered
// @desc    Obtenir les covoiturages proposés par l'utilisateur connecté
// @access  Private
const getOfferedRides = async (req, res) => { // <-- CHANGEMENT ICI
    try {
        const driverId = req.user.id;
        const rides = await Ride.find({ driver: driverId })
                                .populate('vehicle', 'brand model plate')
                                .populate('passengers', 'pseudo');
        
        if (!rides || rides.length === 0) {
            return res.status(200).json({ msg: 'Vous n\'avez pas encore proposé de trajets.', rides: [] });
        }
        res.status(200).json({ msg: 'Trajets proposés récupérés avec succès.', rides });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// @route   GET /api/rides/booked
// @desc    Obtenir les covoiturages réservés par l'utilisateur connecté
// @access  Private
const getBookedRides = async (req, res) => { // <-- CHANGEMENT ICI
    try {
        const userId = req.user.id;
        const rides = await Ride.find({ passengers: userId })
                                .populate('driver', 'pseudo email')
                                .populate('vehicle', 'brand model');
        
        if (!rides || rides.length === 0) {
            return res.status(200).json({ msg: 'Vous n\'avez pas encore de réservations.', rides: [] });
        }
        res.status(200).json({ msg: 'Trajets réservés récupérés avec succès.', rides });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erreur serveur');
    }
};

// @route   DELETE /api/rides/:id
// @desc    Annuler un trajet proposé par l'utilisateur (ou annuler sa réservation si passager)
// @access  Private
const cancelRide = async (req, res) => { // <-- CHANGEMENT ICI
    try {
        const rideId = req.params.id;
        const userId = req.user.id;

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ msg: 'Trajet non trouvé.' });
        }

        if (ride.driver.toString() === userId) {
            if (ride.status === 'scheduled') {
                ride.status = 'cancelled';
                await ride.save();
                return res.status(200).json({ msg: 'Trajet annulé avec succès (en tant que conducteur).', ride });
            } else {
                return res.status(400).json({ msg: 'Seuls les trajets "scheduled" peuvent être annulés par le conducteur.' });
            }
        } 
        else if (ride.passengers.includes(userId)) {
            if (ride.status === 'scheduled') {
                ride.passengers = ride.passengers.filter(pId => pId.toString() !== userId);
                ride.availableSeats += 1;
                await ride.save();
                return res.status(200).json({ msg: 'Votre réservation a été annulée avec succès.', ride });
            } else {
                return res.status(400).json({ msg: 'Seules les réservations sur des trajets "scheduled" peuvent être annulées.' });
            }
        }
        else {
            return res.status(401).json({ msg: 'Non autorisé à annuler ce trajet ou cette réservation.' });
        }

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Trajet non trouvé.' });
        }
        res.status(500).send('Erreur serveur');
    }
};

// @route   POST /api/rides/:id/book
// @desc    Réserver une place dans un covoiturage
// @access  Private
const bookRide = async (req, res) => { // <-- CHANGEMENT ICI
    try {
        const rideId = req.params.id;
        const userId = req.user.id;
        const { seatsToBook } = req.body;

        if (!seatsToBook || seatsToBook < 1) {
            return res.status(400).json({ msg: 'Veuillez spécifier un nombre de places valide à réserver (au moins 1).' });
        }

        const ride = await Ride.findById(rideId);

        if (!ride) {
            return res.status(404).json({ msg: 'Trajet non trouvé.' });
        }

        if (ride.driver.toString() === userId) {
            return res.status(400).json({ msg: 'Vous ne pouvez pas réserver une place sur votre propre trajet.' });
        }

        if (ride.passengers.includes(userId)) {
            return res.status(400).json({ msg: 'Vous avez déjà réservé une place sur ce trajet.' });
        }

        if (ride.status !== 'scheduled') {
            return res.status(400).json({ msg: 'Ce trajet n\'est pas disponible pour la réservation.' });
        }

        if (ride.availableSeats < seatsToBook) {
            return res.status(400).json({ msg: `Il ne reste pas assez de places. Seulement ${ride.availableSeats} disponibles.` });
        }

        // Débiter les crédits de l'utilisateur (à implémenter)
        // const user = await User.findById(userId);
        // if (user.credits < ride.price * seatsToBook) {
        //     return res.status(400).json({ msg: 'Crédits insuffisants pour cette réservation.' });
        // }
        // user.credits -= ride.price * seatsToBook;
        // await user.save();

        ride.passengers.push(userId);
        ride.availableSeats -= seatsToBook;
        await ride.save();

        res.status(200).json({ msg: 'Réservation effectuée avec succès !', ride });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Trajet non trouvé.' });
        }
        res.status(500).send('Erreur serveur');
    }
};

// @route   GET /api/rides/:id
// @desc    Obtenir les détails d'un trajet spécifique
// @access  Public (ou Private si vous voulez restreindre l'accès aux détails)
const getRideById = async (req, res) => { // <-- CHANGEMENT ICI
    try {
        const ride = await Ride.findById(req.params.id)
            .populate('driver', 'pseudo email')
            .populate('vehicle', 'brand model plate')
            .populate('passengers', 'pseudo email');

        if (!ride) {
            return res.status(404).json({ msg: 'Trajet non trouvé.' });
        }
        res.status(200).json(ride);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Trajet non trouvé.' });
        }
        res.status(500).send('Erreur serveur');
    }
};

// Exportez toutes les fonctions pour qu'elles soient accessibles par le routeur
module.exports = {
    createRide,
    getAllRides,
    searchRides,
    getOfferedRides,
    getBookedRides,
    cancelRide,
    bookRide,
    getRideById
};