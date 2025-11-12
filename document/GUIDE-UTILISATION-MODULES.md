# 🚀 Guide d'utilisation des modules EcoRide

Ce guide explique comment utiliser les modules créés lors du refactoring pour résoudre les problèmes SonarQube.

---

## 📦 Architecture des modules

### Structure générale

```
public/js/
├── main.js                    # Point d'entrée principal
├── common/                    # Modules partagés
│   ├── utils.js              # Utilitaires généraux
│   ├── notifications.js      # Système de notifications
│   ├── auth.js               # Authentification
│   └── navigation.js         # Navigation
└── pages/                     # Modules spécifiques aux pages
    ├── auth/
    ├── rides/
    └── ...
```

---

## 🎯 Utilisation des modules communs

### 1. Module Utils (`common/utils.js`)

#### Sanitisation HTML (protection XSS)

```javascript
import { sanitizeHTML, validateAndSanitizeInput } from '../common/utils.js';

// Nettoyer du HTML
const cleanHtml = sanitizeHTML('<script>alert("XSS")</script>Hello');
// Résultat: 'Hello'

// Valider et nettoyer une entrée
const userInput = validateAndSanitizeInput(inputElement.value);
```

#### Formatage de données

```javascript
import { formatCardNumber, formatExpiryDate, formatDate } from '../common/utils.js';

// Formater un numéro de carte
const formatted = formatCardNumber('1234567890123456');
// Résultat: '1234 5678 9012 3456'

// Formater une date d'expiration
const expiry = formatExpiryDate('1225');
// Résultat: '12/25'

// Formater une date complète
const date = formatDate(new Date('2024-12-25'));
// Résultat: '25 décembre 2024'
```

#### Génération d'étoiles pour les notes

```javascript
import { generateStars } from '../common/utils.js';

const stars = generateStars(4.5);
// Résultat: '⭐⭐⭐⭐☆'
```

#### Debounce pour limiter les appels

```javascript
import { debounce } from '../common/utils.js';

const searchInput = document.getElementById('search');
const debouncedSearch = debounce((value) => {
    console.log('Recherche:', value);
}, 300);

searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
```

---

### 2. Module Notifications (`common/notifications.js`)

#### Notifications simples

```javascript
import { showSuccess, showError, showWarning, showInfo } from '../common/notifications.js';

// Succès
showSuccess('Opération réussie !');

// Erreur
showError('Une erreur est survenue');

// Avertissement
showWarning('Attention : vérifiez vos données');

// Information
showInfo('Nouvelle fonctionnalité disponible');
```

#### Notification personnalisée

```javascript
import { showNotification } from '../common/notifications.js';

showNotification('Message personnalisé', 'success', 5000);
// Types disponibles: 'success', 'error', 'warning', 'info'
// Durée en millisecondes (par défaut: 3000)
```

#### Indicateur de chargement

```javascript
import { showLoading } from '../common/notifications.js';

const closeLoading = showLoading('Chargement en cours...');

try {
    await fetchData();
    closeLoading(); // Fermer le loader
    showSuccess('Données chargées !');
} catch (error) {
    closeLoading();
    showError('Erreur de chargement');
}
```

---

### 3. Module Auth (`common/auth.js`)

#### Vérification d'authentification

```javascript
import { isAuthenticated, requireAuth } from '../common/auth.js';

// Vérifier si l'utilisateur est connecté
if (isAuthenticated()) {
    console.log('Utilisateur connecté');
}

// Forcer la connexion (redirige vers login si non connecté)
if (!requireAuth()) {
    return; // L'utilisateur sera redirigé
}
```

#### Connexion et inscription

```javascript
import { login, register } from '../common/auth.js';

// Connexion
try {
    const user = await login({
        email: 'user@example.com',
        password: 'password123'
    });
    console.log('Connecté:', user);
} catch (error) {
    console.error('Erreur de connexion:', error.message);
}

// Inscription
try {
    const user = await register({
        pseudo: 'johndoe',
        email: 'john@example.com',
        password: 'securepass',
        prenom: 'John',
        nom: 'Doe',
        telephone: '0612345678',
        date_naissance: '1990-01-01'
    });
    console.log('Compte créé:', user);
} catch (error) {
    console.error('Erreur d\'inscription:', error.message);
}
```

#### Requêtes API authentifiées

```javascript
import { createFetchWithAuth, API_BASE_URL } from '../common/auth.js';

const fetchWithAuth = createFetchWithAuth();

// GET request
const response = await fetchWithAuth(`${API_BASE_URL}/rides`);
const rides = await response.json();

// POST request
const response = await fetchWithAuth(`${API_BASE_URL}/rides`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        ville_depart: 'Paris',
        ville_arrivee: 'Lyon',
        date_depart: '2024-12-25',
        heure_depart: '10:00',
        places_disponibles: 3,
        prix_par_place: 15
    })
});
const newRide = await response.json();
```

#### Récupérer l'utilisateur actuel

