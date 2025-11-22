# Guide de Test - Taybo MVP

**Date** : Aujourd'hui

## 📋 Checklist de Test

### Phase 1 : Configuration Initiale

- [ ] **Variables d'environnement**
  - [ ] Fichier `.env` créé avec `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
  - [ ] Variables correctement configurées

- [ ] **Base de données Supabase**
  - [ ] Toutes les migrations appliquées (001 à 012)
  - [ ] Buckets Storage créés :
    - [ ] `restaurant-images` (public)
    - [ ] `menu-images` (public)
    - [ ] `passports` (privé)
  - [ ] Row Level Security (RLS) activé sur toutes les tables
  - [ ] Trigger de mise à jour des notes moyennes fonctionnel

- [ ] **Dépendances**
  - [ ] `npm install` exécuté avec succès
  - [ ] Aucune erreur de dépendances

---

### Phase 2 : Authentification

#### Client
- [ ] **Inscription**
  - [ ] Formulaire d'inscription accessible
  - [ ] Validation des champs (email, mot de passe, nom, prénom)
  - [ ] Création de compte réussie
  - [ ] Redirection vers la page d'accueil après inscription

- [ ] **Connexion**
  - [ ] Formulaire de connexion accessible
  - [ ] Connexion avec email/mot de passe valides
  - [ ] Gestion des erreurs (mauvais identifiants)
  - [ ] Redirection vers la page d'accueil après connexion

- [ ] **Déconnexion**
  - [ ] Bouton de déconnexion fonctionnel
  - [ ] Session supprimée après déconnexion

#### Restaurant
- [ ] **Inscription**
  - [ ] Formulaire d'inscription accessible
  - [ ] Upload de document passeport fonctionnel
  - [ ] Validation des champs
  - [ ] Création de compte réussie
  - [ ] Message d'attente de vérification affiché

- [ ] **Connexion**
  - [ ] Connexion avec compte vérifié et actif
  - [ ] Message d'attente si compte non vérifié
  - [ ] Message d'erreur si compte désactivé

#### Admin
- [ ] **Connexion**
  - [ ] Connexion avec email `admin@taybo.com`
  - [ ] Accès au dashboard admin
  - [ ] Gestion des erreurs

---

### Phase 3 : Interface Client

#### Page d'Accueil
- [ ] Liste des restaurants affichée
- [ ] Recherche de restaurants fonctionnelle
- [ ] Filtres par type de cuisine (si implémenté)
- [ ] Navigation vers détail restaurant

#### Détail Restaurant
- [ ] Informations du restaurant affichées
- [ ] Menu groupé par catégories
- [ ] Ajout d'articles au panier
- [ ] Bouton favoris restaurant fonctionnel
- [ ] Bouton favoris plats fonctionnel
- [ ] Affichage des avis (si disponibles)
- [ ] Affichage de la note moyenne

#### Panier
- [ ] Articles du panier affichés
- [ ] Modification des quantités
- [ ] Suppression d'articles
- [ ] Calcul correct du total
- [ ] Bouton "Passer la commande" fonctionnel

#### Checkout
- [ ] Formulaire d'adresse de livraison
- [ ] Sélection du mode de paiement
- [ ] Livraison programmée (optionnelle)
- [ ] Récapitulatif de la commande
- [ ] Création de commande réussie
- [ ] Redirection vers confirmation

#### Confirmation de Commande
- [ ] Détails de la commande affichés
- [ ] Informations correctes
- [ ] Navigation vers historique des commandes

#### Historique des Commandes
- [ ] Liste des commandes affichée
- [ ] Filtres par statut fonctionnels
- [ ] Détails d'une commande accessibles
- [ ] Bouton "Laisser un avis" pour commandes livrées
- [ ] Formulaire d'avis fonctionnel
- [ ] Modification d'avis existant

#### Favoris
- [ ] Liste des restaurants favoris
- [ ] Liste des plats favoris
- [ ] Suppression de favoris
- [ ] Navigation vers restaurants depuis favoris

#### Profil
- [ ] Informations personnelles affichées
- [ ] Modification des informations
- [ ] Gestion des allergies
- [ ] Gestion des préférences alimentaires
- [ ] Changement de langue préférée

---

### Phase 4 : Interface Restaurant

#### Dashboard
- [ ] Statistiques affichées (commandes, revenus, note moyenne)
- [ ] Navigation vers les différentes sections
- [ ] Messages de statut (vérification, désactivé)

#### Gestion du Menu
- [ ] Liste des plats affichée
- [ ] Filtres par catégorie
- [ ] Ajout d'un plat avec image
- [ ] Modification d'un plat
- [ ] Suppression d'un plat
- [ ] Activation/désactivation d'un plat

#### Gestion des Commandes
- [ ] Liste des commandes affichée
- [ ] Filtres par statut
- [ ] Acceptation d'une commande
- [ ] Refus d'une commande
- [ ] Mise à jour du statut (préparation → prêt → livraison → livré)
- [ ] Détails complets d'une commande

#### Gestion des Promotions
- [ ] Liste des promotions affichée
- [ ] Filtres par statut
- [ ] Création d'une promotion
- [ ] Modification d'une promotion
- [ ] Suppression d'une promotion
- [ ] Activation/désactivation d'une promotion
- [ ] Validation des dates et pourcentages

#### Gestion des Horaires d'Ouverture
- [ ] Horaires actuels affichés
- [ ] Modification des horaires par jour
- [ ] Fermeture/ouverture d'un jour
- [ ] Sauvegarde des modifications

---

### Phase 5 : Interface Admin

#### Dashboard
- [ ] KPIs affichés (restaurants, clients, commandes, revenus)
- [ ] Navigation vers les différentes sections
- [ ] Actions rapides fonctionnelles

#### Gestion des Restaurants
- [ ] Liste des restaurants affichée
- [ ] Recherche fonctionnelle
- [ ] Filtres par statut
- [ ] Validation d'un restaurant
- [ ] Rejet d'un restaurant
- [ ] Activation/désactivation d'un restaurant
- [ ] Visualisation du document passeport

#### Gestion des Clients
- [ ] Liste des clients affichée
- [ ] Recherche fonctionnelle
- [ ] Détails d'un client accessibles

#### Gestion des Commandes
- [ ] Liste de toutes les commandes
- [ ] Filtres par statut et restaurant
- [ ] Détails complets d'une commande

#### Tickets de Support
- [ ] Liste des tickets affichée
- [ ] Filtres par statut et priorité
- [ ] Réponse à un ticket
- [ ] Fermeture d'un ticket
- [ ] Historique des messages

#### Paiements de Commissions
- [ ] Liste des paiements affichée
- [ ] Filtres par statut et restaurant
- [ ] Marquage d'un paiement comme payé
- [ ] Statistiques (total en attente, total payé)

---

### Phase 6 : Fonctionnalités Transversales

#### Système de Notation et Avis
- [ ] Création d'un avis après commande livrée
- [ ] Modification d'un avis existant
- [ ] Affichage des avis sur la page restaurant
- [ ] Mise à jour automatique de la note moyenne
- [ ] Mise à jour automatique du nombre total d'avis

#### Favoris
- [ ] Ajout d'un restaurant aux favoris
- [ ] Ajout d'un plat aux favoris
- [ ] Suppression de favoris
- [ ] Vérification du statut favori en temps réel

#### Internationalisation
- [ ] Changement de langue (FR/AR/EN)
- [ ] Support RTL pour l'arabe
- [ ] Toutes les traductions présentes
- [ ] Pas de texte en dur dans le code

---

### Phase 7 : Tests de Performance et Responsive

#### Responsive Design
- [ ] Affichage correct sur mobile (< 768px)
- [ ] Affichage correct sur tablette (768px - 1024px)
- [ ] Affichage correct sur desktop (> 1024px)
- [ ] Navigation mobile fonctionnelle

#### Performance
- [ ] Temps de chargement acceptable (< 3s)
- [ ] Images optimisées
- [ ] Pas d'erreurs dans la console
- [ ] Pas de warnings majeurs

---

### Phase 8 : Tests de Sécurité

- [ ] Routes protégées (authentification requise)
- [ ] Redirection si non authentifié
- [ ] RLS fonctionnel (les utilisateurs ne voient que leurs données)
- [ ] Validation des données côté client
- [ ] Gestion sécurisée des tokens d'authentification

---

## 🐛 Tests de Bugs Connus

### À Vérifier
1. **Upload d'images**
   - [ ] Upload de logo restaurant fonctionne
   - [ ] Upload de photo de plat fonctionne
   - [ ] Upload de document passeport fonctionne
   - [ ] Gestion des erreurs (fichier trop volumineux, type invalide)

2. **Calculs**
   - [ ] Total du panier correct
   - [ ] Frais de livraison ajoutés correctement
   - [ ] Notes moyennes calculées correctement

3. **États**
   - [ ] Gestion des états de chargement
   - [ ] Gestion des erreurs réseau
   - [ ] Messages d'erreur utilisateur clairs

---

## 📝 Scénarios de Test End-to-End

### Scénario 1 : Commande Complète
1. Client s'inscrit
2. Client se connecte
3. Client parcourt les restaurants
4. Client ajoute des plats au panier
5. Client passe commande avec paiement à la livraison
6. Restaurant accepte la commande
7. Restaurant met à jour le statut (préparation → prêt → livraison → livré)
8. Client laisse un avis
9. Note moyenne du restaurant mise à jour

### Scénario 2 : Gestion Restaurant
1. Restaurant s'inscrit avec document passeport
2. Admin valide le restaurant
3. Restaurant se connecte
4. Restaurant ajoute des plats au menu
5. Restaurant configure les horaires d'ouverture
6. Restaurant crée une promotion
7. Restaurant reçoit et gère des commandes

### Scénario 3 : Support
1. Client crée un ticket de support
2. Admin répond au ticket
3. Ticket fermé par l'admin

---

## ✅ Critères de Réussite

Pour considérer le MVP comme fonctionnel, il faut que :

1. ✅ Toutes les fonctionnalités principales fonctionnent sans erreur critique
2. ✅ Les utilisateurs peuvent créer des comptes et se connecter
3. ✅ Les clients peuvent passer des commandes
4. ✅ Les restaurants peuvent gérer leur menu et commandes
5. ✅ Les admins peuvent gérer la plateforme
6. ✅ Le système de notation et avis fonctionne
7. ✅ Les traductions sont complètes (FR/AR/EN)
8. ✅ L'application est responsive sur mobile

---

## 📞 Support et Documentation

- **Documentation technique** : Voir `README.md` et `COMPTE_RENDU.md`
- **Instructions de setup** : Voir `SETUP_INSTRUCTIONS.md`
- **Configuration Storage** : Voir `supabase/STORAGE_SETUP.md`

---

**Note** : Ce document doit être mis à jour au fur et à mesure des tests et des corrections de bugs.

