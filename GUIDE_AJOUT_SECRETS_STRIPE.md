# Guide d'Ajout des Secrets Stripe dans Supabase

**Date** : Aujourd'hui  
**Objectif** : Ajouter les secrets Stripe nécessaires pour les Edge Functions

---

## ✅ État Actuel

### Secrets Supabase Existants
Tous les secrets Supabase sont déjà configurés :
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_DB_URL`

### Secrets Stripe Manquants
Les secrets Stripe suivants doivent être ajoutés :
- ❌ `STRIPE_SECRET_KEY`
- ❌ `STRIPE_WEBHOOK_SECRET`

---

## 🔧 Comment Ajouter les Secrets Stripe

### Méthode 1 : Via Supabase CLI (Recommandé)

#### Étape 1 : Obtenir vos clés Stripe

1. **Clé secrète Stripe** :
   - Allez sur : https://dashboard.stripe.com/test/apikeys
   - Copiez la **Secret key** (commence par `sk_test_...` pour le mode test)

2. **Secret de webhook Stripe** :
   - Allez sur : https://dashboard.stripe.com/test/webhooks
   - Si le webhook n'existe pas encore, créez-le :
     - **Endpoint URL** : `https://ocxesczzlzopbcobppok.supabase.co/functions/v1/handle-commission-webhook`
     - **Events to send** : `checkout.session.completed`, `checkout.session.expired`, `payment_intent.succeeded`
   - Copiez le **Signing secret** (commence par `whsec_...`)

#### Étape 2 : Ajouter les secrets via CLI

```bash
# Ajouter la clé secrète Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE

# Ajouter le secret de webhook Stripe
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_WEBHOOK
```

**Remplacez** :
- `sk_test_VOTRE_CLE_SECRETE` par votre vraie clé secrète Stripe
- `whsec_VOTRE_SECRET_WEBHOOK` par votre vrai secret de webhook

**Exemple** :
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```

---

### Méthode 2 : Via Supabase Dashboard

#### Étape 1 : Obtenir vos clés Stripe

Même procédure que la Méthode 1, Étape 1.

#### Étape 2 : Ajouter les secrets dans Supabase Dashboard

1. Allez dans **Supabase Dashboard** : https://supabase.com/dashboard/project/ocxesczzlzopbcobppok
2. Allez dans **Settings** > **Edge Functions** > **Secrets**
3. Cliquez sur **Add new secret**
4. Pour chaque secret :
   - **Nom** : `STRIPE_SECRET_KEY` (ou `STRIPE_WEBHOOK_SECRET`)
   - **Valeur** : Votre clé secrète ou secret de webhook
   - Cliquez sur **Save**

**⚠️ IMPORTANT** : Les noms doivent être **exactement** :
- `STRIPE_SECRET_KEY` (pas `SUPABASE_STRIPE_SECRET_KEY`)
- `STRIPE_WEBHOOK_SECRET` (pas `SUPABASE_STRIPE_WEBHOOK_SECRET`)

---

## ✅ Vérification

Après avoir ajouté les secrets, vérifiez qu'ils existent :

```bash
supabase secrets list
```

Vous devriez voir :
```
NAME                      | DIGEST
--------------------------|------------------------------------------------------------------
SUPABASE_ANON_KEY         | ...
SUPABASE_DB_URL           | ...
SUPABASE_SERVICE_ROLE_KEY | ...
SUPABASE_URL              | ...
STRIPE_SECRET_KEY         | ...  ← Nouveau
STRIPE_WEBHOOK_SECRET     | ...  ← Nouveau
```

---

## 🔄 Redéploiement des Edge Functions

Après avoir ajouté les secrets, il est recommandé de redéployer les Edge Functions pour s'assurer qu'elles ont accès aux nouveaux secrets :

```bash
# Redéployer create-order-checkout
supabase functions deploy create-order-checkout

# Redéployer handle-commission-webhook
supabase functions deploy handle-commission-webhook
```

---

## 🐛 Dépannage

### Erreur "Configuration Stripe manquante"

**Cause** : Le secret `STRIPE_SECRET_KEY` n'est pas configuré ou a un mauvais nom.

**Solution** :
1. Vérifiez que le secret existe : `supabase secrets list`
2. Vérifiez que le nom est exactement `STRIPE_SECRET_KEY` (sans préfixe)
3. Redéployez l'Edge Function après avoir ajouté le secret

### Erreur "Signature Stripe manquante"

**Cause** : Le secret `STRIPE_WEBHOOK_SECRET` n'est pas configuré ou a un mauvais nom.

**Solution** :
1. Vérifiez que le secret existe : `supabase secrets list`
2. Vérifiez que le nom est exactement `STRIPE_WEBHOOK_SECRET` (sans préfixe)
3. Vérifiez que la valeur correspond au Signing secret du webhook dans Stripe Dashboard
4. Redéployez l'Edge Function après avoir ajouté le secret

---

## 📚 Ressources

- **Guide de Configuration Stripe** : `GUIDE_CONFIGURATION_STRIPE.md`
- **Guide de Vérification Stripe** : `GUIDE_VERIFICATION_STRIPE.md`
- **Stripe Dashboard (Test)** : https://dashboard.stripe.com/test/dashboard
- **Stripe API Keys** : https://dashboard.stripe.com/test/apikeys
- **Stripe Webhooks** : https://dashboard.stripe.com/test/webhooks

---

**Date de création** : Aujourd'hui  
**Dernière mise à jour** : Aujourd'hui

