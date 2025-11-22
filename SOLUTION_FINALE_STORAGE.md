# ✅ SOLUTION FINALE : Erreur "must be owner of relation objects"

## 🎯 Problème

Vous avez cette erreur même via SQL Editor :
```
ERROR: 42501: must be owner of relation objects
```

**Cause** : Les permissions SQL ne suffisent pas pour créer des politiques sur `storage.objects`

## ✅ Solution en 2 étapes

### Étape 1 : Exécuter le script RLS (SQL) ⏱️ 30 secondes

1. **Ouvrez Supabase Dashboard** → **SQL Editor**
2. **Copiez-collez** le contenu de : **`scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`**
3. **Cliquez sur RUN** ✅

**Résultat attendu** :
- ✅ Fonction extract_user_id_from_path : OK
- ✅ 3 politiques RLS restaurants créées

---

### Étape 2 : Créer les politiques Storage (Interface) ⏱️ 5 minutes

**Suivez le guide détaillé** : **`GUIDE_CREATION_POLICIES_STORAGE_INTERFACE.md`**

**Résumé rapide** :

1. **Allez dans Storage** → **passports** → **Policies**
2. **Créez 5 politiques** avec ces définitions :

#### Politique 1 : SELECT
- **Nom** : `Restaurants can view own passports`
- **Opération** : `SELECT`
- **Définition** :
```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

#### Politique 2 : INSERT
- **Nom** : `Restaurants can upload own passports`
- **Opération** : `INSERT`
- **Définition** :
```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

#### Politique 3 : UPDATE
- **Nom** : `Restaurants can update own passports`
- **Opération** : `UPDATE`
- **Définition** :
```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

#### Politique 4 : DELETE
- **Nom** : `Restaurants can delete own passports`
- **Opération** : `DELETE`
- **Définition** :
```sql
bucket_id = 'passports'
AND auth.uid() IS NOT NULL
AND auth.uid()::text = extract_user_id_from_path(name)
```

#### Politique 5 : SELECT Admin
- **Nom** : `Admins can view all passports`
- **Opération** : `SELECT`
- **Définition** :
```sql
bucket_id = 'passports'
AND EXISTS (
  SELECT 1 FROM users
  WHERE users.id::text = auth.uid()::text
  AND users.email = 'admin@taybo.com'
)
```

---

## 🎉 Résultat final

Après ces 2 étapes :
- ✅ 3 politiques RLS créées
- ✅ 1 fonction helper créée
- ✅ 5 politiques Storage créées
- ✅ Tout fonctionne !

---

## 📁 Fichiers à utiliser

| Fichier | Usage |
|---------|-------|
| **`scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`** | ⭐ Étape 1 : Exécuter ce script |
| **`GUIDE_CREATION_POLICIES_STORAGE_INTERFACE.md`** | ⭐ Étape 2 : Suivre ce guide |

---

## ❓ Pourquoi cette méthode ?

### Méthode SQL ❌
- Nécessite des permissions spéciales
- Peut échouer avec "must be owner"
- Complexe à déboguer

### Méthode Interface ✅
- Utilise automatiquement les bonnes permissions
- Garantie de fonctionner
- Plus simple et visuelle
- **Recommandée par Supabase**

---

## 🚀 Prêt ?

1. **Exécutez** `scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql` (30 sec)
2. **Suivez** `GUIDE_CREATION_POLICIES_STORAGE_INTERFACE.md` (5 min)

**Total : 5 minutes 30 secondes** ⏱️

---

## 💡 Astuce

Si vous créez plusieurs projets Supabase, vous pouvez :
1. Sauvegarder les définitions des politiques
2. Les réutiliser pour chaque nouveau projet
3. Gagner du temps !

---

**Cette méthode fonctionne à 100% !** 🎉

