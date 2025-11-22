# Guide de Test - Upload d'Image de Profil Restaurant

## Informations de Connexion
- **Email** : `diezowee@gmail.com`
- **Mot de passe** : `Siinadiiezo29`

## Étapes de Test

### 1. Préparer l'Image de Test

1. Téléchargez ou préparez une image de test (format JPEG, PNG ou WebP)
2. Taille maximale : 5 MB
3. Formats acceptés : JPEG, PNG, WebP

### 2. Se Connecter en Tant que Restaurant

1. Ouvrez l'application dans votre navigateur (http://localhost:5173)
2. Allez sur la page de connexion restaurant : `/restaurant/login`
3. Connectez-vous avec :
   - Email : `diezowee@gmail.com`
   - Mot de passe : `Siinadiiezo29`
4. Vous devriez être redirigé vers le dashboard restaurant

### 3. Uploader l'Image

1. Dans le dashboard restaurant, allez dans **"Gérer le profil"** ou `/restaurant/profile`
2. Dans la section **"Image de profil"** :
   - Cliquez sur **"Choisir un fichier"**
   - Sélectionnez votre image de test
   - Cliquez sur **"Uploader l'image"**
3. Attendez que l'upload se termine
4. Vous devriez voir un message de succès et l'image devrait apparaître dans la prévisualisation
5. **IMPORTANT** : Cliquez sur **"Sauvegarder"** pour enregistrer l'URL dans la base de données

### 4. Vérifier dans la Console du Navigateur

Ouvrez la console du navigateur (F12) et vérifiez les logs :

1. **Lors de l'upload** :
   - Cherchez les logs `[imageUtils]` ou les logs d'erreur
   - Notez l'URL retournée par l'upload

2. **Lors de la sauvegarde** :
   - Vérifiez qu'il n'y a pas d'erreurs
   - Notez si la sauvegarde réussit

### 5. Vérifier dans Supabase Dashboard

1. Allez dans **Supabase Dashboard** > **Table Editor** > **restaurants**
2. Trouvez le restaurant avec l'email `diezowee@gmail.com`
3. Vérifiez le champ `image_url` :
   - Il devrait contenir une URL complète
   - Format attendu : `https://[project].supabase.co/storage/v1/object/public/restaurant-images/[restaurantId]/[timestamp].ext`

4. **Testez l'URL directement** :
   - Copiez l'URL depuis la base de données
   - Collez-la dans un nouvel onglet du navigateur
   - L'image devrait s'afficher

### 6. Vérifier dans le Storage Supabase

1. Allez dans **Supabase Dashboard** > **Storage** > **restaurant-images**
2. Vous devriez voir un dossier avec l'ID du restaurant
3. À l'intérieur, vous devriez voir le fichier image uploadé

### 7. Vérifier sur la Page d'Accueil

1. **Déconnectez-vous** du compte restaurant
2. **Connectez-vous en tant que client** (ou restez déconnecté si la page d'accueil est publique)
3. Allez sur la **page d'accueil** (`/` ou `/home`)
4. Cherchez le restaurant "test" dans la liste
5. **Ouvrez la console du navigateur** (F12) et regardez les logs :
   - Cherchez les logs `[RestaurantCard]` et `[imageUtils]`
   - Notez l'URL originale et l'URL transformée

6. **Vérifiez visuellement** :
   - L'image devrait s'afficher dans la carte du restaurant
   - Si ce n'est pas le cas, regardez les logs d'erreur dans la console

### 8. Débogage si l'Image ne S'Affiche Pas

#### Vérifier les Logs dans la Console

Les logs devraient afficher :
```
[RestaurantCard] Restaurant: [nom] {
  originalUrl: "[URL depuis la DB]",
  processedUrl: "[URL transformée]"
}

[imageUtils] getRestaurantImageUrl - URL originale: [URL]
[imageUtils] URL complète détectée (ou autre type détecté)
```

#### Problèmes Possibles et Solutions

1. **L'URL dans la DB est vide ou null**
   - Vérifiez que vous avez bien cliqué sur "Sauvegarder" après l'upload
   - Vérifiez qu'il n'y a pas eu d'erreur lors de la sauvegarde

2. **L'URL dans la DB est incorrecte**
   - Vérifiez le format de l'URL
   - Testez l'URL directement dans le navigateur
   - Si l'URL ne fonctionne pas, le problème vient de Supabase Storage

3. **L'image ne charge pas malgré une URL correcte**
   - Vérifiez les erreurs CORS dans la console
   - Vérifiez que le bucket est bien public
   - Vérifiez les permissions du bucket

4. **L'URL transformée est différente de l'URL originale**
   - C'est normal si l'URL originale était un chemin relatif
   - Vérifiez que l'URL transformée fonctionne dans le navigateur

### 9. Commandes SQL Utiles pour Vérifier

Dans Supabase Dashboard > SQL Editor :

```sql
-- Vérifier le restaurant et son image
SELECT id, name, email, image_url, is_active, is_verified
FROM restaurants
WHERE email = 'diezowee@gmail.com';

-- Vérifier tous les restaurants avec des images
SELECT id, name, image_url
FROM restaurants
WHERE image_url IS NOT NULL
AND is_active = true
AND is_verified = true;
```

### 10. Vérifier les Permissions du Bucket

Dans Supabase Dashboard > Storage > restaurant-images > Policies :

1. Vérifiez qu'il y a une policy pour la lecture publique :
   - Policy name : `Public Access`
   - Operation : `SELECT`
   - Target roles : `public` ou `authenticated`
   - Policy : `true` (toujours vrai)

2. Si la policy n'existe pas, créez-la :
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'restaurant-images');
   ```

## Checklist de Vérification

- [ ] L'upload de l'image réussit sans erreur
- [ ] L'image apparaît dans la prévisualisation après l'upload
- [ ] La sauvegarde réussit sans erreur
- [ ] L'URL est bien enregistrée dans la base de données
- [ ] L'URL fonctionne quand testée directement dans le navigateur
- [ ] Le fichier existe dans le bucket Storage Supabase
- [ ] Le restaurant apparaît dans la liste de la page d'accueil
- [ ] L'image s'affiche correctement dans la carte du restaurant
- [ ] Les logs dans la console ne montrent pas d'erreurs
- [ ] Le bucket Storage est bien public
- [ ] Les permissions du bucket permettent la lecture publique

## Résultat Attendu

Après avoir suivi toutes ces étapes :
- L'image devrait être uploadée avec succès
- L'URL devrait être sauvegardée dans la base de données
- L'image devrait s'afficher correctement sur la page d'accueil dans la carte du restaurant

Si l'image ne s'affiche toujours pas, notez :
1. Les logs de la console (copiez-les)
2. L'URL stockée dans la base de données
3. Le résultat du test de l'URL dans le navigateur
4. Toute erreur visible dans la console

