# Guide de Déploiement EcoRide sur VPS Hostinger

> **Guide complet pour déployer l'application EcoRide sur un serveur VPS Hostinger**  
> Date de création : 4 décembre 2025  
> Version : 1.0

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration initiale du VPS](#configuration-initiale-du-vps)
3. [Installation des dépendances](#installation-des-dépendances)
4. [Configuration de la base de données](#configuration-de-la-base-de-données)
5. [Déploiement de l'application](#déploiement-de-lapplication)
6. [Configuration Nginx](#configuration-nginx)
7. [Sécurisation SSL](#sécurisation-ssl)
8. [Configuration du domaine](#configuration-du-domaine)
9. [Gestion des processus avec PM2](#gestion-des-processus-avec-pm2)
10. [Surveillance et maintenance](#surveillance-et-maintenance)
11. [Troubleshooting](#troubleshooting)

---

## 🔧 Prérequis

### Ce dont vous avez besoin

- ✅ VPS Hostinger actif (Ubuntu 20.04/22.04 recommandé)
- ✅ Accès SSH root au VPS
- ✅ Nom de domaine (ex: ecoride.com)
- ✅ Compte GitHub avec accès au repository EcoRide
- ✅ Client SSH (PuTTY, Terminal, ou PowerShell)

### Informations à préparer

- IP du VPS : `___________________`
- Mot de passe root : `___________________`
- Nom de domaine : `___________________`
- Email pour SSL : `___________________`

---

## 🚀 Configuration initiale du VPS

### Étape 1 : Première connexion SSH

```bash
# Depuis votre ordinateur, connectez-vous au VPS
ssh root@VOTRE_IP_VPS

# Si première connexion, acceptez la clé SSH (tapez 'yes')
```

### Étape 2 : Mise à jour du système

```bash
# Mettre à jour la liste des paquets
apt update

# Mettre à jour tous les paquets installés
apt upgrade -y

# Redémarrer si nécessaire
reboot
```

⏳ **Attendre 2-3 minutes après le reboot, puis reconnectez-vous**

### Étape 3 : Créer un utilisateur non-root (sécurité)

```bash
# Créer un nouvel utilisateur (remplacez 'ecoride' par votre choix)
adduser ecoride

# Ajouter aux sudoers
usermod -aG sudo ecoride

# Tester la connexion (dans un nouveau terminal)
ssh ecoride@VOTRE_IP_VPS
```

💡 **À partir de maintenant, utilisez l'utilisateur 'ecoride' (pas root)**

### Étape 4 : Configuration du pare-feu

```bash
# Activer le pare-feu
sudo ufw enable

# Autoriser SSH (port 22)
sudo ufw allow 22/tcp

# Autoriser HTTP (port 80)
sudo ufw allow 80/tcp

# Autoriser HTTPS (port 443)
sudo ufw allow 443/tcp

# Vérifier le statut
sudo ufw status
```

---

## 📦 Installation des dépendances

### Étape 5 : Installer Node.js 20.x

```bash
# Installer curl si nécessaire
sudo apt install -y curl

# Ajouter le repository NodeSource pour Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Installer Node.js et npm
sudo apt install -y nodejs

# Vérifier les versions
node --version    # Devrait afficher v20.x.x
npm --version     # Devrait afficher 10.x.x
```

### Étape 6 : Installer Docker et Docker Compose

```bash
# Installer les dépendances
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter la clé GPG officielle de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter le repository Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Mettre à jour et installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Appliquer les changements (vous devrez vous reconnecter)
newgrp docker

# Vérifier l'installation
docker --version
docker compose version
```

### Étape 7 : Installer Git

```bash
# Installer Git
sudo apt install -y git

# Configurer Git
git config --global user.name "Votre Nom"
git config --global user.email "votre@email.com"
```

### Étape 8 : Installer Nginx

```bash
# Installer Nginx
sudo apt install -y nginx

# Démarrer Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Vérifier le statut
sudo systemctl status nginx
```

### Étape 9 : Installer PM2 (gestionnaire de processus Node.js)

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Configurer PM2 pour démarrer au boot
pm2 startup systemd
# Copier et exécuter la commande affichée

# Vérifier l'installation
pm2 --version
```

---

## 🗄️ Configuration de la base de données

### Étape 10 : Créer la structure des répertoires

```bash
# Créer le répertoire pour l'application
mkdir -p ~/ecoride
cd ~/ecoride

# Créer les répertoires pour les données persistantes
mkdir -p ~/ecoride-data/mysql
mkdir -p ~/ecoride-data/mongodb
mkdir -p ~/ecoride-data/logs
```

### Étape 11 : Préparer les fichiers de configuration

```bash
# Créer le fichier .env de production
nano ~/ecoride/.env
```

**Contenu du fichier `.env` (adaptez les valeurs) :**

```env
# Configuration EcoRide - Production
NODE_ENV=production
PORT=3000
JWT_SECRET=VotreSecretJWTTresFortEtUnique_ChangezMoi_2025

# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=MotDePasseMongoTresSecurise_2025
MONGO_INITDB_DATABASE=ecoride
MONGO_DATABASE=ecoride
MONGO_USER=ecoride_user
MONGO_PASSWORD=MotDePasseUserMongoSecurise_2025

# MySQL
MYSQL_ROOT_PASSWORD=MotDePasseMySQLRootSecurise_2025
MYSQL_DATABASE=ecoride
MYSQL_USER=ecoride_user
MYSQL_PASSWORD=MotDePasseUserMySQLSecurise_2025

# MySQL pour l'application Node.js
DB_HOST=localhost
DB_USER=ecoride_user
DB_PASSWORD=MotDePasseUserMySQLSecurise_2025
DB_NAME=ecoride
DB_PORT=3306

# Mongo Express / phpMyAdmin (optionnel en production)
ME_CONFIG_MONGODB_ADMINUSERNAME=admin
ME_CONFIG_MONGODB_ADMINPASSWORD=MotDePasseMongoTresSecurise_2025
ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=MotDePasseBasicAuth_2025

# URL de l'application
APP_URL=https://votredomaine.com
FRONTEND_URL=https://votredomaine.com
```

**⚠️ IMPORTANT :** Sauvegardez ce fichier en lieu sûr et **NE LE COMMITEZ JAMAIS** sur GitHub !

---

## 🚢 Déploiement de l'application

### Étape 12 : Cloner le repository

```bash
# Se placer dans le répertoire
cd ~/ecoride

# Cloner le repository (branche main)
git clone https://github.com/cyriltouchard/EcoRide.git .

# Ou si vous utilisez SSH
git clone git@github.com:cyriltouchard/EcoRide.git .

# Vérifier la branche
git branch
```

### Étape 13 : Adapter le docker-compose pour la production

```bash
# Créer un docker-compose.prod.yml
nano ~/ecoride/docker-compose.prod.yml
```

**Contenu de `docker-compose.prod.yml` :**

```yaml
version: '3.8'

services:
  # Application EcoRide
  ecoride-app:
    build: .
    container_name: ecoride-backend
    restart: always
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGO_URI=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@ecoride-mongo:27017/${MONGO_DATABASE}
      - MONGODB_URI=mongodb://${MONGO_USER}:${MONGO_PASSWORD}@ecoride-mongo:27017/${MONGO_DATABASE}
      - DB_HOST=ecoride-mysql
      - DB_PORT=3306
      - DB_NAME=${MYSQL_DATABASE}
      - DB_USER=${MYSQL_USER}
      - DB_PASSWORD=${MYSQL_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      ecoride-mongo:
        condition: service_healthy
      ecoride-mysql:
        condition: service_healthy
    networks:
      - ecoride-network
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Base de données MongoDB
  ecoride-mongo:
    image: mongo:7.0
    container_name: ecoride-mongodb
    restart: always
    ports:
      - "127.0.0.1:27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}
    volumes:
      - ~/ecoride-data/mongodb:/data/db
      - ./docker/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - ecoride-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  # Base de données MySQL
  ecoride-mysql:
    image: mysql:8.0
    container_name: ecoride-mysql
    restart: always
    ports:
      - "127.0.0.1:3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - ~/ecoride-data/mysql:/var/lib/mysql
      - ./docker/mysql-init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - ecoride-network
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

networks:
  ecoride-network:
    driver: bridge
    name: ecoride-network

volumes:
  ecoride_mongo_data:
  ecoride_mysql_data:
```

### Étape 14 : Lancer l'application avec Docker

```bash
# Se placer dans le répertoire
cd ~/ecoride

# Construire et lancer les conteneurs
docker compose -f docker-compose.prod.yml up -d --build

# Vérifier que tout fonctionne
docker compose -f docker-compose.prod.yml ps

# Voir les logs
docker compose -f docker-compose.prod.yml logs -f ecoride-app
```

**✅ Critère de succès :** Les 3 conteneurs (app, mongo, mysql) doivent être "Up" et "healthy"

---

## 🌐 Configuration Nginx

### Étape 15 : Configurer Nginx comme reverse proxy

```bash
# Supprimer la configuration par défaut
sudo rm /etc/nginx/sites-enabled/default

# Créer la configuration EcoRide
sudo nano /etc/nginx/sites-available/ecoride
```

**Contenu du fichier `/etc/nginx/sites-available/ecoride` :**

```nginx
# Configuration Nginx pour EcoRide
server {
    listen 80;
    listen [::]:80;
    server_name votredomaine.com www.votredomaine.com;

    # Redirection temporaire vers HTTPS (sera activée après SSL)
    # return 301 https://$server_name$request_uri;

    # Logs
    access_log /var/log/nginx/ecoride-access.log;
    error_log /var/log/nginx/ecoride-error.log;

    # Taille maximale des uploads
    client_max_body_size 10M;

    # Fichiers statiques (HTML, CSS, JS, images)
    location / {
        root /home/ecoride/ecoride;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # API Backend Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Fichiers statiques publics (images, CSS, JS depuis /public)
    location /public/ {
        alias /home/ecoride/ecoride/public/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Favicon
    location /favicon.ico {
        root /home/ecoride/ecoride/public;
        expires 7d;
        access_log off;
    }

    # Robots.txt
    location /robots.txt {
        root /home/ecoride/ecoride/public;
        access_log off;
    }

    # Sécurité : Interdire l'accès aux fichiers sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ \.(env|git|md|lock|json)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**Activez la configuration :**

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/ecoride /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Si OK, recharger Nginx
sudo systemctl reload nginx
```

### Étape 16 : Vérifier que le site fonctionne

```bash
# Tester depuis le serveur
curl http://localhost

# Depuis votre navigateur, accédez à :
http://VOTRE_IP_VPS
```

**✅ Vous devriez voir la page d'accueil EcoRide**

---

## 🔒 Sécurisation SSL

### Étape 17 : Installer Certbot pour Let's Encrypt

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir un certificat SSL (remplacez par votre domaine)
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com

# Suivre les instructions :
# 1. Entrer votre email
# 2. Accepter les conditions (Y)
# 3. Choisir si vous voulez partager votre email (Y ou N)
# 4. Choisir : 2 (Redirect - rediriger tout vers HTTPS)
```

**Certbot va automatiquement :**
- ✅ Générer le certificat SSL
- ✅ Modifier la configuration Nginx
- ✅ Configurer le renouvellement automatique

### Étape 18 : Tester le renouvellement automatique

```bash
# Tester le renouvellement (simulation)
sudo certbot renew --dry-run

# Si OK, le certificat se renouvellera automatiquement tous les 90 jours
```

### Étape 19 : Vérifier HTTPS

```bash
# Depuis votre navigateur
https://votredomaine.com

# Vérifier le cadenas vert dans la barre d'adresse
```

---

## 🌍 Configuration du domaine

### Étape 20 : Configurer les DNS chez Hostinger

1. **Connectez-vous au panneau Hostinger**
2. **Allez dans "Domaines" → Votre domaine → "DNS / Serveurs de noms"**
3. **Ajoutez/Modifiez les enregistrements DNS :**

| Type | Nom | Contenu | TTL |
|------|-----|---------|-----|
| A | @ | VOTRE_IP_VPS | 14400 |
| A | www | VOTRE_IP_VPS | 14400 |
| CNAME | api | votredomaine.com | 14400 |

4. **Sauvegardez et attendez 10-30 minutes pour la propagation DNS**

### Étape 21 : Vérifier la propagation DNS

```bash
# Vérifier depuis votre ordinateur
nslookup votredomaine.com
nslookup www.votredomaine.com

# Ou utilisez : https://dnschecker.org
```

---

## ⚙️ Gestion des processus avec PM2

### Étape 22 : Alternative à Docker - PM2 (optionnel)

Si vous préférez ne pas utiliser Docker pour le backend Node.js :

```bash
# Arrêter le conteneur Docker de l'app
docker stop ecoride-backend

# Installer les dépendances Node.js
cd ~/ecoride/server
npm install --production

# Lancer avec PM2
pm2 start server.js --name ecoride-backend --env production

# Sauvegarder la configuration PM2
pm2 save

# Voir les processus
pm2 list

# Voir les logs
pm2 logs ecoride-backend

# Redémarrer
pm2 restart ecoride-backend
```

**⚠️ Attention :** Si vous utilisez PM2, vous devez installer MongoDB et MySQL localement (sans Docker) ou garder uniquement les conteneurs de BDD.

---

## 📊 Surveillance et maintenance

### Étape 23 : Monitoring avec PM2 (si utilisé)

```bash
# Installer PM2 Plus pour le monitoring web
pm2 plus

# Interface web de monitoring
pm2 monit
```

### Étape 24 : Monitoring Docker

```bash
# Voir l'utilisation des ressources
docker stats

# Voir les logs d'un conteneur
docker logs -f ecoride-backend

# Voir tous les conteneurs
docker ps -a
```

### Étape 25 : Sauvegardes automatiques

**Créer un script de sauvegarde :**

```bash
# Créer le script
nano ~/backup-ecoride.sh
```

**Contenu du script :**

```bash
#!/bin/bash
# Script de sauvegarde EcoRide

BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

# Sauvegarder MySQL
docker exec ecoride-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} ecoride > $BACKUP_DIR/mysql_${DATE}.sql

# Sauvegarder MongoDB
docker exec ecoride-mongodb mongodump --uri="mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/ecoride?authSource=admin" --archive=$BACKUP_DIR/mongo_${DATE}.archive

# Compresser
tar -czf $BACKUP_DIR/ecoride_backup_${DATE}.tar.gz $BACKUP_DIR/*${DATE}*

# Supprimer les fichiers temporaires
rm $BACKUP_DIR/mysql_${DATE}.sql $BACKUP_DIR/mongo_${DATE}.archive

# Garder seulement les 7 dernières sauvegardes
ls -t $BACKUP_DIR/ecoride_backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "Sauvegarde terminée : $BACKUP_DIR/ecoride_backup_${DATE}.tar.gz"
```

**Rendre le script exécutable et automatiser :**

```bash
# Rendre exécutable
chmod +x ~/backup-ecoride.sh

# Ajouter au crontab (tous les jours à 3h du matin)
crontab -e

# Ajouter cette ligne :
0 3 * * * /home/ecoride/backup-ecoride.sh >> /home/ecoride/backup.log 2>&1
```

### Étape 26 : Mises à jour de l'application

```bash
# Se placer dans le répertoire
cd ~/ecoride

# Récupérer les dernières modifications
git pull origin main

# Reconstruire et redémarrer les conteneurs
docker compose -f docker-compose.prod.yml up -d --build

# Ou avec PM2
pm2 restart ecoride-backend
```

---

## 🔥 Troubleshooting

### Problème : L'application ne démarre pas

```bash
# Vérifier les logs Docker
docker compose -f docker-compose.prod.yml logs -f

# Vérifier que les ports sont libres
sudo netstat -tulpn | grep -E ':(80|443|3000|3306|27017)'

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

### Problème : Erreur de connexion à la base de données

```bash
# Tester la connexion MySQL
docker exec -it ecoride-mysql mysql -u ecoride_user -p

# Tester la connexion MongoDB
docker exec -it ecoride-mongodb mongosh -u ecoride_user -p

# Vérifier les variables d'environnement
docker exec ecoride-backend env | grep DB
```

### Problème : Nginx ne démarre pas

```bash
# Vérifier la configuration
sudo nginx -t

# Voir les logs d'erreur
sudo tail -f /var/log/nginx/error.log

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Problème : Certificat SSL expiré

```bash
# Renouveler manuellement
sudo certbot renew

# Recharger Nginx
sudo systemctl reload nginx
```

### Problème : Site inaccessible après mise à jour

```bash
# Revenir à la version précédente
git log --oneline  # Voir l'historique
git checkout COMMIT_PRECEDENT

# Reconstruire
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 📝 Checklist finale de déploiement

- [ ] VPS configuré et sécurisé (pare-feu, utilisateur non-root)
- [ ] Node.js, Docker, Git, Nginx installés
- [ ] Repository cloné et fichier .env configuré
- [ ] Docker Compose lancé avec succès (3 conteneurs healthy)
- [ ] Nginx configuré et teste (nginx -t OK)
- [ ] DNS configurés et propagés
- [ ] SSL installé et HTTPS fonctionnel (cadenas vert)
- [ ] Tests de l'application :
  - [ ] Page d'accueil accessible
  - [ ] Inscription/Connexion fonctionnelle
  - [ ] API répond correctement
  - [ ] Création de trajet fonctionne
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring en place
- [ ] Documentation mise à jour

---

## 🎉 Félicitations !

Votre application EcoRide est maintenant en production sur votre VPS Hostinger !

### Accès à votre application :
- **Site web** : https://votredomaine.com
- **API** : https://votredomaine.com/api
- **Logs** : `docker logs -f ecoride-backend`

### Commandes utiles au quotidien :

```bash
# Voir l'état des conteneurs
docker ps

# Redémarrer l'application
docker compose -f docker-compose.prod.yml restart

# Voir les logs
docker compose -f docker-compose.prod.yml logs -f

# Mettre à jour
cd ~/ecoride && git pull && docker compose -f docker-compose.prod.yml up -d --build

# Sauvegarder
~/backup-ecoride.sh
```

---

## 📞 Support

En cas de problème :
1. Consultez les logs : `docker logs -f ecoride-backend`
2. Vérifiez la documentation : `~/ecoride/document/`
3. Contactez le support Hostinger si problème VPS

---

**Document créé le 4 décembre 2025**  
**Dernière mise à jour : 4 décembre 2025**
