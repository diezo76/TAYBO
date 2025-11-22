# Compte Rendu : Modification et Désactivation de Restaurants

## Date : [Date actuelle]

## Résumé
Implémentation complète des fonctionnalités de modification et désactivation de restaurants pour les administrateurs et les restaurateurs, avec ajout de la gestion de l'image de profil.

## Fonctionnalités Implémentées

### 1. Migration Base de Données
- **Fichier créé** : `supabase/migrations/013_add_restaurant_image_url.sql`
- Ajout du champ `image_url TEXT` à la table `restaurants` pour stocker l'URL de l'image de profil

### 2. Services Backend

#### Admin Service (`src/services/adminService.js`)
- **Fonction ajoutée** : `updateRestaurant(restaurantId, updates)`
  - Permet de modifier tous les champs d'un restaurant (nom, email, description, cuisine_type, address, phone, delivery_fee, image_url)
- **Fonction modifiée** : `getAllRestaurants()`
  - Ajout de `image_url` dans le SELECT pour récupérer l'image de profil

#### Restaurant Service (`src/services/restaurantService.js`)
- **Fonction ajoutée** : `updateRestaurantProfile(restaurantId, updates)`
  - Permet au restaurateur de modifier son profil (tous les champs y compris email)
- **Fonction ajoutée** : `uploadRestaurantImage(restaurantId, file)`
  - Upload de l'image de profil vers le bucket `restaurant-images`
  - Validation du format (JPEG, PNG, WebP) et de la taille (max 5MB)
  - Suppression automatique de l'ancienne image lors du remplacement
- **Fonction ajoutée** : `deactivateRestaurantAccount(restaurantId)`
  - Désactive le compte en mettant `is_active = false` (pas de suppression réelle)

### 3. Interface Admin

#### Page ManageRestaurants (`src/pages/admin/ManageRestaurants.jsx`)
- **Formulaire d'édition inline** : 
  - Affichage directement dans la liste des restaurants
  - Modification de tous les champs : nom, email, description, cuisine_type, address, phone, delivery_fee
  - Boutons "Enregistrer" et "Annuler"
- **Bouton "Désactiver"** :
  - Visible uniquement pour les restaurants vérifiés et actifs
  - Confirmation obligatoire avant désactivation
  - Met `is_active = false` au lieu de suppression

### 4. Interface Restaurateur

#### Nouvelle Page ManageProfile (`src/pages/restaurant/ManageProfile.jsx`)
- **Formulaire complet** pour modifier :
  - Nom, Email, Description, Type de cuisine, Adresse, Téléphone, Frais de livraison
- **Gestion de l'image de profil** :
  - Upload/modification avec prévisualisation
  - Affichage de l'image actuelle
  - Validation du format et de la taille
- **Bouton de désactivation** :
  - Confirmation claire avec avertissement
  - Déconnexion automatique après désactivation
- **Route ajoutée** : `/restaurant/profile` dans `App.jsx`
- **Lien ajouté** : Bouton "Gérer le profil" dans `RestaurantDashboard.jsx`

### 5. Traductions

#### Fichier `src/i18n/locales/fr.json`
- **Section `admin.restaurants`** :
  - `editing` : "Modification du restaurant"
  - `description` : "Description"
  - `confirm_deactivate` : Message de confirmation
  - `error_update` : Message d'erreur mise à jour
  - `error_deactivate` : Message d'erreur désactivation

- **Section `restaurant_dashboard`** :
  - `manage_profile` : "Gérer le profil"

- **Nouvelle section `restaurant_profile`** :
  - Toutes les clés nécessaires pour la page de gestion du profil
  - Messages d'erreur et de succès
  - Avertissements et confirmations

## Fichiers Modifiés

1. `supabase/migrations/013_add_restaurant_image_url.sql` (créé)
2. `src/services/adminService.js` (modifié)
3. `src/services/restaurantService.js` (modifié)
4. `src/pages/admin/ManageRestaurants.jsx` (modifié)
5. `src/pages/restaurant/Dashboard.jsx` (modifié)
6. `src/pages/restaurant/ManageProfile.jsx` (créé)
7. `src/App.jsx` (modifié)
8. `src/i18n/locales/fr.json` (modifié)

## Points Importants

### Sécurité
- Les restaurateurs ne peuvent modifier que leur propre restaurant (vérifié par RLS)
- Les admins peuvent modifier tous les restaurants
- Confirmation obligatoire avant désactivation
- Validation des formats d'image et des tailles

### Comportement
- **Désactivation** : Met `is_active = false` au lieu de suppression réelle
- **Image de profil** : Suppression automatique de l'ancienne image lors du remplacement
- **Email** : Modifiable par le restaurateur (avec validation d'unicité côté base de données)

### UX
- Formulaire d'édition inline pour l'admin (pas de modal)
- Prévisualisation de l'image avant upload
- Messages d'erreur et de succès clairs
- Avertissements sur les conséquences de la désactivation

## Prochaines Étapes Recommandées

1. **Tester la migration** : Exécuter la migration `013_add_restaurant_image_url.sql` sur la base de données
2. **Vérifier le bucket Storage** : S'assurer que le bucket `restaurant-images` existe et est configuré correctement
3. **Tester les fonctionnalités** :
   - Modification par admin
   - Modification par restaurateur
   - Upload d'image de profil
   - Désactivation de compte
4. **Ajouter les traductions** : Compléter les traductions en arabe et anglais si nécessaire

## Notes Techniques

- Les politiques RLS existantes permettent déjà les opérations UPDATE
- Le champ `image_url` est optionnel (peut être NULL)
- La désactivation ne supprime pas les données, seulement rend le restaurant invisible
- L'upload d'image utilise Supabase Storage avec gestion automatique des anciennes images

