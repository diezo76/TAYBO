/**
 * Service pour la gestion des avis et notes
 * 
 * Ce service gère toutes les opérations liées aux avis :
 * - Création d'avis après commande livrée
 * - Récupération des avis d'un restaurant
 * - Mise à jour et suppression d'avis
 */

import { supabase } from './supabase';

/**
 * Récupère tous les avis d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Array>} - Liste des avis avec informations utilisateur
 */
export async function getRestaurantReviews(restaurantId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        user_id,
        order_id,
        rating,
        comment,
        created_at,
        users(id, first_name, last_name)
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erreur récupération avis:', error);
    throw error;
  }
}

/**
 * Récupère un avis par son ID
 * @param {string} reviewId - ID de l'avis
 * @returns {Promise<Object>} - Avis
 */
export async function getReviewById(reviewId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur récupération avis:', error);
    throw error;
  }
}

/**
 * Vérifie si un utilisateur peut laisser un avis pour une commande
 * @param {string} userId - ID de l'utilisateur
 * @param {string} orderId - ID de la commande
 * @returns {Promise<boolean>} - True si l'utilisateur peut laisser un avis
 */
export async function canUserReviewOrder(userId, orderId) {
  try {
    // Vérifier que la commande existe et est livrée
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return false;
    }

    // Vérifier que la commande appartient à l'utilisateur
    if (order.user_id !== userId) {
      return false;
    }

    // Vérifier que la commande est livrée
    if (order.status !== 'delivered') {
      return false;
    }

    // Vérifier qu'il n'y a pas déjà un avis pour cette commande
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', orderId)
      .single();

    // Si une erreur (pas d'avis existant), c'est bon
    if (reviewError && reviewError.code === 'PGRST116') {
      return true;
    }

    // Si un avis existe déjà, l'utilisateur ne peut pas en créer un nouveau
    return false;
  } catch (error) {
    console.error('Erreur vérification avis:', error);
    return false;
  }
}

/**
 * Crée un nouvel avis
 * @param {Object} reviewData - Données de l'avis
 * @param {string} reviewData.userId - ID de l'utilisateur
 * @param {string} reviewData.restaurantId - ID du restaurant
 * @param {string} reviewData.orderId - ID de la commande
 * @param {number} reviewData.rating - Note (1-5)
 * @param {string} [reviewData.comment] - Commentaire (optionnel)
 * @returns {Promise<Object>} - Avis créé
 */
export async function createReview(reviewData) {
  try {
    // Vérifier que l'utilisateur peut laisser un avis
    const canReview = await canUserReviewOrder(reviewData.userId, reviewData.orderId);
    if (!canReview) {
      throw new Error('Vous ne pouvez pas laisser un avis pour cette commande');
    }

    // Valider la note
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('La note doit être entre 1 et 5');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        user_id: reviewData.userId,
        restaurant_id: reviewData.restaurantId,
        order_id: reviewData.orderId,
        rating: reviewData.rating,
        comment: reviewData.comment || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // La note moyenne sera mise à jour automatiquement par le trigger SQL
    return data;
  } catch (error) {
    console.error('Erreur création avis:', error);
    throw error;
  }
}

/**
 * Met à jour un avis existant
 * @param {string} reviewId - ID de l'avis
 * @param {Object} updates - Mises à jour
 * @param {number} [updates.rating] - Nouvelle note
 * @param {string} [updates.comment] - Nouveau commentaire
 * @returns {Promise<Object>} - Avis mis à jour
 */
export async function updateReview(reviewId, updates) {
  try {
    // Valider la note si fournie
    if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
      throw new Error('La note doit être entre 1 et 5');
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // La note moyenne sera mise à jour automatiquement par le trigger SQL
    return data;
  } catch (error) {
    console.error('Erreur mise à jour avis:', error);
    throw error;
  }
}

/**
 * Supprime un avis
 * @param {string} reviewId - ID de l'avis
 * @returns {Promise<void>}
 */
export async function deleteReview(reviewId) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      throw error;
    }

    // La note moyenne sera mise à jour automatiquement par le trigger SQL
  } catch (error) {
    console.error('Erreur suppression avis:', error);
    throw error;
  }
}

/**
 * Récupère l'avis d'un utilisateur pour une commande spécifique
 * @param {string} userId - ID de l'utilisateur
 * @param {string} orderId - ID de la commande
 * @returns {Promise<Object|null>} - Avis ou null
 */
export async function getUserReviewForOrder(userId, orderId) {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('order_id', orderId)
      .single();

    if (error && error.code === 'PGRST116') {
      return null; // Pas d'avis trouvé
    }

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur récupération avis utilisateur:', error);
    throw error;
  }
}

