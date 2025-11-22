# Taybo MVP - Plateforme de Livraison de Nourriture

Plateforme web de mise en relation entre restaurants/dark kitchens et consommateurs au Caire, Égypte.

## 🚀 État du Projet

### ✅ Complété

1. **Setup Initial**
   - ✅ Projet React + Vite initialisé
   - ✅ TailwindCSS configuré avec design system (couleurs jaune/rouge)
   - ✅ Structure de dossiers créée
   - ✅ Configuration i18n (FR/AR/EN) avec support RTL

2. **Base de Données Supabase**
   - ✅ Toutes les tables créées (users, restaurants, menu_items, orders, reviews, etc.)
   - ✅ Row Level Security (RLS) configuré
   - ✅ Indexes créés pour optimiser les performances
   - ⚠️ Buckets Storage à créer manuellement (voir `supabase/STORAGE_SETUP.md`)

3. **Authentification Clients**
   - ✅ Service d'authentification avec Supabase Auth
   - ✅ Contexte Auth (AuthContext)
   - ✅ Pages Login et SignUp
   - ✅ Protection des routes

### 🚧 En Cours / À Faire

- Authentification Restaurants (avec upload passeport)
- Authentification Admin
- Interface Restaurant (Dashboard, Menu, Commandes)
- Interface Client (Accueil, Restaurants, Panier, Paiement)
- Interface Admin (Dashboard, Gestion)
- Intégration paiements (Stripe, Paymob, Fawry)
- Notifications push
- Optimisations et déploiement

## 📋 Prérequis

- Node.js 18+ et npm
- Compte Supabase avec projet créé
- Variables d'environnement configurées (voir `.env.example`)

## 🛠️ Installation

1. **Cloner et installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**
Créez un fichier `.env` à la racine avec :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

3. **Créer les buckets Storage dans Supabase**
Suivez les instructions dans `supabase/STORAGE_SETUP.md`

4. **Lancer le serveur de développement**
```bash
npm run dev
```

## 📁 Structure du Projet

```
taybo/
├── src/
│   ├── components/       # Composants réutilisables
│   ├── pages/            # Pages de l'application
│   ├── contexts/         # Contextes React (Auth, Cart, etc.)
│   ├── services/         # Services (Supabase, Auth, etc.)
│   ├── i18n/            # Traductions multi-langues
│   └── utils/           # Fonctions utilitaires
├── supabase/
│   ├── migrations/      # Migrations SQL
│   └── functions/       # Edge Functions (à venir)
└── public/              # Assets statiques
```

## 🔐 Authentification

L'application utilise Supabase Auth pour l'authentification. Les données utilisateur sont stockées dans des tables custom (`users`, `restaurants`) pour plus de contrôle.

### Types d'utilisateurs

1. **Clients** : Peuvent commander de la nourriture
2. **Restaurants** : Gèrent leur menu et commandes
3. **Admin** : Gère la plateforme

## 🌍 Internationalisation

L'application supporte 3 langues :
- Français (fr) - par défaut
- Arabe (ar) - avec support RTL
- Anglais (en)

Le sélecteur de langue est disponible dans le header.

## 📊 Base de Données

Toutes les tables sont créées dans Supabase avec :
- Contraintes de données
- Indexes pour performance
- Row Level Security (RLS) pour sécurité
- Triggers pour updated_at automatique

## 🚀 Déploiement

### Frontend (Vercel)

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer

### Backend (Supabase)

Déjà hébergé sur Supabase Cloud. Les migrations sont appliquées automatiquement.

## 📝 Notes de Développement

- Le projet utilise React 19 avec Vite
- TailwindCSS pour le styling
- Supabase pour le backend (PostgreSQL + Auth + Storage)
- React Router pour la navigation
- react-i18next pour l'internationalisation

## 🐛 Problèmes Connus

- Les buckets Storage doivent être créés manuellement dans Supabase
- L'authentification utilise Supabase Auth mais synchronise avec des tables custom
- Les politiques RLS utilisent `auth.uid()` qui nécessite Supabase Auth

## 📞 Support

Pour toute question ou problème, consultez la documentation dans les fichiers ou contactez l'équipe de développement.
