# Guide d'Exécution du Script d'Insertion des Données

Ce guide vous explique comment insérer les 10 restaurants, leurs menus et les utilisateurs clients d'exemple dans votre base de données Supabase.

## 🎯 Méthode Recommandée : Via l'Interface Supabase (La Plus Simple)

### Étape 1 : Accéder à Supabase SQL Editor

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet "Taybo"
3. Dans le menu latéral gauche, cliquez sur **SQL Editor**

### Étape 2 : Créer une Nouvelle Requête

1. Cliquez sur **New Query** (ou le bouton "+" en haut)
2. Donnez un nom à votre requête : "Insert Sample Data"

### Étape 3 : Copier et Coller le Script SQL

1. Ouvrez le fichier `scripts/insert_sample_data.sql` dans votre éditeur
2. **Sélectionnez tout le contenu** (Ctrl+A / Cmd+A)
3. **Copiez** (Ctrl+C / Cmd+C)
4. **Collez** dans l'éditeur SQL de Supabase (Ctrl+V / Cmd+V)

### Étape 4 : Exécuter le Script

1. Cliquez sur le bouton **Run** (ou appuyez sur `Ctrl+Enter` / `Cmd+Enter`)
2. Attendez quelques secondes que le script s'exécute
3. Vous devriez voir un message de succès avec le nombre de lignes insérées

### Étape 5 : Vérifier les Données

1. Allez dans **Table Editor** dans le menu latéral
2. Vérifiez les tables :
   - **restaurants** : Devrait contenir 10 restaurants
   - **menu_items** : Devrait contenir ~60 items de menu
   - **users** : Devrait contenir 10 utilisateurs

## 🔧 Méthode Alternative : Via Script Node.js

Si vous préférez utiliser un script Node.js :

### Prérequis

```bash
# Installer dotenv si ce n'est pas déjà fait
npm install dotenv --save-dev
```

### Exécution

```bash
node scripts/insert-sample-data.js
```

**Note** : Cette méthode insère uniquement les restaurants. Pour les menus et utilisateurs, utilisez le script SQL.

## ⚠️ Résolution de Problèmes

### Erreur : "duplicate key value violates unique constraint"

**Cause** : Les données existent déjà dans la base de données.

**Solution** :
1. Supprimez d'abord les données existantes :
   ```sql
   DELETE FROM menu_items;
   DELETE FROM restaurants;
   DELETE FROM users WHERE email LIKE '%@example.com';
   ```
2. Réexécutez le script

### Erreur : "permission denied"

**Cause** : Les politiques RLS (Row Level Security) bloquent l'insertion.

**Solution** :
1. Vérifiez que vous êtes connecté en tant qu'administrateur dans Supabase
2. Ou désactivez temporairement RLS pour les tables concernées (non recommandé en production)

### Erreur : "relation does not exist"

**Cause** : Les tables n'existent pas encore.

**Solution** :
1. Exécutez d'abord les migrations SQL dans l'ordre :
   - `supabase/migrations/001_create_users_table.sql`
   - `supabase/migrations/002_create_restaurants_table.sql`
   - `supabase/migrations/003_create_menu_items_table.sql`
   - Etc.

## ✅ Vérification Post-Insertion

### Vérifier les Restaurants

```sql
SELECT id, name, cuisine_type, is_active, is_verified 
FROM restaurants 
ORDER BY name;
```

Vous devriez voir 10 restaurants.

### Vérifier les Menus

```sql
SELECT r.name as restaurant, COUNT(mi.id) as nombre_menus
FROM restaurants r
LEFT JOIN menu_items mi ON r.id = mi.restaurant_id
GROUP BY r.id, r.name
ORDER BY r.name;
```

Chaque restaurant devrait avoir 6 items de menu.

### Vérifier les Utilisateurs

```sql
SELECT id, email, first_name, last_name, language 
FROM users 
WHERE email LIKE '%@example.com'
ORDER BY last_name;
```

Vous devriez voir 10 utilisateurs.

## 📊 Données Insérées

Après l'exécution réussie, vous devriez avoir :

- ✅ **10 restaurants** complets avec images
- ✅ **~60 items de menu** variés
- ✅ **10 utilisateurs clients** d'exemple
- ✅ Toutes les données avec images depuis Unsplash

## 🎉 Prochaines Étapes

Une fois les données insérées :

1. **Tester l'application** : Lancez `npm run dev` et visitez http://localhost:5173
2. **Vérifier l'affichage** : Les restaurants devraient apparaître sur la page d'accueil
3. **Tester les menus** : Cliquez sur un restaurant pour voir ses menus
4. **Tester l'inscription** : Créez un nouveau compte client pour tester

## 💡 Astuce

Si vous voulez réinitialiser toutes les données d'exemple :

```sql
-- Supprimer les menus
DELETE FROM menu_items WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE email LIKE '%@taybo.com'
);

-- Supprimer les restaurants
DELETE FROM restaurants WHERE email LIKE '%@taybo.com';

-- Supprimer les utilisateurs d'exemple
DELETE FROM users WHERE email LIKE '%@example.com';
```

Puis réexécutez le script d'insertion.

