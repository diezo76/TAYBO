-- Script de diagnostic pour l'image du restaurant "Daynite"
-- Exécutez ce script dans le SQL Editor de Supabase

-- =====================================================
-- 1. TROUVER LE RESTAURANT "DAYNITE"
-- =====================================================
SELECT 
  id,
  name,
  image_url,
  is_active,
  is_verified,
  created_at
FROM restaurants
WHERE LOWER(name) LIKE '%daynite%' OR LOWER(name) LIKE '%daynight%'
ORDER BY created_at DESC;

-- =====================================================
-- 2. VÉRIFIER SI LE FICHIER EXISTE DANS LE STORAGE
-- =====================================================
-- Remplacez 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf' par l'ID réel du restaurant
SELECT 
  id,
  name,
  bucket_id,
  metadata->>'size' as size_bytes,
  metadata->>'mimetype' as mime_type,
  created_at,
  updated_at
FROM storage.objects
WHERE bucket_id = 'restaurant-images'
  AND name LIKE '%cb6dc3c1-294d-4162-adc6-20551b2bb6cf%'
ORDER BY created_at DESC;

-- =====================================================
-- 3. LISTER TOUS LES FICHIERS DU RESTAURANT
-- =====================================================
SELECT 
  id,
  name,
  bucket_id,
  metadata->>'size' as size_bytes,
  metadata->>'mimetype' as mime_type,
  created_at
FROM storage.objects
WHERE bucket_id = 'restaurant-images'
  AND name LIKE '%cb6dc3c1-294d-4162-adc6-20551b2bb6cf%'
ORDER BY created_at DESC;

-- =====================================================
-- 4. VÉRIFIER LA CONFIGURATION DU BUCKET
-- =====================================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE name = 'restaurant-images';

-- =====================================================
-- 5. VÉRIFIER LES POLICIES RLS
-- =====================================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND qual LIKE '%restaurant-images%'
ORDER BY policyname;

-- =====================================================
-- 6. TESTER L'ACCÈS PUBLIC AU FICHIER
-- =====================================================
-- Cette requête simule ce que fait Supabase pour vérifier l'accès
SELECT 
  o.id,
  o.name,
  o.bucket_id,
  CASE 
    WHEN b.public = true THEN '✅ Bucket public'
    ELSE '❌ Bucket privé'
  END as bucket_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies p
      WHERE p.schemaname = 'storage'
        AND p.tablename = 'objects'
        AND p.cmd = 'SELECT'
        AND p.qual LIKE '%restaurant-images%'
    ) THEN '✅ Policy SELECT existe'
    ELSE '❌ Policy SELECT manquante'
  END as policy_status
FROM storage.objects o
JOIN storage.buckets b ON b.id = o.bucket_id
WHERE o.bucket_id = 'restaurant-images'
  AND o.name LIKE '%cb6dc3c1-294d-4162-adc6-20551b2bb6cf%'
LIMIT 1;

-- =====================================================
-- 7. CORRIGER L'IMAGE_URL SI LE FICHIER N'EXISTE PAS
-- =====================================================
-- Décommentez cette section si le fichier n'existe pas dans le storage
-- et que vous voulez mettre image_url à NULL

/*
UPDATE restaurants
SET image_url = NULL
WHERE id = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf'
  AND NOT EXISTS (
    SELECT 1 
    FROM storage.objects o
    WHERE o.bucket_id = 'restaurant-images'
      AND (
        o.name = restaurants.image_url
        OR o.name LIKE '%' || restaurants.id::text || '%'
      )
  );
*/

