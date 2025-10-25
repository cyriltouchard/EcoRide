// ROUTE DE SANTÉ ET MONITORING - ECORIDE
// Fichier: server/routes/healthRoutes.js

const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');

// Configuration base de données
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecoride_sql'
};

// Route de santé basique
router.get('/health', async (req, res) => {
    try {
        const healthCheck = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
            services: {}
        };

        // Test connexion MySQL
        try {
            const connection = await mysql.createConnection(dbConfig);
            await connection.ping();
            await connection.end();
            healthCheck.services.mysql = { status: 'OK', responseTime: Date.now() };
        } catch (error) {
            healthCheck.services.mysql = { status: 'ERROR', error: error.message };
            healthCheck.status = 'DEGRADED';
        }

        // Test connexion MongoDB
        try {
            if (mongoose.connection.readyState === 1) {
                healthCheck.services.mongodb = { status: 'OK' };
            } else {
                healthCheck.services.mongodb = { status: 'DISCONNECTED' };
                healthCheck.status = 'DEGRADED';
            }
        } catch (error) {
            healthCheck.services.mongodb = { status: 'ERROR', error: error.message };
            healthCheck.status = 'DEGRADED';
        }

        // Retourner le statut approprié
        const statusCode = healthCheck.status === 'OK' ? 200 : 503;
        res.status(statusCode).json(healthCheck);

    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Route de métriques détaillées
router.get('/metrics', (req, res) => {
    const metrics = {
        timestamp: new Date().toISOString(),
        server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            nodeVersion: process.version
        },
        environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 3002,
            dbHost: process.env.DB_HOST || 'localhost'
        }
    };

    res.json(metrics);
});

// Route de test de performance
router.get('/ping', (req, res) => {
    res.json({
        message: 'pong',
        timestamp: new Date().toISOString(),
        responseTime: Date.now()
    });
});

module.exports = router;