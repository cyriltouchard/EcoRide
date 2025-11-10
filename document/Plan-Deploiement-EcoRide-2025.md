# 🚀 **PLAN DE DÉPLOIEMENT ECORIDE 2025**

*Guide complet de déploiement moderne avec Docker, Infrastructure as Code et DevOps*  
*Version 3.0 - Dernière mise à jour : 9 octobre 2025 - Intégration Docker*

---

## 📋 **RÉSUMÉ EXÉCUTIF**

### **🎯 Objectifs du Déploiement**
- **Containerisation** : Déploiement Docker moderne et portable
- **Performance** : Haute disponibilité 99.9% avec load balancing
- **Sécurité** : Architecture Zero Trust avec chiffrement end-to-end
- **Scalabilité** : Auto-scaling horizontal selon la charge
- **Monitoring** : Observabilité complète avec Azure Monitor
- **Compliance** : Respect RGPD et standards sécurité Azure

### **🐳 Nouvelles Capacités Docker**
- **Stack complète** containerisée (App + MongoDB + MySQL)
- **Déploiement rapide** : < 1 minute pour environnement complet
- **Scaling horizontal** : `docker-compose scale ecoride-app=N`
- **Isolation sécurisée** : Conteneurs avec permissions minimales
- **Rollback instantané** : Versions d'images tagguées

### **📊 Métriques Cibles**
| Métrique | Objectif | Monitoring |
|----------|----------|------------|
| **Disponibilité** | 99.9% uptime | Azure Monitor |
| **Temps de réponse** | < 200ms API | Application Insights |
| **Scalabilité** | 0-1000 utilisateurs | Auto-scaling |
| **Récupération** | RTO: 1h, RPO: 15min | Backup automatisé |
| **Sécurité** | Zero CVE critique | Azure Security Center |
| **Déploiement Docker** | < 2 minutes | Container Health |

---

## 🐳 **0. STRATÉGIE CONTAINERISATION** {#docker-strategy}

### **0.1 Architecture Docker EcoRide**

EcoRide est maintenant entièrement containerisé pour un déploiement moderne et portable.

#### **🏗️ Stack Containerisée**
```yaml
# docker-compose.yml - Production Ready
version: '3.8'
services:
  ecoride-app:
    image: ecoride:latest
    replicas: 3
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo-cluster:27017/ecoride
      - MYSQL_HOST=mysql-cluster
    depends_on: [ecoride-mongo, ecoride-mysql]
    
  ecoride-mongo:
    image: mongo:7.0-alpine
    volumes: [mongo_data:/data/db]
    
  ecoride-mysql:
    image: mysql:8.0
    volumes: [mysql_data:/var/lib/mysql]
```

#### **📦 Avantages Containerisation**
✅ **Environnement reproductible** : Dev = Test = Prod  
✅ **Déploiement rapide** : Stack complète en < 2 minutes  
✅ **Isolation sécurisée** : Containers avec permissions minimales  
✅ **Scaling horizontal** : `docker service scale ecoride-app=5`  
✅ **Zero-downtime deployment** : Rolling updates  
✅ **Portabilité cloud** : Azure Container Instances/Apps

### **0.2 Pipeline Docker CI/CD**

```yaml
# .github/workflows/docker-deploy.yml
name: Docker Deploy Pipeline
on:
  push:
    branches: [main]
    
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker Image
        run: |
          docker build -t ecoride:${{ github.sha }} .
          docker tag ecoride:${{ github.sha }} ecoride:latest
          
      - name: Push to Registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ecoride:${{ github.sha }}
          docker push ecoride:latest
          
      - name: Deploy to Azure
        run: |
          az container create \
            --resource-group ecoride-prod \
            --name ecoride-app \
            --image ecoride:${{ github.sha }} \
            --cpu 2 --memory 4
```

### **0.3 Monitoring Containers**

```bash
# Health checks et monitoring
docker-compose exec ecoride-app curl -f http://localhost:3000/api/health
docker stats ecoride-app ecoride-mongo ecoride-mysql

# Logs centralisés
docker-compose logs -f --tail=100 ecoride-app

# Metrics avec Prometheus
docker run -p 9090:9090 prom/prometheus
```

---

## 🏗️ **1. ARCHITECTURE DE DÉPLOIEMENT** {#architecture}

