-- Migration 024 : Correction des politiques restaurants si is_admin_user() n'existe pas
-- Cette migration garantit que les politiques fonctionnent même si la migration 021 n'a pas été appliquée
-- Elle crée la fonction si elle n'existe pas, ou utilise une vérification alternative

-- Créer la fonction is_admin_user() si elle n'existe pas encore
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

-- S'assurer que la politique publique existe toujours
DROP POLICY IF EXISTS "Public can view active verified restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view active verified restaurants" ON restaurants;

CREATE POLICY "Public can view active verified restaurants"
  ON restaurants FOR SELECT
  USING (
    is_active = true AND is_verified = true
  );

-- S'assurer que les restaurants peuvent voir leur propre profil
DROP POLICY IF EXISTS "Restaurants can view own profile" ON restaurants;

CREATE POLICY "Restaurants can view own profile"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Recréer les politiques admin si elles n'existent pas
-- Note: Ces politiques utilisent is_admin_user() qui doit exister (créée par la migration 021 ou 024)
DROP POLICY IF EXISTS "Admins can view all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can update all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can delete restaurants" ON restaurants;

-- Créer les politiques admin avec is_admin_user()
CREATE POLICY "Admins can view all restaurants"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

CREATE POLICY "Admins can update all restaurants"
  ON restaurants FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

CREATE POLICY "Admins can insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

CREATE POLICY "Admins can delete restaurants"
  ON restaurants FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

-- Commentaires
COMMENT ON FUNCTION is_admin_user() IS 
  'Fonction SECURITY DEFINER qui vérifie si l''utilisateur connecté est admin en utilisant auth.users (évite la récursion RLS)';

COMMENT ON POLICY "Public can view active verified restaurants" ON restaurants IS 
  'Permet à tous (même non authentifiés) de voir les restaurants actifs et vérifiés pour l''affichage public. Cette politique est essentielle pour la page d''accueil.';

COMMENT ON POLICY "Restaurants can view own profile" ON restaurants IS 
  'Permet aux restaurants de voir leur propre profil même s''ils ne sont pas vérifiés/actifs (évite erreur 406)';

