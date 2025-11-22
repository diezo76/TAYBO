/**
 * Service de notifications push web
 * 
 * Gère les notifications push du navigateur pour informer les utilisateurs
 * des événements importants (commandes, statuts, etc.)
 */

import i18n from '../i18n/config';

/**
 * Demande la permission pour les notifications
 * @returns {Promise<boolean>} - true si la permission est accordée
 */
export async function requestNotificationPermission() {
  // Vérifier si le navigateur supporte les notifications
  if (!('Notification' in window)) {
    console.warn('Ce navigateur ne supporte pas les notifications');
    return false;
  }

  // Si la permission est déjà accordée
  if (Notification.permission === 'granted') {
    return true;
  }

  // Si la permission est déjà refusée
  if (Notification.permission === 'denied') {
    console.warn('Les notifications ont été refusées par l\'utilisateur');
    return false;
  }

  // Demander la permission
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return false;
  }
}

/**
 * Vérifie si les notifications sont autorisées
 * @returns {boolean} - true si autorisées
 */
export function isNotificationPermissionGranted() {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Envoie une notification
 * @param {Object} options - Options de la notification
 * @param {string} options.title - Titre de la notification
 * @param {Object} options.options - Options de la notification (body, icon, badge, etc.)
 * @returns {Notification|null} - L'objet Notification ou null si échec
 */
export function sendNotification(title, options = {}) {
  // Vérifier si les notifications sont autorisées
  if (!isNotificationPermissionGranted()) {
    console.warn('Les notifications ne sont pas autorisées');
    return null;
  }

  try {
    // Options par défaut
    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'taybo-notification',
      requireInteraction: false,
      ...options,
    };

    const notification = new Notification(title, defaultOptions);

    // Fermer automatiquement après 5 secondes
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Gérer le clic sur la notification
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Si une action est fournie, l'exécuter
      if (options.onClick) {
        options.onClick();
      }
    };

    return notification;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    return null;
  }
}

/**
 * Notifie un client d'un changement de statut de commande
 * @param {string} status - Nouveau statut de la commande
 * @param {Object} order - Données de la commande
 * @param {Function} onClick - Fonction à exécuter au clic
 */
export function notifyOrderStatusChange(status, order, onClick = null) {
  const statusMessages = {
    pending: i18n.t('notifications.order_status.pending'),
    accepted: i18n.t('notifications.order_status.accepted'),
    preparing: i18n.t('notifications.order_status.preparing'),
    ready: i18n.t('notifications.order_status.ready'),
    delivering: i18n.t('notifications.order_status.delivering'),
    delivered: i18n.t('notifications.order_status.delivered'),
    cancelled: i18n.t('notifications.order_status.cancelled'),
  };

  const message = statusMessages[status] || i18n.t('notifications.order_status.updated');
  const restaurantName = order.restaurants?.name || i18n.t('notifications.restaurant');
  const orderNumber = order.id.slice(0, 8);

  sendNotification(message, {
    body: i18n.t('notifications.order_status.body', { orderNumber, restaurantName }),
    tag: `order-${order.id}`,
    requireInteraction: status === 'ready' || status === 'delivered',
    onClick,
  });
}

/**
 * Notifie un restaurant d'une nouvelle commande
 * @param {Object} order - Données de la commande
 * @param {Function} onClick - Fonction à exécuter au clic
 */
export function notifyNewOrder(order, onClick = null) {
  const userName = order.users 
    ? `${order.users.first_name || ''} ${order.users.last_name || ''}`.trim() 
    : i18n.t('notifications.restaurant.new_order.customer');

  const orderNumber = order.id.slice(0, 8);
  const total = order.total || 0;

  sendNotification(i18n.t('notifications.restaurant.new_order.title'), {
    body: i18n.t('notifications.restaurant.new_order.body', { orderNumber, userName, total }),
    tag: `new-order-${order.id}`,
    requireInteraction: true,
    onClick,
  });
}

/**
 * Notifie un restaurant d'une commande annulée
 * @param {Object} order - Données de la commande
 * @param {Function} onClick - Fonction à exécuter au clic
 */
export function notifyOrderCancelled(order, onClick = null) {
  const userName = order.users 
    ? `${order.users.first_name || ''} ${order.users.last_name || ''}`.trim() 
    : i18n.t('notifications.restaurant.order_cancelled.customer');

  const orderNumber = order.id.slice(0, 8);

  sendNotification(i18n.t('notifications.restaurant.order_cancelled.title'), {
    body: i18n.t('notifications.restaurant.order_cancelled.body', { orderNumber, userName }),
    tag: `cancelled-order-${order.id}`,
    onClick,
  });
}

/**
 * Notifie un admin d'un nouveau restaurant en attente
 * @param {Object} restaurant - Données du restaurant
 * @param {Function} onClick - Fonction à exécuter au clic
 */
export function notifyNewRestaurantPending(restaurant, onClick = null) {
  const restaurantName = restaurant.name || i18n.t('notifications.admin.restaurant_pending.restaurant_name');

  sendNotification(i18n.t('notifications.admin.restaurant_pending.title'), {
    body: i18n.t('notifications.admin.restaurant_pending.body', { restaurantName }),
    tag: `pending-restaurant-${restaurant.id}`,
    requireInteraction: true,
    onClick,
  });
}

/**
 * Notifie un admin d'un nouveau ticket de support
 * @param {Object} ticket - Données du ticket
 * @param {Function} onClick - Fonction à exécuter au clic
 */
export function notifyNewSupportTicket(ticket, onClick = null) {
  const userName = ticket.users 
    ? `${ticket.users.first_name || ''} ${ticket.users.last_name || ''}`.trim() 
    : i18n.t('notifications.admin.support_ticket.user');

  const ticketNumber = ticket.id.slice(0, 8);
  const subject = ticket.subject || '';

  sendNotification(i18n.t('notifications.admin.support_ticket.title'), {
    body: i18n.t('notifications.admin.support_ticket.body', { ticketNumber, userName, subject }),
    tag: `support-ticket-${ticket.id}`,
    requireInteraction: true,
    onClick,
  });
}

