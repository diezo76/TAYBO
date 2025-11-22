-- Migration 014 : Ajout du champ image_url à la table users
-- Ce champ stocke l'URL de l'image de profil de l'utilisateur

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Commentaire pour documenter le champ
COMMENT ON COLUMN users.image_url IS 'URL de l''image de profil de l''utilisateur stockée dans Supabase Storage (bucket user-images)';

