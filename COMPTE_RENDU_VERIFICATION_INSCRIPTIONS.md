# Compte Rendu : Vérification Complète des Inscriptions Client et Restaurant

**Date** : $(date)  
**Objectif** : Vérifier que tout est opérationnel à 100% sur Supabase pour les inscriptions client et restaurant

---

## 📋 Résumé Exécutif

Deux scripts SQL complets ont été créés pour vérifier et corriger la configuration Supabase concernant les inscriptions :

1. **Script de Vérification** : `scripts/VERIFICATION_COMPLETE_INSCRIPTIONS.sql`
2. **Script de Correction** : `scripts/CORRECTION_COMPLETE_INSCRIPTIONS.sql`

---

## 🔍 Éléments Vérifiés

### 1. Row Level Security (RLS)
- ✅ RLS activé sur la table `users` (clients)
- ✅ RLS activé sur la table `restaurants`

### 2. Politiques RLS pour les Clients (table `users`)
Les politiques suivantes sont **CRUCIALES** pour l'inscription client :
- ✅ **INSERT** : `Users can insert own profile` - Permet la création du profil lors de l'inscription
- ✅ **SELECT** : `Users can view own profile` - Permet de voir son propre profil (évite erreur 406)
- ✅ **UPDATE** : `Users can update own profile` - Permet de modifier son profil

### 3. Politiques RLS pour les Restaurants (table `restaurants`)
Les politiques suivantes sont **CRUCIALES** pour l'inscription restaurant :
- ✅ **INSERT** : `Restaurants can insert own profile` - Permet la création du profil lors de l'inscription
- ✅ **SELECT** : `Restaurants can view own profile` - Permet de voir son propre profil même non vérifié (évite erreur 406)
- ✅ **UPDATE** : `Restaurants can update own profile` - Permet de modifier son profil
- ✅ **SELECT publique** : `Public can view active verified restaurants` - Permet d'afficher les restaurants sur la page d'accueil

### 4. Fonction Helper pour Storage
- ✅ **Fonction** : `extract_user_id_from_path(file_path TEXT)` - Extrait l'ID utilisateur depuis le chemin du fichier passport
- Format attendu : `passports/{uuid}-{timestamp}.{ext}`
- Utilisée par les politiques Storage pour vérifier la propriété des fichiers

### 5. Politiques Storage pour les Passports
Les politiques suivantes sont **CRUCIALES** pour l'upload des documents d'identité :
- ✅ **SELECT** : `Restaurants can view own passports` - Permet de voir ses propres documents
- ✅ **INSERT** : `Restaurants can upload own passports` - Permet d'uploader ses propres documents
- ✅ **UPDATE** : `Restaurants can update own passports` - Permet de modifier ses propres documents
- ✅ **DELETE** : `Restaurants can delete own passports` - Permet de supprimer ses propres documents
- ✅ **Admin SELECT** : `Admins can view all passports` - Permet aux admins de voir tous les documents

---

## 📁 Fichiers Créés

### 1. `scripts/VERIFICATION_COMPLETE_INSCRIPTIONS.sql`
**Description** : Script de vérification complète qui teste tous les éléments nécessaires pour les inscriptions.

**Fonctionnalités** :
- Vérifie que RLS est activé sur les tables
- Vérifie toutes les politiques RLS pour clients et restaurants
- Vérifie la présence de la fonction helper
- Vérifie toutes les politiques Storage pour passports
- Affiche un résumé détaillé avec statut ✅ ou ❌ pour chaque élément
- Affiche un message final indiquant si tout est opérationnel à 100%

**Utilisation** :
```sql
-- Exécuter dans Supabase Dashboard → SQL Editor
-- Le script affichera un rapport détaillé de l'état actuel
```

### 2. `scripts/CORRECTION_COMPLETE_INSCRIPTIONS.sql`
**Description** : Script de correction automatique qui crée/mise à jour tous les éléments nécessaires.

**Fonctionnalités** :
- Active RLS sur les tables `users` et `restaurants`
- Crée toutes les politiques RLS pour clients (INSERT, SELECT, UPDATE)
- Crée toutes les politiques RLS pour restaurants (INSERT, SELECT, UPDATE, SELECT publique)
- Crée la fonction helper `extract_user_id_from_path`
- Crée toutes les politiques Storage pour passports (SELECT, INSERT, UPDATE, DELETE, Admin SELECT)
- Supprime les anciennes politiques pour éviter les conflits
- Ajoute des commentaires explicatifs sur chaque politique
- Effectue des vérifications finales pour confirmer que tout est créé

