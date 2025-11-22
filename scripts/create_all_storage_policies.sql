-- Script SQL pour créer automatiquement toutes les 15 policies Storage
-- Ce script utilise une fonction SECURITY DEFINER pour contourner les problèmes de permissions
--
-- ⚠️ IMPORTANT : Si ce script ne fonctionne toujours pas avec l'erreur "must be owner",
-- utilisez l'interface Supabase Dashboard (voir SOLUTION_ERREUR_STORAGE_POLICIES.md)

-- ============================================
-- FONCTION HELPER POUR CRÉER LES POLICIES
-- ============================================

-- Créer une fonction qui peut créer des policies avec les bonnes permissions
CREATE OR REPLACE FUNCTION create_storage_policy(
    policy_name TEXT,
    operation TEXT,
    policy_definition TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Supprimer la policy si elle existe déjà
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
    
    -- Créer la policy selon l'opération
    CASE operation
        WHEN 'SELECT' THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT USING (%s)', policy_name, policy_definition);
        WHEN 'INSERT' THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT WITH CHECK (%s)', policy_name, policy_definition);
        WHEN 'UPDATE' THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE USING (%s)', policy_name, policy_definition);
        WHEN 'DELETE' THEN
            EXECUTE format('CREATE POLICY %I ON storage.objects FOR DELETE USING (%s)', policy_name, policy_definition);
    END CASE;
END;
$$;

-- ============================================
-- POLICIES POUR LE BUCKET restaurant-images
-- ============================================

-- Policy 1 : Lecture publique
SELECT create_storage_policy(
    'Public Access to Restaurant Images',
    'SELECT',
    'bucket_id = ''restaurant-images'''
);

-- Policy 2 : Upload par restaurants
SELECT create_storage_policy(
    'Restaurants can upload own images',
    'INSERT',
    'bucket_id = ''restaurant-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- Policy 3 : Mise à jour par restaurants
SELECT create_storage_policy(
    'Restaurants can update own images',
    'UPDATE',
    'bucket_id = ''restaurant-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- Policy 4 : Suppression par restaurants
SELECT create_storage_policy(
    'Restaurants can delete own images',
    'DELETE',
    'bucket_id = ''restaurant-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- ============================================
-- POLICIES POUR LE BUCKET menu-images
-- ============================================

-- Policy 1 : Lecture publique
SELECT create_storage_policy(
    'Public Access to Menu Images',
    'SELECT',
    'bucket_id = ''menu-images'''
);

-- Policy 2 : Upload par restaurants
SELECT create_storage_policy(
    'Restaurants can upload menu images',
    'INSERT',
    'bucket_id = ''menu-images'' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)'
);

-- Policy 3 : Mise à jour par restaurants
SELECT create_storage_policy(
    'Restaurants can update menu images',
    'UPDATE',
    'bucket_id = ''menu-images'' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)'
);

-- Policy 4 : Suppression par restaurants
SELECT create_storage_policy(
    'Restaurants can delete menu images',
    'DELETE',
    'bucket_id = ''menu-images'' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)'
);

-- ============================================
-- POLICIES POUR LE BUCKET user-images
-- ============================================

-- Policy 1 : Lecture publique
SELECT create_storage_policy(
    'Public Access to User Images',
    'SELECT',
    'bucket_id = ''user-images'''
);

-- Policy 2 : Upload par utilisateurs
SELECT create_storage_policy(
    'Users can upload own images',
    'INSERT',
    'bucket_id = ''user-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- Policy 3 : Mise à jour par utilisateurs
SELECT create_storage_policy(
    'Users can update own images',
    'UPDATE',
    'bucket_id = ''user-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- Policy 4 : Suppression par utilisateurs
SELECT create_storage_policy(
    'Users can delete own images',
    'DELETE',
    'bucket_id = ''user-images'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- ============================================
-- POLICIES POUR LE BUCKET passports (PRIVÉ)
-- ============================================

-- Policy 1 : Lecture par restaurants
SELECT create_storage_policy(
    'Restaurants can view own passports',
    'SELECT',
    'bucket_id = ''passports'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- Policy 2 : Upload par restaurants
SELECT create_storage_policy(
    'Restaurants can upload own passports',
    'INSERT',
    'bucket_id = ''passports'' AND auth.uid()::text = (storage.foldername(name))[1]'
);

-- Policy 3 : Lecture par admins
SELECT create_storage_policy(
    'Admins can view all passports',
    'SELECT',
    'bucket_id = ''passports'' AND EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.email = ''admin@taybo.com'')'
);

-- ============================================
-- NETTOYAGE : Supprimer la fonction helper
-- ============================================

-- Optionnel : Supprimer la fonction helper après utilisation
-- DROP FUNCTION IF EXISTS create_storage_policy(TEXT, TEXT, TEXT);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que toutes les policies ont été créées
SELECT 
    policyname,
    cmd as operation,
    qual as definition
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname IN (
    'Public Access to Restaurant Images',
    'Restaurants can upload own images',
    'Restaurants can update own images',
    'Restaurants can delete own images',
    'Public Access to Menu Images',
    'Restaurants can upload menu images',
    'Restaurants can update menu images',
    'Restaurants can delete menu images',
    'Public Access to User Images',
    'Users can upload own images',
    'Users can update own images',
    'Users can delete own images',
    'Restaurants can view own passports',
    'Restaurants can upload own passports',
    'Admins can view all passports'
  )
ORDER BY policyname;

-- Afficher le nombre total de policies créées
SELECT COUNT(*) as total_policies_created
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

