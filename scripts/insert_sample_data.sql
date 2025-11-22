-- Script d'insertion de données d'exemple
-- Ce script crée 10 restaurants complets avec menus variés et des utilisateurs clients d'exemple
-- Les images sont des URLs publiques depuis Unsplash et Pexels

-- ============================================
-- 1. INSERTION DES RESTAURANTS
-- ============================================

-- Restaurant 1: Pizza Italiana (Pizza Italienne)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'a1b2c3d4-e5f6-4789-a012-345678901234',
  'pizza.italiana@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'Pizza Italiana',
  'Authentique cuisine italienne avec des pizzas faites maison au feu de bois. Nos ingrédients sont importés directement d''Italie pour vous offrir une expérience gustative unique.',
  'Italienne',
  '123 Avenue Mohammed V, Casablanca',
  '+212 522 123 456',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "11:00", "fermeture": "23:00"}, "mardi": {"ouverture": "11:00", "fermeture": "23:00"}, "mercredi": {"ouverture": "11:00", "fermeture": "23:00"}, "jeudi": {"ouverture": "11:00", "fermeture": "23:00"}, "vendredi": {"ouverture": "11:00", "fermeture": "00:00"}, "samedi": {"ouverture": "11:00", "fermeture": "00:00"}, "dimanche": {"ouverture": "12:00", "fermeture": "22:00"}}'::jsonb,
  15.00,
  4.5,
  127
);

-- Restaurant 2: Sushi Master (Japonais)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'b2c3d4e5-f6a7-4890-b123-456789012345',
  'sushi.master@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'Sushi Master',
  'Sushi frais préparé quotidiennement par nos chefs japonais certifiés. Découvrez une sélection de sushis, sashimis et makis de qualité premium.',
  'Japonais',
  '45 Boulevard Zerktouni, Casablanca',
  '+212 522 234 567',
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "12:00", "fermeture": "22:30"}, "mardi": {"ouverture": "12:00", "fermeture": "22:30"}, "mercredi": {"ouverture": "12:00", "fermeture": "22:30"}, "jeudi": {"ouverture": "12:00", "fermeture": "22:30"}, "vendredi": {"ouverture": "12:00", "fermeture": "23:00"}, "samedi": {"ouverture": "12:00", "fermeture": "23:00"}, "dimanche": {"ouverture": "12:00", "fermeture": "22:00"}}'::jsonb,
  20.00,
  4.7,
  89
);

-- Restaurant 3: Tajine Royal (Marocain)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'c3d4e5f6-a7b8-4901-c234-567890123456',
  'tajine.royal@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'Tajine Royal',
  'Cuisine marocaine traditionnelle authentique. Nos tajines sont préparés selon les recettes ancestrales avec des ingrédients frais et locaux.',
  'Marocain',
  '78 Rue Allal Ben Abdellah, Casablanca',
  '+212 522 345 678',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "11:30", "fermeture": "23:00"}, "mardi": {"ouverture": "11:30", "fermeture": "23:00"}, "mercredi": {"ouverture": "11:30", "fermeture": "23:00"}, "jeudi": {"ouverture": "11:30", "fermeture": "23:00"}, "vendredi": {"ouverture": "11:30", "fermeture": "23:30"}, "samedi": {"ouverture": "11:30", "fermeture": "23:30"}, "dimanche": {"ouverture": "12:00", "fermeture": "22:30"}}'::jsonb,
  12.00,
  4.8,
  203
);

