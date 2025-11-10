const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { testConnection } = require('./config/db-mysql'); // Connexion MySQL
const cors = require('cors');
const helmet = require('helmet'); // Sécurité HTTP

// Nouveaux middleware améliorés
const { requestLogger, errorLogger } = require('./middleware/logger');
const { generalLimiter } = require('./middleware/security');

// Charger les variables d'environnement
dotenv.config();

// Connecter aux bases de données (hybride NoSQL + SQL)
connectDB(); // MongoDB (NoSQL)
testConnection(); // MySQL (Relationnel)

const app = express();

// Middleware de logging
app.use(requestLogger);

// Middleware de sécurité
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting global
app.use(generalLimiter);

// Middleware CORS sécurisé
const corsOptions = {
    origin: function (origin, callback) {
        // Autorise les requêtes sans origine (mobile apps, etc.) et les origines autorisées
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'http://localhost:5500',
            'http://localhost:5501',
            'http://localhost:5502',
            'http://127.0.0.1:5500',
            'http://127.0.0.1:5501',
            'http://127.0.0.1:5502',
            'https://ecoride.fr' // Votre domaine de production
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Gérer explicitement les requêtes OPTIONS (preflight)
app.options('*', cors(corsOptions));


// Middleware pour parser le JSON
app.use(express.json());

// Servir les fichiers statiques du front-end
// Le dossier 'public' est à la racine du projet, donc on remonte d'un niveau
app.use(express.static('../public'));

// Routes
// Une route de base pour vérifier que l'API est fonctionnelle.
// Vous pouvez également laisser le front-end servir la page d'accueil.
// app.get('/', (req, res) => {
//     res.send('API EcoRide est fonctionnelle !');
// });


// Routes utilisateurs
app.use('/api/users', require('./routes/userRoutes'));

// Routes véhicules
app.use('/api/vehicles', require('./routes/vehicleRoutes'));

// Routes pour les covoiturages (RIDES)
app.use('/api/rides', require('./routes/rideRoutes'));

// Routes système de crédits
app.use('/api/credits', require('./routes/creditRoutes'));

// Routes avis et notations
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Routes de contact
app.use('/api/contact', require('./routes/contactRoutes'));

// Routes de santé et monitoring
app.use('/api', require('./routes/healthRoutes'));

// Gérer les routes non trouvées (middleware après toutes les routes définies)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée',
        path: req.originalUrl
    });
});

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorLogger);

// Gestionnaire d'erreurs global (à affiner pour la production)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Quelque chose s\'est mal passé !');
});


const PORT = process.env.PORT || 3002;

app.listen(PORT, () => console.log(`Serveur EcoRide démarré sur le port ${PORT}`));