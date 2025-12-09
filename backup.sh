#!/bin/bash
# Script de sauvegarde automatique pour EcoRide
# À exécuter via cron : 0 2 * * * /var/www/EcoRide/backup.sh

BACKUP_DIR="/var/www/EcoRide/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
MYSQL_ROOT_PASSWORD="ecoride_mysql_2025"

# Créer le dossier de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

# Backup MySQL
echo "🗄️  Sauvegarde MySQL..."
docker exec ecoride-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD ecoride > $BACKUP_DIR/mysql-$TIMESTAMP.sql

# Backup MongoDB
echo "🍃 Sauvegarde MongoDB..."
docker exec ecoride-mongodb mongodump --out=/dump --db=ecoride
docker cp ecoride-mongodb:/dump $BACKUP_DIR/mongodb-$TIMESTAMP

# Compresser les backups
echo "📦 Compression..."
cd $BACKUP_DIR
tar -czf mysql-$TIMESTAMP.sql.tar.gz mysql-$TIMESTAMP.sql
tar -czf mongodb-$TIMESTAMP.tar.gz mongodb-$TIMESTAMP
rm -rf mysql-$TIMESTAMP.sql mongodb-$TIMESTAMP

# Supprimer les backups de plus de 7 jours
echo "🧹 Nettoyage des anciens backups..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# Statistiques
echo "✅ Backup terminé!"
ls -lh $BACKUP_DIR/*.tar.gz | tail -5

echo ""
echo "📊 Espace disque:"
df -h /var/www/EcoRide
