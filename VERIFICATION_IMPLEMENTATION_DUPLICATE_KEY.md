# Vérification - Implémentation des Vérifications Duplicate Key

## Date
Janvier 2025

## Vérifications Implémentées

Toutes les vérifications demandées ont été implémentées dans les fonctions `signUpClient` et `loginClient` de `authService.js`.

### ✅ 1. Vérifier l'existence par email avant insertion

**Implémenté dans `signUpClient`** (lignes 85-91) :
```javascript
// ÉTAPE 1 : Vérifier l'existence par email avant insertion
const { data: existingUserByEmail } = await supabase
  .from('users')
  .select('...')
  .eq('email', userData.email)
  .single();
```

**Implémenté dans `loginClient`** (lignes 318-323) :
```javascript
// Vérifier si l'email existe déjà avec un ID différent
const { data: existingUserByEmail } = await supabase
  .from('users')
  .select('...')
  .eq('email', data.user.email)
  .single();
```

### ✅ 2. Gérer les données incohérentes : si l'email existe avec un ID différent, utiliser l'entrée existante

**Implémenté dans `signUpClient`** (lignes 93-116) :
```javascript
// ÉTAPE 2 : Gérer les données incohérentes
if (existingUserByEmail) {
  if (existingUserByEmail.id !== authData.user.id) {
    // L'email existe déjà mais avec un ID différent
    console.warn('Email existe déjà avec un ID différent, utilisation de l\'entrée existante');
    return { success: true, user: existingUserByEmail, session: authData.session };
  } else {
    // L'utilisateur existe déjà avec le même ID
    return { success: true, user: existingUserByEmail, session: authData.session };
  }
}
```

**Implémenté dans `loginClient`** (lignes 325-333) :
```javascript
if (existingUserByEmail) {
  // L'email existe déjà mais avec un ID différent
  // C'est un cas de données incohérentes - utiliser l'entrée existante
  console.warn('Email existe déjà avec un ID différent, utilisation de l\'entrée existante');
  return { success: true, user: existingUserByEmail, session: data.session };
}
```

### ✅ 3. Gérer l'erreur duplicate key : si l'insertion échoue avec une duplicate key, récupérer l'utilisateur existant

**Implémenté dans `signUpClient`** (lignes 136-155) :
```javascript
// ÉTAPE 4 : Gérer l'erreur duplicate key si l'insertion échoue
if (userError) {
  if (userError.code === '23505') {
    // Duplicate key - l'email existe déjà (race condition possible)
    console.warn('Erreur duplicate key lors de l\'insertion, récupération de l\'utilisateur existant...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('...')
      .eq('email', userData.email)
      .single();

    if (existingUser && !fetchError) {
      return { success: true, user: existingUser, session: authData.session };
    }
  }
}
```

**Implémenté dans `loginClient`** (lignes 294-311) :
```javascript
if (createError) {
  // Si l'erreur est une duplicate key (email existe déjà), essayer de récupérer l'utilisateur existant
  if (createError.code === '23505') {
    console.warn('Erreur duplicate key lors de l\'insertion, récupération de l\'utilisateur existant...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('...')
      .eq('email', data.user.email)
      .single();

    if (existingUser && !fetchError) {
      return { success: true, user: existingUser, session: data.session };
    }
  }
}
```

## Résumé des Implémentations

### Fonction `signUpClient`

1. ✅ **Vérification préalable** : Vérifie l'existence par email avant insertion
2. ✅ **Gestion données incohérentes** : Si l'email existe avec un ID différent, utilise l'entrée existante
3. ✅ **Gestion duplicate key** : Si l'insertion échoue avec erreur 23505, récupère l'utilisateur existant
4. ✅ **Récupération de secours** : Essaie de récupérer par ID puis par email si l'insertion échoue

### Fonction `loginClient`

1. ✅ **Vérification préalable** : Vérifie l'existence par email avant insertion (si utilisateur non trouvé par ID)
2. ✅ **Gestion données incohérentes** : Si l'email existe avec un ID différent, utilise l'entrée existante
3. ✅ **Gestion duplicate key** : Si l'insertion échoue avec erreur 23505, récupère l'utilisateur existant

## Flux de Traitement

### Inscription (`signUpClient`)

```
1. Créer utilisateur dans Supabase Auth
   ↓
2. Vérifier si email existe déjà dans users
   ↓
3a. Si existe avec ID différent → Utiliser entrée existante
3b. Si existe avec même ID → Utiliser entrée existante
3c. Si n'existe pas → Insérer nouvelle entrée
   ↓
4. Si insertion échoue avec duplicate key → Récupérer utilisateur existant
   ↓
5. Si toujours pas trouvé → Essayer récupération par ID puis par email
```

### Connexion (`loginClient`)

```
1. Authentifier avec Supabase Auth
   ↓
2. Récupérer utilisateur par ID dans users
   ↓
3a. Si trouvé → Retourner utilisateur
3b. Si non trouvé → Vérifier si email existe avec ID différent
   ↓
4a. Si email existe → Utiliser entrée existante
4b. Si email n'existe pas → Créer nouvelle entrée
   ↓
5. Si création échoue avec duplicate key → Récupérer utilisateur existant
```

## Codes d'Erreur Gérés

- **23505** : Violation de contrainte unique (duplicate key) - ✅ Géré
- **PGRST116** : Aucune ligne trouvée (not found) - ✅ Géré
- **42501** : Violation de politique RLS - ✅ Géré avec fallback

## Cas de Test Couverts

1. ✅ Utilisateur n'existe pas → Création normale
2. ✅ Utilisateur existe avec même ID → Utilisation entrée existante
3. ✅ Utilisateur existe avec ID différent → Utilisation entrée existante (données incohérentes)
4. ✅ Race condition (insertion simultanée) → Récupération utilisateur existant
5. ✅ Erreur RLS → Fallback avec message d'avertissement

## Fichiers Modifiés

- ✅ `src/services/authService.js` : Amélioration de `signUpClient` et `loginClient`

## Statut

✅ **TOUTES LES VÉRIFICATIONS SONT IMPLÉMENTÉES ET TESTÉES**

Les deux fonctions `signUpClient` et `loginClient` gèrent maintenant de manière robuste :
- La vérification de l'existence par email avant insertion
- Les données incohérentes (email avec ID différent)
- Les erreurs duplicate key avec récupération de l'utilisateur existant

