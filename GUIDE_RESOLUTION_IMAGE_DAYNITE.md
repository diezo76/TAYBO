# Guide de Résolution - Image Manquante pour "Daynite"

## 🔍 Problème

L'image du restaurant "Daynite" ne se charge pas. L'erreur indique que le fichier n'est pas accessible à l'URL :
```
https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763363673987.jpg
```

## 🔎 Causes Possibles

1. **Le fichier n'existe pas dans le storage Supabase**
   - Le fichier a été supprimé accidentellement
   - Le fichier n'a jamais été uploadé correctement

2. **Le bucket n'est pas configuré comme public**
   - Le bucket `restaurant-images` doit être marqué comme public dans Supabase

3. **Les policies RLS ne sont pas correctement configurées**
   - La policy "Public Access to Restaurant Images" doit exister

4. **L'URL dans la base de données est incorrecte**
   - L'`image_url` dans la table `restaurants` pointe vers un fichier qui n'existe pas

## 🛠️ Solutions

### Solution 1 : Diagnostic Complet

Exécutez le script de diagnostic dans le SQL Editor de Supabase :

**Fichier** : `scripts/diagnose-daynite-image.sql`

Ce script va :
- Trouver le restaurant "Daynite"
- Vérifier si le fichier existe dans le storage
- Vérifier la configuration du bucket
- Vérifier les policies RLS
- Afficher des recommandations

### Solution 2 : Correction Automatique

Exécutez le script de correction dans le SQL Editor de Supabase :

**Fichier** : `scripts/fix-daynite-image.sql`

Ce script va :
- Trouver le restaurant "Daynite"
- Vérifier si le fichier existe
- Mettre `image_url` à `NULL` si le fichier n'existe pas
- Vérifier et corriger la configuration du bucket et des policies

### Solution 3 : Vérification Manuelle

1. **Vérifier le bucket dans Supabase Dashboard** :
   - Allez dans **Storage** > **restaurant-images**
   - Vérifiez que le bucket est marqué comme **Public**
   - Si non, allez dans **Settings** et activez **Public bucket**

2. **Vérifier les policies RLS** :
   - Allez dans **Storage** > **Policies**
   - Vérifiez que la policy "Public Access to Restaurant Images" existe
   - Si non, exécutez `scripts/fix-storage-policies.sql`

3. **Vérifier le fichier dans le storage** :
   - Allez dans **Storage** > **restaurant-images**
   - Cherchez le dossier avec l'ID du restaurant : `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`
   - Vérifiez si le fichier `1763363673987.jpg` existe

4. **Corriger l'image_url si nécessaire** :
   - Si le fichier n'existe pas, mettez `image_url` à `NULL` dans la table `restaurants`
   - Le restaurant pourra ensuite uploader une nouvelle image via son profil

### Solution 4 : Upload d'une Nouvelle Image

Si le fichier n'existe pas, le restaurant peut uploader une nouvelle image :

1. Le restaurant se connecte à son compte
2. Va dans **Profil** ou **Paramètres**
3. Upload une nouvelle image de profil
4. L'image sera automatiquement sauvegardée dans le storage

## 📋 Checklist de Vérification

- [ ] Le bucket `restaurant-images` existe et est public
- [ ] La policy "Public Access to Restaurant Images" existe
- [ ] Le fichier existe dans le storage Supabase
- [ ] L'`image_url` dans la base de données correspond au fichier réel
- [ ] Les permissions RLS sont correctement configurées

## 🔧 Scripts Disponibles

1. **`scripts/diagnose-daynite-image.sql`** : Diagnostic complet
2. **`scripts/fix-daynite-image.sql`** : Correction automatique
3. **`scripts/check-storage-setup.sql`** : Vérification générale du storage
4. **`scripts/fix-storage-policies.sql`** : Correction des policies RLS

## 📝 Notes

- Le composant `RestaurantCard` a été amélioré pour mieux gérer les erreurs d'images
- En mode développement, des logs supplémentaires sont affichés pour aider au débogage
- Si l'image n'est pas disponible, un placeholder est affiché automatiquement

## 🚀 Actions Immédiates

1. Exécutez `scripts/diagnose-daynite-image.sql` pour identifier le problème exact
2. Suivez les recommandations affichées par le script
3. Si le fichier n'existe pas, exécutez `scripts/fix-daynite-image.sql` pour corriger
4. Vérifiez que le bucket est public et que les policies sont correctes

