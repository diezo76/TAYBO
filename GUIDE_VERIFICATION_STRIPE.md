# Guide de Vérification de la Configuration Stripe

**Date** : Aujourd'hui  
**Objectif** : Vérifier que la configuration Stripe est correctement configurée pour le système de paiement des commandes

---

## ✅ Actions Effectuées

1. ✅ Migration `027_add_stripe_fields_to_orders.sql` appliquée
2. ✅ Edge Function `create-order-checkout` déployée avec succès

---

## 🔍 Vérifications à Effectuer

### 1. Vérifier la Migration dans Supabase

La migration `027_add_stripe_fields_to_orders.sql` doit avoir ajouté les colonnes suivantes à la table `orders` :

- `stripe_checkout_session_id` (TEXT)
- `stripe_payment_intent_id` (TEXT)

**Comment vérifier** :
1. Allez dans **Supabase Dashboard** > **Table Editor**
2. Sélectionnez la table `orders`
3. Vérifiez que les colonnes `stripe_checkout_session_id` et `stripe_payment_intent_id` existent

**Ou via SQL** :
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('stripe_checkout_session_id', 'stripe_payment_intent_id');
```

---

### 2. Vérifier l'Edge Function `create-order-checkout`

**Comment vérifier** :
1. Allez dans **Supabase Dashboard** > **Edge Functions**
2. Vérifiez que la fonction `create-order-checkout` est listée et déployée
3. L'URL de la fonction devrait être : `https://ocxesczzlzopbcobppok.supabase.co/functions/v1/create-order-checkout`

**Test rapide** :
```bash
curl -X POST https://ocxesczzlzopbcobppok.supabase.co/functions/v1/create-order-checkout \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "test"}'
```

---

### 3. Vérifier les Secrets Stripe dans Supabase

Les Edge Functions nécessitent deux secrets configurés dans Supabase :

1. **`STRIPE_SECRET_KEY`** : Clé secrète Stripe (commence par `sk_test_...` ou `sk_live_...`)
2. **`STRIPE_WEBHOOK_SECRET`** : Secret du webhook Stripe (commence par `whsec_...`)

**Comment vérifier** :
1. Allez dans **Supabase Dashboard** > **Settings** > **Edge Functions** > **Secrets**
2. Vérifiez que les secrets suivants existent avec ces noms EXACTS :
   - ✅ `STRIPE_SECRET_KEY` (pas `SUPABASE_STRIPE_SECRET_KEY`)
   - ✅ `STRIPE_WEBHOOK_SECRET` (pas `SUPABASE_STRIPE_WEBHOOK_SECRET`)

**⚠️ IMPORTANT** :
- Les noms doivent être **exactement** `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` (sans préfixe `SUPABASE_`)
- Si les secrets n'existent pas ou ont des noms incorrects, ajoutez-les ou modifiez-les

