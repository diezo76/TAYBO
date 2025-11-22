-- ============================================
-- DIAGNOSTIC : Politiques Storage pour passports
-- ============================================
-- 
-- Ce script diagnostique pourquoi l'upload de passport échoue
-- avec l'erreur "new row violates row-level security policy"
--
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
-- ============================================

-- ============================================
-- VÉRIFICATION 1 : Fonction extract_user_id_from_path
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

-- Tester la fonction avec un exemple
SELECT 
  '2. Test fonction extract_user_id_from_path' AS verification,
  extract_user_id_from_path('8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9-1763503578550.PNG') AS "Résultat",
  CASE 
    WHEN extract_user_id_from_path('8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9-1763503578550.PNG') = '8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9' THEN '✅ OK'
    ELSE '❌ PROBLÈME - La fonction ne fonctionne pas correctement'
  END AS "Statut";

-- ============================================
-- VÉRIFICATION 2 : Politiques Storage existantes
-- ============================================

SELECT 
  '3. Politiques Storage passports' AS verification,
  COUNT(*) || ' politiques trouvées' AS statut
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%';

-- Liste détaillée des politiques Storage
SELECT 
  '4. Liste des politiques Storage' AS verification,
  policyname AS "Politique",
  cmd AS "Opération",
  qual AS "Condition USING",
  with_check AS "Condition WITH CHECK"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%'
ORDER BY policyname;

-- ============================================
-- VÉRIFICATION 3 : Politique INSERT spécifique
-- ============================================

SELECT 
  '5. Politique INSERT pour passports' AS verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname = 'Restaurants can upload own passports'
      AND cmd = 'INSERT'
    ) THEN '✅ EXISTE'
    ELSE '❌ MANQUANTE - Créez cette politique via Storage → passports → Policies'
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
    ELSE 'Créez cette politique avec: bucket_id = ''passports'' AND auth.uid() IS NOT NULL AND auth.uid()::text = extract_user_id_from_path(name)'
  END AS "Condition WITH CHECK";

-- ============================================
-- VÉRIFICATION 4 : Test de la condition
-- ============================================

-- Note: Cette partie nécessite d'être connecté en tant que restaurant
-- Pour tester, connectez-vous d'abord en tant que restaurant dans l'application

SELECT 
  '6. Test condition INSERT (si connecté)' AS verification,
  CASE 
    WHEN auth.uid() IS NULL THEN '⚠️ Pas d''utilisateur connecté - Connectez-vous d''abord'
    ELSE 
      CASE 
        WHEN 'passports' = 'passports' 
          AND auth.uid() IS NOT NULL 
          AND auth.uid()::text = extract_user_id_from_path('8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9-1763503578550.PNG')
        THEN '✅ La condition devrait fonctionner'
        ELSE '❌ La condition ne fonctionne pas - Vérifiez auth.uid() et extract_user_id_from_path'
      END
  END AS statut,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'auth.uid() = ' || auth.uid()::text
    ELSE 'auth.uid() = NULL'
  END AS "auth.uid() actuel";

-- ============================================
-- VÉRIFICATION 5 : Format du nom de fichier
-- ============================================

SELECT 
  '7. Format du nom de fichier' AS verification,
  'Format attendu: {uuid}-{timestamp}.{ext}' AS "Format",
  'Exemple: 8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9-1763503578550.PNG' AS "Exemple",
  CASE 
    WHEN extract_user_id_from_path('8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9-1763503578550.PNG') = '8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9' THEN '✅ Format correct'
    ELSE '❌ Format incorrect'
  END AS "Statut";

-- ============================================
-- RÉSUMÉ ET RECOMMANDATIONS
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'RÉSUMÉ' AS "VÉRIFICATION",
  '' AS "STATUT";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Vérifier chaque élément
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

-- Recommandations
SELECT 
  'RECOMMANDATIONS' AS "ACTION",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
    ) THEN '1. Exécutez scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql pour créer la fonction'
    ELSE '1. ✅ Fonction existe'
  END AS "Action";

SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname = 'Restaurants can upload own passports'
      AND cmd = 'INSERT'
    ) THEN '2. Créez la politique INSERT via Storage → passports → Policies avec: bucket_id = ''passports'' AND auth.uid() IS NOT NULL AND auth.uid()::text = extract_user_id_from_path(name)'
    ELSE '2. ✅ Politique INSERT existe'
  END AS "Action";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- ============================================
-- ✅ DIAGNOSTIC TERMINÉ
-- ============================================