### **1.1 Vue d'Ensemble Azure**

```
┌─────────────────────────────────────────────────────────────┐
│                    Azure Cloud Platform                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Azure CDN   │  │ Front Door  │  │ App Gateway │        │
│  │ (Global)    │  │ (WAF)       │  │ (Load Bal.) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│         │                 │                 │             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Azure Container Apps                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ EcoRide API │  │ EcoRide API │  │ EcoRide API │  │   │
│  │  │ Instance 1  │  │ Instance 2  │  │ Instance 3  │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                 │                 │             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ MongoDB     │  │ Azure SQL   │  │ Redis Cache │        │
│  │ Atlas       │  │ Database    │  │ (Session)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### **1.2 Services Azure Recommandés**

#### **🚀 Compute & Hosting**
| Service | Usage | Configuration |
|---------|-------|---------------|
| **Azure Container Apps** | API EcoRide | Auto-scaling 1-10 instances |
| **Azure Static Web Apps** | Frontend | CDN intégré, CI/CD GitHub |
| **Azure Functions** | Microservices | Serverless pour tâches async |

#### **🗄️ Data & Storage**
| Service | Usage | Configuration |
|---------|-------|---------------|
| **Azure SQL Database** | Données transactionnelles | Business Critical, Zone Redundant |
| **Azure CosmosDB** | Documents MongoDB | API MongoDB, Multi-region |
| **Azure Redis Cache** | Sessions/Cache | Premium tier, Clustering |
| **Azure Storage** | Assets/Logs | Hot tier, Geo-replication |

#### **🔒 Security & Networking**
| Service | Usage | Configuration |
|---------|-------|---------------|
| **Azure Key Vault** | Secrets management | Hardware HSM, RBAC |
| **Azure Front Door** | WAF + CDN | DDoS protection, SSL/TLS |
| **Azure Private Link** | Network security | Private endpoints |
| **Azure Active Directory** | Identity management | B2C pour utilisateurs |

---

## 🛠️ **2. INFRASTRUCTURE AS CODE** {#iac}

### **2.1 Bicep Template Principal**

```bicep
// main.bicep - Infrastructure EcoRide
@description('Environnement de déploiement')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Région Azure principale')
param location string = resourceGroup().location

@description('Nom du projet')
param projectName string = 'ecoride'

// Variables calculées
var resourcePrefix = '${projectName}-${environment}'
var tags = {
  Project: 'EcoRide'
  Environment: environment
  CostCenter: 'IT-Platform'
  Owner: 'DevOps-Team'
}

// === NETWORKING ===
resource vnet 'Microsoft.Network/virtualNetworks@2023-05-01' = {
  name: '${resourcePrefix}-vnet'
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: ['10.0.0.0/16']
    }
    subnets: [
      {
        name: 'webapp-subnet'
        properties: {
          addressPrefix: '10.0.1.0/24'
          privateEndpointNetworkPolicies: 'Disabled'
        }
      }
      {
        name: 'database-subnet'
        properties: {
          addressPrefix: '10.0.2.0/24'
          serviceEndpoints: [
            {
              service: 'Microsoft.Sql'
            }
          ]
        }
      }
    ]
  }
}

// === CONTAINER APPS ENVIRONMENT ===
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${resourcePrefix}-env'
  location: location
  tags: tags
  properties: {
    vnetConfiguration: {
      infrastructureSubnetId: vnet.properties.subnets[0].id
    }
    zoneRedundant: environment == 'prod' ? true : false
  }
}

// === APPLICATION ===
resource ecoRideApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${resourcePrefix}-api'
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 3002
        allowInsecure: false
      }
      secrets: [
        {
          name: 'mongo-connection'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/mongo-connection'
          identity: userAssignedIdentity.id
        }
        {
          name: 'sql-connection'
          keyVaultUrl: '${keyVault.properties.vaultUri}secrets/sql-connection'
          identity: userAssignedIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'ecoride-api'
          image: 'ecoride.azurecr.io/api:latest'
          resources: {
            cpu: environment == 'prod' ? 1 : 0.5
            memory: environment == 'prod' ? '2Gi' : '1Gi'
          }
          env: [
            {
              name: 'NODE_ENV'
              value: environment
            }
            {
              name: 'PORT'
              value: '3002'
            }
            {
              name: 'MONGO_URI'
              secretRef: 'mongo-connection'
            }
            {
              name: 'DB_CONNECTION'
              secretRef: 'sql-connection'
            }
          ]
        }
      ]
      scale: {
        minReplicas: environment == 'prod' ? 2 : 1
        maxReplicas: environment == 'prod' ? 10 : 3
        rules: [
          {
            name: 'http-requests'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentity.id}': {}
    }
  }
}

