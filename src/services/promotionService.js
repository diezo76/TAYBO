/**
 * Service pour la gestion des promotions
 * 
 * Ce service gère toutes les opérations CRUD liées aux promotions des restaurants :
 * - Créer une promotion
 * - Récupérer les promotions d'un restaurant
 * - Mettre à jour une promotion
 * - Supprimer une promotion
 * - Activer/désactiver une promotion
 */

import { supabase } from './supabase';

/**
 * Récupère toutes les promotions d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @param {Object} options - Options de filtrage
 * @param {boolean} options.activeOnly - Récupérer uniquement les promotions actives
 * @returns {Promise<Array>} - Liste des promotions
 */
export async function getRestaurantPromotions(restaurantId, options = {}) {
  try {
    let query = supabase
      .from('promotions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (options.activeOnly) {
      const now = new Date().toISOString();
      query = query
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now);
    }

    const { data, error } = await query;

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
 * Récupère une promotion par son ID
 * @param {string} promotionId - ID de la promotion
 * @returns {Promise<Object|null>} - Promotion ou null
 */
export async function getPromotionById(promotionId) {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', promotionId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur récupération promotion:', error);
    return null;
  }
}

/**
 * Crée une nouvelle promotion
 * @param {Object} promotionData - Données de la promotion
 * @param {string} promotionData.restaurantId - ID du restaurant
 * @param {string} promotionData.title - Titre de la promotion
 * @param {string} promotionData.description - Description (optionnel)
 * @param {number} promotionData.discountPercentage - Pourcentage de réduction (0-100)
 * @param {Date|string} promotionData.startDate - Date de début
 * @param {Date|string} promotionData.endDate - Date de fin
 * @param {boolean} promotionData.isActive - Actif ou non (défaut: true)
 * @returns {Promise<Object>} - Résultat de la création
 */
export async function createPromotion(promotionData) {
  try {
    // Validation des dates
    const startDate = new Date(promotionData.startDate);
    const endDate = new Date(promotionData.endDate);
    
    if (endDate <= startDate) {
      return {
        success: false,
        error: 'La date de fin doit être postérieure à la date de début',
      };
    }

    // Validation du pourcentage
    if (promotionData.discountPercentage < 0 || promotionData.discountPercentage > 100) {
      return {
        success: false,
        error: 'Le pourcentage de réduction doit être entre 0 et 100',
      };
    }

    const { data, error } = await supabase
      .from('promotions')
      .insert([
        {
          restaurant_id: promotionData.restaurantId,
          title: promotionData.title,
          description: promotionData.description || null,
          discount_percentage: promotionData.discountPercentage,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: promotionData.isActive !== undefined ? promotionData.isActive : true,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      promotion: data,
    };
  } catch (error) {
    console.error('Erreur création promotion:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la création de la promotion',
    };
  }
}

/**
 * Met à jour une promotion existante
 * @param {string} promotionId - ID de la promotion
 * @param {Object} updates - Données à mettre à jour
 * @param {string} updates.title - Titre (optionnel)
 * @param {string} updates.description - Description (optionnel)
 * @param {number} updates.discountPercentage - Pourcentage de réduction (optionnel)
 * @param {Date|string} updates.startDate - Date de début (optionnel)
 * @param {Date|string} updates.endDate - Date de fin (optionnel)
 * @param {boolean} updates.isActive - Actif ou non (optionnel)
 * @returns {Promise<Object>} - Résultat de la mise à jour
 */
export async function updatePromotion(promotionId, updates) {
  try {
    const updateData = {};

    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description || null;
    }
    if (updates.discountPercentage !== undefined) {
      if (updates.discountPercentage < 0 || updates.discountPercentage > 100) {
        return {
          success: false,
          error: 'Le pourcentage de réduction doit être entre 0 et 100',
        };
      }
      updateData.discount_percentage = updates.discountPercentage;
    }
    if (updates.startDate !== undefined) {
      updateData.start_date = new Date(updates.startDate).toISOString();
    }
    if (updates.endDate !== undefined) {
      updateData.end_date = new Date(updates.endDate).toISOString();
    }
    if (updates.isActive !== undefined) {
      updateData.is_active = updates.isActive;
    }

    // Validation des dates si les deux sont présentes
    if (updateData.start_date && updateData.end_date) {
      const startDate = new Date(updateData.start_date);
      const endDate = new Date(updateData.end_date);
      if (endDate <= startDate) {
        return {
          success: false,
          error: 'La date de fin doit être postérieure à la date de début',
        };
      }
    }

    const { data, error } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', promotionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      promotion: data,
    };
  } catch (error) {
    console.error('Erreur mise à jour promotion:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la mise à jour de la promotion',
    };
  }
}

/**
 * Supprime une promotion
 * @param {string} promotionId - ID de la promotion
 * @returns {Promise<Object>} - Résultat de la suppression
 */
export async function deletePromotion(promotionId) {
  try {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', promotionId);

    if (error) {
      throw error;
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur suppression promotion:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la suppression de la promotion',
    };
  }
}

/**
 * Active ou désactive une promotion
 * @param {string} promotionId - ID de la promotion
 * @param {boolean} isActive - Nouveau statut
 * @returns {Promise<Object>} - Résultat de la mise à jour
 */
export async function togglePromotionStatus(promotionId, isActive) {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .update({ is_active: isActive })
      .eq('id', promotionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      promotion: data,
    };
  } catch (error) {
    console.error('Erreur changement statut promotion:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors du changement de statut',
    };
  }
}

