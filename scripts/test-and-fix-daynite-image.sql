-- Script COMPLET de test et correction pour l'image du restaurant "Daynite"
-- Exécutez ce script dans le SQL Editor de Supabase
-- Ce script teste TOUT et corrige automatiquement

-- =====================================================
-- ÉTAPE 1 : TROUVER LE RESTAURANT ET AFFICHER SES INFOS
-- =====================================================
DO $$
DECLARE
  restaurant_id_val UUID;
  restaurant_name_val TEXT;
  image_url_val TEXT;
  file_path_val TEXT;
  file_exists BOOLEAN;
  bucket_public BOOLEAN;
  policy_exists BOOLEAN;
  files_in_storage TEXT[];
  correct_file_path TEXT;
BEGIN
  -- Trouver le restaurant
  SELECT id, name, image_url 
  INTO restaurant_id_val, restaurant_name_val, image_url_val
  FROM restaurants
  WHERE id = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf'
     OR LOWER(name) LIKE '%daynite%' 
     OR LOWER(name) LIKE '%daynight%'
  LIMIT 1;
  
  IF restaurant_id_val IS NULL THEN
    RAISE NOTICE '❌ Restaurant non trouvé';
    RETURN;
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESTAURANT TROUVÉ';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ID: %', restaurant_id_val;
  RAISE NOTICE 'Nom: %', restaurant_name_val;
  RAISE NOTICE 'Image URL dans DB: %', COALESCE(image_url_val, 'NULL');
  RAISE NOTICE '';
  
  -- Extraire le chemin du fichier depuis l'URL
  IF image_url_val IS NOT NULL AND image_url_val LIKE '%/restaurant-images/%' THEN
    file_path_val := SPLIT_PART(image_url_val, '/restaurant-images/', 2);
    file_path_val := SPLIT_PART(file_path_val, '?', 1); -- Enlever query params
    RAISE NOTICE 'Chemin extrait: %', file_path_val;
  END IF;
  
  -- =====================================================
  -- ÉTAPE 2 : VÉRIFIER LE BUCKET
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION DU BUCKET';
  RAISE NOTICE '========================================';
  
  IF NOT EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'restaurant-images') THEN
    RAISE NOTICE '❌ Le bucket "restaurant-images" n''existe pas';
    RAISE NOTICE '   → ACTION REQUISE: Créez le bucket dans Storage > New bucket';
    RETURN;
  ELSE
    RAISE NOTICE '✅ Le bucket "restaurant-images" existe';
  END IF;
  
  SELECT public INTO bucket_public
  FROM storage.buckets
  WHERE name = 'restaurant-images';
  
  IF NOT bucket_public THEN
    RAISE NOTICE '❌ Le bucket "restaurant-images" n''est PAS public';
    RAISE NOTICE '   → ACTION REQUISE: Allez dans Storage > restaurant-images > Settings > Activez "Public bucket"';
  ELSE
    RAISE NOTICE '✅ Le bucket "restaurant-images" est public';
  END IF;
  
  -- =====================================================
  -- ÉTAPE 3 : VÉRIFIER LES POLICIES RLS
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION DES POLICIES RLS';
  RAISE NOTICE '========================================';
  
  SELECT EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname = 'Public Access to Restaurant Images'
  ) INTO policy_exists;
  
  IF NOT policy_exists THEN
    RAISE NOTICE '❌ La policy "Public Access to Restaurant Images" n''existe pas';
    RAISE NOTICE '   → ACTION REQUISE: Exécutez scripts/fix-storage-policies.sql';
  ELSE
    RAISE NOTICE '✅ La policy "Public Access to Restaurant Images" existe';
  END IF;
  
  -- =====================================================
  -- ÉTAPE 4 : LISTER TOUS LES FICHIERS DU RESTAURANT
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'FICHIERS DANS LE STORAGE';
  RAISE NOTICE '========================================';
  
  SELECT ARRAY_AGG(name ORDER BY created_at DESC)
  INTO files_in_storage
  FROM storage.objects
  WHERE bucket_id = 'restaurant-images'
    AND name LIKE restaurant_id_val::text || '/%';
  
  IF files_in_storage IS NULL OR array_length(files_in_storage, 1) IS NULL THEN
    RAISE NOTICE '❌ Aucun fichier trouvé dans le storage pour ce restaurant';
    RAISE NOTICE '   → Le restaurant doit uploader une nouvelle image';
  ELSE
    RAISE NOTICE '✅ Fichiers trouvés (%):', array_length(files_in_storage, 1);
    FOR i IN 1..LEAST(array_length(files_in_storage, 1), 10) LOOP
      RAISE NOTICE '   - %', files_in_storage[i];
    END LOOP;
  END IF;
  
  -- =====================================================
  -- ÉTAPE 5 : VÉRIFIER SI LE FICHIER DE L''URL EXISTE
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VÉRIFICATION DU FICHIER';
  RAISE NOTICE '========================================';
  
  IF file_path_val IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM storage.objects
      WHERE bucket_id = 'restaurant-images'
        AND name = file_path_val
    ) INTO file_exists;
    
    IF file_exists THEN
      RAISE NOTICE '✅ Le fichier "%" existe dans le storage', file_path_val;
    ELSE
      RAISE NOTICE '❌ Le fichier "%" N''EXISTE PAS dans le storage', file_path_val;
      
      -- Chercher un fichier similaire
      IF files_in_storage IS NOT NULL THEN
        RAISE NOTICE '';
        RAISE NOTICE 'Fichiers disponibles (utiliser le plus récent):';
        FOR i IN 1..LEAST(array_length(files_in_storage, 1), 5) LOOP
          RAISE NOTICE '   - %', files_in_storage[i];
        END LOOP;
      END IF;
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Aucune image_url dans la base de données';
  END IF;
  
  -- =====================================================
  -- ÉTAPE 6 : CORRECTION AUTOMATIQUE
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CORRECTION AUTOMATIQUE';
  RAISE NOTICE '========================================';
  
  -- Si le fichier n'existe pas mais qu'il y a d'autres fichiers
  IF file_path_val IS NOT NULL AND NOT file_exists AND files_in_storage IS NOT NULL THEN
    -- Utiliser le fichier le plus récent
    correct_file_path := files_in_storage[1];
    
    RAISE NOTICE 'Mise à jour de image_url avec le fichier le plus récent...';
    RAISE NOTICE 'Nouveau chemin: %', correct_file_path;
    
    -- Construire la nouvelle URL
    DECLARE
      new_url TEXT;
      supabase_url TEXT;
    BEGIN
      -- Récupérer l'URL Supabase depuis les variables d'environnement ou utiliser l'URL par défaut
      supabase_url := 'https://ocxesczzlzopbcobppok.supabase.co';
      new_url := supabase_url || '/storage/v1/object/public/restaurant-images/' || correct_file_path;
      
      -- Mettre à jour la base de données
      UPDATE restaurants
      SET image_url = new_url
      WHERE id = restaurant_id_val;
      
      RAISE NOTICE '✅ image_url mis à jour avec succès';
      RAISE NOTICE 'Nouvelle URL: %', new_url;
    END;
  ELSIF file_path_val IS NOT NULL AND NOT file_exists AND (files_in_storage IS NULL OR array_length(files_in_storage, 1) IS NULL) THEN
    -- Aucun fichier disponible, mettre image_url à NULL
    RAISE NOTICE 'Aucun fichier disponible, mise à jour de image_url à NULL...';
    
    UPDATE restaurants
    SET image_url = NULL
    WHERE id = restaurant_id_val;
    
    RAISE NOTICE '✅ image_url mis à NULL (le restaurant devra uploader une nouvelle image)';
  ELSIF file_exists THEN
    RAISE NOTICE '✅ Le fichier existe, aucune correction nécessaire';
  ELSE
    RAISE NOTICE '⚠️  Aucune action nécessaire';
  END IF;
  
  -- =====================================================
  -- ÉTAPE 7 : RÉSUMÉ FINAL
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RÉSUMÉ FINAL';
  RAISE NOTICE '========================================';
  
  -- Afficher l'état final
  SELECT image_url INTO image_url_val
  FROM restaurants
  WHERE id = restaurant_id_val;
  
  RAISE NOTICE 'Image URL finale: %', COALESCE(image_url_val, 'NULL');
  
  IF bucket_public AND policy_exists THEN
    IF image_url_val IS NOT NULL THEN
      RAISE NOTICE '✅ Configuration correcte - L''image devrait se charger';
    ELSE
      RAISE NOTICE '⚠️  Configuration correcte mais aucune image - Le restaurant doit uploader une image';
    END IF;
  ELSE
    RAISE NOTICE '❌ Configuration incomplète - Suivez les actions requises ci-dessus';
  END IF;
  
END $$;

-- =====================================================
-- VÉRIFICATION FINALE
-- =====================================================
SELECT 
  id,
  name,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN '❌ Pas d''image'
    WHEN image_url LIKE '%/restaurant-images/%' THEN '✅ URL valide'
    ELSE '⚠️  Format inconnu'
  END as status
FROM restaurants
WHERE id = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf'
   OR LOWER(name) LIKE '%daynite%' 
   OR LOWER(name) LIKE '%daynight%'
LIMIT 1;

