-- Script de nettoyage des Policies Storage
-- Supprime les policies dupliquées et trop permissives
--
-- INSTRUCTIONS :
-- 1. Allez dans Supabase Dashboard > SQL Editor
-- 2. Exécutez ce script
-- 3. Vérifiez avec la requête à la fin

-- ============================================
-- SUPPRESSION DES POLICIES DUPLIQUÉES
-- ============================================

-- Supprimer les anciennes policies avec des noms différents mais même fonction
DROP POLICY IF EXISTS "Public can read restaurant images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read menu images" ON storage.objects;

-- ============================================
-- SUPPRESSION DES POLICIES TROP PERMISSIVES
-- ============================================

-- Ces policies permettent à TOUS les utilisateurs authentifiés d'uploader
-- On les supprime car elles sont trop permissives

DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload passports" ON storage.objects;

-- Policy pour users qui peut être redondante si on veut que seuls les restaurants uploadent
-- On la garde car les users doivent pouvoir uploader leurs propres images
-- DROP POLICY IF EXISTS "Users can read own passports" ON storage.objects;

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================

-- Afficher toutes les policies restantes
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- Compter les policies par bucket
SELECT 
  CASE 
    WHEN qual LIKE '%restaurant-images%' THEN 'restaurant-images'
    WHEN qual LIKE '%menu-images%' THEN 'menu-images'
    WHEN qual LIKE '%user-images%' THEN 'user-images'
    WHEN qual LIKE '%passports%' THEN 'passports'
    ELSE 'autre'
  END AS bucket,
  cmd,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
GROUP BY bucket, cmd
ORDER BY bucket, cmd;

