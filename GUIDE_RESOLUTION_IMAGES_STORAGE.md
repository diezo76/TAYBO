# Guide de Résolution - Images de Restaurants Non Accessibles

## 🔴 Problème Identifié

Les images des restaurants ne se chargent pas et vous voyez cette erreur dans la console :

```
[RestaurantCard] Image non disponible:
attemptedSrc: "https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/..."
error: "L'image ne peut pas être chargée..."
```

## 🎯 Cause Principale

Le problème vient de **l'absence de policies RLS (Row Level Security)** sur les buckets Supabase Storage. Même si le bucket est public, **les policies RLS doivent être configurées** pour autoriser l'accès aux fichiers.

## ✅ Solution en 3 Étapes

### Étape 1 : Vérifier la Configuration Actuelle

1. **Connectez-vous à Supabase Dashboard** : https://supabase.com/dashboard
2. **Ouvrez le SQL Editor**
3. **Copiez et exécutez** le script : `scripts/check-storage-setup.sql`
4. **Analysez les résultats** pour comprendre ce qui manque

Le script vous montrera :
- ✅ Si les buckets existent
- ✅ Si les buckets sont publics
- ✅ Si les policies sont configurées
- ✅ Le nombre de fichiers dans chaque bucket
- ✅ Les restaurants avec/sans images

### Étape 2 : Appliquer les Policies RLS

**Option A : Via Migration (Recommandé)**

1. Dans **Supabase Dashboard** > **SQL Editor**
2. Ouvrez le fichier : `supabase/migrations/016_setup_storage_policies.sql`
3. Copiez tout le contenu
4. Collez dans le SQL Editor
5. Cliquez sur **Run**

**Option B : Script de Correction Rapide**

Si vous avez déjà des policies et voulez les réinitialiser :

1. Dans **Supabase Dashboard** > **SQL Editor**
2. Ouvrez le fichier : `scripts/fix-storage-policies.sql`
3. Copiez tout le contenu
4. Collez dans le SQL Editor
5. Cliquez sur **Run**

### Étape 3 : Vérifier que Tout Fonctionne

1. **Rafraîchissez votre application** (Ctrl+F5 ou Cmd+Shift+R)
2. **Vérifiez que les images se chargent** maintenant
3. **Si le problème persiste**, passez à l'étape de diagnostic avancé ci-dessous

## 🔍 Diagnostic Avancé

Si les images ne se chargent toujours pas après avoir appliqué les policies :

### 1. Vérifier que le Bucket Existe et est Public

1. Allez dans **Supabase Dashboard** > **Storage**
2. Vérifiez que le bucket `restaurant-images` existe
3. Cliquez sur `restaurant-images`
4. Allez dans l'onglet **Settings**
5. Vérifiez que **"Public bucket"** est activé (✅)

**Si le bucket n'existe pas :**

1. Cliquez sur **"New bucket"**
2. Nom : `restaurant-images`
3. Public : ✅ **OUI** (coché)
4. File size limit : `5242880` (5 MB)
5. Allowed MIME types : `image/jpeg,image/png,image/webp`
6. Cliquez sur **"Create bucket"**

### 2. Vérifier que le Fichier Existe

1. Dans **Storage** > `restaurant-images`
2. Naviguez dans les dossiers
3. Cherchez le dossier avec l'ID du restaurant : `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`
4. Vérifiez que le fichier `1763328629876.jpeg` existe

**Si le fichier n'existe pas :**

Le fichier n'a jamais été uploadé ou a été supprimé. Vous devez :
1. Vous connecter en tant que restaurant
2. Aller dans **Gestion du Profil**
3. Ré-uploader l'image

### 3. Tester l'URL Directement

Copiez l'URL de l'image depuis l'erreur et testez-la dans un nouvel onglet du navigateur :

```
https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763328629876.jpeg
```

**Résultats possibles :**

| Code | Signification | Solution |
|------|---------------|----------|
| ✅ 200 | L'image s'affiche | Le problème vient du frontend (cache navigateur) - Videz le cache |
| ❌ 404 | Fichier non trouvé | Le fichier n'existe pas → Ré-uploader l'image |
| ❌ 403 | Accès refusé | Policies RLS incorrectes → Exécuter `fix-storage-policies.sql` |
| ❌ 400 | Bucket introuvable | Le bucket n'existe pas → Créer le bucket |

### 4. Vérifier les Policies RLS

Dans **Supabase Dashboard** > **SQL Editor**, exécutez :

