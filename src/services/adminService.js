/**
 * Service pour les fonctionnalités admin
 * 
 * Ce service gère toutes les opérations liées à l'administration :
 * - Statistiques générales (KPIs)
 * - Gestion des restaurants
 * - Gestion des clients
 * - Gestion des commandes
 */

import { supabase } from './supabase';

/**
 * Récupère les statistiques générales pour le dashboard admin
 * @returns {Promise<Object>} - Objet contenant les statistiques
 */
export async function getAdminStats() {
  try {
    // Récupérer le nombre total de restaurants
    const { count: totalRestaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });

    if (restaurantsError) {
      throw restaurantsError;
    }

    // Récupérer le nombre de restaurants en attente de validation
    const { count: pendingRestaurants, error: pendingError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false);

    if (pendingError) {
      throw pendingError;
    }

    // Récupérer le nombre total de clients
    const { count: totalClients, error: clientsError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .neq('email', 'admin@taybo.com'); // Exclure l'admin

    if (clientsError) {
      throw clientsError;
    }

    // Récupérer le nombre total de commandes
    const { count: totalOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (ordersError) {
      throw ordersError;
    }

    // Récupérer les commandes en attente
    const { count: pendingOrders, error: pendingOrdersError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (pendingOrdersError) {
      throw pendingOrdersError;
    }

    // Récupérer les revenus totaux (somme de tous les totaux des commandes)
    const { data: allOrders, error: revenueError } = await supabase
      .from('orders')
      .select('total, status');

    if (revenueError) {
      throw revenueError;
    }

    // Calculer les revenus totaux (seulement les commandes livrées)
    const totalRevenue = allOrders
      ?.filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0;

    // Récupérer les revenus de la semaine
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = 0
    weekStart.setDate(weekStart.getDate() - diff);
    weekStart.setHours(0, 0, 0, 0);

    const { data: weekOrders, error: weekError } = await supabase
      .from('orders')
      .select('total, status')
      .gte('created_at', weekStart.toISOString());

    if (weekError) {
      throw weekError;
    }

    const weekRevenue = weekOrders
      ?.filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0;

    return {
      totalRestaurants: totalRestaurants || 0,
      pendingRestaurants: pendingRestaurants || 0,
      totalClients: totalClients || 0,
      totalOrders: totalOrders || 0,
      pendingOrders: pendingOrders || 0,
      totalRevenue: totalRevenue,
      weekRevenue: weekRevenue,
    };
  } catch (error) {
    console.error('Erreur récupération statistiques admin:', error);
    throw error;
  }
}

/**
 * Récupère tous les restaurants avec filtres
 * @param {Object} filters - Filtres optionnels
 * @param {boolean} filters.verified - Filtrer par statut de vérification
 * @param {boolean} filters.active - Filtrer par statut actif
 * @returns {Promise<Array>} - Liste des restaurants
 */
export async function getAllRestaurants(filters = {}) {
  try {
    let query = supabase
      .from('restaurants')
      .select('id, email, name, description, cuisine_type, address, phone, delivery_fee, is_verified, is_active, average_rating, total_reviews, created_at, passport_document_url, image_url')
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.verified !== undefined) {
      query = query.eq('is_verified', filters.verified);
    }

    if (filters.active !== undefined) {
      query = query.eq('is_active', filters.active);
    }

    const { data, error } = await query;

    if (error) {
      // Log détaillé de l'erreur pour diagnostic
      console.error('Erreur détaillée récupération restaurants:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status: error.status || error.statusCode,
        filters
      });
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erreur récupération restaurants:', error);
    throw error;
  }
}

/**
 * Met à jour le statut d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @param {Object} updates - Mises à jour à appliquer
 * @param {boolean} [updates.is_verified] - Statut de vérification
 * @param {boolean} [updates.is_active] - Statut actif
 * @returns {Promise<Object>} - Restaurant mis à jour
 */
export async function updateRestaurantStatus(restaurantId, updates) {
  try {
    // Vérifier que l'ID est valide
    if (!restaurantId || typeof restaurantId !== 'string') {
      throw new Error('ID de restaurant invalide');
    }

    // Vérifier d'abord si le restaurant existe
    const { data: existingRestaurant, error: checkError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur vérification restaurant:', checkError);
      throw checkError;
    }

    if (!existingRestaurant) {
      throw new Error(`Restaurant avec l'ID ${restaurantId} introuvable`);
    }

    // Effectuer la mise à jour
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select('id, email, name, description, cuisine_type, address, phone, delivery_fee, is_verified, is_active, average_rating, total_reviews, image_url, created_at')
      .maybeSingle();

    if (error) {
      // Log détaillé de l'erreur pour diagnostic
      console.error('Erreur détaillée mise à jour restaurant:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status: error.status || error.statusCode,
        restaurantId,
        updates
      });
      throw error;
    }

    if (!data) {
      throw new Error(`Aucune ligne mise à jour pour le restaurant ${restaurantId}. Vérifiez les permissions RLS.`);
    }

    return data;
  } catch (error) {
    console.error('Erreur mise à jour restaurant:', error);
    throw error;
  }
}

