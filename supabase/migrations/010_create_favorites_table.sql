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


