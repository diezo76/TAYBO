/**
 * Hook pour écouter les changements de commandes en temps réel
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

/**
 * Hook pour écouter les commandes d'un client en temps réel
 * @param {string} userId - ID de l'utilisateur
 * @param {Function} onOrderUpdate - Callback appelé lors d'une mise à jour
 */
export function useRealtimeClientOrders(userId, onOrderUpdate = null) {
  const { notifyOrderStatusChange } = useNotifications();
  const navigate = useNavigate();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // S'abonner aux changements de commandes pour cet utilisateur
    const subscription = supabase
      .channel(`orders:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Changement de commande détecté:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            const order = payload.new;
            
            // Notifier l'utilisateur du changement de statut
            notifyOrderStatusChange(order.status, order, () => {
              navigate('/client/orders');
            });
            
            // Appeler le callback si fourni
            if (onOrderUpdate) {
              onOrderUpdate(order);
            }
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [userId, notifyOrderStatusChange, navigate, onOrderUpdate]);
}

/**
 * Hook pour écouter les commandes d'un restaurant en temps réel
 * @param {string} restaurantId - ID du restaurant
 * @param {Function} onOrderUpdate - Callback appelé lors d'une mise à jour
 */
export function useRealtimeRestaurantOrders(restaurantId, onOrderUpdate = null) {
  const { notifyNewOrder, notifyOrderCancelled } = useNotifications();
  const navigate = useNavigate();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!restaurantId) return;

    // S'abonner aux nouvelles commandes pour ce restaurant
    const subscription = supabase
      .channel(`orders:restaurant:${restaurantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          console.log('Changement de commande restaurant détecté:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new) {
            // Nouvelle commande
            const order = payload.new;
            
            // Récupérer les détails complets de la commande
            const { data: orderData } = await supabase
              .from('orders')
              .select('*, users(first_name, last_name, email, phone)')
              .eq('id', order.id)
              .single();
            
            if (orderData) {
              notifyNewOrder(orderData, () => {
                navigate('/restaurant/orders');
              });
            }
            
            // Appeler le callback si fourni
            if (onOrderUpdate) {
              onOrderUpdate(orderData || order);
            }
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            const order = payload.new;
            
            // Si la commande a été annulée
            if (order.status === 'cancelled') {
              const { data: orderData } = await supabase
                .from('orders')
                .select('*, users(first_name, last_name, email, phone)')
                .eq('id', order.id)
                .single();
              
              if (orderData) {
                notifyOrderCancelled(orderData, () => {
                  navigate('/restaurant/orders');
                });
              }
            }
            
            // Appeler le callback si fourni
            if (onOrderUpdate) {
              onOrderUpdate(order);
            }
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [restaurantId, notifyNewOrder, notifyOrderCancelled, navigate, onOrderUpdate]);
}

/**
 * Hook pour écouter les nouveaux restaurants en attente (Admin)
 * @param {Function} onRestaurantUpdate - Callback appelé lors d'une mise à jour
 */
export function useRealtimePendingRestaurants(onRestaurantUpdate = null) {
  const { notifyNewRestaurantPending } = useNotifications();
  const navigate = useNavigate();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // S'abonner aux nouveaux restaurants non vérifiés
    const subscription = supabase
      .channel('restaurants:pending')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'restaurants',
          filter: 'verified=eq.false',
        },
        (payload) => {
          console.log('Nouveau restaurant en attente:', payload);
          
          if (payload.new) {
            const restaurant = payload.new;
            notifyNewRestaurantPending(restaurant, () => {
              navigate('/admin/restaurants?filter=pending');
            });
            
            // Appeler le callback si fourni
            if (onRestaurantUpdate) {
              onRestaurantUpdate(restaurant);
            }
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [notifyNewRestaurantPending, navigate, onRestaurantUpdate]);
}

/**
 * Hook pour écouter les nouveaux tickets de support (Admin)
 * @param {Function} onTicketUpdate - Callback appelé lors d'une mise à jour
 */
export function useRealtimeSupportTickets(onTicketUpdate = null) {
  const { notifyNewSupportTicket } = useNotifications();
  const navigate = useNavigate();
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // S'abonner aux nouveaux tickets
    const subscription = supabase
      .channel('support_tickets:new')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_tickets',
        },
        async (payload) => {
          console.log('Nouveau ticket de support:', payload);
          
          if (payload.new) {
            const ticket = payload.new;
            
            // Récupérer les détails complets du ticket
            const { data: ticketData } = await supabase
              .from('support_tickets')
              .select('*, users(first_name, last_name, email)')
              .eq('id', ticket.id)
              .single();
            
            if (ticketData) {
              notifyNewSupportTicket(ticketData, () => {
                navigate('/admin/support');
              });
            }
            
            // Appeler le callback si fourni
            if (onTicketUpdate) {
              onTicketUpdate(ticketData || ticket);
            }
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [notifyNewSupportTicket, navigate, onTicketUpdate]);
}

