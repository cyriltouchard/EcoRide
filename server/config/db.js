const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Charge les variables d'environnement

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connexion à MongoDB réussie ! Hôte: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Erreur de connexion à MongoDB: ${error.message}`);
        process.exit(1); // Arrête le processus en cas d'échec
    }
};

module.exports = connectDB;