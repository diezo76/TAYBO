/**
 * Tests unitaires pour notificationService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as notificationService from '../notificationService';
import i18n from '../../i18n/config';

// Mock i18n
vi.mock('../../i18n/config', () => ({
  default: {
    t: vi.fn((key, params) => {
      const translations = {
        'notifications.order_status.pending': 'Votre commande est en attente',
        'notifications.order_status.accepted': 'Votre commande a été acceptée !',
        'notifications.order_status.preparing': 'Votre commande est en préparation',
        'notifications.order_status.ready': 'Votre commande est prête !',
        'notifications.order_status.delivering': 'Votre commande est en cours de livraison',
        'notifications.order_status.delivered': 'Votre commande a été livrée !',
        'notifications.order_status.cancelled': 'Votre commande a été annulée',
        'notifications.order_status.updated': 'Statut de votre commande mis à jour',
        'notifications.order_status.body': 'Commande #{{orderNumber}} - {{restaurantName}}',
        'notifications.restaurant': 'Restaurant',
        'notifications.restaurant.new_order.title': 'Nouvelle commande reçue !',
        'notifications.restaurant.new_order.body': 'Commande #{{orderNumber}} de {{userName}} - {{total}} EGP',
        'notifications.restaurant.new_order.customer': 'Un client',
        'notifications.restaurant.order_cancelled.title': 'Commande annulée',
        'notifications.restaurant.order_cancelled.body': 'La commande #{{orderNumber}} de {{userName}} a été annulée',
        'notifications.restaurant.order_cancelled.customer': 'Un client',
        'notifications.admin.restaurant_pending.title': 'Nouveau restaurant en attente',
        'notifications.admin.restaurant_pending.body': '{{restaurantName}} attend votre validation',
        'notifications.admin.restaurant_pending.restaurant_name': 'Restaurant',
        'notifications.admin.support_ticket.title': 'Nouveau ticket de support',
        'notifications.admin.support_ticket.body': 'Ticket #{{ticketNumber}} de {{userName}}: {{subject}}',
        'notifications.admin.support_ticket.user': 'Un utilisateur',
      };
      if (params) {
        let result = translations[key] || key;
        Object.keys(params).forEach(param => {
          result = result.replace(`{{${param}}}`, params[param]);
        });
        return result;
      }
      return translations[key] || key;
    }),
  },
}));

// Mock Notification API
const mockNotification = {
  close: vi.fn(),
  onclick: null,
};

global.Notification = vi.fn(() => mockNotification);
global.Notification.permission = 'granted';
global.Notification.requestPermission = vi.fn(() => Promise.resolve('granted'));

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.Notification.permission = 'granted';
  });

  describe('requestNotificationPermission', () => {
    it('devrait retourner true si la permission est déjà accordée', async () => {
      global.Notification.permission = 'granted';
      const result = await notificationService.requestNotificationPermission();
      expect(result).toBe(true);
    });

    it('devrait retourner false si la permission est refusée', async () => {
      global.Notification.permission = 'denied';
      const result = await notificationService.requestNotificationPermission();
      expect(result).toBe(false);
    });

    it('devrait demander la permission si elle n\'est pas définie', async () => {
      global.Notification.permission = 'default';
      global.Notification.requestPermission.mockResolvedValueOnce('granted');
      const result = await notificationService.requestNotificationPermission();
      expect(global.Notification.requestPermission).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('isNotificationPermissionGranted', () => {
    it('devrait retourner true si la permission est accordée', () => {
      global.Notification.permission = 'granted';
      expect(notificationService.isNotificationPermissionGranted()).toBe(true);
    });

    it('devrait retourner false si la permission n\'est pas accordée', () => {
      global.Notification.permission = 'denied';
      expect(notificationService.isNotificationPermissionGranted()).toBe(false);
    });
  });

  describe('sendNotification', () => {
    it('devrait envoyer une notification si la permission est accordée', () => {
      global.Notification.permission = 'granted';
      const notification = notificationService.sendNotification('Test', { body: 'Test body' });
      expect(global.Notification).toHaveBeenCalledWith('Test', expect.objectContaining({
        body: 'Test body',
      }));
      expect(notification).toBe(mockNotification);
    });

    it('devrait retourner null si la permission n\'est pas accordée', () => {
      global.Notification.permission = 'denied';
      const notification = notificationService.sendNotification('Test');
      expect(notification).toBeNull();
    });
  });

  describe('notifyOrderStatusChange', () => {
    it('devrait envoyer une notification pour un changement de statut', () => {
      global.Notification.permission = 'granted';
      const order = {
        id: '12345678-1234-1234-1234-123456789012',
        restaurants: { name: 'Test Restaurant' },
      };
      notificationService.notifyOrderStatusChange('accepted', order);
      expect(global.Notification).toHaveBeenCalled();
    });
  });

  describe('notifyNewOrder', () => {
    it('devrait envoyer une notification pour une nouvelle commande', () => {
      global.Notification.permission = 'granted';
      const order = {
        id: '12345678-1234-1234-1234-123456789012',
        total: 50,
        users: { first_name: 'John', last_name: 'Doe' },
      };
      notificationService.notifyNewOrder(order);
      expect(global.Notification).toHaveBeenCalled();
    });
  });

  describe('notifyOrderCancelled', () => {
    it('devrait envoyer une notification pour une commande annulée', () => {
      global.Notification.permission = 'granted';
      const order = {
        id: '12345678-1234-1234-1234-123456789012',
        users: { first_name: 'John', last_name: 'Doe' },
      };
      notificationService.notifyOrderCancelled(order);
      expect(global.Notification).toHaveBeenCalled();
    });
  });

  describe('notifyNewRestaurantPending', () => {
    it('devrait envoyer une notification pour un nouveau restaurant en attente', () => {
      global.Notification.permission = 'granted';
      const restaurant = {
        id: '12345678-1234-1234-1234-123456789012',
        name: 'Test Restaurant',
      };
      notificationService.notifyNewRestaurantPending(restaurant);
      expect(global.Notification).toHaveBeenCalled();
    });
  });

  describe('notifyNewSupportTicket', () => {
    it('devrait envoyer une notification pour un nouveau ticket de support', () => {
      global.Notification.permission = 'granted';
      const ticket = {
        id: '12345678-1234-1234-1234-123456789012',
        subject: 'Test Subject',
        users: { first_name: 'John', last_name: 'Doe' },
      };
      notificationService.notifyNewSupportTicket(ticket);
      expect(global.Notification).toHaveBeenCalled();
    });
  });
});

