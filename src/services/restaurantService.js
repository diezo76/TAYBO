/**
 * Service pour les restaurants
 * 
 * Ce service gère toutes les opérations liées aux restaurants :
 * - Récupération de la liste des restaurants
 * - Récupération des détails d'un restaurant
 * - Recherche et filtres
 */

import { supabase } from './supabase';
import cacheService from './cacheService';

/**
 * Récupère tous les restaurants actifs et vérifiés
 * @param {Object} filters - Filtres optionnels
 * @param {string} filters.cuisineType - Type de cuisine
 * @param {number} filters.minRating - Note minimum
 * @param {string} filters.search - Recherche par nom
 * @returns {Promise<Array>} - Liste des restaurants
 */
export async function getRestaurants(filters = {}) {
  const cacheKey = cacheService.generateKey('restaurants', filters);
  
  return cacheService.getOrSet(cacheKey, async () => {
    try {
      // Sélectionner uniquement les champs nécessaires pour la liste
      let query = supabase
        .from('restaurants')
        .select('id, name, description, cuisine_type, delivery_fee, average_rating, total_reviews, image_url, is_active, is_verified')
        .eq('is_active', true)
        .eq('is_verified', true);

      // Appliquer les filtres
      if (filters.cuisineType) {
        query = query.eq('cuisine_type', filters.cuisineType);
      }

      if (filters.minRating) {
        query = query.gte('average_rating', filters.minRating);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query.order('average_rating', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur récupération restaurants:', error);
      return [];
    }
  }, 3 * 60 * 1000); // Cache de 3 minutes pour les restaurants
}

/**
 * Récupère un restaurant par son ID
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Object|null>} - Restaurant ou null
 */
export async function getRestaurantById(restaurantId) {
  const cacheKey = cacheService.generateKey('restaurant', restaurantId);
  
  return cacheService.getOrSet(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .eq('is_active', true)
        .eq('is_verified', true)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur récupération restaurant:', error);
      return null;
    }
  }, 5 * 60 * 1000); // Cache de 5 minutes pour un restaurant spécifique
}

/**
 * Récupère le menu d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Array>} - Liste des plats du menu
 */
export async function getRestaurantMenu(restaurantId) {
  const cacheKey = cacheService.generateKey('menu', restaurantId);
  
  return cacheService.getOrSet(cacheKey, async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true)
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
  }, 2 * 60 * 1000); // Cache de 2 minutes pour les menus
}

/**
 * Récupère les promotions actives d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Array>} - Liste des promotions
 */
export async function getRestaurantPromotions(restaurantId) {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('discount_percentage', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erreur récupération promotions:', error);
    return [];
  }
}

/**
 * Met à jour le profil d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @param {Object} updates - Mises à jour à appliquer
 * @param {string} [updates.name] - Nom du restaurant
 * @param {string} [updates.email] - Email du restaurant
 * @param {string} [updates.description] - Description
 * @param {string} [updates.cuisine_type] - Type de cuisine
 * @param {string} [updates.address] - Adresse
 * @param {string} [updates.phone] - Téléphone
 * @param {number} [updates.delivery_fee] - Frais de livraison
 * @param {string} [updates.image_url] - URL de l'image de profil
 * @returns {Promise<Object>} - Restaurant mis à jour
 */
export async function updateRestaurantProfile(restaurantId, updates) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur mise à jour profil restaurant:', error);
    throw error;
  }
}

/**
 * Upload une image de profil pour un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @param {File} file - Fichier image
 * @returns {Promise<Object>} - URL de l'image ou erreur
 */
export async function uploadRestaurantImage(restaurantId, file) {
  try {
    // Valider le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP.');
    }

    // Valider la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('L\'image est trop grande. Taille maximum : 5MB.');
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Supprimer l'ancienne image si elle existe
    const { data: currentRestaurant } = await supabase
      .from('restaurants')
      .select('image_url')
      .eq('id', restaurantId)
      .single();

    if (currentRestaurant?.image_url) {
      // Extraire le chemin du fichier de l'URL
      const urlParts = currentRestaurant.image_url.split('/restaurant-images/');
      if (urlParts.length > 1) {
        const oldPath = urlParts[1].split('?')[0]; // Enlever les query params
        if (oldPath) {
          await supabase.storage
            .from('restaurant-images')
            .remove([oldPath]);
        }
      }
    }

    // Déterminer le type MIME correct selon l'extension
    let contentType = file.type;
    if (!contentType || contentType === 'application/json' || contentType === 'application/octet-stream') {
      // Forcer le bon type MIME selon l'extension
      const ext = fileExt.toLowerCase();
      if (ext === 'jpg' || ext === 'jpeg') {
        contentType = 'image/jpeg';
      } else if (ext === 'png') {
        contentType = 'image/png';
      } else if (ext === 'webp') {
        contentType = 'image/webp';
      } else {
        contentType = 'image/jpeg'; // Par défaut
      }
    }

    // CORRECTION : Créer un nouveau Blob avec le bon MIME type
    // Car Supabase ignore parfois l'option contentType
    const fileBlob = new Blob([file], { type: contentType });

    // Upload vers Supabase Storage avec le bon type MIME
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('restaurant-images')
      .upload(filePath, fileBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType, // Forcer le bon type MIME
      });

    if (uploadError) {
      throw uploadError;
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('restaurant-images')
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

/**
 * Désactive le compte d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Object>} - Restaurant désactivé
 */
export async function deactivateRestaurantAccount(restaurantId) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update({ is_active: false })
      .eq('id', restaurantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur désactivation compte restaurant:', error);
    throw error;
  }
}


