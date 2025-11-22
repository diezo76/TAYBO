# Compte Rendu - Création des Données d'Exemple

**Date :** $(date)  
**Fichiers créés :** 
- `scripts/insert_sample_data.sql`
- `GUIDE_INSERTION_DONNEES_EXEMPLE.md`

## 📋 Objectif

Créer 10 restaurants complets avec des menus variés et des utilisateurs clients d'exemple pour tester et démontrer l'application Taybo.

## ✅ Travail Effectué

### 1. Création du Script SQL Complet

Un script SQL complet a été créé dans `scripts/insert_sample_data.sql` contenant :

#### 🍕 10 Restaurants Complets

1. **Pizza Italiana** (Italienne)
   - Adresse : 123 Avenue Mohammed V, Casablanca
   - Spécialité : Pizzas au feu de bois
   - Frais de livraison : 15 MAD
   - Note moyenne : 4.5/5 (127 avis)
   - Image : Pizza italienne depuis Unsplash

2. **Sushi Master** (Japonais)
   - Adresse : 45 Boulevard Zerktouni, Casablanca
   - Spécialité : Sushis et sashimis frais
   - Frais de livraison : 20 MAD
   - Note moyenne : 4.7/5 (89 avis)
   - Image : Sushis depuis Unsplash

3. **Tajine Royal** (Marocain)
   - Adresse : 78 Rue Allal Ben Abdellah, Casablanca
   - Spécialité : Cuisine marocaine traditionnelle
   - Frais de livraison : 12 MAD
   - Note moyenne : 4.8/5 (203 avis)
   - Image : Tajine marocain depuis Unsplash

4. **Burger House** (Fast Food)
   - Adresse : 12 Boulevard Hassan II, Casablanca
   - Spécialité : Burgers halal premium
   - Frais de livraison : 10 MAD
   - Note moyenne : 4.4/5 (312 avis)
   - Image : Burger depuis Unsplash

5. **Le Bistrot Français** (Français)
   - Adresse : 56 Avenue des FAR, Casablanca
   - Spécialité : Cuisine française raffinée
   - Frais de livraison : 18 MAD
   - Note moyenne : 4.6/5 (145 avis)
   - Image : Restaurant français depuis Unsplash

6. **Spice Garden** (Indien)
   - Adresse : 89 Rue Ibn Battuta, Casablanca
   - Spécialité : Currys et biryanis authentiques
   - Frais de livraison : 16 MAD
   - Note moyenne : 4.5/5 (98 avis)
   - Image : Cuisine indienne depuis Unsplash

7. **La Pasta** (Italienne - Pâtes)
   - Adresse : 34 Boulevard Anfa, Casablanca
   - Spécialité : Pâtes fraîches faites maison
   - Frais de livraison : 14 MAD
   - Note moyenne : 4.3/5 (167 avis)
   - Image : Pâtes italiennes depuis Unsplash

8. **Dragon Palace** (Chinois)
   - Adresse : 67 Avenue Lalla Yacout, Casablanca
   - Spécialité : Cuisine chinoise authentique
   - Frais de livraison : 17 MAD
   - Note moyenne : 4.4/5 (134 avis)
   - Image : Cuisine chinoise depuis Unsplash

9. **Le Grill** (Grillades)
   - Adresse : 23 Boulevard Mohammed V, Casablanca
   - Spécialité : Viandes grillées au charbon
   - Frais de livraison : 19 MAD
   - Note moyenne : 4.7/5 (189 avis)
   - Image : Grillades depuis Unsplash

10. **Sweet Dreams** (Desserts & Café)
    - Adresse : 91 Rue Oued El Makhazine, Casablanca
    - Spécialité : Pâtisseries et café de qualité
    - Frais de livraison : 8 MAD
    - Note moyenne : 4.6/5 (256 avis)
    - Image : Pâtisserie depuis Unsplash

#### 🍽️ Menus Variés

Chaque restaurant contient **6 items de menu** répartis comme suit :
- **1-2 Entrées** : Salades, soupes, amuse-bouches
- **3-4 Plats** : Spécialités du restaurant
- **1 Dessert** : Desserts maison
- **1 Boisson** : Boissons variées

**Total : ~60 items de menu** avec :
- Descriptions détaillées
- Prix en MAD (dirhams marocains)
- Images depuis Unsplash
- Options personnalisables (tailles, épices, etc.)
- Allergènes et tags diététiques (halal, végétarien, vegan)
- Temps de préparation réalistes

#### 👥 10 Utilisateurs Clients d'Exemple

