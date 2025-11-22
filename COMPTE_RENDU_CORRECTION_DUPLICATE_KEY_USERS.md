# Compte Rendu - Correction de l'Erreur "Duplicate Key" lors de la Connexion

## Date
Janvier 2025

## Problème Identifié

Lors de la tentative de connexion sur le profil client, l'application générait l'erreur suivante :

```
duplicate key value violates unique constraint "users_email_key"
```

Cette erreur se produisait lorsque :
1. Un utilisateur existait dans Supabase Auth (`auth.users`)
2. L'utilisateur n'existait pas dans la table `users` avec le même ID
3. Le code tentait de créer une entrée dans `users` avec l'ID de `auth.users`
4. Mais l'email existait déjà dans `users` avec un ID différent

## Cause Racine

Dans la fonction `loginClient` de `authService.js`, le code gérait le cas où l'utilisateur existe dans Auth mais pas dans `users` en tentant directement une insertion. Cependant, il ne vérifiait pas si l'email existait déjà avec un ID différent, ce qui pouvait causer une violation de contrainte unique sur l'email.

**Scénario problématique** :
1. Utilisateur créé dans `auth.users` avec ID `abc-123` et email `user@example.com`
2. Entrée créée dans `users` avec ID `xyz-789` et email `user@example.com` (données incohérentes)
3. Lors de la connexion, le code trouve l'utilisateur dans Auth avec ID `abc-123`
4. Le code ne trouve pas d'entrée dans `users` avec ID `abc-123`
5. Le code tente d'insérer une nouvelle entrée avec ID `abc-123` et email `user@example.com`
6. ❌ Erreur : l'email existe déjà avec un ID différent

## Solution Implémentée

### Amélioration de la Fonction `loginClient`

Modification de la fonction pour :

1. **Vérifier l'existence par email avant insertion** : Avant d'insérer un nouvel utilisateur, vérifier si l'email existe déjà dans `users`
2. **Gérer le cas de données incohérentes** : Si l'email existe avec un ID différent, utiliser l'entrée existante au lieu d'essayer d'insérer
3. **Gérer l'erreur duplicate key** : Si l'insertion échoue avec une erreur duplicate key, récupérer l'utilisateur existant au lieu de lever une erreur

### Code Modifié

```javascript
if (userError.code === 'PGRST116') { // Not found
  // Vérifier si l'email existe déjà avec un ID différent
  const { data: existingUserByEmail } = await supabase
    .from('users')
    .select('...')
    .eq('email', data.user.email)
    .single();

  if (existingUserByEmail) {
    // Utiliser l'entrée existante
    return { success: true, user: existingUserByEmail, session: data.session };
  }

  // Créer l'entrée seulement si l'email n'existe pas
  const { data: newUserData, error: createError } = await supabase
    .from('users')
    .insert([...])
    .select()
    .single();

  if (createError && createError.code === '23505') {
    // Duplicate key - récupérer l'utilisateur existant
    const { data: existingUser } = await supabase
      .from('users')
      .select('...')
      .eq('email', data.user.email)
      .single();
    
    if (existingUser) {
      return { success: true, user: existingUser, session: data.session };
    }
  }
}
```

## Fichiers Modifiés/Créés

### Fichiers modifiés
- `src/services/authService.js` : Amélioration de la gestion des erreurs duplicate key dans `loginClient`

### Nouveaux fichiers
- `scripts/fix_duplicate_users.sql` : Script SQL pour identifier et corriger les données incohérentes

## Diagnostic et Correction

### Étape 1 : Identifier les Données Incohérentes

Exécutez le script de diagnostic dans Supabase SQL Editor :

```sql
-- Identifier les emails en double dans public.users
SELECT 
  email,
  COUNT(*) as count,
  array_agg(id::text) as ids
FROM public.users
GROUP BY email
HAVING COUNT(*) > 1;

-- Identifier les cas où l'ID dans auth.users ne correspond pas à public.users
SELECT 
  au.id as auth_id,
  au.email,
  pu.id as public_users_id
FROM auth.users au
INNER JOIN public.users pu ON au.email = pu.email
WHERE au.id::text != pu.id::text;
```

### Étape 2 : Corriger les Données (si nécessaire)

Si vous trouvez des données incohérentes, vous pouvez les corriger avec :

```sql
-- Option 1 : Mettre à jour l'ID dans public.users pour correspondre à auth.users
UPDATE public.users pu
SET id = au.id::uuid
FROM auth.users au
WHERE au.email = pu.email
  AND au.id::text != pu.id::text
  AND NOT EXISTS (
    SELECT 1 FROM public.users pu2 
    WHERE pu2.id::text = au.id::text
  );

-- Option 2 : Supprimer les doublons en gardant celui qui correspond à auth.users
-- (Voir le script complet pour la requête complète)
```

**⚠️ Attention** : Ces opérations modifient les données. Faites une sauvegarde avant de les exécuter.

### Étape 3 : Vérifier l'État Final

```sql
-- Vérifier qu'il n'y a plus de doublons
SELECT 
  COUNT(*) as total_users,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(*) - COUNT(DISTINCT email) as duplicates
FROM public.users;
```

## Impact

### Avant
- ❌ Erreur "duplicate key value violates unique constraint" lors de la connexion
- ❌ Connexion impossible pour certains utilisateurs
- ❌ Données incohérentes entre `auth.users` et `public.users`

### Après
- ✅ Gestion robuste des cas de données incohérentes
- ✅ Connexion fonctionnelle même en cas de données incohérentes
- ✅ Récupération automatique de l'utilisateur existant si l'email existe déjà
- ✅ Messages d'erreur plus clairs dans les logs

## Prévention

Pour éviter ce problème à l'avenir :

1. **Synchronisation ID** : S'assurer que l'ID dans `public.users` correspond toujours à l'ID dans `auth.users`
2. **Contrainte unique** : La contrainte unique sur l'email est correcte et doit être maintenue
3. **Validation avant insertion** : Toujours vérifier l'existence par email avant d'insérer
4. **Gestion des erreurs** : Gérer les erreurs duplicate key de manière gracieuse

## Notes Techniques

### Code d'Erreur PostgreSQL

- `23505` : Violation de contrainte unique (duplicate key)
- `PGRST116` : Aucune ligne trouvée (PostgREST)

### Stratégie de Gestion

La nouvelle stratégie utilise une approche défensive :
1. Vérifier l'existence avant insertion
2. Gérer les erreurs duplicate key
3. Récupérer l'utilisateur existant si nécessaire
4. Ne jamais bloquer la connexion si l'utilisateur existe dans Auth

### Cas de Données Incohérentes

Les données incohérentes peuvent survenir si :
- Un utilisateur a été créé manuellement dans `users` avec un ID différent
- Une migration a modifié les IDs
- Un script a créé des entrées avec des IDs incorrects

La solution actuelle gère ces cas de manière gracieuse en utilisant l'entrée existante.

## Références

- Service d'authentification : `src/services/authService.js`
- Script de diagnostic : `scripts/fix_duplicate_users.sql`
- Migration création table users : `supabase/migrations/001_create_users_table.sql`

