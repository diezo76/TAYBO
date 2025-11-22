-- =====================================================
-- SCRIPT COMPLET DE VÉRIFICATION ET CORRECTION AUTOMATIQUE
-- Pour le restaurant Daynite et tous les autres restaurants
-- =====================================================
-- 
-- Ce script fait TOUT automatiquement :
-- 1. Vérifie les buckets Storage
-- 2. Vérifie les policies RLS
-- 3. Trouve tous les restaurants avec des problèmes d'images
-- 4. Vérifie les fichiers dans le storage
-- 5. Corrige automatiquement les URLs
-- 6. Affiche un rapport complet
--
-- EXÉCUTEZ CE SCRIPT DANS LE SQL EDITOR DE SUPABASE
-- =====================================================

DO $$
DECLARE
  supabase_url TEXT := 'https://ocxesczzlzopbcobppok.supabase.co';
  restaurant_record RECORD;
  file_path_val TEXT;
  file_exists BOOLEAN;
  latest_file TEXT;
  new_url TEXT;
  total_restaurants INTEGER := 0;
  restaurants_fixed INTEGER := 0;
  restaurants_no_files INTEGER := 0;
  restaurants_ok INTEGER := 0;
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE '   VÉRIFICATION ET CORRECTION COMPLÈTE';
  RAISE NOTICE '   Tous les restaurants';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  
  -- =====================================================
  -- 1. VÉRIFICATION DES BUCKETS
  -- =====================================================
  RAISE NOTICE '1. VÉRIFICATION DES BUCKETS STORAGE';
  RAISE NOTICE '   --------------------------------';
  
  IF NOT EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'restaurant-images') THEN
    RAISE NOTICE '   ❌ Bucket "restaurant-images" n''existe pas';
    RAISE NOTICE '   → Créez-le dans Storage > New bucket';
    RETURN;
  END IF;
  
  IF NOT (SELECT public FROM storage.buckets WHERE name = 'restaurant-images') THEN
    RAISE NOTICE '   ❌ Bucket "restaurant-images" n''est PAS public';
    RAISE NOTICE '   → Allez dans Storage > restaurant-images > Settings > "Public bucket"';
    RETURN;
  END IF;
  
  RAISE NOTICE '   ✅ Bucket "restaurant-images" existe et est public';
  RAISE NOTICE '';
  
  -- =====================================================
  -- 2. VÉRIFICATION DES POLICIES RLS
  -- =====================================================
  RAISE NOTICE '2. VÉRIFICATION DES POLICIES RLS';
  RAISE NOTICE '   -----------------------------';
  
  IF NOT EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname LIKE '%Restaurant%Images%'
      AND cmd = 'SELECT'
  ) THEN
    RAISE NOTICE '   ❌ Policy SELECT manquante pour restaurant-images';
    RAISE NOTICE '   → Exécutez: scripts/fix-storage-policies.sql';
    RETURN;
  END IF;
  
  RAISE NOTICE '   ✅ Policies RLS configurées correctement';
  RAISE NOTICE '';
  
  -- =====================================================
  -- 3. TRAITEMENT DE TOUS LES RESTAURANTS
  -- =====================================================
  RAISE NOTICE '3. TRAITEMENT DES RESTAURANTS';
  RAISE NOTICE '   -------------------------';
  RAISE NOTICE '';
  
  FOR restaurant_record IN 
    SELECT id, name, image_url
    FROM restaurants
    WHERE is_active = true
    ORDER BY name
  LOOP
    total_restaurants := total_restaurants + 1;
    
    RAISE NOTICE '   Restaurant: % (ID: %)', restaurant_record.name, restaurant_record.id;
    
    -- Chercher le fichier le plus récent dans le storage
    SELECT name INTO latest_file
    FROM storage.objects
    WHERE bucket_id = 'restaurant-images'
      AND name LIKE restaurant_record.id::text || '/%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF latest_file IS NULL THEN
      -- Aucun fichier trouvé
      RAISE NOTICE '      ⚠️  Aucun fichier dans le storage';
      
      IF restaurant_record.image_url IS NOT NULL THEN
        -- Il y a une URL mais pas de fichier → mettre à NULL
        UPDATE restaurants
        SET image_url = NULL
        WHERE id = restaurant_record.id;
        
        RAISE NOTICE '      ✅ image_url mis à NULL (placeholder s''affichera)';
        restaurants_no_files := restaurants_no_files + 1;
      ELSE
        RAISE NOTICE '      ✅ Déjà NULL - OK';
        restaurants_ok := restaurants_ok + 1;
      END IF;
      
    ELSE
      -- Fichier trouvé dans le storage
      RAISE NOTICE '      📁 Fichier trouvé: %', latest_file;
      
      -- Construire la nouvelle URL
      new_url := supabase_url || '/storage/v1/object/public/restaurant-images/' || latest_file;
      
      IF restaurant_record.image_url IS NULL THEN
        -- Pas d'URL dans la DB → mettre à jour
        UPDATE restaurants
        SET image_url = new_url
        WHERE id = restaurant_record.id;
        
        RAISE NOTICE '      ✅ URL ajoutée: %', new_url;
        restaurants_fixed := restaurants_fixed + 1;
        
      ELSIF restaurant_record.image_url LIKE '%/restaurant-images/%' THEN
        -- Extraire le chemin du fichier depuis l'URL
        file_path_val := SPLIT_PART(restaurant_record.image_url, '/restaurant-images/', 2);
        file_path_val := SPLIT_PART(file_path_val, '?', 1);
        
        -- Vérifier si le fichier existe
        SELECT EXISTS(
          SELECT 1 FROM storage.objects
          WHERE bucket_id = 'restaurant-images'
            AND name = file_path_val
        ) INTO file_exists;
        
        IF file_exists THEN
          RAISE NOTICE '      ✅ URL correcte - Tout est OK';
          restaurants_ok := restaurants_ok + 1;
        ELSE
          -- Le fichier référencé n'existe pas → mettre à jour avec le fichier trouvé
          UPDATE restaurants
          SET image_url = new_url
          WHERE id = restaurant_record.id;
          
          RAISE NOTICE '      ✅ URL corrigée: %', new_url;
          restaurants_fixed := restaurants_fixed + 1;
        END IF;
      ELSE
        -- Format d'URL inconnu → mettre à jour
        UPDATE restaurants
        SET image_url = new_url
        WHERE id = restaurant_record.id;
        
        RAISE NOTICE '      ✅ URL mise à jour: %', new_url;
        restaurants_fixed := restaurants_fixed + 1;
      END IF;
    END IF;
    
    RAISE NOTICE '';
  END LOOP;
  
  -- =====================================================
  -- 4. RÉSUMÉ FINAL
  -- =====================================================
  RAISE NOTICE '====================================================';
  RAISE NOTICE '                RÉSUMÉ FINAL';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total restaurants traités: %', total_restaurants;
  RAISE NOTICE 'Restaurants corrigés: %', restaurants_fixed;
  RAISE NOTICE 'Restaurants sans fichiers: %', restaurants_no_files;
  RAISE NOTICE 'Restaurants OK: %', restaurants_ok;
  RAISE NOTICE '';
  
  IF restaurants_fixed > 0 THEN
    RAISE NOTICE '✅ % restaurant(s) ont été corrigé(s)', restaurants_fixed;
    RAISE NOTICE '';
    RAISE NOTICE 'Pour voir les changements:';
    RAISE NOTICE '1. Videz le cache du navigateur (Ctrl+Shift+R)';
    RAISE NOTICE '2. Redémarrez le serveur de développement';
    RAISE NOTICE '3. Ouvrez: http://localhost:5173';
  END IF;
  
  IF restaurants_no_files > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  % restaurant(s) n''ont pas de fichiers dans le storage', restaurants_no_files;
    RAISE NOTICE '   → Ces restaurants doivent uploader une image via l''interface';
    RAISE NOTICE '   → URL: http://localhost:5173/restaurant/profile';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  
END $$;

-- =====================================================
-- AFFICHAGE DES RESTAURANTS AVEC LEUR STATUT
-- =====================================================
SELECT 
  name as "Restaurant",
  CASE 
    WHEN image_url IS NULL THEN '⚠️  Pas d''image'
    WHEN image_url LIKE '%/restaurant-images/%' THEN '✅ Image configurée'
    ELSE '❌ Format inconnu'
  END as "Statut Image",
  image_url as "URL Image"
FROM restaurants
WHERE is_active = true
ORDER BY name;

-- =====================================================
-- VÉRIFICATION SPÉCIFIQUE POUR DAYNITE
-- =====================================================
SELECT 
  '🔍 VÉRIFICATION DAYNITE' as label,
  id,
  name,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN '⚠️  Pas d''image (placeholder)'
    WHEN image_url LIKE '%/restaurant-images/%' THEN '✅ URL valide'
    ELSE '❌ Format inconnu'
  END as status
FROM restaurants
WHERE LOWER(name) LIKE '%daynite%' OR LOWER(name) LIKE '%daynight%'
ORDER BY name;