```javascript
import { getCurrentUser, isAdmin } from '../common/auth.js';

const user = await getCurrentUser();
console.log('Utilisateur:', user);

if (isAdmin()) {
    console.log('Accès administrateur accordé');
}
```

#### Déconnexion

```javascript
import { logout } from '../common/auth.js';

logout(); // Supprime le token et redirige vers l'accueil
```

---

### 4. Module Navigation (`common/navigation.js`)

#### Initialisation complète

```javascript
import { initAllNavigation } from '../common/navigation.js';

// Dans main.js ou dans votre page
initAllNavigation();
// Initialise: navigation, menu hamburger, scroll reveal, smooth scroll
```

#### Initialisation sélective

```javascript
import { 
    initNavigation, 
    initHamburgerMenu, 
    initScrollReveal,
    initSmoothScroll 
} from '../common/navigation.js';

// Uniquement la navigation principale
initNavigation();

// Uniquement le menu mobile
initHamburgerMenu();

// Uniquement les animations au scroll
initScrollReveal();

// Uniquement le défilement fluide
initSmoothScroll();
```

---

## 📄 Créer un nouveau module de page

### Structure d'un module de page

```javascript
/**
 * EcoRide - Description de la page
 * @file nom-page.js
 */

// Imports des modules communs
import { createFetchWithAuth, API_BASE_URL, requireAuth } from '../common/auth.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { validateAndSanitizeInput } from '../common/utils.js';

/**
 * Fonction utilitaire interne
 */
const myInternalFunction = () => {
    // Code privé au module
};

/**
 * Fonction principale d'initialisation (obligatoire)
 * Cette fonction est appelée automatiquement par main.js
 */
export const init = () => {
    console.log('🎯 Initialisation de ma page');
    
    // Vérifier l'authentification si nécessaire
    if (!requireAuth()) {
        window.location.href = 'connexion.html';
        return;
    }
    
    // Initialiser les événements
    const form = document.getElementById('my-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    console.log('✅ Page initialisée');
};

/**
 * Gestionnaire de soumission
 */
const handleSubmit = async (event) => {
    event.preventDefault();
    
    const closeLoading = showLoading('Traitement...');
    
    try {
        const fetchWithAuth = createFetchWithAuth();
        const response = await fetchWithAuth(`${API_BASE_URL}/endpoint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ /* données */ })
        });
        
        if (!response.ok) {
            throw new Error('Erreur serveur');
        }
        
        const data = await response.json();
        closeLoading();
        showNotification('Succès !', 'success');
        
    } catch (error) {
        closeLoading();
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
};
```

### Enregistrer le module dans main.js

```javascript
// Dans public/js/main.js
const pageModules = {
    // ... autres routes
    'ma-page.html': () => import('./pages/ma-page.js'),
};
```

---

## 🔄 Migration d'une page existante

### Étape 1: Identifier les fonctionnalités

Analysez `script-backup.js` et identifiez:
- ✅ Les événements à gérer
- ✅ Les appels API nécessaires
- ✅ Les validations de formulaire
- ✅ Les manipulations du DOM

### Étape 2: Créer le nouveau module

```javascript
// public/js/pages/ma-page.js
import { requireAuth } from '../common/auth.js';
import { showNotification } from '../common/notifications.js';

export const init = () => {
    if (!requireAuth()) return;
    
    // Code d'initialisation
};
```

### Étape 3: Tester

1. Ajouter la route dans `main.js`
2. Modifier le HTML pour utiliser `<script type="module" src="js/main.js"></script>`
3. Tester toutes les fonctionnalités

### Étape 4: Nettoyer

Une fois validé, supprimer le code correspondant de `script-backup.js`

---

## 🧪 Exemples complets

### Exemple 1: Page de recherche simple

```javascript
// public/js/pages/recherche.js
import { createFetchWithAuth, API_BASE_URL } from '../common/auth.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { validateAndSanitizeInput } from '../common/utils.js';

const fetchResults = async (query) => {
    const fetchWithAuth = createFetchWithAuth();
    const response = await fetchWithAuth(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
        throw new Error('Erreur de recherche');
    }
    
    return await response.json();
};

const displayResults = (results) => {
    const container = document.getElementById('results');
    
    if (!results || results.length === 0) {
        container.innerHTML = '<p>Aucun résultat trouvé</p>';
        return;
    }
    
    container.innerHTML = results.map(item => `
        <div class="result-item">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `).join('');
};

const handleSearch = async (event) => {
    event.preventDefault();
    
    const query = validateAndSanitizeInput(document.getElementById('search-input').value);
    
    if (!query || query.length < 3) {
        showNotification('Veuillez saisir au moins 3 caractères', 'warning');
        return;
    }
    
    const closeLoading = showLoading('Recherche en cours...');
    
    try {
        const results = await fetchResults(query);
        closeLoading();
        displayResults(results);
        
    } catch (error) {
        closeLoading();
        console.error('Erreur de recherche:', error);
        showNotification('Erreur lors de la recherche', 'error');
    }
};

