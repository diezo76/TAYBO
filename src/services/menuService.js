/**
 * Service pour la gestion du menu des restaurants
 * 
 * Ce service gère toutes les opérations CRUD sur les plats du menu :
 * - Récupération de tous les plats (disponibles et indisponibles)
 * - Création d'un nouveau plat
 * - Mise à jour d'un plat
 * - Suppression d'un plat
 * - Activation/désactivation d'un plat
 * - Upload d'image pour un plat
 */

import { supabase } from './supabase';
import cacheService from './cacheService';

/**
 * Récupère tous les plats du menu d'un restaurant (disponibles et indisponibles)
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Array>} - Liste des plats du menu
 */
export async function getAllMenuItems(restaurantId) {
  const cacheKey = cacheService.generateKey('menu_items_all', restaurantId);
  
  return cacheService.getOrSet(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur récupération menu:', error);
      return [];
    }
  }, 2 * 60 * 1000); // Cache de 2 minutes
}

/**
 * Récupère un plat par son ID
 * @param {string} menuItemId - ID du plat
 * @returns {Promise<Object|null>} - Plat ou null
 */
export async function getMenuItemById(menuItemId) {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', menuItemId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur récupération plat:', error);
    return null;
  }
}

/**
 * Crée un nouveau plat dans le menu
 * @param {Object} menuItemData - Données du plat
 * @param {string} menuItemData.restaurant_id - ID du restaurant
 * @param {string} menuItemData.name - Nom du plat
 * @param {string} menuItemData.description - Description
 * @param {string} menuItemData.category - Catégorie (entrée, plat, dessert, boisson)
 * @param {number} menuItemData.price - Prix
 * @param {string} menuItemData.image_url - URL de l'image (optionnel)
 * @param {number} menuItemData.preparation_time - Temps de préparation en minutes
 * @param {Array} menuItemData.options - Options (tailles, extras, etc.)
 * @param {Array} menuItemData.allergens - Allergènes
 * @param {Array} menuItemData.dietary_tags - Tags diététiques (vegan, halal, etc.)
 * @returns {Promise<Object>} - Résultat de la création
 */
export async function createMenuItem(menuItemData) {
  // Invalider le cache du menu après création
  const invalidateCache = () => {
    cacheService.invalidate('menu_items_all');
    cacheService.invalidate('menu');
  };
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([
        {
          restaurant_id: menuItemData.restaurant_id,
          name: menuItemData.name,
          description: menuItemData.description || null,
          category: menuItemData.category,
          price: menuItemData.price,
          image_url: menuItemData.image_url || null,
          is_available: menuItemData.is_available !== undefined ? menuItemData.is_available : true,
          preparation_time: menuItemData.preparation_time || 15,
          options: menuItemData.options || [],
          allergens: menuItemData.allergens || [],
          dietary_tags: menuItemData.dietary_tags || [],
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Invalider le cache après création
    invalidateCache();

    return {
      success: true,
      menuItem: data,
    };
  } catch (error) {
    console.error('Erreur création plat:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la création du plat',
    };
  }
}

/**
 * Met à jour un plat du menu
 * @param {string} menuItemId - ID du plat
 * @param {Object} updates - Données à mettre à jour
 * @returns {Promise<Object>} - Résultat de la mise à jour
 */
export async function updateMenuItem(menuItemId, updates) {
  // Invalider le cache du menu après mise à jour
  const invalidateCache = () => {
    cacheService.invalidate('menu_items_all');
    cacheService.invalidate('menu');
  };
  
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', menuItemId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Invalider le cache après mise à jour
    invalidateCache();

    return {
      success: true,
      menuItem: data,
    };
  } catch (error) {
    console.error('Erreur mise à jour plat:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la mise à jour du plat',
    };
  }
}

/**
 * Supprime un plat du menu
 * @param {string} menuItemId - ID du plat
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export async function deleteMenuItem(menuItemId) {
  // Invalider le cache du menu après suppression
  const invalidateCache = () => {
    cacheService.invalidate('menu_items_all');
    cacheService.invalidate('menu');
  };
  
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', menuItemId);

    if (error) {
      throw error;
    }

    // Invalider le cache après suppression
    invalidateCache();

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur suppression plat:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la suppression du plat',
    };
  }
}

/**
 * Active ou désactive un plat
 * @param {string} menuItemId - ID du plat
 * @param {boolean} isAvailable - Nouveau statut de disponibilité
 * @returns {Promise<Object>} - Résultat de la mise à jour
 */
export async function toggleMenuItemAvailability(menuItemId, isAvailable) {
  return updateMenuItem(menuItemId, { is_available: isAvailable });
}

/**
 * Upload une image pour un plat
 * @param {string} restaurantId - ID du restaurant
 * @param {File} file - Fichier image
 * @returns {Promise<Object>} - URL de l'image ou erreur
 */
export async function uploadMenuItemImage(restaurantId, file) {
  try {
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
    const filePath = `menu-items/${fileName}`;

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Erreur upload image:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de l\'upload de l\'image',
    };
  }
}

