# Guide - Création des Policies Storage via l'Interface Supabase

## Problème

L'erreur `must be owner of relation objects` indique que les permissions nécessaires pour créer des policies Storage via SQL ne sont pas disponibles. Dans Supabase, les policies Storage doivent souvent être créées via l'interface Dashboard.

## Solution : Créer les Policies via l'Interface Supabase

### Étape 1 : Accéder à Storage Policies

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet **Taybo**
3. Allez dans **Storage** dans le menu de gauche
4. Cliquez sur **Policies** (ou allez directement dans **Storage** > **Policies**)

### Étape 2 : Créer les Policies pour chaque Bucket

Pour chaque bucket, vous devez créer les policies suivantes. Cliquez sur **New Policy** pour chaque policy.

---

## Bucket : `restaurant-images` (Public)

### Policy 1 : Public Access (SELECT)

- **Policy Name** : `Public Access to Restaurant Images`
- **Allowed Operation** : `SELECT`
- **Policy Definition** :
```sql
bucket_id = 'restaurant-images'
```

### Policy 2 : Restaurants Upload (INSERT)

- **Policy Name** : `Restaurants can upload own images`
- **Allowed Operation** : `INSERT`
- **Policy Definition** :
```sql
bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 3 : Restaurants Update (UPDATE)

- **Policy Name** : `Restaurants can update own images`
- **Allowed Operation** : `UPDATE`
- **Policy Definition** :
```sql
bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 4 : Restaurants Delete (DELETE)

- **Policy Name** : `Restaurants can delete own images`
- **Allowed Operation** : `DELETE`
- **Policy Definition** :
```sql
bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

---

## Bucket : `menu-images` (Public)

### Policy 1 : Public Access (SELECT)

- **Policy Name** : `Public Access to Menu Images`
- **Allowed Operation** : `SELECT`
- **Policy Definition** :
```sql
bucket_id = 'menu-images'
```

### Policy 2 : Restaurants Upload (INSERT)

- **Policy Name** : `Restaurants can upload menu images`
- **Allowed Operation** : `INSERT`
- **Policy Definition** :
```sql
bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)
```

### Policy 3 : Restaurants Update (UPDATE)

- **Policy Name** : `Restaurants can update menu images`
- **Allowed Operation** : `UPDATE`
- **Policy Definition** :
```sql
bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)
```

### Policy 4 : Restaurants Delete (DELETE)

- **Policy Name** : `Restaurants can delete menu images`
- **Allowed Operation** : `DELETE`
- **Policy Definition** :
```sql
bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)
```

---

## Bucket : `user-images` (Public)

### Policy 1 : Public Access (SELECT)

- **Policy Name** : `Public Access to User Images`
- **Allowed Operation** : `SELECT`
- **Policy Definition** :
```sql
bucket_id = 'user-images'
```

### Policy 2 : Users Upload (INSERT)

- **Policy Name** : `Users can upload own images`
- **Allowed Operation** : `INSERT`
- **Policy Definition** :
```sql
bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 3 : Users Update (UPDATE)

- **Policy Name** : `Users can update own images`
- **Allowed Operation** : `UPDATE`
- **Policy Definition** :
```sql
bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 4 : Users Delete (DELETE)

- **Policy Name** : `Users can delete own images`
- **Allowed Operation** : `DELETE`
- **Policy Definition** :
```sql
bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

---

## Bucket : `passports` (Privé)

### Policy 1 : Restaurants View (SELECT)

- **Policy Name** : `Restaurants can view own passports`
- **Allowed Operation** : `SELECT`
- **Policy Definition** :
```sql
bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 2 : Restaurants Upload (INSERT)

- **Policy Name** : `Restaurants can upload own passports`
- **Allowed Operation** : `INSERT`
- **Policy Definition** :
```sql
bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Policy 3 : Admins View (SELECT)

- **Policy Name** : `Admins can view all passports`
- **Allowed Operation** : `SELECT`
- **Policy Definition** :
```sql
bucket_id = 'passports' AND EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.email = 'admin@taybo.com')
```

---

## Instructions Détaillées pour l'Interface

### Pour chaque Policy :

1. **Cliquez sur le bucket** dans la liste (ex: `restaurant-images`)
2. **Cliquez sur "New Policy"** ou l'icône "+"
3. **Remplissez le formulaire** :
   - **Policy Name** : Le nom de la policy (ex: "Public Access to Restaurant Images")
   - **Allowed Operation** : Sélectionnez SELECT, INSERT, UPDATE ou DELETE
   - **Policy Definition** : Collez la définition SQL correspondante
4. **Cliquez sur "Save"** ou "Create Policy"

### Alternative : Via SQL Editor

Si vous préférez utiliser le SQL Editor :

1. Allez dans **SQL Editor**
2. Ouvrez le fichier `supabase/migrations/016_setup_storage_policies.sql`
3. **Copiez chaque bloc CREATE POLICY** un par un
4. **Exécutez chaque bloc séparément** (pas tout en une fois)
5. Si une policy existe déjà, utilisez `DROP POLICY IF EXISTS` avant `CREATE POLICY`

---

## Vérification

Après avoir créé toutes les policies, vérifiez qu'elles sont bien créées :

1. Allez dans **Storage** > **Policies**
2. Vérifiez que chaque bucket a les policies correspondantes
3. Ou exécutez cette requête dans le SQL Editor :

```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

Vous devriez voir toutes les policies listées ci-dessus.

---

## Résumé des Policies à Créer

- **restaurant-images** : 4 policies (SELECT, INSERT, UPDATE, DELETE)
- **menu-images** : 4 policies (SELECT, INSERT, UPDATE, DELETE)
- **user-images** : 4 policies (SELECT, INSERT, UPDATE, DELETE)
- **passports** : 3 policies (SELECT pour restaurants, INSERT pour restaurants, SELECT pour admins)

**Total** : 15 policies à créer

---

## En Cas de Problème

Si vous rencontrez des problèmes :

1. **Vérifiez que les buckets existent** : Storage > Buckets
2. **Vérifiez que les buckets sont publics** (pour restaurant-images, menu-images, user-images)
3. **Vérifiez les permissions** : Les policies doivent être créées avec le bon rôle
4. **Consultez les logs** : Supabase Dashboard > Logs > Postgres

---

**Note** : Cette méthode via l'interface est recommandée par Supabase pour créer les policies Storage, car elle évite les problèmes de permissions.