// === DATABASE SERVICES ===
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: '${resourcePrefix}-sql'
  location: location
  tags: tags
  properties: {
    administratorLogin: 'sqladmin'
    administratorLoginPassword: sqlAdminPassword
    publicNetworkAccess: 'Disabled'
  }
  identity: {
    type: 'SystemAssigned'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: 'ecoride'
  location: location
  tags: tags
  sku: {
    name: environment == 'prod' ? 'S2' : 'S1'
    tier: 'Standard'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: environment == 'prod' ? 268435456000 : 34359738368 // 250GB prod, 32GB dev
    requestedBackupStorageRedundancy: environment == 'prod' ? 'GeoZone' : 'Local'
  }
}

// === COSMOS DB (MongoDB API) ===
resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-09-15' = {
  name: '${resourcePrefix}-cosmos'
  location: location
  tags: tags
  kind: 'MongoDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: environment == 'prod' ? true : false
      }
    ]
    capabilities: [
      {
        name: 'EnableMongo'
      }
    ]
    publicNetworkAccess: 'Disabled'
    networkAclBypass: 'AzureServices'
  }
}

// === REDIS CACHE ===
resource redisCache 'Microsoft.Cache/redis@2023-08-01' = {
  name: '${resourcePrefix}-redis'
  location: location
  tags: tags
  properties: {
    sku: {
      name: environment == 'prod' ? 'Premium' : 'Standard'
      family: environment == 'prod' ? 'P' : 'C'
      capacity: environment == 'prod' ? 1 : 1
    }
    enableNonSslPort: false
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Disabled'
    redisConfiguration: {
      'maxmemory-policy': 'allkeys-lru'
    }
  }
}

// === KEY VAULT ===
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: '${resourcePrefix}-kv'
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenant().tenantId
    enabledForDeployment: true
    enabledForTemplateDeployment: true
    enableRbacAuthorization: true
    publicNetworkAccess: 'Disabled'
    networkAcls: {
      defaultAction: 'Deny'
      bypass: 'AzureServices'
    }
  }
}

// === MANAGED IDENTITY ===
resource userAssignedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${resourcePrefix}-identity'
  location: location
  tags: tags
}

// === OUTPUTS ===
output appUrl string = 'https://${ecoRideApp.properties.configuration.ingress.fqdn}'
output sqlServerName string = sqlServer.name
output cosmosAccountName string = cosmosAccount.name
output keyVaultName string = keyVault.name
```

### **2.2 Paramètres par Environnement**

#### **Développement (dev.bicepparam)**
```bicep
using 'main.bicep'

param environment = 'dev'
param location = 'francecentral'
param projectName = 'ecoride'
```

#### **Production (prod.bicepparam)**
```bicep
using 'main.bicep'

