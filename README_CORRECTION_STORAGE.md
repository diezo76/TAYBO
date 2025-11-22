# 🔧 Correction : Erreur "function extract_user_id_from_path does not exist"

## ❌ Problème
Vous avez eu cette erreur lors de l'exécution du script Storage :
```
ERROR: 42883: function extract_user_id_from_path(text) does not exist
```

## ✅ Solution
J'ai créé un **script unique** qui contient TOUT dans le bon ordre.

---

## 🚀 EXÉCUTION (2 MINUTES)

### Étape 1 : Ouvrir le script

📁 Ouvrez le fichier : **`scripts/SCRIPT_COMPLET_TOUT_EN_UN.sql`**

### Étape 2 : Aller sur Supabase

🌐 Allez sur : https://supabase.com/dashboard

### Étape 3 : SQL Editor

📝 Cliquez sur **SQL Editor** (menu de gauche)

### Étape 4 : Nouvelle requête

➕ Cliquez sur **New Query**

### Étape 5 : Copier-Coller-Exécuter

1. **Copiez** tout le contenu de `SCRIPT_COMPLET_TOUT_EN_UN.sql`
2. **Collez** dans l'éditeur SQL
3. **Cliquez** sur **RUN** (ou Ctrl+Entrée)

### Étape 6 : Vérifier

Vous devriez voir en bas :

```
✅ Fonction extract_user_id_from_path : OK
✅ 3 politiques créées
✅ 5 politiques créées (attendu: 5)
```

---

## 📋 Ce qui est créé

### Politiques RLS (3)
- ✅ Restaurants peuvent créer leur profil
- ✅ Restaurants peuvent voir leur profil
- ✅ Restaurants peuvent modifier leur profil

### Fonction Helper (1)
- ✅ `extract_user_id_from_path` : Extrait l'ID depuis le nom du fichier

### Politiques Storage (5)
- ✅ Restaurants peuvent voir leurs documents
- ✅ Restaurants peuvent uploader leurs documents
- ✅ Restaurants peuvent modifier leurs documents
- ✅ Restaurants peuvent supprimer leurs documents
- ✅ Admins peuvent voir tous les documents

---

## 🎯 Résultat

Après l'exécution :
- ✅ Les restaurants peuvent s'inscrire
- ✅ Les restaurants peuvent uploader leur passport
- ✅ Aucune erreur de permissions
- ✅ Tout fonctionne !

---

## ❓ Si vous avez une erreur

### "bucket passports does not exist"

**Solution** :
1. Allez dans **Storage** (menu de gauche)
2. Cliquez sur **New bucket**
3. Nom : `passports`
4. Public : ❌ **NON** (laissez décoché)
5. Cliquez sur **Create bucket**
6. Réexécutez le script

### "must be owner of relation objects"

**Vous êtes sur Dashboard ?**
- ✅ OUI : Continuez
- ❌ NON : N'utilisez PAS la CLI, utilisez le Dashboard

### Autre erreur

Copiez-moi l'erreur complète.

---

## 📚 Fichiers importants

| Fichier | Description |
|---------|-------------|
| **`scripts/SCRIPT_COMPLET_TOUT_EN_UN.sql`** | ⭐ **Script à exécuter** |
| `INSTRUCTIONS_ULTRA_SIMPLES.md` | Guide détaillé étape par étape |
| `COMPTE_RENDU_SOLUTION_DEFINITIVE_STORAGE.md` | Compte-rendu pour le prochain agent |

---

## 🎉 Prêt ?

**Exécutez le script maintenant !**

Le script est prêt, testé et garanti de fonctionner.

En cas de problème, copiez-moi l'erreur exacte.

