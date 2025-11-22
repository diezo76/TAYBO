/**
 * Composant Sidebar - Barre latérale style Soft UI
 * 
 * Ce composant affiche une barre latérale de navigation avec logo,
 * items de menu et profil utilisateur.
 * 
 * @param {Array} items - Items de navigation [{icon, label, path, badge?}]
 * @param {string} activeItem - Chemin actif
 * @param {Function} onItemClick - Fonction appelée au clic sur un item
 * @param {boolean} isOpen - État d'ouverture (pour mobile)
 * @param {Function} onClose - Fonction pour fermer (mobile)
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import Avatar from '../soft-ui/Avatar';

function Sidebar({
  items = [],
  activeItem,
  onItemClick,
  isOpen = true,
  onClose,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
    if (onItemClick) {
      onItemClick(item);
    }
    if (onClose) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path || activeItem === path;
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white shadow-soft-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col flex-shrink-0
        `}
      >
        {/* Header avec logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-colored-md">
                <span className="text-xl font-bold text-white">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Taybo</span>
            </div>
            {/* Bouton fermer mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {items.map((item, index) => {
              const active = isActive(item.path);
              
              return (
                <li key={index}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${
                        active
                          ? 'bg-primary/10 text-primary font-semibold shadow-soft'
                          : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0">{item.icon}</span>
                    )}
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer avec profil (optionnel) */}
        {items.find(item => item.type === 'profile') && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar
                src={items.find(item => item.type === 'profile')?.avatar}
                name={items.find(item => item.type === 'profile')?.name}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {items.find(item => item.type === 'profile')?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {items.find(item => item.type === 'profile')?.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;

