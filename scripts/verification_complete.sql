-- Script de Vérification Complète - Buckets Storage et Policies
-- À exécuter dans Supabase Dashboard > SQL Editor

-- ============================================
-- 1. VÉRIFICATION DES BUCKETS STORAGE
-- ============================================

SELECT 
    id as bucket_id,
    name as bucket_name,
    public as is_public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE id IN ('restaurant-images', 'menu-images', 'user-images', 'passports')
ORDER BY id;

-- Résultat attendu : 4 buckets avec les configurations suivantes :
-- - restaurant-images : public = true
-- - menu-images : public = true
-- - user-images : public = true
-- - passports : public = false

-- ============================================
-- 2. COMPTAGE DES BUCKETS
-- ============================================

SELECT 
    COUNT(*) as total_buckets,
    COUNT(CASE WHEN public = true THEN 1 END) as public_buckets,
    COUNT(CASE WHEN public = false THEN 1 END) as private_buckets
FROM storage.buckets
WHERE id IN ('restaurant-images', 'menu-images', 'user-images', 'passports');

-- Résultat attendu : total_buckets = 4, public_buckets = 3, private_buckets = 1

-- ============================================
-- 3. VÉRIFICATION DES POLICIES STORAGE
-- ============================================

SELECT 
    policyname,
    CASE cmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE cmd::text
    END as operation,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

-- Résultat attendu : 15 policies au minimum

-- ============================================
-- 4. COMPTAGE DES POLICIES PAR BUCKET
-- ============================================

SELECT 
    CASE 
        WHEN qual::text LIKE '%restaurant-images%' OR with_check::text LIKE '%restaurant-images%' THEN 'restaurant-images'
        WHEN qual::text LIKE '%menu-images%' OR with_check::text LIKE '%menu-images%' THEN 'menu-images'
        WHEN qual::text LIKE '%user-images%' OR with_check::text LIKE '%user-images%' THEN 'user-images'
        WHEN qual::text LIKE '%passports%' OR with_check::text LIKE '%passports%' THEN 'passports'
        ELSE 'autre'
    END as bucket,
    COUNT(*) as nombre_policies
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
GROUP BY bucket
ORDER BY bucket;

-- Résultat attendu :
-- restaurant-images : 4 policies
-- menu-images : 4 policies
-- user-images : 4 policies
-- passports : 3 policies

-- ============================================
-- 5. VÉRIFICATION DES POLICIES PAR OPÉRATION
-- ============================================

SELECT 
    CASE cmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        ELSE cmd::text
    END as operation,
    COUNT(*) as nombre_policies
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
GROUP BY cmd
ORDER BY cmd;

-- Résultat attendu :
-- SELECT : ~7 policies (lecture publique + lecture propriétaire)
-- INSERT : 4 policies (upload)
-- UPDATE : 3 policies (mise à jour)
-- DELETE : 3 policies (suppression)

-- ============================================
-- 6. RÉSUMÉ COMPLET
-- ============================================

DO $$
DECLARE
    bucket_count INTEGER;
    policy_count INTEGER;
    public_bucket_count INTEGER;
    private_bucket_count INTEGER;
BEGIN
    -- Compter les buckets
    SELECT COUNT(*) INTO bucket_count
    FROM storage.buckets
    WHERE id IN ('restaurant-images', 'menu-images', 'user-images', 'passports');
    
    SELECT COUNT(*) INTO public_bucket_count
    FROM storage.buckets
    WHERE id IN ('restaurant-images', 'menu-images', 'user-images', 'passports')
    AND public = true;
    
    SELECT COUNT(*) INTO private_bucket_count
    FROM storage.buckets
    WHERE id IN ('restaurant-images', 'menu-images', 'user-images', 'passports')
    AND public = false;
    
    -- Compter les policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects';
    
    -- Afficher le résumé
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RÉSUMÉ DE LA VÉRIFICATION STORAGE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Buckets trouvés : % / 4', bucket_count;
    RAISE NOTICE 'Buckets publics : % / 3', public_bucket_count;
    RAISE NOTICE 'Buckets privés : % / 1', private_bucket_count;
    RAISE NOTICE 'Policies trouvées : %', policy_count;
    RAISE NOTICE '========================================';
    
    -- Vérifications
    IF bucket_count = 4 THEN
        RAISE NOTICE '✅ Tous les buckets sont créés';
    ELSE
        RAISE WARNING '⚠️  Buckets manquants : % / 4', bucket_count;
    END IF;
    
    IF public_bucket_count = 3 THEN
        RAISE NOTICE '✅ Tous les buckets publics sont configurés';
    ELSE
        RAISE WARNING '⚠️  Buckets publics manquants : % / 3', public_bucket_count;
    END IF;
    
    IF private_bucket_count = 1 THEN
        RAISE NOTICE '✅ Le bucket privé est configuré';
    ELSE
        RAISE WARNING '⚠️  Bucket privé manquant : % / 1', private_bucket_count;
    END IF;
    
    IF policy_count >= 15 THEN
        RAISE NOTICE '✅ Les policies Storage sont configurées (% policies)', policy_count;
    ELSE
        RAISE WARNING '⚠️  Policies manquantes : % / 15 minimum', policy_count;
    END IF;
    
    RAISE NOTICE '========================================';
END $$;