-- Restaurant 4: Burger House (Fast Food)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'd4e5f6a7-b8c9-4012-d345-678901234567',
  'burger.house@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'Burger House',
  'Les meilleurs burgers de Casablanca ! Viande 100% halal, pains frais cuits quotidiennement et frites croustillantes. Une expérience gourmande à chaque bouchée.',
  'Fast Food',
  '12 Boulevard Hassan II, Casablanca',
  '+212 522 456 789',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "11:00", "fermeture": "23:30"}, "mardi": {"ouverture": "11:00", "fermeture": "23:30"}, "mercredi": {"ouverture": "11:00", "fermeture": "23:30"}, "jeudi": {"ouverture": "11:00", "fermeture": "23:30"}, "vendredi": {"ouverture": "11:00", "fermeture": "00:30"}, "samedi": {"ouverture": "11:00", "fermeture": "00:30"}, "dimanche": {"ouverture": "11:00", "fermeture": "23:00"}}'::jsonb,
  10.00,
  4.4,
  312
);

-- Restaurant 5: Le Bistrot Français (Français)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'e5f6a7b8-c9d0-4123-e456-789012345678',
  'bistrot.francais@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'Le Bistrot Français',
  'Cuisine française raffinée dans une ambiance chaleureuse. Escargots, coq au vin, boeuf bourguignon et bien plus encore pour une expérience gastronomique authentique.',
  'Français',
  '56 Avenue des FAR, Casablanca',
  '+212 522 567 890',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "12:00", "fermeture": "22:00"}, "mardi": {"ouverture": "12:00", "fermeture": "22:00"}, "mercredi": {"ouverture": "12:00", "fermeture": "22:00"}, "jeudi": {"ouverture": "12:00", "fermeture": "22:00"}, "vendredi": {"ouverture": "12:00", "fermeture": "23:00"}, "samedi": {"ouverture": "12:00", "fermeture": "23:00"}, "dimanche": {"ouverture": "12:00", "fermeture": "21:00"}}'::jsonb,
  18.00,
  4.6,
  145
);

-- Restaurant 6: Spice Garden (Indien)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'f6a7b8c9-d0e1-4234-f567-890123456789',
  'spice.garden@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'Spice Garden',
  'Cuisine indienne authentique avec des épices importées directement d''Inde. Currys, biryanis, tandooris et naans faits maison pour une explosion de saveurs.',
  'Indien',
  '89 Rue Ibn Battuta, Casablanca',
  '+212 522 678 901',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "12:00", "fermeture": "22:30"}, "mardi": {"ouverture": "12:00", "fermeture": "22:30"}, "mercredi": {"ouverture": "12:00", "fermeture": "22:30"}, "jeudi": {"ouverture": "12:00", "fermeture": "22:30"}, "vendredi": {"ouverture": "12:00", "fermeture": "23:00"}, "samedi": {"ouverture": "12:00", "fermeture": "23:00"}, "dimanche": {"ouverture": "12:00", "fermeture": "22:00"}}'::jsonb,
  16.00,
  4.5,
  98
);

-- Restaurant 7: La Pasta (Italien - Pâtes)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'a7b8c9d0-e1f2-4345-a678-901234567890',
  'la.pasta@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'La Pasta',
  'Spécialiste des pâtes fraîches faites maison. Plus de 20 variétés de pâtes et sauces authentiques italiennes. Une véritable expérience culinaire italienne.',
  'Italienne',
  '34 Boulevard Anfa, Casablanca',
  '+212 522 789 012',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "11:30", "fermeture": "22:30"}, "mardi": {"ouverture": "11:30", "fermeture": "22:30"}, "mercredi": {"ouverture": "11:30", "fermeture": "22:30"}, "jeudi": {"ouverture": "11:30", "fermeture": "22:30"}, "vendredi": {"ouverture": "11:30", "fermeture": "23:00"}, "samedi": {"ouverture": "11:30", "fermeture": "23:00"}, "dimanche": {"ouverture": "12:00", "fermeture": "22:00"}}'::jsonb,
  14.00,
  4.3,
  167
);

