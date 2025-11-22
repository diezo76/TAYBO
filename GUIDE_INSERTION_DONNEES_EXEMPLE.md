# Guide d'Insertion des Données d'Exemple

Ce guide explique comment insérer les 10 restaurants complets avec leurs menus et les utilisateurs clients d'exemple dans votre base de données Supabase.

## 📋 Contenu du Script

Le script `scripts/insert_sample_data.sql` contient :

### 🍕 10 Restaurants Complets
1. **Pizza Italiana** - Cuisine italienne (Pizzas)
2. **Sushi Master** - Cuisine japonaise (Sushis)
3. **Tajine Royal** - Cuisine marocaine (Tajines)
4. **Burger House** - Fast Food (Burgers)
5. **Le Bistrot Français** - Cuisine française
6. **Spice Garden** - Cuisine indienne
7. **La Pasta** - Cuisine italienne (Pâtes)
8. **Dragon Palace** - Cuisine chinoise
9. **Le Grill** - Grillades
10. **Sweet Dreams** - Desserts & Café

### 🍽️ Menus Variés
Chaque restaurant contient :
- **Entrées** variées
- **Plats** principaux (3-4 par restaurant)
- **Desserts** maison
- **Boissons** diverses

### 👥 10 Utilisateurs Clients d'Exemple
- Profils variés avec noms marocains
- Préférences alimentaires différentes (halal, végétarien, vegan)
- Allergies variées
- Images de profil depuis Unsplash

## 🚀 Méthode 1 : Via l'Interface Supabase (Recommandé)

### Étape 1 : Accéder à Supabase
1. Connectez-vous à votre projet Supabase : https://supabase.com
2. Allez dans **SQL Editor** dans le menu latéral

### Étape 2 : Exécuter le Script
1. Cliquez sur **New Query**
2. Ouvrez le fichier `scripts/insert_sample_data.sql`
3. Copiez tout le contenu du fichier
4. Collez-le dans l'éditeur SQL de Supabase
5. Cliquez sur **Run** ou appuyez sur `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### Étape 3 : Vérifier les Données
1. Allez dans **Table Editor**
2. Vérifiez les tables :
   - `restaurants` (devrait contenir 10 restaurants)
   - `menu_items` (devrait contenir environ 60 items de menu)
   - `users` (devrait contenir 10 utilisateurs)

## 🚀 Méthode 2 : Via la CLI Supabase

### Prérequis
```bash
# Installer Supabase CLI si ce n'est pas déjà fait
npm install -g supabase
```

### Étape 1 : Se connecter à Supabase
```bash
supabase login
```

### Étape 2 : Lier votre projet
```bash
supabase link --project-ref votre-project-ref
```

### Étape 3 : Exécuter le script
```bash
supabase db execute --file scripts/insert_sample_data.sql
```

## 🚀 Méthode 3 : Via psql (PostgreSQL)

### Prérequis
- Avoir les identifiants de connexion à votre base de données Supabase
- Avoir `psql` installé

### Étape 1 : Récupérer les identifiants
1. Allez dans **Project Settings** > **Database**
2. Copiez les informations de connexion

### Étape 2 : Se connecter
```bash
psql -h db.votre-project.supabase.co -U postgres -d postgres
```

### Étape 3 : Exécuter le script
```bash
\i scripts/insert_sample_data.sql
```

## ⚠️ Notes Importantes

### Mots de passe
Les mots de passe dans le script sont des hashs d'exemple. **Pour tester l'authentification**, vous devrez :

1. **Pour les restaurants** : Créer des comptes via l'interface d'inscription restaurant
2. **Pour les utilisateurs** : Créer des comptes via l'interface d'inscription client

OU utiliser Supabase Auth directement pour créer les utilisateurs avec des mots de passe réels.

### Images
Les images utilisent des URLs Unsplash publiques. Elles sont :
- ✅ Gratuites et libres d'utilisation
- ✅ Accessibles publiquement
- ✅ Optimisées pour le web

Si vous souhaitez télécharger et stocker les images dans Supabase Storage :
1. Téléchargez les images depuis les URLs
2. Uploadez-les dans les buckets appropriés :
   - `restaurant-images` pour les restaurants
   - `menu-item-images` pour les items de menu
   - `user-images` pour les utilisateurs
3. Mettez à jour les URLs dans la base de données

### IDs UUID
Les IDs dans le script sont des UUIDs prédéfinis pour faciliter le référencement. Si vous préférez générer des IDs automatiquement, supprimez les champs `id` des INSERT et laissez PostgreSQL les générer.

## 🔍 Vérification des Données

### Vérifier les Restaurants
```sql
SELECT id, name, cuisine_type, is_active, is_verified 
FROM restaurants 
ORDER BY name;
```

### Vérifier les Menus
```sql
SELECT r.name as restaurant, COUNT(mi.id) as nombre_menus
FROM restaurants r
LEFT JOIN menu_items mi ON r.id = mi.restaurant_id
GROUP BY r.id, r.name
ORDER BY r.name;
```

### Vérifier les Utilisateurs
```sql
SELECT id, email, first_name, last_name, language 
FROM users 
ORDER BY last_name;
```

## 🐛 Résolution de Problèmes

### Erreur : "duplicate key value violates unique constraint"
- **Cause** : Les données existent déjà dans la base
- **Solution** : Supprimez d'abord les données existantes ou modifiez les IDs

### Erreur : "foreign key constraint"
- **Cause** : Tentative d'insérer un menu_item avec un restaurant_id inexistant
- **Solution** : Vérifiez que tous les restaurants sont insérés avant les menus

### Erreur : "check constraint"
- **Cause** : Valeur non conforme aux contraintes (ex: category doit être 'entrée', 'plat', 'dessert', ou 'boisson')
- **Solution** : Vérifiez les valeurs dans le script

## 📝 Personnalisation

Pour ajouter vos propres restaurants :

1. Copiez un bloc INSERT de restaurant
2. Modifiez les valeurs selon vos besoins
3. Ajoutez les menus correspondants avec le même `restaurant_id`
4. Exécutez le script

## ✅ Checklist Post-Insertion

- [ ] 10 restaurants visibles dans l'interface
- [ ] Chaque restaurant a au moins 5-6 items de menu
- [ ] Les images s'affichent correctement
- [ ] Les horaires d'ouverture sont corrects
- [ ] Les prix sont en MAD (dirhams marocains)
- [ ] Les utilisateurs peuvent être créés via l'interface d'inscription

## 🎉 Résultat Attendu

Après l'exécution du script, vous devriez avoir :
- ✅ 10 restaurants actifs et vérifiés
- ✅ ~60 items de menu variés
- ✅ 10 utilisateurs clients d'exemple
- ✅ Des données réalistes pour tester l'application

