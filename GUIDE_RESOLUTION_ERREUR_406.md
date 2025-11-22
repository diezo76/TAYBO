# Guide : Résolution de l'erreur 406 lors de la récupération restaurant

## 🎯 Problème

Vous obtenez cette erreur lors de la connexion restaurant :
```
Failed to load resource: the server responded with a status of 406
PGRST116: The result contains 0 rows
Cannot coerce the result to a single JSON object
```

**Cause** : Les politiques RLS bloquent l'accès au profil restaurant même pour le restaurant lui-même.

---

## ✅ Solution en 2 étapes

### Étape 1 : Diagnostic (Optionnel mais recommandé)

1. **Ouvrez Supabase Dashboard** → **SQL Editor**
2. **Copiez-collez** le contenu de : **`scripts/DIAGNOSTIC_ERREUR_406.sql`**
3. **Cliquez sur RUN**
4. **Notez les résultats** pour comprendre le problème

### Étape 2 : Correction (OBLIGATOIRE)

1. **Restez dans SQL Editor**
2. **Créez une nouvelle requête**
3. **Copiez-collez** le contenu de : **`scripts/CORRECTION_ERREUR_406.sql`**
4. **Cliquez sur RUN** ✅

**Résultat attendu** :
- ✅ 3 politiques créées (attendu: 3)
- ✅ Liste des 3 politiques avec ✅

---

## 🔍 Ce que fait le script de correction

Le script :
1. ✅ Supprime les anciennes politiques conflictuelles
2. ✅ Crée les 3 politiques RLS correctes :
   - `Restaurants can view own profile` (SELECT)
   - `Restaurants can insert own profile` (INSERT)
   - `Restaurants can update own profile` (UPDATE)
3. ✅ S'assure que RLS est activé
4. ✅ Vérifie que tout est correct

**Important** : La politique SELECT permet aux restaurants de voir leur propre profil **MÊME s'ils ne sont pas vérifiés/actifs**. C'est crucial pour éviter l'erreur 406.

---

## ✅ Vérification après correction

### Test 1 : Vérifier les politiques

Exécutez cette requête dans SQL Editor :
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'restaurants' 
AND policyname LIKE '%own%'
ORDER BY policyname;
```

**Résultat attendu** : 3 lignes

### Test 2 : Tester la connexion

1. **Déconnectez-vous** de l'application (si connecté)
2. **Reconnectez-vous** en tant que restaurant
3. **Vérifiez** que l'erreur 406 n'apparaît plus

---

## ❓ Si l'erreur persiste

### Problème : "Le restaurant n'existe pas dans la table"

**Cause** : Le restaurant n'a pas été créé lors de l'inscription

**Solution** :
1. Vérifiez que l'inscription a bien créé l'entrée dans la table `restaurants`
2. Exécutez cette requête (remplacez `USER_ID` par l'ID du restaurant) :
```sql
SELECT * FROM restaurants WHERE id = 'USER_ID';
```

### Problème : "auth.uid() est NULL"

**Cause** : La session n'est pas valide

**Solution** :
1. Vérifiez que vous êtes bien connecté
2. Vérifiez les variables d'environnement Supabase
3. Réessayez de vous connecter

### Problème : "Plusieurs politiques conflictuelles"

**Cause** : Il y a des politiques qui se chevauchent

**Solution** :
1. Exécutez le script de correction (il supprime les anciennes politiques)
2. Vérifiez qu'il n'y a que 3 politiques pour "own profile"

---

## 📋 Politiques créées

Après la correction, vous devriez avoir ces 3 politiques :

1. **Restaurants can view own profile** (SELECT)
   - Condition : `auth.uid() IS NOT NULL AND auth.uid()::text = id::text`
   - Permet de voir son propre profil même non vérifié/actif

2. **Restaurants can insert own profile** (INSERT)
   - Condition : `auth.uid() IS NOT NULL AND auth.uid()::text = id::text`
   - Permet de créer son propre profil lors de l'inscription

3. **Restaurants can update own profile** (UPDATE)
   - Condition : `auth.uid() IS NOT NULL AND auth.uid()::text = id::text`
   - Permet de modifier son propre profil

---

## 🎯 Pourquoi cette solution fonctionne

### Problème initial

Les politiques RLS bloquaient l'accès au profil restaurant car :
- Soit elles n'existaient pas
- Soit elles avaient des conditions restrictives (is_verified, is_active)
- Soit il y avait des conflits entre plusieurs politiques

### Solution

Le script de correction :
- ✅ Supprime toutes les anciennes politiques conflictuelles
- ✅ Crée les bonnes politiques sans conditions restrictives
- ✅ Permet aux restaurants de voir leur propre profil indépendamment de leur statut

---

## 📁 Fichiers créés

- **`scripts/DIAGNOSTIC_ERREUR_406.sql`** : Script de diagnostic (optionnel)
- **`scripts/CORRECTION_ERREUR_406.sql`** : Script de correction (OBLIGATOIRE)
- **`GUIDE_RESOLUTION_ERREUR_406.md`** : Ce guide

---

## 🚀 Action immédiate

**Exécutez maintenant** : `scripts/CORRECTION_ERREUR_406.sql`

Après l'exécution :
1. ✅ Les politiques RLS seront correctement configurées
2. ✅ L'erreur 406 sera résolue
3. ✅ Les restaurants pourront se connecter et voir leur profil

---

## 💡 Note importante

Cette correction est **idempotente** : vous pouvez l'exécuter plusieurs fois sans problème. Elle supprime d'abord les anciennes politiques avant de créer les nouvelles.

---

**Exécutez le script de correction maintenant et l'erreur 406 sera résolue !** 🎉