-- Restaurant 8: Dragon Palace (Chinois)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'b8c9d0e1-f2a3-4456-a789-012345678901',
  'dragon.palace@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'Dragon Palace',
  'Cuisine chinoise authentique avec des spécialités du Sichuan et du Canton. Dim sum, canard laqué, nouilles sautées et bien plus encore.',
  'Chinois',
  '67 Avenue Lalla Yacout, Casablanca',
  '+212 522 890 123',
  'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "11:00", "fermeture": "22:00"}, "mardi": {"ouverture": "11:00", "fermeture": "22:00"}, "mercredi": {"ouverture": "11:00", "fermeture": "22:00"}, "jeudi": {"ouverture": "11:00", "fermeture": "22:00"}, "vendredi": {"ouverture": "11:00", "fermeture": "23:00"}, "samedi": {"ouverture": "11:00", "fermeture": "23:00"}, "dimanche": {"ouverture": "11:00", "fermeture": "22:00"}}'::jsonb,
  17.00,
  4.4,
  134
);

-- Restaurant 9: Le Grill (Grillades)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'c9d0e1f2-a3b4-4567-a890-123456789012',
  'le.grill@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'Le Grill',
  'Spécialiste des grillades et viandes premium. Nos viandes sont sélectionnées avec soin et grillées au charbon de bois pour une saveur incomparable.',
  'Grillades',
  '23 Boulevard Mohammed V, Casablanca',
  '+212 522 901 234',
  'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "18:00", "fermeture": "23:30"}, "mardi": {"ouverture": "18:00", "fermeture": "23:30"}, "mercredi": {"ouverture": "18:00", "fermeture": "23:30"}, "jeudi": {"ouverture": "18:00", "fermeture": "23:30"}, "vendredi": {"ouverture": "18:00", "fermeture": "00:30"}, "samedi": {"ouverture": "18:00", "fermeture": "00:30"}, "dimanche": {"ouverture": "18:00", "fermeture": "23:00"}}'::jsonb,
  19.00,
  4.7,
  189
);

-- Restaurant 10: Sweet Dreams (Desserts & Café)
INSERT INTO restaurants (
  id, email, password_hash, name, description, cuisine_type, address, phone,
  image_url, is_verified, is_active, opening_hours, delivery_fee, average_rating, total_reviews
) VALUES (
  'd0e1f2a3-b4c5-4678-a901-234567890123',
  'sweet.dreams@taybo.com',
  '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
  'Sweet Dreams',
  'Pâtisserie et café de qualité. Gâteaux, tartes, macarons et desserts gourmands préparés quotidiennement par nos pâtissiers. Café arabica de qualité supérieure.',
  'Desserts & Café',
  '91 Rue Oued El Makhazine, Casablanca',
  '+212 522 012 345',
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop',
  true,
  true,
  '{"lundi": {"ouverture": "08:00", "fermeture": "20:00"}, "mardi": {"ouverture": "08:00", "fermeture": "20:00"}, "mercredi": {"ouverture": "08:00", "fermeture": "20:00"}, "jeudi": {"ouverture": "08:00", "fermeture": "20:00"}, "vendredi": {"ouverture": "08:00", "fermeture": "21:00"}, "samedi": {"ouverture": "09:00", "fermeture": "21:00"}, "dimanche": {"ouverture": "09:00", "fermeture": "19:00"}}'::jsonb,
  8.00,
  4.6,
  256
);

-- ============================================
-- 2. INSERTION DES MENUS POUR CHAQUE RESTAURANT
-- ============================================

