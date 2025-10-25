#!/usr/bin/env node
/**
 * 🔍 SCRIPT D'ANALYSE DE QUALITÉ - ECORIDE
 * Analyse la qualité du code et détecte le code mort/inutilisé
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 === ANALYSE DE QUALITÉ ECORIDE ===\n');

const stats = {
    totalFiles: 0,
    totalLines: 0,
    emptyLines: 0,
    commentLines: 0,
    codeLines: 0,
    issues: []
};

// Fonction pour analyser un fichier JS
function analyzeJSFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        const fileStats = {
            path: filePath,
            total: lines.length,
            empty: 0,
            comments: 0,
            code: 0,
            consoleLog: 0,
            todos: 0,
            longFunctions: []
        };
        
        let inBlockComment = false;
        let functionLineCount = 0;
        let currentFunction = null;
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            
            // Lignes vides
            if (trimmed === '') {
                fileStats.empty++;
                stats.emptyLines++;
                return;
            }
            
            // Commentaires
            if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                fileStats.comments++;
                stats.commentLines++;
                if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
                    fileStats.todos++;
                }
                return;
            }
            
            // Code
            fileStats.code++;
            stats.codeLines++;
            
            // console.log détection
            if (trimmed.includes('console.log') || trimmed.includes('console.info')) {
                fileStats.consoleLog++;
            }
            
            // Détection de fonctions longues
            if (trimmed.includes('function ') || trimmed.includes('=>')) {
                if (currentFunction) {
                    if (functionLineCount > 50) {
                        fileStats.longFunctions.push({
                            name: currentFunction,
                            lines: functionLineCount
                        });
                    }
                }
                currentFunction = trimmed.substring(0, 50);
                functionLineCount = 0;
            }
            functionLineCount++;
        });
        
        stats.totalFiles++;
        stats.totalLines += fileStats.total;
        
        // Rapport par fichier
        const fileName = path.basename(filePath);
        console.log(`📄 ${fileName}`);
        console.log(`   Lignes totales: ${fileStats.total}`);
        console.log(`   Code: ${fileStats.code} | Commentaires: ${fileStats.comments} | Vides: ${fileStats.empty}`);
        
        if (fileStats.consoleLog > 0) {
            console.log(`   ⚠️  console.log trouvés: ${fileStats.consoleLog}`);
            stats.issues.push(`${fileName}: ${fileStats.consoleLog} console.log`);
        }
        
        if (fileStats.todos > 0) {
            console.log(`   📝 TODOs trouvés: ${fileStats.todos}`);
        }
        
        if (fileStats.longFunctions.length > 0) {
            console.log(`   ⚠️  Fonctions longues (>50 lignes): ${fileStats.longFunctions.length}`);
            fileStats.longFunctions.forEach(f => {
                stats.issues.push(`${fileName}: Fonction longue (${f.lines} lignes)`);
            });
        }
        
        console.log('');
        
    } catch (error) {
        console.error(`❌ Erreur lors de l'analyse de ${filePath}: ${error.message}`);
    }
}

// Analyser les fichiers serveur
console.log('🔧 === ANALYSE SERVEUR ===\n');

const serverFiles = [
    'server/server.js',
    'server/init-db.js'
];

serverFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        analyzeJSFile(filePath);
    }
});

// Analyser les controllers
console.log('\n🎮 === ANALYSE CONTROLLERS ===\n');
const controllersPath = path.join(__dirname, '..', 'server', 'controllers');
if (fs.existsSync(controllersPath)) {
    const controllers = fs.readdirSync(controllersPath).filter(f => f.endsWith('.js'));
    controllers.forEach(file => {
        analyzeJSFile(path.join(controllersPath, file));
    });
}

// Analyser les models
console.log('\n🗄️  === ANALYSE MODELS ===\n');
const modelsPath = path.join(__dirname, '..', 'server', 'models');
if (fs.existsSync(modelsPath)) {
    const models = fs.readdirSync(modelsPath).filter(f => f.endsWith('.js'));
    models.forEach(file => {
        analyzeJSFile(path.join(modelsPath, file));
    });
}

// Analyser les routes
console.log('\n🛣️  === ANALYSE ROUTES ===\n');
const routesPath = path.join(__dirname, '..', 'server', 'routes');
if (fs.existsSync(routesPath)) {
    const routes = fs.readdirSync(routesPath).filter(f => f.endsWith('.js'));
    routes.forEach(file => {
        analyzeJSFile(path.join(routesPath, file));
    });
}

// Analyser le frontend
console.log('\n🎨 === ANALYSE FRONTEND ===\n');
const frontendFiles = [
    'public/js/script.js',
    'public/js/config.js',
    'public/js/performance.js'
];

frontendFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        analyzeJSFile(filePath);
    }
});

// Rapport final
console.log('\n📊 === RAPPORT GLOBAL ===\n');
console.log(`Fichiers analysés: ${stats.totalFiles}`);
console.log(`Lignes totales: ${stats.totalLines}`);
console.log(`Lignes de code: ${stats.codeLines} (${((stats.codeLines/stats.totalLines)*100).toFixed(1)}%)`);
console.log(`Commentaires: ${stats.commentLines} (${((stats.commentLines/stats.totalLines)*100).toFixed(1)}%)`);
console.log(`Lignes vides: ${stats.emptyLines} (${((stats.emptyLines/stats.totalLines)*100).toFixed(1)}%)`);

console.log('\n⚠️  === PROBLÈMES DÉTECTÉS ===\n');
if (stats.issues.length > 0) {
    stats.issues.forEach(issue => console.log(`   - ${issue}`));
} else {
    console.log('   ✅ Aucun problème majeur détecté !');
}

console.log('\n✅ Analyse terminée !\n');
