-- Script de vérification de la configuration du Storage Supabase
-- Exécutez ce script dans le SQL Editor de Supabase pour diagnostiquer les problèmes

-- =====================================================
-- 1. VÉRIFIER LES BUCKETS EXISTANTS
-- =====================================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
ORDER BY name;

-- =====================================================
-- 2. VÉRIFIER LES POLICIES EXISTANTES SUR storage.objects
-- =====================================================
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
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- =====================================================
-- 3. COMPTER LES FICHIERS DANS CHAQUE BUCKET
-- =====================================================
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size
FROM storage.objects
GROUP BY bucket_id
ORDER BY bucket_id;

-- =====================================================
-- 4. LISTER LES IMAGES DE RESTAURANTS
-- =====================================================
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
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- 5. VÉRIFIER LES RESTAURANTS AVEC IMAGES
-- =====================================================
SELECT 
  r.id,
  r.name,
  r.image_url,
  r.is_active,
  r.is_verified,
  CASE 
    WHEN r.image_url IS NULL THEN '❌ Pas d''image'
    WHEN r.image_url LIKE 'http%' THEN '✅ URL complète'
    ELSE '⚠️ Chemin relatif'
  END as image_status
FROM restaurants r
ORDER BY r.created_at DESC;

-- =====================================================
-- 6. VÉRIFIER LA CORRESPONDANCE ENTRE DB ET STORAGE
-- =====================================================
-- Restaurants avec une image_url mais fichier manquant dans storage
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  r.image_url,
  '❌ Fichier manquant dans storage' as status
FROM restaurants r
WHERE r.image_url IS NOT NULL
  AND r.image_url != ''
  AND NOT EXISTS (
    SELECT 1 
    FROM storage.objects o
    WHERE o.bucket_id = 'restaurant-images'
      AND (
        o.name = r.image_url
        OR o.name = SPLIT_PART(r.image_url, '/restaurant-images/', 2)
        OR o.name LIKE '%' || SPLIT_PART(r.image_url, '/', 2) || '%'
      )
  );

-- =====================================================
-- 7. DIAGNOSTIC COMPLET
-- =====================================================
-- Résumé de la configuration
SELECT 
  'Configuration du Storage' as section,
  json_build_object(
    'buckets_total', (SELECT COUNT(*) FROM storage.buckets),
    'bucket_restaurant_images_exists', EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'restaurant-images'),
    'bucket_restaurant_images_public', (SELECT public FROM storage.buckets WHERE name = 'restaurant-images'),
    'policies_total', (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'),
    'policies_restaurant_images', (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND qual LIKE '%restaurant-images%'),
    'fichiers_restaurant_images', (SELECT COUNT(*) FROM storage.objects WHERE bucket_id = 'restaurant-images'),
    'restaurants_avec_images', (SELECT COUNT(*) FROM restaurants WHERE image_url IS NOT NULL AND image_url != '')
  ) as config_summary;

-- =====================================================
-- 8. RECOMMANDATIONS
-- =====================================================
-- Afficher les actions nécessaires
DO $$
DECLARE
  bucket_exists boolean;
  bucket_is_public boolean;
  policies_count integer;
BEGIN
  -- Vérifier si le bucket existe
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'restaurant-images') INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    RAISE NOTICE '❌ ACTION REQUISE : Le bucket "restaurant-images" n''existe pas';
    RAISE NOTICE '   → Créez le bucket dans Storage > New bucket';
    RAISE NOTICE '   → Nom : restaurant-images';
    RAISE NOTICE '   → Public : OUI (coché)';
  ELSE
    -- Vérifier si le bucket est public
    SELECT public FROM storage.buckets WHERE name = 'restaurant-images' INTO bucket_is_public;
    
    IF NOT bucket_is_public THEN
      RAISE NOTICE '⚠️  ACTION REQUISE : Le bucket "restaurant-images" n''est pas public';
      RAISE NOTICE '   → Allez dans Storage > restaurant-images > Settings';
      RAISE NOTICE '   → Activez "Public bucket"';
    ELSE
      RAISE NOTICE '✅ Le bucket "restaurant-images" existe et est public';
    END IF;
  END IF;
  
  -- Vérifier les policies
  SELECT COUNT(*) 
  FROM pg_policies 
  WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%Restaurant%'
  INTO policies_count;
  
  IF policies_count = 0 THEN
    RAISE NOTICE '❌ ACTION REQUISE : Aucune policy n''est configurée pour les images de restaurants';
    RAISE NOTICE '   → Exécutez la migration 016_setup_storage_policies.sql';
  ELSE
    RAISE NOTICE '✅ Des policies sont configurées pour les images de restaurants (% trouvée(s))', policies_count;
  END IF;
END $$;

