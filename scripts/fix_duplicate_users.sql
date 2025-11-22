-- Script pour identifier et corriger les utilisateurs en double
-- Ce script trouve les cas où un email existe dans auth.users mais avec un ID différent dans public.users

-- 1. Identifier les utilisateurs dans auth.users qui n'ont pas d'entrée correspondante dans public.users
SELECT 
  au.id as auth_id,
  au.email,
  au.created_at as auth_created_at,
  pu.id as public_users_id,
  pu.created_at as public_users_created_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id::text = pu.id::text
WHERE pu.id IS NULL
ORDER BY au.created_at DESC;

-- 2. Identifier les emails en double dans public.users (même email, IDs différents)
SELECT 
  email,
  COUNT(*) as count,
  array_agg(id::text) as ids,
  array_agg(created_at::text) as created_dates
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 3. Identifier les cas où l'email existe dans public.users mais avec un ID différent de auth.users
SELECT 
  au.id as auth_id,
  au.email,
  pu.id as public_users_id,
  pu.email as public_email,
  CASE 
    WHEN au.id::text = pu.id::text THEN 'OK'
    ELSE 'INCOHERENT'
  END as status
FROM auth.users au
INNER JOIN public.users pu ON au.email = pu.email
WHERE au.id::text != pu.id::text
ORDER BY au.created_at DESC;

-- 4. Corriger les données incohérentes (ATTENTION : À utiliser avec précaution)
-- Cette requête met à jour l'ID dans public.users pour correspondre à auth.users
-- Ne décommentez que si vous êtes sûr de vouloir corriger les données

-- UPDATE public.users pu
-- SET id = au.id::uuid
-- FROM auth.users au
-- WHERE au.email = pu.email
--   AND au.id::text != pu.id::text
--   AND NOT EXISTS (
--     SELECT 1 FROM public.users pu2 
--     WHERE pu2.id::text = au.id::text
--   );

-- 5. Supprimer les doublons en gardant le plus récent (ATTENTION : À utiliser avec précaution)
-- Cette requête supprime les entrées en double en gardant celle avec l'ID qui correspond à auth.users

-- WITH duplicates AS (
--   SELECT 
--     email,
--     id,
--     ROW_NUMBER() OVER (
--       PARTITION BY email 
--       ORDER BY 
--         CASE WHEN EXISTS (
--           SELECT 1 FROM auth.users au WHERE au.id::text = public.users.id::text
--         ) THEN 0 ELSE 1 END,
--         created_at DESC
--     ) as rn
--   FROM public.users
--   WHERE email IN (
--     SELECT email FROM public.users GROUP BY email HAVING COUNT(*) > 1
--   )
-- )
-- DELETE FROM public.users
-- WHERE id IN (
--   SELECT id FROM duplicates WHERE rn > 1
-- );

-- 6. Vérifier l'état final après correction
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) - COUNT(DISTINCT email) as duplicates
FROM public.users;

