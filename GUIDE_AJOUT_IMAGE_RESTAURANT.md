# Guide : Comment ajouter une image de restaurant sur la page d'accueil

## Vue d'ensemble

Les images des restaurants sont affichées automatiquement sur la page d'accueil via le composant `RestaurantCard`. Pour qu'une image s'affiche, le restaurant doit :

1. Se connecter à son compte restaurant
2. Aller dans la page de gestion du profil
3. Uploader une image via le formulaire prévu à cet effet
4. Sauvegarder le profil

## Étapes détaillées

### 1. Connexion au compte restaurant

1. Accédez à la page de connexion restaurant : `/restaurant/login`
2. Connectez-vous avec vos identifiants (email et mot de passe)

### 2. Accéder à la page de gestion du profil

Une fois connecté, vous pouvez accéder à la page de gestion du profil de deux façons :

**Option A : Via le menu de navigation**
- Cliquez sur l'icône "Profil" dans la sidebar du dashboard restaurant
- Ou accédez directement à : `/restaurant/profile`

**Option B : Via l'URL directe**
- Tapez dans votre navigateur : `http://localhost:5173/restaurant/profile` (en développement)
- Ou l'URL de production correspondante

### 3. Uploader une image

Sur la page de gestion du profil (`ManageProfile.jsx`), vous trouverez une section dédiée à l'image de profil :

```250:292:src/pages/restaurant/ManageProfile.jsx
          {/* Image de profil */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('restaurant_profile.profile_image')}
            </label>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Avatar
                  src={imagePreview}
                  name={restaurant.name}
                  size="xl"
                  alt={restaurant.name}
                />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t('restaurant_profile.image_hint')}
                </p>
                {imageFile && (
                  <Button
                    onClick={handleUploadImage}
                    disabled={uploadingImage}
                    variant="primary"
                    size="sm"
                    className="mt-3 flex items-center gap-2"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {t('restaurant_profile.upload_image')}
                  </Button>
                )}
              </div>
            </div>
          </div>
```

**Procédure d'upload :**

1. **Cliquez sur "Choisir un fichier"** ou glissez-déposez une image dans la zone prévue
2. **Sélectionnez une image** depuis votre ordinateur
   - Formats acceptés : JPEG, PNG, WebP
   - Taille maximum : 5 MB
3. **Une prévisualisation** de l'image apparaîtra à gauche
4. **Cliquez sur le bouton "Uploader l'image"** qui apparaît après la sélection
5. Attendez que l'upload se termine (un indicateur de chargement apparaît)

### 4. Sauvegarder le profil

Après avoir uploadé l'image avec succès :

1. **Cliquez sur le bouton "Enregistrer"** en bas du formulaire
2. L'image sera automatiquement associée à votre restaurant dans la base de données
3. La page se rechargera automatiquement pour afficher les nouvelles informations

### 5. Vérifier sur la page d'accueil

1. **Retournez sur la page d'accueil** : `/` (ou déconnectez-vous et reconnectez-vous en tant que client)
2. **Votre restaurant** devrait maintenant afficher son image au lieu du message "Image non disponible"

## Comment ça fonctionne techniquement

### Upload de l'image

L'upload est géré par la fonction `uploadRestaurantImage` dans `restaurantService.js` :

```175:259:src/services/restaurantService.js
export async function uploadRestaurantImage(restaurantId, file) {
  try {
    // Valider le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP.');
    }

    // Valider la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('L\'image est trop grande. Taille maximum : 5MB.');
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Supprimer l'ancienne image si elle existe
    const { data: currentRestaurant } = await supabase
      .from('restaurants')
      .select('image_url')
      .eq('id', restaurantId)
      .single();

    if (currentRestaurant?.image_url) {
      // Extraire le chemin du fichier de l'URL
      const urlParts = currentRestaurant.image_url.split('/restaurant-images/');
      if (urlParts.length > 1) {
        const oldPath = urlParts[1].split('?')[0]; // Enlever les query params
        if (oldPath) {
          await supabase.storage
            .from('restaurant-images')
            .remove([oldPath]);
        }
      }
    }

    // Déterminer le type MIME correct selon l'extension
    let contentType = file.type;
    if (!contentType || contentType === 'application/json' || contentType === 'application/octet-stream') {
      // Forcer le bon type MIME selon l'extension
      const ext = fileExt.toLowerCase();
      if (ext === 'jpg' || ext === 'jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === 'png') {
        contentType = 'image/png';
      } else if (ext === 'webp') {
        contentType = 'image/webp';
      } else {
        contentType = 'image/jpeg'; // Par défaut
      }
    }

    // Upload vers Supabase Storage avec le bon type MIME
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('restaurant-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType, // Forcer le bon type MIME
      });

    if (uploadError) {
      throw uploadError;
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Erreur upload image:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de l\'upload de l\'image',
    };
  }
}
```

