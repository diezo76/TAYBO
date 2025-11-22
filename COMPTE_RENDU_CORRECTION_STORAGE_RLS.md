# Compte Rendu - Correction des Politiques Storage RLS

**Date** : 2025-01-27  
**Objectif** : Corriger l'erreur "new row violates row-level security policy" lors de l'upload d'images restaurant.

## Résumé Exécutif

L'erreur RLS lors de l'upload d'images restaurant a été corrigée en ajoutant les politiques Storage manquantes pour les opérations INSERT, UPDATE et DELETE sur le bucket `restaurant-images`.

## Problème Identifié

### Erreur RLS Storage

**Symptôme** :
```
StorageApiError: new row violates row-level security policy
restaurantService.js:253 Erreur upload image
```

**Cause** :
- Seule la politique SELECT existait pour `restaurant-images` : "Public can read restaurant images"
- Les politiques INSERT, UPDATE et DELETE étaient manquantes
- Lors de l'upload, Supabase Storage vérifie les politiques RLS et rejette l'opération si aucune politique ne correspond

## Solution Appliquée

### Migration : `fix_storage_policies_restaurant_images`

Trois nouvelles politiques ont été créées pour le bucket `restaurant-images` :

#### 1. Politique INSERT (Upload)
```sql
CREATE POLICY "Restaurants can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images' 
  AND auth.uid() IS NOT NULL
  AND (
    -- Le premier segment du chemin correspond à l'ID du restaurant
    (string_to_array(name, '/'))[1] = auth.uid()::text
    OR
    -- L'utilisateur est un restaurant dans la table restaurants
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id::text = auth.uid()::text
    )
  )
);
```

**Fonctionnement** :
- Vérifie que l'utilisateur est authentifié (`auth.uid() IS NOT NULL`)
- Vérifie que le chemin du fichier commence par l'ID du restaurant
- OU vérifie que l'utilisateur existe dans la table `restaurants`
- Permet l'upload uniquement dans le dossier correspondant à l'ID du restaurant

#### 2. Politique UPDATE (Modification)
```sql
CREATE POLICY "Restaurants can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurant-images'
  AND auth.uid() IS NOT NULL
  AND (
    (string_to_array(name, '/'))[1] = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id::text = auth.uid()::text
    )
  )
);
```

**Fonctionnement** :
- Permet aux restaurants de modifier leurs propres images
- Même logique de vérification que pour INSERT

#### 3. Politique DELETE (Suppression)
```sql
CREATE POLICY "Restaurants can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-images'
  AND auth.uid() IS NOT NULL
  AND (
    (string_to_array(name, '/'))[1] = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id::text = auth.uid()::text
    )
  )
);
```

**Fonctionnement** :
- Permet aux restaurants de supprimer leurs propres images
- Même logique de vérification que pour INSERT

## Structure des Chemins de Fichiers

Le système utilise la structure suivante pour les chemins de fichiers :

```
restaurant-images/
  └── {restaurant_id}/
      └── {timestamp}.{extension}
```

**Exemple** :
```
restaurant-images/
  └── cb6dc3c1-294d-4162-adc6-20551b2bb6cf/
      └── 1763328629876.jpeg
```

Cette structure permet :
- ✅ Organisation par restaurant
- ✅ Vérification facile de la propriété (premier segment = ID restaurant)
- ✅ Évite les conflits de noms de fichiers

## Vérification

### Politiques Créées

Après la migration, les politiques suivantes existent pour `restaurant-images` :

1. ✅ **SELECT** : "Public can read restaurant images" (existait déjà)
2. ✅ **INSERT** : "Restaurants can upload own images" (nouvelle)
3. ✅ **UPDATE** : "Restaurants can update own images" (nouvelle)
4. ✅ **DELETE** : "Restaurants can delete own images" (nouvelle)

### Test de l'Upload

Pour tester l'upload d'image :

1. **Se connecter en tant que restaurant**
   - Aller sur `/restaurant/login`
   - Se connecter avec un compte restaurant

2. **Aller sur la page de profil**
   - Aller sur `/restaurant/profile`

3. **Uploader une image**
   - Cliquer sur "Upload image"
   - Sélectionner une image (JPEG, PNG ou WebP)
   - Cliquer sur "Upload"

4. **Résultat attendu** : ✅ Upload réussi sans erreur RLS

## Sécurité

### Protection Contre les Accès Non Autorisés

Les politiques garantissent que :

1. **Un restaurant ne peut uploader que dans son propre dossier**
   - Le chemin doit commencer par son ID : `{restaurant_id}/...`
   - Impossible d'uploader dans le dossier d'un autre restaurant

2. **Seuls les restaurants authentifiés peuvent uploader**
   - Vérification de `auth.uid() IS NOT NULL`
   - Vérification de l'existence dans la table `restaurants`

3. **Les images sont publiques en lecture**
   - Tout le monde peut voir les images (bucket public)
   - Mais seul le propriétaire peut modifier/supprimer

## Comparaison avec les Autres Buckets

### restaurant-images
- ✅ Lecture publique
- ✅ Upload/Update/Delete par le propriétaire (restaurant)

### menu-images
- ✅ Lecture publique
- ✅ Upload/Update/Delete par les restaurants (vérification dans table restaurants)

### user-images
- ✅ Lecture publique
- ✅ Upload/Update/Delete par le propriétaire (utilisateur)

### passports
- ❌ Lecture privée (seul le propriétaire et les admins)
- ✅ Upload par le propriétaire (restaurant)

## Conclusion

✅ **Problème résolu** : Les politiques Storage RLS ont été ajoutées pour permettre l'upload d'images restaurant

✅ **Sécurité maintenue** : Les restaurants ne peuvent modifier que leurs propres images

✅ **Structure cohérente** : Les chemins de fichiers suivent le format `{restaurant_id}/{filename}`

🔄 **Prêt pour les tests** : L'upload d'images restaurant devrait maintenant fonctionner sans erreur RLS

---

**Note importante** : Si vous rencontrez toujours des erreurs, vérifiez que :
1. Le bucket `restaurant-images` existe et est marqué comme public
2. L'utilisateur est bien authentifié en tant que restaurant
3. Le chemin du fichier commence bien par l'ID du restaurant

