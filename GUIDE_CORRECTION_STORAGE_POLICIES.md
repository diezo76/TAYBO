# Guide : Correction des politiques Storage pour résoudre l'erreur 400

## 🎯 Problème

Vous obtenez cette erreur lors de l'upload du passport :
```
StorageApiError: new row violates row-level security policy
```

**Cause** : Les politiques Storage ne sont pas correctement configurées ou utilisent le mauvais format.

---

## ✅ Solution en 2 étapes

### Étape 1 : Vérifier la fonction helper

1. **Ouvrez Supabase Dashboard** → **SQL Editor**
2. **Exécutez** : `scripts/DIAGNOSTIC_STORAGE_POLICIES.sql`
3. **Vérifiez** que la fonction `extract_user_id_from_path` existe et fonctionne

**Si la fonction n'existe pas** :
- Exécutez `scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`

### Étape 2 : Corriger les politiques Storage via l'interface

Les politiques Storage **DOIVENT** être créées via l'interface Dashboard (SQL ne fonctionne pas).

#### 2.1 Aller dans Storage Policies

1. **Allez dans Storage** (menu de gauche)
2. **Cliquez sur le bucket** `passports`
3. **Cliquez sur l'onglet** `Policies`

#### 2.2 Supprimer les anciennes politiques (si elles existent)

1. **Trouvez** toutes les politiques qui contiennent "passport" dans le nom
2. **Cliquez sur** chaque politique
3. **Cliquez sur** "Delete policy" pour chaque ancienne politique

#### 2.3 Créer la politique INSERT (LA PLUS IMPORTANTE)

1. **Cliquez sur** "New Policy"
2. **Choisissez** "Create a policy from scratch"
3. **Remplissez** :

   **Policy name** :
   ```
   Restaurants can upload own passports
   ```

   **Allowed operation** :
   ```
   INSERT
   ```

   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```

4. **Cliquez sur** "Review" puis "Save policy" ✅

#### 2.4 Créer les autres politiques

**Politique SELECT** :
- **Policy name** : `Restaurants can view own passports`
- **Allowed operation** : `SELECT`
- **Policy definition** :
```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

**Politique UPDATE** :
- **Policy name** : `Restaurants can update own passports`
- **Allowed operation** : `UPDATE`
- **Policy definition** :
```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

**Politique DELETE** :
- **Policy name** : `Restaurants can delete own passports`
- **Allowed operation** : `DELETE`
- **Policy definition** :
```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

**Politique SELECT Admin** :
- **Policy name** : `Admins can view all passports`
- **Allowed operation** : `SELECT`
- **Policy definition** :
```sql
bucket_id = 'passports'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id::text = auth.uid()::text
  AND users.email = 'admin@taybo.com'
)
```

---

## 🔍 Format du nom de fichier

### Format actuel (CORRECT ✅)

Le code upload maintenant avec ce format :
```
{uuid}-{timestamp}.{ext}
```

**Exemple** :
```
8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9-1763503578550.PNG
```

### Comment la fonction extrait l'ID

La fonction `extract_user_id_from_path` :
1. Prend le nom du fichier complet : `8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9-1763503578550.PNG`
2. Extrait la partie avant le premier `-` : `8b3aaffa-1ed1-49f5-a445-f0ea4df8f9d9`
3. Retourne cet UUID

**Important** : Le `name` dans les politiques Storage est le **nom du fichier complet**, pas le chemin avec "passports/".

---

## ✅ Vérification après correction

### Vérification 1 : Politiques créées

Dans Storage → passports → Policies, vous devriez voir **5 politiques** :
1. ✅ Restaurants can upload own passports (INSERT)
2. ✅ Restaurants can view own passports (SELECT)
3. ✅ Restaurants can update own passports (UPDATE)
4. ✅ Restaurants can delete own passports (DELETE)
5. ✅ Admins can view all passports (SELECT)

### Vérification 2 : Test d'upload

1. **Rafraîchissez** votre application (Ctrl+F5)
2. **Essayez de vous inscrire** en tant que restaurant
3. **Vérifiez** que l'upload du passport fonctionne sans erreur 400

---

## ❓ Si l'erreur persiste

### Erreur : "function extract_user_id_from_path does not exist"

**Solution** :
1. Exécutez `scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`
2. Vérifiez que la fonction existe avec le diagnostic

### Erreur : "new row violates row-level security policy"

**Causes possibles** :
1. La politique INSERT n'existe pas
2. La politique INSERT utilise le mauvais format
3. Le nom du fichier ne correspond pas au format attendu

**Solution** :
1. Vérifiez que la politique INSERT existe dans Storage → passports → Policies
2. Vérifiez que la condition est exactement :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```
3. Vérifiez que le nom du fichier est au format `{uuid}-{timestamp}.{ext}`

### Erreur 406 toujours présente

**Solution** :
1. Exécutez `scripts/CORRECTION_COMPLETE_INSCRIPTION.sql`
2. Vérifiez que la politique SELECT "Restaurants can view own profile" existe
3. Vérifiez qu'elle utilise `USING (auth.uid() IS NOT NULL AND auth.uid()::text = id::text)`

---

## 📋 Checklist complète

Avant de tester l'inscription, vérifiez :

- [ ] Fonction `extract_user_id_from_path` existe (SQL Editor)
- [ ] Politique RLS INSERT existe pour restaurants (SQL Editor)
- [ ] Politique RLS SELECT existe pour restaurants (SQL Editor)
- [ ] Politique Storage INSERT existe pour passports (Storage → Policies)
- [ ] Politique Storage SELECT existe pour passports (Storage → Policies)
- [ ] Code corrigé dans `restaurantAuthService.js` (filePath = fileName)
- [ ] Application rafraîchie (Ctrl+F5)

---

## 🚀 Action immédiate

1. **Exécutez** `scripts/DIAGNOSTIC_STORAGE_POLICIES.sql` pour diagnostiquer
2. **Vérifiez** les politiques Storage dans Storage → passports → Policies
3. **Créez/modifiez** la politique INSERT si nécessaire
4. **Rafraîchissez** votre application
5. **Testez** l'inscription

---

## 📁 Fichiers de référence

- **`scripts/DIAGNOSTIC_STORAGE_POLICIES.sql`** : Diagnostic des politiques Storage
- **`scripts/CORRECTION_COMPLETE_INSCRIPTION.sql`** : Correction des politiques RLS
- **`scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`** : Création de la fonction helper
- **`GUIDE_CREATION_POLICIES_STORAGE_INTERFACE.md`** : Guide détaillé pour créer les politiques

---

**Suivez ces étapes et l'erreur Storage sera résolue !** 🎉

