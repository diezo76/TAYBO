-- Migration 019 : Ajout de champs supplémentaires à la table users
-- Ajoute les champs nécessaires pour les settings client

ALTER TABLE users
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS receive_offers BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscribe_newsletter BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notifications_push_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notifications_email_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Egypt';

-- Index pour recherche par pays
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);

