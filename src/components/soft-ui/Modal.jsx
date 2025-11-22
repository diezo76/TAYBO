/**
 * Composant Modal - Modale style Soft UI
 * 
 * Ce composant crée une modale avec overlay et animation.
 * 
 * @param {boolean} isOpen - État d'ouverture de la modale
 * @param {Function} onClose - Fonction appelée pour fermer
 * @param {string} title - Titre de la modale
 * @param {ReactNode} children - Contenu de la modale
 * @param {ReactNode} footer - Footer personnalisé (optionnel)
 * @param {string} size - Taille (sm/md/lg/xl)
 * @param {string} className - Classes CSS supplémentaires
 */

import { X } from 'lucide-react';
import { useEffect } from 'react';
import Card from '../common/Card';

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  // Tailles
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <Card
        className={`${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto shadow-soft-xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-gray-200">{footer}</div>
        )}
      </Card>
    </div>
  );
}

export default Modal;

