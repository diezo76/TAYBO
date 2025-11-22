-- Script de test pour vérifier l'accessibilité de l'URL de l'image
-- Exécutez ce script pour obtenir l'URL à tester dans le navigateur

SELECT 
  '🔗 URL À TESTER DANS LE NAVIGATEUR' as instruction,
  image_url as "URL Image",
  name as "Restaurant",
  id as "Restaurant ID"
FROM restaurants
WHERE LOWER(name) LIKE '%daynite%' OR LOWER(name) LIKE '%daynight%';

-- Instructions :
-- 1. Copiez l'URL ci-dessus
-- 2. Collez-la dans une nouvelle fenêtre de votre navigateur
-- 3. Si l'image s'affiche → Le problème vient du code React
-- 4. Si l'image ne s'affiche pas → Le problème vient de Supabase Storage

-- Vérification supplémentaire : Tester l'URL publique générée
SELECT 
  '📋 URL PUBLIQUE GÉNÉRÉE' as type,
  'https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763322801994.jpg' as url;