param environment = 'prod'
param location = 'francecentral'
param projectName = 'ecoride'
```

---

## 🔄 **3. PIPELINE CI/CD** {#cicd}

### **3.1 GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: 🚀 EcoRide Deployment Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AZURE_RESOURCE_GROUP: 'rg-ecoride-prod'
  AZURE_LOCATION: 'francecentral'
  CONTAINER_REGISTRY: 'ecoride.azurecr.io'

jobs:
  # === TESTS ET QUALITÉ ===
  test-and-quality:
    runs-on: ubuntu-latest
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🏗️ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 📦 Install dependencies
        run: |
          cd server
          npm ci

      - name: 🧪 Run tests
        run: |
          cd server
          npm run test

      - name: 🔍 Security audit
        run: |
          cd server
          npm audit --audit-level high

      - name: 📊 SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # === BUILD CONTAINER ===
  build-container:
    needs: test-and-quality
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔑 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🐳 Build and push container
        run: |
          az acr build --registry ${{ env.CONTAINER_REGISTRY }} \
                       --image api:${{ github.sha }} \
                       --image api:latest \
                       --file server/Dockerfile \
                       server/

  # === INFRASTRUCTURE PROVISIONING ===
  provision-infrastructure:
    needs: build-container
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔑 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🏗️ Deploy Infrastructure
        run: |
          az deployment group create \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --template-file infra/main.bicep \
            --parameters infra/prod.bicepparam \
            --mode Incremental

  # === APPLICATION DEPLOYMENT ===
  deploy-application:
    needs: provision-infrastructure
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🔑 Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: 🚀 Deploy Container App
        run: |
          az containerapp update \
            --name ecoride-prod-api \
            --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
            --image ${{ env.CONTAINER_REGISTRY }}/api:${{ github.sha }}

      - name: 🏥 Health Check
        run: |
          sleep 30
          APP_URL=$(az containerapp show --name ecoride-prod-api \
                                        --resource-group ${{ env.AZURE_RESOURCE_GROUP }} \
                                        --query properties.configuration.ingress.fqdn -o tsv)
          curl -f https://$APP_URL/api/health || exit 1

  # === TESTS POST-DÉPLOIEMENT ===
  post-deployment-tests:
    needs: deploy-application
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 🧪 Integration Tests
        run: |
          cd tests/integration
          npm ci
          npm run test:prod

      - name: 🚨 Smoke Tests
        run: |
          cd tests/smoke
          npm ci
          npm run test
```

### **3.2 Scripts de Déploiement**

#### **deploy.sh - Script Principal**
```bash
#!/bin/bash
# Deploy EcoRide to Azure
set -e

ENVIRONMENT=${1:-"dev"}
RESOURCE_GROUP="rg-ecoride-${ENVIRONMENT}"
LOCATION="francecentral"

echo "🚀 Déploiement EcoRide - Environnement: ${ENVIRONMENT}"

# Vérification prérequis
echo "🔍 Vérification des prérequis..."
az --version > /dev/null || { echo "❌ Azure CLI requis"; exit 1; }
docker --version > /dev/null || { echo "❌ Docker requis"; exit 1; }

# Création du groupe de ressources
echo "🏗️ Création du groupe de ressources..."
az group create --name "${RESOURCE_GROUP}" --location "${LOCATION}"

# Build et push de l'image
echo "🐳 Build et push du container..."
az acr build --registry ecoride.azurecr.io \
             --image "api:$(git rev-parse --short HEAD)" \
             --image "api:latest" \
             --file server/Dockerfile \
             server/

# Déploiement de l'infrastructure
echo "🏗️ Déploiement de l'infrastructure..."
az deployment group create \
  --resource-group "${RESOURCE_GROUP}" \
  --template-file "infra/main.bicep" \
  --parameters "infra/${ENVIRONMENT}.bicepparam" \
  --mode Incremental

# Mise à jour de l'application
echo "🚀 Mise à jour de l'application..."
az containerapp update \
  --name "ecoride-${ENVIRONMENT}-api" \
  --resource-group "${RESOURCE_GROUP}" \
  --image "ecoride.azurecr.io/api:$(git rev-parse --short HEAD)"

# Tests de santé
echo "🏥 Tests de santé..."
sleep 30
APP_URL=$(az containerapp show --name "ecoride-${ENVIRONMENT}-api" \
                              --resource-group "${RESOURCE_GROUP}" \
                              --query properties.configuration.ingress.fqdn -o tsv)

curl -f "https://${APP_URL}/api/health" || { 
  echo "❌ Échec des tests de santé"; 
  exit 1; 
}

echo "✅ Déploiement réussi! URL: https://${APP_URL}"
```

---

## 🔒 **4. SÉCURITÉ ET COMPLIANCE** {#security}

### **4.1 Security Checklist**

#### **🔐 Identity & Access Management**
- [ ] **Azure AD B2C** configuré pour les utilisateurs finaux
- [ ] **Managed Identity** pour les services Azure
- [ ] **RBAC** avec principe de moindre privilège
- [ ] **Key Vault** pour tous les secrets
- [ ] **Credential rotation** automatisée

#### **🛡️ Network Security**
- [ ] **Private Endpoints** pour toutes les bases de données
- [ ] **WAF** configuré sur Azure Front Door
- [ ] **DDoS Protection** activé
- [ ] **Network Security Groups** restrictifs
- [ ] **VNet Integration** pour Container Apps

