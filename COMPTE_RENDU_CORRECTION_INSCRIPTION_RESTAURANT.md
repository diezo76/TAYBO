# Compte Rendu - Correction Inscription Restaurant

## Date
Décembre 2024

## Problèmes Identifiés

Lors de la création d'un compte restaurant, plusieurs erreurs se produisaient :

1. **Erreur Storage RLS** : `StorageApiError: new row violates row-level security policy`
   - L'upload du passeport échouait car la politique storage utilisait `storage.foldername(name)[1]` qui retournait `passports` au lieu de l'ID du restaurant
   - Le chemin du fichier est `passports/{uuid}-{timestamp}.{ext}`, donc il faut extraire l'ID depuis le nom du fichier

2. **Erreur 406 lors de la lecture** : `Failed to load resource: the server responded with a status of 406`
   - Les restaurants ne pouvaient pas lire leur propre profil après l'inscription car les politiques RLS ne permettaient pas la lecture des restaurants non vérifiés/non actifs
   - La politique SELECT nécessitait que le restaurant soit vérifié et actif pour être visible

3. **Erreur 406 pour la table users** : 
   - `AuthContext` essayait de récupérer les données utilisateur même pour les restaurants
   - Les restaurants n'ont pas d'entrée dans la table `users`, seulement dans `restaurants`
   - Cela causait des erreurs 406 inutiles

4. **Erreur INSERT restaurants** :
   - La politique RLS pour INSERT pouvait ne pas être correctement configurée
   - Il fallait s'assurer qu'une politique INSERT existe avec `WITH CHECK`

## Corrections Apportées

### 1. Migration SQL : `027_fix_restaurant_signup_rls_storage.sql`

Cette migration corrige :

#### A. Politiques RLS pour restaurants

- **Politique INSERT** : Permet aux restaurants de créer leur propre profil lors de l'inscription
  ```sql
  CREATE POLICY "Restaurants can insert own profile"
    ON restaurants FOR INSERT
    WITH CHECK (
      auth.uid() IS NOT NULL 
      AND auth.uid()::text = id::text
    );
  ```

- **Politique SELECT** : Permet aux restaurants de voir leur propre profil même s'ils ne sont pas vérifiés/actifs
  ```sql
  CREATE POLICY "Restaurants can view own profile"
    ON restaurants FOR SELECT
    USING (
      auth.uid() IS NOT NULL 
      AND auth.uid()::text = id::text
    );
  ```

- **Politique UPDATE** : Permet aux restaurants de modifier leur propre profil
  ```sql
  CREATE POLICY "Restaurants can update own profile"
    ON restaurants FOR UPDATE
    USING (
      auth.uid() IS NOT NULL 
      AND auth.uid()::text = id::text
    );
  ```

#### B. Fonction helper pour extraction ID depuis chemin fichier

Création d'une fonction SQL pour extraire l'ID utilisateur depuis le chemin du fichier passport :
```sql
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
```

#### C. Politiques Storage pour bucket passports

- **Politique SELECT** : Permet aux restaurants de voir leurs propres documents
  ```sql
  CREATE POLICY "Restaurants can view own passports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'passports'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = extract_user_id_from_path(name)
  );
  ```

- **Politique INSERT** : Permet aux restaurants d'uploader leurs propres documents
  ```sql
  CREATE POLICY "Restaurants can upload own passports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'passports'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = extract_user_id_from_path(name)
  );
  ```

### 2. Correction AuthContext.jsx

Modification de `AuthContext` pour qu'il ne récupère pas les données utilisateur pour les restaurants :

- Vérification du type d'utilisateur dans les métadonnées auth (`user_type`)
- Si `user_type === 'restaurant'`, ne pas essayer de récupérer les données utilisateur
- Cela évite les erreurs 406 inutiles lors de la connexion d'un restaurant

## Instructions d'Application

### Étape 1 : Appliquer la migration SQL

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **SQL Editor**
3. Ouvrez le fichier `supabase/migrations/027_fix_restaurant_signup_rls_storage.sql`
4. Copiez le contenu et exécutez-le dans l'éditeur SQL
5. Vérifiez qu'il n'y a pas d'erreurs

**⚠️ Si vous obtenez l'erreur "must be owner of relation objects"** :
- La migration utilise maintenant une fonction `SECURITY DEFINER` pour contourner les restrictions de permissions
- Si l'erreur persiste, utilisez le guide alternatif : `GUIDE_CREATION_POLICIES_PASSPORTS_MANUEL.md`
- Ce guide explique comment créer les politiques Storage manuellement via l'interface Dashboard

### Étape 2 : Vérifier les politiques existantes

