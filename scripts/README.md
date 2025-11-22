# Scripts de Diagnostic et Maintenance

Ce dossier contient des scripts utiles pour diagnostiquer et résoudre les problèmes de l'application Taybo.

## 📁 Contenu

### 1. Scripts SQL

#### `check-storage-setup.sql`
**Description** : Script de vérification complète de la configuration du Storage Supabase

**Utilisation** :
1. Ouvrez Supabase Dashboard > SQL Editor
2. Copiez/collez le contenu de ce fichier
3. Exécutez
4. Analysez les résultats

**Ce qu'il vérifie** :
- ✅ Existence des buckets
- ✅ Configuration publique des buckets
- ✅ Policies RLS existantes
- ✅ Nombre de fichiers dans chaque bucket
- ✅ Restaurants avec/sans images
- ✅ Correspondance entre base de données et storage
- ✅ Diagnostic complet avec recommandations

**Quand l'utiliser** :
- Lors du premier déploiement
- Quand les images ne se chargent pas
- Pour vérifier la configuration du storage
- Avant d'appliquer des corrections

---

#### `fix-storage-policies.sql`
**Description** : Script de correction rapide des policies RLS pour le Storage

**Utilisation** :
1. Ouvrez Supabase Dashboard > SQL Editor
2. Copiez/collez le contenu de ce fichier
3. Exécutez
4. Vérifiez qu'il n'y a pas d'erreurs

**Ce qu'il fait** :
- 🗑️ Supprime les anciennes policies (si elles existent)
- ✅ Crée toutes les policies nécessaires
- ✅ Configure les permissions pour tous les buckets
- ✅ Vérifie que les policies sont créées

**Quand l'utiliser** :
- Quand les images ne se chargent pas (erreur 403)
- Pour réinitialiser les policies
- Après avoir créé les buckets
- En cas de problème de permissions

**⚠️ Attention** : Ce script supprime et recrée toutes les policies. Assurez-vous de comprendre l'impact avant de l'exécuter en production.

---

### 2. Scripts Shell

#### `diagnose-storage.sh`
**Description** : Script interactif de diagnostic pour les problèmes de Storage

**Utilisation** :
```bash
# Depuis la racine du projet
./scripts/diagnose-storage.sh
```

**Ce qu'il fait** :
- ✅ Vérifie la configuration locale (.env)
- ✅ Vérifie l'existence des scripts SQL
- ✅ Affiche des instructions claires pour Supabase Dashboard
- ✅ Guide pour tester les URLs
- ✅ Interprète les codes HTTP (200, 404, 403, 400)
- ✅ Affiche un résumé des actions à effectuer

**Quand l'utiliser** :
- En cas de problème d'images
- Pour un diagnostic complet
- Lors du premier déploiement
- Pour guider un débutant

**Prérequis** :
- Bash installé (Linux, macOS, WSL sur Windows)
- Être dans le répertoire racine du projet

---

## 🎯 Workflows Recommandés

### Workflow 1 : Premier Déploiement

```bash
# 1. Vérifier la configuration locale
./scripts/diagnose-storage.sh

# 2. Dans Supabase Dashboard > SQL Editor :
# - Exécuter toutes les migrations (001 à 016)
# - Exécuter check-storage-setup.sql pour vérifier

# 3. Créer les buckets si nécessaire (voir supabase/STORAGE_SETUP.md)

# 4. Dans Supabase Dashboard > SQL Editor :
# - Exécuter fix-storage-policies.sql

# 5. Tester l'application
npm run dev
```

### Workflow 2 : Problème d'Images

```bash
# 1. Diagnostic
./scripts/diagnose-storage.sh

# 2. Dans Supabase Dashboard > SQL Editor :
# - Exécuter check-storage-setup.sql
# - Analyser les résultats

# 3. Corriger selon le diagnostic :
# - Si les buckets manquent : Créer les buckets
# - Si les policies manquent : Exécuter fix-storage-policies.sql
# - Si les fichiers manquent : Ré-uploader les images

# 4. Vérifier
# - Rafraîchir l'application (Ctrl+F5)
# - Vérifier la console (pas d'erreurs)
```

### Workflow 3 : Vérification Post-Déploiement

