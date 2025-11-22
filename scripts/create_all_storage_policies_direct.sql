-- Script SQL DIRECT pour créer toutes les 15 policies Storage
-- Utilise directement CREATE POLICY (sans fonction helper)
-- 
-- ⚠️ Si vous obtenez l'erreur "must be owner of relation objects",
-- utilisez l'interface Supabase Dashboard (voir SOLUTION_ERREUR_STORAGE_POLICIES.md)

-- ============================================
-- POLICIES POUR LE BUCKET restaurant-images
-- ============================================

-- Policy 1 : Lecture publique (SELECT)
DROP POLICY IF EXISTS "Public Access to Restaurant Images" ON storage.objects;
CREATE POLICY "Public Access to Restaurant Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

-- Policy 2 : Upload par restaurants (INSERT)
DROP POLICY IF EXISTS "Restaurants can upload own images" ON storage.objects;
CREATE POLICY "Restaurants can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'restaurant-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3 : Mise à jour par restaurants (UPDATE)
DROP POLICY IF EXISTS "Restaurants can update own images" ON storage.objects;
CREATE POLICY "Restaurants can update own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'restaurant-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4 : Suppression par restaurants (DELETE)
DROP POLICY IF EXISTS "Restaurants can delete own images" ON storage.objects;
CREATE POLICY "Restaurants can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'restaurant-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- POLICIES POUR LE BUCKET menu-images
-- ============================================

-- Policy 1 : Lecture publique (SELECT)
DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
CREATE POLICY "Public Access to Menu Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Policy 2 : Upload par restaurants (INSERT)
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

-- Policy 3 : Mise à jour par restaurants (UPDATE)
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

-- Policy 4 : Suppression par restaurants (DELETE)
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
-- POLICIES POUR LE BUCKET user-images
-- ============================================

-- Policy 1 : Lecture publique (SELECT)
DROP POLICY IF EXISTS "Public Access to User Images" ON storage.objects;
CREATE POLICY "Public Access to User Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-images');

-- Policy 2 : Upload par utilisateurs (INSERT)
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'user-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3 : Mise à jour par utilisateurs (UPDATE)
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'user-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4 : Suppression par utilisateurs (DELETE)
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'user-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- POLICIES POUR LE BUCKET passports (PRIVÉ)
-- ============================================

-- Policy 1 : Lecture par restaurants (SELECT)
DROP POLICY IF EXISTS "Restaurants can view own passports" ON storage.objects;
CREATE POLICY "Restaurants can view own passports"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'passports'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2 : Upload par restaurants (INSERT)
DROP POLICY IF EXISTS "Restaurants can upload own passports" ON storage.objects;
CREATE POLICY "Restaurants can upload own passports"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'passports'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3 : Lecture par admins (SELECT)
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

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Vérifier que toutes les 15 policies ont été créées
SELECT 
    policyname,
    cmd as operation,
    CASE cmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE cmd::text
    END as operation_name
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- Compter le nombre total de policies
SELECT COUNT(*) as total_policies_created
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- Afficher un message de succès
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects';
    
    IF policy_count >= 15 THEN
        RAISE NOTICE '✅ Succès ! % policies Storage créées.', policy_count;
    ELSE
        RAISE WARNING '⚠️  Seulement % policies créées. Attendu: 15', policy_count;
    END IF;
END $$;

