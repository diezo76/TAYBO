# Guide : Tester l'URL de l'Image Directement

## Problème
L'image de "Daynite" ne s'affiche pas malgré une URL correcte dans la base de données.

## Solution : Tester l'URL Directement

### Étape 1 : Obtenir l'URL

Exécutez cette requête SQL dans Supabase :

```sql
SELECT image_url
FROM restaurants
WHERE id = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf';
```

**URL actuelle** :
```
https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763322801994.jpg
```

### Étape 2 : Tester l'URL dans le Navigateur

1. **Copiez l'URL** ci-dessus
2. **Collez-la** dans une nouvelle fenêtre de votre navigateur
3. **Appuyez sur Entrée**

### Résultats Possibles

#### ✅ Si l'image s'affiche
**Le problème vient du code React**, pas de Supabase Storage.

**Solutions** :
1. ✅ J'ai déjà retiré `crossOrigin="anonymous"` qui peut causer des problèmes CORS
2. ✅ J'ai amélioré la fonction de validation pour mieux gérer les erreurs
3. **Videz le cache du navigateur** : `Ctrl+Shift+R` (ou `Cmd+Shift+R` sur Mac)
4. **Redémarrez le serveur** : `npm run dev`
5. **Rechargez la page** : L'image devrait maintenant s'afficher

#### ❌ Si l'image ne s'affiche pas (erreur 403 ou 404)
**Le problème vient de Supabase Storage**.

**Vérifications** :
1. **Vérifier que le bucket est public** :
   ```sql
   SELECT name, public FROM storage.buckets WHERE name = 'restaurant-images';
   ```
   Doit retourner `public: true`

2. **Vérifier que le fichier existe** :
   ```sql
   SELECT name, created_at, metadata->>'mimetype' as mimetype
   FROM storage.objects
   WHERE bucket_id = 'restaurant-images'
     AND name = 'cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763322801994.jpg';
   ```

3. **Vérifier les policies RLS** :
   ```sql
   SELECT policyname, cmd
   FROM pg_policies
   WHERE schemaname = 'storage' 
     AND tablename = 'objects'
     AND policyname LIKE '%Restaurant%Images%';
   ```

## Corrections Appliquées dans le Code

### 1. Retrait de `crossOrigin="anonymous"`

**Avant** :
```jsx
<img
  src={imageUrl}
  crossOrigin="anonymous"  // ❌ Peut causer des problèmes CORS
/>
```

**Après** :
```jsx
<img
  src={imageUrl}
  // ✅ crossOrigin retiré
/>
```

### 2. Amélioration de la Validation

**Avant** :
- La fonction retournait `false` en cas d'erreur
- Cela bloquait l'affichage même si le fichier existait

**Après** :
- La fonction retourne `true` en cas d'erreur (fallback)
- Cela permet à l'image de s'afficher même si la vérification échoue

## Test Final

1. **Videz le cache** : `Ctrl+Shift+R`
2. **Redémarrez le serveur** : `npm run dev`
3. **Ouvrez** : http://localhost:5173
4. **Vérifiez** que l'image de "Daynite" s'affiche

Si l'image s'affiche dans le navigateur directement mais pas dans l'application, les corrections du code devraient résoudre le problème.

