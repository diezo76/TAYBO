# Analyse des Politiques Storage Supabase

## Date : $(date)

## État Actuel des Politiques

D'après les données fournies, voici l'état actuel des politiques RLS pour les buckets Storage :

### ⚠️ Problème de Détection Identifié

**Analyse approfondie** : Les politiques INSERT existent réellement dans la base de données, mais elles sont mal détectées par la requête de comptage. Elles apparaissent dans le bucket "autre" avec `qual: null`.

**Cause** : Dans PostgreSQL, pour les politiques INSERT :
- La condition est stockée dans `with_check` (clause `WITH CHECK`)
- Le champ `qual` (clause `USING`) est `null` pour les INSERT
- La requête de comptage utilisait uniquement `qual`, donc elle ne détectait pas les INSERT

### Résumé par Bucket (État Détecté vs Réel)

| Bucket | SELECT | INSERT (détecté) | INSERT (réel) | UPDATE | DELETE | Statut |
|--------|--------|------------------|---------------|--------|--------|--------|
| `restaurant-images` | 1 | ❌ 0 | ✅ 1 | 1 | 1 | ✅ INSERT existe mais mal détecté |
| `menu-images` | 1 | ❌ 0 | ✅ 1 | 1 | 1 | ✅ INSERT existe mais mal détecté |
| `user-images` | 1 | ❌ 0 | ✅ 1 | 1 | 1 | ✅ INSERT existe mais mal détecté |
| `passports` | 3 | ❌ 0 | ✅ 1 | 0 | 0 | ✅ INSERT existe mais mal détecté |
| `autre` | 0 | ⚠️ 4 | - | 0 | 0 | ⚠️ Ce sont les 4 INSERT mal classées |

### Détail des Politiques INSERT (Existent mais Mal Détectées)

#### 1. `restaurant-images` - "Restaurants can upload own images"
- **État** : ✅ Existe mais `qual: null`
- **Condition réelle** : `bucket_id = 'restaurant-images' AND auth.uid()::text = (storage.foldername(name))[1]`
- **Stockée dans** : `with_check` (non détectée par la requête)

#### 2. `menu-images` - "Restaurants can upload menu images"
- **État** : ✅ Existe mais `qual: null`
- **Condition réelle** : `bucket_id = 'menu-images' AND EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id::text = auth.uid()::text)`
- **Stockée dans** : `with_check` (non détectée par la requête)

#### 3. `user-images` - "Users can upload own images"
- **État** : ✅ Existe mais `qual: null`
- **Condition réelle** : `bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]`
- **Stockée dans** : `with_check` (non détectée par la requête)

#### 4. `passports` - "Restaurants can upload own passports"
- **État** : ✅ Existe mais `qual: null`
- **Condition réelle** : `bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]`
- **Stockée dans** : `with_check` (non détectée par la requête)

### Politique Dupliquée Identifiée

- **"Users can read own passports"** : Doublon de "Restaurants can view own passports"
  - À supprimer pour éviter la confusion

## Solution Proposée

Un script de correction a été créé : `scripts/fix_missing_storage_policies.sql`

Ce script :
1. ✅ Recrée les 4 politiques INSERT avec des conditions explicites (garantit qu'elles sont correctement configurées)
2. ✅ Supprime la politique dupliquée "Users can read own passports"
3. ✅ Utilise `DROP POLICY IF EXISTS` pour éviter les erreurs si la politique existe déjà
4. ✅ Inclut des requêtes de vérification améliorées qui utilisent :
   - Le nom de la politique (détection la plus fiable)
   - `qual` pour SELECT/UPDATE/DELETE
   - `with_check` pour INSERT

## Instructions d'Exécution

1. **Ouvrir Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrir SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche

3. **Exécuter le script**
   - Ouvrez le fichier `scripts/fix_missing_storage_policies.sql`
   - Copiez-collez le contenu dans l'éditeur SQL
   - Cliquez sur "Run" ou appuyez sur `Ctrl+Enter`

4. **Vérifier les résultats**
   - Le script affichera deux tableaux :
     - Un résumé par bucket et commande
     - La liste détaillée de toutes les politiques

## État Attendu Après Correction

| Bucket | SELECT | INSERT | UPDATE | DELETE | Total |
|--------|--------|--------|--------|--------|-------|
| `restaurant-images` | 1 | ✅ 1 | 1 | 1 | **4** |
| `menu-images` | 1 | ✅ 1 | 1 | 1 | **4** |
| `user-images` | 1 | ✅ 1 | 1 | 1 | **4** |
| `passports` | 2 | ✅ 1 | 0 | 0 | **3** |

**Note** : `passports` devrait avoir 2 politiques SELECT :
- "Restaurants can view own passports" (voir leurs propres documents)
- "Admins can view all passports" (voir tous les documents)

**Note sur la détection** : Après exécution du script, la requête de vérification améliorée devrait maintenant correctement détecter toutes les politiques INSERT grâce à l'utilisation de `with_check` et du nom des politiques.

## Tests à Effectuer Après Correction

1. **Test upload image restaurant**
   - Connectez-vous en tant que restaurant
   - Essayez d'uploader une image de restaurant
   - ✅ Devrait fonctionner

2. **Test upload image menu**
   - Connectez-vous en tant que restaurant
   - Essayez d'uploader une image de plat
   - ✅ Devrait fonctionner

3. **Test upload photo profil**
   - Connectez-vous en tant qu'utilisateur
   - Essayez d'uploader une photo de profil
   - ✅ Devrait fonctionner

4. **Test upload passeport**
   - Inscrivez-vous en tant que nouveau restaurant
   - Uploadez un document d'identité
   - ✅ Devrait fonctionner

## Notes Importantes

- ⚠️ Les politiques Storage nécessitent parfois des permissions spéciales
- Si vous obtenez une erreur "must be owner of relation objects", utilisez l'interface Dashboard :
  - Storage > Policies > New Policy
- Voir `GUIDE_CREATION_POLICIES_STORAGE.md` pour plus de détails

