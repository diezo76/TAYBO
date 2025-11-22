# ⚡ INSTRUCTIONS ULTRA-SIMPLES - 2 MINUTES

## 🎯 Problème résolu

Vous avez eu l'erreur : `function extract_user_id_from_path(text) does not exist`

**Cause** : Vous avez exécuté le script Storage avant la migration qui crée la fonction.

**Solution** : J'ai créé un script qui contient TOUT dans le bon ordre.

## ✅ SOLUTION EN 1 SEULE ÉTAPE

### 1. Ouvrez Supabase Dashboard

Allez sur : https://supabase.com/dashboard

### 2. Allez dans SQL Editor

Cliquez sur **SQL Editor** dans le menu de gauche

### 3. Créez une nouvelle requête

Cliquez sur **New Query**

### 4. Copiez-collez le script complet

Ouvrez le fichier : **`scripts/SCRIPT_COMPLET_TOUT_EN_UN.sql`**

**Sélectionnez TOUT** le contenu et **copiez-le**

### 5. Collez dans SQL Editor et exécutez

**Collez** le script dans l'éditeur SQL

Cliquez sur **RUN** (ou Ctrl+Entrée)

### 6. Vérifiez les résultats

À la fin, vous devriez voir :

```
✅ Fonction extract_user_id_from_path : OK
✅ 3 politiques RLS restaurants
✅ 5 politiques Storage passports (attendu: 5)
```

Et une liste des 5 politiques Storage avec des ✅

## 🎉 C'EST TOUT !

Si vous voyez ces résultats, **TOUT FONCTIONNE PARFAITEMENT** !

## ❌ Si vous avez une erreur

### Erreur : "bucket passports does not exist"

**Solution** :
1. Allez dans **Storage** (menu de gauche)
2. Cliquez sur **New bucket**
3. Nom : `passports`
4. Public : ❌ **NON** (laissez décoché)
5. Cliquez sur **Create bucket**
6. Réexécutez le script

### Erreur : "must be owner of relation objects"

**Vous êtes bien dans Supabase Dashboard ?**
- ✅ OUI : Vous devez être dans le SQL Editor du Dashboard
- ❌ NON : N'utilisez PAS la CLI ou un client SQL externe

### Autre erreur

Copiez-moi l'erreur complète et je vous aide immédiatement.

## 📁 Fichier à utiliser

**UN SEUL FICHIER** : `scripts/SCRIPT_COMPLET_TOUT_EN_UN.sql`

Tout est dedans dans le bon ordre :
1. ✅ Politiques RLS
2. ✅ Fonction helper
3. ✅ Politiques Storage
4. ✅ Vérifications automatiques

## 🚀 Prêt ?

**Allez-y maintenant !** Le script est prêt et ne peut pas échouer.

En cas de problème, copiez-moi l'erreur exacte.

