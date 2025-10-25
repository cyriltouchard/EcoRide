const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence au modèle User
        required: true
    },
    brand: {
        type: String,
        required: [true, "La marque du véhicule est requise."],
        trim: true
        // Vous pouvez ajouter une longueur min/max si vous le souhaitez
    },
    model: {
        type: String,
        required: [true, "Le modèle du véhicule est requis."],
        trim: true
    },
    plate: {
        type: String,
        required: [true, "L'immatriculation du véhicule est requise."],
        unique: false, // L'immatriculation est unique PAR UTILISATEUR, pas globalement.
                        // Nous gèrerons l'unicité par utilisateur dans le contrôleur.
        trim: true,
        uppercase: true // Convertit l'immatriculation en majuscules
    },
    energy: {
        type: String,
        required: [true, "Le type d'énergie est requis."],
        enum: ['Essence', 'Diesel', 'Électrique', 'Hybride', 'GPL'], // Liste des valeurs permises
        trim: true
    },
    seats: {
        type: Number,
        required: [true, "Le nombre de places est requis."],
        min: [1, "Le véhicule doit avoir au moins 1 place (hors conducteur)."],
        max: [8, "Le nombre de places ne peut pas dépasser 8 pour un covoiturage standard."]
    }
}, {
    timestamps: true // Ajoute createdAt et updatedAt automatiquement
});

// Middleware Mongoose pour s'assurer que l'immatriculation est unique par utilisateur
// Ce n'est pas un index unique direct dans la DB car on veut qu'elle soit unique par user, pas global.
// (Alternative: créer un index composé unique { userId: 1, plate: 1 } directement sur le schema)
// Pour l'instant, on laisse le check dans le contrôleur.

module.exports = mongoose.model('Vehicle', VehicleSchema);