-- Migration 027 : Ajout des champs Stripe à la table orders
-- Cette migration ajoute les colonnes nécessaires pour le suivi des paiements Stripe

-- Ajouter les colonnes Stripe à la table orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session 
ON orders(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent 
ON orders(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN orders.stripe_checkout_session_id IS 'ID de la session Stripe Checkout pour le paiement de la commande';
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'ID du PaymentIntent Stripe pour le paiement de la commande';

