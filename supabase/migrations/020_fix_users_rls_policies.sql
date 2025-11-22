-- Migration 020 : Correction des politiques RLS pour la table users
-- Cette migration corrige les erreurs 403 (INSERT) et 406 (SELECT) pour la table users
-- Elle s'inspire de la migration 017 qui a corrigé les mêmes problèmes pour les restaurants

-- Supprimer les anciennes politiques pour users (pour éviter les conflits)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile v2" ON users;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can always select own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile v2" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Politique 1 : Les utilisateurs peuvent voir leur propre profil
-- Cette politique permet aux utilisateurs authentifiés de voir leur propre profil
-- même si certaines données sont manquantes (évite erreur 406)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique 2 : Les utilisateurs peuvent insérer leur propre profil lors de l'inscription
-- Cette politique permet l'insertion si l'ID correspond à auth.uid()
-- IMPORTANT : La session doit être établie avant l'insertion (après signUp)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique 3 : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique 4 : Les admins peuvent voir tous les utilisateurs (pour la gestion)
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com'
    )
  );

-- Politique 5 : Les admins peuvent modifier tous les utilisateurs (pour la gestion)
CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com'
    )
  );

-- Commentaires pour documenter les politiques
COMMENT ON POLICY "Users can view own profile" ON users IS 
  'Permet aux utilisateurs authentifiés de voir leur propre profil (évite erreur 406)';

COMMENT ON POLICY "Users can insert own profile" ON users IS 
  'Permet aux utilisateurs de créer leur propre entrée lors de l''inscription (évite erreur 403)';

COMMENT ON POLICY "Users can update own profile" ON users IS 
  'Permet aux utilisateurs de modifier leur propre profil';

COMMENT ON POLICY "Admins can view all users" ON users IS 
  'Permet aux admins de voir tous les utilisateurs pour la gestion administrative';

COMMENT ON POLICY "Admins can update all users" ON users IS 
  'Permet aux admins de modifier tous les utilisateurs pour la gestion administrative';

