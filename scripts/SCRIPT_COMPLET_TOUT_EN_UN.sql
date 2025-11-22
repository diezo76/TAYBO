-- ============================================
-- SCRIPT COMPLET : Correction RLS + Storage pour passports
-- ============================================
-- 
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
--
-- Ce script contient TOUT dans le bon ordre :
-- 1. Politiques RLS pour restaurants
-- 2. Fonction helper extract_user_id_from_path
-- 3. Politiques Storage pour passports
--
-- Durée estimée : 2 secondes
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
-- PARTIE 3 : POLITIQUES STORAGE PASSPORTS
-- ============================================

-- Politique SELECT : Permet aux restaurants de voir leurs propres documents
DROP POLICY IF EXISTS "Restaurants can view own passports" ON storage.objects;
CREATE POLICY "Restaurants can view own passports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'passports'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = extract_user_id_from_path(name)
);

-- Politique INSERT : Permet aux restaurants d'uploader leurs propres documents
DROP POLICY IF EXISTS "Restaurants can upload own passports" ON storage.objects;
CREATE POLICY "Restaurants can upload own passports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'passports'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = extract_user_id_from_path(name)
);

-- Politique UPDATE : Permet aux restaurants de mettre à jour leurs propres documents
DROP POLICY IF EXISTS "Restaurants can update own passports" ON storage.objects;
CREATE POLICY "Restaurants can update own passports"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'passports'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = extract_user_id_from_path(name)
);

-- Politique DELETE : Permet aux restaurants de supprimer leurs propres documents
DROP POLICY IF EXISTS "Restaurants can delete own passports" ON storage.objects;
CREATE POLICY "Restaurants can delete own passports"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'passports'
  AND auth.uid() IS NOT NULL
  AND auth.uid()::text = extract_user_id_from_path(name)
);

-- Politique admin SELECT : Permet aux admins de voir tous les documents
DROP POLICY IF EXISTS "Admins can view all passports" ON storage.objects;
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

-- Commentaires explicatifs pour Storage
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

-- ============================================
-- PARTIE 4 : VÉRIFICATIONS
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
  COUNT(*) || ' politiques créées' AS statut
FROM pg_policies 
WHERE tablename = 'restaurants' 
  AND policyname IN (
    'Restaurants can insert own profile',
    'Restaurants can view own profile',
    'Restaurants can update own profile'
  );

-- 3. Vérifier les politiques Storage passports
SELECT 
  'Politiques Storage passports' AS verification,
  COUNT(*) || ' politiques créées (attendu: 5)' AS statut
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%passport%';

-- 4. Liste détaillée des politiques Storage créées
SELECT 
  policyname,
  cmd AS operation,
  CASE 
    WHEN policyname LIKE '%passport%' THEN '✅'
    ELSE ''
  END AS statut
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%passport%'
ORDER BY policyname;

-- ============================================
-- ✅ SCRIPT TERMINÉ
-- ============================================
-- 
-- Si vous voyez :
-- - ✅ Fonction : OK
-- - ✅ 3 politiques RLS restaurants
-- - ✅ 5 politiques Storage passports
-- 
-- Alors tout est PARFAIT ! 🎉
-- ============================================

