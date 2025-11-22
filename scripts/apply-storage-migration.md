# Script SQL pour Migration Storage

Copiez-collez ce script dans Supabase Dashboard > SQL Editor :

```sql
-- Migration 016 : Configuration des Policies pour Supabase Storage
-- Cette migration configure les permissions pour les buckets d'images

-- ============================================
-- POLICIES POUR LE BUCKET restaurant-images
-- ============================================

-- Permettre à tout le monde de voir les images de restaurants (lecture publique)
DROP POLICY IF EXISTS "Public Access to Restaurant Images" ON storage.objects;
CREATE POLICY "Public Access to Restaurant Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

-- Permettre aux restaurants authentifiés d'uploader leurs propres images
DROP POLICY IF EXISTS "Restaurants can upload own images" ON storage.objects;
CREATE POLICY "Restaurants can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux restaurants de mettre à jour leurs propres images
DROP POLICY IF EXISTS "Restaurants can update own images" ON storage.objects;
CREATE POLICY "Restaurants can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurant-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux restaurants de supprimer leurs propres images
DROP POLICY IF EXISTS "Restaurants can delete own images" ON storage.objects;
CREATE POLICY "Restaurants can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- POLICIES POUR LE BUCKET menu-images
-- ============================================

-- Permettre à tout le monde de voir les images de menu (lecture publique)
DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
CREATE POLICY "Public Access to Menu Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Permettre aux restaurants authentifiés d'uploader des images de menu
DROP POLICY IF EXISTS "Restaurants can upload menu images" ON storage.objects;
CREATE POLICY "Restaurants can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id::text = auth.uid()::text
  )
);

-- Permettre aux restaurants de mettre à jour leurs images de menu
DROP POLICY IF EXISTS "Restaurants can update menu images" ON storage.objects;
CREATE POLICY "Restaurants can update menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id::text = auth.uid()::text
  )
);

-- Permettre aux restaurants de supprimer leurs images de menu
DROP POLICY IF EXISTS "Restaurants can delete menu images" ON storage.objects;
CREATE POLICY "Restaurants can delete menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images'
  AND EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id::text = auth.uid()::text
  )
);

-- ============================================
-- POLICIES POUR LE BUCKET user-images
-- ============================================

-- Permettre à tout le monde de voir les images de profil utilisateur (lecture publique)
DROP POLICY IF EXISTS "Public Access to User Images" ON storage.objects;
CREATE POLICY "Public Access to User Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-images');

-- Permettre aux utilisateurs d'uploader leurs propres images
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux utilisateurs de mettre à jour leurs propres images
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux utilisateurs de supprimer leurs propres images
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- POLICIES POUR LE BUCKET passports (PRIVÉ)
-- ============================================

-- Permettre aux restaurants de voir leurs propres documents
DROP POLICY IF EXISTS "Restaurants can view own passports" ON storage.objects;
CREATE POLICY "Restaurants can view own passports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'passports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux restaurants d'uploader leurs propres documents
DROP POLICY IF EXISTS "Restaurants can upload own passports" ON storage.objects;
CREATE POLICY "Restaurants can upload own passports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'passports'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permettre aux admins de voir tous les documents
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
```

