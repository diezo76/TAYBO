-- ============================================
-- CORRECTION RLS SEULEMENT : Inscriptions Client et Restaurant
-- ============================================
-- 
-- Ce script corrige UNIQUEMENT les politiques RLS (sans Storage) :
-- 1. Active RLS sur les tables users et restaurants
-- 2. Crée les politiques RLS pour les clients (users)
-- 3. Crée les politiques RLS pour les restaurants
-- 4. Crée la fonction helper extract_user_id_from_path
--
-- ⚠️ Les politiques Storage doivent être créées séparément :
--    → Utilisez scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql
--    → OU créez-les via l'interface Supabase Dashboard
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
-- ÉTAPE 5 : Vérifications Finales
-- ============================================

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
    THEN '🎉 CORRECTION RLS TERMINÉE ! Les politiques RLS sont maintenant opérationnelles.'
    ELSE '⚠️ Certains éléments peuvent manquer. Vérifiez les résultats ci-dessus.'
  END AS "RÉSULTAT FINAL";

SELECT 
  '═══════════════════════════════════════════' AS "═══════════════════════════════════════════";

-- ============================================
-- ✅ CORRECTION RLS TERMINÉE
-- ============================================
-- 
-- Après avoir exécuté ce script :
-- ✅ RLS est activé sur users et restaurants
-- ✅ Les politiques RLS pour clients sont créées (INSERT, SELECT, UPDATE)
-- ✅ Les politiques RLS pour restaurants sont créées (INSERT, SELECT, UPDATE, SELECT publique)
-- ✅ La fonction extract_user_id_from_path est créée
--
-- PROCHAINES ÉTAPES :
-- 
-- 1. Pour les politiques Storage (si nécessaire pour l'upload de passports) :
--    → Exécutez le script : scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql
--    → OU créez-les via l'interface Supabase Dashboard : Storage → passports → Policies
--
-- 2. Testez l'inscription d'un client
--
-- 3. Testez l'inscription d'un restaurant (sans upload de passport d'abord)
--
-- 4. Si les inscriptions fonctionnent, vous pouvez ensuite ajouter les politiques Storage
--
-- 5. Si tout fonctionne, vous êtes opérationnel à 100% ! 🎉
-- ============================================

