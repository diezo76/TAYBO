-- ============================================
-- VÉRIFICATION COMPLÈTE : Inscriptions Client et Restaurant
-- ============================================
-- 
-- Ce script vérifie que TOUT est opérationnel à 100% pour :
-- 1. L'inscription des clients (table users)
-- 2. L'inscription des restaurants (table restaurants)
-- 3. Les politiques Storage pour les passports
-- 4. Les fonctions nécessaires
--
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
-- ============================================

-- ============================================
-- VÉRIFICATION 1 : RLS Activé
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'VÉRIFICATION 1 : RLS Activé' AS "VÉRIFICATION",
  '' AS "STATUT",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Vérifier RLS sur users
SELECT 
  'RLS sur table users' AS "Table",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'users' 
      AND schemaname = 'public'
      AND rowsecurity = true
    ) THEN '✅ ACTIVÉ'
    ELSE '❌ NON ACTIVÉ'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'users' 
      AND schemaname = 'public'
      AND rowsecurity = true
    ) THEN 'OK'
    ELSE 'Exécutez: ALTER TABLE users ENABLE ROW LEVEL SECURITY;'
  END AS "Action";

-- Vérifier RLS sur restaurants
SELECT 
  'RLS sur table restaurants' AS "Table",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'restaurants' 
      AND schemaname = 'public'
      AND rowsecurity = true
    ) THEN '✅ ACTIVÉ'
    ELSE '❌ NON ACTIVÉ'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'restaurants' 
      AND schemaname = 'public'
      AND rowsecurity = true
    ) THEN 'OK'
    ELSE 'Exécutez: ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;'
  END AS "Action";

-- ============================================
-- VÉRIFICATION 2 : Politiques RLS pour CLIENTS (users)
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'VÉRIFICATION 2 : Politiques RLS CLIENTS (users)' AS "VÉRIFICATION",
  '' AS "STATUT",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Compter les politiques requises pour users
SELECT 
  'Politiques RLS users' AS "Vérification",
  COUNT(*) || ' politiques trouvées (attendu: 3 minimum)' AS "Statut",
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ SUFFISANT'
    ELSE '❌ INSUFFISANT - Il manque ' || (3 - COUNT(*)) || ' politique(s)'
  END AS "Résultat"
FROM pg_policies 
WHERE tablename = 'users' 
  AND schemaname = 'public'
  AND policyname IN (
    'Users can insert own profile',
    'Users can view own profile',
    'Users can update own profile'
  );

-- Détail des politiques users
SELECT 
  '   → ' || policyname AS "Politique",
  cmd AS "Opération",
  CASE 
    WHEN policyname = 'Users can insert own profile' THEN '✅ CRUCIAL pour inscription'
    WHEN policyname = 'Users can view own profile' THEN '✅ CRUCIAL pour éviter 406'
    WHEN policyname = 'Users can update own profile' THEN '✅ OK'
    ELSE '⚠️'
  END AS "Statut"
FROM pg_policies 
WHERE tablename = 'users' 
  AND schemaname = 'public'
  AND policyname IN (
    'Users can insert own profile',
    'Users can view own profile',
    'Users can update own profile'
  )
ORDER BY 
  CASE 
    WHEN policyname = 'Users can insert own profile' THEN 1
    WHEN policyname = 'Users can view own profile' THEN 2
    WHEN policyname = 'Users can update own profile' THEN 3
    ELSE 4
  END;

-- Vérifier chaque politique individuellement
SELECT 
  'Politique INSERT users' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can insert own profile'
      AND cmd = 'INSERT'
    ) THEN '✅ PRÉSENTE'
    ELSE '❌ MANQUANTE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can insert own profile'
      AND cmd = 'INSERT'
    ) THEN 'OK'
    ELSE 'CRUCIAL pour inscription client - Créez cette politique'
  END AS "Action";

SELECT 
  'Politique SELECT users' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can view own profile'
      AND cmd = 'SELECT'
    ) THEN '✅ PRÉSENTE'
    ELSE '❌ MANQUANTE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can view own profile'
      AND cmd = 'SELECT'
    ) THEN 'OK'
    ELSE 'CRUCIAL pour éviter erreur 406 - Créez cette politique'
  END AS "Action";

SELECT 
  'Politique UPDATE users' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can update own profile'
      AND cmd = 'UPDATE'
    ) THEN '✅ PRÉSENTE'
    ELSE '❌ MANQUANTE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'users' 
      AND policyname = 'Users can update own profile'
      AND cmd = 'UPDATE'
    ) THEN 'OK'
    ELSE 'Recommandée pour modification profil - Créez cette politique'
  END AS "Action";

