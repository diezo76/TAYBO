/**
 * Composant Toast - Notification toast style Soft UI
 * 
 * Ce composant affiche une notification toast temporaire.
 * 
 * @param {string} message - Message à afficher
 * @param {string} type - Type (success/error/info/warning)
 * @param {boolean} isVisible - Visibilité
 * @param {Function} onClose - Fonction appelée pour fermer
 * @param {number} duration - Durée d'affichage en ms (0 = infini)
 */

import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 5000,
}) {
  // Icônes selon le type
  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  // Couleurs selon le type
  const colorClasses = {
    success: 'bg-success/10 text-success border-success/20',
    error: 'bg-error/10 text-error border-error/20',
    info: 'bg-info/10 text-info border-info/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
  };

  // Fermer automatiquement après la durée
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-soft shadow-soft-lg border ${colorClasses[type]} animate-slideInRight`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default Toast;