```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    policyname LIKE '%Restaurant%' 
    OR qual LIKE '%restaurant-images%'
  );
```

**Vous devriez voir au minimum :**
- ✅ `Public Access to Restaurant Images` (SELECT)
- ✅ `Restaurants can upload own images` (INSERT)
- ✅ `Restaurants can delete own images` (DELETE)

**Si ces policies manquent :**
→ Exécutez `scripts/fix-storage-policies.sql`

### 5. Vérifier les Logs Supabase

1. Allez dans **Supabase Dashboard** > **Logs** > **Storage Logs**
2. Recherchez les requêtes récentes vers `restaurant-images`
3. Vérifiez s'il y a des erreurs 403 ou 404
4. Les erreurs vous donneront plus de détails sur le problème

## 📝 Checklist de Vérification

Avant de déclarer que le problème est résolu, vérifiez que :

- [ ] Le bucket `restaurant-images` existe
- [ ] Le bucket `restaurant-images` est **public**
- [ ] Les policies RLS sont créées (au moins la policy de lecture publique)
- [ ] Le fichier existe dans le bucket (visible dans Storage UI)
- [ ] L'URL fonctionne directement dans le navigateur (code 200)
- [ ] L'image se charge dans l'application
- [ ] Pas d'erreurs dans la console du navigateur
- [ ] Les nouveaux uploads fonctionnent

## 🚀 Actions Préventives pour l'Avenir

Pour éviter ce problème à l'avenir :

### 1. Exécuter Toutes les Migrations

Assurez-vous que toutes les migrations sont exécutées, y compris la nouvelle :

```bash
# Dans l'ordre :
001_create_users_table.sql
002_create_restaurants_table.sql
...
015_fix_rls_policies.sql
016_setup_storage_policies.sql  ← NOUVELLE !
```

### 2. Vérifier les Buckets après Chaque Déploiement

Après chaque déploiement ou création d'un nouveau projet Supabase :

1. Vérifiez que les 4 buckets existent :
   - ✅ `restaurant-images` (public)
   - ✅ `menu-images` (public)
   - ✅ `user-images` (public)
   - ✅ `passports` (privé)

2. Vérifiez que les policies sont appliquées

### 3. Tester l'Upload d'Images

Après la configuration :

1. Créez un compte restaurant
2. Uploadez une image de profil
3. Vérifiez que l'image s'affiche sur la page d'accueil
4. Vérifiez qu'il n'y a pas d'erreurs dans la console

## 🆘 Aide Supplémentaire

Si le problème persiste après avoir suivi toutes ces étapes :

1. **Vérifiez la configuration de Supabase** :
   - Projet ID correct dans `.env`
   - Clé ANON correcte dans `.env`
   - Pas de CORS bloqués (vérifiez dans Network tab)

2. **Consultez les autres guides** :
   - `GUIDE_DEBUG_IMAGES_STORAGE.md`
   - `GUIDE_DEBUG_IMAGES.md`
   - `GUIDE_TEST_LOCAL.md`

3. **Vérifiez les logs** :
   - Console navigateur (F12)
   - Network tab (F12 > Network)
   - Supabase Dashboard > Logs

4. **Testez avec un nouveau fichier** :
   - Uploadez une nouvelle image
   - Vérifiez si elle fonctionne
   - Si oui, le problème vient des anciennes images

## 📊 Logs Utiles pour le Débogage

En mode développement, vous verrez ces logs dans la console :

### Logs Normaux (Succès)
```
[imageUtils] getRestaurantImageUrl - URL originale: cb6dc3c1.../image.jpeg
[imageUtils] Chemin relatif détecté, génération URL publique: ...
[imageUtils] URL générée depuis chemin relatif: https://...
```

### Logs d'Erreur
```
[RestaurantCard] Image non disponible: { restaurant, attemptedSrc, error, ... }
[RestaurantCard] Fichier existe dans bucket: false
[RestaurantCard] ⚠️ Le fichier n'existe pas dans le bucket: ...
```

Ces logs vous aideront à identifier précisément où se situe le problème.

## ✨ Résumé

**Le problème principal** : Policies RLS manquantes sur storage.objects

**La solution** : Exécuter la migration `016_setup_storage_policies.sql`

**La vérification** : Tester l'URL directement dans le navigateur

**La prévention** : Toujours vérifier que les buckets ET les policies sont configurés

---

**Date de création** : 16 novembre 2024  
**Dernière mise à jour** : 16 novembre 2024

