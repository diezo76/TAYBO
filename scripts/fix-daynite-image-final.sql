-- Script ULTIME de correction pour l'image du restaurant "Daynite"
-- Exécutez ce script dans le SQL Editor de Supabase
-- Ce script va automatiquement diagnostiquer ET corriger le problème

-- =====================================================
-- DIAGNOSTIC ET CORRECTION AUTOMATIQUE
-- =====================================================
DO $$
DECLARE
  restaurant_id_val UUID := 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf';
  restaurant_name_val TEXT;
  image_url_val TEXT;
  file_path_val TEXT;
  file_exists BOOLEAN;
  bucket_public BOOLEAN;
  policy_exists BOOLEAN;
  latest_file TEXT;
  new_url TEXT;
  supabase_url TEXT := 'https://ocxesczzlzopbcobppok.supabase.co';
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE '           DIAGNOSTIC RESTAURANT DAYNITE';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  
  -- Trouver le restaurant
  SELECT name, image_url 
  INTO restaurant_name_val, image_url_val
  FROM restaurants
  WHERE id = restaurant_id_val;
  
  IF restaurant_name_val IS NULL THEN
    RAISE NOTICE '❌ Restaurant non trouvé avec l''ID: %', restaurant_id_val;
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Restaurant trouvé: %', restaurant_name_val;
  RAISE NOTICE '   ID: %', restaurant_id_val;
  RAISE NOTICE '   Image URL actuelle: %', COALESCE(image_url_val, 'NULL');
  RAISE NOTICE '';
  
  -- =====================================================
  -- 1. VÉRIFIER LE BUCKET
  -- =====================================================
  RAISE NOTICE '1. VÉRIFICATION DU BUCKET';
  RAISE NOTICE '   -----------------------';
  
  IF NOT EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'restaurant-images') THEN
    RAISE NOTICE '   ❌ Le bucket "restaurant-images" n''existe pas';
    RAISE NOTICE '   → Créez le bucket dans Storage > New bucket';
    RETURN;
  END IF;
  
  SELECT public INTO bucket_public
  FROM storage.buckets
  WHERE name = 'restaurant-images';
  
  IF bucket_public THEN
    RAISE NOTICE '   ✅ Bucket "restaurant-images" existe et est public';
  ELSE
    RAISE NOTICE '   ❌ Bucket existe mais n''est PAS public';
    RAISE NOTICE '   → Allez dans Storage > restaurant-images > Settings';
    RAISE NOTICE '   → Cochez "Public bucket" et sauvegardez';
  END IF;
  RAISE NOTICE '';
  
  -- =====================================================
  -- 2. VÉRIFIER LES POLICIES
  -- =====================================================
  RAISE NOTICE '2. VÉRIFICATION DES POLICIES RLS';
  RAISE NOTICE '   ----------------------------';
  
  SELECT EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND policyname LIKE '%Restaurant%Images%'
      AND cmd = 'SELECT'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    RAISE NOTICE '   ✅ Policy SELECT pour les images de restaurants existe';
  ELSE
    RAISE NOTICE '   ❌ Policy SELECT manquante';
    RAISE NOTICE '   → Exécutez le script scripts/fix-storage-policies.sql';
  END IF;
  RAISE NOTICE '';
  
  -- =====================================================
  -- 3. LISTER LES FICHIERS DU RESTAURANT
  -- =====================================================
  RAISE NOTICE '3. FICHIERS DISPONIBLES DANS LE STORAGE';
  RAISE NOTICE '   ------------------------------------';
  
  -- Trouver le fichier le plus récent
  SELECT name INTO latest_file
  FROM storage.objects
  WHERE bucket_id = 'restaurant-images'
    AND name LIKE restaurant_id_val::text || '/%'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF latest_file IS NULL THEN
    RAISE NOTICE '   ❌ AUCUN fichier trouvé dans le storage pour ce restaurant';
    RAISE NOTICE '   → Le restaurant doit se connecter et uploader une image';
    RAISE NOTICE '   → URL: http://localhost:5173/restaurant/profile';
    
    -- Mettre image_url à NULL
    UPDATE restaurants
    SET image_url = NULL
    WHERE id = restaurant_id_val;
    
    RAISE NOTICE '';
    RAISE NOTICE '   ✅ image_url mis à NULL (placeholder s''affichera)';
  ELSE
    RAISE NOTICE '   ✅ Fichiers trouvés:';
    
    -- Afficher tous les fichiers
    FOR file_path_val IN 
      SELECT name 
      FROM storage.objects
      WHERE bucket_id = 'restaurant-images'
        AND name LIKE restaurant_id_val::text || '/%'
      ORDER BY created_at DESC
    LOOP
      IF file_path_val = latest_file THEN
        RAISE NOTICE '      📌 % (plus récent)', file_path_val;
      ELSE
        RAISE NOTICE '         %', file_path_val;
      END IF;
    END LOOP;
    
    -- =====================================================
    -- 4. VÉRIFIER SI L'URL ACTUELLE EST CORRECTE
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '4. VÉRIFICATION DE L''URL ACTUELLE';
    RAISE NOTICE '   -------------------------------';
    
    IF image_url_val IS NULL THEN
      RAISE NOTICE '   ⚠️  Aucune URL dans la base de données';
      RAISE NOTICE '   → Mise à jour avec le fichier le plus récent...';
      
      new_url := supabase_url || '/storage/v1/object/public/restaurant-images/' || latest_file;
      
      UPDATE restaurants
      SET image_url = new_url
      WHERE id = restaurant_id_val;
      
      RAISE NOTICE '   ✅ URL mise à jour: %', new_url;
      
    ELSIF image_url_val LIKE '%/restaurant-images/%' THEN
      -- Extraire le chemin du fichier depuis l'URL
      file_path_val := SPLIT_PART(image_url_val, '/restaurant-images/', 2);
      file_path_val := SPLIT_PART(file_path_val, '?', 1);
      
      -- Vérifier si le fichier existe
      SELECT EXISTS(
        SELECT 1 FROM storage.objects
        WHERE bucket_id = 'restaurant-images'
          AND name = file_path_val
      ) INTO file_exists;
      
      IF file_exists THEN
        RAISE NOTICE '   ✅ Le fichier "%"', file_path_val;
        RAISE NOTICE '      existe dans le storage - Tout est OK!';
      ELSE
        RAISE NOTICE '   ❌ Le fichier "%"', file_path_val;
        RAISE NOTICE '      N''EXISTE PAS dans le storage';
        RAISE NOTICE '   → Mise à jour avec le fichier le plus récent...';
        
        new_url := supabase_url || '/storage/v1/object/public/restaurant-images/' || latest_file;
        
        UPDATE restaurants
        SET image_url = new_url
        WHERE id = restaurant_id_val;
        
        RAISE NOTICE '   ✅ URL mise à jour: %', new_url;
      END IF;
    ELSE
      RAISE NOTICE '   ⚠️  Format d''URL inconnu: %', image_url_val;
      RAISE NOTICE '   → Mise à jour avec le fichier le plus récent...';
      
      new_url := supabase_url || '/storage/v1/object/public/restaurant-images/' || latest_file;
      
      UPDATE restaurants
      SET image_url = new_url
      WHERE id = restaurant_id_val;
      
      RAISE NOTICE '   ✅ URL mise à jour: %', new_url;
    END IF;
  END IF;
  
  -- =====================================================
  -- 5. RÉSUMÉ FINAL
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '                RÉSUMÉ FINAL';
  RAISE NOTICE '====================================================';
  
  -- Récupérer l'état final
  SELECT image_url INTO image_url_val
  FROM restaurants
  WHERE id = restaurant_id_val;
  
  RAISE NOTICE '';
  RAISE NOTICE 'URL finale: %', COALESCE(image_url_val, 'NULL (placeholder s''affichera)');
  RAISE NOTICE '';
  
  IF bucket_public AND policy_exists THEN
    IF image_url_val IS NOT NULL THEN
      RAISE NOTICE '✅ TOUT EST OK - L''image devrait se charger!';
      RAISE NOTICE '';
      RAISE NOTICE 'Si l''image ne s''affiche toujours pas:';
      RAISE NOTICE '1. Videz le cache du navigateur (Ctrl+Shift+R)';
      RAISE NOTICE '2. Redémarrez le serveur de développement';
      RAISE NOTICE '3. Vérifiez la console du navigateur';
    ELSE
      RAISE NOTICE '⚠️  Configuration OK mais aucune image disponible';
      RAISE NOTICE '';
      RAISE NOTICE 'Le restaurant doit uploader une image:';
      RAISE NOTICE '1. Allez sur: http://localhost:5173/restaurant/login';
      RAISE NOTICE '2. Connectez-vous avec le compte du restaurant';
      RAISE NOTICE '3. Allez dans Profile';
      RAISE NOTICE '4. Uploadez une nouvelle image';
    END IF;
  ELSE
    RAISE NOTICE '❌ CONFIGURATION INCOMPLÈTE';
    RAISE NOTICE '';
    IF NOT bucket_public THEN
      RAISE NOTICE 'À FAIRE: Rendre le bucket public';
      RAISE NOTICE '→ Storage > restaurant-images > Settings > "Public bucket"';
    END IF;
    IF NOT policy_exists THEN
      RAISE NOTICE 'À FAIRE: Créer la policy SELECT';
      RAISE NOTICE '→ Exécutez: scripts/fix-storage-policies.sql';
    END IF;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '====================================================';
  
END $$;

-- =====================================================
-- VÉRIFICATION FINALE - AFFICHER L'ÉTAT ACTUEL
-- =====================================================
SELECT 
  '🔍 ÉTAT FINAL' as label,
  id,
  name,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN '⚠️  Pas d''image (placeholder)'
    WHEN image_url LIKE '%/restaurant-images/%' THEN '✅ URL valide'
    ELSE '❌ Format inconnu'
  END as status
FROM restaurants
WHERE id = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf';

