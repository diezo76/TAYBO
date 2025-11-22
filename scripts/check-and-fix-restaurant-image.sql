-- Script de vérification et correction automatique de l'image d'un restaurant
-- Ce script vérifie les fichiers dans le bucket Storage et met à jour l'URL dans la DB
-- 
-- UTILISATION :
-- 1. Remplacez 'Daynite' par le nom du restaurant (ou utilisez l'ID directement)
-- 2. Exécutez dans le SQL Editor de Supabase
-- 3. Le script affichera un diagnostic complet et corrigera automatiquement

-- =====================================================
-- CONFIGURATION - MODIFIEZ ICI
-- =====================================================
DO $$
DECLARE
  -- Option 1 : Rechercher par nom (modifiez le nom ici)
  restaurant_name_search TEXT := 'Daynite';
  
  -- Option 2 : Utiliser directement l'ID (décommentez et modifiez si vous connaissez l'ID)
  -- restaurant_id_val UUID := 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf';
  
  -- Variables internes (ne pas modifier)
  restaurant_id_val UUID;
  restaurant_name_val TEXT;
  image_url_val TEXT;
  file_path_val TEXT;
  file_exists BOOLEAN;
  bucket_public BOOLEAN;
  policy_exists BOOLEAN;
  latest_file TEXT;
  new_url TEXT;
  supabase_url TEXT := 'https://ocxesczzlzopbcobppok.supabase.co';
  file_count INTEGER;
