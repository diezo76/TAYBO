# Guide : Uploader une Image Manuellement dans Supabase Storage

## Vue d'ensemble

Si un restaurant n'a pas d'image ou si l'image ne s'affiche pas, vous pouvez uploader une image directement dans le bucket Storage Supabase via l'interface web.

## Étapes pour Uploader une Image

### Étape 1 : Trouver l'ID du Restaurant

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez le SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu latéral
   - Cliquez sur "New query"

3. **Exécutez cette requête** pour trouver l'ID du restaurant :
   ```sql
   SELECT id, name, image_url
   FROM restaurants
   WHERE LOWER(name) LIKE '%daynite%'
   ORDER BY name;
   ```

4. **Notez l'ID** du restaurant (format UUID, ex: `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`)

### Étape 2 : Accéder au Bucket Storage

1. **Dans Supabase Dashboard**, allez dans **Storage** (menu latéral)
2. **Cliquez sur le bucket** `restaurant-images`
3. Si le bucket n'existe pas, créez-le :
   - Cliquez sur "New bucket"
   - Nom : `restaurant-images`
   - Public : ✅ **Oui** (coché)
   - File size limit : 5 MB
   - Allowed MIME types : `image/jpeg, image/png, image/webp`

### Étape 3 : Créer le Dossier du Restaurant

1. **Dans le bucket `restaurant-images`**, vérifiez s'il existe un dossier avec l'ID du restaurant
2. **Si le dossier n'existe pas**, créez-le :
   - Cliquez sur "New folder" (ou "Create folder")
   - Nom du dossier : **l'ID complet du restaurant** (ex: `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`)
   - Cliquez sur "Create"

### Étape 4 : Uploader l'Image

1. **Ouvrez le dossier** du restaurant (cliquez dessus)
2. **Cliquez sur "Upload file"** (ou glissez-déposez l'image)
3. **Sélectionnez votre image** :
   - Formats acceptés : JPEG, PNG, WebP
   - Taille maximum : 5 MB
4. **L'image sera uploadée** avec un nom automatique (timestamp)

### Étape 5 : Mettre à Jour l'URL dans la Base de Données

Après avoir uploadé l'image, vous devez mettre à jour l'URL dans la table `restaurants`.

#### Option A : Utiliser le Script Automatique (Recommandé)

1. **Ouvrez le SQL Editor**
2. **Exécutez le script** `scripts/check-and-fix-restaurant-image.sql`
3. Le script va automatiquement :
   - Trouver le restaurant
   - Vérifier les fichiers dans le storage
   - Mettre à jour l'URL avec le fichier le plus récent

#### Option B : Mettre à Jour Manuellement

1. **Notez le nom du fichier** uploadé (visible dans Storage)
2. **Ouvrez le SQL Editor**
3. **Exécutez cette requête** (remplacez les valeurs) :

```sql
UPDATE restaurants
SET image_url = 'https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/RESTAURANT_ID/NOM_DU_FICHIER.jpg'
WHERE id = 'RESTAURANT_ID';
```

**Exemple concret** :
```sql
UPDATE restaurants
SET image_url = 'https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1700000000000.jpg'
WHERE id = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf';
```

### Étape 6 : Vérifier

1. **Videz le cache du navigateur** :
   - Chrome/Edge : `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
   - Firefox : `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)

2. **Redémarrez le serveur de développement** :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   ```

3. **Ouvrez l'application** : http://localhost:5173
4. **Vérifiez que l'image** du restaurant s'affiche correctement

## Structure des Fichiers dans le Storage

Les images sont organisées comme suit :

```
restaurant-images/
├── cb6dc3c1-294d-4162-adc6-20551b2bb6cf/  (ID du restaurant)
│   ├── 1700000000000.jpg                  (Image 1)
│   ├── 1700000001000.png                  (Image 2)
│   └── ...
├── autre-restaurant-id/
│   └── ...
```

**Format du nom de fichier** : `{restaurantId}/{timestamp}.{extension}`

**Format de l'URL** : 
```
https://{project}.supabase.co/storage/v1/object/public/restaurant-images/{restaurantId}/{timestamp}.{extension}
```

## Dépannage

### L'image ne s'affiche toujours pas après l'upload

1. **Vérifiez que le bucket est public** :
   - Storage > restaurant-images > Settings
   - Cochez "Public bucket" si ce n'est pas fait

2. **Vérifiez les permissions RLS** :
   - Exécutez le script `scripts/fix-storage-policies.sql`

3. **Vérifiez l'URL dans la DB** :
   ```sql
   SELECT id, name, image_url
   FROM restaurants
   WHERE id = 'VOTRE_RESTAURANT_ID';
   ```

4. **Testez l'URL directement** :
   - Copiez l'URL de l'image depuis la DB
   - Collez-la dans une nouvelle fenêtre du navigateur
   - Si l'image s'affiche → Le problème vient du code
   - Si l'image ne s'affiche pas → Le problème vient du Storage

### Erreur "Bucket not found"

Le bucket `restaurant-images` n'existe pas. Créez-le :
- Storage > New bucket
- Nom : `restaurant-images`
- Public : ✅ Oui

### Erreur "File too large"

La taille maximale est de 5 MB. Réduisez la taille de l'image :
- Utilisez un outil de compression d'image
- Ou modifiez la limite dans les paramètres du bucket

## Alternative : Utiliser le Script Automatique

Pour éviter les étapes manuelles, utilisez le script `scripts/check-and-fix-restaurant-image.sql` qui :

1. ✅ Trouve automatiquement le restaurant
2. ✅ Vérifie les fichiers dans le storage
3. ✅ Met à jour l'URL automatiquement
4. ✅ Affiche un diagnostic complet

**Utilisation** :
1. Ouvrez le fichier `scripts/check-and-fix-restaurant-image.sql`
2. Modifiez le nom du restaurant à la ligne 11 (ou utilisez l'ID)
3. Exécutez dans le SQL Editor
4. Suivez les instructions affichées

## Résumé

Pour uploader une image manuellement :

1. ✅ Trouvez l'ID du restaurant (SQL Editor)
2. ✅ Allez dans Storage > restaurant-images
3. ✅ Créez un dossier avec l'ID du restaurant
4. ✅ Uploadez l'image dans ce dossier
5. ✅ Exécutez `scripts/check-and-fix-restaurant-image.sql` pour mettre à jour l'URL
6. ✅ Videz le cache et vérifiez

L'image devrait maintenant s'afficher sur la page d'accueil !

