-- ================================================
-- FIX: Agrandir la colonne profile_picture
-- Les images base64 nécessitent beaucoup plus d'espace
-- ================================================

USE ecoride;

-- Modifier la colonne profile_picture pour accepter des images base64 complètes
ALTER TABLE users 
MODIFY COLUMN profile_picture MEDIUMTEXT NULL;

-- Vérification
DESCRIBE users;

SELECT 'Migration terminée : Colonne profile_picture agrandie en MEDIUMTEXT' AS message;
