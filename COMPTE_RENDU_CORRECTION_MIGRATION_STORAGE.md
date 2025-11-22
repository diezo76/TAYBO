# Compte Rendu - Correction Migration Storage Policies

## Date
Janvier 2025

## Problème Identifié
Erreur lors de l'application de la migration `016_setup_storage_policies.sql` :
```
ERROR: 42710: policy "Public Access to Restaurant Images" for table "objects" already exists
```

## Cause
La migration tentait de créer des policies qui existaient déjà dans la base de données. Cela peut arriver si :
- La migration a été partiellement appliquée précédemment
- Des policies similaires ont été créées manuellement
- La migration a été exécutée plusieurs fois

## Solution Appliquée

**Fichier modifié** : `supabase/migrations/016_setup_storage_policies.sql`

**Modification** : Ajout de `DROP POLICY IF EXISTS` avant chaque `CREATE POLICY` pour rendre la migration idempotente.

### Avant
```sql
CREATE POLICY "Public Access to Restaurant Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');
```

### Après
```sql
DROP POLICY IF EXISTS "Public Access to Restaurant Images" ON storage.objects;
CREATE POLICY "Public Access to Restaurant Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');
```

## Policies Modifiées

Toutes les policies ont été modifiées pour inclure `DROP POLICY IF EXISTS` :

### Bucket restaurant-images
- ✅ `Public Access to Restaurant Images`
- ✅ `Restaurants can upload own images`
- ✅ `Restaurants can update own images`
- ✅ `Restaurants can delete own images`

### Bucket menu-images
- ✅ `Public Access to Menu Images`
- ✅ `Restaurants can upload menu images`
- ✅ `Restaurants can update menu images`
- ✅ `Restaurants can delete menu images`

### Bucket user-images
- ✅ `Public Access to User Images`
- ✅ `Users can upload own images`
- ✅ `Users can update own images`
- ✅ `Users can delete own images`

### Bucket passports
- ✅ `Restaurants can view own passports`
- ✅ `Restaurants can upload own passports`
- ✅ `Admins can view all passports`

## Résultat

✅ **Migration maintenant idempotente**
- Peut être exécutée plusieurs fois sans erreur
- Supprime les policies existantes avant de les recréer
- Garantit que les policies sont toujours à jour

## Instructions

La migration peut maintenant être appliquée sans problème :

1. **Via l'interface Supabase** :
   - Allez dans SQL Editor
   - Ouvrez `supabase/migrations/016_setup_storage_policies.sql`
   - Exécutez la migration

2. **Via l'API Supabase** :
   - La migration peut être appliquée via `apply_migration`

## Vérification

Après avoir appliqué la migration, vérifiez que les policies sont créées :

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

Vous devriez voir toutes les policies listées ci-dessus.

## Notes pour le Prochain Agent

- ✅ La migration est maintenant idempotente
- ✅ Peut être exécutée plusieurs fois sans erreur
- ✅ Les policies seront toujours à jour (supprimées puis recréées)
- ✅ Aucune action supplémentaire requise

