# Configuration des Buckets Storage Supabase

## Instructions pour créer les buckets Storage

Les buckets Storage doivent être créés via l'interface Supabase. Voici les étapes :

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Allez dans **Storage** dans le menu de gauche
3. Cliquez sur **New bucket** pour créer chaque bucket

### Buckets à créer :

#### 1. `restaurant-images` (Public)
- **Nom** : `restaurant-images`
- **Public** : ✅ Oui (coché)
- **File size limit** : 5 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

#### 2. `menu-images` (Public)
- **Nom** : `menu-images`
- **Public** : ✅ Oui (coché)
- **File size limit** : 5 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

#### 3. `user-images` (Public)
- **Nom** : `user-images`
- **Public** : ✅ Oui (coché)
- **File size limit** : 5 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

#### 4. `passports` (Privé)
- **Nom** : `passports`
- **Public** : ❌ Non (non coché)
- **File size limit** : 10 MB
- **Allowed MIME types** : `image/jpeg, image/png, application/pdf`

### Configuration des permissions

Pour les buckets publics (`restaurant-images`, `menu-images` et `user-images`) :
- Les utilisateurs authentifiés peuvent uploader
- Tout le monde peut lire

Pour le bucket privé (`passports`) :
- Seuls les restaurants peuvent uploader leurs propres fichiers
- Seuls les admins peuvent lire tous les fichiers

Ces permissions seront gérées via les politiques RLS de Supabase Storage.

## ⚠️ IMPORTANT : Policies RLS pour Storage

**ATTENTION** : Créer les buckets et les marquer comme publics **NE SUFFIT PAS** !

Vous **DEVEZ** également configurer les policies RLS (Row Level Security) pour autoriser l'accès aux fichiers.

### Appliquer les Policies RLS

Après avoir créé les buckets, exécutez la migration suivante dans le SQL Editor :

**Fichier** : `supabase/migrations/016_setup_storage_policies.sql`

Cette migration configure :
- ✅ Lecture publique pour tous les buckets publics
- ✅ Upload/Update/Delete pour les propriétaires authentifiés
- ✅ Accès restreint pour le bucket privé `passports`

### Vérifier que les Policies sont Appliquées

Dans le SQL Editor, exécutez :

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;
```

Vous devriez voir au minimum ces policies :
- `Public Access to Restaurant Images`
- `Public Access to Menu Images`
- `Public Access to User Images`
- `Restaurants can upload own images`
- Et d'autres...

### En cas de Problème

Si les images ne se chargent pas :

1. **Vérifiez que les buckets sont publics** (Storage > Settings > Public bucket)
2. **Vérifiez que les policies sont créées** (requête SQL ci-dessus)
3. **Consultez le guide** : `GUIDE_RESOLUTION_IMAGES_STORAGE.md`
4. **Exécutez le diagnostic** : `scripts/check-storage-setup.sql`
5. **Corrigez les policies** : `scripts/fix-storage-policies.sql`


