# Instructions Rapides : Résolution de l'erreur "must be owner of relation objects"

## ✅ Ce qui a été fait

J'ai séparé la migration en deux parties pour éviter l'erreur de permissions :

1. **Migration 027** (RLS uniquement) - FONCTIONNE
2. **Script Storage séparé** - À exécuter via Dashboard

## 📋 ÉTAPES À SUIVRE (5 minutes)

### Étape 1 : Exécuter la migration 027 (RLS)

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet Taybo**
3. **Allez dans SQL Editor** (menu de gauche)
4. **Créez une nouvelle requête** et collez le contenu de :
   ```
   supabase/migrations/027_fix_restaurant_signup_rls_storage.sql
   ```
5. **Cliquez sur RUN** → ✅ Devrait fonctionner sans erreur

### Étape 2 : Créer les politiques Storage

1. **Restez dans SQL Editor**
2. **Créez une nouvelle requête** et collez le contenu de :
   ```
   scripts/create_passports_storage_policies.sql
   ```
3. **Cliquez sur RUN** → ✅ Devrait fonctionner sans erreur

### Étape 3 : Vérifier que tout fonctionne

À la fin du script de l'étape 2, une requête de vérification s'exécute automatiquement.

**Vous devriez voir 5 politiques** :
- ✅ Restaurants can view own passports
- ✅ Restaurants can upload own passports
- ✅ Restaurants can update own passports
- ✅ Restaurants can delete own passports
- ✅ Admins can view all passports

## 🎯 Résultat attendu

Après ces étapes :
1. ✅ Les restaurants peuvent s'inscrire
2. ✅ Les restaurants peuvent uploader leur passport
3. ✅ Les politiques RLS fonctionnent correctement
4. ✅ Les politiques Storage fonctionnent correctement

## ⚠️ Si vous avez une erreur

### Erreur "function extract_user_id_from_path does not exist"
→ Exécutez d'abord l'étape 1 (migration 027)

### Erreur "bucket passports does not exist"
→ Créez le bucket dans Storage :
1. Allez dans **Storage** (menu de gauche)
2. Cliquez sur **New bucket**
3. Nom : `passports`
4. Public : ❌ NON (privé)
5. Cliquez sur **Create bucket**

### Autre erreur
→ Copiez-moi l'erreur complète et je vous aide

## 📁 Fichiers modifiés

- `supabase/migrations/027_fix_restaurant_signup_rls_storage.sql` : Migration RLS uniquement
- `scripts/create_passports_storage_policies.sql` : Script Storage séparé (NOUVEAU)

## 💡 Pourquoi cette séparation ?

Les politiques Storage nécessitent des permissions spéciales sur `storage.objects` que les migrations SQL n'ont pas toujours. En les exécutant via le Dashboard Supabase, vous avez automatiquement les bonnes permissions.

## 🚀 Prêt ?

Suivez les 3 étapes ci-dessus et tout devrait fonctionner ! 

Si vous rencontrez un problème, copiez-moi l'erreur exacte.

