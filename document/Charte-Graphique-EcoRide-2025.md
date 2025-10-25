# 🎨 **CHARTE GRAPHIQUE ECORIDE - VERSION 2025**

*Document mis à jour le 3 octobre 2025*

---

## 📋 **TABLE DES MATIÈRES**

1. [Logo et Identité](#logo)
2. [Palette de Couleurs](#couleurs)
3. [Typographie](#typographie)
4. [Iconographie](#iconographie)
5. [Composants UI](#composants)
6. [Layout et Espacement](#layout)
7. [États et Interactions](#interactions)
8. [Responsive Design](#responsive)
9. [Accessibilité](#accessibilite)
10. [Exemples d'Implémentation](#exemples)

---

## 🏷️ **1. LOGO ET IDENTITÉ** {#logo}

### Logo Principal
Le logo EcoRide combine modernité et respect de l'environnement :
- **Icône** : Feuille stylisée intégrée dans une voiture
- **Typographie** : Poppins Bold pour "EcoRide"
- **Couleur principale** : Vert #27ae60
- **Usage** : Fond clair obligatoire pour contraste optimal

### Variantes
- **Logo complet** : Icône + texte (navigation principale)
- **Logo compact** : Icône seule (mobile, favicon)
- **Logo inverse** : Version blanche pour fonds sombres

---

## 🎨 **2. PALETTE DE COULEURS** {#couleurs}

### Couleurs Primaires
| Couleur | HEX | RGB | Usage Principal |
|---------|-----|-----|-----------------|
| **Vert EcoRide** | `#27ae60` | `39, 174, 96` | Boutons principaux, liens actifs, badges écologiques |
| **Bleu Technologie** | `#3498db` | `52, 152, 219` | Liens, éléments interactifs, accents tech |
| **Blanc Pur** | `#ffffff` | `255, 255, 255` | Fond principal, cartes, conteneurs |

### Couleurs Secondaires
| Couleur | HEX | RGB | Usage |
|---------|-----|-----|-------|
| **Gris Interface** | `#f8f9fa` | `248, 249, 250` | Fond de page, sections |
| **Gris Texte** | `#6c757d` | `108, 117, 125` | Texte secondaire, labels |
| **Gris Foncé** | `#343a40` | `52, 58, 64` | Texte principal, headers |

### Couleurs d'État
| Couleur | HEX | RGB | Usage |
|---------|-----|-----|-------|
| **Succès** | `#28a745` | `40, 167, 69` | Messages de confirmation |
| **Attention** | `#ffc107` | `255, 193, 7` | Alertes, notifications |
| **Danger** | `#dc3545` | `220, 53, 69` | Erreurs, suppressions |
| **Info** | `#17a2b8` | `23, 162, 184` | Informations neutres |

### Dégradés
```css
/* Dégradé principal */
background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);

/* Dégradé technologique */
background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);

/* Dégradé neutre */
background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
```

---

## 📝 **3. TYPOGRAPHIE** {#typographie}

### Polices Principales
```css
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap');

/* Hiérarchie typographique */
h1, h2, h3, .brand { 
    font-family: 'Poppins', sans-serif; 
    font-weight: 600;
}

body, p, .text { 
    font-family: 'Roboto', sans-serif; 
    font-weight: 400;
}
```

### Échelle Typographique
| Élément | Taille | Poids | Usage |
|---------|--------|-------|-------|
| **H1** | `2.5rem` (40px) | Bold 700 | Titres principaux |
| **H2** | `2rem` (32px) | Semi-Bold 600 | Titres de section |
| **H3** | `1.5rem` (24px) | Semi-Bold 600 | Sous-titres |
| **Body** | `1rem` (16px) | Regular 400 | Texte courant |
| **Small** | `0.875rem` (14px) | Regular 400 | Métadonnées, labels |
| **Caption** | `0.75rem` (12px) | Light 300 | Légendes, notes |

### Interlignage et Espacement
```css
/* Standards d'espacement */
h1 { line-height: 1.2; margin-bottom: 1.5rem; }
h2 { line-height: 1.3; margin-bottom: 1.25rem; }
h3 { line-height: 1.4; margin-bottom: 1rem; }
p { line-height: 1.6; margin-bottom: 1rem; }
```

---

## 🎯 **4. ICONOGRAPHIE** {#iconographie}

### Bibliothèque d'Icônes
**Font Awesome 6** (dernière version) pour cohérence et performance.

### Icônes Spécifiques EcoRide
| Contexte | Icône | Code | Usage |
|----------|-------|------|-------|
| **Véhicules** | 🚗 | `fas fa-car` | Gestion des véhicules |
| **Trajets** | 🛣️ | `fas fa-route` | Covoiturages, itinéraires |
| **Utilisateurs** | 👤 | `fas fa-user-circle` | Profils, comptes |
| **Écologie** | 🌿 | `fas fa-leaf` | Actions écologiques |
| **Géolocalisation** | 📍 | `fas fa-map-marker-alt` | Lieux, positions |
| **Temps** | ⏰ | `fas fa-clock` | Horaires, durées |
| **Étoiles** | ⭐ | `fas fa-star` | Évaluations, notes |
| **Sécurité** | 🔒 | `fas fa-lock` | Authentification |
| **Paramètres** | ⚙️ | `fas fa-cog` | Configuration |
| **Notifications** | 🔔 | `fas fa-bell` | Alertes, messages |

### Tailles d'Icônes
```css
.icon-sm { font-size: 0.875rem; } /* 14px */
.icon-md { font-size: 1.125rem; } /* 18px */
.icon-lg { font-size: 1.5rem; }   /* 24px */
.icon-xl { font-size: 2rem; }     /* 32px */
```

---

## 🧩 **5. COMPOSANTS UI** {#composants}

### Boutons
```css
/* Bouton principal */
.btn-primary {
    background: #27ae60;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background: #229954;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

/* Bouton secondaire */
.btn-secondary {
    background: transparent;
    border: 2px solid #27ae60;
    color: #27ae60;
}
```

### Cartes
```css
.card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 24px;
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
```

### Formulaires
```css
.form-input {
    border: 2px solid #e9ecef;
    border-radius: 8px;
    padding: 12px 16px;
    font-family: 'Roboto', sans-serif;
    transition: border-color 0.3s ease;
}

.form-input:focus {
    border-color: #27ae60;
    box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}
```

---

## 📐 **6. LAYOUT ET ESPACEMENT** {#layout}

### Grille de Base
```css
/* Conteneur principal */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Grille responsive */
.grid {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

### Système d'Espacement
| Classe | Valeur | Usage |
|--------|--------|-------|
| `.spacing-xs` | `4px` | Espacement minimal |
| `.spacing-sm` | `8px` | Espacement réduit |
| `.spacing-md` | `16px` | Espacement standard |
| `.spacing-lg` | `24px` | Espacement large |
| `.spacing-xl` | `32px` | Espacement très large |
| `.spacing-xxl` | `48px` | Espacement de section |

---

## ⚡ **7. ÉTATS ET INTERACTIONS** {#interactions}

### États des Éléments
```css
/* État de survol */
.interactive:hover {
    transform: translateY(-1px);
    transition: all 0.2s ease;
}

/* État actif */
.active {
    background: #27ae60;
    color: white;
}

/* État désactivé */
.disabled {
    opacity: 0.5;
    pointer-events: none;
}

/* État de chargement */
.loading {
    position: relative;
    overflow: hidden;
}

.loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: loading 1.5s infinite;
}
```

### Animations
```css
/* Animation de fondu */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Animation de chargement */
@keyframes loading {
    0% { left: -100%; }
    100% { left: 100%; }
}

/* Animation de rotation */
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

---

## 📱 **8. RESPONSIVE DESIGN** {#responsive}

### Points de Rupture
```css
/* Mobile First */
.responsive {
    /* Styles mobile par défaut */
}

/* Tablette */
@media (min-width: 768px) {
    .responsive {
        /* Styles tablette */
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .responsive {
        /* Styles desktop */
    }
}

/* Large Desktop */
@media (min-width: 1200px) {
    .responsive {
        /* Styles grand écran */
    }
}
```

### Navigation Responsive
```css
/* Menu mobile */
.mobile-menu {
    display: block;
}

.desktop-menu {
    display: none;
}

@media (min-width: 768px) {
    .mobile-menu {
        display: none;
    }
    
    .desktop-menu {
        display: flex;
    }
}
```

---

## ♿ **9. ACCESSIBILITÉ** {#accessibilite}

### Contrastes Minimum
- **Texte normal** : Ratio 4.5:1 minimum
- **Texte large** : Ratio 3:1 minimum
- **Éléments graphiques** : Ratio 3:1 minimum

### Focus et Navigation
```css
/* Focus visible pour la navigation clavier */
.focusable:focus {
    outline: 2px solid #27ae60;
    outline-offset: 2px;
}

/* Texte pour les lecteurs d'écran */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
}
```

### ARIA et Sémantique
```html
<!-- Bouton avec description -->
<button class="btn-primary" aria-describedby="btn-help">
    Réserver <i class="fas fa-car" aria-hidden="true"></i>
</button>
<div id="btn-help" class="sr-only">Réserver ce covoiturage</div>

<!-- Navigation avec landmarks -->
<nav role="navigation" aria-label="Navigation principale">
    <ul role="menubar">
        <li role="none">
            <a href="#" role="menuitem">Accueil</a>
        </li>
    </ul>
</nav>
```

---

## 💻 **10. EXEMPLES D'IMPLÉMENTATION** {#exemples}

### Page de Connexion
```html
<div class="auth-container">
    <div class="auth-card">
        <img src="logo.png" alt="EcoRide" class="logo">
        <h1 class="auth-title">Connexion</h1>
        
        <form class="auth-form">
            <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input type="email" id="email" class="form-input" required>
            </div>
            
            <div class="form-group">
                <label for="password" class="form-label">Mot de passe</label>
                <input type="password" id="password" class="form-input" required>
            </div>
            
            <button type="submit" class="btn-primary btn-full">
                <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                Se connecter
            </button>
        </form>
    </div>
</div>
```

### Carte de Covoiturage
```html
<div class="ride-card">
    <div class="ride-header">
        <div class="ride-route">
            <i class="fas fa-map-marker-alt text-success" aria-hidden="true"></i>
            <span class="route-from">Paris</span>
            <i class="fas fa-arrow-right text-muted" aria-hidden="true"></i>
            <span class="route-to">Lyon</span>
        </div>
        <div class="ride-price">25€</div>
    </div>
    
    <div class="ride-details">
        <div class="ride-time">
            <i class="fas fa-clock" aria-hidden="true"></i>
            <span>Demain à 14h30</span>
        </div>
        
        <div class="ride-seats">
            <i class="fas fa-users" aria-hidden="true"></i>
            <span>2 places disponibles</span>
        </div>
    </div>
    
    <div class="ride-driver">
        <img src="driver.jpg" alt="Photo de profil" class="driver-avatar">
        <div class="driver-info">
            <span class="driver-name">Marie Dubois</span>
            <div class="driver-rating">
                <i class="fas fa-star text-warning" aria-hidden="true"></i>
                <span>4.8</span>
            </div>
        </div>
    </div>
    
    <button class="btn-primary btn-full">
        <i class="fas fa-car" aria-hidden="true"></i>
        Réserver
    </button>
</div>
```

---

## 🎯 **BONNES PRATIQUES**

### ✅ À Faire
- Utiliser les couleurs définies dans la charte
- Respecter la hiérarchie typographique
- Maintenir les contrastes d'accessibilité
- Tester sur tous les appareils
- Optimiser les performances

### ❌ À Éviter
- Mélanger les polices non définies
- Utiliser des couleurs hors charte
- Négliger l'accessibilité
- Surcharger les animations
- Ignorer le responsive design

---

## 📊 **MÉTRIQUES DE PERFORMANCE**

### Objectifs
- **First Contentful Paint** : < 1.5s
- **Largest Contentful Paint** : < 2.5s
- **Cumulative Layout Shift** : < 0.1
- **First Input Delay** : < 100ms

### Optimisations CSS
```css
/* Préchargement des polices critiques */
@font-face {
    font-family: 'Poppins';
    src: url('poppins.woff2') format('woff2');
    font-display: swap;
}

/* Optimisation des images */
.optimized-image {
    loading: lazy;
    decoding: async;
}
```

---

## 📞 **SUPPORT ET MAINTENANCE**

### Contact Équipe Design
- **Email** : design@ecoride.fr
- **Slack** : #design-system
- **Documentation** : /docs/design-system

### Mises à Jour
Cette charte est mise à jour trimestriellement. Dernière révision : **3 octobre 2025**

---

*© 2025 EcoRide - Tous droits réservés. Cette charte graphique est un document propriétaire et confidentiel.*