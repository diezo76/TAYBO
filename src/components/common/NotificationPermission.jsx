/**
 * Composant pour demander la permission de notifications
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, X } from 'lucide-react';
import Button from './Button';

function NotificationPermission() {
  const { t } = useTranslation();
  const { permissionGranted, isSupported, requestPermission } = useNotifications();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Afficher le banner si les notifications sont supportées mais pas autorisées
    if (isSupported && !permissionGranted) {
      // Vérifier si l'utilisateur a déjà refusé
      const hasRefused = localStorage.getItem('notification-permission-refused');
      if (!hasRefused) {
        // Afficher après un délai pour ne pas être intrusif
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSupported, permissionGranted]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowBanner(false);
    } else {
      // Marquer comme refusé pour ne plus afficher
      localStorage.setItem('notification-permission-refused', 'true');
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-permission-refused', 'true');
    setShowBanner(false);
  };

  if (!isSupported || permissionGranted || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slideInRight">
      <div className="card-soft-md p-4 shadow-soft-lg border-2 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {t('notifications.enable_title', 'Activer les notifications')}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {t('notifications.enable_message', 'Recevez des notifications pour vos commandes et les mises à jour importantes.')}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleRequestPermission}
                size="sm"
                className="flex-1"
              >
                {t('notifications.enable', 'Activer')}
              </Button>
              <button
                onClick={handleDismiss}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={t('common.close', 'Fermer')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationPermission;

