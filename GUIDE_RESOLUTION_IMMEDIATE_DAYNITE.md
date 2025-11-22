# Guide de Résolution Immédiate - Image Daynite

**Date** : 17 novembre 2025  
**Problème** : Image non disponible pour le restaurant "Daynite"  
**ID Restaurant** : `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`  
**URL problématique** : `https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763328629876.jpeg`

---

## 🎯 Solution Rapide (3 minutes)

### Étape 1 : Exécuter le Script de Correction

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez le SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu latéral
   - Cliquez sur "New query"

3. **Copiez et exécutez le script**
   - Ouvrez le fichier `scripts/fix-daynite-image-final.sql`
   - Copiez tout le contenu
   - Collez dans le SQL Editor
   - Cliquez sur "Run" (ou appuyez sur Ctrl+Enter)

4. **Lisez attentivement les résultats**
   - Le script va afficher un diagnostic complet
   - Il va corriger automatiquement le problème
   - Suivez les instructions marquées "À FAIRE" s'il y en a

### Étape 2 : Actions Requises (si nécessaire)

Le script peut indiquer des actions manuelles. Voici comment les résoudre :

#### ❌ Si "Bucket n'est PAS public"

1. Allez dans **Storage** > **restaurant-images**
2. Cliquez sur **Settings** (roue dentée)
3. Cochez **"Public bucket"**
4. Cliquez sur **Save**

#### ❌ Si "Policy SELECT manquante"

1. Retournez dans le **SQL Editor**
2. Ouvrez le fichier `scripts/fix-storage-policies.sql`
3. Copiez et exécutez le script complet
4. Vérifiez que "SUCCESS" s'affiche

#### ⚠️ Si "AUCUN fichier trouvé dans le storage"

Le restaurant doit uploader une nouvelle image :

1. Allez sur http://localhost:5173/restaurant/login
2. Connectez-vous avec le compte du restaurant
3. Allez dans **Profile**
4. Uploadez une nouvelle image

### Étape 3 : Tester l'Application

1. **Videz le cache du navigateur**
   ```
   Chrome/Edge : Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
   Firefox : Ctrl+F5 (Windows) ou Cmd+Shift+R (Mac)
   ```

2. **Redémarrez le serveur de développement**
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   ```

3. **Vérifiez l'image**
   - Ouvrez http://localhost:5173
   - Cherchez le restaurant "Daynite"
   - L'image devrait maintenant s'afficher
   - Si ce n'est pas le cas, un placeholder devrait s'afficher (icône de vélo)

---

## 🔍 Diagnostic Détaillé

### Pourquoi ce problème se produit ?

Le problème survient quand :
1. L'URL dans la base de données pointe vers un fichier qui n'existe pas
2. Le fichier a été supprimé du storage
3. Le bucket n'est pas configuré correctement (pas public ou pas de policy)

### Comment le script corrige le problème ?

Le script `fix-daynite-image-final.sql` fait automatiquement :

1. ✅ **Trouve le restaurant** "Daynite"
2. ✅ **Vérifie le bucket** (existe, public)
3. ✅ **Vérifie les policies** RLS
4. ✅ **Liste tous les fichiers** dans le storage pour ce restaurant
5. ✅ **Vérifie si le fichier** référencé existe
6. ✅ **Corrige automatiquement** :
   - Si un fichier existe → Met à jour avec le fichier le plus récent
   - Si aucun fichier → Met `image_url` à NULL (placeholder s'affichera)

### Système de Validation Automatique (déjà en place)

Le code de l'application a déjà un système de validation automatique :

- **Fichier** : `src/utils/imageValidation.js`
- **Fonctionnalités** :
  - Vérifie si le fichier existe dans le storage
  - Cherche un fichier alternatif si nécessaire
  - Affiche un placeholder si aucune image disponible

Ce système fonctionne **en plus** du script SQL pour garantir que l'application fonctionne même si l'URL dans la DB est incorrecte.

---

## 📋 Checklist de Vérification

Après avoir suivi les étapes ci-dessus, vérifiez :

- [ ] Le script SQL s'est exécuté sans erreur
- [ ] Le bucket `restaurant-images` existe et est **public**
- [ ] La policy "Public Access to Restaurant Images" existe
- [ ] L'`image_url` dans la DB est correcte (ou NULL)
- [ ] Le cache du navigateur a été vidé
- [ ] Le serveur de développement a été redémarré
- [ ] L'image s'affiche (ou un placeholder)
- [ ] Aucune erreur dans la console du navigateur

---

## 🚨 Si le problème persiste

Si après avoir suivi toutes les étapes, l'image ne s'affiche toujours pas :

### 1. Vérifiez la console du navigateur

Ouvrez la console (F12) et cherchez :
- Des erreurs 403 (problème de permissions)
- Des erreurs 404 (fichier non trouvé)
- Des warnings de CORS

### 2. Vérifiez l'URL finale dans la DB

Exécutez cette requête SQL :

```sql
SELECT id, name, image_url
FROM restaurants
WHERE id = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf';
```

L'URL doit ressembler à :
```
https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/XXXXXXXXX.jpeg
```

### 3. Testez l'URL directement

Copiez l'URL de l'image et collez-la dans une nouvelle fenêtre du navigateur.

- **Si l'image s'affiche** → Le problème vient du code de l'application
- **Si l'image ne s'affiche pas** → Le problème vient de la configuration du bucket

### 4. Vérifiez que le fichier existe

Exécutez cette requête SQL :

```sql
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'restaurant-images'
  AND name LIKE 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf/%'
ORDER BY created_at DESC;
```

Si aucun résultat → Le restaurant doit uploader une image

### 5. Réexécutez le script de correction

Parfois, il faut exécuter le script plusieurs fois :

1. Exécutez `scripts/fix-daynite-image-final.sql`
2. Notez toutes les actions "À FAIRE"
3. Effectuez ces actions
4. Réexécutez le script pour vérifier

---

## 📞 Informations de Débogage

Si vous devez contacter le support, fournissez ces informations :

```
Restaurant ID: cb6dc3c1-294d-4162-adc6-20551b2bb6cf
Restaurant Name: Daynite
Project URL: https://ocxesczzlzopbcobppok.supabase.co
Bucket: restaurant-images
Error: Image non disponible après validation
```

Et les résultats de ces requêtes SQL :

```sql
-- 1. État du restaurant
SELECT id, name, image_url FROM restaurants WHERE id = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf';

-- 2. Fichiers dans le storage
SELECT name, created_at FROM storage.objects WHERE bucket_id = 'restaurant-images' AND name LIKE 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf/%';

-- 3. Configuration du bucket
SELECT name, public FROM storage.buckets WHERE name = 'restaurant-images';

-- 4. Policies
SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

## ✅ Résultat Attendu

Après avoir suivi ce guide :

1. ✅ L'image de "Daynite" s'affiche correctement
   - **OU**
2. ✅ Un placeholder s'affiche (si aucune image dans le storage)
3. ✅ Aucune erreur dans la console du navigateur
4. ✅ Le système de validation automatique fonctionne

---

**Note** : Ce guide résout le problème pour le restaurant "Daynite", mais les mêmes principes s'appliquent à tous les restaurants ayant des problèmes d'images.

