-- ============================================
-- SCRIPT : Création des politiques Storage avec SECURITY DEFINER
-- ============================================
-- 
-- Ce script utilise une fonction SECURITY DEFINER appartenant à postgres
-- pour contourner les restrictions de permissions sur storage.objects
--
-- ⚠️ EXÉCUTEZ CE SCRIPT VIA SUPABASE DASHBOARD → SQL EDITOR
-- ============================================

-- ============================================
-- PARTIE 1 : VÉRIFIER QUE LA FONCTION HELPER EXISTE
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.routines 
    WHERE routine_name = 'extract_user_id_from_path'
  ) THEN
    RAISE EXCEPTION 'La fonction extract_user_id_from_path n''existe pas. Exécutez d''abord scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql';
  END IF;
END $$;

-- ============================================
-- PARTIE 2 : FONCTION SECURITY DEFINER POUR CRÉER LES POLITIQUES
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

-- Changer le propriétaire de la fonction à postgres (si possible)
-- Cela garantit que la fonction a les permissions maximales
DO $$
BEGIN
  -- Essayer de changer le propriétaire à postgres
  -- Si cela échoue, la fonction utilisera les permissions du rôle actuel
  BEGIN
    ALTER FUNCTION create_storage_policy_safe(TEXT, TEXT, TEXT, TEXT) OWNER TO postgres;
  EXCEPTION WHEN OTHERS THEN
    -- Si on ne peut pas changer le propriétaire, continuer quand même
    -- La fonction SECURITY DEFINER devrait quand même fonctionner
    RAISE NOTICE 'Impossible de changer le propriétaire de la fonction, continuation...';
  END;
END $$;

-- ============================================
-- PARTIE 3 : CRÉER LES POLITIQUES STORAGE
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
-- PARTIE 4 : NETTOYER LA FONCTION HELPER (OPTIONNEL)
-- ============================================

-- Supprimer la fonction helper si vous voulez (décommentez la ligne suivante)
-- DROP FUNCTION IF EXISTS create_storage_policy_safe(TEXT, TEXT, TEXT, TEXT);

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
-- PARTIE 6 : VÉRIFICATIONS
-- ============================================

-- Vérifier que toutes les politiques Storage ont été créées
SELECT 
  'Politiques Storage passports' AS verification,
  COUNT(*) || ' politiques créées (attendu: 5)' AS statut
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%passport%';

-- Liste détaillée des politiques Storage créées
SELECT 
  policyname AS "Nom de la politique",
  cmd AS "Opération",
  CASE 
    WHEN policyname LIKE '%passport%' THEN '✅'
    ELSE ''
  END AS "Statut"
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
-- - ✅ 5 politiques créées (attendu: 5)
-- - ✅ Liste de 5 politiques avec leurs opérations
-- 
-- Alors tout est PARFAIT ! 🎉
-- ============================================

