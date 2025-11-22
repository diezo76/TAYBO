# 🖼️ Guide : Créer les Politiques Storage pour les Images Restaurant

**Problème** : L'upload d'images restaurant échoue (erreur 400/406)  
**Cause** : Politiques Storage manquantes pour le bucket `restaurant-images`  
**Solution** : Créer les politiques via l'interface Supabase Dashboard

---

## 🎯 Politiques à Créer

Vous devez créer **3 politiques** (la politique SELECT existe déjà) :

1. ✅ SELECT (existe déjà) - `Public can view restaurant images`
2. ❌ INSERT - `Restaurants can upload own images`
3. ❌ UPDATE - `Restaurants can update own images`
4. ❌ DELETE - `Restaurants can delete own images`

---

## 📝 Instructions Étape par Étape

### Accéder au Bucket

1. Ouvrez **Supabase Dashboard** : https://supabase.com/dashboard
2. Sélectionnez votre projet **Taybo**
3. Allez dans **Storage** (menu de gauche)
4. Cliquez sur le bucket **restaurant-images**
5. Allez dans l'onglet **Policies**

---

### Politique 1 : INSERT (Upload)

1. Cliquez sur **New Policy**
2. Sélectionnez **For full customization**
3. Remplissez :

**Policy Name** :
```
Restaurants can upload own images
```

**Target roles** :
- ☑️ `authenticated`

**Policy command** :
- Sélectionnez `INSERT`

**WITH CHECK expression** :
```sql
(bucket_id = 'restaurant-images'::text) 
AND (auth.uid() IS NOT NULL) 
AND ((string_to_array(name, '/'::text))[1] = (auth.uid())::text)
```

4. Cliquez sur **Review** puis **Save policy**

---

### Politique 2 : UPDATE (Modifier)

1. Cliquez sur **New Policy**
2. Sélectionnez **For full customization**
3. Remplissez :

**Policy Name** :
```
Restaurants can update own images
```

**Target roles** :
- ☑️ `authenticated`

**Policy command** :
- Sélectionnez `UPDATE`

**USING expression** :
```sql
(bucket_id = 'restaurant-images'::text) 
AND (auth.uid() IS NOT NULL) 
AND ((string_to_array(name, '/'::text))[1] = (auth.uid())::text)
```

**WITH CHECK expression** :
```sql
(bucket_id = 'restaurant-images'::text) 
AND (auth.uid() IS NOT NULL) 
AND ((string_to_array(name, '/'::text))[1] = (auth.uid())::text)
```

4. Cliquez sur **Review** puis **Save policy**

---

### Politique 3 : DELETE (Supprimer)

1. Cliquez sur **New Policy**
2. Sélectionnez **For full customization**
3. Remplissez :

**Policy Name** :
```
Restaurants can delete own images
```

**Target roles** :
- ☑️ `authenticated`

**Policy command** :
- Sélectionnez `DELETE`

**USING expression** :
```sql
(bucket_id = 'restaurant-images'::text) 
AND (auth.uid() IS NOT NULL) 
AND ((string_to_array(name, '/'::text))[1] = (auth.uid())::text)
```

4. Cliquez sur **Review** puis **Save policy**

---

## ✅ Vérification

Après avoir créé les 3 politiques, vous devriez voir **4 politiques au total** :

1. ✅ `Public can view restaurant images` (SELECT)
2. ✅ `Restaurants can upload own images` (INSERT)
3. ✅ `Restaurants can update own images` (UPDATE)
4. ✅ `Restaurants can delete own images` (DELETE)

---

## 🎯 Test

Une fois les politiques créées :

1. **Rafraîchissez votre application** (F5)
2. **Allez dans Profil Restaurant** → **Gérer le profil**
3. **Uploadez une nouvelle image**
4. **L'upload devrait fonctionner** ✅

---

## 📄 Format des Fichiers

Les images sont uploadées avec ce format de chemin :
```
restaurant-images/{restaurant_id}/{timestamp}.{ext}
```

Exemple :
```
restaurant-images/c45a3a48-c343-4922-8c6e-c62e8a165440/1763507581117.jpg
```

La politique vérifie que la première partie du chemin (`{restaurant_id}`) correspond à `auth.uid()` (l'ID de l'utilisateur connecté).

---

## ⚠️ Points Importants

### Format du Chemin
Le chemin DOIT commencer par l'ID du restaurant :
- ✅ `{restaurant_id}/{timestamp}.jpg`
- ❌ `{timestamp}.jpg` (ne fonctionnera pas)

### Bucket Public
Le bucket `restaurant-images` est **public**, donc :
- ✅ Tout le monde peut **voir** les images (SELECT)
- ✅ Seuls les restaurants peuvent **uploader** leurs propres images (INSERT)
- ✅ Seuls les restaurants peuvent **modifier/supprimer** leurs propres images (UPDATE/DELETE)

---

## 🚀 Après la Création

Une fois les politiques créées, vous pourrez :
- ✅ Uploader des images pour votre restaurant
- ✅ Modifier vos images
- ✅ Supprimer vos images
- ✅ Les images seront visibles publiquement (pour la page d'accueil)

---

## 📞 Support

Si vous rencontrez des problèmes lors de la création des politiques :

1. **Vérifiez le format SQL** : Copiez-collez exactement les expressions ci-dessus
2. **Vérifiez le Target role** : Doit être `authenticated`
3. **Vérifiez le Policy command** : INSERT, UPDATE ou DELETE selon la politique
4. **Sauvegardez bien** : Cliquez sur Review puis Save policy

---

**Temps estimé** : 5-10 minutes pour créer les 3 politiques

**Après cela, l'upload d'images fonctionnera parfaitement !** 🎉