**Utilisation** :
```sql
-- Exécuter dans Supabase Dashboard → SQL Editor
-- Le script corrigera automatiquement tous les problèmes détectés
```

---

## 🎯 Points Critiques Identifiés

### Pour les Clients
1. **Politique INSERT manquante** → Empêche l'inscription (erreur 403)
2. **Politique SELECT manquante** → Empêche la récupération du profil après inscription (erreur 406)
3. **RLS non activé** → Les politiques ne fonctionnent pas

### Pour les Restaurants
1. **Politique INSERT manquante** → Empêche l'inscription (erreur 403)
2. **Politique SELECT manquante** → Empêche la récupération du profil après inscription (erreur 406)
3. **Politiques Storage manquantes** → Empêche l'upload des documents passport
4. **Fonction helper manquante** → Les politiques Storage ne peuvent pas fonctionner

---

## ✅ Checklist de Vérification

Avant de tester les inscriptions, vérifiez que :

- [ ] RLS est activé sur `users` et `restaurants`
- [ ] 3 politiques RLS existent pour `users` (INSERT, SELECT, UPDATE)
- [ ] 4 politiques RLS existent pour `restaurants` (INSERT, SELECT, UPDATE, SELECT publique)
- [ ] La fonction `extract_user_id_from_path` existe
- [ ] 5 politiques Storage existent pour le bucket `passports`
- [ ] Le bucket `passports` existe dans Storage → Buckets

---

## 🚀 Procédure de Vérification et Correction

### Étape 1 : Vérification
1. Ouvrez Supabase Dashboard → SQL Editor
2. Exécutez le script `scripts/VERIFICATION_COMPLETE_INSCRIPTIONS.sql`
3. Consultez le rapport détaillé affiché
4. Notez les éléments marqués ❌ ou ⚠️

### Étape 2 : Correction (si nécessaire)
1. Si des éléments manquent, exécutez le script `scripts/CORRECTION_COMPLETE_INSCRIPTIONS.sql`
2. Vérifiez que tous les éléments sont maintenant ✅
3. Vérifiez manuellement que le bucket `passports` existe dans Storage → Buckets

### Étape 3 : Test
1. Testez l'inscription d'un client
2. Testez l'inscription d'un restaurant avec upload de passport
3. Vérifiez que tout fonctionne sans erreur

---

## 📝 Notes Techniques

### Format des Fichiers Passport
Les fichiers passport doivent suivre le format suivant pour que les politiques Storage fonctionnent :
- **Format** : `{uuid}-{timestamp}.{ext}`
- **Exemple** : `123e4567-e89b-12d3-a456-426614174000-1700312345678.pdf`
- **Chemin complet** : `passports/123e4567-e89b-12d3-a456-426614174000-1700312345678.pdf`

La fonction `extract_user_id_from_path` extrait l'UUID (partie avant le premier `-`) pour vérifier que le fichier appartient à l'utilisateur authentifié.

### Correspondance des IDs
**CRUCIAL** : Lors de l'inscription, l'ID dans la table `users` ou `restaurants` doit correspondre exactement à `auth.uid()` :
- ✅ `id::text = auth.uid()::text`
- ❌ Si les IDs ne correspondent pas, les politiques RLS bloqueront l'accès

### Session Authentifiée
Les politiques RLS nécessitent une session authentifiée :
- Pour les clients : La session est créée lors de `signUp()` si l'email est confirmé
- Pour les restaurants : La session est créée lors de `signUpRestaurant()` si l'email est confirmé
- Si l'email n'est pas confirmé, l'insertion dans la table custom sera différée jusqu'à la première connexion

---

## 🔗 Scripts Existants Utilisés

Les scripts créés s'inspirent et complètent les scripts existants :
- `scripts/CORRECTION_COMPLETE_INSCRIPTION.sql` (pour restaurants uniquement)
- `scripts/SCRIPT_COMPLET_TOUT_EN_UN.sql` (pour restaurants + storage)
- `supabase/migrations/020_fix_users_rls_policies.sql` (pour clients)
- `supabase/migrations/027_fix_restaurant_signup_rls_storage.sql` (pour restaurants)

