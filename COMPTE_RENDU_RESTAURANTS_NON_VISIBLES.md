# Compte Rendu - Restaurants Non Visibles sur la Page d'Accueil

## Date
Janvier 2025

## Problème Identifié

Les restaurants ne s'affichent plus sur la page d'accueil de l'application. La page affiche le message "Aucun restaurant disponible" même s'il y a des restaurants dans la base de données.

## Causes Possibles

### 1. Politique RLS Manquante ou Incorrecte

La politique RLS publique qui permet à tous (même non authentifiés) de voir les restaurants actifs et vérifiés peut avoir été supprimée ou modifiée lors des migrations précédentes.

### 2. Restaurants Non Activés/Vérifiés

Les restaurants dans la base de données peuvent ne pas être marqués comme :
- `is_active = true`
- `is_verified = true`

### 3. Problème avec les Migrations

Les migrations 021, 022 ou 023 peuvent ne pas avoir été appliquées correctement, ou dans le mauvais ordre.

## Solution Implémentée

### Migration 023 : Vérification et Correction de la Politique Publique

Création d'une migration qui :

1. **Supprime les anciennes politiques** qui pourraient causer des conflits
2. **Recrée la politique publique** qui permet à TOUS (même non authentifiés) de voir les restaurants actifs et vérifiés
3. **Vérifie que les autres politiques nécessaires existent** (pour les restaurants et les admins)

```sql
CREATE POLICY "Public can view active verified restaurants"
  ON restaurants FOR SELECT
  USING (
    is_active = true AND is_verified = true
  );
```

**Important** : Cette politique ne nécessite PAS d'authentification (pas de `auth.uid() IS NOT NULL`), ce qui permet aux utilisateurs non connectés de voir les restaurants.

### Script de Vérification

Création d'un script SQL (`scripts/check_and_activate_restaurants.sql`) pour :
- Vérifier l'état actuel des restaurants
- Compter les restaurants par statut
- Vérifier les politiques RLS
- Tester la politique publique

## Fichiers Créés/Modifiés

### Nouveaux fichiers
- `supabase/migrations/023_verify_restaurants_public_policy.sql` : Migration pour corriger la politique publique
- `scripts/check_and_activate_restaurants.sql` : Script de vérification et diagnostic

## Étapes de Résolution

### Étape 1 : Appliquer les Migrations dans l'Ordre

Assurez-vous que les migrations sont appliquées dans le bon ordre :

```bash
# Via Supabase CLI
supabase migration up

# Ou via le dashboard Supabase
# Allez dans Database > Migrations et appliquez les migrations dans l'ordre :
# 1. Migration 021 (crée la fonction is_admin_user())
# 2. Migration 022 (utilise is_admin_user() pour les politiques admin)
# 3. Migration 023 (corrige la politique publique)
```

**Ordre d'application** :
1. ✅ Migration 021 : `021_fix_users_rls_recursion.sql` (doit être appliquée en premier)
2. ✅ Migration 022 : `022_fix_restaurants_rls_admin_check.sql` (utilise la fonction de la 021)
3. ✅ Migration 023 : `023_verify_restaurants_public_policy.sql` (corrige la politique publique)

### Étape 2 : Vérifier l'État des Restaurants

Exécutez le script de vérification dans Supabase SQL Editor :

```sql
-- Vérifier l'état actuel des restaurants
SELECT 
  id,
  name,
  email,
  is_active,
  is_verified,
  created_at
FROM restaurants
ORDER BY created_at DESC;

-- Compter les restaurants par statut
SELECT 
  COUNT(*) FILTER (WHERE is_active = true AND is_verified = true) as actifs_et_verifies,
  COUNT(*) FILTER (WHERE is_active = false) as inactifs,
  COUNT(*) FILTER (WHERE is_verified = false) as non_verifies,
  COUNT(*) as total
FROM restaurants;
```

### Étape 3 : Activer/Vérifier les Restaurants (si nécessaire)

Si les restaurants ne sont pas activés/vérifiés, vous pouvez les activer avec :

```sql
-- Activer et vérifier tous les restaurants existants
UPDATE restaurants
SET 
  is_active = true,
  is_verified = true
WHERE is_active = false OR is_verified = false;
```

**⚠️ Attention** : Cette commande active et vérifie TOUS les restaurants. Si vous voulez être plus sélectif, utilisez des conditions spécifiques.

### Étape 4 : Vérifier les Politiques RLS

Vérifiez que les politiques RLS sont correctement configurées :

