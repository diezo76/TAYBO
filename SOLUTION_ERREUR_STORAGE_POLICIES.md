# Solution : Erreur "must be owner of relation objects"

## ❌ Problème

L'erreur `must be owner of relation objects` signifie que vous n'avez pas les permissions nécessaires pour créer des policies Storage via SQL dans Supabase.

## ✅ Solution : Créer les Policies via l'Interface Supabase Dashboard

C'est la méthode **recommandée** par Supabase. Suivez ces étapes :

---

## 📋 Guide Étape par Étape

### Étape 1 : Accéder aux Policies Storage

1. Ouvrez https://supabase.com/dashboard
2. Sélectionnez votre projet **Taybo**
3. Dans le menu de gauche, cliquez sur **Storage**
4. Cliquez sur **Policies** (en haut de la page Storage)

Vous verrez une liste des buckets et leurs policies.

---

### Étape 2 : Créer les Policies pour `restaurant-images`

#### Policy 1 : Lecture Publique (SELECT)

1. Cliquez sur le bucket **`restaurant-images`**
2. Cliquez sur **"New Policy"** ou le bouton **"+"**
3. Remplissez :
   - **Policy Name** : `Public Access to Restaurant Images`
   - **Allowed Operation** : Sélectionnez **`SELECT`**
   - **Policy Definition** : Collez ceci :
   ```sql
   bucket_id = 'restaurant-images'
   ```
4. Cliquez sur **"Save"** ou **"Create Policy"**

#### Policy 2 : Upload par Restaurants (INSERT)

1. Cliquez à nouveau sur **"New Policy"**
2. Remplissez :
   - **Policy Name** : `Restaurants can upload own images`
   - **Allowed Operation** : Sélectionnez **`INSERT`**
   - **Policy Definition** : Collez ceci :
   ```sql
   bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
3. Cliquez sur **"Save"**

#### Policy 3 : Mise à Jour par Restaurants (UPDATE)

1. Cliquez sur **"New Policy"**
2. Remplissez :
   - **Policy Name** : `Restaurants can update own images`
   - **Allowed Operation** : Sélectionnez **`UPDATE`**
   - **Policy Definition** : Collez ceci :
   ```sql
   bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
3. Cliquez sur **"Save"**

#### Policy 4 : Suppression par Restaurants (DELETE)

1. Cliquez sur **"New Policy"**
2. Remplissez :
   - **Policy Name** : `Restaurants can delete own images`
   - **Allowed Operation** : Sélectionnez **`DELETE`**
   - **Policy Definition** : Collez ceci :
   ```sql
   bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]
   ```
3. Cliquez sur **"Save"**

---

### Étape 3 : Créer les Policies pour `menu-images`

#### Policy 1 : Lecture Publique (SELECT)

1. Cliquez sur le bucket **`menu-images`**
2. Cliquez sur **"New Policy"**
3. Remplissez :
   - **Policy Name** : `Public Access to Menu Images`
   - **Allowed Operation** : **`SELECT`**
   - **Policy Definition** :
   ```sql
   bucket_id = 'menu-images'
   ```
4. Cliquez sur **"Save"**

#### Policy 2 : Upload par Restaurants (INSERT)

1. **Policy Name** : `Restaurants can upload menu images`
2. **Allowed Operation** : **`INSERT`**
3. **Policy Definition** :
   ```sql
   bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)
   ```

#### Policy 3 : Mise à Jour par Restaurants (UPDATE)

1. **Policy Name** : `Restaurants can update menu images`
2. **Allowed Operation** : **`UPDATE`**
3. **Policy Definition** :
   ```sql
   bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)
   ```

#### Policy 4 : Suppression par Restaurants (DELETE)

1. **Policy Name** : `Restaurants can delete menu images`
2. **Allowed Operation** : **`DELETE`**
3. **Policy Definition** :
   ```sql
   bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)
   ```

---

### Étape 4 : Créer les Policies pour `user-images`

