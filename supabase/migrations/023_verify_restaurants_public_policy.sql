-- Migration 023 : Vérification et correction de la politique publique pour les restaurants
-- Cette migration s'assure que la politique publique existe et fonctionne correctement
-- pour permettre à tous (même non authentifiés) de voir les restaurants actifs et vérifiés

-- IMPORTANT : Cette politique doit permettre à TOUS (même non authentifiés) de voir les restaurants
-- Elle ne doit PAS nécessiter d'authentification (pas de auth.uid() IS NOT NULL)

-- Supprimer l'ancienne politique si elle existe (au cas où elle aurait été modifiée)
DROP POLICY IF EXISTS "Public can view active verified restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view active verified restaurants" ON restaurants;

-- Créer la politique publique qui permet à TOUS de voir les restaurants actifs et vérifiés
-- Cette politique fonctionne même pour les utilisateurs non authentifiés
CREATE POLICY "Public can view active verified restaurants"
  ON restaurants FOR SELECT
  USING (
    is_active = true AND is_verified = true
  );

-- Commentaire pour documenter la politique
COMMENT ON POLICY "Public can view active verified restaurants" ON restaurants IS 
  'Permet à tous (même non authentifiés) de voir les restaurants actifs et vérifiés pour l''affichage public sur la page d''accueil. Cette politique ne nécessite pas d''authentification.';

-- Vérifier que les autres politiques nécessaires existent
-- Politique pour que les restaurants puissent voir leur propre profil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'restaurants' 
    AND policyname = 'Restaurants can view own profile'
  ) THEN
    CREATE POLICY "Restaurants can view own profile"
      ON restaurants FOR SELECT
      USING (
        auth.uid() IS NOT NULL 
        AND auth.uid()::text = id::text
      );
  END IF;
END $$;

-- Politique pour que les restaurants puissent modifier leur propre profil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'restaurants' 
    AND policyname = 'Restaurants can update own profile'
  ) THEN
    CREATE POLICY "Restaurants can update own profile"
      ON restaurants FOR UPDATE
      USING (
        auth.uid() IS NOT NULL 
        AND auth.uid()::text = id::text
      );
  END IF;
END $$;

-- Politique pour que les restaurants puissent insérer leur propre profil
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'restaurants' 
    AND policyname = 'Restaurants can insert own profile'
  ) THEN
    CREATE POLICY "Restaurants can insert own profile"
      ON restaurants FOR INSERT
      WITH CHECK (
        auth.uid() IS NOT NULL 
        AND auth.uid()::text = id::text
      );
  END IF;
END $$;