export const init = () => {
    const form = document.getElementById('search-form');
    if (form) {
        form.addEventListener('submit', handleSearch);
    }
};
```

### Exemple 2: Formulaire avec validation

```javascript
// public/js/pages/formulaire.js
import { validateAndSanitizeInput } from '../common/utils.js';
import { showNotification, showLoading } from '../common/notifications.js';
import { createFetchWithAuth, API_BASE_URL } from '../common/auth.js';

const validateForm = (data) => {
    const errors = {};
    
    if (!data.name || data.name.length < 3) {
        errors.name = 'Le nom doit contenir au moins 3 caractères';
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Email invalide';
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};

const displayErrors = (errors) => {
    // Nettoyer les erreurs précédentes
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Afficher les nouvelles erreurs
    Object.entries(errors).forEach(([field, message]) => {
        const input = document.getElementById(field);
        if (input) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            input.parentElement.appendChild(errorDiv);
        }
    });
    
    showNotification(Object.values(errors)[0], 'error');
};

const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = {
        name: validateAndSanitizeInput(document.getElementById('name').value),
        email: validateAndSanitizeInput(document.getElementById('email').value),
    };
    
    const errors = validateForm(formData);
    if (errors) {
        displayErrors(errors);
        return;
    }
    
    const closeLoading = showLoading('Envoi en cours...');
    
    try {
        const fetchWithAuth = createFetchWithAuth();
        const response = await fetchWithAuth(`${API_BASE_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Erreur serveur');
        }
        
        closeLoading();
        showNotification('Formulaire envoyé avec succès !', 'success');
        event.target.reset();
        
    } catch (error) {
        closeLoading();
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
};

export const init = () => {
    const form = document.getElementById('my-form');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
};
```

---

## 🎨 Bonnes pratiques

### 1. ✅ Toujours valider et nettoyer les entrées

```javascript
import { validateAndSanitizeInput } from '../common/utils.js';

// BON
const userInput = validateAndSanitizeInput(input.value);

// MAUVAIS
const userInput = input.value; // Risque XSS
```

### 2. ✅ Gérer les erreurs de manière cohérente

```javascript
// BON
const closeLoading = showLoading('Chargement...');
try {
    await doSomething();
    closeLoading();
    showSuccess('Succès !');
} catch (error) {
    closeLoading();
    console.error('Erreur:', error);
    showError(error.message);
}

// MAUVAIS
try {
    await doSomething();
} catch (error) {
    // Erreur silencieuse
}
```

### 3. ✅ Utiliser le système de notifications

```javascript
// BON
showNotification('Message utilisateur', 'success');

// MAUVAIS
alert('Message utilisateur'); // Bloquant et non personnalisable
```

### 4. ✅ Protéger les pages qui nécessitent une authentification

```javascript
// BON
export const init = () => {
    if (!requireAuth()) return;
    // Code de la page protégée
};

// MAUVAIS
export const init = () => {
    // Pas de vérification d'authentification
};
```

### 5. ✅ Utiliser fetchWithAuth pour les appels API

```javascript
// BON
const fetchWithAuth = createFetchWithAuth();
const response = await fetchWithAuth(`${API_BASE_URL}/protected`);

// MAUVAIS
const response = await fetch(`${API_BASE_URL}/protected`); // Pas de token
```

---

## 🐛 Débogage

### Activer les logs détaillés

Les modules utilisent `console.log()` avec des émojis pour faciliter le suivi :

```
🎯 Démarrage de l'application EcoRide...
📄 Page actuelle: covoiturages.html
📦 Chargement du module pour covoiturages.html...
🚗 Initialisation de la page de covoiturages
✅ Module covoiturages.html initialisé
✅ Fonctionnalités globales initialisées
✨ Application EcoRide démarrée avec succès
```

### Problèmes courants

#### Erreur: Module not found

**Cause**: Chemin d'import incorrect

**Solution**:
```javascript
// ❌ MAUVAIS
import { showNotification } from './notifications.js';

// ✅ BON
import { showNotification } from '../common/notifications.js';
```

#### Erreur: init is not a function

**Cause**: Le module n'exporte pas la fonction `init()`

**Solution**:
```javascript
// Ajouter export avant la fonction
export const init = () => {
    // ...
};
```

#### La page ne charge pas le module

**Cause**: Route manquante dans `main.js`

**Solution**:
```javascript
// Dans main.js
const pageModules = {
    'ma-page.html': () => import('./pages/ma-page.js'),
};
```

---

## 📚 Ressources

- [Documentation MDN sur les modules ES6](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Modules)
- [REFACTORING-SONARQUBE-RESUME.md](./REFACTORING-SONARQUBE-RESUME.md) - Résumé complet du refactoring
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

**Date de création**: $(Get-Date -Format "dd/MM/yyyy")  
**Version**: 1.0.0  
**Mainteneur**: Équipe EcoRide
