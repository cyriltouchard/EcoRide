// Script pour créer un compte administrateur de manière sécurisée
// Usage: node create-admin.js
// Les identifiants doivent être fournis via des variables d'environnement

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
    try {
        console.log('🔐 Création sécurisée d\'un compte administrateur EcoRide\n');
        
        // Vérifier que les identifiants ne sont pas hardcodés
        if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
            console.log('⚠️  ATTENTION: Les identifiants admin sont détectés dans .env');
            console.log('⚠️  Ceci est acceptable pour le développement mais PAS pour la production!\n');
        }
        
        // Demander les informations de manière interactive
        const pseudo = await question('Pseudo de l\'administrateur: ');
        const email = await question('Email de l\'administrateur: ');
        const password = await question('Mot de passe (min. 8 caractères): ');
        const confirmPassword = await question('Confirmez le mot de passe: ');
        
        // Validation
        if (!pseudo || !email || !password) {
            console.log('❌ Tous les champs sont requis');
            rl.close();
            return;
        }
        
        if (password !== confirmPassword) {
            console.log('❌ Les mots de passe ne correspondent pas');
            rl.close();
            return;
        }
        
        if (password.length < 8) {
            console.log('❌ Le mot de passe doit contenir au moins 8 caractères');
            rl.close();
            return;
        }
        
        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Format d\'email invalide');
            rl.close();
            return;
        }
        
        console.log('\n🔄 Connexion à la base de données...');
        
        // Connexion à la base de données
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            database: process.env.DB_NAME || 'ecoride_sql'
        });
        
        console.log('✅ Connecté à la base de données');
        
        // Vérifier si l'utilisateur existe déjà
        const [existing] = await connection.query(
            'SELECT id, user_type FROM users WHERE email = ? OR pseudo = ?',
            [email, pseudo]
        );
        
        if (existing.length > 0) {
            console.log('❌ Un utilisateur avec cet email ou pseudo existe déjà');
            await connection.end();
            rl.close();
            return;
        }
        
        // Hacher le mot de passe de manière sécurisée
        console.log('🔐 Hachage du mot de passe...');
        const password_hash = await bcrypt.hash(password, 10);
        
        // Insérer l'utilisateur admin
        await connection.query(
            'INSERT INTO users (pseudo, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
            [pseudo, email, password_hash, 'admin']
        );
        
        console.log('\n✅ Compte administrateur créé avec succès!');
        console.log(`   Pseudo: ${pseudo}`);
        console.log(`   Email: ${email}`);
        console.log(`   Type: admin`);
        console.log('\n⚠️  IMPORTANT: Conservez ces identifiants en lieu sûr!');
        console.log('⚠️  Ne partagez jamais vos identifiants administrateur!');
        
        await connection.end();
        rl.close();
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solutions possibles:');
            console.log('   - Démarrer XAMPP et activer MySQL');
            console.log('   - Vérifier que MySQL est installé');
            console.log('   - Vérifier les paramètres dans .env');
        }
        
        rl.close();
    }
}

// Exécuter le script
createAdmin();
