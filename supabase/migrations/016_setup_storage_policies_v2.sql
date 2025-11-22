-- Migration 016 v2 : Configuration des Policies pour Supabase Storage
-- Cette migration configure les permissions pour les buckets d'images
-- 
-- NOTE: Cette migration utilise une fonction SECURITY DEFINER pour contourner
-- les restrictions de permissions sur storage.objects
--
-- Si cette migration échoue avec une erreur de permissions, utilisez plutôt
-- le guide dans GUIDE_CREATION_POLICIES_STORAGE.md pour créer les policies
-- via l'interface Supabase Dashboard.

-- Créer une fonction helper pour créer les policies Storage
CREATE OR REPLACE FUNCTION create_storage_policy(
  policy_name TEXT,
  policy_command TEXT,
  policy_using TEXT DEFAULT NULL,
  policy_with_check TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  -- Supprimer la policy si elle existe
  EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
  
  -- Créer la policy selon le type de commande
  IF policy_command = 'SELECT' THEN
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT USING (%s)', 
      policy_name, policy_using);
  ELSIF policy_command = 'INSERT' THEN
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT WITH CHECK (%s)', 
      policy_name, policy_with_check);
  ELSIF policy_command = 'UPDATE' THEN
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE USING (%s) WITH CHECK (%s)', 
      policy_name, policy_using, policy_with_check);
  ELSIF policy_command = 'DELETE' THEN
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR DELETE USING (%s)', 
      policy_name, policy_using);
  END IF;
END;
$$;

-- ============================================
-- POLICIES POUR LE BUCKET restaurant-images
-- ============================================

SELECT create_storage_policy(
  'Public Access to Restaurant Images',
  'SELECT',
  'bucket_id = ''restaurant-images'''
);

SELECT create_storage_policy(
  'Restaurants can upload own images',
  'INSERT',
  NULL,
  'bucket_id = ''restaurant-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

SELECT create_storage_policy(
  'Restaurants can update own images',
  'UPDATE',
  'bucket_id = ''restaurant-images'' AND auth.uid()::text = (storage.foldername(name))[1]',
  'bucket_id = ''restaurant-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

SELECT create_storage_policy(
  'Restaurants can delete own images',
  'DELETE',
  'bucket_id = ''restaurant-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- ============================================
-- POLICIES POUR LE BUCKET menu-images
-- ============================================

SELECT create_storage_policy(
  'Public Access to Menu Images',
  'SELECT',
  'bucket_id = ''menu-images'''
);

SELECT create_storage_policy(
  'Restaurants can upload menu images',
  'INSERT',
  NULL,
  'bucket_id = ''menu-images'' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)'
);

SELECT create_storage_policy(
  'Restaurants can update menu images',
  'UPDATE',
  'bucket_id = ''menu-images'' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)',
  'bucket_id = ''menu-images'' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)'
);

SELECT create_storage_policy(
  'Restaurants can delete menu images',
  'DELETE',
  'bucket_id = ''menu-images'' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)'
);

-- ============================================
-- POLICIES POUR LE BUCKET user-images
-- ============================================

SELECT create_storage_policy(
  'Public Access to User Images',
  'SELECT',
  'bucket_id = ''user-images'''
);

SELECT create_storage_policy(
  'Users can upload own images',
  'INSERT',
  NULL,
  'bucket_id = ''user-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

SELECT create_storage_policy(
  'Users can update own images',
  'UPDATE',
  'bucket_id = ''user-images'' AND auth.uid()::text = (storage.foldername(name))[1]',
  'bucket_id = ''user-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

SELECT create_storage_policy(
  'Users can delete own images',
  'DELETE',
  'bucket_id = ''user-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- ============================================
-- POLICIES POUR LE BUCKET passports (PRIVÉ)
-- ============================================

SELECT create_storage_policy(
  'Restaurants can view own passports',
  'SELECT',
  'bucket_id = ''passports'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

SELECT create_storage_policy(
  'Restaurants can upload own passports',
  'INSERT',
  NULL,
  'bucket_id = ''passports'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

SELECT create_storage_policy(
  'Admins can view all passports',
  'SELECT',
  'bucket_id = ''passports'' AND EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.email = ''admin@taybo.com'')'
);

-- Nettoyer la fonction helper (optionnel)
-- DROP FUNCTION IF EXISTS create_storage_policy(TEXT, TEXT, TEXT, TEXT);

-- Commentaires explicatifs
COMMENT ON POLICY "Public Access to Restaurant Images" ON storage.objects IS 
'Permet à tout le monde de voir les images de restaurants - nécessaire pour afficher les restaurants sur la page d''accueil';

COMMENT ON POLICY "Restaurants can upload own images" ON storage.objects IS 
'Permet aux restaurants authentifiés de télécharger leurs propres images - le dossier doit correspondre à leur ID';

COMMENT ON POLICY "Public Access to Menu Images" ON storage.objects IS 
'Permet à tout le monde de voir les images des plats - nécessaire pour afficher les menus';

COMMENT ON POLICY "Public Access to User Images" ON storage.objects IS 
'Permet à tout le monde de voir les photos de profil des utilisateurs - pour afficher les avatars dans les avis';

COMMENT ON POLICY "Restaurants can view own passports" ON storage.objects IS 
'Permet aux restaurants de voir uniquement leurs propres documents d''identité - bucket privé';

COMMENT ON POLICY "Admins can view all passports" ON storage.objects IS 
'Permet aux admins de voir tous les documents d''identité pour vérification - bucket privé';

