-- ============================================
-- VÉRIFICATION COMPLÈTE : Inscription restaurant
-- ============================================
-- 
-- Ce script vérifie que TOUT est correctement configuré pour l'inscription :
-- 1. Politiques RLS pour restaurants
-- 2. Fonction extract_user_id_from_path
-- 3. Politiques Storage pour passports
--
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
-- ============================================

-- ============================================
-- VÉRIFICATION 1 : Fonction Helper
-- ============================================

SELECT 
  '1. Fonction extract_user_id_from_path' AS verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
      AND routine_schema = 'public'
    ) THEN '✅ EXISTE'
    ELSE '❌ MANQUANTE - Exécutez scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql'
  END AS statut;

-- Test de la fonction
SELECT 
  '2. Test fonction extract_user_id_from_path' AS verification,
  extract_user_id_from_path('8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9-1763503578550.PNG') AS "Résultat",
  CASE 
    WHEN extract_user_id_from_path('8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9-1763503578550.PNG') = '8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9' THEN '✅ OK'
    ELSE '❌ PROBLÈME'
  END AS "Statut";

-- ============================================
-- VÉRIFICATION 2 : Politiques RLS Restaurants
-- ============================================

SELECT 
  '3. Politiques RLS restaurants' AS verification,
  COUNT(*) || ' politiques (attendu: 4)' AS statut,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ TOUTES PRÉSENTES'
    ELSE '❌ Il manque ' || (4 - COUNT(*)) || ' politique(s)'
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

-- Liste détaillée des politiques RLS
SELECT 
  '4. Liste politiques RLS' AS verification,
  policyname AS "Politique",
  cmd AS "Opération",
  CASE 
    WHEN policyname = 'Restaurants can insert own profile' THEN '✅ CRUCIAL'
    WHEN policyname = 'Restaurants can view own profile' THEN '✅ CRUCIAL'
    ELSE '✅ OK'
  END AS "Statut"
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
  AND policyname IN (
    'Restaurants can insert own profile',
    'Restaurants can view own profile',
    'Restaurants can update own profile',
    'Public can view active verified restaurants'
  )
ORDER BY 
  CASE 
    WHEN policyname = 'Restaurants can insert own profile' THEN 1
    WHEN policyname = 'Restaurants can view own profile' THEN 2
    WHEN policyname = 'Restaurants can update own profile' THEN 3
    ELSE 4
  END;

-- ============================================
-- VÉRIFICATION 3 : Politiques Storage Passports
-- ============================================

SELECT 
  '5. Politiques Storage passports' AS verification,
  COUNT(*) || ' politiques (attendu: 5)' AS statut,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ TOUTES PRÉSENTES'
    ELSE '❌ Il manque ' || (5 - COUNT(*)) || ' politique(s) - Créez-les via Storage → passports → Policies'
  END AS "Résultat"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%';

-- Liste détaillée des politiques Storage
SELECT 
  '6. Liste politiques Storage' AS verification,
  policyname AS "Politique",
  cmd AS "Opération",
  CASE 
    WHEN policyname = 'Restaurants can upload own passports' THEN '✅ CRUCIAL pour upload'
    WHEN policyname = 'Restaurants can view own passports' THEN '✅ OK'
    ELSE '✅ OK'
  END AS "Statut"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%'
ORDER BY 
  CASE 
    WHEN policyname = 'Restaurants can upload own passports' THEN 1
    WHEN policyname = 'Restaurants can view own passports' THEN 2
    WHEN policyname = 'Restaurants can update own passports' THEN 3
    WHEN policyname = 'Restaurants can delete own passports' THEN 4
    ELSE 5
  END;

-- Vérifier spécifiquement la politique INSERT Storage
SELECT 
  '7. Politique INSERT Storage' AS verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname = 'Restaurants can upload own passports'
      AND cmd = 'INSERT'
    ) THEN '✅ EXISTE'
    ELSE '❌ MANQUANTE - Créez-la via Storage → passports → Policies'
  END AS statut,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname = 'Restaurants can upload own passports'
      AND cmd = 'INSERT'
    ) THEN (
      SELECT with_check FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname = 'Restaurants can upload own passports'
      LIMIT 1
    )
    ELSE 'Créez avec: bucket_id = ''passports'' AND auth.uid() IS NOT NULL AND auth.uid()::text = extract_user_id_from_path(name)'
  END AS "Condition WITH CHECK";

-- ============================================
-- VÉRIFICATION 4 : RLS activé
-- ============================================

SELECT 
  '8. RLS activé sur restaurants' AS verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'restaurants' 
      AND schemaname = 'public'
      AND rowsecurity = true
    ) THEN '✅ OUI'
    ELSE '❌ NON'
  END AS statut;

-- ============================================
-- RÉSUMÉ FINAL
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'RÉSUMÉ FINAL' AS "VÉRIFICATION",
  '' AS "STATUT";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Fonction
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
    ) THEN '✅ Fonction extract_user_id_from_path'
    ELSE '❌ Fonction extract_user_id_from_path'
  END AS "Élément",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
    ) THEN 'OK'
    ELSE 'MANQUANTE'
  END AS "Statut";

-- Politiques RLS
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'restaurants' 
          AND policyname IN (
            'Restaurants can insert own profile',
            'Restaurants can view own profile',
            'Restaurants can update own profile',
            'Public can view active verified restaurants'
          )) >= 4 THEN '✅ Politiques RLS restaurants'
    ELSE '❌ Politiques RLS restaurants'
  END AS "Élément",
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'restaurants' 
          AND policyname IN (
            'Restaurants can insert own profile',
            'Restaurants can view own profile',
            'Restaurants can update own profile',
            'Public can view active verified restaurants'
          )) >= 4 THEN 'OK (4/4)'
    ELSE 'MANQUANTES (' || (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'restaurants' 
          AND policyname IN (
            'Restaurants can insert own profile',
            'Restaurants can view own profile',
            'Restaurants can update own profile',
            'Public can view active verified restaurants'
          )) || '/4)'
  END AS "Statut";

-- Politiques Storage
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname = 'Restaurants can upload own passports'
      AND cmd = 'INSERT'
    ) THEN '✅ Politique INSERT Storage'
    ELSE '❌ Politique INSERT Storage'
  END AS "Élément",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname = 'Restaurants can upload own passports'
      AND cmd = 'INSERT'
    ) THEN 'OK'
    ELSE 'MANQUANTE'
  END AS "Statut";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Message final
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
    )
    AND (SELECT COUNT(*) FROM pg_policies 
         WHERE tablename = 'restaurants' 
         AND policyname IN (
           'Restaurants can insert own profile',
           'Restaurants can view own profile',
           'Restaurants can update own profile',
           'Public can view active verified restaurants'
         )) >= 4
    AND EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname = 'Restaurants can upload own passports'
      AND cmd = 'INSERT'
    )
    THEN '🎉 TOUT EST PARFAIT ! Vous pouvez tester l''inscription.'
    ELSE '⚠️ Il manque certains éléments. Vérifiez les détails ci-dessus et suivez GUIDE_CORRECTION_STORAGE_POLICIES.md'
  END AS "RÉSULTAT FINAL";

-- ============================================
-- ✅ VÉRIFICATION TERMINÉE
-- ============================================

