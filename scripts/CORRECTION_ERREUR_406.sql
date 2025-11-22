-- ============================================
-- CORRECTION : Erreur 406 lors de la récupération restaurant
-- ============================================
-- 
-- Ce script corrige les politiques RLS pour permettre aux restaurants
-- de voir leur propre profil même s'ils ne sont pas vérifiés/actifs
--
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
-- ============================================

-- ============================================
-- ÉTAPE 1 : Supprimer les anciennes politiques conflictuelles
-- ============================================

-- Supprimer toutes les anciennes politiques qui pourraient bloquer
DROP POLICY IF EXISTS "Restaurants can manage own profile" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can read own data" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can update own data" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can view own profile" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can update own profile" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can insert own profile" ON restaurants;

-- ============================================
-- ÉTAPE 2 : Créer les politiques correctes
-- ============================================

-- Politique SELECT : Permet aux restaurants de voir leur propre profil
-- MÊME s'ils ne sont pas vérifiés/actifs (crucial pour éviter l'erreur 406)
CREATE POLICY "Restaurants can view own profile"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Politique INSERT : Permet aux restaurants de créer leur propre profil
CREATE POLICY "Restaurants can insert own profile"
  ON restaurants FOR INSERT
  WITH CHECK (
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

-- ============================================
-- ÉTAPE 3 : Vérifier que RLS est activé
-- ============================================

-- S'assurer que RLS est activé sur la table restaurants
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 4 : Commentaires explicatifs
-- ============================================

COMMENT ON POLICY "Restaurants can view own profile" ON restaurants IS 
'Permet aux restaurants de voir leur propre profil même s''ils ne sont pas vérifiés/actifs - évite l''erreur 406 après inscription/connexion';

COMMENT ON POLICY "Restaurants can insert own profile" ON restaurants IS 
'Permet aux restaurants de créer leur propre profil lors de l''inscription - l''ID doit correspondre à auth.uid()';

COMMENT ON POLICY "Restaurants can update own profile" ON restaurants IS 
'Permet aux restaurants de modifier leur propre profil - l''ID doit correspondre à auth.uid()';

-- ============================================
-- ÉTAPE 5 : Vérifications
-- ============================================

-- Vérifier que les politiques sont créées
SELECT 
  'Politiques RLS créées' AS verification,
  COUNT(*) || ' politiques (attendu: 3)' AS statut
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
  AND policyname IN (
    'Restaurants can insert own profile',
    'Restaurants can view own profile',
    'Restaurants can update own profile'
  );

-- Liste des politiques créées
SELECT 
  policyname AS "Politique",
  cmd AS "Opération",
  '✅' AS "Statut"
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
  AND policyname IN (
    'Restaurants can insert own profile',
    'Restaurants can view own profile',
    'Restaurants can update own profile'
  )
ORDER BY policyname;

-- ============================================
-- ÉTAPE 6 : Test de la requête (si connecté)
-- ============================================

-- Note: Cette partie nécessite d'être connecté en tant que restaurant
-- Pour tester, connectez-vous d'abord en tant que restaurant dans l'application

-- Vérifier si la requête fonctionne maintenant
SELECT 
  'Test requête getCurrentRestaurant()' AS verification,
  CASE 
    WHEN auth.uid() IS NULL THEN '⚠️ Pas d''utilisateur connecté - Connectez-vous d''abord'
    WHEN EXISTS (
      SELECT 1 FROM restaurants 
      WHERE id::text = auth.uid()::text
    ) THEN 
      CASE 
        WHEN (
          SELECT COUNT(*) FROM restaurants 
          WHERE id::text = auth.uid()::text
        ) = 1 THEN '✅ Devrait fonctionner maintenant'
        ELSE '⚠️ Plusieurs restaurants avec le même ID - Problème de données'
      END
    ELSE '❌ Le restaurant n''existe pas dans la table - Problème d''inscription'
  END AS statut;

-- ============================================
-- ✅ CORRECTION TERMINÉE
-- ============================================
-- 
-- Après avoir exécuté ce script :
-- 1. Les politiques RLS sont correctement configurées
-- 2. Les restaurants peuvent voir leur propre profil même non vérifiés/actifs
-- 3. L'erreur 406 devrait être résolue
--
-- Pour tester :
-- 1. Connectez-vous en tant que restaurant dans l'application
-- 2. La récupération du profil devrait fonctionner
-- ============================================

