-- Migration: Ajout de la colonne description à la table rides
-- Date: 2024-12-10
-- Description: Permet aux chauffeurs d'ajouter des informations supplémentaires sur leurs trajets

ALTER TABLE rides ADD COLUMN IF NOT EXISTS description TEXT AFTER total_seats;
