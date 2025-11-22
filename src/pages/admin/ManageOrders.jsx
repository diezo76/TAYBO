/**
 * Page de gestion des commandes (Admin)
 * 
 * Cette page permet aux administrateurs de :
 * - Voir toutes les commandes
 * - Filtrer par statut, restaurant, client
 * - Voir les détails complets
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getAllOrders, getAllRestaurants } from '../../services/adminService';
import { 
  Loader2, 
  Shield,
  Search,
  Filter,
  Package,
  Eye,
  Calendar,
  DollarSign,
  User,
  UtensilsCrossed
} from 'lucide-react';
import Button from '../../components/common/Button';

function ManageOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAdminAuth();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(filterParam || 'all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Rediriger si pas connecté
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, authLoading, navigate]);

  // Charger les restaurants pour le filtre
  useEffect(() => {
    const loadRestaurants = async () => {
      if (!admin) {
        setRestaurants([]);
        return;
      }
      
      try {
        const data = await getAllRestaurants();
        setRestaurants(data || []);
      } catch (error) {
        console.error('Erreur chargement restaurants:', error);
        setRestaurants([]);
      }
    };
    loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  // Charger les commandes
  useEffect(() => {
    const loadOrders = async () => {
      if (!admin) {
        setLoading(false);
        setOrders([]);
        return;
      }
      
      setLoading(true);
      try {
        const filters = {};
        if (statusFilter !== 'all') {
          filters.status = statusFilter;
        }
        if (restaurantFilter !== 'all') {
          filters.restaurantId = restaurantFilter;
        }
        const data = await getAllOrders(filters);
        setOrders(data || []);
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, statusFilter, restaurantFilter]);

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('orders.status.pending') },
      accepted: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('orders.status.accepted') },
      preparing: { bg: 'bg-purple-100', text: 'text-purple-800', label: t('orders.status.preparing') },
      ready: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: t('orders.status.ready') },
      delivering: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: t('orders.status.delivering') },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: t('orders.status.delivered') },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: t('orders.status.cancelled') },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
              {t('admin.orders.title')}
            </h1>
          </div>
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
            Retour
          </Button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtre par statut */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.orders.filter_status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">{t('admin.orders.all_statuses')}</option>
                <option value="pending">{t('orders.status.pending')}</option>
                <option value="accepted">{t('orders.status.accepted')}</option>
                <option value="preparing">{t('orders.status.preparing')}</option>
                <option value="ready">{t('orders.status.ready')}</option>
                <option value="delivering">{t('orders.status.delivering')}</option>
                <option value="delivered">{t('orders.status.delivered')}</option>
                <option value="cancelled">{t('orders.status.cancelled')}</option>
              </select>
            </div>

            {/* Filtre par restaurant */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.orders.filter_restaurant')}
              </label>
              <select
                value={restaurantFilter}
                onChange={(e) => setRestaurantFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">{t('admin.orders.all_restaurants')}</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des commandes */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">{t('admin.orders.no_orders')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Informations */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('admin.orders.order')} #{order.id.slice(0, 8)}
                      </h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>{order.restaurants?.name || t('admin.orders.unknown_restaurant')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          {order.users?.first_name} {order.users?.last_name}
                        </span>
                        <span className="text-gray-400">({order.users?.email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(order.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>
                          {order.items?.length || 0} {t('admin.orders.items')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">
                          {parseFloat(order.total || 0).toFixed(2)} EGP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {t('admin.orders.view_details')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal détails commande */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('admin.orders.order_details')} #{selectedOrder.id.slice(0, 8)}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Statut */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t('admin.orders.status')}
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>

                {/* Informations restaurant */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t('admin.orders.restaurant')}
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedOrder.restaurants?.name || t('admin.orders.unknown_restaurant')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.restaurants?.email}
                  </p>
                </div>

                {/* Informations client */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t('admin.orders.client')}
                  </label>
                  <p className="text-gray-900 mt-1">
                    {selectedOrder.users?.first_name} {selectedOrder.users?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.users?.email}
                  </p>
                </div>

                {/* Articles */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    {t('admin.orders.items')}
                  </label>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × {parseFloat(item.price || 0).toFixed(2)} EGP
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)} EGP
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t('admin.orders.subtotal')}</span>
                    <span className="text-gray-900">
                      {parseFloat(selectedOrder.subtotal || 0).toFixed(2)} EGP
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t('admin.orders.delivery_fee')}</span>
                    <span className="text-gray-900">
                      {parseFloat(selectedOrder.delivery_fee || 0).toFixed(2)} EGP
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>{t('admin.orders.total')}</span>
                    <span>{parseFloat(selectedOrder.total || 0).toFixed(2)} EGP</span>
                  </div>
                </div>

                {/* Paiement */}
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    {t('admin.orders.payment')}
                  </label>
                  <div className="mt-1 space-y-1">
                    <p className="text-gray-900">
                      {t(`orders.payment_method.${selectedOrder.payment_method}`)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('admin.orders.payment_status')}: {t(`orders.payment_status.${selectedOrder.payment_status}`)}
                    </p>
                  </div>
                </div>

                {/* Livraison programmée */}
                {selectedOrder.scheduled_delivery_time && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      {t('admin.orders.scheduled_delivery')}
                    </label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedOrder.scheduled_delivery_time).toLocaleString()}
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">{t('admin.orders.created_at')}</label>
                    <p className="text-gray-900">
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600">{t('admin.orders.updated_at')}</label>
                    <p className="text-gray-900">
                      {new Date(selectedOrder.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedOrder(null)} variant="outline">
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageOrders;

