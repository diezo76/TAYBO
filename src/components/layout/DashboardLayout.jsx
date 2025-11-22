/**
 * Composant DashboardLayout - Layout principal pour les dashboards
 * 
 * Ce composant fournit une structure de layout avec sidebar et header
 * pour les pages de dashboard (restaurant, admin).
 * 
 * @param {ReactNode} children - Contenu principal
 * @param {Array} sidebarItems - Items de navigation pour la sidebar
 * @param {ReactNode} headerContent - Contenu personnalisé du header
 * @param {string} title - Titre de la page
 */

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

function DashboardLayout({
  children,
  sidebarItems = [],
  headerContent,
  title = '',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenu principal - Structure flex pour responsive */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white shadow-soft border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Bouton menu mobile + Titre */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Ouvrir le menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                {title && (
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {title}
                  </h1>
                )}
              </div>

              {/* Contenu header personnalisé */}
              {headerContent && (
                <div className="flex-shrink-0">
                  {headerContent}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenu scrollable */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

