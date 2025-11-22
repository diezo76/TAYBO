-- Script de correction rapide des policies Storage
-- Exécutez ce script si vous avez des erreurs d'accès aux images

-- =====================================================
-- SUPPRIMER LES ANCIENNES POLICIES (si elles existent)
-- =====================================================
DROP POLICY IF EXISTS "Public Access to Restaurant Images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurants can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurants can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurants can delete own images" ON storage.objects;

DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurants can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurants can update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Restaurants can delete menu images" ON storage.objects;

DROP POLICY IF EXISTS "Public Access to User Images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

DROP POLICY IF EXISTS "Restaurants can view own passports" ON storage.objects;
DROP POLICY IF EXISTS "Restaurants can upload own passports" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all passports" ON storage.objects;

-- =====================================================
-- CRÉER LES NOUVELLES POLICIES
-- =====================================================

-- RESTAURANT-IMAGES (Public)
CREATE POLICY "Public Access to Restaurant Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

CREATE POLICY "Restaurants can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Restaurants can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurant-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Restaurants can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- MENU-IMAGES (Public)
CREATE POLICY "Public Access to Menu Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

CREATE POLICY "Restaurants can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id::text = auth.uid()::text
  )
);

CREATE POLICY "Restaurants can update menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id::text = auth.uid()::text
  )
);

CREATE POLICY "Restaurants can delete menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id::text = auth.uid()::text
  )
);

-- USER-IMAGES (Public)
CREATE POLICY "Public Access to User Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-images');

CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- PASSPORTS (Privé)
CREATE POLICY "Restaurants can view own passports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'passports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Restaurants can upload own passports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'passports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

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

-- =====================================================
-- VÉRIFICATION
-- =====================================================
SELECT 
  'Policies créées avec succès' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

