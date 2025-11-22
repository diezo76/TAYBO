# Compte Rendu : Intégration Stripe pour les Paiements par Carte

## Problème identifié
Lors du test de paiement par carte, la commande était validée directement sans demander la saisie des informations de carte bancaire. Le système créait la commande immédiatement sans passer par le processus de paiement Stripe.

## Solution implémentée

### 1. Migration de base de données ✅
**Fichier** : `supabase/migrations/027_add_stripe_fields_to_orders.sql`

Ajout des champs nécessaires pour le suivi des paiements Stripe dans la table `orders` :
- `stripe_checkout_session_id` : ID de la session Stripe Checkout
- `stripe_payment_intent_id` : ID du PaymentIntent Stripe

### 2. Edge Function : create-order-checkout ✅
**Fichier** : `supabase/functions/create-order-checkout/index.ts`

Création d'une Edge Function qui :
- Vérifie l'authentification de l'utilisateur
- Vérifie que la commande existe et appartient à l'utilisateur
- Vérifie que le mode de paiement est 'card' et le statut est 'pending'
- Crée une session Stripe Checkout avec les métadonnées nécessaires
- Met à jour la commande avec l'ID de la session Stripe
- Retourne l'URL de checkout pour redirection

### 3. Service orderService ✅
**Fichier** : `src/services/orderService.js`

Ajout de la fonction `createOrderCheckout(orderId)` qui :
- Appelle l'Edge Function `create-order-checkout`
- Retourne l'URL de checkout et les informations de session

### 4. Modification de Checkout.jsx ✅
**Fichier** : `src/pages/client/Checkout.jsx`

Modification du flux de paiement :
- **Avant** : Création directe de la commande et redirection vers la confirmation
- **Maintenant** :
  1. Création de la commande avec `payment_status='pending'`
  2. Si `paymentMethod === 'card'` :
     - Création d'une session Stripe Checkout
     - Redirection vers Stripe pour saisie des informations de carte
  3. Si `paymentMethod === 'cash'` :
     - Redirection directe vers la page de confirmation

### 5. Webhook Handler ✅
**Fichier** : `supabase/functions/handle-commission-webhook/index.ts`

Modification du webhook handler existant pour gérer aussi les paiements de commandes :
- Détection du type de paiement via les métadonnées (`order_id` vs `payment_id`)
- Mise à jour du statut de paiement de la commande à 'paid' après succès Stripe
- Enregistrement du `stripe_payment_intent_id` dans la commande

### 6. Page OrderConfirmation ✅
**Fichier** : `src/pages/client/OrderConfirmation.jsx`

Ajout de la gestion du retour de Stripe :
- Détection des paramètres `payment=success` et `session_id` dans l'URL
- Rechargement automatique de la commande pour afficher le statut de paiement mis à jour
- Nettoyage des paramètres de l'URL après traitement

## Flux de paiement par carte

1. **Client sélectionne "Carte"** dans le formulaire de checkout
2. **Soumission du formulaire** :
   - Création de la commande avec `payment_status='pending'`
   - Création d'une session Stripe Checkout
   - Redirection vers Stripe Checkout
3. **Client saisit ses informations de carte** sur Stripe
4. **Stripe traite le paiement** :
   - Webhook `checkout.session.completed` envoyé à Supabase
   - Mise à jour automatique du statut de paiement à 'paid'
5. **Redirection vers la page de confirmation** :
   - URL : `/client/orders/{orderId}?payment=success&session_id={sessionId}`
   - Rechargement de la commande pour afficher le statut mis à jour

## Prochaines étapes

### Déploiement requis

1. **Appliquer la migration** :
   ```bash
   supabase migration up
   ```

2. **Déployer l'Edge Function** :
   ```bash
   supabase functions deploy create-order-checkout
   ```

3. **Mettre à jour le webhook Stripe** :
   - S'assurer que le webhook `handle-commission-webhook` est configuré dans Stripe Dashboard
   - Vérifier que les événements `checkout.session.completed` et `payment_intent.succeeded` sont activés

4. **Variables d'environnement** :
   - Vérifier que `STRIPE_SECRET_KEY` est configuré dans Supabase
   - Vérifier que `STRIPE_WEBHOOK_SECRET` est configuré dans Supabase

### Tests à effectuer

1. **Test du flux complet** :
   - Créer une commande avec paiement par carte
   - Vérifier la redirection vers Stripe Checkout
   - Compléter le paiement avec une carte de test (4242 4242 4242 4242)
   - Vérifier que le statut de paiement est mis à jour à 'paid'
   - Vérifier l'affichage sur la page de confirmation

2. **Test du webhook** :
   - Vérifier les logs du webhook dans Supabase Dashboard
   - Vérifier que les événements Stripe sont bien reçus et traités

3. **Test de l'annulation** :
   - Annuler le paiement sur Stripe Checkout
   - Vérifier la redirection vers la page de commande avec `payment=cancelled`
   - Vérifier que le statut reste 'pending'

## Notes importantes

- Le panier n'est vidé qu'après la création de la commande, pas après le paiement
- En cas d'échec du paiement, la commande reste avec `payment_status='pending'`
- Le webhook handler gère à la fois les commissions et les commandes client
- Les métadonnées Stripe permettent de distinguer les types de paiements

## Fichiers modifiés/créés

- ✅ `supabase/migrations/027_add_stripe_fields_to_orders.sql` (nouveau)
- ✅ `supabase/functions/create-order-checkout/index.ts` (nouveau)
- ✅ `src/services/orderService.js` (modifié)
- ✅ `src/pages/client/Checkout.jsx` (modifié)
- ✅ `supabase/functions/handle-commission-webhook/index.ts` (modifié)
- ✅ `src/pages/client/OrderConfirmation.jsx` (modifié)

