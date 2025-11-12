# 📊 **DIAGRAMMES D'ANALYSE UML - ECORIDE 2025**

*Document technique mis à jour le 3 octobre 2025*

---

## 📋 **TABLE DES MATIÈRES**

1. [Introduction](#introduction)
2. [Diagramme de Cas d'Utilisation](#cas-utilisation)
3. [Diagrammes de Séquence](#sequence)
4. [Modèle Conceptuel de Données (MCD)](#mcd)
5. [Diagramme de Classes](#classes)
6. [Architecture Technique](#architecture)
7. [Diagramme de Déploiement](#deploiement)

---

## 🎯 **1. INTRODUCTION** {#introduction}

Ce document présente l'analyse UML complète de l'application **EcoRide**, une plateforme de covoiturage écologique. Les diagrammes décrivent la structure, les interactions et le comportement du système.

### **Technologies Utilisées**
- **Backend** : Node.js + Express
- **Base de données** : MongoDB (NoSQL) + MySQL (Relationnel)
- **Frontend** : HTML5 + CSS3 + JavaScript
- **Authentification** : JWT
- **Sécurité** : bcrypt + helmet + CORS

---

## 👥 **2. DIAGRAMME DE CAS D'UTILISATION** {#cas-utilisation}

### **2.1 Acteurs du Système**

```mermaid
graph TD
    V[👤 Visiteur] 
    U[🚗 Utilisateur]
    P[🧳 Passager]
    C[🚙 Chauffeur]
    E[👔 Employé]
    A[👨‍💼 Administrateur]
    
    V -.-> U
    U --> P
    U --> C
    E -.-> A
    
    style V fill:#e3f2fd
    style U fill:#f3e5f5
    style P fill:#e8f5e8
    style C fill:#fff3e0
    style E fill:#fce4ec
    style A fill:#f1f8e9
```

### **2.2 Cas d'Utilisation Principaux**

```mermaid
usecase
    actor Visiteur as V
    actor Utilisateur as U
    actor Passager as P
    actor Chauffeur as C
    actor Employé as E
    actor Administrateur as A
    
    package "EcoRide System" {
        usecase (Consulter accueil) as UC1
        usecase (Rechercher covoiturage) as UC2
        usecase (Voir détails trajet) as UC3
        usecase (S'inscrire) as UC4
        usecase (Se connecter) as UC5
        
        usecase (Gérer profil) as UC6
        usecase (Consulter historique) as UC7
        usecase (Laisser avis) as UC8
        
        usecase (Gérer véhicules) as UC9
        usecase (Proposer trajet) as UC10
        usecase (Gérer trajets) as UC11
        
        usecase (Réserver place) as UC12
        usecase (Annuler réservation) as UC13
        
        usecase (Modérer avis) as UC14
        usecase (Consulter litiges) as UC15
        
        usecase (Gérer employés) as UC16
        usecase (Suspendre utilisateur) as UC17
        usecase (Consulter statistiques) as UC18
    }
    
    V --> UC1
    V --> UC2
    V --> UC3
    V --> UC4
    V --> UC5
    
    U --> UC6
    U --> UC7
    U --> UC8
    
    C --> UC9
    C --> UC10
    C --> UC11
    
    P --> UC12
    P --> UC13
    
    E --> UC14
    E --> UC15
    
    A --> UC16
    A --> UC17
    A --> UC18
```

### **2.3 Description Détaillée des Cas d'Utilisation**

#### **👤 Visiteur (Non connecté)**
- **UC1** : Consulter la page d'accueil
- **UC2** : Rechercher un covoiturage (sans filtre avancé)
- **UC3** : Consulter les détails d'un covoiturage
- **UC4** : S'inscrire sur la plateforme
- **UC5** : Se connecter

#### **🚗 Utilisateur (Connecté)**
*Hérite des actions du Visiteur*
- **UC6** : Gérer son profil (modifier photo, informations)
- **UC7** : Consulter son historique de trajets
- **UC8** : Laisser un avis et une note sur un chauffeur

#### **🚙 Chauffeur (Rôle spécialisé)**
- **UC9** : Gérer ses véhicules (Ajouter, Modifier, Supprimer)
- **UC10** : Proposer un trajet
- **UC11** : Gérer ses trajets proposés (Démarrer, Terminer, Annuler)

#### **🧳 Passager (Rôle spécialisé)**
- **UC12** : Réserver une place sur un trajet
- **UC13** : Annuler sa réservation

#### **👔 Employé**
- **UC14** : Modérer les avis (Valider, Refuser)
- **UC15** : Consulter les litiges (trajets signalés)

#### **👨‍💼 Administrateur**
*Hérite des actions de l'Employé*
- **UC16** : Gérer les comptes Employés (Créer, Suspendre)
- **UC17** : Suspendre un compte Utilisateur
- **UC18** : Consulter les statistiques de la plateforme

---

## 🔄 **3. DIAGRAMMES DE SÉQUENCE** {#sequence}

### **3.1 Séquence : Inscription d'un Utilisateur**

```mermaid
sequenceDiagram
    participant U as 👤 Utilisateur
    participant F as 🌐 Frontend
    participant S as ⚙️ Backend
    participant DB as 💾 MongoDB
    
    U->>F: Remplit formulaire inscription
    F->>F: Validation côté client
    F->>S: POST /api/users/register
    
    S->>S: Validation des données (express-validator)
    S->>DB: Vérification email/pseudo unique
    
    alt Email/Pseudo déjà existant
        DB-->>S: Conflit détecté
        S-->>F: 400 Bad Request
        F-->>U: Message d'erreur
    else Données valides
        S->>S: Hachage mot de passe (bcrypt)
        S->>DB: Création utilisateur
        DB-->>S: Utilisateur créé
        S->>S: Génération token JWT
        S-->>F: 201 Created + token
        F->>F: Stockage token localStorage
        F-->>U: Redirection espace utilisateur
    end
```

### **3.2 Séquence : Connexion Utilisateur**

```mermaid
sequenceDiagram
    participant U as 👤 Utilisateur
    participant F as 🌐 Frontend
    participant S as ⚙️ Backend
    participant DB as 💾 MongoDB
    
    U->>F: Saisit email/mot de passe
    F->>S: POST /api/users/login
    
    S->>DB: Recherche utilisateur par email
    
    alt Utilisateur non trouvé
        DB-->>S: Aucun résultat
        S-->>F: 401 Unauthorized
        F-->>U: "Identifiants incorrects"
    else Utilisateur trouvé
        DB-->>S: Données utilisateur
        S->>S: Vérification mot de passe (bcrypt)
        
        alt Mot de passe incorrect
            S-->>F: 401 Unauthorized
            F-->>U: "Identifiants incorrects"
        else Mot de passe correct
            S->>S: Génération token JWT
            S-->>F: 200 OK + token + données profil
            F->>F: Stockage token localStorage
            F-->>U: Redirection selon rôle
        end
    end
```

### **3.3 Séquence : Réservation d'un Trajet**

```mermaid
sequenceDiagram
    participant P as 🧳 Passager
    participant F as 🌐 Frontend
    participant S as ⚙️ Backend
    participant DB as 💾 MongoDB
    
    P->>F: Clique "Réserver" sur détail trajet
    F->>S: POST /api/rides/{rideId}/join (+ JWT token)
    
    S->>S: Vérification token JWT
    S->>DB: Recherche trajet par ID
    
    alt Trajet non trouvé
        DB-->>S: Aucun résultat
        S-->>F: 404 Not Found
        F-->>P: "Trajet introuvable"
    else Trajet trouvé
        DB-->>S: Données du trajet
        S->>S: Vérifications métier :
        Note over S: - Places disponibles > 0<br/>- Utilisateur ≠ conducteur<br/>- Pas déjà passager<br/>- Trajet non démarré
        
        alt Vérifications échouées
            S-->>F: 400 Bad Request + raison
            F-->>P: Affichage message d'erreur
        else Réservation possible
            S->>DB: Update trajet :<br/>- Ajouter passager<br/>- Décrémenter places disponibles
            DB-->>S: Confirmation mise à jour
            
            S->>DB: Créer notification pour conducteur
            DB-->>S: Notification créée
            
            S-->>F: 200 OK "Réservation confirmée"
            F->>F: Mise à jour interface
            F-->>P: "Réservation réussie !"
        end
    end
```

### **3.4 Séquence : Proposition d'un Trajet**

```mermaid
sequenceDiagram
    participant C as 🚙 Chauffeur
    participant F as 🌐 Frontend
    participant S as ⚙️ Backend
    participant DB as 💾 MongoDB
    
    C->>F: Remplit formulaire nouveau trajet
    F->>F: Validation côté client
    F->>S: POST /api/rides (+ JWT token)
    
    S->>S: Vérification token JWT
    S->>S: Validation données (express-validator)
    S->>DB: Vérification véhicule appartient au chauffeur
    
    alt Véhicule non trouvé/non autorisé
        DB-->>S: Erreur véhicule
        S-->>F: 403 Forbidden
        F-->>C: "Véhicule non autorisé"
    else Véhicule valide
        S->>DB: Création nouveau trajet
        DB-->>S: Trajet créé avec ID
        
        S->>DB: Mise à jour profil chauffeur (statistiques)
        DB-->>S: Profil mis à jour
        
        S-->>F: 201 Created + données trajet
        F->>F: Redirection vers détail trajet
        F-->>C: "Trajet créé avec succès"
    end
```

---

## 🗃️ **4. MODÈLE CONCEPTUEL DE DONNÉES (MCD)** {#mcd}

### **4.1 Entités Principales**

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string pseudo UK
        string email UK
        string password
        number credits
        string role
        array vehicles FK
        date createdAt
        date updatedAt
    }
    
    VEHICLE {
        ObjectId _id PK
        ObjectId userId FK
        string brand
        string model
        string plate
        string energy
        number seats
        date createdAt
        date updatedAt
    }
    
    RIDE {
        ObjectId _id PK
        ObjectId driver FK
        ObjectId vehicle FK
        string departure
        string arrival
        date departureDate
        string departureTime
        number price
        number totalSeats
        number availableSeats
        string description
        boolean isEcologic
        array stops
        array passengers FK
        string status
        date createdAt
        date updatedAt
    }
    
    REVIEW {
        ObjectId _id PK
        ObjectId rideId FK
        ObjectId driverId FK
        ObjectId authorId FK
        number rating
        string comment
        string status
        date createdAt
        date updatedAt
    }
    
    CREDIT_TRANSACTION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId rideId FK
        number amount
        string type
        string description
        date createdAt
    }
    
    USER ||--o{ VEHICLE : owns
    USER ||--o{ RIDE : drives
    USER ||--o{ REVIEW : writes
    USER ||--o{ CREDIT_TRANSACTION : performs
    VEHICLE ||--o{ RIDE : used_in
    RIDE ||--o{ REVIEW : generates
    RIDE ||--o{ CREDIT_TRANSACTION : triggers
    USER }o--o{ RIDE : passenger_in
```

### **4.2 Relations et Cardinalités**

| Relation | Cardinalité | Description |
|----------|-------------|-------------|
| **User → Vehicle** | 1:N | Un utilisateur peut posséder plusieurs véhicules |
| **User → Ride (driver)** | 1:N | Un chauffeur peut proposer plusieurs trajets |
| **User → Ride (passenger)** | N:M | Un utilisateur peut être passager de plusieurs trajets |
| **Vehicle → Ride** | 1:N | Un véhicule peut être utilisé pour plusieurs trajets |
| **Ride → Review** | 1:N | Un trajet peut avoir plusieurs avis |
| **User → Review (author)** | 1:N | Un utilisateur peut écrire plusieurs avis |
| **User → CreditTransaction** | 1:N | Un utilisateur a plusieurs transactions de crédits |

---

## 🏗️ **5. DIAGRAMME DE CLASSES** {#classes}

### **5.1 Classes Métier Principales**

```mermaid
classDiagram
    class User {
        -ObjectId _id
        -string pseudo
        -string email
        -string password
        -number credits
        -string role
        -ObjectId[] vehicles
        -Date createdAt
        -Date updatedAt
        
        +register() boolean
        +login() string
        +updateProfile() boolean
        +addVehicle() boolean
        +getVehicles() Vehicle[]
        +joinRide() boolean
        +leaveRide() boolean
        +createReview() boolean
        +getHistory() Ride[]
    }
    
    class Vehicle {
        -ObjectId _id
        -ObjectId userId
        -string brand
        -string model
        -string plate
        -string energy
        -number seats
        -Date createdAt
        -Date updatedAt
        
        +create() boolean
        +update() boolean
        +delete() boolean
        +validate() boolean
        +getByUser() Vehicle[]
    }
    
    class Ride {
        -ObjectId _id
        -ObjectId driver
        -ObjectId vehicle
        -string departure
        -string arrival
        -Date departureDate
        -string departureTime
        -number price
        -number totalSeats
        -number availableSeats
        -string description
        -boolean isEcologic
        -string[] stops
        -ObjectId[] passengers
        -string status
        -Date createdAt
        -Date updatedAt
        
        +create() boolean
        +addPassenger() boolean
        +removePassenger() boolean
        +start() boolean
        +complete() boolean
        +cancel() boolean
        +search() Ride[]
        +getByDriver() Ride[]
        +getByPassenger() Ride[]
    }
    
    class Review {
        -ObjectId _id
        -ObjectId rideId
        -ObjectId driverId
        -ObjectId authorId
        -number rating
        -string comment
        -string status
        -Date createdAt
        -Date updatedAt
        
        +create() boolean
        +moderate() boolean
        +approve() boolean
        +reject() boolean
        +getByDriver() Review[]
        +getByRide() Review[]
    }
    
    class CreditTransaction {
        -ObjectId _id
        -ObjectId userId
        -ObjectId rideId
        -number amount
        -string type
        -string description
        -Date createdAt
        
        +create() boolean
        +processPayment() boolean
        +refund() boolean
        +getByUser() CreditTransaction[]
        +getBalance() number
    }
    
    User ||--o{ Vehicle : owns
    User ||--o{ Ride : drives
    User }o--o{ Ride : passenger_in
    Ride ||--o{ Review : has
    User ||--o{ Review : writes
    User ||--o{ CreditTransaction : performs
    Vehicle ||--o{ Ride : used_in
    Ride ||--o{ CreditTransaction : triggers
```

### **5.2 Classes Contrôleurs**

```mermaid
classDiagram
    class UserController {
        +register(req, res) void
        +login(req, res) void
        +getProfile(req, res) void
        +updateProfile(req, res) void
        +getUserHistory(req, res) void
    }
    
    class VehicleController {
        +createVehicle(req, res) void
        +getUserVehicles(req, res) void
        +updateVehicle(req, res) void
        +deleteVehicle(req, res) void
    }
    
    class RideController {
        +createRide(req, res) void
        +searchRides(req, res) void
        +getRideDetails(req, res) void
        +joinRide(req, res) void
        +leaveRide(req, res) void
        +updateRideStatus(req, res) void
        +getUserRides(req, res) void
    }
    
    class ReviewController {
        +createReview(req, res) void
        +getReviewsByDriver(req, res) void
        +moderateReview(req, res) void
        +approveReview(req, res) void
        +rejectReview(req, res) void
    }
    
    UserController --> User
    VehicleController --> Vehicle
    RideController --> Ride
    ReviewController --> Review
```

---

## 🏛️ **6. ARCHITECTURE TECHNIQUE** {#architecture}

### **6.1 Vue d'Ensemble de l'Architecture**

```mermaid
graph TB
    subgraph "Frontend"
        UI[🌐 Interface Utilisateur]
        JS[📱 JavaScript/SPA]
        CSS[🎨 CSS/Responsive]
    end
    
    subgraph "Backend"
        API[⚙️ API REST Express]
        AUTH[🔐 JWT Authentication]
        VALID[✅ Validation Middleware]
        SEC[🛡️ Security Layer]
    end
    
    subgraph "Base de Données"
        MONGO[(🍃 MongoDB)]
        MYSQL[(🐬 MySQL)]
    end
    
    subgraph "Infrastructure"
        LOGS[📋 Logging System]
        MONITOR[📊 Health Monitoring]
        RATE[⏱️ Rate Limiting]
    end
    
    UI --> JS
    JS --> API
    API --> AUTH
    AUTH --> VALID
    VALID --> SEC
    
    API --> MONGO
    API --> MYSQL
    
    API --> LOGS
    API --> MONITOR
    SEC --> RATE
    
    style UI fill:#e3f2fd
    style API fill:#f3e5f5
    style MONGO fill:#e8f5e8
    style MYSQL fill:#fff3e0
```

### **6.2 Architecture en Couches**

```mermaid
graph TD
    subgraph "Couche Présentation"
        P1[Pages HTML]
        P2[Styles CSS]
        P3[Scripts JavaScript]
        P4[Composants UI]
    end
    
    subgraph "Couche Logique Métier"
        L1[Contrôleurs API]
        L2[Services Métier]
        L3[Validations]
        L4[Authentification]
    end
    
    subgraph "Couche Accès Données"
        D1[Modèles Mongoose]
        D2[Requêtes MySQL]
        D3[Cache Redis]
        D4[Transactions]
    end
    
    subgraph "Couche Persistance"
        DB1[(MongoDB)]
        DB2[(MySQL)]
        DB3[(Redis Cache)]
    end
    
    P1 --> L1
    P2 --> L1
    P3 --> L1
    P4 --> L1
    
    L1 --> L2
    L2 --> L3
    L3 --> L4
    
    L2 --> D1
    L2 --> D2
    L2 --> D3
    L2 --> D4
    
    D1 --> DB1
    D2 --> DB2
    D3 --> DB3
```

### **6.3 Flux de Données**

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Router
    participant M as Middleware
    participant Ctrl as Controller
    participant S as Service
    participant DB as Database
    
    C->>R: HTTP Request
    R->>M: Route Matching
    M->>M: Authentication
    M->>M: Validation
    M->>M: Rate Limiting
    M->>Ctrl: Validated Request
    Ctrl->>S: Business Logic
    S->>DB: Data Operations
    DB-->>S: Data Response
    S-->>Ctrl: Processed Data
    Ctrl-->>M: HTTP Response
    M-->>R: Final Response
    R-->>C: JSON Response
```

---

## 🚀 **7. DIAGRAMME DE DÉPLOIEMENT** {#deploiement}

### **7.1 Architecture de Déploiement**

```mermaid
graph TB
    subgraph "Client Tier"
        BROWSER[🌐 Navigateur Web]
        MOBILE[📱 Application Mobile]
    end
    
    subgraph "Load Balancer"
        LB[⚖️ Load Balancer<br/>nginx]
    end
    
    subgraph "Application Tier"
        APP1[🚀 Node.js Server 1<br/>Port 3002]
        APP2[🚀 Node.js Server 2<br/>Port 3003]
        APP3[🚀 Node.js Server 3<br/>Port 3004]
    end
    
    subgraph "Database Tier"
        MONGO_PRIMARY[(🍃 MongoDB Primary)]
        MONGO_SECONDARY[(🍃 MongoDB Secondary)]
        MYSQL_PRIMARY[(🐬 MySQL Primary)]
        MYSQL_SECONDARY[(🐬 MySQL Secondary)]
        REDIS[(📊 Redis Cache)]
    end
    
    subgraph "Monitoring & Logs"
        MONITOR[📊 Monitoring<br/>Grafana]
        LOGS[📋 Logs<br/>ELK Stack]
        HEALTH[🏥 Health Checks]
    end
    
    BROWSER --> LB
    MOBILE --> LB
    
    LB --> APP1
    LB --> APP2
    LB --> APP3
    
    APP1 --> MONGO_PRIMARY
    APP2 --> MONGO_PRIMARY
    APP3 --> MONGO_PRIMARY
    
    MONGO_PRIMARY --> MONGO_SECONDARY
    
    APP1 --> MYSQL_PRIMARY
    APP2 --> MYSQL_PRIMARY
    APP3 --> MYSQL_PRIMARY
    
    MYSQL_PRIMARY --> MYSQL_SECONDARY
    
    APP1 --> REDIS
    APP2 --> REDIS
    APP3 --> REDIS
    
    APP1 --> MONITOR
    APP2 --> MONITOR
    APP3 --> MONITOR
    
    APP1 --> LOGS
    APP2 --> LOGS
    APP3 --> LOGS
    
    LB --> HEALTH
    
    style BROWSER fill:#e3f2fd
    style LB fill:#f3e5f5
    style APP1 fill:#e8f5e8
    style MONGO_PRIMARY fill:#fff3e0
    style MYSQL_PRIMARY fill:#fce4ec
```

### **7.2 Environnements de Déploiement**

```mermaid
graph LR
    subgraph "Développement"
        DEV_DB[(Local DB)]
        DEV_SERVER[🚀 localhost:3002]
        DEV_CLIENT[📱 Live Server]
    end
    
    subgraph "Test/Staging"
        TEST_DB[(Test DB)]
        TEST_SERVER[🚀 staging.ecoride.fr]
        TEST_CLIENT[📱 Test Environment]
    end
    
    subgraph "Production"
        PROD_DB[(Production DB)]
        PROD_SERVER[🚀 api.ecoride.fr]
        PROD_CLIENT[📱 ecoride.fr]
    end
    
    DEV_CLIENT --> DEV_SERVER
    DEV_SERVER --> DEV_DB
    
    TEST_CLIENT --> TEST_SERVER
    TEST_SERVER --> TEST_DB
    
    PROD_CLIENT --> PROD_SERVER
    PROD_SERVER --> PROD_DB
    
    DEV_SERVER -.->|Deploy| TEST_SERVER
    TEST_SERVER -.->|Deploy| PROD_SERVER
```

### **7.3 Configuration de Sécurité**

```mermaid
graph TD
    subgraph "Sécurité Réseau"
        FW[🔥 Firewall]
        SSL[🔒 SSL/TLS Certificate]
        DDoS[🛡️ DDoS Protection]
    end
    
    subgraph "Sécurité Application"
        JWT[🎫 JWT Tokens]
        BCRYPT[🔐 bcrypt Hashing]
        HELMET[⛑️ Helmet.js]
        CORS[🌐 CORS Policy]
        RATE[⏱️ Rate Limiting]
    end
    
    subgraph "Sécurité Base de Données"
        DB_AUTH[🔑 DB Authentication]
        DB_ENCRYPT[🔒 Data Encryption]
        DB_BACKUP[💾 Encrypted Backups]
    end
    
    FW --> JWT
    SSL --> BCRYPT
    DDoS --> HELMET
    
    JWT --> DB_AUTH
    HELMET --> DB_ENCRYPT
    CORS --> DB_BACKUP
    
    style FW fill:#ffebee
    style JWT fill:#e8f5e8
    style DB_AUTH fill:#e3f2fd
```

---

## 📈 **CONCLUSION**

Cette documentation UML complète de **EcoRide** fournit :

### ✅ **Avantages de cette Analyse**
- **Vision globale** du système et de ses interactions
- **Guide technique** pour les développeurs
- **Base documentaire** pour la maintenance et l'évolution
- **Référence** pour les audits de sécurité et qualité

### 🔄 **Évolutions Prévues**
- Intégration d'une API de géolocalisation en temps réel
- Système de notifications push
- Module de paiement intégré (Stripe/PayPal)
- Intelligence artificielle pour l'optimisation des trajets

### 📊 **Métriques Techniques**
- **Modularité** : Architecture en couches découplées
- **Scalabilité** : Support horizontal avec load balancing
- **Sécurité** : Authentification JWT + bcrypt + rate limiting
- **Performance** : Cache Redis + optimisations base de données

---

*Ce document évolue avec le projet EcoRide. Dernière mise à jour : 3 octobre 2025*