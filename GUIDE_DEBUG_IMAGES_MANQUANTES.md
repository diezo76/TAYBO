# 🔍 Guide de Débogage : Images de Restaurant Non Disponibles

## Problème

Les images des restaurants ne se chargent pas et affichent un message d'erreur dans la console :
```
[RestaurantCard] Image non disponible pour "Nom du Restaurant"
```

## Causes Possibles

### 1. Le fichier n'existe pas dans le bucket Supabase Storage

**Vérification** :
1. Allez dans votre projet Supabase Dashboard
2. Naviguez vers **Storage** > **restaurant-images**
3. Vérifiez que le dossier avec l'ID du restaurant existe (ex: `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`)
4. Vérifiez que le fichier image existe dans ce dossier

**Solution** :
- Si le fichier n'existe pas, téléchargez-le à nouveau depuis la page de gestion du profil restaurant
- Ou téléchargez-le manuellement dans Supabase Storage

### 2. Le bucket n'est pas public

**Vérification** :
1. Dans Supabase Dashboard, allez dans **Storage** > **restaurant-images**
2. Cliquez sur **Settings** (⚙️)
3. Vérifiez que **Public bucket** est coché ✅

**Solution** :
- Si ce n'est pas coché, cochez-le et sauvegardez

### 3. Les permissions RLS ne sont pas correctes

**Vérification** :
1. Dans Supabase Dashboard, allez dans **Storage** > **Policies**
2. Sélectionnez le bucket **restaurant-images**
3. Vérifiez qu'il existe une policy permettant la lecture publique

**Solution** :
- Exécutez la migration `016_setup_storage_policies.sql` si vous ne l'avez pas déjà fait
- Ou créez manuellement une policy avec cette requête SQL :

```sql
-- Policy pour permettre la lecture publique des images de restaurant
CREATE POLICY "Public Access for restaurant-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');
```

### 4. L'URL dans la base de données est incorrecte

**Vérification** :
1. Dans Supabase Dashboard, allez dans **Table Editor** > **restaurants**
2. Trouvez le restaurant concerné
3. Vérifiez la colonne `image_url`
4. L'URL devrait ressembler à :
   ```
   https://[project].supabase.co/storage/v1/object/public/restaurant-images/[restaurant-id]/[timestamp].jpg
   ```

**Solution** :
- Si l'URL est incorrecte ou vide, téléchargez une nouvelle image depuis la page de gestion du profil restaurant

## Test Rapide

Pour tester si le problème vient de l'URL ou des permissions :

1. **Copiez l'URL de l'image** depuis la console du navigateur
2. **Collez-la directement dans votre navigateur**
3. Si l'image s'affiche : le problème vient du code React
4. Si vous obtenez une erreur 403 : problème de permissions
5. Si vous obtenez une erreur 404 : le fichier n'existe pas

## Solution Rapide

Si vous voulez simplement masquer l'erreur pour l'instant :

1. Les images manquantes affichent déjà un placeholder (icône vélo)
2. Le message d'erreur n'apparaît qu'en mode développement
3. En production, les utilisateurs verront simplement le placeholder sans erreur

## Vérification Complète

Pour vérifier que tout est correctement configuré :

```bash
# 1. Vérifiez que le bucket existe et est public
# Dans Supabase Dashboard > Storage > restaurant-images > Settings

# 2. Vérifiez les policies RLS
# Dans Supabase Dashboard > Storage > Policies > restaurant-images

# 3. Testez l'upload d'une nouvelle image
# Depuis la page /restaurant/profile > Upload image
```

## Commandes SQL Utiles

### Vérifier les policies existantes
```sql
SELECT * FROM storage.policies 
WHERE bucket_id = 'restaurant-images';
```

### Créer une policy publique si elle n'existe pas
```sql
CREATE POLICY IF NOT EXISTS "Public Access for restaurant-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');
```

### Lister les fichiers dans le bucket
```sql
SELECT name, bucket_id, created_at 
FROM storage.objects 
WHERE bucket_id = 'restaurant-images'
ORDER BY created_at DESC;
```

## Contact Support

Si le problème persiste après avoir vérifié tous les points ci-dessus :
1. Vérifiez les logs Supabase dans **Logs** > **Storage**
2. Vérifiez les erreurs dans la console du navigateur
3. Vérifiez que votre projet Supabase est actif et non suspendu

