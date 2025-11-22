# Guide de Test : Inscription Restaurant

## 🎯 Objectif
Tester l'inscription d'un restaurant avec les identifiants suivants :
- **Email** : diezoweez@gmail.com
- **Mot de passe** : Siinadiiezo

---

## 🚀 Méthode 1 : Via l'Interface Web (RECOMMANDÉ)

### Étape 1 : Démarrer l'application
```bash
cd /Users/diezowee/Taybo
npm run dev
```

### Étape 2 : Accéder à la page d'inscription restaurant
Ouvrez votre navigateur et allez sur :
```
http://localhost:5173/restaurant/signup
```

### Étape 3 : Remplir le formulaire avec ces informations

**Informations de connexion :**
- Email : `diezoweez@gmail.com`
- Mot de passe : `Siinadiiezo`
- Confirmer mot de passe : `Siinadiiezo`

**Informations du restaurant :**
- Nom du restaurant : `Restaurant Test Taybo`
- Type de cuisine : `Française` (ou au choix)
- Adresse : `123 Rue de Test, 75001 Paris, France`
- Téléphone : `+33612345678`
- Description : `Restaurant de test pour vérifier l'inscription`
- Frais de livraison : `2.50` €

**Document d'identité :**
- Uploadez un fichier PDF ou une image (optionnel pour le test)
- Si vous n'avez pas de fichier, vous pouvez utiliser n'importe quelle image ou PDF

**Horaires d'ouverture :**
- Configurez les horaires selon vos préférences ou laissez par défaut

### Étape 4 : Soumettre le formulaire
Cliquez sur le bouton "S'inscrire" ou "Créer mon compte"

### Étape 5 : Vérifier le résultat
- ✅ **Si succès** : Vous serez redirigé vers le tableau de bord restaurant
- ❌ **Si erreur** : Vérifiez les messages d'erreur affichés

---

## 🖥️ Méthode 2 : Via le Script de Test

### Étape 1 : Exécuter le script
```bash
cd /Users/diezowee/Taybo
node test-inscription-restaurant.js
```

### Étape 2 : Observer les résultats
Le script affichera :
- ✅ Les détails du compte créé si succès
- ❌ Les erreurs détaillées si échec

---

## 🔍 Méthode 3 : Via la Console Développeur du Navigateur

### Étape 1 : Ouvrir la console
1. Allez sur votre application web (http://localhost:5173)
2. Ouvrez les outils de développement (F12)
3. Allez dans l'onglet "Console"

### Étape 2 : Copier-coller ce code
```javascript
// Importer le service d'authentification restaurant
const { signUpRestaurant } = await import('./src/services/restaurantAuthService.js');

// Créer le compte
const result = await signUpRestaurant({
  email: 'diezoweez@gmail.com',
  password: 'Siinadiiezo',
  name: 'Restaurant Test Taybo',
  description: 'Restaurant de test',
  cuisineType: 'Française',
  address: '123 Rue de Test, 75001 Paris',
  phone: '+33612345678',
  deliveryFee: 2.50
});

// Afficher le résultat
console.log('Résultat:', result);
```

---

## 🧪 Après l'Inscription

### Vérifier dans Supabase Dashboard

1. **Vérifier l'authentification** :
   - Allez dans **Authentication** → **Users**
   - Cherchez l'email `diezoweez@gmail.com`
   - Vérifiez que l'utilisateur est créé

2. **Vérifier la table restaurants** :
   - Allez dans **Table Editor** → **restaurants**
   - Cherchez le restaurant avec l'email `diezoweez@gmail.com`
   - Vérifiez les champs :
     - `id` : UUID généré
     - `email` : diezoweez@gmail.com
     - `name` : Restaurant Test Taybo
     - `is_verified` : false (normal pour un nouveau restaurant)
     - `is_active` : false (normal jusqu'à vérification)
     - `passport_document_url` : URL du document si uploadé

3. **Vérifier le Storage (si document uploadé)** :
   - Allez dans **Storage** → **passports**
   - Vérifiez que le fichier est présent
   - Format du nom : `{uuid}-{timestamp}.{ext}`

---

## 🔐 Test de Connexion

Une fois le compte créé, testez la connexion :

### Via l'Interface Web
1. Allez sur la page de connexion restaurant :
   ```
   http://localhost:5173/restaurant/login
   ```
2. Entrez les identifiants :
   - Email : `diezoweez@gmail.com`
   - Mot de passe : `Siinadiiezo`
3. Cliquez sur "Se connecter"

### Via la Console
```javascript
const { loginRestaurant } = await import('./src/services/restaurantAuthService.js');

const result = await loginRestaurant({
  email: 'diezoweez@gmail.com',
  password: 'Siinadiiezo'
});

console.log('Connexion:', result);
```

---

## ✅ Critères de Succès

L'inscription est réussie si :
- ✅ Aucune erreur 403 (RLS policy violation)
- ✅ Aucune erreur 406 (Not Acceptable)
- ✅ Le compte Auth est créé dans Supabase
- ✅ L'entrée est présente dans la table `restaurants`
- ✅ Le document d'identité est uploadé (si fourni)
- ✅ Vous pouvez vous connecter avec ces identifiants

---

## ❌ Dépannage

### Erreur : "User already registered"
**Solution** : L'email est déjà utilisé. Supprimez l'utilisateur existant dans Supabase :
```sql
-- Dans Supabase SQL Editor
DELETE FROM auth.users WHERE email = 'diezoweez@gmail.com';
DELETE FROM restaurants WHERE email = 'diezoweez@gmail.com';
```

### Erreur : "new row violates row-level security policy"
**Solution** : Les politiques RLS ne sont pas correctement configurées. Réexécutez :
```bash
# Les corrections ont déjà été appliquées, mais si nécessaire
scripts/CORRECTION_RLS_SEULEMENT.sql
```

### Erreur : "Error uploading passport"
**Solution** : Problème avec les politiques Storage. Vérifiez que les 5 politiques Storage existent.

### Erreur 406 après inscription
**Solution** : La politique SELECT pour voir son propre profil manque. Elle a été créée, vérifiez dans Supabase.

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans la console du navigateur (F12)
2. Vérifiez les logs Supabase dans le Dashboard
3. Consultez les fichiers :
   - `COMPTE_RENDU_CORRECTION_SUPABASE.md`
   - `COMPTE_RENDU_VERIFICATION_INSCRIPTIONS.md`

---

## 🎉 Résultat Attendu

```
✅ INSCRIPTION RÉUSSIE !
📋 Détails du compte créé:
  - ID: [UUID généré]
  - Email: diezoweez@gmail.com
  - Nom: Restaurant Test Taybo
  - Vérifié: Non (en attente de vérification)
  - Actif: Non (en attente d'activation)

🎉 Vous pouvez maintenant vous connecter avec:
  - Email: diezoweez@gmail.com
  - Mot de passe: Siinadiiezo
```

---

**Note** : Le restaurant ne sera pas visible sur la page d'accueil publique tant qu'il n'est pas vérifié et activé par un administrateur.

