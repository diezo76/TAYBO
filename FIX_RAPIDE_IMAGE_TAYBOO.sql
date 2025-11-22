-- ============================================
-- FIX RAPIDE : Image Restaurant TAYBOO
-- ============================================
-- 
-- OPTION A : Utiliser une URL Unsplash (RAPIDE - 1 minute)
-- OPTION B : Créer politique Storage SELECT (RECOMMANDÉ - 5 minutes)
--

-- ============================================
-- OPTION A : URL UNSPLASH (SOLUTION RAPIDE)
-- ============================================

-- Exemples d'images de restaurants Unsplash de haute qualité :

-- Image 1 : Restaurant moderne élégant
-- https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop

-- Image 2 : Plats gastronomiques
-- https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop

-- Image 3 : Restaurant africain/cuisine du monde
-- https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop

-- Image 4 : Restaurant ambiance chaleureuse
-- https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop

-- Image 5 : Cuisine fusion moderne
-- https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&h=600&fit=crop

-- ✅ CHOISISSEZ UNE IMAGE ci-dessus et remplacez dans la commande ci-dessous :

UPDATE restaurants
SET image_url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
WHERE id = 'c45a3a48-c343-4922-8c6e-c62e8a165440'
RETURNING 
  name AS "Restaurant",
  image_url AS "Nouvelle URL Image";

-- 🎯 RESULTAT : Image s'affichera IMMÉDIATEMENT sur la page d'accueil

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  name AS "Restaurant",
  CASE 
    WHEN image_url LIKE 'https://images.unsplash.com%' THEN '✅ URL Unsplash'
    WHEN image_url LIKE '%/restaurant-images/%' THEN '🖼️ Supabase Storage'
    WHEN image_url IS NULL THEN '❌ Pas d''image'
    ELSE '⚠️ Autre URL'
  END AS "Status Image",
  LEFT(image_url, 80) || '...' AS "URL (aperçu)",
  is_verified AS "Vérifié",
  is_active AS "Actif"
FROM restaurants
WHERE id = 'c45a3a48-c343-4922-8c6e-c62e8a165440';

-- ============================================
-- OPTION B : CRÉER POLITIQUE STORAGE SELECT
-- ============================================
-- 
-- Cette option nécessite d'aller sur le Supabase Dashboard :
-- 
-- 1. https://supabase.com/dashboard
-- 2. Projet Taybo → Storage → restaurant-images → Policies
-- 3. New Policy → For full customization
-- 4. Policy Name: "Public can view restaurant images"
-- 5. Command: SELECT
-- 6. USING expression: bucket_id = 'restaurant-images'::text
-- 7. Save
-- 
-- Puis revenir à l'URL Supabase Storage :
--
-- UPDATE restaurants
-- SET image_url = 'https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/c45a3a48-c343-4922-8c6e-c62e8a165440/1763508031684.jpg'
-- WHERE id = 'c45a3a48-c343-4922-8c6e-c62e8a165440';

-- ============================================
-- NOTES
-- ============================================
--
-- Option A (Unsplash) :
--   ✅ Fonctionne IMMÉDIATEMENT
--   ✅ Images gratuites haute qualité
--   ✅ Pas besoin de configuration
--   ⚠️ Dépendance externe
--   ⚠️ Limites API en production
--
-- Option B (Supabase Storage) :
--   ✅ Contrôle total
--   ✅ Professionnel
--   ✅ Pas de dépendance externe
--   ⚠️ Nécessite configuration Dashboard
--   ⚠️ 5 minutes de setup
--
-- RECOMMANDATION :
--   - Développement/Test : Option A (Unsplash)
--   - Production : Option B (Supabase Storage)

