/**
 * Service pour les commandes
 * 
 * Gère la création et la gestion des commandes.
 */

import { supabase } from './supabase';
import cacheService from './cacheService';

/**
 * Crée une nouvelle commande
 * @param {Object} orderData - Données de la commande
 * @param {string} orderData.userId - ID de l'utilisateur
 * @param {string} orderData.restaurantId - ID du restaurant
 * @param {Array} orderData.items - Articles de la commande
 * @param {number} orderData.subtotal - Sous-total
 * @param {number} orderData.serviceFee - Service fee
 * @param {string} orderData.paymentMethod - Méthode de paiement (card/cash)
 * @param {Date} orderData.scheduledDeliveryTime - Heure de livraison programmée (optionnel)
 * @param {number} orderData.commissionRate - Taux de commission (12-18%)
 * @returns {Promise<Object>} - Commande créée ou erreur
 */
export async function createOrder(orderData) {
  // Invalider le cache des commandes après création
  const invalidateCache = () => {
    cacheService.invalidate('user_orders');
    cacheService.invalidate('restaurant_orders');
  };
  try {
    // Calculer la commission (12-18% du total)
    const total = orderData.subtotal + orderData.serviceFee;
    const commissionAmount = total * (orderData.commissionRate || 0.15); // 15% par défaut

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          user_id: orderData.userId,
          restaurant_id: orderData.restaurantId,
          items: orderData.items,
          subtotal: orderData.subtotal,
          delivery_fee: orderData.serviceFee, // Stocké dans delivery_fee pour compatibilité avec la DB
          total: total,
          payment_method: orderData.paymentMethod,
          payment_status: orderData.paymentMethod === 'card' ? 'pending' : 'pending',
          scheduled_delivery_time: orderData.scheduledDeliveryTime || null,
          commission_amount: commissionAmount,
          commission_paid: false,
          status: 'pending',
        },
      ])
      .select('*, restaurants(*), users(first_name, last_name, email, phone)')
      .single();

    if (error) {
      throw error;
    }

    // Invalider le cache après création
    invalidateCache();

    return {
      success: true,
      order: data,
    };
  } catch (error) {
    console.error('Erreur création commande:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la création de la commande',
    };
  }
}

/**
 * Récupère les commandes d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des commandes
 */
export async function getUserOrders(userId) {
  const cacheKey = cacheService.generateKey('user_orders', userId);
  
  // Cache très court pour les commandes (30 secondes) car elles changent souvent
  return cacheService.getOrSet(cacheKey, async () => {
    try {
      // Sélectionner uniquement les champs nécessaires
      const { data, error } = await supabase
        .from('orders')
        .select('id, user_id, restaurant_id, items, subtotal, delivery_fee, total, payment_method, payment_status, status, scheduled_delivery_time, created_at, updated_at, restaurants(id, name, cuisine_type)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erreur récupération commandes:', error);
      return [];
    }
  }, 30 * 1000); // Cache de 30 secondes seulement pour les commandes
}

/**
 * Récupère une commande par son ID
 * @param {string} orderId - ID de la commande
 * @returns {Promise<Object|null>} - Commande ou null
 */
export async function getOrderById(orderId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, restaurants(*), users(first_name, last_name, email, phone)')
      .eq('id', orderId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur récupération commande:', error);
    return null;
  }
}

/**
 * Crée une session Stripe Checkout pour payer une commande
 * @param {string} orderId - ID de la commande
 * @returns {Promise<Object>} - URL de checkout Stripe et session ID
 */
export async function createOrderCheckout(orderId) {
  try {
    const { data, error } = await supabase.functions.invoke('create-order-checkout', {
      body: { orderId },
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      checkout_url: data.checkout_url,
      session_id: data.session_id,
      order_id: data.order_id,
    };
  } catch (error) {
    console.error('Erreur création checkout commande:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la création du checkout',
    };
  }
}


