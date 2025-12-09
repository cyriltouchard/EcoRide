-- Migration: Ajout des colonnes manquantes à la table users
USE ecoride;

-- Ajouter la colonne bio si elle n'existe pas
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ecoride' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'bio';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN bio TEXT NULL AFTER profile_picture',
    'SELECT "Column bio already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne phone si elle n'existe pas
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ecoride' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'phone';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER bio',
    'SELECT "Column phone already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ajouter la colonne address si elle n'existe pas
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ecoride' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'address';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL AFTER phone',
    'SELECT "Column address already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérification finale
SELECT 'Migration terminée - Structure de la table users:' AS status;
DESCRIBE users;
