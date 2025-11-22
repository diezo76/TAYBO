# Guide de Configuration - Système de Commissions Hebdomadaires

Ce guide explique comment configurer et déployer le système de commissions hebdomadaires pour Taybo.

## 📋 Prérequis

1. **Migration SQL appliquée** : La migration `026_add_commission_tracking.sql` doit être appliquée
2. **Edge Functions déployées** : Les 4 Edge Functions doivent être déployées sur Supabase
3. **Compte Stripe** : Un compte Stripe avec clés API configurées
4. **Variables d'environnement** : Configuration des clés Stripe dans Supabase

## 🔧 Configuration

### 1. Appliquer la Migration SQL

```bash
# Via Supabase CLI
supabase db push

# Ou manuellement via le dashboard Supabase
# Copier-coller le contenu de supabase/migrations/026_add_commission_tracking.sql
```

### 2. Déployer les Edge Functions

```bash
# Déployer toutes les Edge Functions
supabase functions deploy calculate-weekly-commissions
supabase functions deploy freeze-overdue-restaurants
supabase functions deploy create-commission-checkout
supabase functions deploy handle-commission-webhook
```

### 3. Configurer les Variables d'Environnement Supabase

Dans le dashboard Supabase, allez dans **Project Settings > Edge Functions** et ajoutez :

- `STRIPE_SECRET_KEY` : Votre clé secrète Stripe (sk_test_... ou sk_live_...)
- `STRIPE_WEBHOOK_SECRET` : Le secret du webhook Stripe (whsec_...)

### 4. Configurer Stripe

#### 4.1 Créer un Webhook dans Stripe Dashboard

1. Allez dans **Stripe Dashboard > Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. URL du webhook : `https://votre-projet.supabase.co/functions/v1/handle-commission-webhook`
4. Événements à écouter :
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copiez le **Signing secret** (whsec_...) et ajoutez-le dans les variables d'environnement Supabase

#### 4.2 Configurer les URLs de succès/annulation

Les URLs de succès et d'annulation sont configurées dans `create-commission-checkout/index.ts` :
- Succès : `{SUPABASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&payment_id={payment_id}`
- Annulation : `{SUPABASE_URL}/cancel?payment_id={payment_id}`

**Note** : Vous devrez créer ces pages dans votre application React ou rediriger vers le dashboard restaurant.

### 5. Configurer les Tâches Automatiques (Cron Jobs)

#### Option 1 : Utiliser pg_cron (Recommandé pour Supabase)

Créez une migration SQL pour configurer les tâches automatiques :

```sql
-- Tâche pour générer les factures le dimanche à 23:59
SELECT cron.schedule(
  'generate-weekly-commissions',
  '59 23 * * 0', -- Dimanche à 23:59
  $$
  SELECT net.http_post(
    url := 'https://votre-projet.supabase.co/functions/v1/calculate-weekly-commissions',
    headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  ) AS request_id;
  $$
);

-- Tâche pour geler les restaurants en retard (toutes les heures)
SELECT cron.schedule(
  'freeze-overdue-restaurants',
  '0 * * * *', -- Toutes les heures
  $$
  SELECT net.http_post(
    url := 'https://votre-projet.supabase.co/functions/v1/freeze-overdue-restaurants',
    headers := '{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
  ) AS request_id;
  $$
);
```

**Note** : Vous devrez activer l'extension `pg_cron` dans Supabase et configurer `app.settings.service_role_key`.

#### Option 2 : Utiliser un Service Externe (cron-job.org, etc.)

1. Créez un compte sur un service de cron jobs (ex: cron-job.org)
2. Configurez deux tâches :

**Tâche 1 : Génération des factures**
- URL : `https://votre-projet.supabase.co/functions/v1/calculate-weekly-commissions`
- Méthode : POST
- Headers : `Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}`
- Fréquence : Dimanche à 23:59 (selon votre fuseau horaire)

**Tâche 2 : Gel des restaurants**
- URL : `https://votre-projet.supabase.co/functions/v1/freeze-overdue-restaurants`
- Méthode : POST
- Headers : `Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}`
- Fréquence : Toutes les heures

## 🧪 Tests

### Test Manuel du Calcul de Commission

1. Créez quelques commandes avec le statut `delivered`
2. Appelez manuellement l'Edge Function `calculate-weekly-commissions`
3. Vérifiez qu'une facture est créée dans `commission_payments`

### Test du Paiement Stripe

1. Connectez-vous en tant que restaurant
2. Allez sur le dashboard
3. Cliquez sur "Payer maintenant" pour une commission en attente
4. Complétez le paiement dans Stripe Checkout (mode test)
5. Vérifiez que le statut passe à `paid` et que le restaurant est déverrouillé

### Test du Gel Automatique

1. Créez une commission avec une `due_date` dans le passé
2. Appelez l'Edge Function `freeze-overdue-restaurants`
3. Vérifiez que le restaurant est gelé (`is_frozen = true`)
4. Essayez de créer une commande pour ce restaurant (devrait échouer)

## 📊 Monitoring

### Vérifier les Commissions

```sql
-- Voir toutes les commissions
SELECT * FROM commission_payments ORDER BY created_at DESC;

-- Voir les commissions en retard
SELECT * FROM commission_payments 
WHERE status = 'pending' AND due_date < NOW();

-- Voir les restaurants gelés
SELECT id, name, email, is_frozen, frozen_reason, frozen_at 
FROM restaurants 
WHERE is_frozen = true;
```

### Logs des Edge Functions

Dans le dashboard Supabase, allez dans **Edge Functions > Logs** pour voir les logs de chaque fonction.

## ⚠️ Points d'Attention

1. **Fuseau horaire** : Assurez-vous que les calculs de dates utilisent le bon fuseau horaire (UTC par défaut dans Supabase)

2. **Sécurité** : 
   - Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
   - Vérifier les signatures des webhooks Stripe en production
   - Utiliser HTTPS pour tous les endpoints

3. **Performance** :
   - Les fonctions SQL sont optimisées avec des index
   - Le compteur se rafraîchit toutes les 30 secondes côté client
   - Les Edge Functions sont asynchrones et ne bloquent pas

4. **Gestion des erreurs** :
   - Toutes les fonctions ont une gestion d'erreur complète
   - Les erreurs sont loggées dans les logs Supabase
   - Le frontend affiche des messages d'erreur utilisateur-friendly

## 🔄 Mise à Jour

Pour mettre à jour le système :

1. Modifier les fichiers nécessaires
2. Redéployer les Edge Functions modifiées
3. Appliquer les nouvelles migrations SQL si nécessaire
4. Tester les changements

## 📝 Notes Importantes

- Le taux de commission est fixé à **4%** dans le code SQL
- Les commissions sont calculées sur le **subtotal** (hors frais de livraison)
- La période hebdomadaire va du **lundi 00:00 au dimanche 23:59**
- Le délai de paiement est de **72 heures** (jusqu'au mercredi 23:59)
- Les restaurants sont automatiquement **gelés** si non payés après 72h
- Les restaurants sont **déverrouillés** automatiquement après paiement

## 🆘 Support

En cas de problème :

1. Vérifier les logs des Edge Functions dans Supabase
2. Vérifier les logs Stripe dans le dashboard Stripe
3. Vérifier les données dans la base de données (voir section Monitoring)
4. Consulter la documentation Supabase et Stripe

