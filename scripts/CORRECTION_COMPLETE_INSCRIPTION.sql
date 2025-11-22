-- ============================================
-- CORRECTION COMPLÈTE : Erreurs lors de l'inscription restaurant
-- ============================================
-- 
-- Ce script corrige :
-- 1. L'erreur RLS "new row violates row-level security policy" lors de l'INSERT
-- 2. L'erreur 406 lors de la récupération du restaurant
-- 3. Vérifie que toutes les politiques sont correctement configurées
--
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
-- ============================================

-- ============================================
-- ÉTAPE 1 : Supprimer TOUTES les anciennes politiques
-- ============================================

-- Supprimer toutes les politiques existantes pour repartir de zéro
DROP POLICY IF EXISTS "Restaurants can manage own profile" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can read own data" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can update own data" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can view own profile" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can update own profile" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can insert own profile" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view active verified restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can view active verified restaurants" ON restaurants;

-- ============================================
-- ÉTAPE 2 : S'assurer que RLS est activé
-- ============================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ÉTAPE 3 : Créer les politiques dans le bon ordre
-- ============================================

-- IMPORTANT : Créer INSERT en premier pour permettre l'inscription
-- Politique INSERT : Permet aux restaurants de créer leur propre profil
-- Cette politique doit fonctionner même si le restaurant n'existe pas encore
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

-- ============================================
-- ÉTAPE 4 : Vérifier que les politiques sont permissives
-- ============================================

-- Vérifier que les politiques sont bien permissives (pas restrictives)
SELECT 
  'Vérification politiques permissives' AS verification,
  policyname AS "Politique",
  permissive AS "Type",
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN '✅ OK'
    ELSE '❌ RESTRICTIVE'
  END AS "Statut"
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND schemaname = 'public'
ORDER BY policyname;

-- ============================================
-- ÉTAPE 5 : Commentaires explicatifs
-- ============================================

COMMENT ON POLICY "Restaurants can insert own profile" ON restaurants IS 
'Permet aux restaurants de créer leur propre profil lors de l''inscription - l''ID doit correspondre à auth.uid() - CRUCIAL pour l''inscription';

COMMENT ON POLICY "Restaurants can view own profile" ON restaurants IS 
'Permet aux restaurants de voir leur propre profil même s''ils ne sont pas vérifiés/actifs - évite l''erreur 406 après inscription/connexion';

COMMENT ON POLICY "Restaurants can update own profile" ON restaurants IS 
'Permet aux restaurants de modifier leur propre profil - l''ID doit correspondre à auth.uid()';

COMMENT ON POLICY "Public can view active verified restaurants" ON restaurants IS 
'Permet à tout le monde de voir les restaurants actifs et vérifiés - pour la page d''accueil';

-- ============================================
-- ÉTAPE 6 : Vérifications finales
-- ============================================

-- Vérifier que toutes les politiques sont créées
SELECT 
  'Politiques RLS créées' AS verification,
  COUNT(*) || ' politiques (attendu: 4)' AS statut,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ TOUTES LES POLITIQUES SONT PRÉSENTES'
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

-- Liste détaillée des politiques créées
SELECT 
  policyname AS "Politique",
  cmd AS "Opération",
  CASE 
    WHEN policyname = 'Restaurants can insert own profile' THEN '✅ CRUCIAL pour inscription'
    WHEN policyname = 'Restaurants can view own profile' THEN '✅ CRUCIAL pour éviter 406'
    WHEN policyname = 'Restaurants can update own profile' THEN '✅ OK'
    WHEN policyname = 'Public can view active verified restaurants' THEN '✅ OK'
    ELSE '⚠️'
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
-- ÉTAPE 7 : Vérifier RLS activé
-- ============================================

SELECT 
  'RLS activé sur restaurants' AS verification,
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
-- ✅ CORRECTION TERMINÉE
-- ============================================
-- 
-- Après avoir exécuté ce script :
-- 1. ✅ Les politiques RLS sont correctement configurées
-- 2. ✅ L'inscription restaurant devrait fonctionner (INSERT)
-- 3. ✅ La récupération du profil devrait fonctionner (SELECT)
-- 4. ✅ L'erreur 406 devrait être résolue
--
-- PROBLÈME IDENTIFIÉ DANS LE CODE :
-- L'URL Storage montre "passports/passports/..." - il y a un double "passports"
-- Vérifiez le code d'upload dans restaurantAuthService.js ligne 47
-- Le filePath devrait être juste le nom du fichier, pas "passports/nom"
-- ============================================

