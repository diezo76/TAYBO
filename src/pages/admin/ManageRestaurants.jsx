/**
 * Page de gestion des restaurants (Admin)
 * 
 * Cette page permet aux administrateurs de :
 * - Voir tous les restaurants
 * - Valider/rejeter les restaurants en attente
 * - Activer/désactiver les restaurants
 * - Voir les documents de passeport
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getAllRestaurants, updateRestaurantStatus, updateRestaurant } from '../../services/adminService';
import { useRealtimePendingRestaurants } from '../../hooks/useRealtimeOrders';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Shield,
  AlertCircle,
  Search,
  Filter,
  Edit,
  Save,
  X,
  Power
} from 'lucide-react';
import Button from '../../components/common/Button';

function ManageRestaurants() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAdminAuth();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(filterParam || 'all'); // all, pending, verified, active, inactive
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Rediriger si pas connecté
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, authLoading, navigate]);

  // Charger les restaurants
  useEffect(() => {
    const loadRestaurants = async () => {
      if (!admin) {
        setLoading(false);
        setRestaurants([]);
        return;
      }
      
      setLoading(true);
      try {
        const filters = {};
        if (filter === 'pending') {
          filters.verified = false;
        } else if (filter === 'verified') {
          filters.verified = true;
        } else if (filter === 'active') {
          filters.active = true;
        } else if (filter === 'inactive') {
          filters.active = false;
        }

        const data = await getAllRestaurants(filters);
        setRestaurants(data || []);
      } catch (error) {
        console.error('Erreur chargement restaurants:', error);
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, filter]);

  // Écouter les nouveaux restaurants en attente en temps réel
  useRealtimePendingRestaurants((newRestaurant) => {
    // Ajouter le nouveau restaurant à la liste s'il n'existe pas déjà
    if (newRestaurant && !restaurants.find(r => r.id === newRestaurant.id)) {
      setRestaurants(prevRestaurants => [newRestaurant, ...prevRestaurants]);
    }
  });

  // Filtrer par recherche
  const filteredRestaurants = restaurants.filter(restaurant => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(searchLower) ||
      restaurant.email.toLowerCase().includes(searchLower) ||
      restaurant.cuisine_type.toLowerCase().includes(searchLower)
    );
  });

  // Valider un restaurant
  const handleVerify = async (restaurantId) => {
    setUpdating(restaurantId);
    try {
      await updateRestaurantStatus(restaurantId, {
        is_verified: true,
        is_active: true,
      });
      // Recharger la liste
      const filters = {};
      if (filter === 'pending') {
        filters.verified = false;
      } else if (filter === 'verified') {
        filters.verified = true;
      } else if (filter === 'active') {
        filters.active = true;
      } else if (filter === 'inactive') {
        filters.active = false;
      }
      const data = await getAllRestaurants(filters);
      setRestaurants(data);
    } catch (error) {
      console.error('Erreur validation restaurant:', error);
      const errorMessage = error.message || error.details || t('admin.restaurants.error_verify');
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setUpdating(null);
    }
  };

  // Rejeter un restaurant
  const handleReject = async (restaurantId) => {
    if (!confirm(t('admin.restaurants.confirm_reject'))) {
      return;
    }
    setUpdating(restaurantId);
    try {
      await updateRestaurantStatus(restaurantId, {
        is_verified: false,
        is_active: false,
      });
      // Recharger la liste
      const filters = {};
      if (filter === 'pending') {
        filters.verified = false;
      } else if (filter === 'verified') {
        filters.verified = true;
      } else if (filter === 'active') {
        filters.active = true;
      } else if (filter === 'inactive') {
        filters.active = false;
      }
      const data = await getAllRestaurants(filters);
      setRestaurants(data);
    } catch (error) {
      console.error('Erreur rejet restaurant:', error);
      const errorMessage = error.message || error.details || t('admin.restaurants.error_reject');
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setUpdating(null);
    }
  };

  // Activer/désactiver un restaurant
  const handleToggleActive = async (restaurantId, currentStatus) => {
    setUpdating(restaurantId);
    try {
      await updateRestaurantStatus(restaurantId, {
        is_active: !currentStatus,
      });
      // Recharger la liste
      const filters = {};
      if (filter === 'pending') {
        filters.verified = false;
      } else if (filter === 'verified') {
        filters.verified = true;
      } else if (filter === 'active') {
        filters.active = true;
      } else if (filter === 'inactive') {
        filters.active = false;
      }
      const data = await getAllRestaurants(filters);
      setRestaurants(data);
    } catch (error) {
      console.error('Erreur changement statut:', error);
      const errorMessage = error.message || error.details || t('admin.restaurants.error_toggle');
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setUpdating(null);
    }
  };

  // Voir le document de passeport
  const handleViewPassport = (passportUrl) => {
    if (passportUrl) {
      window.open(passportUrl, '_blank');
    } else {
      alert(t('admin.restaurants.no_passport'));
    }
  };

  // Commencer l'édition d'un restaurant
  const handleStartEdit = (restaurant) => {
    setEditingId(restaurant.id);
    setEditForm({
      name: restaurant.name || '',
      email: restaurant.email || '',
      description: restaurant.description || '',
      cuisine_type: restaurant.cuisine_type || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      delivery_fee: restaurant.delivery_fee || 0,
    });
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Sauvegarder les modifications
  const handleSaveEdit = async (restaurantId) => {
    setUpdating(restaurantId);
    try {
      await updateRestaurant(restaurantId, editForm);
      // Recharger la liste
      const filters = {};
      if (filter === 'pending') {
        filters.verified = false;
      } else if (filter === 'verified') {
        filters.verified = true;
      } else if (filter === 'active') {
        filters.active = true;
      } else if (filter === 'inactive') {
        filters.active = false;
      }
      const data = await getAllRestaurants(filters);
      setRestaurants(data);
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Erreur modification restaurant:', error);
      const errorMessage = error.message || error.details || t('admin.restaurants.error_update');
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setUpdating(null);
    }
  };

  // Désactiver un restaurant
  const handleDeactivate = async (restaurantId) => {
    if (!confirm(t('admin.restaurants.confirm_deactivate'))) {
      return;
    }
    setUpdating(restaurantId);
    try {
      await updateRestaurantStatus(restaurantId, {
        is_active: false,
      });
      // Recharger la liste
      const filters = {};
      if (filter === 'pending') {
        filters.verified = false;
      } else if (filter === 'verified') {
        filters.verified = true;
      } else if (filter === 'active') {
        filters.active = true;
      } else if (filter === 'inactive') {
        filters.active = false;
      }
      const data = await getAllRestaurants(filters);
      setRestaurants(data);
    } catch (error) {
      console.error('Erreur désactivation restaurant:', error);
      const errorMessage = error.message || error.details || t('admin.restaurants.error_deactivate');
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setUpdating(null);
    }
  };

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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t('admin.restaurants.title')}
            </h1>
          </div>
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
            Retour
          </Button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('admin.restaurants.search_placeholder')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filtres */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-gray-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('admin.restaurants.filter_all')}
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filter === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                {t('admin.restaurants.filter_pending')}
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'verified'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('admin.restaurants.filter_verified')}
              </button>
            </div>
          </div>
        </div>

        {/* Liste des restaurants */}
        {filteredRestaurants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">{t('admin.restaurants.no_restaurants')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary"
              >
                {editingId === restaurant.id ? (
                  /* Formulaire d'édition */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('admin.restaurants.editing')}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveEdit(restaurant.id)}
                          disabled={updating === restaurant.id}
                          className="flex items-center gap-2"
                        >
                          {updating === restaurant.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Enregistrer
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          disabled={updating === restaurant.id}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('common.name')}
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('common.email')}
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('admin.restaurants.description')}
                        </label>
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type de cuisine
                        </label>
                        <input
                          type="text"
                          value={editForm.cuisine_type}
                          onChange={(e) => setEditForm({ ...editForm, cuisine_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse
                        </label>
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frais de livraison (EGP)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.delivery_fee}
                          onChange={(e) => setEditForm({ ...editForm, delivery_fee: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Affichage normal */
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Informations */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {restaurant.name}
                        </h3>
                        <div className="flex gap-2">
                          {restaurant.is_verified ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              {t('admin.restaurants.verified')}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                              {t('admin.restaurants.pending')}
                            </span>
                          )}
                          {restaurant.is_active ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                              {t('admin.restaurants.active')}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">
                              {t('admin.restaurants.inactive')}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{restaurant.email}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {restaurant.cuisine_type} • {restaurant.address}
                      </p>
                      {restaurant.description && (
                        <p className="text-sm text-gray-600 mb-2">{restaurant.description}</p>
                      )}
                      {restaurant.average_rating > 0 && (
                        <p className="text-sm text-gray-600">
                          ⭐ {restaurant.average_rating.toFixed(1)} ({restaurant.total_reviews} Avis)
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleStartEdit(restaurant)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Modifier
                      </Button>
                      {!restaurant.is_verified && (
                        <>
                          <Button
                            onClick={() => handleVerify(restaurant.id)}
                            disabled={updating === restaurant.id}
                            className="flex items-center gap-2"
                          >
                            {updating === restaurant.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {t('admin.restaurants.verify')}
                          </Button>
                          <Button
                            onClick={() => handleReject(restaurant.id)}
                            disabled={updating === restaurant.id}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            {t('admin.restaurants.reject')}
                          </Button>
                        </>
                      )}
                      {restaurant.is_verified && restaurant.is_active && (
                        <Button
                          onClick={() => handleDeactivate(restaurant.id)}
                          disabled={updating === restaurant.id}
                          variant="outline"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          {updating === restaurant.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                          {t('admin.restaurants.deactivate')}
                        </Button>
                      )}
                      {restaurant.is_verified && !restaurant.is_active && (
                        <Button
                          onClick={() => handleToggleActive(restaurant.id, restaurant.is_active)}
                          disabled={updating === restaurant.id}
                          className="flex items-center gap-2"
                        >
                          {updating === restaurant.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                          {t('admin.restaurants.activate')}
                        </Button>
                      )}
                      <Button
                        onClick={() => handleViewPassport(restaurant.passport_document_url)}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {t('admin.restaurants.view_passport')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ManageRestaurants;

