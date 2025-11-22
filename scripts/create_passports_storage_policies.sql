-- Script pour créer les politiques Storage pour le bucket passports
-- 
-- ⚠️ IMPORTANT : Ce script doit être exécuté via Supabase Dashboard → SQL Editor
-- Il nécessite des permissions spéciales sur storage.objects
--
-- PRÉREQUIS :
-- 1. La fonction extract_user_id_from_path doit exister (créée par migration 027)
-- 2. Le bucket 'passports' doit exister dans Storage
--
-- INSTRUCTIONS :
-- 1. Allez sur https://supabase.com/dashboard
-- 2. Sélectionnez votre projet
-- 3. Allez dans SQL Editor
-- 4. Collez et exécutez ce script

-- ============================================
-- POLITIQUES STORAGE POUR LE BUCKET PASSPORTS
-- ============================================

-- Politique SELECT : Permet aux restaurants de voir leurs propres documents
DROP POLICY IF EXISTS "Restaurants can view own passports" ON storage.objects;
CREATE POLICY "Restaurants can view own passports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'passports'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = extract_user_id_from_path(name)
);

-- Politique INSERT : Permet aux restaurants d'uploader leurs propres documents
DROP POLICY IF EXISTS "Restaurants can upload own passports" ON storage.objects;
CREATE POLICY "Restaurants can upload own passports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'passports'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = extract_user_id_from_path(name)
);

-- Politique UPDATE : Permet aux restaurants de mettre à jour leurs propres documents
DROP POLICY IF EXISTS "Restaurants can update own passports" ON storage.objects;
CREATE POLICY "Restaurants can update own passports"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'passports'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = extract_user_id_from_path(name)
);

-- Politique DELETE : Permet aux restaurants de supprimer leurs propres documents
DROP POLICY IF EXISTS "Restaurants can delete own passports" ON storage.objects;
CREATE POLICY "Restaurants can delete own passports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'passports'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = extract_user_id_from_path(name)
);

-- Politique admin SELECT : Permet aux admins de voir tous les documents
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

-- Commentaires explicatifs
COMMENT ON POLICY "Restaurants can view own passports" ON storage.objects IS 
'Permet aux restaurants de voir leurs propres documents - l''ID est extrait depuis le nom du fichier';

COMMENT ON POLICY "Restaurants can upload own passports" ON storage.objects IS 
'Permet aux restaurants d''uploader leurs propres documents - l''ID est extrait depuis le nom du fichier';

COMMENT ON POLICY "Restaurants can update own passports" ON storage.objects IS 
'Permet aux restaurants de mettre à jour leurs propres documents - l''ID est extrait depuis le nom du fichier';

COMMENT ON POLICY "Restaurants can delete own passports" ON storage.objects IS 
'Permet aux restaurants de supprimer leurs propres documents - l''ID est extrait depuis le nom du fichier';

COMMENT ON POLICY "Admins can view all passports" ON storage.objects IS 
'Permet aux admins de voir tous les documents d''identité pour vérification';

-- ============================================
-- VÉRIFICATION DES POLITIQUES CRÉÉES
-- ============================================

-- Exécutez cette requête pour vérifier que les politiques ont été créées
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%passport%'
ORDER BY policyname;

-- Si la requête ci-dessus retourne 5 lignes, c'est que toutes les politiques ont été créées avec succès !

