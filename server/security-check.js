// Script de validation de sécurité - Vérifie qu'aucun secret n'est hardcodé
// Usage: node security-check.js
//
// ⚠️  IMPORTANT: Ce script utilise des regex sécurisées contre ReDoS
// Toutes les regex utilisent des quantificateurs bornés (ex: {3,100} au lieu de +)
// pour éviter le backtracking excessif et les attaques par déni de service.

const fs = require('fs');
const path = require('path');

// Patterns dangereux à détecter
// Note: Toutes les regex sont protégées contre ReDoS avec quantificateurs bornés
const SECURITY_PATTERNS = [
    {
        name: 'Hachage bcrypt hardcodé',
        regex: /\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/g,
        severity: 'CRITIQUE',
        description: 'Hachage de mot de passe bcrypt trouvé dans le code'
    },
    {
        name: 'Mot de passe en clair',
        // Regex sécurisée contre ReDoS avec quantificateurs bornés
        regex: /(password|pwd)\s*[=:]\s*['"][^'"$]{3,100}['"]/gi,
        severity: 'HAUTE',
        description: 'Mot de passe potentiel en clair',
        exclude: ['password = await', 'password:', 'password =', 'password.value', 'password.trim', 'password.length']
    },
    {
        name: 'Clé API hardcodée',
        // Regex sécurisée contre ReDoS avec quantificateurs bornés
        regex: /(api[_-]?key|apikey)\s*[=:]\s*['"][^'"$]{10,100}['"]/gi,
        severity: 'HAUTE',
        description: 'Clé API potentiellement hardcodée'
    },
    {
        name: 'Token hardcodé',
        // Regex sécurisée contre ReDoS avec quantificateurs bornés
        regex: /(token|bearer)\s*[=:]\s*['"][^'"$]{20,200}['"]/gi,
        severity: 'HAUTE',
        description: 'Token potentiellement hardcodé',
        exclude: ['token = localStorage', 'token:', 'token.']
    },
    {
        name: 'Secret JWT hardcodé',
        // Regex sécurisée contre ReDoS avec quantificateurs bornés
        regex: /(jwt[_-]?secret|secret[_-]?key)\s*[=:]\s*['"][^'"$]{10,100}['"]/gi,
        severity: 'CRITIQUE',
        description: 'Secret JWT potentiellement hardcodé'
    },
    {
        name: 'Chaîne de connexion DB',
        // Regex sécurisée contre ReDoS avec quantificateurs bornés
        regex: /(mongodb|mysql|postgresql):\/\/[^'"$]{1,256}:[^'"$]{1,256}@/gi,
        severity: 'HAUTE',
        description: 'Chaîne de connexion avec mot de passe',
        exclude: ['replace_with', 'your_password', 'password']
    },
    {
        name: 'Regex vulnérable ReDoS (négation répétée)',
        regex: /\/\[\^[^\]]+\]\+.*\[\^[^\]]+\]\+/g,
        severity: 'MOYENNE',
        description: 'Expression régulière potentiellement vulnérable au ReDoS (backtracking)',
        exclude: ['SECURITY_PATTERNS', 'security-check.js']
    },
    {
        name: 'Regex vulnérable ReDoS (quantificateurs imbriqués)',
        regex: /\/\([^)]*[\*\+]\)[\*\+]/g,
        severity: 'MOYENNE',
        description: 'Quantificateurs imbriqués détectés (risque ReDoS)',
        exclude: ['SECURITY_PATTERNS', 'security-check.js']
    }
];

// Fichiers et dossiers à exclure
const EXCLUDE_PATTERNS = [
    'node_modules',
    '.git',
    'package-lock.json',
    'yarn.lock',
    '.env.example',
    'security-check.js',
    'GUIDE-SECURITE-IDENTIFIANTS.md',
    'SECURITE-CORRECTION-README.md',
    'RESUME-CORRECTIONS-SECURITE.md',
    'SCRIPTS-SECURITE-README.md',
    'QUICKSTART-SECURITE.md',
    'SECURITE-REDOS-CORRECTION.md',
    'CHANGELOG-SECURITE.md'
];

// Extensions de fichiers à scanner
const SCAN_EXTENSIONS = ['.js', '.json', '.sql', '.html', '.env', '.md'];

