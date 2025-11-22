-- Migration 018 : Nettoyage des politiques RLS en conflit pour restaurants
-- Cette migration supprime les politiques obsolètes ou incorrectes qui causent des erreurs 406

-- Supprimer les politiques obsolètes ou en conflit
DROP POLICY IF EXISTS "Public can view all restaurants" ON restaurants;
DROP POLICY IF EXISTS "Public can view approved restaurants" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can read own data" ON restaurants;
DROP POLICY IF EXISTS "Restaurants can update own data" ON restaurants;
DROP POLICY IF EXISTS "Allow public restaurant registration" ON restaurants;

-- Vérifier que les politiques correctes existent toujours
-- Si elles n'existent pas, les recréer

-- Politique publique pour voir les restaurants actifs/vérifiés
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurants' 
        AND policyname = 'Public can view active verified restaurants'
    ) THEN
        CREATE POLICY "Public can view active verified restaurants"
          ON restaurants FOR SELECT
          USING (is_active = true AND is_verified = true);
    END IF;
END $$;

-- Politique pour que les restaurants voient leur propre profil
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurants' 
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

-- Politique pour que les restaurants modifient leur propre profil
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurants' 
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

-- Politique pour que les restaurants insèrent leur propre profil
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurants' 
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

-- Politiques admin (vérifier et recréer si nécessaire)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurants' 
        AND policyname = 'Admins can view all restaurants'
    ) THEN
        CREATE POLICY "Admins can view all restaurants"
          ON restaurants FOR SELECT
          USING (
            auth.uid() IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM users
              WHERE users.id::text = auth.uid()::text
              AND users.email = 'admin@taybo.com'
            )
          );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'restaurants' 
        AND policyname = 'Admins can update all restaurants'
    ) THEN
        CREATE POLICY "Admins can update all restaurants"
          ON restaurants FOR UPDATE
          USING (
            auth.uid() IS NOT NULL AND
            EXISTS (
              SELECT 1 FROM users
              WHERE users.id::text = auth.uid()::text
              AND users.email = 'admin@taybo.com'
            )
          );
    END IF;
END $$;

