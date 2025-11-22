-- Migration 019 : Ajout de la politique INSERT pour la table users
-- Cette migration permet aux utilisateurs de créer leur propre entrée lors de l'inscription

-- Politique pour permettre aux utilisateurs de créer leur propre profil lors de l'inscription
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Commentaire pour documenter la politique
COMMENT ON POLICY "Users can insert own profile" ON users IS 
  'Permet aux utilisateurs de créer leur propre entrée dans la table users lors de l''inscription';

