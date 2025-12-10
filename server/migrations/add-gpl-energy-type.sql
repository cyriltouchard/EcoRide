-- Migration: Ajout de GPL dans energy_type
-- Date: 2024-12-10

ALTER TABLE vehicles MODIFY energy_type ENUM('essence','diesel','electrique','hybride','gpl') NOT NULL;
