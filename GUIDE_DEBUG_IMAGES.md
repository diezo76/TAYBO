# Guide de Débogage - Images de Profil des Restaurants

## Problème
Les images de profil des restaurants ne s'affichent pas dans la page d'accueil.

## Étapes de Débogage

### 1. Vérifier les Logs dans la Console du Navigateur

Ouvrez la console du navigateur (F12 ou Cmd+Option+I) et regardez les logs qui commencent par `[imageUtils]` et `[RestaurantCard]`.

Ces logs vous indiqueront :
- L'URL originale stockée dans la base de données
- L'URL transformée utilisée pour charger l'image
- Le type d'URL détecté (complète, chemin relatif, etc.)

### 2. Vérifier l'URL dans la Base de Données

Dans Supabase Dashboard :
1. Allez dans **Table Editor** > **restaurants**
2. Trouvez un restaurant avec une image
3. Vérifiez le champ `image_url`
4. Notez le format de l'URL

**Formats possibles :**
- URL complète : `https://[project].supabase.co/storage/v1/object/public/restaurant-images/[restaurantId]/[timestamp].ext`
- Chemin relatif : `[restaurantId]/[timestamp].ext`
- URL signée : `https://[project].supabase.co/storage/v1/object/sign/restaurant-images/...`

### 3. Tester l'URL Directement

Copiez l'URL depuis la base de données et testez-la directement dans le navigateur :
- Si l'URL fonctionne → Le problème vient du code
- Si l'URL ne fonctionne pas → Le problème vient de Supabase Storage

### 4. Vérifier les Permissions du Bucket

Dans Supabase Dashboard :
1. Allez dans **Storage** > **restaurant-images**
2. Vérifiez que le bucket est marqué comme **Public**
3. Vérifiez les **Policies** :
   - Doit avoir une policy pour permettre la lecture publique
   - Format attendu : `SELECT` pour `public` ou `authenticated`

### 5. Vérifier que l'Image Existe dans le Bucket

Dans Supabase Dashboard :
1. Allez dans **Storage** > **restaurant-images**
2. Vérifiez que les fichiers existent réellement
3. Cliquez sur un fichier pour voir son URL publique

### 6. Vérifier les Erreurs CORS

Dans la console du navigateur, regardez s'il y a des erreurs CORS :
- Si oui → Vérifiez la configuration CORS dans Supabase
- Les buckets publics ne devraient pas avoir de problèmes CORS

## Solutions Possibles

### Solution 1 : L'URL n'est pas correctement formatée

Si l'URL dans la base de données n'est pas une URL complète :
- La fonction `getRestaurantImageUrl()` devrait la transformer automatiquement
- Vérifiez les logs pour voir si la transformation fonctionne

### Solution 2 : Le bucket n'est pas vraiment public

Même si le bucket est marqué "Public", vérifiez les policies :
```sql
-- Dans Supabase SQL Editor, exécutez :
SELECT * FROM storage.policies 
WHERE bucket_id = 'restaurant-images';
```

### Solution 3 : L'image n'a pas été uploadée correctement

Vérifiez dans le service `uploadRestaurantImage` :
- L'upload se fait-il sans erreur ?
- L'URL retournée est-elle correcte ?
- L'URL est-elle bien sauvegardée dans la base de données ?

### Solution 4 : Problème de cache

Essayez :
- Vider le cache du navigateur
- Ouvrir en navigation privée
- Ajouter un paramètre de cache-busting à l'URL

## Test Rapide

Pour tester rapidement si le problème vient de l'URL ou du code :

1. Ouvrez la console du navigateur
2. Trouvez un restaurant avec une image dans la page d'accueil
3. Regardez les logs `[RestaurantCard]` et `[imageUtils]`
4. Copiez l'URL `processedUrl` depuis les logs
5. Collez-la dans un nouvel onglet du navigateur
6. Si l'image s'affiche → Le problème vient du composant React
7. Si l'image ne s'affiche pas → Le problème vient de l'URL ou de Supabase Storage

## Commandes Utiles

### Vérifier les restaurants avec images
```sql
SELECT id, name, image_url 
FROM restaurants 
WHERE image_url IS NOT NULL 
LIMIT 5;
```

### Vérifier les fichiers dans le bucket
Dans Supabase Dashboard > Storage > restaurant-images, vous devriez voir les fichiers organisés par restaurantId.

## Prochaines Étapes

Une fois que vous avez identifié le problème grâce aux logs :
1. Notez le format exact de l'URL dans la base de données
2. Notez l'URL transformée dans les logs
3. Testez l'URL directement dans le navigateur
4. Partagez ces informations pour une correction ciblée

