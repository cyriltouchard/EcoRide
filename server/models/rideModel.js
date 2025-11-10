const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Le véhicule doit être une référence à un modèle Vehicle, pas un objet imbriqué
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },

    departure: { type: String, required: true },
    arrival: { type: String, required: true },
    departureDate: { type: Date, required: true },
    departureTime: { type: String, required: true }, // Format "HH:MM"
    price: { type: Number, required: true, min: 0 },
    
    totalSeats: { type: Number, required: true, min: 1 }, // Capacité totale du trajet
    availableSeats: { type: Number, required: true, min: 0 }, // Places restantes

    description: { type: String }, // Optionnel
    isEcologic: { type: Boolean, default: false }, // Optionnel
    stops: [{ type: String }], // Tableau de points d'arrêt (villes, lieux)

    passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Tableau des IDs des passagers

    status: { type: String, enum: ['scheduled', 'started', 'completed', 'cancelled'], default: 'scheduled' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now } // Ajouté pour le suivi des modifications
});

// Middleware pour mettre à jour 'updatedAt'
rideSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Ride', rideSchema);