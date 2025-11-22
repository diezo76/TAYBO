-- Migration 021 : Correction de la récursion dans les politiques RLS pour la table users
-- Cette migration corrige les erreurs 500 causées par la récursion dans les politiques admin
-- En utilisant auth.jwt() pour vérifier l'email directement depuis le JWT au lieu de la table users

-- Supprimer les anciennes politiques admin qui causent la récursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Créer une fonction SECURITY DEFINER pour vérifier si l'utilisateur est admin
-- Cette fonction lit depuis auth.users (table système) qui n'a pas de RLS, évitant ainsi la récursion
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Vérifier d'abord si auth.uid() est NULL
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Récupérer l'email depuis auth.users (table système sans RLS)
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Vérifier si l'email correspond à l'admin (retourne FALSE si user_email est NULL)
  RETURN COALESCE(user_email = 'admin@taybo.com', FALSE);
END;
$$;

-- Politique 1 : Les admins peuvent voir tous les utilisateurs (pour la gestion)
-- Utilise la fonction is_admin_user() qui évite la récursion
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

-- Politique 2 : Les admins peuvent modifier tous les utilisateurs (pour la gestion)
-- Utilise la fonction is_admin_user() qui évite la récursion
CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

-- Politique 3 : Les admins peuvent supprimer des utilisateurs (si nécessaire)
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

-- Commentaires pour documenter les politiques
COMMENT ON FUNCTION is_admin_user() IS 
  'Fonction SECURITY DEFINER qui vérifie si l''utilisateur connecté est admin en utilisant le JWT (évite la récursion RLS)';

COMMENT ON POLICY "Admins can view all users" ON users IS 
  'Permet aux admins de voir tous les utilisateurs pour la gestion administrative (utilise is_admin_user() pour éviter la récursion)';

COMMENT ON POLICY "Admins can update all users" ON users IS 
  'Permet aux admins de modifier tous les utilisateurs pour la gestion administrative (utilise is_admin_user() pour éviter la récursion)';

COMMENT ON POLICY "Admins can delete users" ON users IS 
  'Permet aux admins de supprimer des utilisateurs si nécessaire (utilise is_admin_user() pour éviter la récursion)';