**Comment ajouter/modifier les secrets** :
1. Dans **Supabase Dashboard** > **Settings** > **Edge Functions** > **Secrets**
2. Cliquez sur **Add new secret** ou modifiez un secret existant
3. Pour `STRIPE_SECRET_KEY` :
   - **Nom** : `STRIPE_SECRET_KEY`
   - **Valeur** : Votre clé secrète Stripe (obtenue depuis https://dashboard.stripe.com/test/apikeys)
4. Pour `STRIPE_WEBHOOK_SECRET` :
   - **Nom** : `STRIPE_WEBHOOK_SECRET`
   - **Valeur** : Votre secret de webhook Stripe (obtenu depuis Stripe Dashboard > Webhooks)

---

### 4. Vérifier le Webhook dans Stripe Dashboard

Le webhook `handle-commission-webhook` doit être configuré dans Stripe pour gérer les événements de paiement.

**Comment vérifier** :
1. Allez dans **Stripe Dashboard** > **Developers** > **Webhooks**
2. Vérifiez qu'un endpoint existe avec l'URL suivante :
   ```
   https://ocxesczzlzopbcobppok.supabase.co/functions/v1/handle-commission-webhook
   ```
3. Vérifiez que les événements suivants sont sélectionnés :
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired`
   - ✅ `payment_intent.succeeded` (optionnel, pour backup)

**Comment créer/modifier le webhook** :
1. Dans **Stripe Dashboard** > **Developers** > **Webhooks**
2. Cliquez sur **Add endpoint** ou modifiez l'endpoint existant
3. **Endpoint URL** : `https://ocxesczzlzopbcobppok.supabase.co/functions/v1/handle-commission-webhook`
4. **Events to send** : Sélectionnez :
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded` (recommandé)
5. Cliquez sur **Add endpoint**
6. **Copiez le Signing secret** (commence par `whsec_...`) et ajoutez-le comme secret `STRIPE_WEBHOOK_SECRET` dans Supabase

---

## 📋 Checklist Complète

### Migration
- [ ] Migration `027_add_stripe_fields_to_orders.sql` appliquée
- [ ] Colonnes `stripe_checkout_session_id` et `stripe_payment_intent_id` existent dans la table `orders`

### Edge Functions
- [ ] Edge Function `create-order-checkout` déployée
- [ ] Edge Function accessible via l'URL : `https://ocxesczzlzopbcobppok.supabase.co/functions/v1/create-order-checkout`

### Secrets Supabase
- [ ] Secret `STRIPE_SECRET_KEY` configuré dans Supabase Dashboard
- [ ] Secret `STRIPE_WEBHOOK_SECRET` configuré dans Supabase Dashboard
- [ ] Les noms des secrets sont exactement `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` (sans préfixe)

### Webhook Stripe
- [ ] Webhook configuré dans Stripe Dashboard avec l'URL : `https://ocxesczzlzopbcobppok.supabase.co/functions/v1/handle-commission-webhook`
- [ ] Événements `checkout.session.completed` et `checkout.session.expired` sélectionnés
- [ ] Signing secret du webhook copié et ajouté comme `STRIPE_WEBHOOK_SECRET` dans Supabase

---

## 🐛 Dépannage

### Erreur "Configuration Stripe manquante"

**Cause** : Le secret `STRIPE_SECRET_KEY` n'est pas configuré dans Supabase.

**Solution** :
1. Vérifiez que le secret existe dans **Supabase Dashboard** > **Settings** > **Edge Functions** > **Secrets**
2. Vérifiez que le nom est exactement `STRIPE_SECRET_KEY` (pas `SUPABASE_STRIPE_SECRET_KEY`)
3. Redéployez l'Edge Function après avoir ajouté/modifié le secret

### Erreur "Signature Stripe manquante"

**Cause** : Le secret `STRIPE_WEBHOOK_SECRET` n'est pas configuré dans Supabase.

**Solution** :
1. Vérifiez que le secret existe dans **Supabase Dashboard** > **Settings** > **Edge Functions** > **Secrets**
2. Vérifiez que le nom est exactement `STRIPE_WEBHOOK_SECRET` (pas `SUPABASE_STRIPE_WEBHOOK_SECRET`)
3. Vérifiez que la valeur correspond au Signing secret du webhook dans Stripe Dashboard

### Le webhook ne reçoit pas les événements

**Cause** : Le webhook n'est pas correctement configuré dans Stripe Dashboard.

**Solution** :
1. Vérifiez que l'URL du webhook est correcte : `https://ocxesczzlzopbcobppok.supabase.co/functions/v1/handle-commission-webhook`
2. Vérifiez que les événements `checkout.session.completed` et `checkout.session.expired` sont sélectionnés
3. Testez le webhook en envoyant un événement de test depuis Stripe Dashboard

---

## 📚 Ressources

- [Guide de Configuration Stripe](./GUIDE_CONFIGURATION_STRIPE.md)
- [Documentation Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Date de création** : Aujourd'hui  
**Dernière mise à jour** : Aujourd'hui