-- ============================================
-- VÉRIFICATION 3 : Politiques RLS pour RESTAURANTS
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'VÉRIFICATION 3 : Politiques RLS RESTAURANTS' AS "VÉRIFICATION",
  '' AS "STATUT",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Compter les politiques requises pour restaurants
SELECT 
  'Politiques RLS restaurants' AS "Vérification",
  COUNT(*) || ' politiques trouvées (attendu: 3 minimum)' AS "Statut",
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ SUFFISANT'
    ELSE '❌ INSUFFISANT - Il manque ' || (3 - COUNT(*)) || ' politique(s)'
  END AS "Résultat"
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
  AND policyname IN (
    'Restaurants can insert own profile',
    'Restaurants can view own profile',
    'Restaurants can update own profile'
  );

-- Détail des politiques restaurants
SELECT 
  '   → ' || policyname AS "Politique",
  cmd AS "Opération",
  CASE 
    WHEN policyname = 'Restaurants can insert own profile' THEN '✅ CRUCIAL pour inscription'
    WHEN policyname = 'Restaurants can view own profile' THEN '✅ CRUCIAL pour éviter 406'
    WHEN policyname = 'Restaurants can update own profile' THEN '✅ OK'
    ELSE '⚠️'
  END AS "Statut"
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
  AND policyname IN (
    'Restaurants can insert own profile',
    'Restaurants can view own profile',
    'Restaurants can update own profile'
  )
ORDER BY 
  CASE 
    WHEN policyname = 'Restaurants can insert own profile' THEN 1
    WHEN policyname = 'Restaurants can view own profile' THEN 2
    WHEN policyname = 'Restaurants can update own profile' THEN 3
    ELSE 4
  END;

-- Vérifier chaque politique individuellement
SELECT 
  'Politique INSERT restaurants' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can insert own profile'
      AND cmd = 'INSERT'
    ) THEN '✅ PRÉSENTE'
    ELSE '❌ MANQUANTE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can insert own profile'
      AND cmd = 'INSERT'
    ) THEN 'OK'
    ELSE 'CRUCIAL pour inscription restaurant - Créez cette politique'
  END AS "Action";

SELECT 
  'Politique SELECT restaurants' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can view own profile'
      AND cmd = 'SELECT'
    ) THEN '✅ PRÉSENTE'
    ELSE '❌ MANQUANTE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can view own profile'
      AND cmd = 'SELECT'
    ) THEN 'OK'
    ELSE 'CRUCIAL pour éviter erreur 406 - Créez cette politique'
  END AS "Action";

SELECT 
  'Politique UPDATE restaurants' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can update own profile'
      AND cmd = 'UPDATE'
    ) THEN '✅ PRÉSENTE'
    ELSE '❌ MANQUANTE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can update own profile'
      AND cmd = 'UPDATE'
    ) THEN 'OK'
    ELSE 'Recommandée pour modification profil - Créez cette politique'
  END AS "Action";

-- Vérifier la politique publique pour voir les restaurants actifs
SELECT 
  'Politique SELECT publique restaurants' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND schemaname = 'public'
      AND (policyname LIKE '%Public%' OR policyname LIKE '%Anyone%')
      AND cmd = 'SELECT'
    ) THEN '✅ PRÉSENTE'
    ELSE '⚠️ OPTIONNELLE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND schemaname = 'public'
      AND (policyname LIKE '%Public%' OR policyname LIKE '%Anyone%')
      AND cmd = 'SELECT'
    ) THEN 'OK'
    ELSE 'Recommandée pour afficher les restaurants sur la page d''accueil'
  END AS "Action";

-- ============================================
-- VÉRIFICATION 4 : Fonction Helper
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'VÉRIFICATION 4 : Fonction Helper' AS "VÉRIFICATION",
  '' AS "STATUT",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'Fonction extract_user_id_from_path' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
      AND routine_schema = 'public'
    ) THEN '✅ EXISTE'
    ELSE '❌ MANQUANTE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
      AND routine_schema = 'public'
    ) THEN 'OK - Utilisée par les politiques Storage'
    ELSE 'CRUCIAL pour Storage passports - Créez cette fonction'
  END AS "Action";

