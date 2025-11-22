# ✅ SOLUTION DÉFINITIVE : Créer les politiques Storage via l'interface

## ⚠️ Pourquoi SQL ne fonctionne pas ?

Même avec `SECURITY DEFINER`, vous obtenez :
```
ERROR: 42501: must be owner of relation objects
```

**Raison** : Supabase limite les permissions SQL sur `storage.objects` pour des raisons de sécurité.

**Solution** : Utiliser l'interface Dashboard (c'est la méthode officielle recommandée par Supabase)

---

## 🎯 SOLUTION EN 2 ÉTAPES SIMPLES

### ✅ Étape 1 : SQL pour RLS (DÉJÀ FAIT)

Vous avez déjà créé les politiques RLS ✅

### ✅ Étape 2 : Interface pour Storage (5 MINUTES)

Créez les politiques Storage via l'interface Supabase Dashboard.

---

## 📋 INSTRUCTIONS DÉTAILLÉES

### 1. Ouvrir Storage dans Supabase

1. Allez sur : https://supabase.com/dashboard
2. Sélectionnez votre projet **Taybo**
3. Dans le menu de gauche, cliquez sur **Storage**

### 2. Sélectionner le bucket passports

1. Vous devriez voir la liste des buckets
2. Cliquez sur le bucket **passports**
   - Si le bucket n'existe pas, créez-le :
     - Cliquez sur **New bucket**
     - Nom : `passports`
     - Public : ❌ **NON** (laissez décoché)
     - Cliquez sur **Create bucket**

### 3. Aller dans l'onglet Policies

1. En haut de la page du bucket, vous verrez plusieurs onglets
2. Cliquez sur l'onglet **Policies**

### 4. Créer la première politique (SELECT)

1. Cliquez sur le bouton **New Policy** (en haut à droite)
2. Choisissez **Create a policy from scratch**
3. Remplissez le formulaire :

   **Policy name** :
   ```
   Restaurants can view own passports
   ```

   **Allowed operation** :
   ```
   SELECT
   ```

   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```

4. Cliquez sur **Review** puis **Save policy**

### 5. Créer la deuxième politique (INSERT)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Remplissez :

   **Policy name** :
   ```
   Restaurants can upload own passports
   ```

   **Allowed operation** :
   ```
   INSERT
   ```

   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```

4. Cliquez sur **Review** puis **Save policy**

### 6. Créer la troisième politique (UPDATE)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Remplissez :

   **Policy name** :
   ```
   Restaurants can update own passports
   ```

   **Allowed operation** :
   ```
   UPDATE
   ```

   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```

4. Cliquez sur **Review** puis **Save policy**

### 7. Créer la quatrième politique (DELETE)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Remplissez :

   **Policy name** :
   ```
   Restaurants can delete own passports
   ```

   **Allowed operation** :
   ```
   DELETE
   ```

   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND auth.uid() IS NOT NULL
   AND auth.uid()::text = extract_user_id_from_path(name)
   ```

4. Cliquez sur **Review** puis **Save policy**

### 8. Créer la cinquième politique (SELECT Admin)

1. Cliquez sur **New Policy**
2. Choisissez **Create a policy from scratch**
3. Remplissez :

   **Policy name** :
   ```
   Admins can view all passports
   ```

   **Allowed operation** :
   ```
   SELECT
   ```

   **Policy definition** :
   ```sql
   bucket_id = 'passports'
   AND EXISTS (
     SELECT 1 FROM users
     WHERE users.id::text = auth.uid()::text
     AND users.email = 'admin@taybo.com'
   )
   ```

4. Cliquez sur **Review** puis **Save policy**

---

## ✅ VÉRIFICATION

Après avoir créé les 5 politiques, vous devriez voir dans la liste :

1. ✅ Restaurants can view own passports (SELECT)
2. ✅ Restaurants can upload own passports (INSERT)
3. ✅ Restaurants can update own passports (UPDATE)
4. ✅ Restaurants can delete own passports (DELETE)
5. ✅ Admins can view all passports (SELECT)

---

## 🎉 C'EST TERMINÉ !

Après ces étapes :
- ✅ Les restaurants peuvent s'inscrire
- ✅ Les restaurants peuvent uploader leur passport
- ✅ Les politiques RLS fonctionnent
- ✅ Les politiques Storage fonctionnent

---

## 📸 Aide visuelle

### Chemin dans l'interface

```
Supabase Dashboard
└── Votre projet Taybo
    └── Storage (menu de gauche)
        └── passports (bucket)
            └── Policies (onglet en haut)
                └── New Policy (bouton)
```

### Format du formulaire

Quand vous créez une politique, vous verrez :

```
┌─────────────────────────────────────┐
│ Policy name:                        │
│ [Restaurants can view own passports]│
│                                     │
│ Allowed operation:                  │
│ [SELECT ▼]                          │
│                                     │
│ Policy definition:                  │
│ ┌─────────────────────────────────┐ │
│ │ bucket_id = 'passports'         │ │
│ │ AND auth.uid() IS NOT NULL      │ │
│ │ AND auth.uid()::text = ...      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Review] [Save policy]              │
└─────────────────────────────────────┘
```

---

## ❓ Questions fréquentes

### Pourquoi SQL ne fonctionne pas ?

Supabase limite intentionnellement les permissions SQL sur `storage.objects` pour des raisons de sécurité. C'est une fonctionnalité, pas un bug.

### Est-ce que je dois recréer les politiques à chaque déploiement ?

**NON** ! Les politiques Storage persistent dans votre base de données. Vous ne devez les créer qu'une seule fois.

### Puis-je automatiser cela ?

**OUI**, mais c'est complexe :
- Utiliser l'API Management Supabase avec la clé `service_role`
- Utiliser Terraform ou d'autres outils IaC
- Pour la plupart des cas, créer manuellement une fois suffit

### La fonction extract_user_id_from_path existe-t-elle ?

**OUI**, vous l'avez créée dans l'Étape 1 (SQL RLS). Elle est utilisée dans les définitions des politiques Storage.

---

## 💡 Astuce

**Sauvegardez les définitions** des politiques dans un fichier texte. Si vous créez un nouveau projet Supabase, vous pourrez les réutiliser rapidement !

---

## 📁 Fichiers de référence

- `GUIDE_CREATION_POLICIES_STORAGE_INTERFACE.md` : Guide détaillé avec plus d'explications
- `scripts/SCRIPT_RLS_ET_FONCTION_SEULEMENT.sql` : Script SQL pour RLS (déjà exécuté ✅)

---

**Cette méthode fonctionne à 100% !** 🚀

Suivez ces instructions étape par étape et tout fonctionnera parfaitement.

