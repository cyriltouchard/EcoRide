// server/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    pseudo: {
        type: String,
        required: [true, "Le pseudo est obligatoire."],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "L'adresse e-mail est obligatoire."],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est obligatoire."],
        minlength: [8, "Le mot de passe doit faire au moins 8 caractères."]
    },
    credits: {
        type: Number,
        default: 20.0
    },
    // La ligne à ajouter est ici :
    vehicles: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vehicle' 
    }],
    role: {
        type: String,
        enum: ['passager', 'chauffeur', 'chauffeur_passager', 'employe', 'admin'],
        default: 'passager'
    }
}, { timestamps: true });

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', userSchema);