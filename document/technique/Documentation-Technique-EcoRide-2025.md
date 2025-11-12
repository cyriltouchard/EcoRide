# 📚 **DOCUMENTATION TECHNIQUE ECORIDE 2025**

*Version 2.0 - Mise à jour complète du 3 octobre 2025*  
*Auteur: Touchard Cyril*

---

## 📋 **TABLE DES MATIÈRES**

1. [Introduction](#introduction)
2. [Architecture Générale](#architecture)
3. [Technologies Utilisées](#technologies)
4. [Structure du Code](#structure)
5. [Sécurité](#securite)
6. [Base de Données](#database)
7. [API REST](#api)
8. [Monitoring et Logging](#monitoring)
9. [Performance](#performance)
10. [Déploiement](#deploiement)
11. [Maintenance](#maintenance)

---

## 🎯 **1. INTRODUCTION** {#introduction}

### **Objectif du Projet**
EcoRide est une plateforme de covoiturage écologique qui facilite le partage de trajets tout en promouvant des pratiques durables. L'application connecte chauffeurs et passagers dans une interface moderne et sécurisée.

### **Vision Technique**
- **Architecture moderne** : Client-serveur avec API REST
- **Sécurité renforcée** : JWT, bcrypt, rate limiting
- **Performance optimisée** : Cache, monitoring, logging
- **Évolutivité** : Structure modulaire et maintenable

### **Caractéristiques Principales**
- Inscription et authentification sécurisées
- Gestion de véhicules et trajets
- Système de réservation en temps réel
- Évaluations et avis modérés
- Interface responsive et accessible

---

## 🏗️ **2. ARCHITECTURE GÉNÉRALE** {#architecture}

### **2.1 Vue d'Ensemble**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLIENT TIER   │    │ APPLICATION     │    │   DATA TIER     │
│                 │    │     TIER        │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ HTML5/CSS3  │ │◄──►│ │ Node.js     │ │◄──►│ │ MongoDB     │ │
│ │ JavaScript  │ │    │ │ Express.js  │ │    │ │ NoSQL       │ │
│ │ Responsive  │ │    │ │ JWT Auth    │ │    │ └─────────────┘ │
│ └─────────────┘ │    │ │ Rate Limit  │ │    │ ┌─────────────┐ │
│                 │    │ └─────────────┘ │    │ │ MySQL       │ │
│                 │    │                 │    │ │ Relationnel │ │
│                 │    │                 │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **2.2 Flux de Communication**

1. **Client → Serveur** : Requêtes HTTP/HTTPS via fetch API
2. **Authentification** : Middleware JWT pour sécuriser les routes
3. **Validation** : Express-validator pour contrôler les données
4. **Logique Métier** : Contrôleurs séparés par domaine
5. **Persistance** : Base de données hybride MongoDB + MySQL

### **2.3 Avantages Architecture**
- **Séparation des responsabilités** claire
- **Évolutivité** horizontale et verticale
- **Maintenabilité** avec structure modulaire
- **Sécurité** par couches successives

---

## 💻 **3. TECHNOLOGIES UTILISÉES** {#technologies}

### **3.1 Frontend (Client)**

| Technologie | Version | Justification |
|-------------|---------|---------------|
| **HTML5** | Standard | Structure sémantique, accessibilité |
| **CSS3** | Standard | Design responsive, animations fluides |
| **JavaScript** | ES6+ | Interactivité moderne, fetch API |
| **Polices** | Google Fonts | Poppins (titres) + Roboto (texte) |
| **Icônes** | Font Awesome 6 | Cohérence visuelle, performance |

#### **Caractéristiques Frontend**
- **Design Responsive** : Mobile-first avec breakpoints
- **Progressive Enhancement** : Fonctionnel sans JavaScript
- **Accessibilité** : WCAG 2.1 compliance
- **Performance** : Chargement lazy, optimisations CSS

### **3.2 Backend (Serveur)**

| Technologie | Version | Justification |
|-------------|---------|---------------|
| **Node.js** | 18+ | Performance, écosystème npm |
| **Express.js** | 4.18+ | Framework léger, flexible |
| **JWT** | 9.0+ | Authentification stateless |
| **bcryptjs** | 2.4+ | Hachage sécurisé des mots de passe |
| **Helmet** | 7.2+ | Sécurité HTTP headers |
| **CORS** | 2.8+ | Gestion cross-origin |
| **Express-validator** | 7.2+ | Validation robuste des données |
| **Express-rate-limit** | 8.1+ | Protection contre les abus |

#### **Architecture Backend**
```
Express.js Application
├── Middleware Stack
│   ├── Logging (Winston)
│   ├── Security (Helmet + CORS)
│   ├── Rate Limiting
│   ├── Authentication (JWT)
│   └── Validation (Express-validator)
├── Controllers
│   ├── UserController
│   ├── VehicleController
│   ├── RideController
│   └── ReviewController
├── Models
│   ├── Mongoose (MongoDB)
│   └── MySQL Queries
└── Routes
    ├── /api/users
    ├── /api/vehicles
    ├── /api/rides
    └── /api/health
```

### **3.3 Base de Données**

#### **MongoDB (NoSQL)**
- **Version** : 7.0+
- **ODM** : Mongoose 8.0+
- **Usage** : Données flexibles (profils, préférences, logs)
- **Avantages** : Schémas évolutifs, performance lectures

#### **MySQL (SQL)**
- **Version** : 8.0+
- **Driver** : mysql2 3.15+
- **Usage** : Données transactionnelles (crédits, réservations)
- **Avantages** : ACID, intégrité référentielle

---

## 📁 **4. STRUCTURE DU CODE** {#structure}

### **4.1 Organisation Générale**

```
ecoride/
├── public/                      # Frontend statique
│   ├── css/
│   │   ├── style.css           # Styles principaux avec variables CSS
│   │   └── performance.css     # Optimisations performance
│   ├── js/
│   │   ├── script.js           # Logique frontend principale
│   │   └── performance.js      # Monitoring frontend
│   ├── images/                 # Assets visuels
│   └── videos/                 # Contenus multimédias
├── server/                      # Backend Node.js
│   ├── server.js               # Point d'entrée application
│   ├── package.json            # Dépendances et scripts
│   ├── .env                    # Variables d'environnement
│   ├── config/
│   │   ├── db.js              # Configuration MongoDB
│   │   └── db-mysql.js        # Configuration MySQL
│   ├── controllers/           # Logique métier
│   │   ├── userController.js
│   │   ├── vehicleController.js
│   │   ├── rideController.js
│   │   └── reviewController.js
│   ├── models/                # Schémas données
│   │   ├── userModel.js
│   │   ├── vehicleModel.js
│   │   ├── rideModel.js
│   │   └── reviewModel.js
│   ├── routes/                # Points d'entrée API
│   │   ├── userRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── rideRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── healthRoutes.js
│   ├── middleware/            # Fonctions intermédiaires
│   │   ├── auth.js            # Authentification JWT
│   │   ├── security.js        # Rate limiting + Helmet
│   │   └── logger.js          # Logging système
│   └── logs/                  # Fichiers de logs quotidiens
└── document/                   # Documentation
    ├── Charte-Graphique-EcoRide-2025.md
    ├── Diagrammes-UML-EcoRide-2025.md
    └── Documentation-Technique-EcoRide-2025.md
```

### **4.2 Modèles de Données**

#### **User Model (MongoDB)**
```javascript
{
  _id: ObjectId,
  pseudo: String (unique),
  email: String (unique),
  password: String (hashed),
  credits: Number (default: 20),
  role: String (enum: ['passager', 'chauffeur', 'employe', 'admin']),
  vehicles: [ObjectId] (références Vehicle),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Vehicle Model (MongoDB)**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (référence User),
  brand: String,
  model: String,
  plate: String,
  energy: String (enum: ['Essence', 'Diesel', 'Électrique', 'Hybride']),
  seats: Number (min: 1, max: 8),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Ride Model (MongoDB)**
```javascript
{
  _id: ObjectId,
  driver: ObjectId (référence User),
  vehicle: ObjectId (référence Vehicle),
  departure: String,
  arrival: String,
  departureDate: Date,
  departureTime: String,
  price: Number,
  totalSeats: Number,
  availableSeats: Number,
  passengers: [ObjectId] (références User),
  status: String (enum: ['scheduled', 'started', 'completed', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 **5. SÉCURITÉ** {#securite}

### **5.1 Authentification et Autorisation**

#### **JWT (JSON Web Tokens)**
```javascript
// Génération du token
const token = jwt.sign(
  { 
    id: user.id, 
    pseudo: user.pseudo, 
    user_type: user.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Middleware de vérification
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Token manquant' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalide' });
  }
};
```

#### **Hachage des Mots de Passe**
```javascript
// Middleware Mongoose pour le hachage
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Vérification lors de la connexion
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### **5.2 Protection des Routes**

#### **Rate Limiting**
```javascript
// Limitation globale
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: 'Trop de requêtes, réessayez plus tard'
});

// Limitation spécifique à la connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentatives de connexion
  skipSuccessfulRequests: true
});
```

#### **Helmet.js - Sécurité HTTP**
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

### **5.3 Validation des Données**

#### **Express-Validator**
```javascript
// Validation inscription utilisateur
const registerValidation = [
  body('pseudo')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Pseudo invalide'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mot de passe trop faible')
];
```

### **5.4 CORS Sécurisé**
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5500',
      'https://ecoride.fr'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS non autorisé'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
```

---

## 🗃️ **6. BASE DE DONNÉES** {#database}

### **6.1 Architecture Hybride**

#### **Stratégie de Répartition**
| Type de Données | Base | Justification |
|------------------|------|---------------|
| **Profils utilisateurs** | MongoDB | Flexibilité schéma, évolution |
| **Véhicules** | MongoDB | Données semi-structurées |
| **Trajets** | MongoDB | Requêtes complexes, géolocalisation |
| **Crédits/Transactions** | MySQL | ACID, intégrité financière |
| **Audit/Logs** | MongoDB | Volume élevé, structure variable |

### **6.2 Configuration MongoDB**

#### **Connexion et Configuration**
```javascript
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Connexion MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error.message);
    process.exit(1);
  }
};
```

#### **Indexation pour Performance**
```javascript
// Indexes pour optimiser les requêtes
userSchema.index({ email: 1 });
userSchema.index({ pseudo: 1 });
rideSchema.index({ departure: 1, arrival: 1 });
rideSchema.index({ departureDate: 1 });
rideSchema.index({ driver: 1 });
```

### **6.3 Configuration MySQL**

#### **Connexion et Pool**
```javascript
// config/db-mysql.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});
```

#### **Schéma Transactionnel**
```sql
-- Table des transactions de crédits
CREATE TABLE credit_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(24) NOT NULL,
  ride_id VARCHAR(24),
  amount DECIMAL(10,2) NOT NULL,
  transaction_type ENUM('credit', 'debit', 'refund') NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vue pour le profil utilisateur
CREATE OR REPLACE VIEW v_user_profile AS
SELECT 
  u.id,
  u.pseudo,
  u.email,
  u.credits,
  COUNT(DISTINCT v.id) as vehicle_count,
  COUNT(DISTINCT r.id) as ride_count
FROM users u
LEFT JOIN vehicles v ON u.id = v.user_id
LEFT JOIN rides r ON u.id = r.driver_id
GROUP BY u.id;
```

---

## 🔌 **7. API REST** {#api}

### **7.1 Architecture API**

#### **Structure des Routes**
```
/api/
├── /auth
│   ├── POST /register       # Inscription
│   └── POST /login          # Connexion
├── /users
│   ├── GET /profile         # Profil utilisateur
│   ├── PUT /profile         # Mise à jour profil
│   └── GET /history         # Historique trajets
├── /vehicles
│   ├── GET /                # Liste véhicules utilisateur
│   ├── POST /               # Ajouter véhicule
│   ├── PUT /:id             # Modifier véhicule
│   └── DELETE /:id          # Supprimer véhicule
├── /rides
│   ├── GET /                # Rechercher trajets
│   ├── POST /               # Proposer trajet
│   ├── GET /:id             # Détails trajet
│   ├── POST /:id/join       # Rejoindre trajet
│   └── DELETE /:id/leave    # Quitter trajet
├── /reviews
│   ├── POST /               # Créer avis
│   ├── GET /driver/:id      # Avis d'un chauffeur
│   └── PUT /:id/moderate    # Modérer avis (employé)
└── /health
    ├── GET /health          # État système
    ├── GET /metrics         # Métriques détaillées
    └── GET /ping            # Test connectivité
```

### **7.2 Standards de Réponse**

#### **Format Standard**
```javascript
// Succès
{
  "success": true,
  "message": "Opération réussie",
  "data": { ... },
  "timestamp": "2025-10-03T10:30:00Z"
}

// Erreur
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": [...],
  "timestamp": "2025-10-03T10:30:00Z"
}
```

#### **Codes de Statut HTTP**
| Code | Signification | Usage |
|------|---------------|-------|
| **200** | OK | Opération réussie |
| **201** | Created | Ressource créée |
| **400** | Bad Request | Données invalides |
| **401** | Unauthorized | Authentification requise |
| **403** | Forbidden | Autorisation insuffisante |
| **404** | Not Found | Ressource introuvable |
| **429** | Too Many Requests | Rate limit dépassé |
| **500** | Internal Server Error | Erreur serveur |

### **7.3 Middleware Pipeline**

```javascript
// Pipeline de traitement des requêtes
app.use(requestLogger);           // 1. Logging
app.use(helmet());               // 2. Sécurité headers
app.use(generalLimiter);         // 3. Rate limiting
app.use(cors(corsOptions));      // 4. CORS
app.use(express.json());         // 5. Parsing JSON
app.use(authenticateToken);      // 6. Authentification (routes protégées)
app.use(validateInput);          // 7. Validation données
app.use(errorLogger);            // 8. Gestion erreurs
```

---

## 📊 **8. MONITORING ET LOGGING** {#monitoring}

### **8.1 Système de Logging**

#### **Configuration Winston**
```javascript
// middleware/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Log des requêtes
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};
```

### **8.2 Health Checks**

#### **Route de Santé Système**
```javascript
// routes/healthRoutes.js
router.get('/health', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {}
    };

    // Test MongoDB
    if (mongoose.connection.readyState === 1) {
      healthCheck.services.mongodb = 'OK';
    } else {
      healthCheck.services.mongodb = 'ERROR';
      healthCheck.status = 'DEGRADED';
    }

    // Test MySQL
    try {
      const connection = await mysql.createConnection(dbConfig);
      await connection.ping();
      await connection.end();
      healthCheck.services.mysql = 'OK';
    } catch (error) {
      healthCheck.services.mysql = 'ERROR';
      healthCheck.status = 'DEGRADED';
    }

    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});
```

### **8.3 Métriques de Performance**

#### **Monitoring Frontend**
```javascript
// public/js/performance.js
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  measurePageLoad() {
    const navigation = performance.getEntriesByType('navigation')[0];
    this.metrics.pageLoad = {
      domContentLoaded: navigation.domContentLoadedEventEnd,
      loadComplete: navigation.loadEventEnd,
      totalTime: navigation.loadEventEnd - navigation.fetchStart
    };
  }

  trackAPICall(url, startTime) {
    const duration = Date.now() - startTime;
    if (!this.metrics.api) this.metrics.api = [];
    
    this.metrics.api.push({
      url,
      duration,
      timestamp: new Date().toISOString()
    });

    if (duration > 2000) {
      console.warn(`API lente détectée: ${url} (${duration}ms)`);
    }
  }
}
```

---

## ⚡ **9. PERFORMANCE** {#performance}

### **9.1 Optimisations Backend**

#### **Cache et Mémoire**
```javascript
// Configuration cache Redis (optionnel)
const redis = require('redis');
const client = redis.createClient();

// Cache des requêtes fréquentes
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.sendResponse = res.json;
      res.json = (body) => {
        client.setex(key, duration, JSON.stringify(body));
        res.sendResponse(body);
      };
      
      next();
    } catch (error) {
      next();
    }
  };
};
```

#### **Optimisation Base de Données**
```javascript
// Pagination efficace
const getPaginatedRides = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  return await Ride.find({ status: 'scheduled' })
    .populate('driver', 'pseudo')
    .populate('vehicle', 'brand model')
    .sort({ departureDate: 1 })
    .skip(skip)
    .limit(limit)
    .lean(); // Améliore performance
};

// Agrégation pour statistiques
const getUserStats = async (userId) => {
  return await Ride.aggregate([
    { $match: { driver: userId } },
    { $group: {
        _id: null,
        totalRides: { $sum: 1 },
        totalEarnings: { $sum: '$price' },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
};
```

### **9.2 Optimisations Frontend**

#### **Chargement Lazy et Préchargement**
```javascript
// Chargement différé des images
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};

// Préchargement des ressources critiques
const preloadCriticalResources = () => {
  const critical = [
    '/css/style.css',
    '/js/script.js',
    '/api/rides?limit=5'
  ];
  
  critical.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    document.head.appendChild(link);
  });
};
```

### **9.3 Compression et Minification**

```javascript
// Compression gzip
const compression = require('compression');
app.use(compression({
  level: 6,
  threshold: 100 * 1024, // Compresser si > 100KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Headers de cache
app.use('/public', express.static('public', {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));
```

---

## 🚀 **10. DÉPLOIEMENT** {#deploiement}

### **10.1 Environnements**

#### **Configuration par Environnement**
```javascript
// config/environments.js
const environments = {
  development: {
    NODE_ENV: 'development',
    PORT: 3002,
    MONGO_URI: 'mongodb://localhost:27017/ecoride_dev',
    DB_HOST: 'localhost',
    LOG_LEVEL: 'debug',
    RATE_LIMIT_WINDOW: 60000,
    RATE_LIMIT_MAX: 1000
  },
  
  staging: {
    NODE_ENV: 'staging',
    PORT: 3002,
    MONGO_URI: process.env.MONGO_URI_STAGING,
    DB_HOST: process.env.DB_HOST_STAGING,
    LOG_LEVEL: 'info',
    RATE_LIMIT_WINDOW: 900000,
    RATE_LIMIT_MAX: 100
  },
  
  production: {
    NODE_ENV: 'production',
    PORT: process.env.PORT || 3002,
    MONGO_URI: process.env.MONGO_URI_PROD,
    DB_HOST: process.env.DB_HOST_PROD,
    LOG_LEVEL: 'error',
    RATE_LIMIT_WINDOW: 900000,
    RATE_LIMIT_MAX: 100
  }
};
```

### **10.2 Scripts de Déploiement**

#### **Package.json Scripts**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "build": "npm run test && npm run security-check",
    "health": "curl -f http://localhost:3002/api/health",
    "audit": "npm audit --audit-level moderate",
    "security-check": "npm audit && echo 'Vérification sécurité OK'",
    "db-init": "node scripts/init-db.js",
    "db-seed": "node scripts/seed-data.js",
    "logs": "tail -f logs/combined.log",
    "monitor": "pm2 monit",
    "deploy": "git pull && npm install && npm run build && pm2 restart all"
  }
}
```

### **10.3 Docker Configuration**

#### **Dockerfile**
```dockerfile
FROM node:18-alpine

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3002

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie du code source
COPY . .

# Utilisateur non-root pour sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
USER nodeuser

# Port exposé
EXPOSE 3002

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/api/health || exit 1

# Commande de démarrage
CMD ["node", "server.js"]
```

#### **Docker-compose.yml**
```yaml
version: '3.8'

services:
  ecoride-app:
    build: .
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/ecoride
      - DB_HOST=mysql
    depends_on:
      - mongo
      - mysql
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  mysql:
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=ecoride
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mongo_data:
  mysql_data:
```

---

## 🔧 **11. MAINTENANCE** {#maintenance}

### **11.1 Monitoring Continu**

#### **Alertes et Notifications**
```javascript
// middleware/alerting.js
const sendAlert = async (level, message, details) => {
  const alert = {
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
    server: process.env.SERVER_NAME || 'unknown'
  };

  // Log critique
  if (level === 'critical') {
    logger.error('ALERT CRITIQUE', alert);
    
    // Notification Slack/Discord (optionnel)
    await notifyTeam(alert);
  }
};

// Surveillance des erreurs
process.on('uncaughtException', (error) => {
  sendAlert('critical', 'Exception non gérée', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  sendAlert('critical', 'Promesse rejetée non gérée', reason);
});
```

### **11.2 Sauvegarde et Récupération**

#### **Script de Sauvegarde MongoDB**
```bash
#!/bin/bash
# scripts/backup-mongo.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="ecoride"

# Création du répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarde MongoDB
mongodump --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compression
tar -czf $BACKUP_DIR/ecoride_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Nettoyage des anciennes sauvegardes (> 30 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Sauvegarde MongoDB terminée: $BACKUP_DIR/ecoride_$DATE.tar.gz"
```

#### **Script de Sauvegarde MySQL**
```bash
#!/bin/bash
# scripts/backup-mysql.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
DB_NAME="ecoride"

# Sauvegarde MySQL
mysqldump -u root -p$MYSQL_ROOT_PASSWORD $DB_NAME > $BACKUP_DIR/ecoride_$DATE.sql

# Compression
gzip $BACKUP_DIR/ecoride_$DATE.sql

echo "Sauvegarde MySQL terminée: $BACKUP_DIR/ecoride_$DATE.sql.gz"
```

### **11.3 Mise à Jour et Évolution**

#### **Checklist de Mise à Jour**
1. **Pré-déploiement**
   - ✅ Tests unitaires et intégration
   - ✅ Audit de sécurité
   - ✅ Sauvegarde des données
   - ✅ Plan de rollback

2. **Déploiement**
   - ✅ Mise en maintenance (si nécessaire)
   - ✅ Déploiement progressif
   - ✅ Vérification health checks
   - ✅ Tests de fumée

3. **Post-déploiement**
   - ✅ Monitoring des performances
   - ✅ Vérification des logs d'erreur
   - ✅ Tests fonctionnels
   - ✅ Documentation mise à jour

---

## 📈 **CONCLUSION ET ÉVOLUTIONS**

### **Points Forts Actuels**
✅ **Architecture moderne** et scalable  
✅ **Sécurité renforcée** avec JWT et rate limiting  
✅ **Performance optimisée** avec cache et monitoring  
✅ **Code maintenable** avec structure modulaire  
✅ **Documentation complète** et à jour  

### **Évolutions Prévues**
🔮 **Containerisation Docker** : Déploiement moderne et portable  
🔮 **Microservices** : Découpage par domaine métier  
🔮 **API GraphQL** : Alternative plus flexible à REST  
🔮 **WebSockets** : Notifications temps réel  
🔮 **IA/ML** : Optimisation automatique des trajets  
🔮 **PWA** : Application web progressive  

### **🐳 Intégration Docker**
EcoRide est maintenant entièrement containerisé avec Docker pour un déploiement moderne :

#### **Configuration Actuelle**
- **Dockerfile** optimisé avec Node.js Alpine
- **docker-compose.yml** avec stack complète (App + MongoDB + MySQL)
- **Initialisation automatique** des bases de données avec données de test
- **Scripts npm** pour gestion simplifiée (`docker:up`, `docker:down`)

#### **Avantages Docker**
✅ **Environnement reproductible** : Identique dev/test/prod  
✅ **Déploiement rapide** : < 1 minute pour stack complète  
✅ **Isolation sécurisée** : Conteneurs isolés avec permissions contrôlées  
✅ **Scaling horizontal** : `docker-compose scale ecoride-app=3`  
✅ **Maintenance simplifiée** : Rollback instantané, zero-downtime  

#### **Services Containerisés**
```yaml
# Stack Docker EcoRide
- ecoride-app:3000      # Application Node.js
- ecoride-mongo:27017   # Base MongoDB
- ecoride-mysql:3306    # Base MySQL
- mongo-express:8081    # Admin MongoDB
- phpmyadmin:8082       # Admin MySQL
```

**Documentation complète** : `DOCKER-INTEGRATION-GUIDE.md`  

### **Métriques de Qualité**
- **Couverture de code** : > 85%
- **Performance** : < 2s temps de réponse
- **Disponibilité** : > 99.9% uptime
- **Sécurité** : Audit mensuel
- **Documentation** : Mise à jour continue

---

*© 2025 EcoRide - Documentation Technique Complète*  
*Dernière mise à jour : 9 octobre 2025 - Intégration Docker*