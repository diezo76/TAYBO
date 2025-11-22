# Instructions de Configuration - Taybo MVP

## 🚀 Démarrage Rapide

### 1. Installation des Dépendances

```bash
npm install
```

### 2. Configuration des Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
VITE_SUPABASE_URL=https://ocxesczzlzopbcobppok.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

**Où trouver ces valeurs :**
1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet "Taybo"
3. Allez dans **Settings** > **API**
4. Copiez l'URL du projet et la clé `anon` `public`

### 3. Créer les Buckets Storage

Les buckets Storage doivent être créés manuellement dans Supabase :

1. Allez dans **Storage** dans le menu de gauche
2. Cliquez sur **New bucket** pour créer chaque bucket :

#### Bucket 1 : `restaurant-images` (Public)
- Nom : `restaurant-images`
- Public : ✅ Oui
- File size limit : 5 MB
- Allowed MIME types : `image/jpeg, image/png, image/webp`

#### Bucket 2 : `menu-images` (Public)
- Nom : `menu-images`
- Public : ✅ Oui
- File size limit : 5 MB
- Allowed MIME types : `image/jpeg, image/png, image/webp`

#### Bucket 3 : `passports` (Privé)
- Nom : `passports`
- Public : ❌ Non
- File size limit : 10 MB
- Allowed MIME types : `image/jpeg, image/png, application/pdf`

Voir `supabase/STORAGE_SETUP.md` pour plus de détails.

### 4. Lancer le Serveur de Développement

```bash
npm run dev
```

L'application sera accessible sur http://localhost:5173

## 📋 Checklist de Vérification

Avant de commencer à développer, vérifiez que :

- [ ] Les dépendances sont installées (`npm install`)
- [ ] Le fichier `.env` est créé avec les bonnes valeurs
- [ ] Les buckets Storage sont créés dans Supabase
- [ ] Le serveur de développement démarre sans erreur
- [ ] Vous pouvez accéder à l'application dans le navigateur
- [ ] Le sélecteur de langue fonctionne (FR/AR/EN)
- [ ] Vous pouvez créer un compte client

## 🔧 Structure du Projet

```
taybo/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── common/         # Button, LanguageSelector, etc.
│   │   ├── client/         # RestaurantCard, etc.
│   │   ├── restaurant/     # (à créer)
│   │   └── admin/          # (à créer)
│   ├── pages/              # Pages de l'application
│   │   ├── client/         # Home, Login, SignUp, RestaurantDetail
│   │   ├── restaurant/     # (à créer)
│   │   └── admin/          # (à créer)
│   ├── contexts/           # Contextes React
│   │   ├── AuthContext.jsx # Authentification
│   │   └── CartContext.jsx # Panier
│   ├── services/           # Services API
│   │   ├── supabase.js     # Client Supabase
│   │   ├── authService.js  # Authentification clients
│   │   ├── restaurantAuthService.js # Authentification restaurants
│   │   ├── restaurantService.js # Services restaurants
│   │   └── orderService.js # Services commandes
│   ├── i18n/               # Internationalisation
│   │   ├── config.js
│   │   └── locales/       # fr.json, ar.json, en.json
│   └── App.jsx             # Point d'entrée
├── supabase/
│   ├── migrations/         # Migrations SQL (déjà appliquées)
│   └── STORAGE_SETUP.md    # Instructions pour Storage
└── README.md               # Documentation principale
```

## 🎯 Fonctionnalités Disponibles

### ✅ Déjà Implémenté

1. **Authentification Clients**
   - Inscription avec email/mot de passe
   - Connexion
   - Gestion de session

2. **Interface Client (Base)**
   - Page d'accueil avec liste des restaurants
   - Recherche de restaurants
   - Page détail restaurant avec menu
   - Ajout au panier

3. **Panier**
   - Ajout/suppression d'articles
   - Calcul automatique des totaux
   - Persistance dans localStorage

4. **Internationalisation**
   - Support FR/AR/EN
   - RTL pour l'arabe
   - Sélecteur de langue

### ⏳ À Implémenter

- Authentification restaurants et admin
- Dashboard restaurant
- Page Checkout avec paiement
- Historique des commandes
- Interface admin
- Notifications push
- Et plus...

## 🐛 Résolution de Problèmes

### L'application ne démarre pas

1. Vérifiez que Node.js 18+ est installé : `node --version`
2. Supprimez `node_modules` et réinstallez : `rm -rf node_modules && npm install`
3. Vérifiez les variables d'environnement dans `.env`

### Erreur de connexion à Supabase

1. Vérifiez que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont corrects
2. Vérifiez que votre projet Supabase est actif
3. Vérifiez votre connexion internet

### Les images ne s'affichent pas

1. Vérifiez que les buckets Storage sont créés
2. Vérifiez que les buckets sont publics (pour restaurant-images et menu-images)
3. Vérifiez les permissions dans Supabase Storage

### Erreur "Cannot read property 'map' of undefined"

Cela signifie qu'une variable est `undefined` au lieu d'être un tableau vide. Vérifiez que les états sont initialisés avec `[]` :

```javascript
const [items, setItems] = useState([]); // ✅ Bon
const [items, setItems] = useState(); // ❌ Mauvais
```

## 📚 Ressources

- Documentation React : https://react.dev
- Documentation Supabase : https://supabase.com/docs
- Documentation TailwindCSS : https://tailwindcss.com/docs
- Documentation React Router : https://reactrouter.com

## 🆘 Support

Pour toute question ou problème :
1. Consultez `README.md` pour la documentation générale
2. Consultez `PROGRESS.md` pour l'état d'avancement
3. Vérifiez les fichiers de code pour les commentaires explicatifs


