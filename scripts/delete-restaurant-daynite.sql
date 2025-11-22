-- Script de suppression complète du restaurant "Daynight"
-- Ce script supprime toutes les données associées au restaurant "Daynight"
-- ATTENTION : Cette opération est irréversible !

-- Étape 1 : Trouver l'ID du restaurant "daynite"
DO $$
DECLARE
    restaurant_uuid UUID;
    restaurant_email TEXT;
    restaurant_image_url TEXT;
    restaurant_passport_url TEXT;
BEGIN
    -- Trouver le restaurant par son nom (insensible à la casse)
    SELECT id, email, image_url, passport_document_url 
    INTO restaurant_uuid, restaurant_email, restaurant_image_url, restaurant_passport_url
    FROM restaurants 
    WHERE LOWER(name) = LOWER('daynight')
    LIMIT 1;

    -- Vérifier si le restaurant existe
    IF restaurant_uuid IS NULL THEN
        RAISE NOTICE 'Restaurant "Daynight" introuvable dans la base de données.';
        RETURN;
    END IF;

    RAISE NOTICE 'Restaurant trouvé : ID = %, Email = %', restaurant_uuid, restaurant_email;

    -- Étape 2 : Supprimer les messages de tickets de support associés
    DELETE FROM ticket_messages 
    WHERE ticket_id IN (
        SELECT id FROM support_tickets WHERE restaurant_id = restaurant_uuid
    );
    RAISE NOTICE 'Messages de tickets supprimés';

    -- Étape 3 : Supprimer les tickets de support associés
    DELETE FROM support_tickets 
    WHERE restaurant_id = restaurant_uuid;
    RAISE NOTICE 'Tickets de support supprimés';

    -- Étape 4 : Supprimer les paiements de commission associés
    DELETE FROM commission_payments 
    WHERE restaurant_id = restaurant_uuid;
    RAISE NOTICE 'Paiements de commission supprimés';

    -- Étape 5 : Supprimer les avis associés (les reviews sont liées aux commandes)
    -- Note: Les reviews sont supprimées automatiquement si les orders sont supprimées
    -- mais on les supprime explicitement pour être sûr
    DELETE FROM reviews 
    WHERE restaurant_id = restaurant_uuid;
    RAISE NOTICE 'Avis supprimés';

    -- Étape 6 : Supprimer les favoris associés au restaurant
    DELETE FROM favorites 
    WHERE restaurant_id = restaurant_uuid;
    RAISE NOTICE 'Favoris supprimés';

    -- Étape 7 : Supprimer les favoris associés aux plats du restaurant
    DELETE FROM favorites 
    WHERE menu_item_id IN (
        SELECT id FROM menu_items WHERE restaurant_id = restaurant_uuid
    );
    RAISE NOTICE 'Favoris de plats supprimés';

    -- Étape 8 : Supprimer les promotions associées
    DELETE FROM promotions 
    WHERE restaurant_id = restaurant_uuid;
    RAISE NOTICE 'Promotions supprimées';

    -- Étape 9 : Supprimer les commandes associées
    -- Note: Les commandes peuvent avoir des reviews, donc on les supprime après les reviews
    DELETE FROM orders 
    WHERE restaurant_id = restaurant_uuid;
    RAISE NOTICE 'Commandes supprimées';

    -- Étape 10 : Supprimer les plats du menu (menu_items)
    -- Note: Cette suppression est en CASCADE, mais on la fait explicitement
    DELETE FROM menu_items 
    WHERE restaurant_id = restaurant_uuid;
    RAISE NOTICE 'Plats du menu supprimés';

    -- Étape 11 : Afficher les URLs des fichiers à supprimer manuellement du Storage
    IF restaurant_image_url IS NOT NULL THEN
        RAISE NOTICE 'Image de profil à supprimer du Storage : %', restaurant_image_url;
    END IF;

    IF restaurant_passport_url IS NOT NULL THEN
        RAISE NOTICE 'Document passeport à supprimer du Storage : %', restaurant_passport_url;
    END IF;

    -- Étape 12 : Supprimer le restaurant lui-même
    DELETE FROM restaurants 
    WHERE id = restaurant_uuid;
    RAISE NOTICE 'Restaurant supprimé de la base de données';

    RAISE NOTICE 'Suppression complète terminée pour le restaurant "Daynight" (ID: %)', restaurant_uuid;
    RAISE NOTICE 'IMPORTANT : Vous devez maintenant supprimer manuellement :';
    RAISE NOTICE '1. L''utilisateur Auth dans Supabase Auth (email: %)', restaurant_email;
    RAISE NOTICE '2. Les fichiers dans Supabase Storage (restaurant-images et passports)';
    RAISE NOTICE '3. Les images des plats du menu dans le bucket restaurant-images';

END $$;

-- Vérification : Vérifier qu'il ne reste plus de traces du restaurant
SELECT 
    'Vérification après suppression' as check_type,
    COUNT(*) as remaining_records
FROM restaurants 
WHERE LOWER(name) = LOWER('daynight');

-- Afficher un résumé des données restantes (devrait être 0)
SELECT 
    'menu_items' as table_name,
    COUNT(*) as count
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE LOWER(r.name) = LOWER('daynite')
UNION ALL
SELECT 
    'orders' as table_name,
    COUNT(*) as count
FROM orders o
JOIN restaurants r ON o.restaurant_id = r.id
WHERE LOWER(r.name) = LOWER('daynite')
UNION ALL
SELECT 
    'reviews' as table_name,
    COUNT(*) as count
FROM reviews rev
JOIN restaurants r ON rev.restaurant_id = r.id
WHERE LOWER(r.name) = LOWER('daynite')
UNION ALL
SELECT 
    'promotions' as table_name,
    COUNT(*) as count
FROM promotions p
JOIN restaurants r ON p.restaurant_id = r.id
WHERE LOWER(r.name) = LOWER('daynite')
UNION ALL
SELECT 
    'favorites' as table_name,
    COUNT(*) as count
FROM favorites f
JOIN restaurants r ON f.restaurant_id = r.id
WHERE LOWER(r.name) = LOWER('daynite');