BEGIN
  RAISE NOTICE '====================================================';
  RAISE NOTICE '   VÉRIFICATION ET CORRECTION IMAGE RESTAURANT';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '';
  
  -- =====================================================
  -- ÉTAPE 1 : TROUVER LE RESTAURANT
  -- =====================================================
  RAISE NOTICE '1. RECHERCHE DU RESTAURANT';
  RAISE NOTICE '   -----------------------';
  
  -- Si restaurant_id_val n'est pas défini, chercher par nom
  IF restaurant_id_val IS NULL THEN
    SELECT id, name 
    INTO restaurant_id_val, restaurant_name_val
    FROM restaurants
    WHERE LOWER(name) LIKE '%' || LOWER(restaurant_name_search) || '%'
    LIMIT 1;
  ELSE
    SELECT name INTO restaurant_name_val
    FROM restaurants
    WHERE id = restaurant_id_val;
  END IF;
  
  IF restaurant_id_val IS NULL OR restaurant_name_val IS NULL THEN
    RAISE NOTICE '   ❌ Restaurant "%" non trouvé', restaurant_name_search;
    RAISE NOTICE '';
    RAISE NOTICE '   Vérifiez que le nom est correct ou utilisez l''ID directement';
    RETURN;
  END IF;
  
  RAISE NOTICE '   ✅ Restaurant trouvé: %', restaurant_name_val;
  RAISE NOTICE '   ID: %', restaurant_id_val;
  
  -- Récupérer l'URL actuelle
  SELECT image_url INTO image_url_val
  FROM restaurants
  WHERE id = restaurant_id_val;
  
  RAISE NOTICE '   Image URL actuelle: %', COALESCE(image_url_val, 'NULL');
  RAISE NOTICE '';
  
  -- =====================================================
  -- ÉTAPE 2 : VÉRIFIER LE BUCKET
  -- =====================================================
  RAISE NOTICE '2. VÉRIFICATION DU BUCKET STORAGE';
  RAISE NOTICE '   ------------------------------';
  
  IF NOT EXISTS(SELECT 1 FROM storage.buckets WHERE name = 'restaurant-images') THEN
    RAISE NOTICE '   ❌ Le bucket "restaurant-images" n''existe pas';
    RAISE NOTICE '';
    RAISE NOTICE '   → Créez le bucket dans Supabase Dashboard > Storage > New bucket';
    RAISE NOTICE '   → Nom: restaurant-images';
    RAISE NOTICE '   → Public: ✅ Oui';
    RETURN;
  END IF;
  
  SELECT public INTO bucket_public
  FROM storage.buckets
  WHERE name = 'restaurant-images';
  
  IF bucket_public THEN
    RAISE NOTICE '   ✅ Bucket "restaurant-images" existe et est public';
  ELSE
    RAISE NOTICE '   ❌ Bucket existe mais n''est PAS public';
    RAISE NOTICE '';
    RAISE NOTICE '   → Allez dans Storage > restaurant-images > Settings';
    RAISE NOTICE '   → Cochez "Public bucket" et sauvegardez';
    RAISE NOTICE '';
    RAISE NOTICE '   ⚠️  Le script continue mais l''image ne sera pas accessible';
  END IF;
  RAISE NOTICE '';
  
  -- =====================================================
  -- ÉTAPE 3 : VÉRIFIER LES POLICIES RLS
  -- =====================================================
  RAISE NOTICE '3. VÉRIFICATION DES POLICIES RLS';
  RAISE NOTICE '   ----------------------------';
  
  SELECT EXISTS(
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects'
      AND (policyname LIKE '%Restaurant%Images%' OR policyname LIKE '%restaurant%images%')
      AND cmd = 'SELECT'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    RAISE NOTICE '   ✅ Policy SELECT pour les images de restaurants existe';
  ELSE
    RAISE NOTICE '   ❌ Policy SELECT manquante';
    RAISE NOTICE '';
    RAISE NOTICE '   → Exécutez le script: scripts/fix-storage-policies.sql';
    RAISE NOTICE '';
    RAISE NOTICE '   ⚠️  Le script continue mais l''image ne sera pas accessible';
  END IF;
  RAISE NOTICE '';
  
  -- =====================================================
  -- ÉTAPE 4 : LISTER LES FICHIERS DANS LE STORAGE
  -- =====================================================
  RAISE NOTICE '4. FICHIERS DANS LE BUCKET STORAGE';
  RAISE NOTICE '   -------------------------------';
  
  -- Compter les fichiers
  SELECT COUNT(*) INTO file_count
  FROM storage.objects
  WHERE bucket_id = 'restaurant-images'
    AND name LIKE restaurant_id_val::text || '/%';
  
  IF file_count = 0 THEN
    RAISE NOTICE '   ❌ AUCUN fichier trouvé dans le storage pour ce restaurant';
    RAISE NOTICE '';
    RAISE NOTICE '   → Le restaurant doit uploader une image via l''interface';
    RAISE NOTICE '   → URL: http://localhost:5173/restaurant/profile';
    RAISE NOTICE '';
    RAISE NOTICE '   → OU uploader manuellement dans Supabase Dashboard:';
    RAISE NOTICE '      Storage > restaurant-images > Upload file';
    RAISE NOTICE '      Chemin: %/', restaurant_id_val;
    RAISE NOTICE '';
    
    -- Mettre image_url à NULL pour afficher le placeholder
    UPDATE restaurants
    SET image_url = NULL
    WHERE id = restaurant_id_val;
    
    RAISE NOTICE '   ✅ image_url mis à NULL (placeholder s''affichera)';
  ELSE
    RAISE NOTICE '   ✅ % fichier(s) trouvé(s):', file_count;
    
    -- Trouver le fichier le plus récent
    SELECT name INTO latest_file
    FROM storage.objects
    WHERE bucket_id = 'restaurant-images'
      AND name LIKE restaurant_id_val::text || '/%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Afficher tous les fichiers
    FOR file_path_val IN 
      SELECT name 
      FROM storage.objects
      WHERE bucket_id = 'restaurant-images'
        AND name LIKE restaurant_id_val::text || '/%'
      ORDER BY created_at DESC
      LIMIT 10
    LOOP
      IF file_path_val = latest_file THEN
        RAISE NOTICE '      📌 % (plus récent)', file_path_val;
      ELSE
        RAISE NOTICE '         %', file_path_val;
      END IF;
    END LOOP;
    
    -- =====================================================
    -- ÉTAPE 5 : VÉRIFIER ET CORRIGER L'URL
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '5. VÉRIFICATION DE L''URL DANS LA BASE DE DONNÉES';
    RAISE NOTICE '   ---------------------------------------------';
    
    -- Construire la nouvelle URL avec le fichier le plus récent
    new_url := supabase_url || '/storage/v1/object/public/restaurant-images/' || latest_file;
    
    IF image_url_val IS NULL THEN
      RAISE NOTICE '   ⚠️  Aucune URL dans la base de données';
      RAISE NOTICE '   → Mise à jour avec le fichier le plus récent...';
      
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
        RAISE NOTICE '   ✅ Le fichier "%" existe dans le storage', file_path_val;
        RAISE NOTICE '      L''URL dans la DB est correcte - Tout est OK!';
      ELSE
        RAISE NOTICE '   ❌ Le fichier "%" N''EXISTE PAS dans le storage', file_path_val;
        RAISE NOTICE '   → Mise à jour avec le fichier le plus récent...';
        
        UPDATE restaurants
        SET image_url = new_url
        WHERE id = restaurant_id_val;
        
        RAISE NOTICE '   ✅ URL mise à jour: %', new_url;
      END IF;
    ELSE
      RAISE NOTICE '   ⚠️  Format d''URL inconnu: %', image_url_val;
      RAISE NOTICE '   → Mise à jour avec le fichier le plus récent...';
      
      UPDATE restaurants
      SET image_url = new_url
      WHERE id = restaurant_id_val;
      
      RAISE NOTICE '   ✅ URL mise à jour: %', new_url;
    END IF;
  END IF;
  
  -- =====================================================
  -- ÉTAPE 6 : RÉSUMÉ FINAL
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
  RAISE NOTICE 'Restaurant: %', restaurant_name_val;
  RAISE NOTICE 'ID: %', restaurant_id_val;
  RAISE NOTICE 'URL finale: %', COALESCE(image_url_val, 'NULL (placeholder s''affichera)');
  RAISE NOTICE '';
  
  IF bucket_public AND policy_exists THEN
    IF image_url_val IS NOT NULL THEN
      RAISE NOTICE '✅ TOUT EST OK - L''image devrait se charger!';
      RAISE NOTICE '';
      RAISE NOTICE 'Pour tester:';
      RAISE NOTICE '1. Videz le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)';
      RAISE NOTICE '2. Redémarrez le serveur de développement';
      RAISE NOTICE '3. Ouvrez: http://localhost:5173';
      RAISE NOTICE '4. Vérifiez que l''image de "%" s''affiche', restaurant_name_val;
    ELSE
      RAISE NOTICE '⚠️  Configuration OK mais aucune image disponible';
      RAISE NOTICE '';
      RAISE NOTICE 'Le restaurant doit uploader une image:';
      RAISE NOTICE '1. Allez sur: http://localhost:5173/restaurant/login';
      RAISE NOTICE '2. Connectez-vous avec le compte du restaurant';
      RAISE NOTICE '3. Allez dans Profile';
      RAISE NOTICE '4. Uploadez une nouvelle image';
      RAISE NOTICE '';
      RAISE NOTICE 'OU uploader manuellement dans Supabase:';
      RAISE NOTICE '1. Allez dans Storage > restaurant-images';
      RAISE NOTICE '2. Cliquez sur "Upload file"';
      RAISE NOTICE '3. Créez un dossier avec le nom: %', restaurant_id_val;
      RAISE NOTICE '4. Uploadez l''image dans ce dossier';
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
-- AFFICHAGE DE L'ÉTAT FINAL
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
WHERE LOWER(name) LIKE '%Daynite%' OR LOWER(name) LIKE '%daynight%'
ORDER BY name;

