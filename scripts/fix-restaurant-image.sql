-- Script pour corriger l'image du restaurant Daynight
-- Ce script supprime le fichier avec le mauvais type MIME et met à jour l'URL vers un fichier valide

-- Étape 1 : Vérifier les fichiers disponibles
-- (À exécuter dans Supabase SQL Editor pour voir les fichiers)

-- Étape 2 : Mettre à jour l'URL de l'image vers un fichier avec le bon type MIME
UPDATE restaurants
SET image_url = 'https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763328629876.jpeg'
WHERE id = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf'
  AND image_url LIKE '%1763362184754.jpg%';

-- Note : Le fichier avec le mauvais type MIME (1763362184754.jpg) devra être supprimé manuellement
-- depuis Supabase Dashboard > Storage > restaurant-images > cb6dc3c1-294d-4162-adc6-20551b2bb6cf

