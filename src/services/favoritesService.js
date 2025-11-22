/**
 * Service pour les favoris
 * 
 * Ce service gère toutes les opérations liées aux favoris :
 * - Ajouter un restaurant ou un plat aux favoris
 * - Supprimer un favori
 * - Récupérer tous les favoris d'un utilisateur
 * - Vérifier si un restaurant ou plat est en favoris
 */

import { supabase } from './supabase';

/**
 * Récupère tous les favoris d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des favoris avec les détails des restaurants/plats
 */
export async function getUserFavorites(userId) {
  try {
    // Récupérer les favoris restaurants
    const { data: restaurantFavorites, error: restaurantError } = await supabase
      .from('favorites')
      .select(`
        id,
        restaurant_id,
        created_at,
        restaurants (
          id,
          name,
          description,
          cuisine_type,
          image_url,
          average_rating,
          total_reviews,
          delivery_fee
        )
      `)
      .eq('user_id', userId)
      .not('restaurant_id', 'is', null)
      .order('created_at', { ascending: false });

    if (restaurantError) {
      throw restaurantError;
    }

    // Récupérer les favoris plats
    const { data: menuItemFavorites, error: menuItemError } = await supabase
      .from('favorites')
      .select(`
        id,
        menu_item_id,
        created_at,
        menu_items (
          id,
          name,
          description,
          price,
          image_url,
          category,
          restaurant_id,
          restaurants (
            id,
            name
          )
        )
      `)
      .eq('user_id', userId)
      .not('menu_item_id', 'is', null)
      .order('created_at', { ascending: false });

    if (menuItemError) {
      throw menuItemError;
    }

    return {
      restaurants: restaurantFavorites || [],
      menuItems: menuItemFavorites || [],
    };
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    return {
      restaurants: [],
      menuItems: [],
    };
  }
}

/**
 * Ajoute un restaurant aux favoris
 * @param {string} userId - ID de l'utilisateur
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Object|null>} - Favori créé ou null
 */
export async function addRestaurantToFavorites(userId, restaurantId) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        restaurant_id: restaurantId,
        menu_item_id: null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur ajout restaurant aux favoris:', error);
    throw error;
  }
}

/**
 * Ajoute un plat aux favoris
 * @param {string} userId - ID de l'utilisateur
 * @param {string} menuItemId - ID du plat
 * @returns {Promise<Object|null>} - Favori créé ou null
 */
export async function addMenuItemToFavorites(userId, menuItemId) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        restaurant_id: null,
        menu_item_id: menuItemId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur ajout plat aux favoris:', error);
    throw error;
  }
}

/**
 * Supprime un favori
 * @param {string} favoriteId - ID du favori
 * @returns {Promise<boolean>} - True si supprimé avec succès
 */
export async function removeFavorite(favoriteId) {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur suppression favori:', error);
    throw error;
  }
}

/**
 * Supprime un favori restaurant
 * @param {string} userId - ID de l'utilisateur
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<boolean>} - True si supprimé avec succès
 */
export async function removeRestaurantFromFavorites(userId, restaurantId) {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur suppression restaurant des favoris:', error);
    throw error;
  }
}

/**
 * Supprime un favori plat
 * @param {string} userId - ID de l'utilisateur
 * @param {string} menuItemId - ID du plat
 * @returns {Promise<boolean>} - True si supprimé avec succès
 */
export async function removeMenuItemFromFavorites(userId, menuItemId) {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur suppression plat des favoris:', error);
    throw error;
  }
}

/**
 * Vérifie si un restaurant est en favoris
 * @param {string} userId - ID de l'utilisateur
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<boolean>} - True si en favoris
 */
export async function isRestaurantFavorite(userId, restaurantId) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .limit(1);

    if (error) {
      throw error;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Erreur vérification favori restaurant:', error);
    return false;
  }
}

/**
 * Vérifie si un plat est en favoris
 * @param {string} userId - ID de l'utilisateur
 * @param {string} menuItemId - ID du plat
 * @returns {Promise<boolean>} - True si en favoris
 */
export async function isMenuItemFavorite(userId, menuItemId) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId)
      .limit(1);

    if (error) {
      throw error;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Erreur vérification favori plat:', error);
    return false;
  }
}

