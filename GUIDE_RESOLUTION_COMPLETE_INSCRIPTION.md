# Guide : Résolution complète des erreurs d'inscription restaurant

## 🎯 Problèmes identifiés

Vous avez 3 erreurs lors de l'inscription :

1. **Erreur RLS** : `new row violates row-level security policy` lors de l'INSERT
2. **Erreur 406** : Impossible de récupérer le restaurant après inscription
3. **Erreur Storage 400** : `passports/passports/...` (double "passports" dans l'URL)

---

## ✅ Solution en 3 étapes

### Étape 1 : Corriger les politiques RLS (OBLIGATOIRE)

1. **Ouvrez Supabase Dashboard** → **SQL Editor**
2. **Copiez-collez** le contenu de : **`scripts/CORRECTION_COMPLETE_INSCRIPTION.sql`**
3. **Cliquez sur RUN** ✅

**Résultat attendu** :
- ✅ 4 politiques créées (attendu: 4)
- ✅ Liste des 4 politiques avec ✅

**Politiques créées** :
1. ✅ Restaurants can insert own profile (INSERT) - **CRUCIAL pour inscription**
2. ✅ Restaurants can view own profile (SELECT) - **CRUCIAL pour éviter 406**
3. ✅ Restaurants can update own profile (UPDATE)
4. ✅ Public can view active verified restaurants (SELECT)

### Étape 2 : Vérifier les politiques Storage (OBLIGATOIRE)

Les politiques Storage doivent utiliser le bon format pour extraire l'ID.

**Vérifiez dans Storage → passports → Policies** que les politiques utilisent :

```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

**Important** : La fonction `extract_user_id_from_path` extrait l'ID depuis le **nom du fichier**, pas depuis le chemin complet.

**Format attendu du fichier** : `{uuid}-{timestamp}.{ext}`

**Exemple** : `49f8380c-066c-47c6-8fed-4761b0f9df6f-1763503242510.PNG`

### Étape 3 : Code corrigé (DÉJÀ FAIT ✅)

J'ai corrigé le code dans `restaurantAuthService.js` :
- ✅ Le `filePath` est maintenant juste le nom du fichier (sans "passports/")
- ✅ Cela évite le double "passports" dans l'URL

---

## 🔍 Vérifications après correction

### Vérification 1 : Politiques RLS

Exécutez dans SQL Editor :
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'restaurants' 
AND policyname LIKE '%own%'
ORDER BY policyname;
```

**Résultat attendu** : 3 lignes (insert, view, update)

### Vérification 2 : Politiques Storage

1. Allez dans **Storage** → **passports** → **Policies**
2. Vérifiez que les 5 politiques existent
3. Vérifiez que chaque politique utilise `extract_user_id_from_path(name)`

### Vérification 3 : Test d'inscription

1. **Rafraîchissez** votre application (Ctrl+F5 ou Cmd+Shift+R)
2. **Essayez de vous inscrire** en tant que restaurant
3. **Vérifiez** que :
   - ✅ L'inscription fonctionne sans erreur RLS
   - ✅ Le restaurant peut voir son profil (pas d'erreur 406)
   - ✅ L'upload du passport fonctionne (pas d'erreur 400)

---

## ❓ Si l'erreur persiste

### Erreur RLS "new row violates row-level security policy"

**Cause** : La politique INSERT n'existe pas ou ne fonctionne pas

**Solution** :
1. Vérifiez que la politique "Restaurants can insert own profile" existe
2. Vérifiez qu'elle utilise `WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::text = id::text)`
3. Réexécutez `scripts/CORRECTION_COMPLETE_INSCRIPTION.sql`

### Erreur 406 lors de la récupération

**Cause** : La politique SELECT n'existe pas ou ne fonctionne pas

**Solution** :
1. Vérifiez que la politique "Restaurants can view own profile" existe
2. Vérifiez qu'elle utilise `USING (auth.uid() IS NOT NULL AND auth.uid()::text = id::text)`
3. Réexécutez `scripts/CORRECTION_COMPLETE_INSCRIPTION.sql`

### Erreur Storage 400 "passports/passports/..."

**Cause** : Le code ajoute "passports/" alors que le bucket s'appelle déjà "passports"

**Solution** :
- ✅ **DÉJÀ CORRIGÉ** dans le code
- Rafraîchissez votre application (Ctrl+F5)
- Réessayez l'inscription

### Erreur Storage "violates row-level security policy"

**Cause** : Les politiques Storage ne sont pas correctement configurées

**Solution** :
1. Vérifiez que les politiques Storage existent dans Storage → passports → Policies
2. Vérifiez que chaque politique utilise `extract_user_id_from_path(name)`
3. Vérifiez que le format du nom de fichier est `{uuid}-{timestamp}.{ext}`

---

## 📋 Format des fichiers Storage

### Format correct

Le fichier doit être uploadé avec ce format de nom :
```
{uuid}-{timestamp}.{ext}
```

**Exemple** :
```
49f8380c-066c-47c6-8fed-4761b0f9df6f-1763503242510.PNG
```

**Code corrigé** :
```javascript
const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`;
const filePath = fileName; // Pas "passports/" car le bucket s'appelle déjà "passports"
```

### Format incorrect (ancien code)

```javascript
const filePath = `passports/${fileName}`; // ❌ Double "passports"
```

---

## 🎯 Résumé des corrections

### 1. Politiques RLS ✅

**Script** : `scripts/CORRECTION_COMPLETE_INSCRIPTION.sql`

**Crée** :
- ✅ INSERT : Permet l'inscription
- ✅ SELECT : Permet la récupération (évite 406)
- ✅ UPDATE : Permet la modification
- ✅ SELECT public : Permet de voir les restaurants actifs

### 2. Code Storage ✅

**Fichier** : `src/services/restaurantAuthService.js` (ligne 47)

**Correction** :
- ✅ `filePath = fileName` (au lieu de `filePath = "passports/" + fileName`)
- ✅ Évite le double "passports" dans l'URL

### 3. Politiques Storage ⚠️

**À vérifier manuellement** dans Storage → passports → Policies

**Vérifiez** :
- ✅ Les 5 politiques existent
- ✅ Chaque politique utilise `extract_user_id_from_path(name)`
- ✅ Le format du nom de fichier est correct

---

## 🚀 Action immédiate

1. **Exécutez** `scripts/CORRECTION_COMPLETE_INSCRIPTION.sql` ✅
2. **Vérifiez** les politiques Storage dans Dashboard ✅
3. **Rafraîchissez** votre application (Ctrl+F5) ✅
4. **Testez** l'inscription ✅

---

## 📁 Fichiers créés

- **`scripts/CORRECTION_COMPLETE_INSCRIPTION.sql`** ⭐ Script principal
- **`GUIDE_RESOLUTION_COMPLETE_INSCRIPTION.md`** ⭐ Ce guide
- **`src/services/restaurantAuthService.js`** ✅ Code corrigé

---

**Exécutez le script de correction maintenant et testez l'inscription !** 🎉

