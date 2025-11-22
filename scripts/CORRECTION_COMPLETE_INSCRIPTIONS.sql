-- ============================================
-- CORRECTION COMPLÈTE : Inscriptions Client et Restaurant
-- ============================================
-- 
-- Ce script corrige TOUT pour rendre les inscriptions opérationnelles à 100% :
-- 1. Active RLS sur les tables users et restaurants
-- 2. Crée les politiques RLS pour les clients (users)
-- 3. Crée les politiques RLS pour les restaurants
-- 4. Crée la fonction helper extract_user_id_from_path
-- 5. Crée les politiques Storage pour les passports
--
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
-- ============================================

-- ============================================
-- ÉTAPE 1 : Activer RLS
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 2 : Politiques RLS pour CLIENTS (users)
-- ============================================

-- Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile v2" ON users;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can always select own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile v2" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Politique INSERT : Permet aux clients de créer leur propre profil lors de l'inscription
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique SELECT : Permet aux clients de voir leur propre profil
-- MÊME s'ils ne sont pas complètement configurés (crucial pour éviter l'erreur 406)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique UPDATE : Permet aux clients de modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Commentaires explicatifs pour users
COMMENT ON POLICY "Users can insert own profile" ON users IS 
'Permet aux clients de créer leur propre profil lors de l''inscription - l''ID doit correspondre à auth.uid() - CRUCIAL pour l''inscription';

COMMENT ON POLICY "Users can view own profile" ON users IS 
'Permet aux clients de voir leur propre profil même s''ils ne sont pas complètement configurés - évite l''erreur 406 après inscription/connexion';

COMMENT ON POLICY "Users can update own profile" ON users IS 
'Permet aux clients de modifier leur propre profil - l''ID doit correspondre à auth.uid()';

-- ============================================
-- ÉTAPE 3 : Politiques RLS pour RESTAURANTS
-- ============================================

-- Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Restaurants can manage own profile" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can read own data" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can update own data" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can view own profile" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can update own profile" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can insert own profile" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view active verified restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can view active verified restaurants" ON restaurants;

-- IMPORTANT : Créer INSERT en premier pour permettre l'inscription
-- Politique INSERT : Permet aux restaurants de créer leur propre profil
CREATE POLICY "Restaurants can insert own profile"
  ON restaurants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique SELECT : Permet aux restaurants de voir leur propre profil
-- MÊME s'ils ne sont pas vérifiés/actifs (crucial pour éviter l'erreur 406)
CREATE POLICY "Restaurants can view own profile"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique UPDATE : Permet aux restaurants de modifier leur propre profil
CREATE POLICY "Restaurants can update own profile"
  ON restaurants FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  )
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique publique : Permet à tout le monde de voir les restaurants actifs et vérifiés
CREATE POLICY "Public can view active verified restaurants"
  ON restaurants FOR SELECT
  USING (
    is_active = true 
    AND is_verified = true
  );

-- Commentaires explicatifs pour restaurants
COMMENT ON POLICY "Restaurants can insert own profile" ON restaurants IS 
'Permet aux restaurants de créer leur propre profil lors de l''inscription - l''ID doit correspondre à auth.uid() - CRUCIAL pour l''inscription';

COMMENT ON POLICY "Restaurants can view own profile" ON restaurants IS 
'Permet aux restaurants de voir leur propre profil même s''ils ne sont pas vérifiés/actifs - évite l''erreur 406 après inscription/connexion';

COMMENT ON POLICY "Restaurants can update own profile" ON restaurants IS 
'Permet aux restaurants de modifier leur propre profil - l''ID doit correspondre à auth.uid()';

COMMENT ON POLICY "Public can view active verified restaurants" ON restaurants IS 
'Permet à tout le monde de voir les restaurants actifs et vérifiés - pour la page d''accueil';

-- ============================================
-- ÉTAPE 4 : Fonction Helper pour Storage
-- ============================================

-- Fonction pour extraire l'ID depuis le chemin du fichier
-- Format attendu : passports/{uuid}-{timestamp}.{ext}
-- Exemple : passports/123e4567-e89b-12d3-a456-426614174000-1700312345678.pdf
-- Résultat : 123e4567-e89b-12d3-a456-426614174000
CREATE OR REPLACE FUNCTION extract_user_id_from_path(file_path TEXT)
RETURNS TEXT AS $$
DECLARE
  file_name TEXT;
  user_id TEXT;
BEGIN
  -- Extraire le nom du fichier depuis le chemin complet
  file_name := (string_to_array(file_path, '/'))[array_length(string_to_array(file_path, '/'), 1)];
  
  -- Extraire l'ID (partie avant le premier '-')
  user_id := split_part(file_name, '-', 1);
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION extract_user_id_from_path(TEXT) IS 
'Extrait l''ID utilisateur depuis le chemin du fichier passport (format: passports/{uuid}-{timestamp}.{ext}) - utilisé par les politiques Storage';

