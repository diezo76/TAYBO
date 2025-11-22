-- Script de correction des politiques Storage
-- Problème identifié : Les politiques INSERT existent mais leur condition WITH CHECK
-- n'est pas correctement détectée dans pg_policies (qual est null)
-- Ce script recrée les politiques INSERT avec les bonnes conditions
--
-- ✅ STATUT : Script exécuté avec succès - Toutes les politiques sont maintenant correctement configurées
-- Voir COMPTE_RENDU_VERIFICATION_POLITIQUES_STORAGE.md pour les détails
--
-- INSTRUCTIONS :
-- 1. Allez dans Supabase Dashboard > SQL Editor
-- 2. Exécutez ce script
-- 3. Vérifiez avec la requête à la fin

-- ============================================
-- NETTOYAGE : Supprimer la politique dupliquée
-- ============================================

-- Supprimer la politique "Users can read own passports" qui est un doublon
-- de "Restaurants can view own passports"
DROP POLICY IF EXISTS "Users can read own passports" ON storage.objects;

-- ============================================
-- CORRECTION : Recréer les politiques INSERT avec les bonnes conditions
-- ============================================

-- restaurant-images : Recréer INSERT avec condition explicite
DROP POLICY IF EXISTS "Restaurants can upload own images" ON storage.objects;
CREATE POLICY "Restaurants can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- menu-images : Recréer INSERT avec condition explicite
DROP POLICY IF EXISTS "Restaurants can upload menu images" ON storage.objects;
CREATE POLICY "Restaurants can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id::text = auth.uid()::text
  )
);

-- user-images : Recréer INSERT avec condition explicite
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- passports : Recréer INSERT avec condition explicite
DROP POLICY IF EXISTS "Restaurants can upload own passports" ON storage.objects;
CREATE POLICY "Restaurants can upload own passports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'passports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- VÉRIFICATION : Afficher toutes les politiques par bucket
-- ============================================

-- Compter les policies par bucket et commande
-- Note : Pour INSERT, utiliser le nom de la politique ou with_check si disponible
SELECT 
  CASE 
    -- Détection basée sur le nom de la politique (plus fiable)
    WHEN policyname LIKE '%restaurant%image%' OR 
         policyname LIKE '%Restaurant%Image%' OR
         (qual IS NOT NULL AND qual LIKE '%restaurant-images%') OR
         (with_check IS NOT NULL AND with_check LIKE '%restaurant-images%') THEN 'restaurant-images'
    WHEN policyname LIKE '%menu%image%' OR 
         policyname LIKE '%Menu%Image%' OR
         (qual IS NOT NULL AND qual LIKE '%menu-images%') OR
         (with_check IS NOT NULL AND with_check LIKE '%menu-images%') THEN 'menu-images'
    WHEN policyname LIKE '%user%image%' OR 
         policyname LIKE '%User%Image%' OR
         (qual IS NOT NULL AND qual LIKE '%user-images%') OR
         (with_check IS NOT NULL AND with_check LIKE '%user-images%') THEN 'user-images'
    WHEN policyname LIKE '%passport%' OR 
         policyname LIKE '%Passport%' OR
         (qual IS NOT NULL AND qual LIKE '%passports%') OR
         (with_check IS NOT NULL AND with_check LIKE '%passports%') THEN 'passports'
    ELSE 'autre'
  END AS bucket,
  cmd,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
GROUP BY bucket, cmd
ORDER BY bucket, cmd;

-- Afficher toutes les politiques avec leurs noms et conditions
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN policyname LIKE '%restaurant%image%' OR 
         policyname LIKE '%Restaurant%Image%' OR
         (qual IS NOT NULL AND qual LIKE '%restaurant-images%') OR
         (with_check IS NOT NULL AND with_check LIKE '%restaurant-images%') THEN 'restaurant-images'
    WHEN policyname LIKE '%menu%image%' OR 
         policyname LIKE '%Menu%Image%' OR
         (qual IS NOT NULL AND qual LIKE '%menu-images%') OR
         (with_check IS NOT NULL AND with_check LIKE '%menu-images%') THEN 'menu-images'
    WHEN policyname LIKE '%user%image%' OR 
         policyname LIKE '%User%Image%' OR
         (qual IS NOT NULL AND qual LIKE '%user-images%') OR
         (with_check IS NOT NULL AND with_check LIKE '%user-images%') THEN 'user-images'
    WHEN policyname LIKE '%passport%' OR 
         policyname LIKE '%Passport%' OR
         (qual IS NOT NULL AND qual LIKE '%passports%') OR
         (with_check IS NOT NULL AND with_check LIKE '%passports%') THEN 'passports'
    ELSE 'autre'
  END AS bucket,
  COALESCE(qual, with_check, 'N/A') AS condition
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY bucket, cmd, policyname;

