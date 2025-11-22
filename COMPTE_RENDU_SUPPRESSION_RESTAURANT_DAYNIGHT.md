# Compte Rendu - Suppression Complète du Restaurant "Daynight"

**Date** : 2025-01-27  
**Objectif** : Supprimer complètement le restaurant "Daynight" (anciennement "daynite") de la base de données pour permettre de tester à nouveau l'upload d'image de profil.

## Résumé Exécutif

Le restaurant "Daynight" (ID: `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`, Email: `diezowee@gmail.com`) a été complètement supprimé de la base de données PostgreSQL. Toutes les données associées ont été supprimées avec succès.

## Actions Réalisées

### 1. Identification du Restaurant

- **Nom trouvé** : "Daynight" (et non "daynite" comme mentionné initialement)
- **ID** : `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`
- **Email** : `diezowee@gmail.com`
- **Image de profil** : `https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763328629876.jpeg`

### 2. Suppression des Données Associées (dans l'ordre)

Les données suivantes ont été supprimées dans l'ordre approprié pour respecter les contraintes de clés étrangères :

1. ✅ **Messages de tickets de support** (`ticket_messages`)
   - Supprimés via les tickets de support associés

2. ✅ **Tickets de support** (`support_tickets`)
   - Tous les tickets créés par le restaurant

3. ✅ **Paiements de commission** (`commission_payments`)
   - Historique des paiements de commission

4. ✅ **Avis clients** (`reviews`)
   - Tous les avis laissés sur le restaurant

5. ✅ **Favoris** (`favorites`)
   - Favoris du restaurant lui-même
   - Favoris des plats du menu du restaurant

6. ✅ **Promotions** (`promotions`)
   - Toutes les promotions créées par le restaurant

7. ✅ **Commandes** (`orders`)
   - Toutes les commandes passées au restaurant

8. ✅ **Plats du menu** (`menu_items`)
   - Tous les plats créés par le restaurant

9. ✅ **Restaurant** (`restaurants`)
   - L'entrée principale du restaurant dans la table

### 3. Vérification de la Suppression

Vérifications effectuées après suppression :
- ✅ Restaurant supprimé : **0** restaurant restant avec cet ID
- ✅ Plats du menu : **0** plat restant
- ✅ Commandes : **0** commande restante
- ✅ Avis : **0** avis restant

## Fichiers Créés

### Script SQL de Suppression

Un script SQL réutilisable a été créé : `/scripts/delete-restaurant-daynite.sql`

Ce script peut être utilisé pour supprimer complètement un restaurant par son nom. Il :
- Trouve automatiquement le restaurant par son nom (insensible à la casse)
- Supprime toutes les données associées dans le bon ordre
- Affiche des messages informatifs sur les fichiers Storage à supprimer
- Vérifie que la suppression a bien été effectuée

**Note** : Le script a été mis à jour pour rechercher "Daynight" au lieu de "daynite".

## Actions Manuelles Requises

⚠️ **IMPORTANT** : Les actions suivantes doivent être effectuées manuellement car elles concernent Supabase Auth et Storage :

### 1. Supprimer l'Utilisateur Auth

L'utilisateur Auth associé au restaurant doit être supprimé depuis l'interface Supabase :

1. Aller dans **Supabase Dashboard** > **Authentication** > **Users**
2. Rechercher l'utilisateur avec l'email : `diezowee@gmail.com`
3. Supprimer l'utilisateur

**Alternative** : Utiliser l'API Admin Supabase pour supprimer l'utilisateur programmatiquement.

### 2. Supprimer les Fichiers du Storage

Les fichiers suivants doivent être supprimés manuellement du Storage Supabase :

#### Image de Profil
- **Bucket** : `restaurant-images`
- **Chemin** : `cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763328629876.jpeg`
- **URL complète** : `https://ocxesczzlzopbcobppok.supabase.co/storage/v1/object/public/restaurant-images/cb6dc3c1-294d-4162-adc6-20551b2bb6cf/1763328629876.jpeg`

#### Images des Plats du Menu (si existantes)
- **Bucket** : `restaurant-images`
- **Dossier** : `cb6dc3c1-294d-4162-adc6-20551b2bb6cf/` (tout le dossier peut être supprimé)

#### Document Passeport (si existant)
- **Bucket** : `passports`
- Rechercher les fichiers associés à l'ID `cb6dc3c1-294d-4162-adc6-20551b2bb6cf`

### Instructions pour Supprimer les Fichiers Storage

1. Aller dans **Supabase Dashboard** > **Storage**
2. Ouvrir le bucket `restaurant-images`
3. Supprimer le dossier `cb6dc3c1-294d-4162-adc6-20551b2bb6cf/` (ou les fichiers individuels)
4. Vérifier le bucket `passports` pour d'éventuels fichiers associés

## Prochaines Étapes pour Tester l'Image de Profil

Maintenant que le restaurant "Daynight" a été complètement supprimé, vous pouvez :

1. **Créer un nouveau compte restaurant** avec l'email `diezowee@gmail.com` (ou un autre email)
2. **Tester l'upload d'image de profil** depuis la page `/restaurant/profile`
3. **Vérifier que l'image s'affiche correctement** après l'upload

### Points à Vérifier lors du Test

- ✅ L'upload de l'image fonctionne sans erreur
- ✅ L'image est bien sauvegardée dans le bucket `restaurant-images`
- ✅ L'URL de l'image est correctement enregistrée dans la colonne `image_url` de la table `restaurants`
- ✅ L'image s'affiche correctement dans l'interface utilisateur
- ✅ Le type MIME du fichier est correct (`image/jpeg`, `image/png`, ou `image/webp`)

## Notes Techniques

### Structure de la Base de Données

Les tables suivantes ont été nettoyées :
- `restaurants` (table principale)
- `menu_items` (CASCADE automatique, mais suppression explicite effectuée)
- `orders`
- `reviews`
- `promotions` (CASCADE automatique)
- `favorites` (CASCADE automatique)
- `support_tickets`
- `ticket_messages`
- `commission_payments`

### Contraintes de Clés Étrangères

Les suppressions ont été effectuées dans l'ordre approprié pour respecter les contraintes :
- Les données dépendantes ont été supprimées avant les données principales
- Certaines tables utilisent `ON DELETE CASCADE`, mais la suppression explicite garantit un nettoyage complet

## Conclusion

✅ **Suppression réussie** : Le restaurant "Daynight" et toutes ses données associées ont été complètement supprimés de la base de données PostgreSQL.

⚠️ **Actions manuelles requises** : N'oubliez pas de supprimer l'utilisateur Auth et les fichiers Storage comme indiqué ci-dessus.

🔄 **Prêt pour les tests** : Vous pouvez maintenant créer un nouveau compte restaurant et tester l'upload d'image de profil.

---

**Fichiers de référence** :
- Script SQL : `/scripts/delete-restaurant-daynite.sql`
- Migration image_url : `/supabase/migrations/013_add_restaurant_image_url.sql`
- Service restaurant : `/src/services/restaurantService.js`