-- Menus pour Pizza Italiana
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('a1b2c3d4-e5f6-4789-a012-345678901234', 'Pizza Margherita', 'Tomate, mozzarella, basilic frais', 'plat', 65.00, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop', true, 15, '[]'::jsonb, '["gluten", "lactose"]'::jsonb, '["végétarien"]'::jsonb),
('a1b2c3d4-e5f6-4789-a012-345678901234', 'Pizza Pepperoni', 'Tomate, mozzarella, pepperoni épicé', 'plat', 75.00, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop', true, 15, '[]'::jsonb, '["gluten", "lactose"]'::jsonb, '[]'::jsonb),
('a1b2c3d4-e5f6-4789-a012-345678901234', 'Pizza Quatre Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 'plat', 85.00, 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&h=400&fit=crop', true, 15, '[]'::jsonb, '["gluten", "lactose"]'::jsonb, '["végétarien"]'::jsonb),
('a1b2c3d4-e5f6-4789-a012-345678901234', 'Salade César', 'Laitue romaine, croûtons, parmesan, sauce césar', 'entrée', 45.00, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop', true, 10, '[]'::jsonb, '["gluten", "lactose", "oeufs"]'::jsonb, '[]'::jsonb),
('a1b2c3d4-e5f6-4789-a012-345678901234', 'Tiramisu', 'Dessert italien au café et mascarpone', 'dessert', 35.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '["gluten", "lactose", "oeufs"]'::jsonb, '[]'::jsonb),
('a1b2c3d4-e5f6-4789-a012-345678901234', 'Coca Cola', 'Boisson gazeuse 33cl', 'boisson', 12.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=400&fit=crop', true, 2, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb);

-- Menus pour Sushi Master
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('b2c3d4e5-f6a7-4890-b123-456789012345', 'Assortiment Sushi (12 pièces)', 'Sélection de sushis variés : saumon, thon, crevette', 'plat', 120.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop', true, 20, '[]'::jsonb, '["poisson", "soja"]'::jsonb, '[]'::jsonb),
('b2c3d4e5-f6a7-4890-b123-456789012345', 'Sashimi Saumon (8 pièces)', 'Saumon frais coupé en tranches', 'plat', 95.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop', true, 15, '[]'::jsonb, '["poisson"]'::jsonb, '[]'::jsonb),
('b2c3d4e5-f6a7-4890-b123-456789012345', 'Maki California (8 pièces)', 'Riz, avocat, concombre, surimi', 'plat', 55.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop', true, 12, '[]'::jsonb, '["poisson", "gluten"]'::jsonb, '[]'::jsonb),
('b2c3d4e5-f6a7-4890-b123-456789012345', 'Soupe Miso', 'Soupe traditionnelle japonaise', 'entrée', 25.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop', true, 8, '[]'::jsonb, '["soja"]'::jsonb, '["végétarien"]'::jsonb),
('b2c3d4e5-f6a7-4890-b123-456789012345', 'Mochi Glacé', 'Dessert japonais aux saveurs variées', 'dessert', 30.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '["lactose"]'::jsonb, '[]'::jsonb),
('b2c3d4e5-f6a7-4890-b123-456789012345', 'Thé Vert', 'Thé vert japonais authentique', 'boisson', 15.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop', true, 3, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan"]'::jsonb);

-- Menus pour Tajine Royal
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('c3d4e5f6-a7b8-4901-c234-567890123456', 'Tajine Poulet aux Olives', 'Poulet mijoté avec olives vertes et citron confit', 'plat', 85.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop', true, 45, '[]'::jsonb, '[]'::jsonb, '["halal"]'::jsonb),
('c3d4e5f6-a7b8-4901-c234-567890123456', 'Tajine Agneau aux Pruneaux', 'Agneau tendre avec pruneaux et amandes', 'plat', 95.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop', true, 50, '[]'::jsonb, '[]'::jsonb, '["halal"]'::jsonb),
('c3d4e5f6-a7b8-4901-c234-567890123456', 'Couscous Royal', 'Couscous avec agneau, poulet et merguez', 'plat', 90.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop', true, 40, '[]'::jsonb, '["gluten"]'::jsonb, '["halal"]'::jsonb),
('c3d4e5f6-a7b8-4901-c234-567890123456', 'Salade Marocaine', 'Tomates, concombres, oignons, persil', 'entrée', 30.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop', true, 10, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan", "halal"]'::jsonb),
('c3d4e5f6-a7b8-4901-c234-567890123456', 'Pastilla au Lait', 'Dessert traditionnel marocain', 'dessert', 40.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop', true, 15, '[]'::jsonb, '["gluten", "lactose"]'::jsonb, '["halal"]'::jsonb),
('c3d4e5f6-a7b8-4901-c234-567890123456', 'Thé à la Menthe', 'Thé vert à la menthe fraîche', 'boisson', 15.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan", "halal"]'::jsonb);

-- Menus pour Burger House
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('d4e5f6a7-b8c9-4012-d345-678901234567', 'Burger Classic', 'Steak haché, salade, tomate, oignons, sauce spéciale', 'plat', 55.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', true, 15, '[{"nom": "Taille", "options": ["Normal", "Grand"]}, {"nom": "Fromage", "options": ["Cheddar", "Emmental", "Sans fromage"]}]'::jsonb, '["gluten", "lactose"]'::jsonb, '["halal"]'::jsonb),
('d4e5f6a7-b8c9-4012-d345-678901234567', 'Burger BBQ', 'Steak haché, bacon, oignons frits, sauce BBQ', 'plat', 65.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', true, 15, '[{"nom": "Taille", "options": ["Normal", "Grand"]}]'::jsonb, '["gluten", "lactose"]'::jsonb, '["halal"]'::jsonb),
('d4e5f6a7-b8c9-4012-d345-678901234567', 'Burger Chicken', 'Filet de poulet pané, salade, sauce blanche', 'plat', 60.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop', true, 15, '[{"nom": "Taille", "options": ["Normal", "Grand"]}]'::jsonb, '["gluten", "lactose"]'::jsonb, '["halal"]'::jsonb),
('d4e5f6a7-b8c9-4012-d345-678901234567', 'Frites Maison', 'Pommes de terre fraîches coupées et frites', 'entrée', 20.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop', true, 10, '[{"nom": "Taille", "options": ["Petite", "Moyenne", "Grande"]}]'::jsonb, '[]'::jsonb, '["végétarien", "vegan", "halal"]'::jsonb),
('d4e5f6a7-b8c9-4012-d345-678901234567', 'Milkshake Vanille', 'Milkshake à la vanille avec chantilly', 'dessert', 25.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '["lactose"]'::jsonb, '["halal"]'::jsonb),
('d4e5f6a7-b8c9-4012-d345-678901234567', 'Coca Cola', 'Boisson gazeuse 50cl', 'boisson', 15.00, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=400&fit=crop', true, 2, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb);

-- Menus pour Le Bistrot Français
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('e5f6a7b8-c9d0-4123-e456-789012345678', 'Escargots de Bourgogne', 'Escargots au beurre persillé', 'entrée', 65.00, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', true, 20, '[]'::jsonb, '["lactose", "beurre"]'::jsonb, '[]'::jsonb),
('e5f6a7b8-c9d0-4123-e456-789012345678', 'Coq au Vin', 'Poulet mijoté au vin rouge avec légumes', 'plat', 95.00, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', true, 50, '[]'::jsonb, '["alcool"]'::jsonb, '[]'::jsonb),
('e5f6a7b8-c9d0-4123-e456-789012345678', 'Boeuf Bourguignon', 'Boeuf braisé au vin rouge avec carottes et champignons', 'plat', 105.00, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', true, 55, '[]'::jsonb, '["alcool"]'::jsonb, '[]'::jsonb),
('e5f6a7b8-c9d0-4123-e456-789012345678', 'Ratatouille', 'Légumes provençaux mijotés', 'plat', 70.00, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', true, 35, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan"]'::jsonb),
('e5f6a7b8-c9d0-4123-e456-789012345678', 'Crème Brûlée', 'Dessert français classique à la vanille', 'dessert', 40.00, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', true, 10, '[]'::jsonb, '["lactose", "oeufs"]'::jsonb, '[]'::jsonb),
('e5f6a7b8-c9d0-4123-e456-789012345678', 'Vin Rouge (verre)', 'Vin rouge de qualité', 'boisson', 35.00, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', true, 2, '[]'::jsonb, '["alcool"]'::jsonb, '[]'::jsonb);

-- Menus pour Spice Garden
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('f6a7b8c9-d0e1-4234-f567-890123456789', 'Chicken Tikka Masala', 'Poulet mariné dans une sauce crémeuse aux épices', 'plat', 85.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop', true, 30, '[{"nom": "Niveau épicé", "options": ["Doux", "Moyen", "Fort"]}]'::jsonb, '["lactose"]'::jsonb, '["halal"]'::jsonb),
('f6a7b8c9-d0e1-4234-f567-890123456789', 'Biryani Poulet', 'Riz basmati épicé avec poulet et légumes', 'plat', 75.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop', true, 35, '[{"nom": "Niveau épicé", "options": ["Doux", "Moyen", "Fort"]}]'::jsonb, '[]'::jsonb, '["halal"]'::jsonb),
('f6a7b8c9-d0e1-4234-f567-890123456789', 'Curry Végétarien', 'Légumes frais dans une sauce curry', 'plat', 65.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop', true, 25, '[{"nom": "Niveau épicé", "options": ["Doux", "Moyen", "Fort"]}]'::jsonb, '[]'::jsonb, '["végétarien", "vegan"]'::jsonb),
('f6a7b8c9-d0e1-4234-f567-890123456789', 'Samosas (3 pièces)', 'Beignets frits aux légumes ou viande', 'entrée', 30.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop', true, 12, '[]'::jsonb, '["gluten"]'::jsonb, '["halal"]'::jsonb),
('f6a7b8c9-d0e1-4234-f567-890123456789', 'Naan', 'Pain indien cuit au four tandoor', 'entrée', 15.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop', true, 8, '[]'::jsonb, '["gluten"]'::jsonb, '["végétarien", "halal"]'::jsonb),
('f6a7b8c9-d0e1-4234-f567-890123456789', 'Lassi Mangue', 'Boisson yogourt à la mangue', 'boisson', 25.00, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '["lactose"]'::jsonb, '["halal"]'::jsonb);

-- Menus pour La Pasta
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('a7b8c9d0-e1f2-4345-a678-901234567890', 'Spaghetti Carbonara', 'Pâtes avec lardons, crème et parmesan', 'plat', 70.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop', true, 18, '[]'::jsonb, '["gluten", "lactose", "oeufs"]'::jsonb, '[]'::jsonb),
('a7b8c9d0-e1f2-4345-a678-901234567890', 'Penne Arrabbiata', 'Pâtes à la sauce tomate épicée', 'plat', 60.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop', true, 15, '[]'::jsonb, '["gluten"]'::jsonb, '["végétarien"]'::jsonb),
('a7b8c9d0-e1f2-4345-a678-901234567890', 'Lasagnes Bolognaise', 'Pâtes feuilletées avec viande et béchamel', 'plat', 80.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop', true, 25, '[]'::jsonb, '["gluten", "lactose"]'::jsonb, '[]'::jsonb),
('a7b8c9d0-e1f2-4345-a678-901234567890', 'Bruschetta', 'Pain grillé avec tomates fraîches et basilic', 'entrée', 35.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop', true, 10, '[]'::jsonb, '["gluten"]'::jsonb, '["végétarien"]'::jsonb),
('a7b8c9d0-e1f2-4345-a678-901234567890', 'Panna Cotta', 'Dessert italien à la vanille', 'dessert', 35.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '["lactose"]'::jsonb, '[]'::jsonb),
('a7b8c9d0-e1f2-4345-a678-901234567890', 'Limonade Maison', 'Limonade fraîche préparée maison', 'boisson', 20.00, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop', true, 3, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan"]'::jsonb);

-- Menus pour Dragon Palace
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('b8c9d0e1-f2a3-4456-a789-012345678901', 'Canard Laqué', 'Canard rôti avec sauce aigre-douce', 'plat', 120.00, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=400&fit=crop', true, 40, '[]'::jsonb, '["soja"]'::jsonb, '[]'::jsonb),
('b8c9d0e1-f2a3-4456-a789-012345678901', 'Nouilles Sautées aux Légumes', 'Nouilles sautées avec légumes frais', 'plat', 65.00, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=400&fit=crop', true, 20, '[]'::jsonb, '["gluten", "soja"]'::jsonb, '["végétarien"]'::jsonb),
('b8c9d0e1-f2a3-4456-a789-012345678901', 'Poulet au Sésame', 'Poulet pané avec sauce au sésame', 'plat', 75.00, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=400&fit=crop', true, 25, '[]'::jsonb, '["soja", "sésame"]'::jsonb, '["halal"]'::jsonb),
('b8c9d0e1-f2a3-4456-a789-012345678901', 'Raviolis Vapeur (6 pièces)', 'Raviolis chinois à la vapeur', 'entrée', 40.00, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=400&fit=crop', true, 15, '[]'::jsonb, '["gluten"]'::jsonb, '[]'::jsonb),
('b8c9d0e1-f2a3-4456-a789-012345678901', 'Riz Frit', 'Riz sauté avec légumes et oeuf', 'plat', 55.00, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=400&fit=crop', true, 18, '[]'::jsonb, '["oeufs", "soja"]'::jsonb, '[]'::jsonb),
('b8c9d0e1-f2a3-4456-a789-012345678901', 'Thé Oolong', 'Thé chinois traditionnel', 'boisson', 18.00, 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&h=400&fit=crop', true, 3, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan"]'::jsonb);

-- Menus pour Le Grill
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('c9d0e1f2-a3b4-4567-a890-123456789012', 'Entrecôte Grillée', 'Entrecôte de boeuf grillée au charbon', 'plat', 140.00, 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop', true, 25, '[{"nom": "Cuisson", "options": ["Saignant", "À point", "Bien cuit"]}]'::jsonb, '[]'::jsonb, '[]'::jsonb),
('c9d0e1f2-a3b4-4567-a890-123456789012', 'Brochettes d''Agneau', 'Brochettes d''agneau marinées aux épices', 'plat', 95.00, 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop', true, 20, '[]'::jsonb, '[]'::jsonb, '["halal"]'::jsonb),
('c9d0e1f2-a3b4-4567-a890-123456789012', 'Poulet Grillé', 'Poulet entier grillé au charbon', 'plat', 85.00, 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop', true, 30, '[]'::jsonb, '[]'::jsonb, '["halal"]'::jsonb),
('c9d0e1f2-a3b4-4567-a890-123456789012', 'Salade Verte', 'Salade mixte avec vinaigrette maison', 'entrée', 35.00, 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop', true, 8, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan"]'::jsonb),
('c9d0e1f2-a3b4-4567-a890-123456789012', 'Frites Maison', 'Pommes de terre frites maison', 'entrée', 25.00, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop', true, 12, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan"]'::jsonb),
('c9d0e1f2-a3b4-4567-a890-123456789012', 'Jus de Fruits Frais', 'Jus pressé du jour', 'boisson', 20.00, 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan"]'::jsonb);

-- Menus pour Sweet Dreams
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url, is_available, preparation_time, options, allergens, dietary_tags) VALUES
('d0e1f2a3-b4c5-4678-a901-234567890123', 'Gâteau au Chocolat', 'Gâteau moelleux au chocolat noir', 'dessert', 45.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '["gluten", "lactose", "oeufs"]'::jsonb, '[]'::jsonb),
('d0e1f2a3-b4c5-4678-a901-234567890123', 'Tarte aux Fraises', 'Tarte avec fraises fraîches et crème', 'dessert', 40.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '["gluten", "lactose"]'::jsonb, '[]'::jsonb),
('d0e1f2a3-b4c5-4678-a901-234567890123', 'Macarons (6 pièces)', 'Macarons aux saveurs variées', 'dessert', 50.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop', true, 3, '[]'::jsonb, '["gluten", "lactose", "oeufs"]'::jsonb, '[]'::jsonb),
('d0e1f2a3-b4c5-4678-a901-234567890123', 'Croissant au Beurre', 'Croissant français traditionnel', 'entrée', 12.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop', true, 2, '[]'::jsonb, '["gluten", "lactose", "beurre"]'::jsonb, '[]'::jsonb),
('d0e1f2a3-b4c5-4678-a901-234567890123', 'Cappuccino', 'Café expresso avec mousse de lait', 'boisson', 25.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop', true, 5, '[]'::jsonb, '["lactose"]'::jsonb, '[]'::jsonb),
('d0e1f2a3-b4c5-4678-a901-234567890123', 'Thé à la Menthe', 'Thé vert à la menthe fraîche', 'boisson', 15.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop', true, 3, '[]'::jsonb, '[]'::jsonb, '["végétarien", "vegan"]'::jsonb);

-- ============================================
-- 3. INSERTION DES UTILISATEURS CLIENTS D'EXEMPLE
-- ============================================

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, language, allergies, dietary_preferences, image_url) VALUES
('1a2b3c4d-5e6f-4789-a012-345678901234', 'ahmed.benali@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Ahmed', 'Benali', '+212 612 345 678', 'fr', '["gluten"]'::jsonb, '["halal"]'::jsonb, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'),
('2b3c4d5e-6f7a-4890-b123-456789012345', 'fatima.alami@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Fatima', 'Alami', '+212 612 456 789', 'ar', '[]'::jsonb, '["halal", "végétarien"]'::jsonb, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces'),
('3c4d5e6f-7a8b-4901-c234-567890123456', 'mohamed.idrissi@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Mohamed', 'Idrissi', '+212 612 567 890', 'fr', '["lactose"]'::jsonb, '["halal"]'::jsonb, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces'),
('4d5e6f7a-8b9c-4012-d345-678901234567', 'sara.bennani@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Sara', 'Bennani', '+212 612 678 901', 'fr', '[]'::jsonb, '["vegan"]'::jsonb, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces'),
('5e6f7a8b-9c0d-4123-e456-789012345678', 'youssef.tazi@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Youssef', 'Tazi', '+212 612 789 012', 'ar', '["poisson"]'::jsonb, '["halal"]'::jsonb, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces'),
('6f7a8b9c-0d1e-4234-f567-890123456789', 'amina.berrada@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Amina', 'Berrada', '+212 612 890 123', 'fr', '["gluten", "lactose"]'::jsonb, '["halal"]'::jsonb, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces'),
('7a8b9c0d-1e2f-4345-a678-901234567890', 'karim.alami@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Karim', 'Alami', '+212 612 901 234', 'fr', '[]'::jsonb, '[]'::jsonb, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces'),
('8b9c0d1e-2f3a-4456-b789-012345678901', 'laila.benjelloun@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Laila', 'Benjelloun', '+212 612 012 345', 'ar', '["oeufs"]'::jsonb, '["halal"]'::jsonb, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces'),
('9c0d1e2f-3a4b-4567-c890-123456789012', 'omar.fassi@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Omar', 'Fassi', '+212 612 123 456', 'fr', '[]'::jsonb, '["halal"]'::jsonb, 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=faces'),
('0d1e2f3a-4b5c-4678-d901-234567890123', 'nadia.chaoui@example.com', '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8', 'Nadia', 'Chaoui', '+212 612 234 567', 'fr', '["noix"]'::jsonb, '["halal", "végétarien"]'::jsonb, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces');

