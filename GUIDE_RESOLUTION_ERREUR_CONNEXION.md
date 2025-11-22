# Guide de Résolution - Erreur "Invalid login credentials"

## Problème

Lors de la tentative de connexion, vous recevez l'erreur :
```
AuthApiError: Invalid login credentials
```

## Causes Possibles

### 1. Compte non créé
- Vous essayez de vous connecter avec un compte qui n'existe pas encore
- **Solution** : Créez d'abord un compte via la page d'inscription (`/client/signup`)

### 2. Email non confirmé
- Vous vous êtes inscrit mais n'avez pas confirmé votre email
- Par défaut, Supabase Auth nécessite la confirmation d'email avant de pouvoir se connecter
- **Solution** : Vérifiez votre boîte de réception et cliquez sur le lien de confirmation

### 3. Mot de passe incorrect
- Le mot de passe saisi ne correspond pas au compte
- **Solution** : Vérifiez votre mot de passe ou utilisez la fonction "Mot de passe oublié" si disponible

### 4. Configuration Supabase - Confirmation d'email désactivée en développement

Pour le développement local, vous pouvez désactiver la confirmation d'email dans Supabase :

1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **Authentication** > **Settings**
3. Dans la section **Email Auth**, désactivez **"Enable email confirmations"**
4. Sauvegardez les changements

⚠️ **Important** : Ne faites cela QUE pour le développement. En production, gardez la confirmation d'email activée pour la sécurité.

## Solutions Implémentées

### Messages d'erreur améliorés

J'ai amélioré les messages d'erreur dans `authService.js` pour être plus explicites :

- **"Invalid login credentials"** → Message plus détaillé expliquant les causes possibles
- **"Email not confirmed"** → Message spécifique pour la confirmation d'email
- **"User not found"** → Message suggérant de vérifier l'email ou de s'inscrire

### Création automatique de l'entrée users

Si un utilisateur existe dans Supabase Auth mais pas dans la table `users`, le système créera automatiquement l'entrée lors de la connexion.

## Tests Recommandés

### Test 1 : Créer un nouveau compte
1. Allez sur `/client/signup`
2. Créez un nouveau compte avec un email valide
3. Si la confirmation d'email est activée, vérifiez votre boîte de réception
4. Confirmez votre email
5. Essayez de vous connecter

### Test 2 : Connexion avec compte existant
1. Allez sur `/client/login`
2. Entrez l'email et le mot de passe d'un compte existant
3. Vérifiez que la connexion fonctionne

### Test 3 : Vérifier les comptes dans Supabase
1. Allez sur votre projet Supabase
2. Naviguez vers **Authentication** > **Users**
3. Vérifiez que votre compte existe et que l'email est confirmé (colonne "Email Confirmed")

## Comptes de Test

Si vous avez créé des comptes de test via SQL, assurez-vous que :

1. Le compte existe dans Supabase Auth (table `auth.users`)
2. Le compte existe dans votre table `users`
3. L'email est confirmé dans Supabase Auth
4. Le mot de passe correspond

### Créer un compte de test via SQL

⚠️ **Note** : Créer un compte directement en SQL ne crée pas automatiquement l'entrée dans Supabase Auth. Vous devez utiliser l'interface d'inscription ou créer le compte via Supabase Auth.

Pour créer un compte de test complet :

```sql
-- 1. Créer l'utilisateur dans Supabase Auth (via l'interface Supabase ou l'API)
-- 2. Ensuite, créer l'entrée dans la table users avec le même ID

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, language)
VALUES (
  'uuid-du-compte-auth', -- Remplacer par l'ID du compte créé dans Auth
  'test@example.com',
  'hashed_by_supabase_auth',
  'Test',
  'User',
  NULL,
  'fr'
);
```

## Dépannage

### Vérifier si le compte existe dans Supabase Auth

1. Allez sur Supabase Dashboard
2. **Authentication** > **Users**
3. Recherchez votre email
4. Vérifiez la colonne "Email Confirmed"

### Vérifier si le compte existe dans la table users

Exécutez cette requête dans l'éditeur SQL de Supabase :

```sql
SELECT id, email, first_name, last_name, created_at
FROM users
WHERE email = 'votre@email.com';
```

### Réinitialiser le mot de passe

Si vous avez oublié votre mot de passe :

1. Allez sur `/client/login`
2. Cliquez sur "Mot de passe oublié" (si disponible)
3. Ou utilisez l'interface Supabase pour réinitialiser le mot de passe

## Notes Importantes

- Les mots de passe sont hashés par Supabase Auth, vous ne pouvez pas les voir en clair
- La confirmation d'email est importante pour la sécurité en production
- En développement, vous pouvez désactiver la confirmation d'email pour faciliter les tests
- Les messages d'erreur sont maintenant plus explicites pour aider au débogage

