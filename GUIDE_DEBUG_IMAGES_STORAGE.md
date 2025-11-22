# Guide de Débogage - Images Storage Supabase

## Problème : Images non chargées dans RestaurantCard

Si vous voyez l'erreur `[RestaurantCard] Image non disponible` avec une URL qui semble correcte, voici comment diagnostiquer et résoudre le problème.

## Diagnostic

### 1. Vérifier que le bucket existe

1. Allez dans **Supabase Dashboard** > **Storage**
2. Vérifiez que le bucket `restaurant-images` existe
3. Si le bucket n'existe pas, créez-le (voir `supabase/STORAGE_SETUP.md`)

### 2. Vérifier que le bucket est public

1. Dans **Storage**, cliquez sur le bucket `restaurant-images`
2. Allez dans l'onglet **Settings**
3. Vérifiez que **Public bucket** est activé (✅)
4. Si ce n'est pas le cas, activez-le

### 3. Vérifier les permissions du bucket

1. Dans **Storage** > `restaurant-images` > **Policies**
2. Vérifiez qu'il existe une policy pour la lecture publique :

```sql
-- Policy pour lecture publique
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');
```

### 4. Vérifier que le fichier existe

1. Dans **Storage** > `restaurant-images`
2. Naviguez dans les dossiers pour trouver le fichier
3. Le chemin devrait être : `cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763324258222.jpeg`
4. Si le fichier n'existe pas, il faut le ré-uploader

### 5. Tester l'URL directement

Copiez l'URL complète de l'image et testez-la directement dans votre navigateur :

```
https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763324258222.jpeg
```

- Si l'image s'affiche : Le problème vient du code React
- Si vous voyez une erreur 404 : Le fichier n'existe pas
- Si vous voyez une erreur 403 : Problème de permissions
- Si vous voyez une erreur CORS : Problème de configuration CORS

## Solutions

### Solution 1 : Ré-uploader l'image

Si le fichier n'existe pas dans le bucket :

1. Allez dans la page de gestion du profil restaurant
2. Ré-uploadez l'image du restaurant
3. Vérifiez que l'upload réussit

### Solution 2 : Corriger les permissions

Si le bucket n'est pas public ou si les policies sont incorrectes :

1. **Rendre le bucket public** :
   - Storage > `restaurant-images` > Settings
   - Activez "Public bucket"

2. **Créer la policy de lecture publique** :
   ```sql
   -- Dans Supabase SQL Editor
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'restaurant-images');
   ```

### Solution 3 : Vérifier la configuration CORS

Si vous voyez des erreurs CORS :

1. Dans **Supabase Dashboard** > **Storage** > **Settings**
2. Vérifiez la configuration CORS
3. Assurez-vous que votre domaine est autorisé

### Solution 4 : Vérifier le format de l'URL

L'URL devrait avoir ce format :
```
https://[project-ref].supabase.co/storage/v1/object/public/restaurant-images/[restaurant-id]/[filename]
```

Si l'URL est différente, vérifiez la fonction `getRestaurantImageUrl` dans `src/utils/imageUtils.js`.

## Vérifications dans le Code

### Vérifier imageUtils.js

Le fichier `src/utils/imageUtils.js` devrait correctement générer les URLs publiques. Vérifiez que :

1. La fonction `getRestaurantImageUrl` retourne bien une URL publique
2. Le bucket name est correct (`restaurant-images`)
3. Le chemin du fichier est correctement extrait

### Vérifier le service d'upload

Si vous uploadez des images, vérifiez que :

1. Le bucket utilisé est `restaurant-images`
2. Le chemin est correctement formaté : `restaurantId/timestamp.ext`
3. L'URL retournée est bien une URL publique

## Commandes Utiles

### Vérifier les fichiers dans un bucket (via Supabase CLI)

```bash
supabase storage ls restaurant-images
```

### Uploader un fichier de test

```bash
supabase storage upload restaurant-images/test.jpg ./test.jpg
```

## Logs Utiles

Dans la console du navigateur, vous devriez voir :

1. `[imageUtils] getRestaurantImageUrl - URL originale:` - L'URL originale depuis la DB
2. `[imageUtils] URL publique générée:` - L'URL finale générée
3. `[RestaurantCard] Image non disponible:` - Si l'image ne se charge pas

Ces logs vous aideront à identifier où le problème se situe.

## Problèmes Courants

### 1. Bucket non public
**Symptôme** : Erreur 403 Forbidden  
**Solution** : Rendre le bucket public dans les settings

### 2. Fichier inexistant
**Symptôme** : Erreur 404 Not Found  
**Solution** : Ré-uploader l'image

### 3. Chemin incorrect
**Symptôme** : URL malformée  
**Solution** : Vérifier le format du chemin dans la DB et dans imageUtils.js

### 4. CORS
**Symptôme** : Erreur CORS dans la console  
**Solution** : Vérifier la configuration CORS dans Supabase

## Support

Si le problème persiste après avoir vérifié tous ces points :

1. Vérifiez les logs dans la console du navigateur
2. Vérifiez les logs dans Supabase Dashboard > Logs
3. Testez l'URL directement dans le navigateur
4. Vérifiez que le bucket et les policies sont correctement configurés

