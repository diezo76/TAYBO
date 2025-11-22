-- Migration 027 : Correction des politiques RLS pour l'inscription restaurant
-- Cette migration corrige uniquement les politiques RLS pour les restaurants
-- 
-- ⚠️ NOTE IMPORTANTE :
-- Les politiques Storage pour le bucket passports doivent être créées séparément
-- via le Supabase Dashboard (Storage → Policies) car elles nécessitent des permissions spéciales.
-- Voir le fichier : scripts/create_passports_storage_policies.sql

-- ============================================
-- CORRECTION DES POLITIQUES RLS RESTAURANTS
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

-- Fonction helper pour extraire l'ID depuis le chemin du fichier
-- Cette fonction sera utilisée par les politiques Storage (à créer via Dashboard)
-- Le format est : passports/{uuid}-{timestamp}.{ext}
-- On extrait la partie avant le premier '-' du nom du fichier
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

-- Commentaires explicatifs
COMMENT ON POLICY "Restaurants can insert own profile" ON restaurants IS 
'Permet aux restaurants de créer leur propre profil lors de l''inscription - l''ID doit correspondre à auth.uid()';

COMMENT ON POLICY "Restaurants can view own profile" ON restaurants IS 
'Permet aux restaurants de voir leur propre profil même s''ils ne sont pas vérifiés/actifs - évite l''erreur 406 après inscription';

COMMENT ON FUNCTION extract_user_id_from_path(TEXT) IS 
'Extrait l''ID utilisateur depuis le chemin du fichier passport (format: passports/{uuid}-{timestamp}.{ext}) - utilisé par les politiques Storage';