#### **📊 Monitoring & Compliance**
- [ ] **Azure Security Center** activé
- [ ] **Azure Sentinel** pour SIEM
- [ ] **Compliance Policies** RGPD appliquées
- [ ] **Audit Logs** conservés 2 ans
- [ ] **Vulnerability Assessment** automatisé

### **4.2 Configuration de Sécurité**

#### **Key Vault Secrets**
```bash
# Secrets obligatoires pour le déploiement
az keyvault secret set --vault-name "ecoride-prod-kv" \
                       --name "mongo-connection" \
                       --value "mongodb://..."

az keyvault secret set --vault-name "ecoride-prod-kv" \
                       --name "sql-connection" \
                       --value "Server=...;Database=..."

az keyvault secret set --vault-name "ecoride-prod-kv" \
                       --name "jwt-secret" \
                       --value "$(openssl rand -base64 64)"

az keyvault secret set --vault-name "ecoride-prod-kv" \
                       --name "redis-connection" \
                       --value "ecoride-prod-redis.redis.cache.windows.net:6380,password=..."
```

#### **RBAC Assignments**
```bash
# Assignation des rôles pour Container Apps
az role assignment create \
  --assignee "${MANAGED_IDENTITY_ID}" \
  --role "Key Vault Secrets User" \
  --scope "/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.KeyVault/vaults/${KEY_VAULT_NAME}"

az role assignment create \
  --assignee "${MANAGED_IDENTITY_ID}" \
  --role "SQL DB Contributor" \
  --scope "/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}/providers/Microsoft.Sql/servers/${SQL_SERVER_NAME}"
```

---

## 📊 **5. MONITORING ET OBSERVABILITÉ** {#monitoring}

### **5.1 Azure Monitor Configuration**

#### **Application Insights**
```javascript
// server/middleware/monitoring.js
const appInsights = require('applicationinsights');

// Configuration Application Insights
appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(true)
  .start();

const client = appInsights.defaultClient;

// Métriques custom EcoRide
const trackCustomMetrics = (req, res, next) => {
  client.trackMetric({
    name: 'API Request Count',
    value: 1,
    properties: {
      endpoint: req.path,
      method: req.method,
      userAgent: req.get('User-Agent')
    }
  });
  
  // Track ride bookings
  if (req.path.includes('/rides/book')) {
    client.trackEvent({
      name: 'Ride Booked',
      properties: {
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  next();
};

module.exports = { trackCustomMetrics };
```

### **5.2 Alertes et Dashboards**

#### **Alertes Critiques**
```yaml
# Azure Monitor Alerts (ARM Template)
apiVersion: 2018-03-01
kind: Application Insights
properties:
  alerts:
    - name: "High Error Rate"
      condition: "requests/failed > 5%"
      frequency: "PT5M"
      action: "email + teams"
      
    - name: "High Response Time"
      condition: "requests/duration > 2000ms"
      frequency: "PT5M"
      action: "email"
      
    - name: "Database Connection Issues"
      condition: "dependencies/failed contains 'database'"
      frequency: "PT1M"
      action: "email + teams + sms"
      
    - name: "Low Availability"
      condition: "availability < 99%"
      frequency: "PT15M"
      action: "email + teams + sms"
```

#### **Dashboard KPIs**
- **Performances** : Temps de réponse, throughput, erreurs 5xx
- **Utilisateurs** : Connexions actives, nouvelles inscriptions
- **Business** : Réservations, revenus, taux de conversion
- **Infrastructure** : CPU, mémoire, réseau, storage
- **Sécurité** : Tentatives d'authentification, erreurs 401/403

---

## 💾 **6. SAUVEGARDE ET RÉCUPÉRATION** {#backup}

### **6.1 Stratégie de Backup**

#### **Base de Données SQL**
```bash
# Backup automatisé Azure SQL Database
az sql db export \
  --server "ecoride-prod-sql" \
  --name "ecoride" \
  --admin-user "sqladmin" \
  --admin-password "${SQL_PASSWORD}" \
  --storage-key-type "StorageAccessKey" \
  --storage-key "${STORAGE_KEY}" \
  --storage-uri "https://ecoridebkp.blob.core.windows.net/backups/ecoride-$(date +%Y%m%d).bacpac"

# Retention: 35 jours automatique + Long-term retention 7 ans
az sql db ltr-policy set \
  --server "ecoride-prod-sql" \
  --database "ecoride" \
  --weekly-retention "P12W" \
  --monthly-retention "P12M" \
  --yearly-retention "P7Y"
```

