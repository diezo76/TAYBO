# Compte Rendu - Résolution Erreur 400 sur l'Authentification Supabase

## Date
Novembre 2025

## Problème Identifié

L'utilisateur rencontrait une erreur **400 (Bad Request)** lors de la tentative de connexion à Supabase Auth :
```
Failed to load resource: the server responded with a status of 400 ()
ocxesczzlzopbcobppok.supabase.co/auth/v1/token?grant_type=password
```

Cette erreur peut avoir plusieurs causes :
- Email ou mot de passe invalide
- Email non confirmé
- Format d'email invalide
- Mot de passe vide ou invalide
- Configuration Supabase manquante ou incorrecte
- Compte n'existe pas
- Problème avec le flow PKCE

## Modifications Effectuées

### 1. Amélioration de `authService.js`

**Fichier modifié :** `src/services/authService.js`

**Fonction améliorée :** `loginClient(email, password)`

**Améliorations apportées :**
- ✅ Validation des données avant l'envoi à Supabase
  - Vérification que l'email n'est pas vide et est une chaîne valide
  - Vérification que le mot de passe n'est pas vide et est une chaîne valide
  - Normalisation de l'email (trim + lowercase)
- ✅ Vérification de la configuration Supabase
  - Vérification que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont définies
  - Message d'erreur clair si la configuration est manquante
- ✅ Logging détaillé
  - Logs pour chaque tentative de connexion avec l'email utilisé
  - Logs de l'URL Supabase utilisée
  - Logs d'erreur détaillés avec status, message, name, etc.
- ✅ Gestion améliorée des erreurs 400
  - Messages d'erreur spécifiques selon le type d'erreur
  - Gestion des cas : "Invalid login credentials", "Email not confirmed", "User not found", "Invalid email", "Password"
  - Retour de `errorDetails` avec status et message pour le débogage

**Code ajouté :**
```javascript
// Validation des données avant l'envoi
if (!email || typeof email !== 'string' || email.trim() === '') {
  console.error('[loginClient] Email invalide:', email);
  return {
    success: false,
    error: 'L\'email est requis et doit être valide',
  };
}

if (!password || typeof password !== 'string' || password.trim() === '') {
  console.error('[loginClient] Mot de passe invalide');
  return {
    success: false,
    error: 'Le mot de passe est requis',
  };
}

// Vérifier la configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[loginClient] Configuration Supabase manquante');
  return {
    success: false,
    error: 'Configuration Supabase manquante. Vérifiez les variables d\'environnement.',
  };
}

// Normaliser l'email (trim et lowercase)
const normalizedEmail = email.trim().toLowerCase();

console.log('[loginClient] Tentative de connexion pour:', normalizedEmail);
console.log('[loginClient] URL Supabase:', supabaseUrl);

// Utiliser Supabase Auth pour la connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: normalizedEmail,
  password: password.trim(),
});

if (error) {
  // Log détaillé de l'erreur pour le débogage
  console.error('[loginClient] Erreur Supabase Auth:', {
    message: error.message,
    status: error.status,
    statusCode: error.statusCode,
    name: error.name,
    error: error,
  });

  // Gérer spécifiquement les erreurs 400
  // ... gestion détaillée des erreurs ...
}
```

### 2. Amélioration de `adminAuthService.js`

**Fichier modifié :** `src/services/adminAuthService.js`

**Fonction améliorée :** `loginAdmin(email, password)`

**Améliorations apportées :**
- ✅ Même validation des données que pour `loginClient`
- ✅ Normalisation de l'email avant vérification de l'email admin
- ✅ Vérification de la configuration Supabase
- ✅ Logging détaillé
- ✅ Gestion améliorée des erreurs 400 avec messages spécifiques

**Code ajouté :**
```javascript
// Validation des données avant l'envoi
if (!email || typeof email !== 'string' || email.trim() === '') {
  console.error('[loginAdmin] Email invalide:', email);
  return {
    success: false,
    error: 'L\'email est requis et doit être valide',
  };
}

if (!password || typeof password !== 'string' || password.trim() === '') {
  console.error('[loginAdmin] Mot de passe invalide');
  return {
    success: false,
    error: 'Le mot de passe est requis',
  };
}

// Normaliser l'email
const normalizedEmail = email.trim().toLowerCase();

// Vérifier que l'email est celui d'un admin
if (normalizedEmail !== ADMIN_EMAIL) {
  return {
    success: false,
    error: 'Accès refusé. Email non autorisé.',
  };
}

// Vérifier la configuration Supabase
// ... même logique que loginClient ...
```