#### Policy 1 : Lecture Publique (SELECT)

1. Cliquez sur le bucket **`user-images`**
2. **Policy Name** : `Public Access to User Images`
3. **Allowed Operation** : **`SELECT`**
4. **Policy Definition** :
   ```sql
   bucket_id = 'user-images'
   ```

#### Policy 2 : Upload par Utilisateurs (INSERT)

1. **Policy Name** : `Users can upload own images`
2. **Allowed Operation** : **`INSERT`**
3. **Policy Definition** :
   ```sql
   bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

#### Policy 3 : Mise à Jour par Utilisateurs (UPDATE)

1. **Policy Name** : `Users can update own images`
2. **Allowed Operation** : **`UPDATE`**
3. **Policy Definition** :
   ```sql
   bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

#### Policy 4 : Suppression par Utilisateurs (DELETE)

1. **Policy Name** : `Users can delete own images`
2. **Allowed Operation** : **`DELETE`**
3. **Policy Definition** :
   ```sql
   bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

---

### Étape 5 : Créer les Policies pour `passports` (Privé)

#### Policy 1 : Lecture par Restaurants (SELECT)

1. Cliquez sur le bucket **`passports`**
2. **Policy Name** : `Restaurants can view own passports`
3. **Allowed Operation** : **`SELECT`**
4. **Policy Definition** :
   ```sql
   bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

#### Policy 2 : Upload par Restaurants (INSERT)

1. **Policy Name** : `Restaurants can upload own passports`
2. **Allowed Operation** : **`INSERT`**
3. **Policy Definition** :
   ```sql
   bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]
   ```

#### Policy 3 : Lecture par Admins (SELECT)

1. **Policy Name** : `Admins can view all passports`
2. **Allowed Operation** : **`SELECT`**
3. **Policy Definition** :
   ```sql
   bucket_id = 'passports' AND EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.email = 'admin@taybo.com')
   ```

---

## ✅ Vérification

Après avoir créé toutes les policies :

1. Retournez dans **Storage** > **Policies**
2. Vérifiez que chaque bucket a ses policies :
   - `restaurant-images` : 4 policies
   - `menu-images` : 4 policies
   - `user-images` : 4 policies
   - `passports` : 3 policies

**Total attendu** : 15 policies

3. Testez dans votre application :
   - Rafraîchissez la page (Ctrl+F5)
   - Les images devraient maintenant se charger ! ✅

---

## 🎯 Résumé Rapide

| Bucket | Policies à créer | Opérations |
|--------|------------------|------------|
| `restaurant-images` | 4 | SELECT (public), INSERT, UPDATE, DELETE (restaurants) |
| `menu-images` | 4 | SELECT (public), INSERT, UPDATE, DELETE (restaurants) |
| `user-images` | 4 | SELECT (public), INSERT, UPDATE, DELETE (users) |
| `passports` | 3 | SELECT (restaurants), INSERT (restaurants), SELECT (admins) |

---

## ⚠️ Notes Importantes

1. **Les buckets doivent exister** avant de créer les policies
   - Vérifiez dans **Storage** > **Buckets** que les 4 buckets existent

2. **Les buckets publics** (`restaurant-images`, `menu-images`, `user-images`) doivent être marqués comme **Public** dans leurs paramètres

3. **Le bucket privé** (`passports`) doit être marqué comme **Private**

4. **Si une policy existe déjà**, vous pouvez la modifier ou la supprimer puis la recréer

---

## 🆘 En Cas de Problème

Si les images ne se chargent toujours pas après avoir créé les policies :

1. Vérifiez que les buckets existent et sont correctement configurés
2. Vérifiez que les policies sont bien créées (15 au total)
3. Videz le cache du navigateur (Ctrl+F5)
4. Vérifiez la console du navigateur (F12) pour voir les erreurs
5. Consultez les logs Supabase : **Logs** > **Postgres**

---

**Une fois toutes les policies créées, vos images devraient se charger correctement ! 🎉**