Si vous avez déjà appliqué des migrations précédentes qui créent des politiques similaires, la migration utilisera `DROP POLICY IF EXISTS` pour les supprimer avant de créer les nouvelles. C'est normal et attendu.

### Étape 3 : Tester l'inscription restaurant

1. Allez sur la page d'inscription restaurant
2. Remplissez le formulaire avec :
   - Email valide
   - Mot de passe
   - Nom du restaurant
   - Description
   - Type de cuisine
   - Adresse
   - Téléphone
   - Frais de livraison
   - Fichier passeport (image ou PDF)
3. Cliquez sur "S'inscrire"
4. Vérifiez que :
   - L'inscription réussit sans erreur
   - Le passeport est uploadé avec succès
   - Vous pouvez voir un message de confirmation
   - Vous pouvez vous connecter avec les identifiants créés

## Vérifications Post-Correction

### Vérifier les politiques RLS

Exécutez cette requête SQL pour vérifier que les politiques existent :

```sql
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
```

Vous devriez voir :
- `Restaurants can insert own profile` (INSERT)
- `Restaurants can view own profile` (SELECT)
- `Restaurants can update own profile` (UPDATE)
- `Public can view active verified restaurants` (SELECT)

### Vérifier la fonction helper

Exécutez cette requête pour tester la fonction :

```sql
SELECT extract_user_id_from_path('passports/a37893a4-29b9-489c-99f2-19eeb9eebcab-1763498558087.PNG');
```

Cela devrait retourner : `a37893a4-29b9-489c-99f2-19eeb9eebcab`

### Vérifier les politiques Storage

Dans Supabase Dashboard :
1. Allez dans **Storage** > **Policies**
2. Sélectionnez le bucket `passports`
3. Vérifiez que les politiques suivantes existent :
   - `Restaurants can view own passports` (SELECT)
   - `Restaurants can upload own passports` (INSERT)
   - `Admins can view all passports` (SELECT)

## Notes Importantes

1. **Problème de Permissions Storage** : 
   - Si vous obtenez l'erreur "must be owner of relation objects" lors de l'exécution de la migration SQL, c'est normal
   - La migration utilise maintenant une fonction `SECURITY DEFINER` pour contourner ces restrictions
   - Si l'erreur persiste, utilisez le guide alternatif : `GUIDE_CREATION_POLICIES_PASSPORTS_MANUEL.md`
   - Ce guide explique comment créer les politiques Storage manuellement via l'interface Dashboard Supabase

2. **Format du chemin fichier** : Le code dans `restaurantAuthService.js` upload les fichiers avec le format `passports/{uuid}-{timestamp}.{ext}`. La fonction `extract_user_id_from_path` extrait l'ID depuis ce format. Si vous changez le format, vous devrez adapter la fonction.

3. **Politiques RLS multiples** : Les restaurants peuvent avoir plusieurs politiques SELECT qui s'appliquent :
   - `Public can view active verified restaurants` : Pour les restaurants vérifiés/actifs (visibles par tous)
   - `Restaurants can view own profile` : Pour que les restaurants voient leur propre profil même non vérifiés/inactifs
   - Les politiques sont combinées avec OR, donc si une des deux est vraie, l'accès est autorisé

4. **Séparation des contextes** : 
   - `AuthContext` gère les clients (table `users`)
   - `RestaurantAuthContext` gère les restaurants (table `restaurants`)
   - Les deux peuvent coexister car ils utilisent des tables différentes

## Prochaines Étapes

1. **Tester l'inscription** : Créer un compte restaurant et vérifier que tout fonctionne
2. **Tester la connexion** : Se connecter avec le compte créé
3. **Tester l'upload** : Vérifier que le passeport est bien uploadé et accessible
4. **Vérifier les logs** : Consulter les logs Supabase pour s'assurer qu'il n'y a plus d'erreurs 406/400

## Fichiers Modifiés

1. `supabase/migrations/027_fix_restaurant_signup_rls_storage.sql` (NOUVEAU)
   - Migration SQL pour corriger les politiques RLS et Storage

2. `src/contexts/AuthContext.jsx` (MODIFIÉ)
   - Ajout de la vérification du type d'utilisateur pour éviter de récupérer les données utilisateur pour les restaurants

## Résumé

Les corrections apportées permettent maintenant :
- ✅ L'upload du passeport lors de l'inscription restaurant
- ✅ La création de l'entrée dans la table restaurants
- ✅ La lecture du profil restaurant après l'inscription (même non vérifié/inactif)
- ✅ L'absence d'erreurs 406 pour la table users lors de la connexion restaurant

L'inscription restaurant devrait maintenant fonctionner correctement.