### 3. Amélioration de `restaurantAuthService.js`

**Fichier modifié :** `src/services/restaurantAuthService.js`

**Fonction améliorée :** `loginRestaurant(email, password)`

**Améliorations apportées :**
- ✅ Même validation des données que pour `loginClient`
- ✅ Normalisation de l'email
- ✅ Vérification de la configuration Supabase
- ✅ Logging détaillé
- ✅ Gestion améliorée des erreurs 400 avec messages spécifiques

**Code ajouté :**
```javascript
// Validation des données avant l'envoi
if (!email || typeof email !== 'string' || email.trim() === '') {
  console.error('[loginRestaurant] Email invalide:', email);
  return {
    success: false,
    error: 'L\'email est requis et doit être valide',
  };
}

if (!password || typeof password !== 'string' || password.trim() === '') {
  console.error('[loginRestaurant] Mot de passe invalide');
  return {
    success: false,
    error: 'Le mot de passe est requis',
  };
}

// Vérifier la configuration Supabase
// ... même logique que loginClient ...
```

### 4. Création du Guide de Résolution

**Fichier créé :** `GUIDE_RESOLUTION_ERREUR_400_AUTH.md`

**Contenu :**
- ✅ Description du problème
- ✅ Liste complète des causes possibles avec solutions détaillées
- ✅ Instructions pour désactiver la confirmation d'email en développement
- ✅ Guide de débogage avec étapes détaillées
- ✅ Tests recommandés
- ✅ Explication des messages d'erreur améliorés
- ✅ Notes importantes

## Bénéfices des Modifications

### 1. Meilleure Expérience Utilisateur

- Messages d'erreur clairs et en français
- Messages spécifiques selon le type d'erreur
- Guidance pour résoudre le problème

### 2. Facilitation du Débogage

- Logs détaillés dans la console du navigateur
- Informations complètes sur les erreurs (status, message, etc.)
- Identification rapide des problèmes de configuration

### 3. Prévention des Erreurs

- Validation des données avant l'envoi à Supabase
- Normalisation automatique de l'email (trim + lowercase)
- Vérification de la configuration avant la connexion

### 4. Maintenabilité

- Code cohérent entre les trois services d'authentification
- Logs structurés avec préfixes (`[loginClient]`, `[loginAdmin]`, `[loginRestaurant]`)
- Documentation complète dans le guide de résolution

## Fichiers Modifiés

1. `src/services/authService.js` - Fonction `loginClient` améliorée
2. `src/services/adminAuthService.js` - Fonction `loginAdmin` améliorée
3. `src/services/restaurantAuthService.js` - Fonction `loginRestaurant` améliorée
4. `GUIDE_RESOLUTION_ERREUR_400_AUTH.md` - Guide de résolution créé
5. `COMPTE_RENDU_RESOLUTION_ERREUR_400_AUTH.md` - Ce compte rendu

## Tests Effectués

- ✅ Validation des modifications avec `read_lints` - Aucune erreur de lint
- ✅ Vérification de la cohérence du code entre les trois services
- ✅ Vérification que tous les cas d'erreur sont gérés

## Prochaines Étapes Recommandées

1. **Tester la connexion** avec différents scénarios :
   - Email valide avec mot de passe correct
   - Email valide avec mot de passe incorrect
   - Email non confirmé
   - Email invalide
   - Mot de passe vide
   - Configuration Supabase manquante

2. **Vérifier les logs** dans la console du navigateur lors des tentatives de connexion

3. **Tester avec un compte existant** pour vérifier que les améliorations fonctionnent correctement

4. **Tester avec un nouveau compte** pour vérifier le processus complet d'inscription et de connexion

## Notes pour le Prochain Agent

- Les trois services d'authentification (`authService.js`, `adminAuthService.js`, `restaurantAuthService.js`) ont été améliorés de manière cohérente
- Tous les services utilisent maintenant la même logique de validation et de gestion d'erreurs
- Les logs sont préfixés avec le nom de la fonction pour faciliter le débogage
- Le guide de résolution (`GUIDE_RESOLUTION_ERREUR_400_AUTH.md`) contient toutes les informations nécessaires pour résoudre les problèmes d'authentification
- Les messages d'erreur sont maintenant en français et plus explicites
- La normalisation de l'email (trim + lowercase) est appliquée automatiquement avant l'envoi à Supabase

## Conclusion

Les modifications apportées améliorent significativement la gestion des erreurs d'authentification, facilitent le débogage et offrent une meilleure expérience utilisateur. Les logs détaillés permettront d'identifier rapidement la cause des erreurs 400 lors des tentatives de connexion.

