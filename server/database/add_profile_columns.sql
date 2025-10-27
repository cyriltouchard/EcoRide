-- Script de migration pour ajouter les colonnes de profil utilisateur
-- Date: 27 octobre 2025

USE ecoride_sql;

-- Ajouter les colonnes pour le profil utilisateur
ALTER TABLE users
ADD COLUMN phone VARCHAR(20) NULL AFTER email,
ADD COLUMN bio TEXT NULL AFTER user_type,
ADD COLUMN profile_picture VARCHAR(500) NULL AFTER bio;

-- Vérifier les colonnes ajoutées
DESCRIBE users;

SELECT 'Migration terminée : Colonnes phone, bio et profile_picture ajoutées à la table users' AS message;