#### **Cosmos DB (MongoDB)**
```bash
# Backup continu activé par défaut
az cosmosdb update \
  --name "ecoride-prod-cosmos" \
  --resource-group "rg-ecoride-prod" \
  --backup-policy-type "Continuous"

# Point-in-time restore disponible sur 7 jours
```

### **6.2 Plan de Récupération (DRP)**

#### **Procédure de Récupération**
1. **RTO: 1 heure** - Temps maximum de récupération
2. **RPO: 15 minutes** - Perte de données maximale acceptable
3. **Escalation** : DevOps → Tech Lead → CTO
4. **Communication** : Status page + utilisateurs

#### **Script de Récupération d'Urgence**
```bash
#!/bin/bash
# disaster-recovery.sh
set -e

BACKUP_DATE=${1:-$(date -d yesterday +%Y%m%d)}
TARGET_REGION=${2:-"francesouth"}

echo "🚨 RÉCUPÉRATION D'URGENCE - Date: ${BACKUP_DATE}"

# 1. Déploiement infrastructure de secours
echo "🏗️ Déploiement infrastructure de secours..."
az deployment group create \
  --resource-group "rg-ecoride-dr" \
  --template-file "infra/disaster-recovery.bicep" \
  --parameters location="${TARGET_REGION}" \
               backupDate="${BACKUP_DATE}"

# 2. Restauration base SQL
echo "📦 Restauration Azure SQL Database..."
az sql db import \
  --server "ecoride-dr-sql" \
  --name "ecoride" \
  --admin-user "sqladmin" \
  --admin-password "${SQL_PASSWORD}" \
  --storage-key "${STORAGE_KEY}" \
  --storage-uri "https://ecoridebkp.blob.core.windows.net/backups/ecoride-${BACKUP_DATE}.bacpac"

# 3. Restauration Cosmos DB
echo "🍃 Restauration Cosmos DB..."
az cosmosdb restore \
  --target-database-account-name "ecoride-dr-cosmos" \
  --account-name "ecoride-prod-cosmos" \
  --restore-timestamp "$(date -d '1 hour ago' --iso-8601=seconds)" \
  --location "${TARGET_REGION}"

# 4. Redirection DNS
echo "🌐 Redirection DNS..."
az network dns record-set cname set-record \
  --resource-group "rg-ecoride-dns" \
  --zone-name "ecoride.fr" \
  --record-set-name "api" \
  --cname "ecoride-dr-api.${TARGET_REGION}.azurecontainerapps.io"

echo "✅ Récupération terminée - Service accessible sur région de secours"
```

---

## 🧪 **7. TESTS ET VALIDATION** {#testing}

### **7.1 Stratégie de Tests**

#### **Tests Automatisés**
```javascript
// tests/integration/deployment.test.js
const request = require('supertest');
const { expect } = require('chai');

describe('🚀 Deployment Integration Tests', () => {
  const baseUrl = process.env.TEST_BASE_URL || 'https://ecoride-staging-api.francecentral.azurecontainerapps.io';
  
  describe('Health Checks', () => {
    it('should return healthy status', async () => {
      const response = await request(baseUrl)
        .get('/api/health')
        .expect(200);
        
      expect(response.body.status).to.equal('OK');
      expect(response.body.services.mongodb).to.equal('connected');
      expect(response.body.services.mysql).to.equal('connected');
      expect(response.body.services.redis).to.equal('connected');
    });
  });
  
  describe('Database Connectivity', () => {
    it('should connect to all databases', async () => {
      const response = await request(baseUrl)
        .get('/api/health/detailed')
        .expect(200);
        
      expect(response.body.databases.mongodb.latency).to.be.below(100);
      expect(response.body.databases.mysql.latency).to.be.below(100);
      expect(response.body.databases.redis.latency).to.be.below(50);
    });
  });
  
  describe('Performance Tests', () => {
    it('should handle 100 concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(baseUrl)
            .get('/api/health')
            .expect(200)
        );
      }
      
      const startTime = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      expect(duration).to.be.below(5000); // Max 5 secondes pour 100 requêtes
    });
  });
});
```