**Ce que fait cette fonction :**
- Valide le format et la taille du fichier
- Génère un nom de fichier unique : `{restaurantId}/{timestamp}.{extension}`
- Supprime l'ancienne image si elle existe
- Upload l'image vers Supabase Storage dans le bucket `restaurant-images`
- Retourne l'URL publique de l'image

### Stockage de l'URL

L'URL de l'image est stockée dans la table `restaurants` dans la colonne `image_url` :

```131:157:src/pages/restaurant/ManageProfile.jsx
  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!restaurant) return;

    setSaving(true);
    try {
      const updates = { ...formData };
      if (imageUrl) {
        updates.image_url = imageUrl;
        console.log('[ManageProfile] Sauvegarde avec image_url:', imageUrl);
      } else {
        console.log('[ManageProfile] Sauvegarde sans image_url');
      }
      
      const updatedRestaurant = await updateRestaurantProfile(restaurant.id, updates);
      console.log('[ManageProfile] Profil mis à jour avec succès:', updatedRestaurant);
      console.log('[ManageProfile] Image URL sauvegardée:', updatedRestaurant.image_url);
      
      alert(t('restaurant_profile.profile_updated') || 'Profil mis à jour avec succès');
      // Recharger la page pour mettre à jour le contexte
      window.location.reload();
    } catch (error) {
      console.error('[ManageProfile] Erreur mise à jour profil:', error);
      alert(t('restaurant_profile.update_error') || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };
```

### Affichage sur la page d'accueil

Le composant `RestaurantCard` affiche automatiquement l'image si elle existe :

```85:114:src/components/client/RestaurantCard.jsx
    <div
      onClick={handleClick}
      className="card-soft-md overflow-hidden cursor-pointer hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image du restaurant */}
      <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
            loading="lazy"
            crossOrigin="anonymous"
            onLoad={() => {
              // Réinitialiser l'erreur si l'image se charge avec succès
              if (imageError) {
                setImageError(false);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Bike className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-gray-500">Image non disponible</p>
            </div>
          </div>
        )}
```

## Prérequis techniques

### Bucket Storage Supabase

Le bucket `restaurant-images` doit être créé dans Supabase Storage avec les configurations suivantes :

- **Nom** : `restaurant-images`
- **Public** : ✅ Oui (coché)
- **File size limit** : 5 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

### Permissions RLS

Les politiques RLS (Row Level Security) doivent être configurées pour permettre :
- L'upload d'images par les restaurants authentifiés
- La lecture publique des images

Voir la migration `016_setup_storage_policies.sql` pour les détails.

### Colonne image_url

La table `restaurants` doit avoir une colonne `image_url` de type TEXT.

Voir la migration `013_add_restaurant_image_url.sql` pour les détails.

## Dépannage

### L'image ne s'affiche pas après l'upload

1. **Vérifiez la console du navigateur** pour les erreurs
2. **Vérifiez que l'URL est bien sauvegardée** dans la base de données :
   ```sql
   SELECT id, name, image_url FROM restaurants WHERE id = 'votre-restaurant-id';
   ```
3. **Vérifiez que le bucket existe** et est public dans Supabase Storage
4. **Vérifiez les permissions RLS** du bucket Storage

### Erreur lors de l'upload

1. **Vérifiez le format** : JPEG, PNG ou WebP uniquement
2. **Vérifiez la taille** : maximum 5 MB
3. **Vérifiez la connexion** à Supabase
4. **Vérifiez les permissions** : vous devez être connecté en tant que restaurant

### L'image s'affiche mais avec "Image non disponible"

Cela peut arriver si :
- L'URL est incorrecte
- Le fichier n'existe pas dans le bucket Storage
- Les permissions RLS bloquent l'accès

**Solution** : Utilisez la fonction de validation automatique intégrée dans `RestaurantCard` qui essaie de corriger les URLs automatiquement.

## Résumé

Pour ajouter une image de restaurant sur la page d'accueil :

1. ✅ Connectez-vous en tant que restaurant
2. ✅ Allez dans `/restaurant/profile`
3. ✅ Sélectionnez une image (JPEG, PNG ou WebP, max 5 MB)
4. ✅ Cliquez sur "Uploader l'image"
5. ✅ Cliquez sur "Enregistrer"
6. ✅ Vérifiez sur la page d'accueil

L'image apparaîtra automatiquement sur toutes les cartes de restaurant où votre restaurant est affiché (page d'accueil, favoris, résultats de recherche, etc.).

