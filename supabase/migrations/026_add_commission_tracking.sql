-- Migration 026 : Ajout du système de commissions hebdomadaires
-- Cette migration ajoute les colonnes nécessaires pour le système de commissions hebdomadaires
-- avec gel automatique des comptes et intégration Stripe

-- Ajouter les colonnes nécessaires à la table restaurants pour le gel des comptes
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS is_frozen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS frozen_reason TEXT,
ADD COLUMN IF NOT EXISTS frozen_at TIMESTAMP WITH TIME ZONE;

-- Modifier la table commission_payments pour ajouter les nouvelles colonnes
-- Note: period_start et period_end existent déjà, on les renomme pour correspondre aux nouvelles conventions
DO $$ 
BEGIN
  -- Renommer period_start en week_start_date si elle existe et n'est pas déjà renommée
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'commission_payments' AND column_name = 'period_start') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'commission_payments' AND column_name = 'week_start_date') THEN
    ALTER TABLE commission_payments RENAME COLUMN period_start TO week_start_date;
  END IF;
  
  -- Renommer period_end en week_end_date si elle existe et n'est pas déjà renommée
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'commission_payments' AND column_name = 'period_end') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'commission_payments' AND column_name = 'week_end_date') THEN
    ALTER TABLE commission_payments RENAME COLUMN period_end TO week_end_date;
  END IF;
END $$;

-- Ajouter les nouvelles colonnes à commission_payments
ALTER TABLE commission_payments
ADD COLUMN IF NOT EXISTS week_start_date DATE,
ADD COLUMN IF NOT EXISTS week_end_date DATE,
ADD COLUMN IF NOT EXISTS total_sales DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 4.00,
ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Mettre à jour les colonnes existantes si nécessaire
-- Si week_start_date est NULL mais que period_start existe, copier les valeurs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'commission_payments' AND column_name = 'period_start') THEN
    UPDATE commission_payments 
    SET week_start_date = period_start 
    WHERE week_start_date IS NULL AND period_start IS NOT NULL;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'commission_payments' AND column_name = 'period_end') THEN
    UPDATE commission_payments 
    SET week_end_date = period_end 
    WHERE week_end_date IS NULL AND period_end IS NOT NULL;
  END IF;
END $$;

-- Modifier le statut pour supporter plus de valeurs
ALTER TABLE commission_payments 
DROP CONSTRAINT IF EXISTS commission_payments_status_check;

ALTER TABLE commission_payments
ADD CONSTRAINT commission_payments_status_check 
CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));

-- Modifier la colonne status pour avoir une valeur par défaut
ALTER TABLE commission_payments
ALTER COLUMN status SET DEFAULT 'pending';

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_commission_payments_restaurant_status 
ON commission_payments(restaurant_id, status);

CREATE INDEX IF NOT EXISTS idx_commission_payments_week 
ON commission_payments(week_start_date, week_end_date);

CREATE INDEX IF NOT EXISTS idx_commission_payments_due_date 
ON commission_payments(due_date) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_restaurants_frozen 
ON restaurants(is_frozen) WHERE is_frozen = true;

-- Fonction pour calculer les dates de la semaine en cours (lundi 00:00 → dimanche 23:59)
CREATE OR REPLACE FUNCTION get_current_week_dates()
RETURNS TABLE(week_start DATE, week_end DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 day')::DATE AS week_start, -- Lundi
    (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days')::DATE AS week_end;   -- Dimanche suivant
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les commissions d'un restaurant pour une semaine
-- Calcule sur le subtotal (hors frais de livraison) avec un taux de 4%
CREATE OR REPLACE FUNCTION calculate_weekly_commission(
  p_restaurant_id UUID,
  p_week_start DATE,
  p_week_end DATE
)
RETURNS TABLE(
  total_sales DECIMAL,
  commission_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(o.subtotal), 0) as total_sales,
    COALESCE(SUM(o.subtotal), 0) * 0.04 as commission_amount
  FROM orders o
  WHERE o.restaurant_id = p_restaurant_id
    AND o.status = 'delivered'
    AND o.created_at >= p_week_start
    AND o.created_at < (p_week_end + INTERVAL '1 day')
    AND o.subtotal IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les commissions en temps réel pour la semaine en cours
CREATE OR REPLACE FUNCTION get_current_week_commission(p_restaurant_id UUID)
RETURNS TABLE(
  total_sales DECIMAL,
  commission_amount DECIMAL,
  week_start DATE,
  week_end DATE
) AS $$
DECLARE
  v_week_start DATE;
  v_week_end DATE;
BEGIN
  -- Obtenir les dates de la semaine en cours
  SELECT week_start, week_end INTO v_week_start, v_week_end
  FROM get_current_week_dates();
  
  -- Calculer les commissions pour cette semaine
  RETURN QUERY
  SELECT 
    c.total_sales,
    c.commission_amount,
    v_week_start,
    v_week_end
  FROM calculate_weekly_commission(p_restaurant_id, v_week_start, v_week_end) c;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour geler un restaurant
CREATE OR REPLACE FUNCTION freeze_restaurant(
  p_restaurant_id UUID,
  p_reason TEXT DEFAULT 'Commission impayée'
)
RETURNS void AS $$
BEGIN
  UPDATE restaurants
  SET 
    is_frozen = true,
    frozen_reason = p_reason,
    frozen_at = NOW()
  WHERE id = p_restaurant_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour déverrouiller un restaurant
CREATE OR REPLACE FUNCTION unfreeze_restaurant(p_restaurant_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE restaurants
  SET 
    is_frozen = false,
    frozen_reason = NULL,
    frozen_at = NULL
  WHERE id = p_restaurant_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour empêcher les nouvelles commandes si le restaurant est gelé
CREATE OR REPLACE FUNCTION check_restaurant_frozen()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM restaurants 
    WHERE id = NEW.restaurant_id AND is_frozen = true
  ) THEN
    RAISE EXCEPTION 'Le restaurant est temporairement gelé. Veuillez contacter le support.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger si il n'existe pas déjà
DROP TRIGGER IF EXISTS prevent_orders_if_frozen ON orders;
CREATE TRIGGER prevent_orders_if_frozen
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION check_restaurant_frozen();

-- Commentaires pour documentation
COMMENT ON FUNCTION get_current_week_dates() IS 'Retourne les dates de début (lundi) et fin (dimanche) de la semaine en cours';
COMMENT ON FUNCTION calculate_weekly_commission(UUID, DATE, DATE) IS 'Calcule les commissions hebdomadaires sur le subtotal (hors frais de livraison) avec un taux de 4%';
COMMENT ON FUNCTION get_current_week_commission(UUID) IS 'Retourne les commissions en temps réel pour la semaine en cours';
COMMENT ON FUNCTION freeze_restaurant(UUID, TEXT) IS 'Gèle un restaurant (empêche les nouvelles commandes)';
COMMENT ON FUNCTION unfreeze_restaurant(UUID) IS 'Déverrouille un restaurant';

