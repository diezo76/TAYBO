-- Migration 001 : Création de la table users (Clients)
-- Cette table stocke les informations des clients/utilisateurs

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'ar', 'en')),
  allergies JSONB DEFAULT '[]',
  dietary_preferences JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at sur la table users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Migration 002 : Création de la table restaurants
-- Cette table stocke les informations des restaurants

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  passport_document_url TEXT, -- URL Supabase Storage
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  opening_hours JSONB DEFAULT '{}',
  delivery_fee DECIMAL(10,2) NOT NULL,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_restaurants_name ON restaurants(name);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON restaurants(is_active);
CREATE INDEX IF NOT EXISTS idx_restaurants_verified ON restaurants(is_verified);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Migration 003 : Création de la table menu_items
-- Cette table stocke les plats/menus de chaque restaurant

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('entrée', 'plat', 'dessert', 'boisson')),
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  preparation_time INTEGER DEFAULT 15, -- en minutes
  options JSONB DEFAULT '[]', -- tailles, extras, sauces
  allergens JSONB DEFAULT '[]',
  dietary_tags JSONB DEFAULT '[]', -- vegan, halal, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Migration 004 : Création de la table orders
-- Cette table stocke toutes les commandes

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled')
  ),
  items JSONB NOT NULL, -- Détails de la commande
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'cash')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'paid', 'failed')
  ),
  scheduled_delivery_time TIMESTAMP WITH TIME ZONE,
  commission_amount DECIMAL(10,2) NOT NULL,
  commission_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Migration 005 : Création de la table reviews
-- Cette table stocke les avis et notes des clients sur les restaurants

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  order_id UUID NOT NULL REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);

-- Un utilisateur ne peut laisser qu'un avis par commande
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique ON reviews(user_id, order_id);


-- Migration 006 : Création de la table promotions
-- Cette table stocke les promotions et réductions des restaurants

CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_promotions_restaurant ON promotions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);


-- Migration 007 : Création de la table commission_payments
-- Cette table stocke les paiements de commissions des restaurants à Taybo

CREATE TABLE IF NOT EXISTS commission_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  amount DECIMAL(10,2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payment_method TEXT CHECK (payment_method IN ('transfer', 'card')),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_commission_payments_restaurant ON commission_payments(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_status ON commission_payments(status);
CREATE INDEX IF NOT EXISTS idx_commission_payments_period ON commission_payments(period_start, period_end);


-- Migration 008 : Création de la table support_tickets
-- Cette table stocke les tickets de support (litiges)

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_restaurant ON support_tickets(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Migration 009 : Création de la table ticket_messages
-- Cette table stocke les messages dans les tickets de support

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'restaurant', 'admin')),
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created ON ticket_messages(created_at DESC);


-- Migration 010 : Création de la table favorites
-- Cette table stocke les favoris des clients (restaurants et plats)

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Un utilisateur ne peut avoir qu'un favori par restaurant/plat
  CONSTRAINT favorites_unique UNIQUE (user_id, restaurant_id, menu_item_id),
  -- Au moins un des deux (restaurant_id ou menu_item_id) doit être défini
  CONSTRAINT favorites_check CHECK (
    (restaurant_id IS NOT NULL AND menu_item_id IS NULL) OR
    (restaurant_id IS NULL AND menu_item_id IS NOT NULL)
  )
);

-- Index
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_restaurant ON favorites(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_favorites_menu_item ON favorites(menu_item_id);


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


-- Migration 012 : Trigger pour mettre à jour automatiquement les notes moyennes des restaurants
-- Ce trigger met à jour average_rating et total_reviews dans la table restaurants
-- quand un avis est créé, modifié ou supprimé

-- Fonction pour calculer et mettre à jour la note moyenne
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculer la nouvelle note moyenne et le nombre total d'avis
  UPDATE restaurants
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE restaurant_id = COALESCE(NEW.restaurant_id, OLD.restaurant_id)
    )
  WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger après INSERT
CREATE TRIGGER trigger_update_rating_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_rating();

-- Trigger après UPDATE
CREATE TRIGGER trigger_update_rating_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_rating();

-- Trigger après DELETE
CREATE TRIGGER trigger_update_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_rating();

