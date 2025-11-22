# Guide de Configuration Stripe

**Date** : Aujourd'hui  
**Objectif** : Configurer les variables d'environnement Stripe pour le système de paiement des commissions.

---

## 📋 Vue d'ensemble

Ce guide explique comment configurer les variables d'environnement Stripe nécessaires pour le système de paiement des commissions hebdomadaires.

---

## 🔑 Variables d'Environnement Requises

Trois variables d'environnement Stripe sont nécessaires :

1. **VITE_STRIPE_PUBLIC_KEY** : Clé publique Stripe (utilisée côté client)
2. **SUPABASE_STRIPE_SECRET_KEY** : Clé secrète Stripe (utilisée côté serveur dans les Edge Functions)
3. **SUPABASE_STRIPE_WEBHOOK_SECRET** : Secret du webhook Stripe (pour valider les événements webhook)

---

## 📝 Configuration pour le Développement Local

### Étape 1 : Créer un compte Stripe (si vous n'en avez pas)

1. Allez sur : https://dashboard.stripe.com/register
2. Créez un compte (gratuit pour les tests)
3. Activez le mode test (par défaut)

### Étape 2 : Obtenir les clés API de test

1. **Connectez-vous** à votre dashboard Stripe : https://dashboard.stripe.com/test/dashboard
2. Allez dans **Developers** > **API keys**
3. Vous verrez deux clés :
   - **Publishable key** (commence par `pk_test_...`) → C'est votre `VITE_STRIPE_PUBLIC_KEY`
   - **Secret key** (commence par `sk_test_...`) → C'est votre `SUPABASE_STRIPE_SECRET_KEY`

### Étape 3 : Configurer le Webhook

1. Dans Stripe Dashboard, allez dans **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint**
3. **Endpoint URL** : `https://VOTRE-PROJET.supabase.co/functions/v1/handle-commission-webhook`
   - Remplacez `VOTRE-PROJET` par l'identifiant de votre projet Supabase
4. **Events to send** : Sélectionnez :
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Cliquez sur **Add endpoint**
6. **Copiez le Signing secret** (commence par `whsec_...`) → C'est votre `SUPABASE_STRIPE_WEBHOOK_SECRET`

### Étape 4 : Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# Configuration Supabase (Développement Local)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Configuration Stripe (Développement Local - Mode Test)
# Obtenez ces clés depuis : https://dashboard.stripe.com/test/apikeys
VITE_STRIPE_PUBLIC_KEY=pk_test_...
SUPABASE_STRIPE_SECRET_KEY=sk_test_...
SUPABASE_STRIPE_WEBHOOK_SECRET=whsec_...
```

**Remplacez** :
- `votre-projet` par l'identifiant de votre projet Supabase
- `votre_cle_anon_supabase` par votre clé anon Supabase
- `pk_test_...` par votre clé publique Stripe de test
- `sk_test_...` par votre clé secrète Stripe de test
- `whsec_...` par votre secret de webhook Stripe

**Exemple complet** :
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_STRIPE_PUBLIC_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
SUPABASE_STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
SUPABASE_STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

### Étape 5 : Configurer les secrets dans Supabase (pour les Edge Functions)

⚠️ **IMPORTANT** : Les Edge Functions utilisent des noms de secrets différents de ceux dans `.env.local`.

Les Edge Functions accèdent aux secrets Stripe via `Deno.env.get()`. Les noms doivent être **exactement** :
- `STRIPE_SECRET_KEY` (sans le préfixe `SUPABASE_`)
- `STRIPE_WEBHOOK_SECRET` (sans le préfixe `SUPABASE_`)

1. **Dans Supabase Dashboard**, allez dans **Settings** > **Edge Functions** > **Secrets**
2. Ajoutez les secrets suivants avec ces noms EXACTS :
   - **Nom** : `STRIPE_SECRET_KEY` → **Valeur** : `sk_test_...` (votre clé secrète Stripe de test)
   - **Nom** : `STRIPE_WEBHOOK_SECRET` → **Valeur** : `whsec_...` (votre secret de webhook de test)

**Note** : 
- Les noms des secrets dans Supabase doivent être **exactement** `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` (sans préfixe)
- Ces secrets sont différents des variables d'environnement dans `.env.local` qui utilisent `SUPABASE_STRIPE_SECRET_KEY`
- Les Edge Functions lisent ces secrets via `Deno.env.get('STRIPE_SECRET_KEY')` et `Deno.env.get('STRIPE_WEBHOOK_SECRET')`

---

## 🚀 Configuration pour la Production

### Étape 1 : Passer en mode Live dans Stripe

1. Dans Stripe Dashboard, basculez vers le mode **Live** (en haut à droite)
2. Acceptez les conditions si nécessaire

### Étape 2 : Obtenir les clés API Live

1. Allez dans **Developers** > **API keys**
2. Vous verrez maintenant les clés Live :
   - **Publishable key** (commence par `pk_live_...`) → C'est votre `VITE_STRIPE_PUBLIC_KEY`
   - **Secret key** (commence par `sk_live_...`) → C'est votre `SUPABASE_STRIPE_SECRET_KEY`

### Étape 3 : Configurer le Webhook Live

1. Allez dans **Developers** > **Webhooks**
2. Créez un nouveau endpoint avec l'URL de production :
   - `https://VOTRE-PROJET.supabase.co/functions/v1/handle-commission-webhook`
