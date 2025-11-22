# Instructions Rapides - Création des Policies Storage

## 🚀 Méthode Rapide (5-10 minutes)

### 1. Ouvrir Supabase Dashboard
https://supabase.com/dashboard → Votre projet → **Storage** → **Policies**

### 2. Pour chaque bucket, créer les policies suivantes :

---

## 📦 `restaurant-images` (4 policies)

**1. Public Access (SELECT)**
- Nom : `Public Access to Restaurant Images`
- Opération : `SELECT`
- SQL : `bucket_id = 'restaurant-images'`

**2. Restaurants Upload (INSERT)**
- Nom : `Restaurants can upload own images`
- Opération : `INSERT`
- SQL : `bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]`

**3. Restaurants Update (UPDATE)**
- Nom : `Restaurants can update own images`
- Opération : `UPDATE`
- SQL : `bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]`

**4. Restaurants Delete (DELETE)**
- Nom : `Restaurants can delete own images`
- Opération : `DELETE`
- SQL : `bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]`

---

## 📦 `menu-images` (4 policies)

**1. Public Access (SELECT)**
- Nom : `Public Access to Menu Images`
- SQL : `bucket_id = 'menu-images'`

**2. Restaurants Upload (INSERT)**
- Nom : `Restaurants can upload menu images`
- SQL : `bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)`

**3. Restaurants Update (UPDATE)**
- Nom : `Restaurants can update menu images`
- SQL : `bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)`

**4. Restaurants Delete (DELETE)**
- Nom : `Restaurants can delete menu images`
- SQL : `bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)`

---

## 📦 `user-images` (4 policies)

**1. Public Access (SELECT)**
- Nom : `Public Access to User Images`
- SQL : `bucket_id = 'user-images'`

**2. Users Upload (INSERT)**
- Nom : `Users can upload own images`
- SQL : `bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]`

**3. Users Update (UPDATE)**
- Nom : `Users can update own images`
- SQL : `bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]`

**4. Users Delete (DELETE)**
- Nom : `Users can delete own images`
- SQL : `bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]`

---

## 📦 `passports` (3 policies)

**1. Restaurants View (SELECT)**
- Nom : `Restaurants can view own passports`
- SQL : `bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]`

**2. Restaurants Upload (INSERT)**
- Nom : `Restaurants can upload own passports`
- SQL : `bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]`

**3. Admins View (SELECT)**
- Nom : `Admins can view all passports`
- SQL : `bucket_id = 'passports' AND EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND users.email = 'admin@taybo.com')`

---

## ✅ Total : 15 policies à créer

Une fois terminé, rafraîchissez votre application (Ctrl+F5) et les images devraient se charger ! 🎉

