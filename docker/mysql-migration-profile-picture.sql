-- Migration: Ajout de la colonne profile_picture à la table users
USE ecoride;

-- Vérifier si la colonne existe déjà
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'ecoride' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'profile_picture';

-- Ajouter la colonne si elle n'existe pas
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE users ADD COLUMN profile_picture TEXT NULL AFTER user_type',
    'SELECT "Column profile_picture already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérification
DESCRIBE users;
