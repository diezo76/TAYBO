# Compte Rendu - Correction des Politiques Storage

## Date : $(date)

## Contexte

L'utilisateur a fourni un JSON contenant le résultat d'une requête SQL qui compte les politiques RLS (Row Level Security) pour les buckets Storage Supabase. L'analyse a révélé que plusieurs politiques INSERT étaient manquantes, empêchant les utilisateurs et restaurants d'uploader des images.

## Problème Identifié

### Problème Principal : Politiques INSERT mal détectées

**Analyse approfondie** : Les politiques INSERT existent bien dans la base de données, mais elles sont classées dans le bucket "autre" avec `qual: null`. 

**Cause** : Dans PostgreSQL, pour les politiques INSERT, la condition est stockée dans `with_check` (clause `WITH CHECK`), pas dans `qual` (clause `USING`). La requête de comptage utilisait uniquement `qual`, donc elle ne détectait pas correctement les politiques INSERT.

### Politiques à Corriger

1. **`restaurant-images`** : Politique INSERT existe mais mal détectée
   - Nom : "Restaurants can upload own images"
   - Problème : `qual` est null, condition dans `with_check`
   
2. **`menu-images`** : Politique INSERT existe mais mal détectée
   - Nom : "Restaurants can upload menu images"
   - Problème : `qual` est null, condition dans `with_check`
   
3. **`user-images`** : Politique INSERT existe mais mal détectée
   - Nom : "Users can upload own images"
   - Problème : `qual` est null, condition dans `with_check`
   
4. **`passports`** : Politique INSERT existe mais mal détectée
   - Nom : "Restaurants can upload own passports"
   - Problème : `qual` est null, condition dans `with_check`

### Politique Dupliquée Identifiée

- **"Users can read own passports"** : Doublon de "Restaurants can view own passports"
  - À supprimer pour éviter la confusion

### État Actuel vs État Attendu

| Bucket | État Actuel (détecté) | État Réel | État Attendu | Statut |
|--------|----------------------|-----------|--------------|--------|
| `restaurant-images` | SELECT, UPDATE, DELETE (3/4) | SELECT, INSERT, UPDATE, DELETE (4/4) | SELECT, INSERT, UPDATE, DELETE (4/4) | ✅ INSERT existe mais mal détecté |
| `menu-images` | SELECT, UPDATE, DELETE (3/4) | SELECT, INSERT, UPDATE, DELETE (4/4) | SELECT, INSERT, UPDATE, DELETE (4/4) | ✅ INSERT existe mais mal détecté |
| `user-images` | SELECT, UPDATE, DELETE (3/4) | SELECT, INSERT, UPDATE, DELETE (4/4) | SELECT, INSERT, UPDATE, DELETE (4/4) | ✅ INSERT existe mais mal détecté |
| `passports` | SELECT x3 (3/3) | SELECT x2, INSERT (3/3) | SELECT x2, INSERT (3/3) | ✅ INSERT existe mais mal détecté |

**Note** : Les politiques INSERT existent réellement mais sont mal classées dans "autre" à cause de `qual: null`. Le script les recrée pour garantir qu'elles ont les bonnes conditions et sont correctement détectées.

## Actions Effectuées

### 1. Création du Script de Correction

**Fichier créé** : `scripts/fix_missing_storage_policies.sql`

Ce script :
- ✅ Recrée les 4 politiques INSERT avec les bonnes conditions explicites
- ✅ Supprime la politique dupliquée "Users can read own passports"
- ✅ Utilise `DROP POLICY IF EXISTS` pour éviter les erreurs
- ✅ Inclut des requêtes de vérification améliorées qui utilisent :
  - Le nom de la politique (détection la plus fiable)
  - `qual` pour SELECT/UPDATE/DELETE
  - `with_check` pour INSERT
- ✅ Affiche un résumé par bucket et commande avec détection correcte

### 2. Création de la Documentation

**Fichier créé** : `ANALYSE_POLITIQUES_STORAGE.md`

