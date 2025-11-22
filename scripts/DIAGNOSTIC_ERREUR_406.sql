-- ============================================
-- DIAGNOSTIC : Erreur 406 lors de la récupération restaurant
-- ============================================
-- 
-- Ce script diagnostique pourquoi getCurrentRestaurant() retourne 0 lignes
--
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
-- ============================================

-- ============================================
-- VÉRIFICATION 1 : Politiques RLS pour restaurants
-- ============================================

SELECT 
  '1. Politiques RLS restaurants' AS verification,
  COUNT(*) || ' politiques trouvées' AS statut
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public';

-- Liste détaillée des politiques RLS
SELECT 
  '   → ' || policyname AS "Politique",
  cmd AS "Opération",
  qual AS "Condition USING",
  with_check AS "Condition WITH CHECK"
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
ORDER BY policyname;

-- Vérifier spécifiquement la politique "Restaurants can view own profile"
SELECT 
  '2. Politique "Restaurants can view own profile"' AS verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can view own profile'
      AND cmd = 'SELECT'
    ) THEN '✅ EXISTE'
    ELSE '❌ MANQUANTE'
  END AS statut,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can view own profile'
      AND cmd = 'SELECT'
    ) THEN (
      SELECT qual FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can view own profile'
      LIMIT 1
    )
    ELSE 'Créez cette politique avec: auth.uid() IS NOT NULL AND auth.uid()::text = id::text'
  END AS "Condition"

-- ============================================
-- VÉRIFICATION 2 : Test avec un utilisateur connecté
-- ============================================

-- Note: Cette partie nécessite d'être connecté en tant que restaurant
-- Pour tester, connectez-vous d'abord en tant que restaurant dans l'application

-- Vérifier si auth.uid() retourne une valeur
SELECT 
  '3. auth.uid() actuel' AS verification,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ ' || auth.uid()::text
    ELSE '❌ NULL - Pas d''utilisateur connecté'
  END AS statut;

-- Vérifier si un restaurant existe avec cet ID
SELECT 
  '4. Restaurant existe pour auth.uid()' AS verification,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM restaurants WHERE id::text = auth.uid()::text
        ) THEN '✅ OUI'
        ELSE '❌ NON - Le restaurant n''existe pas dans la table'
      END
    ELSE '⚠️ Impossible de vérifier (pas d''auth.uid())'
  END AS statut;

-- Si le restaurant existe, afficher ses informations
SELECT 
  '5. Informations du restaurant' AS verification,
  id::text AS "ID",
  email AS "Email",
  name AS "Nom",
  is_verified AS "Vérifié",
  is_active AS "Actif"
FROM restaurants 
WHERE auth.uid() IS NOT NULL 
  AND id::text = auth.uid()::text
LIMIT 1;

-- ============================================
-- VÉRIFICATION 3 : Test de la requête exacte
-- ============================================

-- Simuler la requête exacte utilisée par getCurrentRestaurant()
SELECT 
  '6. Test requête getCurrentRestaurant()' AS verification,
  COUNT(*) || ' ligne(s) retournée(s)' AS statut,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ Aucune ligne - Erreur 406 probable'
    WHEN COUNT(*) = 1 THEN '✅ Une ligne - Devrait fonctionner'
    ELSE '⚠️ Plusieurs lignes - Problème de données'
  END AS "Résultat"
FROM restaurants 
WHERE auth.uid() IS NOT NULL 
  AND id::text = auth.uid()::text;

-- ============================================
-- VÉRIFICATION 4 : Vérifier RLS activé
-- ============================================

SELECT 
  '7. RLS activé sur restaurants' AS verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'restaurants' 
      AND schemaname = 'public'
      AND rowsecurity = true
    ) THEN '✅ OUI'
    ELSE '❌ NON - RLS n''est pas activé'
  END AS statut;

-- ============================================
-- VÉRIFICATION 5 : Politiques qui pourraient bloquer
-- ============================================

-- Vérifier s'il y a des politiques restrictives qui pourraient bloquer
SELECT 
  '8. Politiques restrictives' AS verification,
  policyname AS "Politique",
  cmd AS "Opération",
  CASE 
    WHEN qual LIKE '%is_verified%' OR qual LIKE '%is_active%' THEN '⚠️ RESTRICTIVE - Peut bloquer'
    ELSE '✅ OK'
  END AS "Statut"
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
  AND cmd = 'SELECT'
  AND (qual LIKE '%is_verified%' OR qual LIKE '%is_active%')
ORDER BY policyname;

-- ============================================
-- SOLUTION PROPOSÉE
-- ============================================

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

SELECT 
  'SOLUTION PROPOSÉE' AS "ACTION",
  '' AS "DÉTAILS";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- Vérifier si la politique correcte existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'restaurants' 
      AND policyname = 'Restaurants can view own profile'
      AND cmd = 'SELECT'
      AND qual LIKE '%auth.uid()%'
      AND qual LIKE '%id::text%'
    ) THEN '✅ La politique correcte existe'
    ELSE '❌ La politique correcte n''existe pas - Exécutez scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql'
  END AS "Vérification politique";

-- Vérifier si le restaurant existe
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM restaurants WHERE id::text = auth.uid()::text
    ) THEN '✅ Le restaurant existe dans la table'
    WHEN auth.uid() IS NOT NULL THEN '❌ Le restaurant n''existe pas - Problème d''inscription'
    ELSE '⚠️ Pas d''utilisateur connecté - Connectez-vous d''abord'
  END AS "Vérification données";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- ============================================
-- ✅ DIAGNOSTIC TERMINÉ
-- ============================================

