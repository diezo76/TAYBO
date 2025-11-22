# Guide de Résolution - Erreurs RLS (406, 403)

## Problèmes Identifiés

### 1. Erreur 406 lors de la récupération des restaurants
- **Symptôme** : `Failed to load resource: the server responded with a status of 406`
- **Cause** : Les politiques RLS empêchent les restaurants de voir leur propre profil s'ils ne sont pas vérifiés/actifs
- **Solution** : Migration 017 qui permet aux restaurants de voir leur propre profil même s'ils ne sont pas vérifiés

### 2. Erreur 403 lors de l'insertion dans la table users
- **Symptôme** : `Failed to load resource: the server responded with a status of 403`
- **Cause** : Pas de politique INSERT pour la table `users`, donc les utilisateurs ne peuvent pas créer leur propre entrée lors de l'inscription
- **Solution** : Migration 019 qui ajoute la politique INSERT pour users

### 3. Erreur 406 lors de la récupération des users
- **Symptôme** : `Failed to load resource: the server responded with a status of 406`
- **Cause** : Problème avec les politiques RLS ou les colonnes sélectionnées
- **Solution** : Vérifier que les politiques sont correctement appliquées

## Solutions

### Étape 1 : Appliquer les migrations manquantes

Les migrations suivantes doivent être appliquées dans Supabase :

#### Migration 017 : Correction des politiques RLS pour les restaurants
**Fichier** : `supabase/migrations/017_fix_restaurant_rls_406.sql`

Cette migration :
- Permet aux restaurants de voir leur propre profil même s'ils ne sont pas vérifiés/actifs
- Corrige l'erreur 406 lors de la récupération des données restaurant après connexion

**Comment l'appliquer** :
1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **SQL Editor**
3. Copiez le contenu de `supabase/migrations/017_fix_restaurant_rls_406.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter la migration

#### Migration 019 : Ajout de la politique INSERT pour users
**Fichier** : `supabase/migrations/019_add_users_insert_policy.sql`

Cette migration :
- Ajoute la politique INSERT manquante pour la table `users`
- Permet aux utilisateurs de créer leur propre entrée lors de l'inscription
- Corrige l'erreur 403 lors de l'inscription

**Comment l'appliquer** :
1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **SQL Editor**
3. Copiez le contenu de `supabase/migrations/019_add_users_insert_policy.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur **Run** pour exécuter la migration

### Étape 2 : Vérifier les politiques RLS

Après avoir appliqué les migrations, vérifiez que les politiques sont correctement créées :

#### Pour la table users :
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
WHERE tablename = 'users'
ORDER BY policyname;
```

Vous devriez voir :
- `Users can view own profile` (SELECT)
- `Users can update own profile` (UPDATE)
- `Users can insert own profile` (INSERT) ← Nouvelle politique

#### Pour la table restaurants :
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
- `Public can view active verified restaurants` (SELECT)
- `Restaurants can view own profile` (SELECT) ← Permet de voir même si non vérifié
- `Restaurants can update own profile` (UPDATE)
- `Restaurants can insert own profile` (INSERT)
- `Admins can view all restaurants` (SELECT)
- `Admins can update all restaurants` (UPDATE)
- `Admins can insert restaurants` (INSERT)
- `Admins can delete restaurants` (DELETE)

### Étape 3 : Tester

#### Test 1 : Inscription client
1. Allez sur `/client/signup`
2. Créez un nouveau compte
3. Vérifiez qu'il n'y a plus d'erreur 403
4. Vérifiez que l'entrée est créée dans la table `users`

#### Test 2 : Connexion restaurant
1. Allez sur `/restaurant/login`
2. Connectez-vous avec un compte restaurant
3. Vérifiez qu'il n'y a plus d'erreur 406
4. Vérifiez que les données du restaurant sont récupérées correctement

#### Test 3 : Vérifier les données dans Supabase
```sql
-- Vérifier les utilisateurs
SELECT id, email, first_name, last_name, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- Vérifier les restaurants
SELECT id, email, name, is_verified, is_active, created_at
FROM restaurants
ORDER BY created_at DESC
LIMIT 5;
```

## Dépannage

### Si les migrations échouent

#### Erreur : "policy already exists"
Si vous obtenez une erreur indiquant que la politique existe déjà :
1. Supprimez d'abord l'ancienne politique :
```sql
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Restaurants can view own profile" ON restaurants;
-- etc.
```
2. Réexécutez la migration

#### Erreur : "relation does not exist"
Si vous obtenez une erreur indiquant que la table n'existe pas :
1. Vérifiez que toutes les migrations précédentes ont été appliquées
2. Vérifiez que les tables `users` et `restaurants` existent

### Vérifier l'état de RLS

```sql
-- Vérifier si RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('users', 'restaurants')
ORDER BY tablename;
```

`rowsecurity` doit être `true` pour les deux tables.

### Désactiver temporairement RLS (DÉVELOPPEMENT UNIQUEMENT)

⚠️ **ATTENTION** : Ne faites cela QUE pour le développement local, JAMAIS en production !

```sql
-- Désactiver RLS temporairement (pour tests uniquement)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;

-- Réactiver RLS après les tests
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
```

## Résumé des Migrations à Appliquer

1. ✅ **Migration 017** : `017_fix_restaurant_rls_406.sql` - Corrige les erreurs 406 pour restaurants
2. ✅ **Migration 019** : `019_add_users_insert_policy.sql` - Ajoute la politique INSERT pour users

## Notes Importantes

- Les migrations doivent être appliquées dans l'ordre
- Vérifiez toujours que les migrations ont été appliquées avec succès
- En cas de doute, vérifiez les politiques RLS avec les requêtes SQL ci-dessus
- Les erreurs 406 et 403 sont généralement liées aux politiques RLS
- Les politiques RLS sont essentielles pour la sécurité en production

## Support

Si les erreurs persistent après avoir appliqué les migrations :
1. Vérifiez les logs Supabase pour plus de détails
2. Vérifiez que `auth.uid()` retourne bien l'ID de l'utilisateur connecté
3. Vérifiez que les IDs dans les tables correspondent bien à ceux dans `auth.users`

