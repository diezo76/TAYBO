# Compte Rendu - Erreur Permissions Storage Policies

## Date
Janvier 2025

## Problème Identifié
Erreur lors de l'application de la migration `016_setup_storage_policies.sql` :
```
ERROR: 42501: must be owner of relation objects
```

## Cause
Dans Supabase, le schéma `storage` est géré par le système et nécessite des permissions spéciales pour créer des policies. L'utilisateur qui exécute la migration (généralement via l'API ou le SQL Editor avec les permissions standard) n'a pas les permissions nécessaires pour créer des policies sur `storage.objects`.

## Solutions Proposées

### Solution 1 : Créer les Policies via l'Interface Supabase (RECOMMANDÉE) ✅

**Méthode** : Utiliser l'interface Dashboard de Supabase

**Avantages** :
- ✅ Pas de problème de permissions
- ✅ Interface intuitive
- ✅ Méthode recommandée par Supabase
- ✅ Permet de voir et gérer les policies facilement

**Guide détaillé** : `GUIDE_CREATION_POLICIES_STORAGE.md`

**Résumé** :
1. Allez dans Supabase Dashboard > Storage > Policies
2. Pour chaque bucket, créez les policies nécessaires
3. Utilisez les définitions SQL fournies dans le guide

### Solution 2 : Migration Alternative avec SECURITY DEFINER

**Fichier** : `supabase/migrations/016_setup_storage_policies_v2.sql`

**Méthode** : Utilise une fonction `SECURITY DEFINER` pour contourner les restrictions de permissions

**Note** : Cette méthode peut ne pas fonctionner selon votre configuration Supabase, car elle nécessite toujours certaines permissions de base.

**Utilisation** :
- Essayez d'appliquer cette migration si vous avez accès au SQL Editor avec des permissions élevées
- Si cela échoue, utilisez la Solution 1

### Solution 3 : Utiliser le Service Role Key

**Méthode** : Utiliser la clé API `service_role` (au lieu de `anon`) pour exécuter la migration

**⚠️ ATTENTION** : La clé `service_role` a des permissions complètes. Ne l'utilisez jamais côté client !

**Utilisation** :
- Créez une Edge Function Supabase qui utilise la clé `service_role`
- Exécutez la migration via cette fonction
- Ou utilisez Supabase CLI avec les bonnes permissions

## Fichiers Créés

1. **`GUIDE_CREATION_POLICIES_STORAGE.md`** ✅
   - Guide complet pour créer les policies via l'interface
   - Liste de toutes les policies à créer
   - Instructions détaillées pour chaque bucket

2. **`supabase/migrations/016_setup_storage_policies_v2.sql`** ✅
   - Version alternative utilisant SECURITY DEFINER
   - Peut fonctionner selon la configuration

3. **`COMPTE_RENDU_ERREUR_PERMISSIONS_STORAGE.md`** ✅
   - Ce compte rendu

## Recommandation

**Utilisez la Solution 1** (Interface Supabase Dashboard) car :
- ✅ C'est la méthode la plus fiable
- ✅ Pas de problème de permissions
- ✅ Recommandée par Supabase
- ✅ Permet de vérifier visuellement les policies créées

## Prochaines Étapes

1. **Suivez le guide** : `GUIDE_CREATION_POLICIES_STORAGE.md`
2. **Créez les 15 policies** nécessaires via l'interface
3. **Vérifiez** que toutes les policies sont créées
4. **Testez** l'upload d'images dans l'application

## Vérification

Après avoir créé les policies, vérifiez avec cette requête SQL :

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

Vous devriez voir 15 policies au total.

## Notes pour le Prochain Agent

- ⚠️ Les policies Storage doivent être créées via l'interface Supabase Dashboard
- ✅ Guide complet disponible : `GUIDE_CREATION_POLICIES_STORAGE.md`
- ✅ Migration alternative disponible : `016_setup_storage_policies_v2.sql` (peut ne pas fonctionner)
- ✅ 15 policies au total à créer (4 pour restaurant-images, 4 pour menu-images, 4 pour user-images, 3 pour passports)