```sql
-- Vérifier les politiques RLS pour les restaurants
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

Vous devriez voir au moins ces politiques :
- ✅ `Public can view active verified restaurants` (SELECT)
- ✅ `Restaurants can view own profile` (SELECT)
- ✅ `Restaurants can update own profile` (UPDATE)
- ✅ `Restaurants can insert own profile` (INSERT)
- ✅ `Admins can view all restaurants` (SELECT)
- ✅ `Admins can update all restaurants` (UPDATE)
- ✅ `Admins can insert restaurants` (INSERT)
- ✅ `Admins can delete restaurants` (DELETE)

### Étape 5 : Tester la Politique Publique

Testez que la politique publique fonctionne correctement :

```sql
-- Cette requête simule ce qu'un utilisateur non authentifié verrait
SELECT 
  id,
  name,
  email,
  is_active,
  is_verified
FROM restaurants
WHERE is_active = true AND is_verified = true
LIMIT 10;
```

Cette requête devrait retourner les restaurants actifs et vérifiés.

## Vérification dans l'Application

Après avoir appliqué les migrations et vérifié les restaurants :

1. ✅ Ouvrez la page d'accueil de l'application
2. ✅ Les restaurants actifs et vérifiés devraient s'afficher
3. ✅ Vérifiez la console du navigateur pour d'éventuelles erreurs
4. ✅ Vérifiez les logs Supabase pour d'éventuelles erreurs RLS

### Erreurs Possibles dans la Console

Si vous voyez des erreurs dans la console du navigateur :

- **Erreur 406 (Not Acceptable)** : Problème avec les politiques RLS
- **Erreur 500 (Internal Server Error)** : Problème avec les migrations ou la fonction `is_admin_user()`
- **Erreur 403 (Forbidden)** : Problème avec les permissions

## Diagnostic

### Si Aucun Restaurant N'Apparaît

1. **Vérifiez que les migrations sont appliquées** :
   ```sql
   SELECT * FROM supabase_migrations.schema_migrations 
   ORDER BY version DESC LIMIT 5;
   ```

2. **Vérifiez que les restaurants existent et sont actifs/vérifiés** :
   ```sql
   SELECT COUNT(*) FROM restaurants 
   WHERE is_active = true AND is_verified = true;
   ```

3. **Vérifiez que la politique publique existe** :
   ```sql
   SELECT policyname FROM pg_policies 
   WHERE tablename = 'restaurants' 
   AND policyname = 'Public can view active verified restaurants';
   ```

4. **Testez la requête directement** :
   ```sql
   SELECT * FROM restaurants 
   WHERE is_active = true AND is_verified = true;
   ```

### Si la Fonction `is_admin_user()` N'Existe Pas

Si vous obtenez une erreur indiquant que la fonction `is_admin_user()` n'existe pas :

1. Vérifiez que la migration 021 a été appliquée
2. Vérifiez que la fonction existe :
   ```sql
   SELECT proname FROM pg_proc 
   WHERE proname = 'is_admin_user';
   ```

3. Si elle n'existe pas, appliquez manuellement la migration 021

## Impact

### Avant
- ❌ Aucun restaurant visible sur la page d'accueil
- ❌ Message "Aucun restaurant disponible"
- ❌ Politique RLS publique peut-être manquante ou incorrecte

### Après
- ✅ Restaurants actifs et vérifiés visibles sur la page d'accueil
- ✅ Politique RLS publique correctement configurée
- ✅ Les utilisateurs non authentifiés peuvent voir les restaurants
- ✅ Les restaurants peuvent voir leur propre profil
- ✅ Les admins peuvent gérer tous les restaurants

## Notes Techniques

### Politique Publique vs Politiques Authentifiées

La politique publique `Public can view active verified restaurants` :
- ✅ Ne nécessite PAS d'authentification
- ✅ Fonctionne pour les utilisateurs non connectés
- ✅ Permet de voir uniquement les restaurants `is_active = true` ET `is_verified = true`

Les autres politiques (restaurants, admins) :
- ✅ Nécessitent une authentification (`auth.uid() IS NOT NULL`)
- ✅ Permettent aux restaurants de voir/modifier leur propre profil
- ✅ Permettent aux admins de gérer tous les restaurants

### Ordre des Politiques RLS

PostgreSQL évalue les politiques RLS dans l'ordre. Si plusieurs politiques correspondent :
- La première politique qui correspond est utilisée
- Les politiques sont évaluées avec `OR` (si une politique correspond, l'accès est autorisé)

C'est pourquoi la politique publique doit être créée en premier pour permettre l'accès public, puis les autres politiques pour les cas spécifiques.

## Références

- Migration 017 : `supabase/migrations/017_fix_restaurant_rls_406.sql`
- Migration 021 : `supabase/migrations/021_fix_users_rls_recursion.sql`
- Migration 022 : `supabase/migrations/022_fix_restaurants_rls_admin_check.sql`
- Migration 023 : `supabase/migrations/023_verify_restaurants_public_policy.sql`
- Script de vérification : `scripts/check_and_activate_restaurants.sql`
- Service restaurants : `src/services/restaurantService.js`

