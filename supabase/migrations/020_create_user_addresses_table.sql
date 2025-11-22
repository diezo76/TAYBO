-- Migration 020 : Création de la table user_addresses
-- Cette table stocke les adresses sauvegardées des clients

CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL CHECK (address_type IN ('apartment', 'house', 'office')),
  area TEXT NOT NULL,
  building_name TEXT NOT NULL,
  apt_number TEXT NOT NULL,
  floor TEXT,
  street TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  additional_directions TEXT,
  address_label TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par utilisateur
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(user_id, is_default) WHERE is_default = TRUE;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies pour user_addresses
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Policy : Les utilisateurs peuvent voir leurs propres adresses
CREATE POLICY "Users can view their own addresses"
  ON user_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent créer leurs propres adresses
CREATE POLICY "Users can create their own addresses"
  ON user_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent mettre à jour leurs propres adresses
CREATE POLICY "Users can update their own addresses"
  ON user_addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy : Les utilisateurs peuvent supprimer leurs propres adresses
CREATE POLICY "Users can delete their own addresses"
  ON user_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