```bash
# 1. Vérifier la configuration
./scripts/diagnose-storage.sh

# 2. Dans Supabase Dashboard > SQL Editor :
# - Exécuter check-storage-setup.sql

# 3. Vérifier les résultats :
# - Tous les buckets existent et sont publics
# - Toutes les policies sont créées (au moins 12)
# - Les fichiers sont présents dans les buckets

# 4. Si tout est OK, tester l'upload d'une image
```

---

## 📊 Interprétation des Résultats

### Codes HTTP lors du Test d'URL

| Code | Signification | Solution |
|------|---------------|----------|
| 200 | ✅ Image accessible | Problème de cache navigateur → Ctrl+F5 |
| 404 | ❌ Fichier non trouvé | Le fichier n'existe pas → Ré-uploader |
| 403 | ❌ Accès refusé | Policies RLS manquantes → fix-storage-policies.sql |
| 400 | ❌ Bucket non trouvé | Le bucket n'existe pas → Créer le bucket |

### Résultats du Script check-storage-setup.sql

**Section 1 : Buckets**
- Vérifiez que les 4 buckets existent
- Vérifiez que les 3 premiers sont publics (public = true)
- Vérifiez que le bucket "passports" est privé (public = false)

**Section 2 : Policies**
- Vous devriez voir au moins 12 policies
- Les policies doivent inclure "Restaurant", "Menu", "User", "Passport"
- Si aucune policy n'est trouvée → Exécuter fix-storage-policies.sql

**Section 3 : Fichiers**
- Vérifiez le nombre de fichiers dans chaque bucket
- Le nombre devrait correspondre au nombre d'images uploadées

**Section 8 : Recommandations**
- ✅ Messages verts : Tout est OK
- ⚠️ Messages jaunes : Action recommandée
- ❌ Messages rouges : Action requise immédiatement

---

## 🆘 Dépannage

### Le script diagnose-storage.sh ne s'exécute pas

```bash
# Donner les permissions d'exécution
chmod +x ./scripts/diagnose-storage.sh

# Exécuter
./scripts/diagnose-storage.sh
```

### Erreur "Permission denied" sur les scripts SQL

Les scripts SQL doivent être exécutés dans Supabase Dashboard, pas en local.

1. Ouvrez Supabase Dashboard
2. Allez dans SQL Editor
3. Copiez/collez le contenu du script
4. Cliquez sur "Run"

### Les policies sont créées mais les images ne se chargent toujours pas

1. Vérifiez que les buckets sont publics (Storage > Settings > Public bucket)
2. Videz le cache du navigateur (Ctrl+F5)
3. Vérifiez que le fichier existe dans le bucket
4. Testez l'URL directement dans le navigateur

### Le script check-storage-setup.sql affiche des erreurs

Si vous voyez des erreurs lors de l'exécution :
- Vérifiez que toutes les migrations sont appliquées (001 à 015)
- Vérifiez que les buckets existent
- Vérifiez les permissions de votre utilisateur Supabase

---

## 📚 Documentation Associée

- **`GUIDE_RESOLUTION_IMAGES_STORAGE.md`** - Guide complet de résolution
- **`INSTRUCTIONS_RESOLUTION_RAPIDE.md`** - Solution rapide en 3 minutes
- **`supabase/STORAGE_SETUP.md`** - Configuration initiale du storage
- **`GUIDE_DEBUG_IMAGES_STORAGE.md`** - Débogage avancé

---

## 🔄 Maintenance

### Ajout d'un Nouveau Bucket

Si vous ajoutez un nouveau bucket :

1. Créez le bucket dans Supabase Dashboard
2. Ajoutez les policies dans `fix-storage-policies.sql`
3. Mettez à jour `check-storage-setup.sql` pour vérifier le nouveau bucket
4. Documentez le bucket dans `supabase/STORAGE_SETUP.md`

### Modification des Policies

Si vous modifiez les policies :

1. Mettez à jour `supabase/migrations/016_setup_storage_policies.sql`
2. Mettez à jour `fix-storage-policies.sql`
3. Testez les nouvelles policies
4. Documentez les changements

---

**Dernière mise à jour** : 16 novembre 2024  
**Auteur** : Agent IA Taybo