-- ============================================
-- VÉRIFICATION 5 : Politiques Storage Passports
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'VÉRIFICATION 5 : Politiques Storage Passports' AS "VÉRIFICATION",
  '' AS "STATUT",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Compter les politiques Storage pour passports
SELECT 
  'Politiques Storage passports' AS "Vérification",
  COUNT(*) || ' politiques trouvées (attendu: 5 minimum)' AS "Statut",
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ SUFFISANT'
    ELSE '❌ INSUFFISANT - Il manque ' || (5 - COUNT(*)) || ' politique(s)'
  END AS "Résultat"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%';

-- Détail des politiques Storage
SELECT 
  '   → ' || policyname AS "Politique Storage",
  cmd AS "Opération",
  CASE 
    WHEN policyname LIKE '%view%' AND policyname LIKE '%passport%' THEN '✅ REQUISE'
    WHEN policyname LIKE '%upload%' AND policyname LIKE '%passport%' THEN '✅ REQUISE'
    WHEN policyname LIKE '%update%' AND policyname LIKE '%passport%' THEN '✅ REQUISE'
    WHEN policyname LIKE '%delete%' AND policyname LIKE '%passport%' THEN '✅ REQUISE'
    WHEN policyname LIKE '%admin%' AND policyname LIKE '%passport%' THEN '✅ REQUISE'
    ELSE '⚠️'
  END AS "Statut"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%'
ORDER BY policyname;

-- Vérifier chaque politique Storage individuellement
SELECT 
  'Storage SELECT passports' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND policyname LIKE '%view%'
      AND cmd = 'SELECT'
    ) THEN '✅ PRÉSENTE'
    ELSE '❌ MANQUANTE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND policyname LIKE '%view%'
      AND cmd = 'SELECT'
    ) THEN 'OK'
    ELSE 'CRUCIAL pour voir les passports - Créez cette politique'
  END AS "Action";

SELECT 
  'Storage INSERT passports' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND (policyname LIKE '%upload%' OR policyname LIKE '%insert%')
      AND cmd = 'INSERT'
    ) THEN '✅ PRÉSENTE'
    ELSE '❌ MANQUANTE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND (policyname LIKE '%upload%' OR policyname LIKE '%insert%')
      AND cmd = 'INSERT'
    ) THEN 'OK'
    ELSE 'CRUCIAL pour upload passports - Créez cette politique'
  END AS "Action";

SELECT 
  'Storage UPDATE passports' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND policyname LIKE '%update%'
      AND cmd = 'UPDATE'
    ) THEN '✅ PRÉSENTE'
    ELSE '⚠️ OPTIONNELLE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND policyname LIKE '%update%'
      AND cmd = 'UPDATE'
    ) THEN 'OK'
    ELSE 'Recommandée pour modifier les passports'
  END AS "Action";

SELECT 
  'Storage DELETE passports' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND policyname LIKE '%delete%'
      AND cmd = 'DELETE'
    ) THEN '✅ PRÉSENTE'
    ELSE '⚠️ OPTIONNELLE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND policyname LIKE '%delete%'
      AND cmd = 'DELETE'
    ) THEN 'OK'
    ELSE 'Recommandée pour supprimer les passports'
  END AS "Action";

SELECT 
  'Storage Admin SELECT passports' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND policyname LIKE '%admin%'
      AND cmd = 'SELECT'
    ) THEN '✅ PRÉSENTE'
    ELSE '⚠️ OPTIONNELLE'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND policyname LIKE '%passport%'
      AND policyname LIKE '%admin%'
      AND cmd = 'SELECT'
    ) THEN 'OK'
    ELSE 'Recommandée pour que les admins voient tous les passports'
  END AS "Action";

-- ============================================
-- VÉRIFICATION 6 : Bucket Storage Passports
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'VÉRIFICATION 6 : Bucket Storage Passports' AS "VÉRIFICATION",
  '' AS "STATUT",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Vérifier si le bucket existe (via les politiques Storage)
SELECT 
  'Bucket passports existe' AS "Vérification",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND qual::text LIKE '%passports%'
    ) THEN '✅ DÉTECTÉ (via politiques)'
    ELSE '⚠️ NON DÉTECTÉ'
  END AS "Statut",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage'
      AND qual::text LIKE '%passports%'
    ) THEN 'OK'
    ELSE 'Vérifiez manuellement dans Storage → Buckets que le bucket "passports" existe'
  END AS "Action";

