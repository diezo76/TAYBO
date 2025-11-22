/**
 * Service pour la gestion des paiements de commissions hebdomadaires
 * 
 * Ce service gère toutes les opérations liées aux paiements de commissions :
 * - Récupération des paiements
 * - Calcul des commissions en temps réel pour la semaine en cours
 * - Création de sessions Stripe Checkout pour le paiement
 * - Mise à jour du statut
 */

import { supabase } from './supabase';

/**
 * Récupère tous les paiements de commissions avec filtres
 * @param {Object} filters - Filtres optionnels
 * @param {string} filters.status - Filtrer par statut (pending, paid, overdue)
 * @param {string} filters.restaurantId - Filtrer par restaurant
 * @returns {Promise<Array>} - Liste des paiements
 */
export async function getAllCommissionPayments(filters = {}) {
  try {
    let query = supabase
      .from('commission_payments')
      .select(`
        id,
        restaurant_id,
        amount,
        commission_amount,
        total_sales,
        commission_rate,
        week_start_date,
        week_end_date,
        period_start,
        period_end,
        status,
        payment_method,
        due_date,
        stripe_checkout_session_id,
        invoice_url,
        paid_at,
        created_at,
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

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erreur récupération paiements commissions:', error);
    throw error;
  }
}

/**
 * Récupère les commissions en temps réel pour la semaine en cours
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Object>} - Données de commission pour la semaine en cours
 */
export async function getCurrentWeekCommission(restaurantId) {
  try {
    const { data, error } = await supabase
      .rpc('get_current_week_commission', {
        p_restaurant_id: restaurantId
      });

    if (error) {
      throw error;
    }

    return data?.[0] || {
      total_sales: 0,
      commission_amount: 0,
      week_start: null,
      week_end: null
    };
  } catch (error) {
    console.error('Erreur récupération commission semaine en cours:', error);
    throw error;
  }
}

/**
 * Crée une session Stripe Checkout pour payer une commission
 * @param {string} paymentId - ID du paiement de commission
 * @returns {Promise<Object>} - URL de checkout Stripe et session ID
 */
export async function createCommissionCheckout(paymentId) {
  try {
    const { data, error } = await supabase.functions.invoke('create-commission-checkout', {
      body: { paymentId }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur création checkout commission:', error);
    throw error;
  }
}

/**
 * Récupère les paiements de commission en attente pour un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Array>} - Liste des paiements en attente
 */
export async function getPendingCommissions(restaurantId) {
  try {
    const { data, error } = await supabase
      .from('commission_payments')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .in('status', ['pending', 'overdue'])
      .order('due_date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erreur récupération commissions en attente:', error);
    throw error;
  }
}

/**
 * Marque un paiement de commission comme payé
 * @param {string} paymentId - ID du paiement
 * @param {string} paymentMethod - Méthode de paiement (transfer, card)
 * @returns {Promise<Object>} - Paiement mis à jour
 */
export async function markCommissionAsPaid(paymentId, paymentMethod) {
  try {
    const { data, error } = await supabase
      .from('commission_payments')
      .update({
        status: 'paid',
        payment_method: paymentMethod,
        paid_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur mise à jour paiement commission:', error);
    throw error;
  }
}

/**
 * Calcule les commissions pour un restaurant sur une période
 * Note: Cette fonction utilise maintenant la fonction SQL calculate_weekly_commission
 * qui calcule sur le subtotal (hors frais de livraison) avec un taux de 4%
 * @param {string} restaurantId - ID du restaurant
 * @param {Date} periodStart - Début de la période
 * @param {Date} periodEnd - Fin de la période
 * @returns {Promise<Object>} - Résultat du calcul (total_sales, commission_amount)
 */
export async function calculateWeeklyCommission(restaurantId, periodStart, periodEnd) {
  try {
    const startDate = periodStart instanceof Date 
      ? periodStart.toISOString().split('T')[0] 
      : periodStart;
    const endDate = periodEnd instanceof Date 
      ? periodEnd.toISOString().split('T')[0] 
      : periodEnd;

    const { data, error } = await supabase
      .rpc('calculate_weekly_commission', {
        p_restaurant_id: restaurantId,
        p_week_start: startDate,
        p_week_end: endDate
      });

    if (error) {
      throw error;
    }

    return data?.[0] || {
      total_sales: 0,
      commission_amount: 0
    };
  } catch (error) {
    console.error('Erreur calcul commission:', error);
    throw error;
  }
}

/**
 * Ancienne fonction conservée pour compatibilité
 * @deprecated Utiliser calculateWeeklyCommission à la place
 */
export async function calculateAndCreateCommission(restaurantId, periodStart, periodEnd, commissionRate = 0.04) {
  console.warn('calculateAndCreateCommission est dépréciée. Utilisez calculateWeeklyCommission.');
  return calculateWeeklyCommission(restaurantId, periodStart, periodEnd);
}

