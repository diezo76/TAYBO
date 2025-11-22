-- Script SQL pour créer les Policies Storage
-- 
-- INSTRUCTIONS :
-- 1. Allez dans Supabase Dashboard > SQL Editor
-- 2. Copiez-collez ce script COMPLET
-- 3. Exécutez-le (Run)
--
-- Si vous obtenez encore une erreur de permissions, utilisez l'interface Dashboard :
-- Storage > Policies > New Policy (pour chaque policy)
-- Voir GUIDE_CREATION_POLICIES_STORAGE.md pour les détails

-- ============================================
-- POLICIES POUR restaurant-images
-- ============================================

DROP POLICY IF EXISTS "Public Access to Restaurant Images" ON storage.objects;
CREATE POLICY "Public Access to Restaurant Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

DROP POLICY IF EXISTS "Restaurants can upload own images" ON storage.objects;
CREATE POLICY "Restaurants can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Restaurants can update own images" ON storage.objects;
CREATE POLICY "Restaurants can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurant-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Restaurants can delete own images" ON storage.objects;
CREATE POLICY "Restaurants can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- POLICIES POUR menu-images
-- ============================================

DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
CREATE POLICY "Public Access to Menu Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

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

DROP POLICY IF EXISTS "Restaurants can update menu images" ON storage.objects;
CREATE POLICY "Restaurants can update menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id::text = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "Restaurants can delete menu images" ON storage.objects;
CREATE POLICY "Restaurants can delete menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id::text = auth.uid()::text
  )
);

-- ============================================
-- POLICIES POUR user-images
-- ============================================

DROP POLICY IF EXISTS "Public Access to User Images" ON storage.objects;
CREATE POLICY "Public Access to User Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-images');

DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- POLICIES POUR passports
-- ============================================

DROP POLICY IF EXISTS "Restaurants can view own passports" ON storage.objects;
CREATE POLICY "Restaurants can view own passports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'passports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Restaurants can upload own passports" ON storage.objects;
CREATE POLICY "Restaurants can upload own passports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'passports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Admins can view all passports" ON storage.objects;
CREATE POLICY "Admins can view all passports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'passports'
  AND EXISTS (
    SELECT 1 FROM users
    WHERE users.id::text = auth.uid()::text
    AND users.email = 'admin@taybo.com'
  )
);

-- Vérification
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