1. **Ahmed Benali** - Allergie : gluten | Préférences : halal
2. **Fatima Alami** - Allergies : aucune | Préférences : halal, végétarien
3. **Mohamed Idrissi** - Allergie : lactose | Préférences : halal
4. **Sara Bennani** - Allergies : aucune | Préférences : vegan
5. **Youssef Tazi** - Allergie : poisson | Préférences : halal
6. **Amina Berrada** - Allergies : gluten, lactose | Préférences : halal
7. **Karim Alami** - Allergies : aucune | Préférences : aucune
8. **Laila Benjelloun** - Allergie : oeufs | Préférences : halal
9. **Omar Fassi** - Allergies : aucune | Préférences : halal
10. **Nadia Chaoui** - Allergie : noix | Préférences : halal, végétarien

Chaque utilisateur a :
- Nom et prénom marocains authentiques
- Email d'exemple
- Numéro de téléphone marocain
- Langue préférée (fr/ar)
- Image de profil depuis Unsplash
- Allergies et préférences alimentaires variées

### 2. Images Utilisées

Toutes les images proviennent de **Unsplash** (service gratuit et libre d'utilisation) :
- ✅ URLs publiques et accessibles
- ✅ Images optimisées pour le web
- ✅ Qualité professionnelle
- ✅ Thématiques appropriées

**Types d'images :**
- **Restaurants** : Photos de restaurants et cuisines
- **Menus** : Photos de plats et spécialités
- **Utilisateurs** : Photos de profils variés

### 3. Guide d'Utilisation

Un guide complet a été créé dans `GUIDE_INSERTION_DONNEES_EXEMPLE.md` avec :
- Instructions détaillées pour exécuter le script
- 3 méthodes différentes (Interface Supabase, CLI, psql)
- Vérification des données
- Résolution de problèmes
- Personnalisation

## 📊 Statistiques

- **Restaurants** : 10
- **Items de menu** : ~60
- **Utilisateurs** : 10
- **Lignes de code SQL** : ~500+
- **Images** : 80+ URLs Unsplash

## 🔍 Caractéristiques des Données

### Réalisme
- ✅ Adresses réelles à Casablanca
- ✅ Numéros de téléphone marocains valides
- ✅ Prix en MAD (dirhams marocains)
- ✅ Horaires d'ouverture réalistes
- ✅ Noms marocains authentiques

### Diversité
- ✅ 7 types de cuisines différents
- ✅ Menus variés (entrées, plats, desserts, boissons)
- ✅ Préférences alimentaires variées (halal, végétarien, vegan)
- ✅ Allergies variées
- ✅ Langues variées (français, arabe)

### Complétude
- ✅ Tous les champs requis remplis
- ✅ Horaires d'ouverture complets (7 jours)
- ✅ Images pour tous les restaurants et menus
- ✅ Options personnalisables pour certains items
- ✅ Tags diététiques et allergènes

## ⚠️ Notes Importantes

### Mots de passe
Les mots de passe dans le script sont des **hashs d'exemple**. Pour tester l'authentification :
1. Créer les comptes via l'interface d'inscription
2. OU utiliser Supabase Auth directement

### IDs UUID
Les IDs sont prédéfinis pour faciliter le référencement. Si vous préférez des IDs générés automatiquement, supprimez les champs `id` des INSERT.

### Images
Les images utilisent des URLs Unsplash publiques. Pour stocker dans Supabase Storage :
1. Télécharger les images
2. Les uploader dans les buckets appropriés
3. Mettre à jour les URLs dans la base de données

## 🚀 Prochaines Étapes

1. **Exécuter le script SQL** dans Supabase
2. **Vérifier les données** dans l'interface
3. **Tester l'application** avec ces données
4. **Personnaliser** selon vos besoins

## 📝 Fichiers Créés

1. `scripts/insert_sample_data.sql` - Script SQL complet
2. `GUIDE_INSERTION_DONNEES_EXEMPLE.md` - Guide d'utilisation
3. `COMPTE_RENDU_CREATION_DONNEES_EXEMPLE.md` - Ce compte rendu

## ✅ Checklist de Vérification

Après exécution du script, vérifier :
- [ ] 10 restaurants visibles dans l'interface
- [ ] Chaque restaurant a 6 items de menu
- [ ] Les images s'affichent correctement
- [ ] Les horaires d'ouverture sont corrects
- [ ] Les prix sont en MAD
- [ ] Les utilisateurs peuvent être créés via l'interface

## 🎉 Résultat

Vous disposez maintenant de :
- ✅ 10 restaurants complets et variés
- ✅ ~60 items de menu avec images
- ✅ 10 utilisateurs clients d'exemple
- ✅ Des données réalistes pour tester l'application
- ✅ Un guide complet pour l'utilisation

Toutes les données sont prêtes à être insérées dans votre base de données Supabase !

