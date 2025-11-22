/**
 * Composant Dropdown - Menu déroulant style Soft UI
 * 
 * Ce composant crée un menu déroulant avec des options.
 * 
 * @param {ReactNode} trigger - Élément déclencheur
 * @param {Array} items - Options [{label, onClick, icon?, divider?}]
 * @param {boolean} isOpen - État d'ouverture
 * @param {Function} onClose - Fonction appelée pour fermer
 * @param {string} position - Position (bottom-right/bottom-left/top-right/top-left)
 */

import { useEffect, useRef } from 'react';
import Card from '../common/Card';

function Dropdown({
  trigger,
  items = [],
  isOpen,
  onClose,
  position = 'bottom-right',
}) {
  const dropdownRef = useRef(null);

  // Positions
  const positionClasses = {
    'bottom-right': 'top-full right-0 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'top-right': 'bottom-full right-0 mb-2',
    'top-left': 'bottom-full left-0 mb-2',
  };

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div className="relative" ref={dropdownRef}>
      {trigger}
      
      {isOpen && (
        <Card
          className={`absolute ${positionClasses[position]} min-w-[200px] shadow-soft-lg z-50 py-2`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-2 border-t border-gray-200"
                />
              );
            }

            return (
              <button
                key={index}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  }
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors ${
                  item.danger ? 'text-error hover:bg-error/10' : ''
                }`}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </Card>
      )}
    </div>
  );
}

export default Dropdown;

