# Guide de Résolution : Erreur "must be owner of relation objects"

## Problème
Lors de l'exécution de la migration `027_fix_restaurant_signup_rls_storage.sql`, vous obtenez l'erreur :
```
ERROR: 42501: must be owner of relation objects
```

## Cause
Cette erreur se produit lorsque l'utilisateur qui exécute la migration SQL n'a pas les permissions nécessaires pour créer ou modifier des politiques sur la table `storage.objects` dans Supabase.

## Solutions

### Solution 1 : Exécuter via Supabase Dashboard (Recommandé)

1. **Connectez-vous à votre projet Supabase** : https://supabase.com/dashboard
2. **Allez dans SQL Editor**
3. **Exécutez uniquement la partie RLS** (lignes 6-36) de la migration :

```sql
-- CORRECTION DES POLITIQUES RLS RESTAURANTS
DROP POLICY IF EXISTS "Restaurants can insert own profile" ON restaurants;
CREATE POLICY "Restaurants can insert own profile"
  ON restaurants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

DROP POLICY IF EXISTS "Restaurants can view own profile" ON restaurants;
CREATE POLICY "Restaurants can view own profile"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

DROP POLICY IF EXISTS "Restaurants can update own profile" ON restaurants;
CREATE POLICY "Restaurants can update own profile"
  ON restaurants FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );
```

4. **Créez la fonction helper** :

```sql
CREATE OR REPLACE FUNCTION extract_user_id_from_path(file_path TEXT)
RETURNS TEXT AS $$
DECLARE
  file_name TEXT;
  user_id TEXT;
BEGIN
  file_name := (string_to_array(file_path, '/'))[array_length(string_to_array(file_path, '/'), 1)];
  user_id := split_part(file_name, '-', 1);
  RETURN user_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

5. **Créez les politiques Storage via l'interface Dashboard** :
   - Allez dans **Storage** → **Policies**
   - Sélectionnez le bucket **passports**
   - Créez les politiques suivantes :

#### Politique SELECT : "Restaurants can view own passports"
- **Policy name** : `Restaurants can view own passports`
- **Allowed operation** : `SELECT`
- **Policy definition** :
```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

#### Politique INSERT : "Restaurants can upload own passports"
- **Policy name** : `Restaurants can upload own passports`
- **Allowed operation** : `INSERT`
- **Policy definition** :
```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

### Solution 2 : Utiliser le rôle service_role (Développement uniquement)

⚠️ **ATTENTION** : Cette solution ne doit être utilisée qu'en développement. Le rôle `service_role` a des permissions complètes.

Si vous utilisez Supabase CLI ou un script automatisé :

1. Assurez-vous d'utiliser la clé `service_role` (et non `anon`)
2. Exécutez la migration complète

### Solution 3 : Vérifier les permissions du rôle actuel

Si vous utilisez Supabase CLI, vérifiez que vous êtes connecté avec un compte ayant les permissions nécessaires :

```bash
supabase db reset
```

Ou exécutez la migration manuellement via le Dashboard.

## Vérification

Après avoir appliqué les corrections :

1. **Vérifiez les politiques RLS** :
```sql
SELECT * FROM pg_policies WHERE tablename = 'restaurants';
```

2. **Vérifiez les politiques Storage** :
   - Allez dans **Storage** → **Policies** → **passports**
   - Vérifiez que les deux politiques existent

3. **Testez l'upload d'un passport** :
   - Connectez-vous en tant que restaurant
   - Essayez d'uploader un document dans le bucket `passports`
   - Le nom du fichier doit être au format : `{uuid}-{timestamp}.{ext}`

## Notes importantes

- La fonction `extract_user_id_from_path` extrait l'ID depuis le **nom du fichier**, pas depuis le dossier
- Le format attendu est : `passports/{uuid}-{timestamp}.{ext}`
- L'ID utilisateur est la partie avant le premier `-` dans le nom du fichier

## Fichiers modifiés

- `supabase/migrations/027_fix_restaurant_signup_rls_storage.sql` : Migration corrigée (suppression de la fonction `create_storage_policy`)

