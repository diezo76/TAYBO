# Compte rendu - Correction des erreurs 406 et PGRST116

## Date
Corrections effectuées pour résoudre les erreurs liées à la gestion des restaurants par l'admin.

## Problèmes identifiés

### 1. Erreur PGRST116 - "Cannot coerce the result to a single JSON object"
**Symptôme** : L'erreur se produisait lors de la désactivation ou de la mise à jour d'un restaurant avec le message "The result contains 0 rows".

**Cause** : 
- L'utilisation de `.single()` après un `.update()` échoue quand aucune ligne n'est mise à jour
- Cela peut arriver si :
  - L'ID du restaurant n'existe pas
  - Les politiques RLS empêchent la mise à jour
  - La requête ne correspond à aucune ligne

### 2. Erreur 406 - URL malformée
**Symptôme** : Erreur HTTP 406 avec une URL malformée contenant des caractères étranges comme "ocxesczzlzopbcobppok…_url%2Ccreated_at:1"

**Cause possible** : 
- Problème d'encodage dans la construction de la requête Supabase
- Possiblement lié aux politiques RLS qui empêchent l'accès aux données

## Corrections apportées

### 1. Modification de `adminService.js`

#### Fonction `updateRestaurantStatus`
- ✅ Ajout d'une vérification préalable de l'existence du restaurant avant la mise à jour
- ✅ Remplacement de `.single()` par `.maybeSingle()` pour éviter l'erreur PGRST116
- ✅ Ajout d'une vérification que `data` n'est pas null après la mise à jour
- ✅ Messages d'erreur plus explicites

#### Fonction `updateRestaurant`
- ✅ Mêmes corrections que pour `updateRestaurantStatus`
- ✅ Vérification préalable de l'existence du restaurant
- ✅ Utilisation de `.maybeSingle()` au lieu de `.single()`
- ✅ Gestion améliorée des erreurs

### 2. Modification de `ManageRestaurants.jsx`

#### Amélioration de la gestion des erreurs
- ✅ Toutes les fonctions de gestion (`handleVerify`, `handleReject`, `handleToggleActive`, `handleDeactivate`, `handleSaveEdit`) affichent maintenant des messages d'erreur plus détaillés
- ✅ Les messages d'erreur incluent `error.message` ou `error.details` pour plus de contexte
- ✅ Conservation des filtres lors du rechargement de la liste après une action

#### Corrections spécifiques
- ✅ `handleVerify` : Conservation des filtres lors du rechargement
- ✅ `handleReject` : Conservation des filtres lors du rechargement
- ✅ `handleToggleActive` : Conservation des filtres lors du rechargement
- ✅ `handleDeactivate` : Conservation des filtres lors du rechargement et meilleure gestion d'erreur
- ✅ `handleSaveEdit` : Conservation des filtres lors du rechargement

## Code modifié

### Fichiers modifiés
1. `src/services/adminService.js`
   - Fonction `updateRestaurantStatus` (lignes 169-223)
   - Fonction `updateRestaurant` (lignes 239-293)

2. `src/pages/admin/ManageRestaurants.jsx`
   - Fonction `handleVerify` (lignes 102-129)
   - Fonction `handleReject` (lignes 132-162)
   - Fonction `handleToggleActive` (lignes 165-191)
   - Fonction `handleDeactivate` (lignes 252-277)
   - Fonction `handleSaveEdit` (lignes 223-249)

## Points d'attention pour la suite

### Vérifications à effectuer
1. **Politiques RLS** : Vérifier que les politiques RLS permettent bien à l'admin de :
   - Voir tous les restaurants (pas seulement les actifs et vérifiés)
   - Mettre à jour tous les restaurants
   - La politique "Admins can manage all restaurants" devrait fonctionner correctement

2. **Authentification admin** : S'assurer que :
   - L'utilisateur connecté est bien identifié comme admin
   - L'email `admin@taybo.com` correspond bien à l'utilisateur connecté
   - La session Supabase contient bien les informations de l'admin

3. **Erreur 406** : Si l'erreur 406 persiste :
   - Vérifier les logs Supabase pour plus de détails
   - Vérifier que les colonnes sélectionnées existent bien dans la table `restaurants`
   - Vérifier que les politiques RLS permettent bien l'accès SELECT pour l'admin

## Tests recommandés

1. Tester la désactivation d'un restaurant
2. Tester la validation d'un restaurant en attente
3. Tester le rejet d'un restaurant
4. Tester l'activation/désactivation d'un restaurant
5. Tester la modification des informations d'un restaurant
6. Vérifier que les filtres sont conservés après chaque action

## Notes techniques

- `.maybeSingle()` retourne `null` au lieu de lever une erreur quand aucune ligne n'est trouvée
- La vérification préalable de l'existence permet de donner un message d'erreur plus clair
- Les filtres sont maintenant conservés lors du rechargement pour une meilleure UX
