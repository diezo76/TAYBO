/**
 * Page de gestion des clients (Admin)
 * 
 * Cette page permet aux administrateurs de :
 * - Voir tous les clients
 * - Rechercher par nom/email
 * - Voir les détails d'un client
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getAllClients } from '../../services/adminService';
import { 
  Loader2, 
  Shield,
  Search,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import Button from '../../components/common/Button';

function ManageClients() {
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAdminAuth();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Rediriger si pas connecté
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, authLoading, navigate]);

  // Charger les clients
  useEffect(() => {
    const loadClients = async () => {
      if (!admin) {
        setLoading(false);
        setClients([]);
        return;
      }
      
      setLoading(true);
      try {
        const filters = {};
        if (search) {
          filters.search = search;
        }
        const data = await getAllClients(filters);
        setClients(data || []);
      } catch (error) {
        console.error('Erreur chargement clients:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    // Délai pour éviter trop de requêtes pendant la saisie
    const timeoutId = setTimeout(() => {
      loadClients();
    }, search ? 500 : 0);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, search]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Gestion des Clients
            </h1>
          </div>
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" className="w-full sm:w-auto">
            Retour
          </Button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Recherche */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Liste des clients */}
        {clients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <p className="text-gray-600 text-sm sm:text-base">Aucun client trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-primary hover:shadow-lg transition-shadow cursor-pointer min-w-0"
                onClick={() => setSelectedClient(client)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full flex-shrink-0">
                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                      {client.first_name} {client.last_name}
                    </h3>
                    <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate" title={client.email}>{client.email}</span>
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate" title={client.phone}>{client.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 min-w-0">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">
                          {new Date(client.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {client.language && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded whitespace-nowrap">
                            {client.language.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal détails client */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4 sm:mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate flex-1">
                  Détails du client
                </h2>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-xl sm:text-2xl leading-none"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="break-words">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Nom
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">
                    {selectedClient.first_name} {selectedClient.last_name}
                  </p>
                </div>

                <div className="break-words">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 break-all" title={selectedClient.email}>
                    {selectedClient.email}
                  </p>
                </div>

                {selectedClient.phone && (
                  <div className="break-words">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <p className="text-sm sm:text-base text-gray-900 break-words" title={selectedClient.phone}>
                      {selectedClient.phone}
                    </p>
                  </div>
                )}

                <div className="break-words">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Langue
                  </label>
                  <p className="text-sm sm:text-base text-gray-900">
                    {selectedClient.language?.toUpperCase() || '-'}
                  </p>
                </div>

                <div className="break-words">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Date d'inscription
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">
                    {new Date(selectedClient.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex justify-end">
                <Button onClick={() => setSelectedClient(null)} variant="outline" className="w-full sm:w-auto">
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageClients;