### **7.2 Load Testing avec Azure Load Testing**

```yaml
# load-test-config.yaml
testName: "EcoRide Performance Test"
testDescription: "Load test pour l'API EcoRide"
engineInstances: 5

testPlan: |
  # JMeter Test Plan pour EcoRide
  scenarios:
    - name: "User Registration"
      weight: 20%
      endpoint: "/api/auth/register"
      rampUp: 60s
      users: 50
      
    - name: "User Login"
      weight: 30%
      endpoint: "/api/auth/login"
      rampUp: 60s
      users: 100
      
    - name: "Search Rides"
      weight: 40%
      endpoint: "/api/rides/search"
      rampUp: 60s
      users: 200
      
    - name: "Book Ride"
      weight: 10%
      endpoint: "/api/rides/book"
      rampUp: 60s
      users: 30

criteria:
  - metric: "response_time_95percentile"
    threshold: 2000ms
    action: "fail"
    
  - metric: "error_percentage"
    threshold: 1%
    action: "fail"
    
  - metric: "throughput"
    threshold: 100
    action: "continue"
```

---

## 📈 **8. OPTIMISATION ET PERFORMANCE** {#optimization}

### **8.1 Auto-Scaling Configuration**

#### **Container Apps Scaling Rules**
```bicep
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  properties: {
    template: {
      scale: {
        minReplicas: environment == 'prod' ? 2 : 1
        maxReplicas: environment == 'prod' ? 20 : 5
        rules: [
          {
            name: 'http-requests'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
          {
            name: 'cpu-utilization'
            custom: {
              type: 'cpu'
              metadata: {
                type: 'Utilization'
                value: '70'
              }
            }
          }
          {
            name: 'memory-utilization'
            custom: {
              type: 'memory'
              metadata: {
                type: 'Utilization'
                value: '80'
              }
            }
          }
        ]
      }
    }
  }
}
```

### **8.2 Optimisations Database**

#### **Index Strategy**
```sql
-- Optimisations MySQL pour EcoRide
-- Index pour recherche de trajets
CREATE INDEX idx_rides_search ON rides(departure_city, arrival_city, departure_date);
CREATE INDEX idx_rides_availability ON rides(available_seats, departure_date) WHERE available_seats > 0;

-- Index pour système de crédits
CREATE INDEX idx_user_credits_balance ON user_credits(user_id, balance);
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id, transaction_date);

-- Partitioning pour les gros volumes
ALTER TABLE credit_transactions 
PARTITION BY RANGE (YEAR(transaction_date)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027)
);
```

#### **Redis Caching Strategy**
```javascript
// server/middleware/cache.js
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_CONNECTION_STRING
});

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.method}:${req.originalUrl}`;
    
    try {
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        client.setex(key, duration, JSON.stringify(data));
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache error:', error);
      next(); // Continue sans cache en cas d'erreur
    }
  };
};

// Usage
app.get('/api/rides/search', cacheMiddleware(600), rideController.search);
app.get('/api/cities', cacheMiddleware(3600), cityController.list);
```

---

## ✅ **9. CHECKLIST DE DÉPLOIEMENT** {#checklist}

### **9.1 Pré-déploiement**

#### **🔧 Infrastructure**
- [ ] **Azure Subscription** configuré avec quotas suffisants
- [ ] **Resource Groups** créés pour tous les environnements
- [ ] **Networking** (VNet, Subnets, NSGs) configuré
- [ ] **Azure Container Registry** créé et accessible
- [ ] **Key Vault** configuré avec tous les secrets

#### **🔐 Sécurité**
- [ ] **Managed Identities** créées et assignées
- [ ] **RBAC** configuré avec principe de moindre privilège
- [ ] **Private Endpoints** configurés pour toutes les DB
- [ ] **WAF Rules** testées et validées
- [ ] **SSL Certificates** installés et valides

#### **📊 Monitoring**
- [ ] **Application Insights** configuré
- [ ] **Log Analytics Workspace** créé
- [ ] **Alertes** configurées pour métriques critiques
- [ ] **Dashboards** créés pour monitoring
- [ ] **Health Checks** implémentés dans l'API

### **9.2 Déploiement**

#### **🚀 Application**
```bash
# Checklist script de déploiement
#!/bin/bash

echo "🔍 Validation pré-déploiement..."

