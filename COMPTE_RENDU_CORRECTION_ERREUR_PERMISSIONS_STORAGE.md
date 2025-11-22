# Compte-Rendu : Correction de l'erreur "must be owner of relation objects"

## Date
Date de la correction : Aujourd'hui

## Problème identifié

L'utilisateur rencontrait l'erreur suivante lors de l'exécution de la migration `027_fix_restaurant_signup_rls_storage.sql` :
```
ERROR: 42501: must be owner of relation objects
```

## Cause racine

La migration utilisait une fonction `create_storage_policy` avec `SECURITY DEFINER` pour créer des politiques sur `storage.objects`. Cependant, même avec `SECURITY DEFINER`, cette approche ne fonctionne pas toujours dans Supabase car :
1. Le rôle qui exécute la migration n'a pas toujours les permissions nécessaires pour modifier `storage.objects`
2. Les fonctions `SECURITY DEFINER` héritent des permissions du propriétaire de la fonction, qui peut ne pas avoir les droits nécessaires

## Solution appliquée

### Modifications apportées

1. **Suppression de la fonction `create_storage_policy`** :
   - Cette fonction tentait de créer des politiques via `EXECUTE format()` avec `SECURITY DEFINER`
   - Elle causait l'erreur de permissions

2. **Création directe des politiques Storage** :
   - Les politiques sont maintenant créées directement avec `CREATE POLICY`, comme dans la migration `016_setup_storage_policies.sql`
   - Cette approche est plus simple et fonctionne mieux dans Supabase

3. **Conservation de la fonction `extract_user_id_from_path`** :
   - Cette fonction est nécessaire pour extraire l'ID utilisateur depuis le nom du fichier
   - Format attendu : `passports/{uuid}-{timestamp}.{ext}`
   - La fonction extrait la partie avant le premier `-` du nom du fichier

### Fichiers modifiés

- **`supabase/migrations/027_fix_restaurant_signup_rls_storage.sql`** :
  - Suppression de la fonction `create_storage_policy` (lignes 68-98)
  - Remplacement par des créations directes de politiques (lignes 68-85)
  - Mise à jour des commentaires

### Fichiers créés

- **`GUIDE_RESOLUTION_ERREUR_PERMISSIONS_STORAGE.md`** :
  - Guide complet pour résoudre l'erreur de permissions
  - Solutions alternatives si l'erreur persiste
  - Instructions pour créer les politiques via l'interface Dashboard

## Structure de la migration corrigée

La migration `027_fix_restaurant_signup_rls_storage.sql` contient maintenant :

1. **Correction des politiques RLS pour restaurants** :
   - `Restaurants can insert own profile` (INSERT)
   - `Restaurants can view own profile` (SELECT)
   - `Restaurants can update own profile` (UPDATE)

2. **Fonction helper** :
   - `extract_user_id_from_path(file_path TEXT)` : Extrait l'ID depuis le nom du fichier

3. **Correction des politiques Storage pour passports** :
   - `Restaurants can view own passports` (SELECT)
   - `Restaurants can upload own passports` (INSERT)

## Si l'erreur persiste

Si vous obtenez toujours l'erreur "must be owner of relation objects" après cette correction :

1. **Option recommandée** : Créez les politiques Storage via l'interface Supabase Dashboard
   - Allez dans **Storage** → **Policies** → **passports**
   - Créez les politiques manuellement avec les définitions fournies dans le guide

2. **Vérifiez les permissions** :
   - Assurez-vous d'utiliser le bon rôle (service_role pour les migrations automatisées)
   - Vérifiez que vous êtes connecté avec un compte ayant les permissions nécessaires

3. **Consultez le guide** :
   - Voir `GUIDE_RESOLUTION_ERREUR_PERMISSIONS_STORAGE.md` pour les instructions détaillées

## Prochaines étapes

1. **Exécuter la migration corrigée** :
   - Via Supabase Dashboard → SQL Editor
   - Ou via Supabase CLI si vous avez les permissions

2. **Vérifier que les politiques sont créées** :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'restaurants';
   ```

3. **Tester l'upload de passport** :
   - Connectez-vous en tant que restaurant
   - Essayez d'uploader un document dans le bucket `passports`
   - Le format du nom de fichier doit être : `{uuid}-{timestamp}.{ext}`

## Notes importantes

- La fonction `extract_user_id_from_path` est maintenant utilisée directement dans les politiques Storage
- Le format du chemin de fichier attendu est : `passports/{uuid}-{timestamp}.{ext}`
- L'ID utilisateur est extrait depuis le **nom du fichier**, pas depuis le dossier
- Les politiques RLS permettent maintenant aux restaurants de voir leur profil même s'ils ne sont pas vérifiés/actifs (évite l'erreur 406)

## État actuel

✅ Migration corrigée et prête à être exécutée
✅ Guide de résolution créé
✅ Documentation complète disponible

La migration devrait maintenant fonctionner correctement. Si l'erreur persiste, suivez les instructions dans `GUIDE_RESOLUTION_ERREUR_PERMISSIONS_STORAGE.md`.

