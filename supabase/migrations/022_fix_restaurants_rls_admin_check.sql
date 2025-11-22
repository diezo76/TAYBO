-- Migration 022 : Utilisation de is_admin_user() pour les politiques admin des restaurants
-- Cette migration remplace les vérifications EXISTS (SELECT FROM users) par la fonction is_admin_user()
-- pour éviter les problèmes de performance et de récursion potentiels

-- Note: La fonction is_admin_user() doit être créée par la migration 021 avant cette migration

-- Supprimer les anciennes politiques admin pour restaurants
DROP POLICY IF EXISTS "Admins can view all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can update all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can insert restaurants" ON restaurants;
DROP POLICY IF EXISTS "Admins can delete restaurants" ON restaurants;

-- Politique 1 : Les admins peuvent voir TOUS les restaurants (même non vérifiés/inactifs)
-- Utilise la fonction is_admin_user() qui évite les problèmes de récursion
CREATE POLICY "Admins can view all restaurants"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

-- Politique 2 : Les admins peuvent modifier TOUS les restaurants
CREATE POLICY "Admins can update all restaurants"
  ON restaurants FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

-- Politique 3 : Les admins peuvent insérer des restaurants (si nécessaire)
CREATE POLICY "Admins can insert restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

-- Politique 4 : Les admins peuvent supprimer des restaurants (si nécessaire)
CREATE POLICY "Admins can delete restaurants"
  ON restaurants FOR DELETE
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );

-- Commentaires pour documenter les politiques
COMMENT ON POLICY "Admins can view all restaurants" ON restaurants IS 
  'Permet aux admins de voir tous les restaurants pour la gestion administrative (utilise is_admin_user() pour éviter les problèmes)';

COMMENT ON POLICY "Admins can update all restaurants" ON restaurants IS 
  'Permet aux admins de modifier tous les restaurants pour la validation/gestion (utilise is_admin_user() pour éviter les problèmes)';

COMMENT ON POLICY "Admins can insert restaurants" ON restaurants IS 
  'Permet aux admins d''insérer des restaurants si nécessaire (utilise is_admin_user() pour éviter les problèmes)';

COMMENT ON POLICY "Admins can delete restaurants" ON restaurants IS 
  'Permet aux admins de supprimer des restaurants si nécessaire (utilise is_admin_user() pour éviter les problèmes)';

