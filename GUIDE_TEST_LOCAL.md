# Guide de Test Local - Taybo MVP

**Date** : Aujourd'hui

## 🎯 Objectif

Ce guide vous explique comment tester l'application Taybo en local sur votre machine, car il n'y a pas encore de déploiement en production.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **Node.js 18+** installé sur votre machine
   - Vérifiez avec : `node --version`
   - Téléchargez depuis : https://nodejs.org/

2. **Un compte Supabase** avec un projet créé
   - Créez un compte sur : https://supabase.com
   - Créez un nouveau projet "Taybo"

3. **npm** (généralement installé avec Node.js)
   - Vérifiez avec : `npm --version`

## 🚀 Étapes pour Tester l'Application

### Étape 1 : Installer les Dépendances

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
npm install
```

Cela installera toutes les dépendances nécessaires (React, Vite, Supabase, etc.).

### Étape 2 : Configurer les Variables d'Environnement

1. **Créez un fichier `.env.local`** à la racine du projet (à côté de `package.json`)

2. **Ajoutez les variables suivantes** :

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Configuration Stripe (pour le système de paiement des commissions)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
SUPABASE_STRIPE_SECRET_KEY=sk_test_...
SUPABASE_STRIPE_WEBHOOK_SECRET=whsec_...
```

3. **Où trouver ces valeurs** :

   **Pour Supabase** :
   - Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
   - Allez dans **Settings** > **API**
   - Copiez :
     - **Project URL** → `VITE_SUPABASE_URL`
     - **Project API keys** > **anon public** → `VITE_SUPABASE_ANON_KEY`

   **Pour Stripe** :
   - Consultez le guide complet : `GUIDE_CONFIGURATION_STRIPE.md`
   - Ou allez sur : https://dashboard.stripe.com/test/apikeys
   - Copiez :
     - **Publishable key** → `VITE_STRIPE_PUBLIC_KEY`
     - **Secret key** → `SUPABASE_STRIPE_SECRET_KEY`
   - Pour le webhook secret, créez un webhook dans Stripe Dashboard et copiez le secret

**Exemple** :
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
SUPABASE_STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
SUPABASE_STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

**Note** : Pour une configuration complète de Stripe, consultez le fichier `GUIDE_CONFIGURATION_STRIPE.md`.

### Étape 3 : Appliquer les Migrations SQL

1. **Dans Supabase Dashboard**, allez dans **SQL Editor**
2. **Ouvrez chaque fichier de migration** dans l'ordre :
   - `supabase/migrations/001_create_users_table.sql`
   - `supabase/migrations/002_create_restaurants_table.sql`
   - `supabase/migrations/003_create_menu_items_table.sql`
   - `supabase/migrations/004_create_orders_table.sql`
   - `supabase/migrations/005_create_reviews_table.sql`
   - `supabase/migrations/006_create_promotions_table.sql`
   - `supabase/migrations/007_create_commission_payments_table.sql`
   - `supabase/migrations/008_create_support_tickets_table.sql`
   - `supabase/migrations/009_create_ticket_messages_table.sql`
   - `supabase/migrations/010_create_favorites_table.sql`
   - `supabase/migrations/011_enable_rls.sql`
   - `supabase/migrations/012_update_restaurant_ratings_trigger.sql`

3. **Exécutez chaque migration** en cliquant sur "Run"

**Liste complète des migrations** :
   - `001_create_users_table.sql`
   - `002_create_restaurants_table.sql`
   - `003_create_menu_items_table.sql`
   - `004_create_orders_table.sql`
   - `005_create_reviews_table.sql`
   - `006_create_promotions_table.sql`
   - `007_create_commission_payments_table.sql`
   - `008_create_support_tickets_table.sql`
   - `009_create_ticket_messages_table.sql`
   - `010_create_favorites_table.sql`
   - `011_enable_rls.sql`
   - `012_update_restaurant_ratings_trigger.sql`
   - `013_add_restaurant_image_url.sql`
   - `014_add_user_image_url.sql`
   - `015_fix_rls_policies.sql`
   - `016_setup_storage_policies.sql` ⚠️ **NOUVEAU - IMPORTANT !**

**OU** utilisez Supabase CLI si vous l'avez installé :
```bash
supabase db push
```

**⚠️ IMPORTANT** : La migration `016_setup_storage_policies.sql` est **ESSENTIELLE** pour que les images fonctionnent. Sans elle, les images ne se chargeront pas (erreur 403).

### Étape 4 : Créer les Buckets Storage

Les buckets Storage doivent être créés manuellement dans Supabase :

1. **Dans Supabase Dashboard**, allez dans **Storage**
2. **Cliquez sur "New bucket"** et créez les 3 buckets suivants :

#### Bucket 1 : `restaurant-images` (Public)
- Nom : `restaurant-images`
- Public : ✅ **Oui** (coché)
- File size limit : 5 MB
- Allowed MIME types : `image/jpeg, image/png, image/webp`

#### Bucket 2 : `menu-images` (Public)
- Nom : `menu-images`
- Public : ✅ **Oui** (coché)
- File size limit : 5 MB
- Allowed MIME types : `image/jpeg, image/png, image/webp`

#### Bucket 3 : `passports` (Privé)
- Nom : `passports`
- Public : ❌ **Non** (non coché)
- File size limit : 10 MB
- Allowed MIME types : `image/jpeg, image/png, application/pdf`

Voir `supabase/STORAGE_SETUP.md` pour plus de détails.

### Étape 5 : Créer un Compte Admin (Optionnel)

Pour tester l'interface admin :

1. **Dans Supabase Dashboard**, allez dans **Authentication** > **Users**
2. **Créez un nouvel utilisateur** avec :
   - Email : `admin@taybo.com`
   - Mot de passe : (choisissez un mot de passe sécurisé)