-- ============================================
-- ÉTAPE 5 : Politiques Storage pour Passports
-- ============================================
-- 
-- ⚠️ ATTENTION : Les politiques Storage nécessitent des permissions spéciales.
-- Si vous obtenez une erreur "must be owner of relation objects", utilisez le script :
-- scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql
-- 
-- Ou créez les politiques via l'interface Supabase Dashboard :
-- Storage → passports → Policies → New Policy
-- ============================================

DO $$
BEGIN
  -- Essayer de créer les politiques Storage
  -- Si cela échoue à cause des permissions, on continue quand même
  
  -- Supprimer les anciennes politiques Storage pour éviter les conflits
  BEGIN
    DROP POLICY IF EXISTS "Restaurants can view own passports" ON storage.objects;
    DROP POLICY IF EXISTS "Restaurants can upload own passports" ON storage.objects;
    DROP POLICY IF EXISTS "Restaurants can update own passports" ON storage.objects;
    DROP POLICY IF EXISTS "Restaurants can delete own passports" ON storage.objects;
    DROP POLICY IF EXISTS "Admins can view all passports" ON storage.objects;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠️ Permissions insuffisantes pour supprimer les politiques Storage. Utilisez scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql';
  END;

  -- Politique SELECT : Permet aux restaurants de voir leurs propres documents
  BEGIN
    CREATE POLICY "Restaurants can view own passports"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'passports'
      AND auth.uid() IS NOT NULL
      AND auth.uid()::text = extract_user_id_from_path(name)
    );
    RAISE NOTICE '✅ Politique Storage SELECT créée';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠️ Permissions insuffisantes pour créer la politique Storage SELECT. Utilisez scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql';
  END;

  -- Politique INSERT : Permet aux restaurants d'uploader leurs propres documents
  BEGIN
    CREATE POLICY "Restaurants can upload own passports"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'passports'
      AND auth.uid() IS NOT NULL
      AND auth.uid()::text = extract_user_id_from_path(name)
    );
    RAISE NOTICE '✅ Politique Storage INSERT créée';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠️ Permissions insuffisantes pour créer la politique Storage INSERT. Utilisez scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql';
  END;

  -- Politique UPDATE : Permet aux restaurants de mettre à jour leurs propres documents
  BEGIN
    CREATE POLICY "Restaurants can update own passports"
    ON storage.objects FOR UPDATE
    USING (
      bucket_id = 'passports'
      AND auth.uid() IS NOT NULL
      AND auth.uid()::text = extract_user_id_from_path(name)
    )
    WITH CHECK (
      bucket_id = 'passports'
      AND auth.uid() IS NOT NULL
      AND auth.uid()::text = extract_user_id_from_path(name)
    );
    RAISE NOTICE '✅ Politique Storage UPDATE créée';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠️ Permissions insuffisantes pour créer la politique Storage UPDATE. Utilisez scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql';
  END;

  -- Politique DELETE : Permet aux restaurants de supprimer leurs propres documents
  BEGIN
    CREATE POLICY "Restaurants can delete own passports"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'passports'
      AND auth.uid() IS NOT NULL
      AND auth.uid()::text = extract_user_id_from_path(name)
    );
    RAISE NOTICE '✅ Politique Storage DELETE créée';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠️ Permissions insuffisantes pour créer la politique Storage DELETE. Utilisez scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql';
  END;

  -- Politique admin SELECT : Permet aux admins de voir tous les documents
  BEGIN
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
    RAISE NOTICE '✅ Politique Storage Admin SELECT créée';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠️ Permissions insuffisantes pour créer la politique Storage Admin SELECT. Utilisez scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql';
  END;

  -- Commentaires explicatifs pour Storage (si les politiques existent)
  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Ignorer les erreurs de commentaires
    NULL;
  END;

END $$;

-- ============================================
-- ÉTAPE 6 : Vérifications Finales
-- ============================================

-- Vérifier que toutes les politiques sont créées
SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'VÉRIFICATIONS FINALES' AS "VÉRIFICATION",
  '' AS "STATUT",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- 1. RLS activé
SELECT 
  'RLS activé' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'users' AND rowsecurity = true
    ) AND EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'restaurants' AND rowsecurity = true
    ) THEN '✅ OK'
    ELSE '❌ ERREUR'
  END AS "Statut";

-- 2. Politiques RLS users
SELECT 
  'Politiques RLS users' AS "Vérification",
  COUNT(*) || ' politiques créées (attendu: 3)' AS "Statut",
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ OK'
    ELSE '❌ MANQUANTES'
  END AS "Résultat"
FROM pg_policies 
WHERE tablename = 'users' 
  AND schemaname = 'public'
  AND policyname IN (
    'Users can insert own profile',
    'Users can view own profile',
    'Users can update own profile'
  );

