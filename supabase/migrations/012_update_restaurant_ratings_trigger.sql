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