Ce document contient :
- ✅ Analyse détaillée de l'état actuel
- ✅ Explication de chaque politique manquante
- ✅ Instructions d'exécution du script
- ✅ Tests à effectuer après correction
- ✅ Notes importantes sur les permissions

## Fichiers Modifiés/Créés

1. ✅ `scripts/fix_missing_storage_policies.sql` (nouveau)
2. ✅ `ANALYSE_POLITIQUES_STORAGE.md` (nouveau)
3. ✅ `COMPTE_RENDU_CORRECTION_POLITIQUES_STORAGE.md` (ce fichier)

## Prochaines Étapes

### Pour l'Utilisateur

1. **Exécuter le script de correction**
   - Ouvrir Supabase Dashboard > SQL Editor
   - Exécuter `scripts/fix_missing_storage_policies.sql`
   - Vérifier les résultats affichés

2. **Vérifier les politiques**
   - Le script affichera automatiquement un résumé
   - Vérifier que chaque bucket a maintenant les politiques attendues

3. **Tester les fonctionnalités**
   - Tester l'upload d'image restaurant
   - Tester l'upload d'image menu
   - Tester l'upload de photo profil utilisateur
   - Tester l'upload de passeport lors de l'inscription restaurant

### Pour le Prochain Agent

1. **Vérifier l'état des politiques**
   - Exécuter la requête de comptage dans Supabase SQL Editor
   - Comparer avec l'état attendu dans `ANALYSE_POLITIQUES_STORAGE.md`

2. **Si des erreurs persistent**
   - Vérifier les permissions dans Supabase Dashboard
   - Consulter `GUIDE_CREATION_POLICIES_STORAGE.md` pour créer les politiques via l'interface
   - Vérifier les logs Supabase pour d'éventuelles erreurs

3. **Investigation des politiques "autre"**
   - Il y a 4 politiques INSERT dans le bucket "autre"
   - Déterminer si elles sont nécessaires ou obsolètes
   - Les supprimer si elles ne sont plus utilisées

## Notes Techniques

### Structure des Politiques

Les politiques suivent cette structure :
- **SELECT** : Lecture publique pour `restaurant-images`, `menu-images`, `user-images`
- **SELECT** : Lecture privée pour `passports` (restaurants et admins uniquement)
- **INSERT** : Upload avec vérification de propriété (dossier = user_id)
- **UPDATE** : Modification avec vérification de propriété
- **DELETE** : Suppression avec vérification de propriété

### Permissions Requises

- Les politiques Storage nécessitent parfois des permissions spéciales
- Si erreur "must be owner of relation objects", utiliser l'interface Dashboard
- Voir `GUIDE_CREATION_POLICIES_STORAGE.md` pour les détails

## État Final Attendu

Après exécution du script, chaque bucket devrait avoir :

- ✅ `restaurant-images` : 4 politiques (SELECT, INSERT, UPDATE, DELETE)
- ✅ `menu-images` : 4 politiques (SELECT, INSERT, UPDATE, DELETE)
- ✅ `user-images` : 4 politiques (SELECT, INSERT, UPDATE, DELETE)
- ✅ `passports` : 3 politiques (SELECT x2 pour restaurants/admins, INSERT)

## Conclusion

Le problème réel était que les politiques INSERT existaient mais étaient mal détectées par la requête de comptage (classées dans "autre" avec `qual: null`). 

**Solution** : Le script recrée les politiques INSERT avec des conditions explicites et améliore la requête de vérification pour utiliser à la fois `qual` et `with_check`, ainsi que le nom des politiques pour une détection plus fiable.

**Action requise** : Exécuter le script dans Supabase Dashboard pour garantir que toutes les politiques sont correctement configurées et détectables.

---

**Fichiers de référence** :
- `scripts/fix_missing_storage_policies.sql` - Script de correction
- `ANALYSE_POLITIQUES_STORAGE.md` - Analyse détaillée
- `scripts/create_storage_policies.sql` - Script complet de création
- `scripts/cleanup_storage_policies.sql` - Script de nettoyage
- `GUIDE_CREATION_POLICIES_STORAGE.md` - Guide de création via Dashboard

