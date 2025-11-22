# Script de Vérification des Secrets Stripe

Ce document explique comment vérifier que les secrets Stripe sont correctement configurés dans Supabase.

## Méthode 1 : Via Supabase Dashboard

1. **Connectez-vous** à Supabase Dashboard : https://supabase.com/dashboard
2. Sélectionnez votre projet **Taybo**
3. Allez dans **Settings** > **Edge Functions** > **Secrets**
4. Vérifiez que vous voyez :
   - `STRIPE_SECRET_KEY` (doit commencer par `sk_test_...` ou `sk_live_...`)
   - `STRIPE_WEBHOOK_SECRET` (doit commencer par `whsec_...`)

## Méthode 2 : Tester une Edge Function

### Test de l'Edge Function create-commission-checkout

1. Allez dans **Edge Functions** > **create-commission-checkout**
2. Cliquez sur **Invoke**
3. Utilisez ce body de test :
```json
{
  "paymentId": "test-payment-id"
}
```
4. Vérifiez les logs pour voir si l'erreur "Configuration Stripe manquante" apparaît

### Test de l'Edge Function handle-commission-webhook

1. Allez dans **Edge Functions** > **handle-commission-webhook**
2. Cliquez sur **Invoke**
3. Utilisez ce body de test :
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "metadata": {
        "payment_id": "test-payment-id",
        "restaurant_id": "test-restaurant-id"
      }
    }
  }
}
```
4. Vérifiez les logs pour voir si l'erreur "Signature Stripe manquante" apparaît

## Méthode 3 : Via Supabase CLI (si installé)

```bash
# Lister les secrets (si la commande existe)
supabase secrets list

# Redéployer une Edge Function
supabase functions deploy create-commission-checkout
```

## Solution si les Secrets ne sont pas Accessibles

1. **Vérifiez les noms** : Les secrets doivent s'appeler EXACTEMENT :
   - `STRIPE_SECRET_KEY` (pas `SUPABASE_STRIPE_SECRET_KEY`)
   - `STRIPE_WEBHOOK_SECRET` (pas `SUPABASE_STRIPE_WEBHOOK_SECRET`)

2. **Redéployez les Edge Functions** après avoir ajouté les secrets

3. **Vérifiez les valeurs** : Assurez-vous que les clés Stripe sont valides et non expirées

