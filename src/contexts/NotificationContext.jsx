/**
 * Contexte de notifications
 * 
 * Gère les notifications push web pour toute l'application
 */

import { createContext, useContext, useState, useEffect } from 'react';
import * as notificationService from '../services/notificationService';

const NotificationContext = createContext(null);

/**
 * Provider du contexte de notifications
 */
export function NotificationProvider({ children }) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    setIsSupported('Notification' in window);
    
    // Vérifier la permission actuelle
    if (isSupported) {
      setPermissionGranted(notificationService.isNotificationPermissionGranted());
    }
  }, [isSupported]);

  /**
   * Demande la permission pour les notifications
   */
  const requestPermission = async () => {
    const granted = await notificationService.requestNotificationPermission();
    setPermissionGranted(granted);
    return granted;
  };

  const value = {
    permissionGranted,
    isSupported,
    requestPermission,
    sendNotification: notificationService.sendNotification,
    notifyOrderStatusChange: notificationService.notifyOrderStatusChange,
    notifyNewOrder: notificationService.notifyNewOrder,
    notifyOrderCancelled: notificationService.notifyOrderCancelled,
    notifyNewRestaurantPending: notificationService.notifyNewRestaurantPending,
    notifyNewSupportTicket: notificationService.notifyNewSupportTicket,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte de notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications doit être utilisé à l\'intérieur d\'un NotificationProvider');
  }
  
  return context;
}

