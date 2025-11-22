/**
 * Service pour la gestion des tickets de support
 * 
 * Ce service gère toutes les opérations liées aux tickets de support :
 * - Création de tickets
 * - Récupération des tickets
 * - Mise à jour du statut
 * - Gestion des messages
 */

import { supabase } from './supabase';

/**
 * Récupère tous les tickets de support avec filtres
 * @param {Object} filters - Filtres optionnels
 * @param {string} filters.status - Filtrer par statut (open, in_progress, closed)
 * @param {string} filters.priority - Filtrer par priorité (low, medium, high)
 * @param {string} filters.userId - Filtrer par utilisateur
 * @param {string} filters.restaurantId - Filtrer par restaurant
 * @returns {Promise<Array>} - Liste des tickets
 */
export async function getAllTickets(filters = {}) {
  try {
    let query = supabase
      .from('support_tickets')
      .select(`
        id,
        user_id,
        restaurant_id,
        subject,
        description,
        status,
        priority,
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

    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
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
    console.error('Erreur récupération tickets:', error);
    throw error;
  }
}

/**
 * Récupère un ticket par son ID avec ses messages
 * @param {string} ticketId - ID du ticket
 * @returns {Promise<Object>} - Ticket avec ses messages
 */
export async function getTicketById(ticketId) {
  try {
    // Récupérer le ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select(`
        id,
        user_id,
        restaurant_id,
        subject,
        description,
        status,
        priority,
        created_at,
        updated_at,
        users:user_id(id, first_name, last_name, email),
        restaurants:restaurant_id(id, name, email)
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError) {
      throw ticketError;
    }

    // Récupérer les messages
    const { data: messages, error: messagesError } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    return {
      ...ticket,
      messages: messages || [],
    };
  } catch (error) {
    console.error('Erreur récupération ticket:', error);
    throw error;
  }
}

/**
 * Crée un nouveau ticket de support
 * @param {Object} ticketData - Données du ticket
 * @param {string} ticketData.userId - ID de l'utilisateur (optionnel)
 * @param {string} ticketData.restaurantId - ID du restaurant (optionnel)
 * @param {string} ticketData.subject - Sujet du ticket
 * @param {string} ticketData.description - Description du ticket
 * @param {string} [ticketData.priority='medium'] - Priorité (low, medium, high)
 * @returns {Promise<Object>} - Ticket créé
 */
export async function createTicket(ticketData) {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: ticketData.userId || null,
        restaurant_id: ticketData.restaurantId || null,
        subject: ticketData.subject,
        description: ticketData.description,
        priority: ticketData.priority || 'medium',
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur création ticket:', error);
    throw error;
  }
}

/**
 * Met à jour le statut d'un ticket
 * @param {string} ticketId - ID du ticket
 * @param {string} status - Nouveau statut (open, in_progress, closed)
 * @returns {Promise<Object>} - Ticket mis à jour
 */
export async function updateTicketStatus(ticketId, status) {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur mise à jour statut ticket:', error);
    throw error;
  }
}

/**
 * Ajoute un message à un ticket
 * @param {Object} messageData - Données du message
 * @param {string} messageData.ticketId - ID du ticket
 * @param {string} messageData.senderType - Type d'expéditeur (user, restaurant, admin)
 * @param {string} messageData.senderId - ID de l'expéditeur
 * @param {string} messageData.message - Contenu du message
 * @returns {Promise<Object>} - Message créé
 */
export async function addTicketMessage(messageData) {
  try {
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: messageData.ticketId,
        sender_type: messageData.senderType,
        sender_id: messageData.senderId,
        message: messageData.message,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Si c'est un admin qui répond, mettre le statut à "in_progress"
    if (messageData.senderType === 'admin') {
      await updateTicketStatus(messageData.ticketId, 'in_progress');
    }

    return data;
  } catch (error) {
    console.error('Erreur ajout message ticket:', error);
    throw error;
  }
}

/**
 * Ferme un ticket
 * @param {string} ticketId - ID du ticket
 * @returns {Promise<Object>} - Ticket fermé
 */
export async function closeTicket(ticketId) {
  try {
    return await updateTicketStatus(ticketId, 'closed');
  } catch (error) {
    console.error('Erreur fermeture ticket:', error);
    throw error;
  }
}