# 1. Vérification connectivité Azure
az account show || { echo "❌ Authentification Azure requise"; exit 1; }

# 2. Vérification des secrets
az keyvault secret show --vault-name "ecoride-prod-kv" --name "mongo-connection" >/dev/null || { echo "❌ Secret MongoDB manquant"; exit 1; }
az keyvault secret show --vault-name "ecoride-prod-kv" --name "sql-connection" >/dev/null || { echo "❌ Secret SQL manquant"; exit 1; }

# 3. Tests de build
docker build -t ecoride-test:local server/ || { echo "❌ Échec build Docker"; exit 1; }

# 4. Tests unitaires
cd server && npm test || { echo "❌ Tests unitaires échoués"; exit 1; }

# 5. Scan sécurité
npm audit --audit-level high || { echo "❌ Vulnérabilités critiques détectées"; exit 1; }

echo "✅ Validation pré-déploiement réussie"
```

### **9.3 Post-déploiement**

#### **🧪 Validation**
- [ ] **Health Check** API répond correctement
- [ ] **Database Connectivity** MongoDB et MySQL accessibles
- [ ] **Authentication** Login/Register fonctionnels
- [ ] **Performance** Temps de réponse < 200ms
- [ ] **Load Test** Passed avec seuils définis

#### **📈 Monitoring**
- [ ] **Métriques** remontent dans Application Insights
- [ ] **Logs** visibles dans Log Analytics
- [ ] **Alertes** configurées et testées
- [ ] **Dashboards** affichent données temps réel
- [ ] **SSL/TLS** validé avec score A+ SSLLabs

---

## 🎯 **10. ROADMAP ET ÉVOLUTIONS** {#roadmap}

### **10.1 Phase 1 : Fondations (Mois 1-2)**
- [x] **Infrastructure de base** Azure Container Apps + Databases
- [x] **CI/CD Pipeline** GitHub Actions complet
- [x] **Monitoring** Application Insights + Alertes
- [x] **Sécurité** Key Vault + Private Endpoints
- [ ] **Tests automatisés** Intégration + Performance

### **10.2 Phase 2 : Production (Mois 3-4)**
- [ ] **Multi-région** Déploiement France Central + France South
- [ ] **CDN Global** Azure Front Door avec cache optimisé
- [ ] **Auto-scaling avancé** Machine Learning-based scaling
- [ ] **Backup strategy** Geo-replication + Point-in-time recovery
- [ ] **Disaster Recovery** RTO < 30min, RPO < 5min

### **10.3 Phase 3 : Optimisation (Mois 5-6)**
- [ ] **Microservices** Décomposition en services métier
- [ ] **Event-driven architecture** Azure Service Bus + Event Grid
- [ ] **Caching distribué** Redis Cluster multi-région
- [ ] **API Management** Azure APIM avec analytics
- [ ] **AI/ML Integration** Azure Cognitive Services

### **10.4 Phase 4 : Innovation (Mois 7+)**
- [ ] **Real-time features** SignalR pour tracking temps réel
- [ ] **Mobile App** React Native + Push notifications
- [ ] **IoT Integration** Tracking véhicules temps réel
- [ ] **Data Analytics** Azure Synapse pour business intelligence
- [ ] **Compliance avancée** ISO 27001 + SOC 2

---

## 📚 **ANNEXES**

### **A. Ressources et Documentation**
- **Azure Architecture Center** : https://docs.microsoft.com/azure/architecture/
- **Container Apps Best Practices** : https://docs.microsoft.com/azure/container-apps/
- **Well-Architected Framework** : https://docs.microsoft.com/azure/architecture/framework/
- **Security Baseline** : https://docs.microsoft.com/security/benchmark/azure/

### **B. Contacts et Support**
- **DevOps Team** : devops@ecoride.fr
- **Security Team** : security@ecoride.fr
- **Azure Support** : Support technique Microsoft Premier

### **C. Glossaire**
- **RTO** : Recovery Time Objective (temps de récupération)
- **RPO** : Recovery Point Objective (perte de données acceptée)
- **WAF** : Web Application Firewall
- **RBAC** : Role-Based Access Control
- **HSM** : Hardware Security Module

---

*© 2025 EcoRide - Document de déploiement confidentiel*
*Version 2.0 - Tous droits réservés*