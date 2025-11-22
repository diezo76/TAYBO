# Guide : Créer les politiques Storage via l'interface Supabase

## ⚠️ Pourquoi utiliser l'interface ?

Même via SQL Editor, vous pouvez avoir l'erreur :
```
ERROR: 42501: must be owner of relation objects
```

**Solution** : Créer les politiques via l'interface Supabase Dashboard (Storage → Policies)

C'est **plus simple**, **plus sûr** et **garanti de fonctionner** !

---

## 📋 ÉTAPES (10 minutes)

### Étape 1 : Exécuter la partie RLS (SQL)

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Allez dans SQL Editor**
3. **Copiez-collez ce script** (partie RLS uniquement) :

```sql
-- ============================================
-- PARTIE 1 : POLITIQUES RLS RESTAURANTS
-- ============================================

DROP POLICY IF EXISTS "Restaurants can insert own profile" ON restaurants;
CREATE POLICY "Restaurants can insert own profile"
  ON restaurants FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

DROP POLICY IF EXISTS "Restaurants can view own profile" ON restaurants;
CREATE POLICY "Restaurants can view own profile"
  ON restaurants FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

DROP POLICY IF EXISTS "Restaurants can update own profile" ON restaurants;
CREATE POLICY "Restaurants can update own profile"
  ON restaurants FOR UPDATE
  USING (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = id::text
  );

-- ============================================
-- PARTIE 2 : FONCTION HELPER
-- ============================================

CREATE OR REPLACE FUNCTION extract_user_id_from_path(file_path TEXT)
RETURNS TEXT AS $$
DECLARE
  file_name TEXT;
  user_id TEXT;
BEGIN
  file_name := (string_to_array(file_path, '/'))[array_length(string_to_array(file_path, '/'), 1)];
  user_id := split_part(file_name, '-', 1);
  RETURN user_id;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

4. **Cliquez sur RUN** ✅

---

### Étape 2 : Créer les politiques Storage via l'interface

#### 2.1 Aller dans Storage

1. Dans le menu de gauche, cliquez sur **Storage**
2. Cliquez sur le bucket **passports**

#### 2.2 Créer la première politique (SELECT)

1. Cliquez sur l'onglet **Policies** (en haut)
2. Cliquez sur **New Policy**
3. Choisissez **Create a policy from scratch**
4. Remplissez :

   **Policy name** : `Restaurants can view own passports`
   
   **Allowed operation** : `SELECT`
   
   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```

5. Cliquez sur **Review** puis **Save policy** ✅

#### 2.3 Créer la deuxième politique (INSERT)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Remplissez :

   **Policy name** : `Restaurants can upload own passports`
   
   **Allowed operation** : `INSERT`
   
   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```

4. Cliquez sur **Review** puis **Save policy** ✅

#### 2.4 Créer la troisième politique (UPDATE)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Remplissez :

   **Policy name** : `Restaurants can update own passports`
   
   **Allowed operation** : `UPDATE`
   
   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```

4. Cliquez sur **Review** puis **Save policy** ✅

#### 2.5 Créer la quatrième politique (DELETE)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Remplissez :

   **Policy name** : `Restaurants can delete own passports`
   
   **Allowed operation** : `DELETE`
   
   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```

4. Cliquez sur **Review** puis **Save policy** ✅

#### 2.6 Créer la cinquième politique (SELECT Admin)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Remplissez :

   **Policy name** : `Admins can view all passports`
   
   **Allowed operation** : `SELECT`
   
   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND EXISTS (
     SELECT 1 FROM users
     WHERE users.id::text = auth.uid()::text
     AND users.email = 'admin@taybo.com'
   )
   ```

4. Cliquez sur **Review** puis **Save policy** ✅

---

### Étape 3 : Vérifier

Vous devriez maintenant voir **5 politiques** dans la liste :

1. ✅ Restaurants can view own passports (SELECT)
2. ✅ Restaurants can upload own passports (INSERT)
3. ✅ Restaurants can update own passports (UPDATE)
4. ✅ Restaurants can delete own passports (DELETE)
5. ✅ Admins can view all passports (SELECT)

---

## 🎉 C'est terminé !

Après ces étapes :
- ✅ Les restaurants peuvent s'inscrire
- ✅ Les restaurants peuvent uploader leur passport
- ✅ Les politiques RLS fonctionnent
- ✅ Les politiques Storage fonctionnent

---

## 📸 Aide visuelle

### Où trouver Storage → Policies ?

```
Supabase Dashboard
├── Table Editor
├── SQL Editor
├── Storage          ← Cliquez ici
│   ├── Buckets
│   ├── Policies    ← Puis ici
│   └── ...
```

### Format du nom de fichier

Les fichiers doivent être uploadés avec ce format :
```
passports/{uuid}-{timestamp}.{ext}
```

Exemple :
```
passports/123e4567-e89b-12d3-a456-426614174000-1700312345678.pdf
```

La fonction `extract_user_id_from_path` extrait : `123e4567-e89b-12d3-a456-426614174000`

---

## ❓ Si vous avez un problème

### Le bucket "passports" n'existe pas

1. Allez dans **Storage** → **Buckets**
2. Cliquez sur **New bucket**
3. Nom : `passports`
4. Public : ❌ **NON** (laissez décoché)
5. Cliquez sur **Create bucket**

### Erreur dans la définition de la politique

Vérifiez que vous avez bien :
- ✅ Copié-collé exactement la définition SQL
- ✅ Pas d'espaces en trop
- ✅ Les guillemets simples autour de `'passports'` et `'admin@taybo.com'`

### La fonction extract_user_id_from_path n'existe pas

→ Exécutez d'abord l'**Étape 1** (partie SQL) avant de créer les politiques Storage

---

## 💡 Pourquoi cette méthode fonctionne ?

L'interface Supabase Dashboard utilise automatiquement les bonnes permissions pour créer les politiques Storage. C'est la méthode recommandée par Supabase.

---

## 📁 Fichiers de référence

- `supabase/migrations/027_fix_restaurant_signup_rls_storage.sql` : Migration RLS
- `scripts/create_passports_storage_policies.sql` : Script SQL (si vous voulez essayer)
- Ce guide : Instructions pour l'interface

---

**Suivez ces étapes et tout fonctionnera parfaitement !** 🚀