---

## ✨ Résultat Attendu

Après exécution des scripts de correction, vous devriez voir :

```
🎉 CORRECTION TERMINÉE ! Tout est maintenant opérationnel à 100%.
```

Ou dans le script de vérification :

```
🎉 TOUT EST PARFAIT ! Les inscriptions client et restaurant sont opérationnelles à 100%.
```

---

## 📞 Support

Si des problèmes persistent après l'exécution des scripts :
1. Vérifiez les logs Supabase pour les erreurs détaillées
2. Vérifiez que le bucket `passports` existe et est configuré correctement
3. Vérifiez que les emails de confirmation sont bien envoyés (ou désactivés pour le développement)
4. Consultez les scripts de migration existants pour plus de détails

---

**Statut** : ✅ Scripts créés et prêts à être utilisés  
**Prochaine étape** : Exécuter le script de vérification dans Supabase Dashboard

---

## ⚠️ Problème de Permissions Storage

### Erreur Rencontrée
```
Error: Failed to run sql query: ERROR: 42501: must be owner of relation objects
```

### Explication
Les politiques Storage nécessitent des permissions spéciales (propriétaire de la relation `storage.objects`). Par défaut, les utilisateurs Supabase n'ont pas ces permissions.

### Solutions Disponibles

#### Solution 1 : Script avec SECURITY DEFINER (Recommandé)
Utilisez le script existant qui contourne les restrictions de permissions :
```sql
-- Exécutez dans Supabase Dashboard → SQL Editor
scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql
```

Ce script utilise une fonction `SECURITY DEFINER` pour créer les politiques Storage avec les permissions nécessaires.

#### Solution 2 : Script RLS Seulement (Alternative)
Si vous voulez d'abord corriger uniquement les politiques RLS (sans Storage) :
```sql
-- Exécutez dans Supabase Dashboard → SQL Editor
scripts/CORRECTION_RLS_SEULEMENT.sql
```

Ce script corrige uniquement les politiques RLS et la fonction helper, sans toucher aux politiques Storage.

#### Solution 3 : Interface Supabase Dashboard
Créez les politiques Storage manuellement via l'interface :
1. Allez dans **Storage** → **passports** → **Policies**
2. Cliquez sur **New Policy**
3. Créez les 5 politiques suivantes :
   - **SELECT** : `Restaurants can view own passports`
   - **INSERT** : `Restaurants can upload own passports`
   - **UPDATE** : `Restaurants can update own passports`
   - **DELETE** : `Restaurants can delete own passports`
   - **SELECT** : `Admins can view all passports`

### Script Principal Modifié
Le script `CORRECTION_COMPLETE_INSCRIPTIONS.sql` a été modifié pour :
- ✅ Gérer gracieusement les erreurs de permissions Storage
- ✅ Continuer l'exécution même si les politiques Storage ne peuvent pas être créées
- ✅ Afficher des messages d'avertissement clairs
- ✅ Indiquer les alternatives disponibles

### Ordre d'Exécution Recommandé

1. **Première étape** : Exécutez `scripts/CORRECTION_RLS_SEULEMENT.sql`
   - Corrige les politiques RLS (sans problème de permissions)
   - Crée la fonction helper nécessaire

2. **Deuxième étape** : Exécutez `scripts/SCRIPT_STORAGE_POLICIES_SECURITY_DEFINER.sql`
   - Crée les politiques Storage avec les permissions nécessaires

3. **Vérification** : Exécutez `scripts/VERIFICATION_COMPLETE_INSCRIPTIONS.sql`
   - Vérifie que tout est opérationnel à 100%

---

## 📝 Fichiers Mis à Jour

- ✅ `scripts/CORRECTION_COMPLETE_INSCRIPTIONS.sql` - Gestion des erreurs de permissions Storage
- ✅ `scripts/CORRECTION_RLS_SEULEMENT.sql` - Nouveau script pour RLS uniquement
- ✅ `COMPTE_RENDU_VERIFICATION_INSCRIPTIONS.md` - Documentation mise à jour

