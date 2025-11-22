# Guide de Résolution - Erreur 400 sur `/auth/v1/token?grant_type=password`

## Problème

Lors de la tentative de connexion, vous recevez une erreur **400 (Bad Request)** sur l'endpoint Supabase Auth :
```
Failed to load resource: the server responded with a status of 400 ()
ocxesczzlzopbcobppok.supabase.co/auth/v1/token?grant_type=password
```

## Causes Possibles et Solutions

### 1. Email ou Mot de Passe Invalide

**Symptômes :**
- Erreur 400 avec message "Invalid login credentials" ou "invalid_grant"
- Les identifiants semblent corrects mais la connexion échoue

**Solutions :**
- ✅ Vérifiez que l'email et le mot de passe sont corrects (attention aux majuscules/minuscules)
- ✅ Assurez-vous qu'il n'y a pas d'espaces avant/après l'email ou le mot de passe
- ✅ Vérifiez que le compte existe dans Supabase Auth
- ✅ Si vous venez de créer le compte, vérifiez que l'email est confirmé

**Vérification dans Supabase :**
1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **Authentication** > **Users**
3. Recherchez votre email
4. Vérifiez la colonne "Email Confirmed" (doit être ✅)

### 2. Email Non Confirmé

**Symptômes :**
- Erreur 400 avec message "Email not confirmed" ou "email_not_confirmed"
- Vous venez de vous inscrire mais n'avez pas confirmé votre email

**Solutions :**
- ✅ Vérifiez votre boîte de réception (et les spams) pour le lien de confirmation
- ✅ Cliquez sur le lien de confirmation dans l'email
- ✅ En développement, vous pouvez désactiver la confirmation d'email (voir ci-dessous)

**Désactiver la confirmation d'email en développement :**
1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **Authentication** > **Settings**
3. Dans la section **Email Auth**, désactivez **"Enable email confirmations"**
4. Sauvegardez les changements

⚠️ **Important** : Ne faites cela QUE pour le développement. En production, gardez la confirmation d'email activée pour la sécurité.

### 3. Format d'Email Invalide

**Symptômes :**
- Erreur 400 avec message "Invalid email" ou "invalid_email"
- L'email ne respecte pas le format standard

**Solutions :**
- ✅ Vérifiez que l'email est au format valide (exemple@domaine.com)
- ✅ Assurez-vous qu'il n'y a pas d'espaces ou de caractères invalides
- ✅ Vérifiez que l'email n'est pas vide

### 4. Mot de Passe Vide ou Invalide

**Symptômes :**
- Erreur 400 avec message mentionnant "Password"
- Le mot de passe n'est pas fourni ou est invalide

**Solutions :**
- ✅ Vérifiez que le mot de passe n'est pas vide
- ✅ Assurez-vous que le mot de passe respecte les exigences de Supabase (minimum 6 caractères)
- ✅ Vérifiez qu'il n'y a pas d'espaces avant/après le mot de passe

### 5. Configuration Supabase Manquante ou Incorrecte

**Symptômes :**
- Erreur 400 ou erreur de configuration
- Les variables d'environnement ne sont pas définies

**Solutions :**
- ✅ Vérifiez que le fichier `.env` existe à la racine du projet
- ✅ Vérifiez que les variables suivantes sont définies :
  ```env
  VITE_SUPABASE_URL=https://ocxesczzlzopbcobppok.supabase.co
  VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
  ```
- ✅ Vérifiez que l'URL Supabase est correcte (sans slash à la fin)
- ✅ Vérifiez que la clé API anon est correcte

**Où trouver ces informations :**
1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **Settings** > **API**
3. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** > **anon public** → `VITE_SUPABASE_ANON_KEY`

### 6. Compte N'Existe Pas

**Symptômes :**
- Erreur 400 avec message "User not found" ou "user_not_found"
- Vous essayez de vous connecter avec un compte qui n'existe pas

**Solutions :**
- ✅ Créez d'abord un compte via la page d'inscription (`/client/signup`, `/restaurant/signup`, ou `/admin/signup`)
- ✅ Vérifiez que le compte existe dans Supabase Auth (voir section 1)

### 7. Problème avec PKCE Flow

**Symptômes :**
- Erreur 400 inexpliquée
- La configuration Supabase utilise PKCE (défaut)

**Solutions :**
- ✅ Vérifiez que la configuration dans `src/services/supabase.js` utilise bien `flowType: 'pkce'`
- ✅ Vérifiez que le navigateur supporte les fonctionnalités modernes (localStorage, etc.)
- ✅ Essayez de vider le cache et les cookies du navigateur

