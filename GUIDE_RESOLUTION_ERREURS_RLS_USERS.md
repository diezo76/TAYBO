# Guide de Résolution - Erreurs RLS pour la Table Users (403, 406)

## Problèmes Identifiés

### Erreur 403 (Forbidden) - INSERT
```
Erreur création entrée users, mais auth réussi: Object
code: "42501"
message: "new row violates row-level security policy for table \"users\""
```

**Cause :** La politique RLS INSERT empêche l'insertion dans la table `users` lors de l'inscription.

### Erreur 406 (Not Acceptable) - SELECT
```
Failed to load resource: the server responded with a status of 406 ()
/rest/v1/users?select=...
```

**Cause :** La politique RLS SELECT empêche la récupération des données utilisateur après la connexion.

## Solutions Implémentées

### 1. Migration 020 : Correction des Politiques RLS

**Fichier :** `supabase/migrations/020_fix_users_rls_policies.sql`

Cette migration corrige les politiques RLS pour la table `users` :

- ✅ **Politique SELECT** : Permet aux utilisateurs authentifiés de voir leur propre profil
- ✅ **Politique INSERT** : Permet aux utilisateurs de créer leur propre entrée lors de l'inscription
- ✅ **Politique UPDATE** : Permet aux utilisateurs de modifier leur propre profil
- ✅ **Politiques Admin** : Permet aux admins de voir et modifier tous les utilisateurs

### 2. Amélioration du Code d'Inscription

**Fichier modifié :** `src/services/authService.js`

**Fonction améliorée :** `signUpClient(userData)`

**Améliorations :**
- ✅ Vérification que la session est disponible avant l'insertion
- ✅ Gestion du cas où l'email n'est pas confirmé (pas de session)
- ✅ Meilleure gestion des erreurs RLS (code 42501)
- ✅ Logs détaillés pour le débogage

## Application de la Migration

### Étape 1 : Appliquer la Migration

1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **SQL Editor**
3. Créez une nouvelle requête
4. Copiez le contenu de `supabase/migrations/020_fix_users_rls_policies.sql`
5. Exécutez la requête

### Étape 2 : Vérifier les Politiques RLS

Exécutez cette requête pour vérifier que les politiques sont créées :

```sql
-- Vérifier les politiques RLS pour la table users
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

Vous devriez voir les politiques suivantes :
- `Users can view own profile` (SELECT)
- `Users can insert own profile` (INSERT)
- `Users can update own profile` (UPDATE)
- `Admins can view all users` (SELECT)
- `Admins can update all users` (UPDATE)

### Étape 3 : Tester l'Inscription

1. Allez sur `/client/signup`
2. Créez un nouveau compte
3. Vérifiez dans la console du navigateur :
   - Si la session est disponible, l'insertion devrait réussir
   - Si l'email n'est pas confirmé, un message approprié sera affiché
   - Les logs détaillés aideront à identifier les problèmes

### Étape 4 : Tester la Connexion

1. Allez sur `/client/login`
2. Connectez-vous avec un compte existant
3. Vérifiez que les données utilisateur sont récupérées sans erreur 406

## Causes Possibles des Erreurs

### Erreur 403 (INSERT)

1. **Session non disponible** : Si la confirmation d'email est activée, `signUp` ne retourne pas de session
   - **Solution** : Désactiver la confirmation d'email en développement ou attendre la confirmation

2. **Politique RLS manquante ou incorrecte** : La politique INSERT n'existe pas ou ne correspond pas
   - **Solution** : Appliquer la migration 020

3. **auth.uid() ne correspond pas à l'ID** : Problème de comparaison des UUIDs
   - **Solution** : La migration 020 utilise `auth.uid()::text = id::text` pour éviter ce problème

### Erreur 406 (SELECT)

1. **Politique RLS trop restrictive** : La politique SELECT ne permet pas la récupération
   - **Solution** : Appliquer la migration 020 qui corrige la politique SELECT

2. **Session expirée ou invalide** : La session n'est plus valide
   - **Solution** : Se reconnecter

3. **Colonnes non autorisées** : La requête SELECT essaie de récupérer des colonnes non autorisées
   - **Solution** : Vérifier que les colonnes demandées existent et sont autorisées

## Vérification de l'État RLS

### Vérifier si RLS est activé

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'users';
```

`rowsecurity` doit être `true`.

### Vérifier les politiques existantes

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';
```

### Tester manuellement une insertion

```sql
-- Se connecter en tant qu'utilisateur test
-- Puis essayer d'insérer (remplacer l'ID par votre ID utilisateur)
INSERT INTO users (id, email, password_hash, first_name, last_name, language)
VALUES (
  auth.uid(),
  'test@example.com',
  'hashed_by_supabase_auth',
  'Test',
  'User',
  'fr'
);
```

## Désactiver Temporairement RLS (DÉVELOPPEMENT UNIQUEMENT)

⚠️ **ATTENTION** : Ne faites cela QUE pour le développement et les tests. Réactivez RLS immédiatement après.

```sql
-- Désactiver RLS temporairement
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Faire vos tests...

-- Réactiver RLS après les tests
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## Logs et Débogage

Le code amélioré inclut des logs détaillés :

- `[signUpClient] Session disponible, insertion dans users...` : La session est disponible
- `[signUpClient] Pas de session (email non confirmé), insertion différée` : Pas de session, insertion différée
- `[signUpClient] Erreur RLS lors de l'insertion (42501)` : Erreur RLS détectée

Ouvrez la console du navigateur (F12) pour voir ces logs lors de l'inscription.

## Notes Importantes

1. **Confirmation d'Email** : Si la confirmation d'email est activée, l'utilisateur doit confirmer son email avant de pouvoir se connecter. L'entrée dans la table `users` sera créée lors de la première connexion.

2. **Session Requise** : Les politiques RLS nécessitent une session valide. Assurez-vous que la session est établie avant d'essayer d'insérer ou de sélectionner des données.

3. **Cohérence** : Les politiques RLS doivent être cohérentes entre elles. La migration 020 supprime les anciennes politiques pour éviter les conflits.

4. **Sécurité** : Les politiques RLS sont essentielles pour la sécurité en production. Ne les désactivez que temporairement pour les tests.

## Support

Si le problème persiste après avoir appliqué la migration 020 :

1. Vérifiez les logs dans la console du navigateur
2. Vérifiez les politiques RLS avec les requêtes SQL ci-dessus
3. Vérifiez que la session est bien établie après `signUp`
4. Vérifiez que l'ID utilisateur correspond bien à `auth.uid()`

## Fichiers Modifiés

1. `supabase/migrations/020_fix_users_rls_policies.sql` - Migration créée
2. `src/services/authService.js` - Code d'inscription amélioré
3. `GUIDE_RESOLUTION_ERREURS_RLS_USERS.md` - Ce guide

