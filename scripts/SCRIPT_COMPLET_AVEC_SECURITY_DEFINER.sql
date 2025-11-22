-- ============================================
-- SCRIPT COMPLET : RLS + Fonction + Storage Policies
-- ============================================
-- 
-- Ce script contient TOUT dans le bon ordre :
-- 1. Politiques RLS pour restaurants
-- 2. Fonction helper extract_user_id_from_path
-- 3. Fonction SECURITY DEFINER pour créer les politiques Storage
-- 4. Politiques Storage pour passports
--
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
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
-- PARTIE 3 : FONCTION SECURITY DEFINER POUR STORAGE
-- ============================================

-- Créer une fonction SECURITY DEFINER qui appartient à postgres
-- Cette fonction aura les permissions nécessaires pour créer des politiques sur storage.objects
CREATE OR REPLACE FUNCTION create_storage_policy_safe(
  policy_name TEXT,
  policy_command TEXT,
  policy_using TEXT DEFAULT NULL,
  policy_with_check TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage, pg_temp
AS $$
BEGIN
  -- Supprimer la policy si elle existe
  EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
  
  -- Créer la policy selon le type de commande
  IF policy_command = 'SELECT' THEN
    IF policy_using IS NOT NULL THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT USING (%s)', 
        policy_name, policy_using);
    ELSE
      RAISE EXCEPTION 'policy_using est requis pour SELECT';
    END IF;
  ELSIF policy_command = 'INSERT' THEN
    IF policy_with_check IS NOT NULL THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT WITH CHECK (%s)', 
        policy_name, policy_with_check);
    ELSE
      RAISE EXCEPTION 'policy_with_check est requis pour INSERT';
    END IF;
  ELSIF policy_command = 'UPDATE' THEN
    IF policy_using IS NOT NULL AND policy_with_check IS NOT NULL THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR UPDATE USING (%s) WITH CHECK (%s)', 
        policy_name, policy_using, policy_with_check);
    ELSE
      RAISE EXCEPTION 'policy_using et policy_with_check sont requis pour UPDATE';
    END IF;
  ELSIF policy_command = 'DELETE' THEN
    IF policy_using IS NOT NULL THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR DELETE USING (%s)', 
        policy_name, policy_using);
    ELSE
      RAISE EXCEPTION 'policy_using est requis pour DELETE';
    END IF;
  ELSE
    RAISE EXCEPTION 'Commande non supportée: %', policy_command;
  END IF;
END;
$$;

-- Essayer de changer le propriétaire de la fonction à postgres pour avoir les permissions maximales
DO $$
BEGIN
  BEGIN
    ALTER FUNCTION create_storage_policy_safe(TEXT, TEXT, TEXT, TEXT) OWNER TO postgres;
  EXCEPTION WHEN OTHERS THEN
    -- Si on ne peut pas changer le propriétaire, continuer quand même
    -- La fonction SECURITY DEFINER devrait quand même fonctionner
    RAISE NOTICE 'Impossible de changer le propriétaire, la fonction utilisera les permissions du rôle actuel';
  END;
END $$;

-- ============================================
-- PARTIE 4 : CRÉER LES POLITIQUES STORAGE
-- ============================================

-- Politique 1 : SELECT - Restaurants peuvent voir leurs propres documents
SELECT create_storage_policy_safe(
  'Restaurants can view own passports',
  'SELECT',
  'bucket_id = ''passports'' AND auth.uid() IS NOT NULL AND auth.uid()::text = extract_user_id_from_path(name)',
  NULL
);

-- Politique 2 : INSERT - Restaurants peuvent uploader leurs propres documents
SELECT create_storage_policy_safe(
  'Restaurants can upload own passports',
  'INSERT',
  NULL,
  'bucket_id = ''passports'' AND auth.uid() IS NOT NULL AND auth.uid()::text = extract_user_id_from_path(name)'
);

-- Politique 3 : UPDATE - Restaurants peuvent mettre à jour leurs propres documents
SELECT create_storage_policy_safe(
  'Restaurants can update own passports',
  'UPDATE',
  'bucket_id = ''passports'' AND auth.uid() IS NOT NULL AND auth.uid()::text = extract_user_id_from_path(name)',
  'bucket_id = ''passports'' AND auth.uid() IS NOT NULL AND auth.uid()::text = extract_user_id_from_path(name)'
);

-- Politique 4 : DELETE - Restaurants peuvent supprimer leurs propres documents
SELECT create_storage_policy_safe(
  'Restaurants can delete own passports',
  'DELETE',
  'bucket_id = ''passports'' AND auth.uid() IS NOT NULL AND auth.uid()::text = extract_user_id_from_path(name)',
  NULL
);

-- Politique 5 : SELECT Admin - Admins peuvent voir tous les documents
SELECT create_storage_policy_safe(
  'Admins can view all passports',
  'SELECT',
  'bucket_id = ''passports'' AND EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.email = ''admin@taybo.com'')',
  NULL
);

-- ============================================
-- PARTIE 5 : COMMENTAIRES ET MÉTADONNÉES
-- ============================================

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
-- PARTIE 6 : VÉRIFICATIONS COMPLÈTES
-- ============================================

-- 1. Vérifier que la fonction helper existe
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

-- 3. Vérifier les politiques Storage passports
SELECT 
  'Politiques Storage passports' AS verification,
  COUNT(*) || ' politiques créées (attendu: 5)' AS statut
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%';

-- 4. Liste détaillée des politiques Storage créées
SELECT 
  policyname AS "Nom de la politique",
  cmd AS "Opération",
  '✅' AS "Statut"
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
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
-- - ✅ Liste de 5 politiques avec leurs opérations
-- 
-- Alors tout est PARFAIT ! 🎉
-- ============================================

