# Solution Finale - Création des Policies Storage

## ⚠️ Problème Récurrent

L'erreur `must be owner of relation objects` persiste même avec les migrations alternatives. C'est normal dans Supabase - les policies Storage nécessitent des permissions spéciales.

## ✅ Solution Définitive : Interface Supabase Dashboard

**C'est la SEULE méthode fiable** pour créer les policies Storage dans Supabase.

---

## 📋 Méthode Rapide (Recommandée)

### Option 1 : Via l'Interface Storage Policies

1. **Connectez-vous** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : Taybo
3. **Allez dans** : **Storage** > **Policies**
4. **Pour chaque bucket**, cliquez sur **"New Policy"** et créez les policies suivantes :

#### Bucket `restaurant-images`

**Policy 1** :
- Nom : `Public Access to Restaurant Images`
- Opération : `SELECT`
- Définition : `bucket_id = 'restaurant-images'`

**Policy 2** :
- Nom : `Restaurants can upload own images`
- Opération : `INSERT`
- Définition : `bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]`

**Policy 3** :
- Nom : `Restaurants can update own images`
- Opération : `UPDATE`
- Définition : `bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]`

**Policy 4** :
- Nom : `Restaurants can delete own images`
- Opération : `DELETE`
- Définition : `bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]`

#### Bucket `menu-images`

**Policy 1** :
- Nom : `Public Access to Menu Images`
- Opération : `SELECT`
- Définition : `bucket_id = 'menu-images'`

**Policy 2** :
- Nom : `Restaurants can upload menu images`
- Opération : `INSERT`
- Définition : `bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)`

**Policy 3** :
- Nom : `Restaurants can update menu images`
- Opération : `UPDATE`
- Définition : `bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)`

**Policy 4** :
- Nom : `Restaurants can delete menu images`
- Opération : `DELETE`
- Définition : `bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)`

#### Bucket `user-images`

**Policy 1** :
- Nom : `Public Access to User Images`
- Opération : `SELECT`
- Définition : `bucket_id = 'user-images'`

**Policy 2** :
- Nom : `Users can upload own images`
- Opération : `INSERT`
- Définition : `bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]`

**Policy 3** :
- Nom : `Users can update own images`
- Opération : `UPDATE`
- Définition : `bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]`

**Policy 4** :
- Nom : `Users can delete own images`
- Opération : `DELETE`
- Définition : `bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]`

#### Bucket `passports`

**Policy 1** :
- Nom : `Restaurants can view own passports`
- Opération : `SELECT`
- Définition : `bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]`

**Policy 2** :
- Nom : `Restaurants can upload own passports`
- Opération : `INSERT`
- Définition : `bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]`

**Policy 3** :
- Nom : `Admins can view all passports`
- Opération : `SELECT`
- Définition : `bucket_id = 'passports' AND EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.email = 'admin@taybo.com')`

---

## 🔄 Option 2 : Script SQL dans SQL Editor (À Essayer)

Si l'interface ne fonctionne pas, essayez ce script dans le **SQL Editor** :

1. Allez dans **SQL Editor**
2. Ouvrez le fichier : `scripts/create_storage_policies.sql`
3. Copiez tout le contenu
4. Collez dans le SQL Editor
5. Cliquez sur **Run**

**Note** : Cette méthode peut fonctionner si vous avez les bonnes permissions dans le SQL Editor, mais l'interface Dashboard est plus fiable.

---

## ✅ Vérification

Après avoir créé les policies, vérifiez avec cette requête dans le SQL Editor :

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

Vous devriez voir **15 policies** au total.

---

## 📊 Résumé

- **Total de policies** : 15
- **Méthode recommandée** : Interface Dashboard (Storage > Policies)
- **Script disponible** : `scripts/create_storage_policies.sql` (pour essayer dans SQL Editor)
- **Guide détaillé** : `GUIDE_CREATION_POLICIES_STORAGE.md`

---

## 🎯 Pourquoi cette erreur ?

Dans Supabase, le schéma `storage` est géré par le système et nécessite des permissions spéciales. L'API Supabase et même certaines configurations SQL n'ont pas ces permissions par défaut. L'interface Dashboard utilise des permissions élevées qui permettent de créer ces policies.

**C'est normal et attendu** - utilisez l'interface Dashboard, c'est la méthode officielle recommandée par Supabase.

---

## 🚀 Une fois les Policies Créées

1. ✅ Les buckets Storage seront fonctionnels
2. ✅ Les images pourront être uploadées et affichées
3. ✅ Les permissions seront correctement configurées
4. ✅ L'application pourra utiliser Storage sans problème

**L'application sera alors complètement configurée !** 🎉