class SecurityChecker {
    constructor() {
        this.issues = [];
        this.scannedFiles = 0;
    }

    shouldExcludeFile(filePath) {
        return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
    }

    shouldScanFile(filePath) {
        return SCAN_EXTENSIONS.some(ext => filePath.endsWith(ext));
    }

    checkContent(filePath, content) {
        const lines = content.split('\n');

        SECURITY_PATTERNS.forEach(pattern => {
            lines.forEach((line, lineNum) => {
                const matches = line.match(pattern.regex);
                if (matches) {
                    // Vérifier les exclusions
                    if (pattern.exclude) {
                        const shouldExclude = pattern.exclude.some(exc => 
                            line.toLowerCase().includes(exc.toLowerCase())
                        );
                        if (shouldExclude) return;
                    }

                    this.issues.push({
                        file: filePath,
                        line: lineNum + 1,
                        severity: pattern.severity,
                        type: pattern.name,
                        description: pattern.description,
                        content: line.trim().substring(0, 100)
                    });
                }
            });
        });
    }

    scanDirectory(dirPath) {
        const items = fs.readdirSync(dirPath);

        items.forEach(item => {
            const fullPath = path.join(dirPath, item);

            if (this.shouldExcludeFile(fullPath)) {
                return;
            }

            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                this.scanDirectory(fullPath);
            } else if (stat.isFile() && this.shouldScanFile(fullPath)) {
                this.scannedFiles++;
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    this.checkContent(fullPath, content);
                } catch (error) {
                    console.warn(`⚠️  Impossible de lire ${fullPath}: ${error.message}`);
                }
            }
        });
    }

    generateReport() {
        console.log('\n🔐 RAPPORT DE SÉCURITÉ - Détection de Secrets Hardcodés\n');
        console.log('═'.repeat(70));
        console.log(`📁 Fichiers scannés: ${this.scannedFiles}`);
        console.log(`🔍 Patterns de sécurité vérifiés: ${SECURITY_PATTERNS.length}`);
        console.log('═'.repeat(70));

        if (this.issues.length === 0) {
            console.log('\n✅ AUCUN PROBLÈME DÉTECTÉ !');
            console.log('✅ Votre code ne contient pas de secrets hardcodés détectables.\n');
            return true;
        }

        console.log(`\n❌ ${this.issues.length} PROBLÈME(S) DÉTECTÉ(S) !\n`);

        // Grouper par sévérité
        const critical = this.issues.filter(i => i.severity === 'CRITIQUE');
        const high = this.issues.filter(i => i.severity === 'HAUTE');

        if (critical.length > 0) {
            console.log('🔴 PROBLÈMES CRITIQUES:');
            console.log('─'.repeat(70));
            critical.forEach(issue => this.printIssue(issue));
        }

        if (high.length > 0) {
            console.log('\n🟠 PROBLÈMES HAUTE PRIORITÉ:');
            console.log('─'.repeat(70));
            high.forEach(issue => this.printIssue(issue));
        }

        console.log('\n📋 ACTIONS RECOMMANDÉES:');
        console.log('─'.repeat(70));
        console.log('1. Supprimer tous les secrets hardcodés');
        console.log('2. Utiliser des variables d\'environnement (.env)');
        console.log('3. Vérifier que .env est dans .gitignore');
        console.log('4. Révoquer et changer tous les secrets exposés');
        console.log('5. Relancer ce script pour valider les corrections\n');

        return false;
    }

    printIssue(issue) {
        console.log(`\n  Fichier: ${issue.file}`);
        console.log(`  Ligne: ${issue.line}`);
        console.log(`  Type: ${issue.type}`);
        console.log(`  Description: ${issue.description}`);
        console.log(`  Contenu: ${issue.content}`);
    }
}

// Exécution du script
function main() {
    console.log('🚀 Démarrage du scan de sécurité...\n');

    const checker = new SecurityChecker();
    const projectRoot = path.join(__dirname, '..');

    try {
        checker.scanDirectory(projectRoot);
        const isSecure = checker.generateReport();

        process.exit(isSecure ? 0 : 1);
    } catch (error) {
        console.error('❌ Erreur lors du scan:', error.message);
        process.exit(1);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}

module.exports = SecurityChecker;
