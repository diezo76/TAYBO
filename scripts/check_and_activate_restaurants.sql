-- Script pour vérifier et activer les restaurants
-- Ce script vérifie l'état des restaurants et les active/vérifie si nécessaire

-- 1. Vérifier l'état actuel des restaurants
SELECT 
  id,
  name,
  email,
  is_active,
  is_verified,
  created_at
FROM restaurants
ORDER BY created_at DESC;

-- 2. Compter les restaurants par statut
SELECT 
  COUNT(*) FILTER (WHERE is_active = true AND is_verified = true) as actifs_et_verifies,
  COUNT(*) FILTER (WHERE is_active = false) as inactifs,
  COUNT(*) FILTER (WHERE is_verified = false) as non_verifies,
  COUNT(*) as total
FROM restaurants;

-- 3. Activer et vérifier tous les restaurants existants (si nécessaire)
-- ATTENTION : Ne décommentez cette section que si vous voulez activer/vérifier tous les restaurants
-- UPDATE restaurants
-- SET 
--   is_active = true,
--   is_verified = true
-- WHERE is_active = false OR is_verified = false;

-- 4. Vérifier les politiques RLS pour les restaurants
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'restaurants'
ORDER BY policyname;

-- 5. Tester la politique publique (doit retourner les restaurants actifs et vérifiés)
-- Cette requête simule ce qu'un utilisateur non authentifié verrait
SELECT 
  id,
  name,
  email,
  is_active,
  is_verified
FROM restaurants
WHERE is_active = true AND is_verified = true
LIMIT 10;

