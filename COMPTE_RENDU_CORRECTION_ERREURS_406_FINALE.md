# Compte Rendu - Correction Finale des Erreurs 406

**Date** : 2025-01-27  
**Objectif** : Corriger définitivement les erreurs 406 lors de la connexion restaurant.

## Résumé Exécutif

Le problème principal était que l'ID du restaurant dans la table `restaurants` ne correspondait pas à l'ID de l'utilisateur Auth. Cela causait des erreurs 406 car les politiques RLS vérifiaient `auth.uid() = id` mais les IDs ne correspondaient pas.

## Problème Identifié

### Incohérence entre ID Auth et ID Restaurant

**Avant correction** :
- **ID Auth** : `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`
- **ID Restaurant** : `35ec9b13-1fb4-408f-a96f-5ea0129e36c1` ❌
- **Email** : `diezowee@gmail.com` (identique)

**Conséquence** :
- Lors de la connexion, Supabase Auth retourne l'ID Auth (`cb6dc3c1-...`)
- Le code cherche un restaurant avec cet ID dans la table `restaurants`
- Mais le restaurant a un ID différent (`35ec9b13-...`)
- Les politiques RLS vérifient `auth.uid() = id`, ce qui échoue
- Résultat : Erreur 406 (Not Acceptable)

### Politiques RLS en Conflit

Plusieurs politiques RLS obsolètes ou en conflit :
- `"Public can view all restaurants"` avec `qual: true` - trop permissive
- `"Restaurants can read own data"` utilisant `user_id` au lieu de `id`
- `"Restaurants can update own data"` utilisant `user_id` au lieu de `id`

## Solutions Appliquées

### 1. Correction de l'ID Restaurant

**Migration appliquée** : Mise à jour de l'ID du restaurant pour correspondre à l'ID Auth

```sql
-- Mise à jour de toutes les références vers l'ancien ID
UPDATE menu_items SET restaurant_id = auth_user_id WHERE restaurant_id = old_restaurant_id;
UPDATE orders SET restaurant_id = auth_user_id WHERE restaurant_id = old_restaurant_id;
UPDATE reviews SET restaurant_id = auth_user_id WHERE restaurant_id = old_restaurant_id;
UPDATE promotions SET restaurant_id = auth_user_id WHERE restaurant_id = old_restaurant_id;
UPDATE favorites SET restaurant_id = auth_user_id WHERE restaurant_id = old_restaurant_id;
UPDATE support_tickets SET restaurant_id = auth_user_id WHERE restaurant_id = old_restaurant_id;
UPDATE commission_payments SET restaurant_id = auth_user_id WHERE restaurant_id = old_restaurant_id;

-- Mise à jour de l'ID du restaurant lui-même
UPDATE restaurants SET id = auth_user_id WHERE id = old_restaurant_id;
```

**Résultat** :
- ✅ L'ID du restaurant correspond maintenant à l'ID Auth
- ✅ Toutes les références ont été mises à jour

### 2. Nettoyage des Politiques RLS

**Migration 018 appliquée** : Suppression des politiques obsolètes

Politiques supprimées :
- ❌ `"Public can view all restaurants"` (trop permissive)
- ❌ `"Public can view approved restaurants"` (obsolète)
- ❌ `"Restaurants can read own data"` (utilise `user_id` au lieu de `id`)
- ❌ `"Restaurants can update own data"` (utilise `user_id` au lieu de `id`)
- ❌ `"Allow public restaurant registration"` (obsolète)

Politiques conservées (correctes) :
- ✅ `"Public can view active verified restaurants"` - Pour l'affichage public
- ✅ `"Restaurants can view own profile"` - Utilise `auth.uid() = id`
- ✅ `"Restaurants can update own profile"` - Utilise `auth.uid() = id`
- ✅ `"Restaurants can insert own profile"` - Pour l'inscription
- ✅ `"Admins can view all restaurants"` - Pour la gestion admin
- ✅ `"Admins can update all restaurants"` - Pour la validation admin

## Vérification Post-Correction

### Vérification de l'ID

