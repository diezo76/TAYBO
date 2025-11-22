# Compte Rendu - État des Policies Storage

## Date
Janvier 2025

## Analyse des Policies Existantes

J'ai analysé les policies Storage actuellement présentes dans Supabase. Voici l'état actuel :

---

## ✅ Policies Correctes (À Conserver)

### Bucket `restaurant-images`
- ✅ `Public Access to Restaurant Images` (SELECT) - Lecture publique
- ✅ `Restaurants can upload own images` (INSERT) - Upload par propriétaire
- ✅ `Restaurants can update own images` (UPDATE) - Mise à jour par propriétaire
- ✅ `Restaurants can delete own images` (DELETE) - Suppression par propriétaire

### Bucket `menu-images`
- ✅ `Public Access to Menu Images` (SELECT) - Lecture publique
- ✅ `Restaurants can upload menu images` (INSERT) - Upload par restaurants
- ✅ `Restaurants can update menu images` (UPDATE) - Mise à jour par restaurants
- ✅ `Restaurants can delete menu images` (DELETE) - Suppression par restaurants

### Bucket `user-images`
- ✅ `Public Access to User Images` (SELECT) - Lecture publique
- ✅ `Users can upload own images` (INSERT) - Upload par utilisateur
- ✅ `Users can update own images` (UPDATE) - Mise à jour par utilisateur
- ✅ `Users can delete own images` (DELETE) - Suppression par utilisateur

### Bucket `passports`
- ✅ `Restaurants can view own passports` (SELECT) - Lecture par propriétaire
- ✅ `Restaurants can upload own passports` (INSERT) - Upload par restaurants
- ✅ `Admins can view all passports` (SELECT) - Lecture par admins

---

## ⚠️ Policies Dupliquées (À Supprimer)

Ces policies font la même chose que d'autres mais avec des noms différents :

1. ❌ `Public can read restaurant images` (SELECT)
   - **Duplique** : `Public Access to Restaurant Images`
   - **Action** : Supprimer

2. ❌ `Public can read menu images` (SELECT)
   - **Duplique** : `Public Access to Menu Images`
   - **Action** : Supprimer

---

## 🚨 Policies Trop Permissives (À Supprimer)

Ces policies permettent à TOUS les utilisateurs authentifiés d'uploader, ce qui est trop permissif :

1. ❌ `Authenticated users can upload menu images` (INSERT)
   - **Problème** : Permet à n'importe quel utilisateur authentifié d'uploader des images de menu
   - **Devrait être** : Seuls les restaurants peuvent uploader
   - **Action** : Supprimer (déjà remplacée par `Restaurants can upload menu images`)

2. ❌ `Authenticated users can upload passports` (INSERT)
   - **Problème** : Permet à n'importe quel utilisateur authentifié d'uploader des passeports
   - **Devrait être** : Seuls les restaurants peuvent uploader
   - **Action** : Supprimer (déjà remplacée par `Restaurants can upload own passports`)

---

## ❓ Policies à Vérifier

1. ❓ `Users can read own passports` (SELECT)
   - **Question** : Les utilisateurs clients doivent-ils pouvoir lire leurs propres passeports ?
   - **Contexte** : Le bucket `passports` est pour les documents d'identité des restaurants
   - **Recommandation** : Probablement à supprimer car les clients n'ont pas de passeports dans ce bucket

---

## 📊 Résumé

### État Actuel
- **Total de policies** : 20
- **Policies correctes** : 15
- **Policies dupliquées** : 2
- **Policies trop permissives** : 2
- **Policies à vérifier** : 1

### Après Nettoyage
- **Total de policies** : 15 (idéal)
- **Policies par bucket** :
  - `restaurant-images` : 4 policies
  - `menu-images` : 4 policies
  - `user-images` : 4 policies
  - `passports` : 3 policies

---

## 🔧 Script de Nettoyage

Un script de nettoyage a été créé : `scripts/cleanup_storage_policies.sql`

**Instructions** :
1. Allez dans Supabase Dashboard > SQL Editor
2. Ouvrez `scripts/cleanup_storage_policies.sql`
3. Exécutez le script
4. Vérifiez le résultat avec la requête à la fin du script

---

## ✅ Actions Recommandées

1. **Exécuter le script de nettoyage** pour supprimer les policies dupliquées et trop permissives
2. **Vérifier** que toutes les policies nécessaires sont présentes
3. **Tester** l'upload d'images dans l'application pour confirmer que tout fonctionne

---

## 📝 Notes

- Les policies principales sont **déjà créées et fonctionnelles** ✅
- Il y a quelques duplications et policies trop permissives à nettoyer
- Après nettoyage, vous aurez exactement les 15 policies nécessaires
- L'application devrait fonctionner correctement même avec les duplications (mais c'est mieux de nettoyer)

---

## 🎯 Conclusion

**État** : ✅ **Les policies Storage sont fonctionnelles !**

Il reste juste à nettoyer les duplications et les policies trop permissives pour avoir une configuration propre et sécurisée.

**Prochaine étape** : Exécuter le script de nettoyage.