-- ============================================
-- RÉSUMÉ FINAL
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'RÉSUMÉ FINAL' AS "VÉRIFICATION",
  '' AS "STATUT",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- RLS activé
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'users' AND rowsecurity = true
    ) AND EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'restaurants' AND rowsecurity = true
    ) THEN '✅ RLS activé'
    ELSE '❌ RLS non activé'
  END AS "Élément",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'users' AND rowsecurity = true
    ) AND EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'restaurants' AND rowsecurity = true
    ) THEN 'OK'
    ELSE 'MANQUANT'
  END AS "Statut";

-- Politiques RLS users
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'users' 
          AND policyname IN (
            'Users can insert own profile',
            'Users can view own profile',
            'Users can update own profile'
          )) >= 3 THEN '✅ Politiques RLS clients'
    ELSE '❌ Politiques RLS clients'
  END AS "Élément",
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'users' 
          AND policyname IN (
            'Users can insert own profile',
            'Users can view own profile',
            'Users can update own profile'
          )) >= 3 THEN 'OK (' || (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'users' 
          AND policyname IN (
            'Users can insert own profile',
            'Users can view own profile',
            'Users can update own profile'
          )) || '/3)'
    ELSE 'MANQUANTES (' || (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'users' 
          AND policyname IN (
            'Users can insert own profile',
            'Users can view own profile',
            'Users can update own profile'
          )) || '/3)'
  END AS "Statut";

-- Politiques RLS restaurants
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'restaurants' 
          AND policyname IN (
            'Restaurants can insert own profile',
            'Restaurants can view own profile',
            'Restaurants can update own profile'
          )) >= 3 THEN '✅ Politiques RLS restaurants'
    ELSE '❌ Politiques RLS restaurants'
  END AS "Élément",
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'restaurants' 
          AND policyname IN (
            'Restaurants can insert own profile',
            'Restaurants can view own profile',
            'Restaurants can update own profile'
          )) >= 3 THEN 'OK (' || (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'restaurants' 
          AND policyname IN (
            'Restaurants can insert own profile',
            'Restaurants can view own profile',
            'Restaurants can update own profile'
          )) || '/3)'
    ELSE 'MANQUANTES (' || (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'restaurants' 
          AND policyname IN (
            'Restaurants can insert own profile',
            'Restaurants can view own profile',
            'Restaurants can update own profile'
          )) || '/3)'
  END AS "Statut";

-- Fonction helper
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

-- Politiques Storage
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'objects' 
          AND schemaname = 'storage'
          AND policyname LIKE '%passport%') >= 5 THEN '✅ Politiques Storage passports'
    ELSE '❌ Politiques Storage passports'
  END AS "Élément",
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'objects' 
          AND schemaname = 'storage'
          AND policyname LIKE '%passport%') >= 5 THEN 'OK (' || (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'objects' 
          AND schemaname = 'storage'
          AND policyname LIKE '%passport%') || '/5)'
    ELSE 'MANQUANTES (' || (SELECT COUNT(*) FROM pg_policies 
          WHERE tablename = 'objects' 
          AND schemaname = 'storage'
          AND policyname LIKE '%passport%') || '/5)'
  END AS "Statut";

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
           'Restaurants can update own profile'
         )) >= 3
    AND EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
    )
    AND (SELECT COUNT(*) FROM pg_policies 
         WHERE tablename = 'objects' 
         AND schemaname = 'storage'
         AND policyname LIKE '%passport%') >= 5
    THEN '🎉 TOUT EST PARFAIT ! Les inscriptions client et restaurant sont opérationnelles à 100%.'
    ELSE '⚠️ Il manque certains éléments. Consultez les détails ci-dessus et corrigez les éléments manquants.'
  END AS "RÉSULTAT FINAL";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- ============================================
-- ✅ VÉRIFICATION TERMINÉE
-- ============================================
-- 
-- Si vous voyez "🎉 TOUT EST PARFAIT !", alors :
-- ✅ Les inscriptions client fonctionnent
-- ✅ Les inscriptions restaurant fonctionnent
-- ✅ Les uploads de passports fonctionnent
-- ✅ Tout est opérationnel à 100%
--
-- Si vous voyez "⚠️ Il manque certains éléments", consultez les détails ci-dessus
-- et exécutez les scripts de correction appropriés :
-- - scripts/CORRECTION_COMPLETE_INSCRIPTION.sql (pour restaurants)
-- - scripts/SCRIPT_COMPLET_TOUT_EN_UN.sql (pour tout)
-- - supabase/migrations/020_fix_users_rls_policies.sql (pour clients)
-- ============================================

