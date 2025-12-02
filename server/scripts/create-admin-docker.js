// Script simple pour créer un compte administrateur via Docker
// Usage: node server/scripts/create-admin-docker.js

const { exec } = require('child_process');
const util = require('util');
const readline = require('readline');
const execPromise = util.promisify(exec);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
    try {
        console.log('\n--- Script de creation d\'un compte administrateur ---\n');
        
        const pseudo = await question('Pseudo de l\'admin: ');
        const email = await question('Email de l\'admin: ');
        const password = await question('Mot de passe: ');
        
        if (!pseudo || !email || !password) {
            console.error('Erreur: Tous les champs sont requis');
            rl.close();
            process.exit(1);
        }
        
        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('Erreur: Email invalide');
            rl.close();
            process.exit(1);
        }
        
        console.log('\nVerification de l\'unicite...');
        
        // Vérifier email
        const checkEmailCmd = `docker exec ecoride-mysql mysql -uecoride_user -pecoride_user_2025 ecoride -sN -e "SELECT COUNT(*) FROM users WHERE email = '${email.replace(/'/g, "\\'")}';"`
;
        const { stdout: emailCount } = await execPromise(checkEmailCmd);
        
        if (parseInt(emailCount.trim()) > 0) {
            console.error('Erreur: Cet email est deja utilise');
            rl.close();
            process.exit(1);
        }
        
        // Vérifier pseudo
        const checkPseudoCmd = `docker exec ecoride-mysql mysql -uecoride_user -pecoride_user_2025 ecoride -sN -e "SELECT COUNT(*) FROM users WHERE pseudo = '${pseudo.replace(/'/g, "\\'")}';"`
;
        const { stdout: pseudoCount } = await execPromise(checkPseudoCmd);
        
        if (parseInt(pseudoCount.trim()) > 0) {
            console.error('Erreur: Ce pseudo est deja utilise');
            rl.close();
            process.exit(1);
        }
        
        console.log('OK - Email et pseudo disponibles\n');
        console.log('Recapitulatif:');
        console.log(`   Pseudo: ${pseudo}`);
        console.log(`   Email: ${email}`);
        console.log(`   Type: admin`);
        console.log(`   Credits initiaux: 100\n`);
        
        const confirm = await question('Confirmer la creation ? (oui/non): ');
        
        if (confirm.toLowerCase() !== 'oui' && confirm.toLowerCase() !== 'o') {
            console.log('Creation annulee');
            rl.close();
            process.exit(0);
        }
        
        console.log('\nHashage du mot de passe...');
        const bcrypt = require('bcryptjs');
        const password_hash = await bcrypt.hash(password, 10);
        
        console.log('Creation du compte MySQL...');
        
        // Échapper pour SQL
        const pseudoEsc = pseudo.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const emailEsc = email.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const hashEsc = password_hash.replace(/'/g, "\\'").replace(/"/g, '\\"');
        
        // Insérer utilisateur
        const insertUserCmd = `docker exec ecoride-mysql mysql -uecoride_user -pecoride_user_2025 ecoride -e "INSERT INTO users (pseudo, email, password_hash, user_type) VALUES ('${pseudoEsc}', '${emailEsc}', '${hashEsc}', 'admin');"`;
        
        await execPromise(insertUserCmd);
        console.log('OK - Utilisateur MySQL cree');
        
        // Récupérer l'ID
        const getUserIdCmd = `docker exec ecoride-mysql mysql -uecoride_user -pecoride_user_2025 ecoride -sN -e "SELECT id FROM users WHERE email = '${emailEsc}' ORDER BY id DESC LIMIT 1;"`;
        const { stdout: userIdOutput } = await execPromise(getUserIdCmd);
        const userId = parseInt(userIdOutput.trim());
        
        console.log(`OK - ID utilisateur: ${userId}`);
        
        // Créer crédits
        const insertCreditsCmd = `docker exec ecoride-mysql mysql -uecoride_user -pecoride_user_2025 ecoride -e "INSERT INTO user_credits (user_id, current_credits, total_earned, total_spent) VALUES (${userId}, 100, 0, 0);"`;
        await execPromise(insertCreditsCmd);
        console.log('OK - Credits initialises (100 credits)');
        
        // Créer dans MongoDB
        console.log('Creation du compte MongoDB...');
        const mongoInsertCmd = `docker exec ecoride-mongodb mongosh -u ecoride_user -p ecoride_user_2025 --authenticationDatabase ecoride ecoride --quiet --eval "db.users.insertOne({ pseudo: '${pseudoEsc}', email: '${emailEsc}', password: '${hashEsc}', sql_id: ${userId}, role: 'admin', createdAt: new Date(), updatedAt: new Date() })"`;
        
        try {
            await execPromise(mongoInsertCmd);
            console.log('OK - Utilisateur MongoDB cree');
        } catch (mongoErr) {
            console.log('Avertissement: Erreur MongoDB (utilisateur MySQL existe)');
        }
        
        console.log('\n=== Compte administrateur cree avec succes ! ===\n');
        console.log('Informations de connexion:');
        console.log(`   Email: ${email}`);
        console.log(`   Mot de passe: [celui que vous avez saisi]`);
        console.log(`   Type: admin`);
        console.log(`   Credits: 100 ECF\n`);
        
    } catch (error) {
        console.error('\nErreur lors de la creation:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        process.exit(0);
    }
}

createAdmin();
