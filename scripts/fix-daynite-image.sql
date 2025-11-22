-- Script de correction pour l'image du restaurant "Daynite"
-- Exécutez ce script dans le SQL Editor de Supabase pour corriger le problème d'image

-- =====================================================
-- ÉTAPE 1 : TROUVER LE RESTAURANT "DAYNITE"
-- =====================================================
-- Cette requête trouve le restaurant et affiche ses informations
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
-- ÉTAPE 2 : VÉRIFIER SI LE FICHIER EXISTE DANS LE STORAGE
-- =====================================================
-- Remplacez 'RESTAURANT_ID' par l'ID réel trouvé à l'étape 1
-- Remplacez 'FILENAME' par le nom du fichier extrait de image_url
WITH restaurant_info AS (
  SELECT 
    id,
    name,
    image_url
  FROM restaurants
  WHERE LOWER(name) LIKE '%daynite%' OR LOWER(name) LIKE '%daynight%'
  LIMIT 1
)
SELECT 
  r.id as restaurant_id,
  r.name as restaurant_name,
  r.image_url,
  CASE 
    WHEN r.image_url IS NULL THEN '❌ Pas d''image_url'
    WHEN r.image_url LIKE 'http%' THEN 
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM storage.objects o
          WHERE o.bucket_id = 'restaurant-images'
            AND (
              o.name = SPLIT_PART(r.image_url, '/restaurant-images/', 2)
              OR o.name LIKE '%' || SPLIT_PART(SPLIT_PART(r.image_url, '/restaurant-images/', 2), '/', 1) || '%'
            )
        ) THEN '✅ Fichier existe dans storage'
        ELSE '❌ Fichier manquant dans storage'
      END
    ELSE '⚠️ Format d''URL inconnu'
  END as file_status
FROM restaurant_info r;

-- =====================================================
-- ÉTAPE 3 : CORRIGER L'IMAGE_URL SI LE FICHIER N'EXISTE PAS
-- =====================================================
-- Cette requête met image_url à NULL si le fichier n'existe pas dans le storage
-- Décommentez et exécutez cette section si le fichier est manquant

/*
UPDATE restaurants
SET image_url = NULL
WHERE (LOWER(name) LIKE '%daynite%' OR LOWER(name) LIKE '%daynight%')
  AND image_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 
    FROM storage.objects o
    WHERE o.bucket_id = 'restaurant-images'
      AND (
        -- Essayer de matcher le chemin complet
        o.name = SPLIT_PART(restaurants.image_url, '/restaurant-images/', 2)
        -- Ou matcher par ID de restaurant
        OR o.name LIKE restaurants.id::text || '/%'
      )
  );
*/

-- =====================================================
-- ÉTAPE 4 : VÉRIFIER LA CONFIGURATION DU BUCKET
-- =====================================================
-- S'assurer que le bucket est public et que les policies sont correctes
SELECT 
  'Bucket Configuration' as check_type,
  CASE 
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'restaurant-images') 
    THEN '✅ Bucket existe'
    ELSE '❌ Bucket manquant'
  END as bucket_exists,
  CASE 
    WHEN EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'restaurant-images' AND public = true)
    THEN '✅ Bucket public'
    ELSE '❌ Bucket privé (doit être public)'
  END as bucket_public,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname = 'Public Access to Restaurant Images'
    )
    THEN '✅ Policy SELECT existe'
    ELSE '❌ Policy SELECT manquante'
  END as policy_select;

-- =====================================================
-- ÉTAPE 5 : LISTER TOUS LES FICHIERS DU RESTAURANT DANS LE STORAGE
-- =====================================================
-- Pour voir quels fichiers existent réellement
WITH restaurant_info AS (
  SELECT id FROM restaurants
  WHERE LOWER(name) LIKE '%daynite%' OR LOWER(name) LIKE '%daynight%'
  LIMIT 1
)
SELECT 
  o.id,
  o.name,
  o.bucket_id,
  pg_size_pretty((o.metadata->>'size')::bigint) as size,
  o.metadata->>'mimetype' as mime_type,
  o.created_at
FROM storage.objects o
CROSS JOIN restaurant_info r
WHERE o.bucket_id = 'restaurant-images'
  AND o.name LIKE r.id::text || '/%'
ORDER BY o.created_at DESC;

-- =====================================================
-- ÉTAPE 6 : RECOMMANDATIONS
-- =====================================================
DO $$
DECLARE
  restaurant_id_val UUID;
  restaurant_name_val TEXT;
  image_url_val TEXT;
  file_exists BOOLEAN;
  bucket_public BOOLEAN;
BEGIN
  -- Trouver le restaurant
  SELECT id, name, image_url INTO restaurant_id_val, restaurant_name_val, image_url_val
  FROM restaurants
  WHERE LOWER(name) LIKE '%daynite%' OR LOWER(name) LIKE '%daynight%'
  LIMIT 1;
  
  IF restaurant_id_val IS NULL THEN
    RAISE NOTICE '❌ Restaurant "Daynite" non trouvé';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Restaurant trouvé : % (ID: %)', restaurant_name_val, restaurant_id_val;
  RAISE NOTICE '   Image URL : %', COALESCE(image_url_val, 'NULL');
  
  -- Vérifier si le fichier existe
  IF image_url_val IS NOT NULL AND image_url_val LIKE '%/restaurant-images/%' THEN
    SELECT EXISTS (
      SELECT 1 FROM storage.objects o
      WHERE o.bucket_id = 'restaurant-images'
        AND (
          o.name = SPLIT_PART(image_url_val, '/restaurant-images/', 2)
          OR o.name LIKE restaurant_id_val::text || '/%'
        )
    ) INTO file_exists;
    
    IF NOT file_exists THEN
      RAISE NOTICE '❌ Le fichier n''existe pas dans le storage';
      RAISE NOTICE '   → Solution : Mettre image_url à NULL ou uploader une nouvelle image';
    ELSE
      RAISE NOTICE '✅ Le fichier existe dans le storage';
    END IF;
  END IF;
  
  -- Vérifier si le bucket est public
  SELECT public INTO bucket_public
  FROM storage.buckets
  WHERE name = 'restaurant-images';
  
  IF NOT bucket_public THEN
    RAISE NOTICE '❌ Le bucket "restaurant-images" n''est pas public';
    RAISE NOTICE '   → Solution : Allez dans Storage > restaurant-images > Settings > Activez "Public bucket"';
  ELSE
    RAISE NOTICE '✅ Le bucket "restaurant-images" est public';
  END IF;
  
  -- Vérifier les policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname = 'Public Access to Restaurant Images'
  ) THEN
    RAISE NOTICE '❌ La policy "Public Access to Restaurant Images" n''existe pas';
    RAISE NOTICE '   → Solution : Exécutez scripts/fix-storage-policies.sql';
  ELSE
    RAISE NOTICE '✅ La policy "Public Access to Restaurant Images" existe';
  END IF;
END $$;