3. Sélectionnez les mêmes événements (`checkout.session.completed`, `checkout.session.expired`)
4. **Copiez le Signing secret** Live (commence par `whsec_...`)

### Étape 4 : Créer le fichier `.env` pour production

Créez un fichier `.env` à la racine du projet avec le contenu suivant :

```env
# Configuration Supabase (Production)
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Configuration Stripe (Production - Mode Live)
# Obtenez ces clés depuis : https://dashboard.stripe.com/apikeys
VITE_STRIPE_PUBLIC_KEY=pk_live_...
SUPABASE_STRIPE_SECRET_KEY=sk_live_...
SUPABASE_STRIPE_WEBHOOK_SECRET=whsec_...
```

### Étape 5 : Configurer les variables dans votre plateforme de déploiement

Si vous déployez sur **Vercel** ou une autre plateforme :

1. Allez dans les **Settings** de votre projet
2. Allez dans **Environment Variables**
3. Ajoutez toutes les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLIC_KEY`
   - `SUPABASE_STRIPE_SECRET_KEY` (pour les Edge Functions)
   - `SUPABASE_STRIPE_WEBHOOK_SECRET` (pour les Edge Functions)

### Étape 6 : Mettre à jour les secrets Supabase

Mettez à jour les secrets dans Supabase Dashboard avec les valeurs Live :
1. Allez dans **Settings** > **Edge Functions** > **Secrets**
2. Modifiez les secrets existants :
   - **`STRIPE_SECRET_KEY`** → Remplacez par `sk_live_...` (votre clé secrète Live)
   - **`STRIPE_WEBHOOK_SECRET`** → Remplacez par `whsec_...` (votre secret de webhook Live)

**⚠️ IMPORTANT** : Les noms des secrets doivent rester `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` (sans préfixe `SUPABASE_`)

---

## 🔍 Vérification de la Configuration

### Vérifier côté client (Frontend)

Les variables `VITE_*` sont accessibles dans le code React via `import.meta.env` :

```javascript
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
console.log('Stripe Public Key:', stripePublicKey);
```

### Vérifier côté serveur (Edge Functions)

Les Edge Functions accèdent aux secrets via `Deno.env.get()` :

```typescript
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
```

**⚠️ IMPORTANT** : 
- Les noms des secrets dans Supabase Dashboard doivent être **exactement** `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`
- Ne pas utiliser `SUPABASE_STRIPE_SECRET_KEY` dans les secrets Supabase (c'est seulement pour `.env.local`)
- Les Edge Functions utilisent ces noms exacts : `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET`

### ⚠️ Problème Courant : Les Secrets ne sont pas Accessibles

Si vous obtenez l'erreur "Configuration Stripe manquante" ou "Signature Stripe manquante", cela signifie que les secrets ne sont pas correctement configurés.

**Solution rapide** :
1. Allez dans **Supabase Dashboard** > **Settings** > **Edge Functions** > **Secrets**
2. Vérifiez que les secrets s'appellent EXACTEMENT :
   - `STRIPE_SECRET_KEY` (pas `SUPABASE_STRIPE_SECRET_KEY`)
   - `STRIPE_WEBHOOK_SECRET` (pas `SUPABASE_STRIPE_WEBHOOK_SECRET`)
3. Si les noms sont incorrects, supprimez les anciens et créez de nouveaux secrets avec les bons noms
4. Redéployez les Edge Functions après avoir ajouté/modifié les secrets

**Consultez** `GUIDE_DEPANNAGE_SECRETS_STRIPE.md` pour plus de détails sur le dépannage.

---

## ⚠️ Sécurité

### ⚠️ IMPORTANT : Ne jamais exposer les clés secrètes

1. **Ne commitez JAMAIS** les fichiers `.env` ou `.env.local` dans Git
2. **Ne partagez JAMAIS** les clés secrètes (`sk_test_...`, `sk_live_...`, `whsec_...`) publiquement
3. **Utilisez** `.gitignore` pour exclure les fichiers `.env*` :
   ```
   .env
   .env.local
   .env.*.local
   ```

### Bonnes pratiques

1. **Mode Test** : Utilisez toujours les clés de test (`pk_test_...`, `sk_test_...`) en développement local
2. **Mode Live** : Utilisez les clés Live (`pk_live_...`, `sk_live_...`) uniquement en production
3. **Secrets Supabase** : Stockez les clés secrètes uniquement dans les secrets Supabase, jamais dans le code
4. **Rotation** : Changez régulièrement vos clés secrètes, surtout si elles ont été exposées

---

## 🐛 Dépannage

### Les paiements ne fonctionnent pas

1. **Vérifiez les clés** : Assurez-vous que vous utilisez les bonnes clés (test vs live)
2. **Vérifiez les secrets Supabase** : Les Edge Functions doivent avoir accès aux secrets
3. **Vérifiez les logs** : Consultez les logs des Edge Functions dans Supabase Dashboard

### Erreur "Invalid API Key"

1. **Vérifiez le format** : Les clés doivent commencer par `pk_test_...` ou `pk_live_...`
2. **Vérifiez l'environnement** : Assurez-vous d'utiliser les clés de test en développement
3. **Vérifiez les espaces** : Assurez-vous qu'il n'y a pas d'espaces avant/après les clés dans `.env`

### Le webhook ne fonctionne pas

1. **Vérifiez l'URL** : L'URL du webhook doit correspondre exactement à votre Edge Function
2. **Vérifiez le secret** : Le secret du webhook doit correspondre à celui configuré dans Stripe
3. **Vérifiez les événements** : Les événements sélectionnés doivent correspondre à ceux gérés par l'Edge Function

---

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Guide des clés API Stripe](https://stripe.com/docs/keys)
- [Guide des webhooks Stripe](https://stripe.com/docs/webhooks)

---

## ✅ Checklist de Configuration

### Développement Local
- [ ] Compte Stripe créé
- [ ] Clés API de test obtenues
- [ ] Webhook de test configuré
- [ ] Fichier `.env.local` créé avec toutes les variables
- [ ] Secrets configurés dans Supabase Dashboard
- [ ] Test de paiement effectué

### Production
- [ ] Compte Stripe vérifié (mode Live)
- [ ] Clés API Live obtenues
- [ ] Webhook Live configuré
- [ ] Fichier `.env` créé avec les variables Live
- [ ] Variables d'environnement configurées sur la plateforme de déploiement
- [ ] Secrets Supabase mis à jour avec les valeurs Live
- [ ] Test de paiement Live effectué

---

**Date de création** : Aujourd'hui  
**Dernière mise à jour** : Aujourd'hui

