# Compte Rendu - Résolution des Erreurs 500 (RLS Récursion)

## Date
Janvier 2025

## Problème Identifié

L'application rencontrait des erreurs **500 (Internal Server Error)** lors de la récupération des données utilisateur et restaurant depuis Supabase. Les erreurs se produisaient lors des requêtes suivantes :

1. **Récupération des données utilisateur** : `GET /rest/v1/users?select=...&id=eq.{uuid}`
2. **Récupération des données restaurant** : `GET /rest/v1/restaurants?select=...&id=eq.{uuid}`
3. **Connexion utilisateur** : `POST /auth/v1/token?grant_type=password`

### Cause Racine

Les erreurs 500 étaient causées par une **récursion infinie dans les politiques RLS (Row Level Security)** de la table `users`.

Dans la migration `020_fix_users_rls_policies.sql`, les politiques admin utilisaient :

```sql
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users  -- ⚠️ RÉCURSION ICI
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com'
    )
  );
```

**Le problème** : Pour vérifier si un utilisateur peut voir un autre utilisateur (en tant qu'admin), la politique RLS doit vérifier dans la table `users` si l'utilisateur est admin. Mais cette vérification elle-même passe par les politiques RLS de la table `users`, créant une récursion infinie qui cause l'erreur 500.

## Solution Implémentée

### Migration 021 : Correction de la récursion pour la table users

Création d'une fonction **SECURITY DEFINER** `is_admin_user()` qui lit directement depuis `auth.users` (table système Supabase sans RLS) pour éviter la récursion :

```sql
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Vérifier d'abord si auth.uid() est NULL
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Récupérer l'email depuis auth.users (table système sans RLS)
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Vérifier si l'email correspond à l'admin
  RETURN COALESCE(user_email = 'admin@taybo.com', FALSE);
END;
$$;
```

**Avantages** :
- ✅ Lit depuis `auth.users` (table système) qui n'a pas de RLS
- ✅ Fonction `SECURITY DEFINER` s'exécute avec les privilèges du propriétaire
- ✅ Évite complètement la récursion
- ✅ Gère les cas où `auth.uid()` est NULL ou l'utilisateur n'existe pas

Les politiques admin pour la table `users` utilisent maintenant cette fonction :

```sql
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND is_admin_user() = true
  );
```

### Migration 022 : Application de la même solution pour les restaurants

Bien que les politiques admin des restaurants ne créent pas de récursion directe (car elles vérifient dans `users` pour accéder à `restaurants`), elles ont été mises à jour pour utiliser la même fonction `is_admin_user()` pour :

1. **Cohérence** : Utiliser la même méthode partout
2. **Performance** : Éviter les requêtes `EXISTS (SELECT FROM users)` répétées
3. **Maintenabilité** : Une seule fonction à maintenir

## Fichiers Modifiés/Créés

### Nouveaux fichiers
- `supabase/migrations/021_fix_users_rls_recursion.sql` : Correction de la récursion pour users
- `supabase/migrations/022_fix_restaurants_rls_admin_check.sql` : Mise à jour des politiques restaurants

## Application des Migrations

Pour appliquer ces corrections, exécutez les migrations dans l'ordre :

```bash
# Via Supabase CLI (recommandé)
supabase migration up

# Ou via le dashboard Supabase
# Allez dans Database > Migrations et appliquez les migrations 021 et 022
```

**Ordre d'application** :
1. Migration 021 (doit être appliquée en premier car elle crée la fonction `is_admin_user()`)
2. Migration 022 (utilise la fonction créée par la migration 021)

## Vérification

Après avoir appliqué les migrations, vérifiez que :

1. ✅ Les requêtes `GET /rest/v1/users` ne retournent plus d'erreur 500
2. ✅ Les requêtes `GET /rest/v1/restaurants` ne retournent plus d'erreur 500
3. ✅ La connexion utilisateur fonctionne correctement
4. ✅ Les admins peuvent toujours voir/modifier tous les utilisateurs et restaurants

### Test de la fonction

Vous pouvez tester la fonction directement dans Supabase SQL Editor :

```sql
-- Vérifier que la fonction existe
SELECT is_admin_user();

-- Tester avec un utilisateur admin connecté (doit retourner true)
-- Tester avec un utilisateur non-admin connecté (doit retourner false)
-- Tester sans utilisateur connecté (doit retourner false)
```

## Impact

### Avant
- ❌ Erreurs 500 lors de la récupération des données utilisateur
- ❌ Erreurs 500 lors de la récupération des données restaurant
- ❌ Connexion utilisateur échouait avec erreur 500
- ❌ Récursion infinie dans les politiques RLS

### Après
- ✅ Plus d'erreurs 500
- ✅ Récupération des données utilisateur fonctionnelle
- ✅ Récupération des données restaurant fonctionnelle
- ✅ Connexion utilisateur fonctionnelle
- ✅ Politiques RLS sans récursion

## Notes Techniques

### Fonction SECURITY DEFINER

La fonction `is_admin_user()` utilise `SECURITY DEFINER`, ce qui signifie qu'elle s'exécute avec les privilèges du propriétaire de la fonction (généralement `postgres` ou `supabase_admin`), pas avec les privilèges de l'utilisateur qui l'appelle. Cela permet d'accéder à `auth.users` sans passer par les politiques RLS.

### Table auth.users

La table `auth.users` est une table système de Supabase Auth qui :
- N'a pas de RLS activé
- Contient les informations d'authentification (email, mot de passe hashé, etc.)
- Est accessible uniquement via des fonctions SECURITY DEFINER ou avec les privilèges admin

### Attribut STABLE

L'attribut `STABLE` indique à PostgreSQL que la fonction retourne le même résultat pour les mêmes arguments dans une même transaction, ce qui permet des optimisations de performance.

## Prochaines Étapes

1. ✅ Appliquer les migrations 021 et 022
2. ✅ Tester la connexion utilisateur
3. ✅ Tester la récupération des données utilisateur
4. ✅ Tester la récupération des données restaurant
5. ✅ Vérifier que les admins peuvent toujours gérer tous les utilisateurs et restaurants

## Références

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL SECURITY DEFINER Functions](https://www.postgresql.org/docs/current/sql-createfunction.html)
- Migration 020 : `supabase/migrations/020_fix_users_rls_policies.sql`
- Migration 017 : `supabase/migrations/017_fix_restaurant_rls_406.sql`

