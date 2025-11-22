-- Migration 011 : Activation de Row Level Security (RLS) sur toutes les tables
-- RLS permet de contrôler qui peut lire/modifier les données selon des règles précises

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table users
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

-- Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Politiques pour la table restaurants
-- Tout le monde peut voir les restaurants actifs et vérifiés
CREATE POLICY "Anyone can view active verified restaurants"
  ON restaurants FOR SELECT
  USING (is_active = true AND is_verified = true);

-- Les restaurants peuvent voir et modifier leur propre profil
CREATE POLICY "Restaurants can manage own profile"
  ON restaurants FOR ALL
  USING (auth.uid()::text = id::text);

-- Les admins peuvent tout voir et modifier
-- Note: Vous devrez créer une fonction pour vérifier si un utilisateur est admin
CREATE POLICY "Admins can manage all restaurants"
  ON restaurants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com' -- À adapter selon votre système admin
    )
  );

-- Politiques pour la table menu_items
-- Tout le monde peut voir les plats disponibles des restaurants actifs
CREATE POLICY "Anyone can view available menu items"
  ON menu_items FOR SELECT
  USING (
    is_available = true AND
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
      AND restaurants.is_active = true
      AND restaurants.is_verified = true
    )
  );

-- Les restaurants peuvent gérer leurs propres plats
CREATE POLICY "Restaurants can manage own menu items"
  ON menu_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menu_items.restaurant_id
      AND restaurants.id::text = auth.uid()::text
    )
  );

-- Politiques pour la table orders
-- Les clients peuvent voir leurs propres commandes
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (user_id::text = auth.uid()::text);

-- Les clients peuvent créer leurs propres commandes
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- Les restaurants peuvent voir les commandes de leur restaurant
CREATE POLICY "Restaurants can view own orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.id::text = auth.uid()::text
    )
  );

-- Les restaurants peuvent mettre à jour le statut de leurs commandes
CREATE POLICY "Restaurants can update own orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = orders.restaurant_id
      AND restaurants.id::text = auth.uid()::text
    )
  );

-- Politiques pour la table reviews
-- Tout le monde peut voir les avis
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

-- Les utilisateurs peuvent créer leurs propres avis
CREATE POLICY "Users can create own reviews"
  ON reviews FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

-- Les utilisateurs peuvent modifier leurs propres avis
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (user_id::text = auth.uid()::text);

-- Politiques pour la table promotions
-- Tout le monde peut voir les promotions actives
CREATE POLICY "Anyone can view active promotions"
  ON promotions FOR SELECT
  USING (
    is_active = true AND
    start_date <= NOW() AND
    end_date >= NOW()
  );

-- Les restaurants peuvent gérer leurs propres promotions
CREATE POLICY "Restaurants can manage own promotions"
  ON promotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = promotions.restaurant_id
      AND restaurants.id::text = auth.uid()::text
    )
  );

-- Politiques pour la table commission_payments
-- Les restaurants peuvent voir leurs propres paiements de commission
CREATE POLICY "Restaurants can view own commission payments"
  ON commission_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = commission_payments.restaurant_id
      AND restaurants.id::text = auth.uid()::text
    )
  );

-- Politiques pour la table support_tickets
-- Les utilisateurs peuvent voir et créer leurs propres tickets
CREATE POLICY "Users can manage own tickets"
  ON support_tickets FOR ALL
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

-- Les restaurants peuvent voir et créer leurs propres tickets
CREATE POLICY "Restaurants can manage own tickets"
  ON support_tickets FOR ALL
  USING (restaurant_id::text = auth.uid()::text)
  WITH CHECK (restaurant_id::text = auth.uid()::text);

-- Les admins peuvent voir tous les tickets
CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com'
    )
  );

-- Politiques pour la table ticket_messages
-- Les utilisateurs peuvent voir les messages de leurs tickets
CREATE POLICY "Users can view own ticket messages"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id::text = auth.uid()::text
    )
  );

-- Les utilisateurs peuvent créer des messages dans leurs tickets
CREATE POLICY "Users can create own ticket messages"
  ON ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.user_id::text = auth.uid()::text
    )
  );

-- Les restaurants peuvent voir et créer des messages dans leurs tickets
CREATE POLICY "Restaurants can manage own ticket messages"
  ON ticket_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.restaurant_id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND support_tickets.restaurant_id::text = auth.uid()::text
    )
  );

-- Les admins peuvent voir et créer des messages dans tous les tickets
CREATE POLICY "Admins can manage all ticket messages"
  ON ticket_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = auth.uid()::text
      AND users.email = 'admin@taybo.com'
    )
  );

-- Politiques pour la table favorites
-- Les utilisateurs peuvent gérer leurs propres favoris
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);