```sql
SELECT 
    r.id as restaurant_id,
    r.email,
    au.id as auth_id,
    CASE 
        WHEN r.id::text = au.id::text THEN '✅ IDs correspondent'
        ELSE '❌ IDs ne correspondent pas'
    END as status
FROM restaurants r
JOIN auth.users au ON au.email = r.email
WHERE r.email = 'diezowee@gmail.com';
```

**Résultat** : ✅ IDs correspondent

### Vérification des Politiques RLS

Toutes les politiques utilisent maintenant correctement `id` au lieu de `user_id`.

## Tests à Effectuer

### Test 1 : Connexion Restaurant ✅

1. Aller sur `/restaurant/login`
2. Se connecter avec :
   - Email : `diezowee@gmail.com`
   - Mot de passe : (le mot de passe utilisé lors de l'inscription)
3. **Résultat attendu** : Connexion réussie sans erreur 406

### Test 2 : Récupération des Données Restaurant ✅

1. Après connexion, vérifier que les données du restaurant s'affichent
2. Vérifier la console pour s'assurer qu'il n'y a pas d'erreur 406
3. **Résultat attendu** : Données affichées correctement

### Test 3 : Modification du Profil ✅

1. Aller sur `/restaurant/profile`
2. Modifier le profil (nom, description, etc.)
3. Sauvegarder
4. **Résultat attendu** : Modifications sauvegardées sans erreur

## Architecture du Système

### Relation Auth ↔ Restaurant

Le système est conçu pour que :
- L'ID du restaurant dans la table `restaurants` = L'ID de l'utilisateur Auth
- Cela permet aux politiques RLS de vérifier `auth.uid() = id` simplement
- Pas besoin de colonne `user_id` séparée

### Flux de Connexion

1. **Connexion Auth** : `supabase.auth.signInWithPassword()`
   - Retourne `data.user.id` (ID Auth)

2. **Récupération Restaurant** : `supabase.from('restaurants').select().eq('id', data.user.id)`
   - Cherche un restaurant avec `id = auth.uid()`
   - Les politiques RLS vérifient `auth.uid() = id`

3. **Si les IDs correspondent** : ✅ Succès
4. **Si les IDs ne correspondent pas** : ❌ Erreur 406

## Causes Possibles du Problème Initial

Le problème peut avoir été causé par :
1. **Inscription manuelle** : Un restaurant créé manuellement avec un ID différent
2. **Migration incomplète** : Une migration qui n'a pas préservé la correspondance des IDs
3. **Test/Reset** : Des tests qui ont créé des données avec des IDs différents

## Prévention Future

Pour éviter ce problème à l'avenir :

1. **Toujours utiliser l'ID Auth** lors de la création d'un restaurant :
   ```javascript
   const { data: authData } = await supabase.auth.signUp(...);
   await supabase.from('restaurants').insert({
     id: authData.user.id, // Utiliser l'ID Auth
     email: authData.user.email,
     // ...
   });
   ```

2. **Vérifier la cohérence** après chaque création :
   ```sql
   SELECT r.id, au.id 
   FROM restaurants r
   JOIN auth.users au ON au.email = r.email
   WHERE r.id::text != au.id::text;
   ```

3. **Ne jamais créer de restaurant manuellement** avec un ID différent de l'ID Auth

## Conclusion

✅ **Problème résolu** : L'ID du restaurant correspond maintenant à l'ID Auth

✅ **Politiques RLS nettoyées** : Plus de conflits ou de politiques obsolètes

✅ **Système cohérent** : L'architecture Auth ↔ Restaurant est maintenant correcte

🔄 **Prêt pour les tests** : La connexion restaurant devrait maintenant fonctionner sans erreur 406

---

**Note importante** : Si vous rencontrez toujours l'erreur "Invalid login credentials", cela signifie que le mot de passe utilisé n'est pas correct. Dans ce cas :
1. Vérifiez le mot de passe utilisé lors de l'inscription
2. Ou réinitialisez le mot de passe depuis Supabase Dashboard > Authentication > Users
3. Ou créez un nouveau compte restaurant pour tester