## Améliorations Implémentées

### Validation des Données

Les services d'authentification (`authService.js`, `adminAuthService.js`, `restaurantAuthService.js`) ont été améliorés pour :

1. **Valider les données avant l'envoi** :
   - Vérifier que l'email n'est pas vide et est une chaîne valide
   - Vérifier que le mot de passe n'est pas vide et est une chaîne valide
   - Normaliser l'email (trim + lowercase)

2. **Vérifier la configuration Supabase** :
   - Vérifier que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont définies
   - Retourner un message d'erreur clair si la configuration est manquante

3. **Améliorer le logging** :
   - Logs détaillés pour chaque tentative de connexion
   - Logs d'erreur avec tous les détails (status, message, etc.)
   - Facilite le débogage

4. **Messages d'erreur améliorés** :
   - Messages spécifiques selon le type d'erreur 400
   - Messages en français pour une meilleure compréhension
   - Détails supplémentaires dans `errorDetails` pour le débogage

## Comment Déboguer

### 1. Ouvrir la Console du Navigateur

1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet **Console**
3. Essayez de vous connecter
4. Regardez les logs qui commencent par `[loginClient]`, `[loginAdmin]`, ou `[loginRestaurant]`

### 2. Vérifier les Logs

Les logs vous indiqueront :
- L'email utilisé pour la connexion
- L'URL Supabase utilisée
- Les détails de l'erreur (status, message, etc.)

### 3. Vérifier dans Supabase Dashboard

1. Allez sur votre projet Supabase
2. Naviguez vers **Authentication** > **Users**
3. Vérifiez :
   - Que le compte existe
   - Que l'email est confirmé (colonne "Email Confirmed")
   - La date de création du compte

### 4. Tester avec un Nouveau Compte

1. Créez un nouveau compte via la page d'inscription
2. Si la confirmation d'email est activée, confirmez votre email
3. Essayez de vous connecter avec ce nouveau compte
4. Si ça fonctionne, le problème vient de l'ancien compte

## Tests Recommandés

### Test 1 : Vérifier la Configuration

```bash
# Vérifiez que le fichier .env existe
cat .env

# Vérifiez que les variables sont définies
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Test 2 : Créer un Nouveau Compte

1. Allez sur `/client/signup` (ou `/restaurant/signup`, `/admin/signup`)
2. Créez un nouveau compte avec un email valide
3. Si la confirmation d'email est activée, vérifiez votre boîte de réception
4. Confirmez votre email
5. Essayez de vous connecter

### Test 3 : Vérifier les Comptes dans Supabase

1. Allez sur votre projet Supabase
2. Naviguez vers **Authentication** > **Users**
3. Vérifiez que votre compte existe et que l'email est confirmé

### Test 4 : Tester la Connexion avec les Logs

1. Ouvrez la console du navigateur
2. Essayez de vous connecter
3. Regardez les logs détaillés dans la console
4. Notez le message d'erreur exact et le status code

## Messages d'Erreur Améliorés

Les messages d'erreur sont maintenant plus explicites :

- **"Invalid login credentials"** → "Email ou mot de passe incorrect. Vérifiez vos identifiants ou confirmez votre email si vous venez de vous inscrire."
- **"Email not confirmed"** → "Votre email n'a pas été confirmé. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation."
- **"User not found"** → "Aucun compte trouvé avec cet email. Vérifiez votre email ou inscrivez-vous."
- **"Invalid email"** → "Format d'email invalide. Veuillez vérifier votre adresse email."
- **"Password"** → "Le mot de passe est requis et doit être valide."

## Notes Importantes

- Les mots de passe sont hashés par Supabase Auth, vous ne pouvez pas les voir en clair
- La confirmation d'email est importante pour la sécurité en production
- En développement, vous pouvez désactiver la confirmation d'email pour faciliter les tests
- Les logs détaillés sont maintenant disponibles dans la console pour faciliter le débogage
- Les données sont normalisées (email en lowercase, trim des espaces) avant l'envoi à Supabase

## Support

Si le problème persiste après avoir essayé toutes ces solutions :

1. Vérifiez les logs dans la console du navigateur
2. Vérifiez les logs dans Supabase Dashboard > **Logs** > **API**
3. Vérifiez que votre projet Supabase est actif et non suspendu
4. Contactez le support Supabase si nécessaire

