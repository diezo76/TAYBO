-- Migration 017 : Correction des politiques RLS pour les restaurants
-- Cette migration corrige les erreurs 406 lors de la récupération des données restaurant
-- et permet aux admins de modifier tous les restaurants

-- Supprimer les anciennes politiques pour restaurants
DROP POLICY IF EXISTS "Anyone can view active verified restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view active verified restaurants v2" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can manage own profile" ON restaurants;
DROP POLICY IF EXISTS "Admins can manage all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can view all restaurants" ON restaurants;

-- Politique 1 : Tout le monde peut voir les restaurants actifs et vérifiés (pour les clients)
CREATE POLICY "Public can view active verified restaurants"
  ON restaurants FOR SELECT
  USING (
    is_active = true AND is_verified = true
  );

-- Politique 2 : Les restaurants peuvent voir leur propre profil (même s'ils ne sont pas vérifiés/actifs)
-- C'est crucial pour éviter l'erreur 406 lors de la récupération des données après connexion
CREATE POLICY "Restaurants can view own profile"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique 3 : Les restaurants peuvent modifier leur propre profil
CREATE POLICY "Restaurants can update own profile"
  ON restaurants FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique 4 : Les restaurants peuvent insérer leur propre profil (lors de l'inscription)
CREATE POLICY "Restaurants can insert own profile"
  ON restaurants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique 5 : Les admins peuvent voir TOUS les restaurants (même non vérifiés/inactifs)
CREATE POLICY "Admins can view all restaurants"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com'
    )
  );

-- Politique 6 : Les admins peuvent modifier TOUS les restaurants
CREATE POLICY "Admins can update all restaurants"
  ON restaurants FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com'
    )
  );

-- Politique 7 : Les admins peuvent insérer des restaurants (si nécessaire)
CREATE POLICY "Admins can insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com'
    )
  );

-- Politique 8 : Les admins peuvent supprimer des restaurants (si nécessaire)
CREATE POLICY "Admins can delete restaurants"
  ON restaurants FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com'
    )
  );

-- Commentaire pour documenter les politiques
COMMENT ON POLICY "Public can view active verified restaurants" ON restaurants IS 
  'Permet à tous (même non authentifiés) de voir les restaurants actifs et vérifiés pour l''affichage public';

COMMENT ON POLICY "Restaurants can view own profile" ON restaurants IS 
  'Permet aux restaurants de voir leur propre profil même s''ils ne sont pas vérifiés/actifs (évite erreur 406)';

COMMENT ON POLICY "Admins can view all restaurants" ON restaurants IS 
  'Permet aux admins de voir tous les restaurants pour la gestion administrative';

COMMENT ON POLICY "Admins can update all restaurants" ON restaurants IS 
  'Permet aux admins de modifier tous les restaurants pour la validation/gestion';