3. **Notez l'UUID** de cet utilisateur
4. **Dans SQL Editor**, exécutez :
```sql
-- Remplacez 'UUID_DU_USER' par l'UUID réel
INSERT INTO users (id, email, first_name, last_name, role)
VALUES ('UUID_DU_USER', 'admin@taybo.com', 'Admin', 'Taybo', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

### Étape 6 : Lancer le Serveur de Développement

Dans le terminal, exécutez :

```bash
npm run dev
```

Vous devriez voir quelque chose comme :
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Étape 7 : Accéder à l'Application

Ouvrez votre navigateur et allez à :

**http://localhost:5173**

🎉 **L'application est maintenant accessible en local !**

## 🧪 Comment Tester les Fonctionnalités

### Test 1 : Créer un Compte Client

1. Allez sur http://localhost:5173
2. Cliquez sur "S'inscrire" ou allez sur `/client/signup`
3. Remplissez le formulaire :
   - Email
   - Mot de passe
   - Prénom
   - Nom
4. Cliquez sur "Créer un compte"
5. Vous devriez être redirigé vers la page d'accueil

### Test 2 : Créer un Compte Restaurant

1. Allez sur `/restaurant/signup`
2. Remplissez le formulaire complet :
   - Informations du restaurant
   - Upload d'un document passeport (PDF, PNG ou JPG)
3. Cliquez sur "S'inscrire"
4. Vous verrez un message indiquant que votre compte est en attente de validation

### Test 3 : Se Connecter en Admin

1. Allez sur `/admin/login`
2. Connectez-vous avec :
   - Email : `admin@taybo.com`
   - Mot de passe : (celui que vous avez créé)
3. Vous devriez accéder au dashboard admin

### Test 4 : Parcourir les Restaurants

1. Sur la page d'accueil (`/`), vous devriez voir la liste des restaurants
2. Cliquez sur un restaurant pour voir ses détails
3. Ajoutez des plats au panier

### Test 5 : Passer une Commande

1. Ajoutez des articles au panier
2. Cliquez sur l'icône panier dans le header
3. Vérifiez votre panier
4. Cliquez sur "Passer la commande"
5. Remplissez le formulaire de checkout :
   - Adresse de livraison
   - Sélectionnez "Paiement à la livraison"
6. Confirmez la commande

## 🔍 Vérification des Problèmes Courants

### Problème : "Cannot connect to Supabase"

**Solution** :
- Vérifiez que le fichier `.env` existe et contient les bonnes valeurs
- Vérifiez que les variables commencent par `VITE_`
- Redémarrez le serveur de développement (`Ctrl+C` puis `npm run dev`)

### Problème : "Table does not exist"

**Solution** :
- Vérifiez que toutes les migrations SQL ont été exécutées
- Vérifiez dans Supabase Dashboard > Table Editor que les tables existent

### Problème : "Storage bucket not found"

**Solution** :
- Vérifiez que les 3 buckets Storage ont été créés
- Vérifiez les noms exacts : `restaurant-images`, `menu-images`, `passports`

### Problème : "Cannot login as admin"

**Solution** :
- Vérifiez que vous avez créé un utilisateur avec l'email `admin@taybo.com`
- Vérifiez que vous avez inséré l'utilisateur dans la table `users` avec `role = 'admin'`

### Problème : Le serveur ne démarre pas

**Solution** :
- Vérifiez que Node.js 18+ est installé : `node --version`
- Supprimez `node_modules` et `package-lock.json`, puis réinstallez : `rm -rf node_modules package-lock.json && npm install`

## 📝 Checklist de Test Rapide

- [ ] Les dépendances sont installées (`npm install`)
- [ ] Le fichier `.env` est créé avec les bonnes valeurs
- [ ] Toutes les migrations SQL sont appliquées
- [ ] Les 3 buckets Storage sont créés
- [ ] Le serveur démarre sans erreur (`npm run dev`)
- [ ] L'application est accessible sur http://localhost:5173
- [ ] Je peux créer un compte client
- [ ] Je peux créer un compte restaurant
- [ ] Je peux me connecter en admin
- [ ] Je peux voir la liste des restaurants
- [ ] Je peux ajouter des articles au panier
- [ ] Je peux passer une commande

## 🎯 URLs Importantes

- **Page d'accueil** : http://localhost:5173/
- **Connexion client** : http://localhost:5173/client/login
- **Inscription client** : http://localhost:5173/client/signup
- **Connexion restaurant** : http://localhost:5173/restaurant/login
- **Inscription restaurant** : http://localhost:5173/restaurant/signup
- **Dashboard restaurant** : http://localhost:5173/restaurant/dashboard
- **Connexion admin** : http://localhost:5173/admin/login
- **Dashboard admin** : http://localhost:5173/admin/dashboard

## 📚 Documentation Complémentaire

- **Guide de test détaillé** : Voir `TESTING.md`
- **Instructions de setup** : Voir `SETUP_INSTRUCTIONS.md`
- **Configuration Storage** : Voir `supabase/STORAGE_SETUP.md`
- **Compte rendu du projet** : Voir `COMPTE_RENDU.md`
- **Ce qui reste à faire** : Voir `CE_QUI_RESTE_A_FAIRE.md`

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez la console du navigateur (F12) pour les erreurs
2. Vérifiez le terminal où tourne `npm run dev` pour les erreurs
3. Vérifiez les logs Supabase dans le Dashboard
4. Consultez la documentation dans les fichiers `.md` du projet

---

**Note** : L'application fonctionne uniquement en local pour le moment. Pour déployer en production, il faudra utiliser Vercel ou un autre service d'hébergement.