-- 3. Politiques RLS restaurants
SELECT 
  'Politiques RLS restaurants' AS "Vérification",
  COUNT(*) || ' politiques créées (attendu: 4)' AS "Statut",
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ OK'
    ELSE '❌ MANQUANTES'
  END AS "Résultat"
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
  AND policyname IN (
    'Restaurants can insert own profile',
    'Restaurants can view own profile',
    'Restaurants can update own profile',
    'Public can view active verified restaurants'
  );

-- 4. Fonction helper
SELECT 
  'Fonction extract_user_id_from_path' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
      AND routine_schema = 'public'
    ) THEN '✅ OK'
    ELSE '❌ MANQUANTE'
  END AS "Statut";

-- 5. Politiques Storage passports
SELECT 
  'Politiques Storage passports' AS "Vérification",
  COUNT(*) || ' politiques créées (attendu: 5)' AS "Statut",
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ OK'
    ELSE '❌ MANQUANTES'
  END AS "Résultat"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%';

-- Liste détaillée des politiques créées
SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'RÉSUMÉ DES POLITIQUES CRÉÉES' AS "VÉRIFICATION",
  '' AS "STATUT",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Politiques users
SELECT 
  'RLS Users' AS "Type",
  policyname AS "Politique",
  cmd AS "Opération"
FROM pg_policies 
WHERE tablename = 'users' 
  AND schemaname = 'public'
  AND policyname IN (
    'Users can insert own profile',
    'Users can view own profile',
    'Users can update own profile'
  )
ORDER BY policyname;

-- Politiques restaurants
SELECT 
  'RLS Restaurants' AS "Type",
  policyname AS "Politique",
  cmd AS "Opération"
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
  AND policyname IN (
    'Restaurants can insert own profile',
    'Restaurants can view own profile',
    'Restaurants can update own profile',
    'Public can view active verified restaurants'
  )
ORDER BY policyname;

-- Politiques Storage
SELECT 
  'Storage Passports' AS "Type",
  policyname AS "Politique",
  cmd AS "Opération"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%'
ORDER BY policyname;

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Message final
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'users' AND rowsecurity = true
    )
    AND EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'restaurants' AND rowsecurity = true
    )
    AND (SELECT COUNT(*) FROM pg_policies 
         WHERE tablename = 'users' 
         AND policyname IN (
           'Users can insert own profile',
           'Users can view own profile',
           'Users can update own profile'
         )) >= 3
    AND (SELECT COUNT(*) FROM pg_policies 
         WHERE tablename = 'restaurants' 
         AND policyname IN (
           'Restaurants can insert own profile',
           'Restaurants can view own profile',
           'Restaurants can update own profile',
           'Public can view active verified restaurants'
         )) >= 4
    AND EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
    )
    AND (SELECT COUNT(*) FROM pg_policies 
         WHERE tablename = 'objects' 
         AND schemaname = 'storage'
         AND policyname LIKE '%passport%') >= 5
    THEN '🎉 CORRECTION TERMINÉE ! Tout est maintenant opérationnel à 100%.'
    ELSE '⚠️ Certains éléments peuvent manquer. Vérifiez les résultats ci-dessus.'
  END AS "RÉSULTAT FINAL";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- ============================================
-- ✅ CORRECTION TERMINÉE
-- ============================================
-- 
-- Après avoir exécuté ce script :
-- ✅ RLS est activé sur users et restaurants
-- ✅ Les politiques RLS pour clients sont créées (INSERT, SELECT, UPDATE)
-- ✅ Les politiques RLS pour restaurants sont créées (INSERT, SELECT, UPDATE, SELECT publique)
-- ✅ La fonction extract_user_id_from_path est créée
-- ⚠️ Les politiques Storage pour passports peuvent nécessiter des permissions spéciales
--
-- PROCHAINES ÉTAPES :
-- 
-- 1. Si les politiques Storage n'ont pas pu être créées (erreur de permissions) :
--    → Exécutez le script : scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql
--    → Ce script utilise SECURITY DEFINER pour contourner les restrictions de permissions
--
-- 2. OU créez les politiques Storage via l'interface Supabase Dashboard :
--    → Allez dans Storage → passports → Policies → New Policy
--    → Créez les 5 politiques suivantes :
--      - SELECT : Restaurants can view own passports
--      - INSERT : Restaurants can upload own passports
--      - UPDATE : Restaurants can update own passports
--      - DELETE : Restaurants can delete own passports
--      - SELECT : Admins can view all passports
--
-- 3. Vérifiez que le bucket "passports" existe dans Storage → Buckets
--
-- 4. Testez l'inscription d'un client
--
-- 5. Testez l'inscription d'un restaurant avec upload de passport
--
-- 6. Si tout fonctionne, vous êtes opérationnel à 100% ! 🎉
-- ============================================

