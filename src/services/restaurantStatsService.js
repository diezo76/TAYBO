/**
 * Service pour les statistiques des restaurants
 * 
 * Ce service gère toutes les opérations liées aux statistiques d'un restaurant :
 * - Statistiques des commandes (aujourd'hui, hebdomadaire, en attente)
 * - Revenus (hebdomadaire, mensuel)
 * - Statistiques générales
 */

import { supabase } from './supabase';

/**
 * Récupère les statistiques d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Object>} - Objet contenant les statistiques
 */
export async function getRestaurantStats(restaurantId) {
  try {
    // Date du début de la journée (aujourd'hui à 00:00:00)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Date de début de la semaine (lundi à 00:00:00)
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = 0
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);

    // Récupérer les commandes d'aujourd'hui
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('id, total, status')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', todayStart.toISOString());

    if (todayError) {
      throw todayError;
    }

    // Récupérer les commandes de la semaine
    const { data: weekOrders, error: weekError } = await supabase
      .from('orders')
      .select('id, total, status')
      .eq('restaurant_id', restaurantId)
      .gte('created_at', weekStart.toISOString());

    if (weekError) {
      throw weekError;
    }

    // Récupérer les commandes en attente
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'pending');

    if (pendingError) {
      throw pendingError;
    }

    // Calculer les statistiques
    const todayOrdersCount = todayOrders?.length || 0;
    const weekRevenue = weekOrders?.reduce((sum, order) => {
      // Ne compter que les commandes complétées ou en cours
      if (order.status === 'completed' || order.status === 'preparing' || order.status === 'ready' || order.status === 'out_for_delivery') {
        return sum + (order.total || 0);
      }
      return sum;
    }, 0) || 0;
    const pendingOrdersCount = pendingOrders?.length || 0;

    return {
      todayOrders: todayOrdersCount,
      weekRevenue: weekRevenue,
      pendingOrders: pendingOrdersCount,
    };
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    return {
      todayOrders: 0,
      weekRevenue: 0,
      pendingOrders: 0,
    };
  }
}

/**
 * Récupère les commandes d'un restaurant avec filtres
 * @param {string} restaurantId - ID du restaurant
 * @param {Object} filters - Filtres optionnels
 * @param {string} filters.status - Statut de la commande (pending, preparing, ready, etc.)
 * @param {number} filters.limit - Nombre maximum de résultats
 * @returns {Promise<Array>} - Liste des commandes
 */
export async function getRestaurantOrders(restaurantId, filters = {}) {
  try {
    // Sélectionner uniquement les champs nécessaires pour éviter de charger trop de données
    let query = supabase
      .from('orders')
      .select('id, user_id, restaurant_id, items, subtotal, delivery_fee, total, payment_method, payment_status, status, scheduled_delivery_time, created_at, updated_at, users(id, first_name, last_name, phone)')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erreur récupération commandes restaurant:', error);
    return [];
  }
}

/**
 * Met à jour le statut d'une commande
 * @param {string} orderId - ID de la commande
 * @param {string} status - Nouveau statut (pending, accepted, preparing, ready, delivering, delivered, cancelled)
 * @returns {Promise<Object>} - Résultat de la mise à jour
 */
export async function updateOrderStatus(orderId, status) {
  // Import dynamique pour éviter les dépendances circulaires
  const cacheService = (await import('./cacheService')).default;
  
  // Invalider le cache des commandes après mise à jour
  const invalidateCache = () => {
    cacheService.invalidate('user_orders');
    cacheService.invalidate('restaurant_orders');
  };
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Invalider le cache après mise à jour
    invalidateCache();

    return {
      success: true,
      order: data,
    };
  } catch (error) {
    console.error('Erreur mise à jour statut commande:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la mise à jour du statut',
    };
  }
}

