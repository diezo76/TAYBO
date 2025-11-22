# Scripts SQL pour Créer les 15 Policies Storage

## 📋 Deux Scripts Disponibles

### Option 1 : Script avec Fonction Helper (Recommandé)
**Fichier** : `scripts/create_all_storage_policies.sql`

**Avantages** :
- Utilise une fonction `SECURITY DEFINER` pour contourner les problèmes de permissions
- Plus robuste face aux erreurs de permissions
- Code plus propre et réutilisable

**Utilisation** :
1. Ouvrez Supabase Dashboard > SQL Editor
2. Copiez tout le contenu de `scripts/create_all_storage_policies.sql`
3. Collez et exécutez (Run)

---

### Option 2 : Script Direct (Plus Simple)
**Fichier** : `scripts/create_all_storage_policies_direct.sql`

**Avantages** :
- Plus simple et direct
- Facile à comprendre
- Pas de fonction helper

**Utilisation** :
1. Ouvrez Supabase Dashboard > SQL Editor
2. Copiez tout le contenu de `scripts/create_all_storage_policies_direct.sql`
3. Collez et exécutez (Run)

---

## 🎯 Ce que les Scripts Créent

### Total : 15 Policies

#### `restaurant-images` (4 policies)
1. ✅ `Public Access to Restaurant Images` - SELECT (public)
2. ✅ `Restaurants can upload own images` - INSERT (restaurants)
3. ✅ `Restaurants can update own images` - UPDATE (restaurants)
4. ✅ `Restaurants can delete own images` - DELETE (restaurants)

#### `menu-images` (4 policies)
1. ✅ `Public Access to Menu Images` - SELECT (public)
2. ✅ `Restaurants can upload menu images` - INSERT (restaurants)
3. ✅ `Restaurants can update menu images` - UPDATE (restaurants)
4. ✅ `Restaurants can delete menu images` - DELETE (restaurants)

#### `user-images` (4 policies)
1. ✅ `Public Access to User Images` - SELECT (public)
2. ✅ `Users can upload own images` - INSERT (users)
3. ✅ `Users can update own images` - UPDATE (users)
4. ✅ `Users can delete own images` - DELETE (users)

#### `passports` (3 policies)
1. ✅ `Restaurants can view own passports` - SELECT (restaurants)
2. ✅ `Restaurants can upload own passports` - INSERT (restaurants)
3. ✅ `Admins can view all passports` - SELECT (admins)

---

## ✅ Vérification

Après avoir exécuté le script, vous verrez :
- Une liste de toutes les policies créées
- Le nombre total de policies (devrait être 15 ou plus)
- Un message de succès ou d'avertissement

---

## ⚠️ Si Vous Obtenez Toujours une Erreur

Si vous obtenez toujours l'erreur `must be owner of relation objects` :

1. **Utilisez l'interface Supabase Dashboard** (méthode recommandée)
   - Voir `SOLUTION_ERREUR_STORAGE_POLICIES.md` pour les instructions détaillées
   - Voir `INSTRUCTIONS_RAPIDES_POLICIES.md` pour le guide rapide

2. **Vérifiez vos permissions**
   - Assurez-vous d'être connecté avec le bon compte
   - Vérifiez que vous êtes le propriétaire du projet Supabase

3. **Contactez le support Supabase**
   - Si vous êtes le propriétaire du projet et que ça ne fonctionne toujours pas

---

## 🚀 Après la Création des Policies

1. ✅ Rafraîchissez votre application (Ctrl+F5)
2. ✅ Les images devraient maintenant se charger !
3. ✅ Vérifiez la console du navigateur (F12) pour confirmer qu'il n'y a plus d'erreurs 403

---

**Les deux scripts créent exactement les mêmes 15 policies. Choisissez celui que vous préférez !**

