-- ============================================
-- SCRIPT : Politiques RLS + Fonction Helper
-- ============================================
-- 
-- ⚠️ IMPORTANT :
-- Ce script contient UNIQUEMENT les politiques RLS et la fonction helper.
-- Les politiques Storage doivent être créées via l'interface Supabase Dashboard.
-- 
-- Voir : GUIDE_CREATION_POLICIES_STORAGE_INTERFACE.md
-- ============================================

-- ============================================
-- PARTIE 1 : POLITIQUES RLS RESTAURANTS
-- ============================================

-- S'assurer que la politique INSERT existe et fonctionne
DROP POLICY IF EXISTS "Restaurants can insert own profile" ON restaurants;
CREATE POLICY "Restaurants can insert own profile"
  ON restaurants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- S'assurer que la politique SELECT permet aux restaurants de voir leur propre profil
-- même s'ils ne sont pas vérifiés/actifs (crucial pour éviter l'erreur 406)
DROP POLICY IF EXISTS "Restaurants can view own profile" ON restaurants;
CREATE POLICY "Restaurants can view own profile"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- S'assurer que la politique UPDATE existe
DROP POLICY IF EXISTS "Restaurants can update own profile" ON restaurants;
CREATE POLICY "Restaurants can update own profile"
  ON restaurants FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- Commentaires explicatifs pour RLS
COMMENT ON POLICY "Restaurants can insert own profile" ON restaurants IS 
'Permet aux restaurants de créer leur propre profil lors de l''inscription - l''ID doit correspondre à auth.uid()';

COMMENT ON POLICY "Restaurants can view own profile" ON restaurants IS 
'Permet aux restaurants de voir leur propre profil même s''ils ne sont pas vérifiés/actifs - évite l''erreur 406 après inscription';

-- ============================================
-- PARTIE 2 : FONCTION HELPER
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
-- VÉRIFICATIONS
-- ============================================

-- 1. Vérifier que la fonction existe
SELECT 
  'Fonction extract_user_id_from_path' AS verification,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'extract_user_id_from_path'
    ) THEN '✅ OK'
    ELSE '❌ MANQUANTE'
  END AS statut;

-- 2. Vérifier les politiques RLS restaurants
SELECT 
  'Politiques RLS restaurants' AS verification,
  COUNT(*) || ' politiques créées (attendu: 3)' AS statut
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND policyname IN (
    'Restaurants can insert own profile',
    'Restaurants can view own profile',
    'Restaurants can update own profile'
  );

-- ============================================
-- ✅ SCRIPT TERMINÉ
-- ============================================
-- 
-- PROCHAINES ÉTAPES :
-- 
-- 1. Vérifiez que vous voyez :
--    - ✅ Fonction : OK
--    - ✅ 3 politiques créées
-- 
-- 2. Créez les politiques Storage via l'interface :
--    - Allez dans Storage → passports → Policies
--    - Créez les 5 politiques Storage
--    - Voir : GUIDE_CREATION_POLICIES_STORAGE_INTERFACE.md
-- 
-- ============================================

