# Guide Rapide : Créer les politiques Storage via SQL

## ✅ Vous avez déjà créé les politiques RLS ?

Si vous voyez ce résultat :
```json
{
  "verification": "Politiques RLS restaurants",
  "statut": "3 politiques créées (attendu: 3)"
}
```

Alors vous pouvez créer les politiques Storage directement !

---

## 🚀 Option 1 : Script Storage uniquement (Recommandé)

Si vous avez déjà exécuté `SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`, utilisez :

**Fichier** : `scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql`

**Étapes** :
1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Copiez-collez le contenu du fichier
3. Cliquez sur **RUN** ✅

**Résultat attendu** :
```json
{
  "verification": "Politiques Storage passports",
  "statut": "5 politiques créées (attendu: 5)"
}
```

---

## 🚀 Option 2 : Script complet (Tout-en-un)

Si vous voulez tout faire en une fois :

**Fichier** : `scripts/SCRIPT_COMPLET_AVEC_SECURITY_DEFINER.sql`

**Étapes** :
1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Copiez-collez le contenu du fichier
3. Cliquez sur **RUN** ✅

**Résultat attendu** :
- ✅ Fonction extract_user_id_from_path : OK
- ✅ 3 politiques RLS restaurants
- ✅ 5 politiques Storage passports

---

## 🔧 Comment ça fonctionne ?

### Fonction SECURITY DEFINER

Le script utilise une fonction `create_storage_policy_safe` avec `SECURITY DEFINER` qui :
- ✅ S'exécute avec les permissions du propriétaire de la fonction
- ✅ Peut créer des politiques sur `storage.objects`
- ✅ Contourne les restrictions de permissions normales

### Politiques créées

1. **Restaurants can view own passports** (SELECT)
2. **Restaurants can upload own passports** (INSERT)
3. **Restaurants can update own passports** (UPDATE)
4. **Restaurants can delete own passports** (DELETE)
5. **Admins can view all passports** (SELECT)

---

## ❓ Si vous avez une erreur

### Erreur : "function extract_user_id_from_path does not exist"

**Solution** : Exécutez d'abord `scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql`

### Erreur : "must be owner of relation objects"

**Solution** : 
- Vérifiez que vous êtes dans **Supabase Dashboard** → **SQL Editor**
- Essayez l'**Option 2** (script complet) qui réessaie automatiquement
- Si ça ne marche toujours pas, utilisez l'interface Dashboard (voir `GUIDE_CREATION_POLICIES_STORAGE_INTERFACE.md`)

### Erreur : "bucket passports does not exist"

**Solution** :
1. Allez dans **Storage** → **Buckets**
2. Cliquez sur **New bucket**
3. Nom : `passports`
4. Public : ❌ NON (privé)
5. Créez le bucket
6. Réexécutez le script

---

## ✅ Vérification finale

Après l'exécution, vérifiez que vous voyez :

```sql
-- Résultat attendu
Politiques Storage passports | 5 politiques créées (attendu: 5)
```

Et la liste des 5 politiques avec leurs opérations.

---

## 📁 Fichiers disponibles

| Fichier | Usage |
|---------|-------|
| `scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql` | ⭐ Storage uniquement (si RLS déjà fait) |
| `scripts/SCRIPT_COMPLET_AVEC_SECURITY_DEFINER.sql` | ⭐ Tout-en-un (RLS + Storage) |
| `scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql` | RLS + Fonction uniquement |

---

## 🎉 Prêt ?

**Choisissez l'option qui correspond à votre situation et exécutez le script !**

Si vous avez déjà les politiques RLS, utilisez l'**Option 1**.  
Si vous voulez tout faire en une fois, utilisez l'**Option 2**.