/**
 * Met à jour toutes les informations d'un restaurant
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
export async function updateRestaurant(restaurantId, updates) {
  try {
    // Vérifier que l'ID est valide
    if (!restaurantId || typeof restaurantId !== 'string') {
      throw new Error('ID de restaurant invalide');
    }

    // Vérifier d'abord si le restaurant existe
    const { data: existingRestaurant, error: checkError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .maybeSingle();

    if (checkError) {
      console.error('Erreur vérification restaurant:', checkError);
      throw checkError;
    }

    if (!existingRestaurant) {
      throw new Error(`Restaurant avec l'ID ${restaurantId} introuvable`);
    }

    // Effectuer la mise à jour
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select('id, email, name, description, cuisine_type, address, phone, delivery_fee, is_verified, is_active, average_rating, total_reviews, image_url, created_at')
      .maybeSingle();

    if (error) {
      // Log détaillé de l'erreur pour diagnostic
      console.error('Erreur détaillée mise à jour restaurant:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        status: error.status || error.statusCode,
        restaurantId,
        updates
      });
      throw error;
    }

    if (!data) {
      throw new Error(`Aucune ligne mise à jour pour le restaurant ${restaurantId}. Vérifiez les permissions RLS.`);
    }

    return data;
  } catch (error) {
    console.error('Erreur mise à jour restaurant:', error);
    throw error;
  }
}

/**
 * Récupère tous les clients
 * @param {Object} filters - Filtres optionnels
 * @param {string} filters.search - Recherche par nom ou email
 * @returns {Promise<Array>} - Liste des clients
 */
export async function getAllClients(filters = {}) {
  try {
    let query = supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, language, created_at')
      .neq('email', 'admin@taybo.com') // Exclure l'admin
      .order('created_at', { ascending: false });

    // Appliquer les filtres de recherche
    if (filters.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erreur récupération clients:', error);
    throw error;
  }
}

/**
 * Récupère toutes les commandes avec filtres
 * @param {Object} filters - Filtres optionnels
 * @param {string} filters.status - Filtrer par statut
 * @param {string} filters.restaurantId - Filtrer par restaurant
 * @param {string} filters.userId - Filtrer par client
 * @returns {Promise<Array>} - Liste des commandes
 */
export async function getAllOrders(filters = {}) {
  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        user_id,
        restaurant_id,
        status,
        items,
        subtotal,
        delivery_fee,
        total,
        payment_method,
        payment_status,
        scheduled_delivery_time,
        created_at,
        updated_at,
        users:user_id(id, first_name, last_name, email),
        restaurants:restaurant_id(id, name, email)
      `)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.restaurantId) {
      query = query.eq('restaurant_id', filters.restaurantId);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    throw error;
  }
}

