-- Migration 013 : Ajout du champ image_url à la table restaurants
-- Ce champ stocke l'URL de l'image de profil du restaurant

ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Commentaire pour documenter le champ
COMMENT ON COLUMN restaurants.image_url IS 'URL de l''image de profil du restaurant stockée dans Supabase Storage (bucket restaurant-images)';

