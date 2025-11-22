-- Migration 015 : Correction des politiques RLS pour éviter les erreurs 406/400
-- Cette migration améliore les politiques RLS pour éviter les déconnexions et erreurs

-- Supprimer les anciennes politiques pour users
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Créer de nouvelles politiques plus robustes pour users
-- Les utilisateurs peuvent toujours voir leur propre profil
CREATE POLICY "Users can view own profile v2"
  ON users FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile v2"
  ON users FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Permettre aux utilisateurs de voir leur propre ligne même si la session est temporairement invalide
-- (pour éviter les déconnexions lors des erreurs 406)
CREATE POLICY "Users can always select own data"
  ON users FOR SELECT
  USING (true);

-- Supprimer la politique large et la remplacer par une politique plus stricte
DROP POLICY IF EXISTS "Users can always select own data" ON users;

-- Politique finale : Les utilisateurs authentifiés peuvent voir leur propre profil
-- Si auth.uid() est null, la requête échouera gracieusement sans provoquer de déconnexion
CREATE POLICY "Authenticated users can view own profile"
  ON users FOR SELECT
  USING (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      ELSE auth.uid()::text = id::text
    END
  );

-- Supprimer les politiques temporaires
DROP POLICY IF EXISTS "Users can view own profile v2" ON users;
DROP POLICY IF EXISTS "Users can update own profile v2" ON users;

-- Améliorer la politique pour les restaurants
-- Tout le monde peut voir les restaurants actifs et vérifiés (sans authentification requise)
DROP POLICY IF EXISTS "Anyone can view active verified restaurants" ON restaurants;
CREATE POLICY "Anyone can view active verified restaurants v2"
  ON restaurants FOR SELECT
  USING (
    is_active = true AND is_verified = true
  );

-- Ajouter une politique pour permettre aux admins de voir tous les restaurants
DROP POLICY IF EXISTS "Admins can view all restaurants" ON restaurants;
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

-- Améliorer la politique pour les menu_items
-- Permettre à tous de voir les plats disponibles sans vérification de session
DROP POLICY IF EXISTS "Anyone can view available menu items" ON menu_items;
CREATE POLICY "Public can view available menu items"
  ON menu_items FOR SELECT
  USING (
    is_available = true AND
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
      AND restaurants.is_active = true
      AND restaurants.is_verified = true
    )
  );

-- Ajouter une politique pour permettre aux restaurants de voir tous leurs plats
CREATE POLICY "Restaurants can view all own menu items"
  ON menu_items FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
      AND restaurants.id::text = auth.uid()::text
    )
  );

-- Note: Pour appliquer cette migration sur Supabase, exécutez-la dans l'éditeur SQL du dashboard Supabase

