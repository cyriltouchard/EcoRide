// LOGGING SYSTÈME - ECORIDE
// Fichier: server/middleware/logger.js

const fs = require('fs');
const path = require('path');

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Fonction de logging
const log = (level, message, req = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        ip: req ? req.ip : null,
        userAgent: req ? req.get('User-Agent') : null,
        url: req ? req.originalUrl : null,
        method: req ? req.method : null
    };

    // Log dans la console en développement
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    }

    // Log dans le fichier
    const logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
};

// Middleware de logging des requêtes
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? 'error' : 'info';
        log(level, `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`, req);
    });
    
    next();
};

// Middleware de gestion des erreurs
const errorLogger = (err, req, res, next) => {
    log('error', `${err.message} - Stack: ${err.stack}`, req);
    
    if (process.env.NODE_ENV === 'production') {
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    } else {
        res.status(500).json({
            success: false,
            message: err.message,
            stack: err.stack
        });
    }
};

module.exports = {
    log,
    requestLogger,
    errorLogger
};