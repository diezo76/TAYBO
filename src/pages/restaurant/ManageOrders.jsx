/**
 * Page ManageOrders - Gestion des commandes pour les restaurants
 * 
 * Cette page permet aux restaurants de :
 * - Voir toutes leurs commandes
 * - Filtrer par statut
 * - Accepter/refuser des commandes
 * - Mettre à jour le statut des commandes
 * - Voir les détails de chaque commande
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantAuth } from '../../contexts/RestaurantAuthContext';
import { getRestaurantOrders, updateOrderStatus } from '../../services/restaurantStatsService';
import { useRealtimeRestaurantOrders } from '../../hooks/useRealtimeOrders';
import { Loader2, CheckCircle2, XCircle, ChefHat, Package, Truck, CheckCircle, LogOut, UtensilsCrossed, Menu as MenuIcon, Tag, Calendar, User } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

function ManageOrders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurant, loading: authLoading, logout } = useRestaurantAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Rediriger si pas connecté
  useEffect(() => {
    if (!authLoading && !restaurant) {
      navigate('/restaurant/login');
    }
  }, [restaurant, authLoading, navigate]);

  // Charger les commandes
  useEffect(() => {
    const loadOrders = async () => {
      if (!restaurant?.id) {
        setLoading(false);
        setOrders([]);
        setFilteredOrders([]);
        return;
      }
      
      setLoading(true);
      try {
        const restaurantOrders = await getRestaurantOrders(restaurant.id);
        setOrders(restaurantOrders || []);
        setFilteredOrders(restaurantOrders || []);
      } catch (error) {
        console.error('Erreur chargement commandes:', error);
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id]);

  // Filtrer les commandes par statut
  useEffect(() => {
    if (selectedStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

  // Écouter les nouvelles commandes en temps réel
  useRealtimeRestaurantOrders(restaurant?.id, (newOrder) => {
    // Si c'est une nouvelle commande, l'ajouter à la liste
    if (newOrder && !orders.find(o => o.id === newOrder.id)) {
      setOrders(prevOrders => [newOrder, ...prevOrders]);
    } else if (newOrder) {
      // Sinon, mettre à jour la commande existante
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === newOrder.id ? { ...order, ...newOrder } : order
        )
      );
    }
  });

  // Gérer l'acceptation d'une commande
  const handleAcceptOrder = async (orderId) => {
    if (!window.confirm(t('orders.confirm_accept'))) {
      return;
    }

    setUpdatingStatus(orderId);
    try {
      const result = await updateOrderStatus(orderId, 'accepted');
      if (result.success) {
        // Mettre à jour la liste des commandes
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'accepted' } : order
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: 'accepted' });
        }
        alert(t('orders.status_updated'));
      } else {
        alert(t('orders.accept_error'));
      }
    } catch (error) {
      console.error('Erreur acceptation commande:', error);
      alert(t('orders.accept_error'));
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Gérer le refus d'une commande
  const handleRejectOrder = async (orderId) => {
    if (!window.confirm(t('orders.confirm_reject'))) {
      return;
    }

    setUpdatingStatus(orderId);
    try {
      const result = await updateOrderStatus(orderId, 'cancelled');
      if (result.success) {
        // Mettre à jour la liste des commandes
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: 'cancelled' } : order
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
        }
        alert(t('orders.status_updated'));
      } else {
        alert(t('orders.reject_error'));
      }
    } catch (error) {
      console.error('Erreur refus commande:', error);
      alert(t('orders.reject_error'));
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Gérer la mise à jour du statut
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        // Mettre à jour la liste des commandes
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        alert(t('orders.status_updated'));
      } else {
        alert(t('orders.status_update_error'));
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      alert(t('orders.status_update_error'));
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Obtenir le nom du statut traduit
  const getStatusLabel = (status) => {
    return t(`client.${status}`);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivering: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Obtenir les boutons d'action selon le statut
  const getActionButtons = (order) => {
    const buttons = [];
    
    if (order.status === 'pending') {
      buttons.push(
        <button
          key="accept"
          onClick={() => handleAcceptOrder(order.id)}
          disabled={updatingStatus === order.id}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {updatingStatus === order.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {t('orders.accept')}
        </button>
      );
      buttons.push(
        <button
          key="reject"
          onClick={() => handleRejectOrder(order.id)}
          disabled={updatingStatus === order.id}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          {updatingStatus === order.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {t('orders.reject')}
        </button>
      );
    } else if (order.status === 'accepted') {
      buttons.push(
        <button
          key="preparing"
          onClick={() => handleUpdateStatus(order.id, 'preparing')}
          disabled={updatingStatus === order.id}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
        >
          {updatingStatus === order.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ChefHat className="w-4 h-4" />
          )}
          {t('orders.start_preparing')}
        </button>
      );
    } else if (order.status === 'preparing') {
      buttons.push(
        <button
          key="ready"
          onClick={() => handleUpdateStatus(order.id, 'ready')}
          disabled={updatingStatus === order.id}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {updatingStatus === order.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Package className="w-4 h-4" />
          )}
          {t('orders.mark_ready')}
        </button>
      );
    } else if (order.status === 'ready') {
      buttons.push(
        <button
          key="delivering"
          onClick={() => handleUpdateStatus(order.id, 'delivering')}
          disabled={updatingStatus === order.id}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          {updatingStatus === order.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Truck className="w-4 h-4" />
          )}
          {t('orders.start_delivery')}
        </button>
      );
    } else if (order.status === 'delivering') {
      buttons.push(
        <button
          key="delivered"
          onClick={() => handleUpdateStatus(order.id, 'delivered')}
          disabled={updatingStatus === order.id}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {updatingStatus === order.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {t('orders.mark_delivered')}
        </button>
      );
    }

    return buttons;
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Items de navigation pour la sidebar
  const sidebarItems = [
    {
      icon: <UtensilsCrossed className="w-5 h-5" />,
      label: 'Tableau de bord',
      path: '/restaurant/dashboard',
    },
    {
      icon: <MenuIcon className="w-5 h-5" />,
      label: t('menu.title'),
      path: '/restaurant/menu',
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Commandes',
      path: '/restaurant/orders',
    },
    {
      icon: <Tag className="w-5 h-5" />,
      label: 'Promotions',
      path: '/restaurant/promotions',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Horaires',
      path: '/restaurant/opening-hours',
    },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Profil',
      path: '/restaurant/profile',
    },
  ];

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/restaurant/login');
  };

  // Header content
  const headerContent = (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      <span>Déconnexion</span>
    </Button>
  );

  // Afficher un loader pendant le chargement
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Si pas de restaurant, ne rien afficher (redirection en cours)
  if (!restaurant) {
    return null;
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      headerContent={headerContent}
      title={t('orders.title')}
    >
        {/* Filtres */}
        <Card className="mb-6 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('orders.filter_by_status')}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value="all">{t('orders.all_orders')}</option>
            <option value="pending">{t('client.pending')}</option>
            <option value="accepted">{t('client.accepted')}</option>
            <option value="preparing">{t('client.preparing')}</option>
            <option value="ready">{t('client.ready')}</option>
            <option value="delivering">{t('client.delivering')}</option>
            <option value="delivered">{t('client.delivered')}</option>
            <option value="cancelled">{t('client.cancelled')}</option>
          </select>
        </Card>

        {/* Liste des commandes */}
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('orders.no_orders')}
            </h3>
            <p className="text-gray-600">{t('orders.no_orders_message')}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="p-6 hover:shadow-soft-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Informations de base */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {t('orders.order_id')} {order.id.slice(0, 8)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">{t('orders.customer')}:</span>{' '}
                        {order.users?.first_name} {order.users?.last_name}
                      </p>
                      <p>
                        <span className="font-medium">{t('orders.order_date')}:</span>{' '}
                        {formatDate(order.created_at)}
                      </p>
                      <p>
                        <span className="font-medium">{t('orders.total')}:</span>{' '}
                        {order.total.toFixed(2)} EGP
                      </p>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {t('orders.view_details')}
                    </button>
                    {getActionButtons(order)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      {/* Modal de détails de commande */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header du modal */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('orders.order_details')}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Informations de la commande */}
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('orders.order_id')}</p>
                    <p className="font-medium">{selectedOrder.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('orders.status')}</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('orders.customer_name')}</p>
                    <p className="font-medium">
                      {selectedOrder.users?.first_name} {selectedOrder.users?.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('orders.customer_phone')}</p>
                    <p className="font-medium">{selectedOrder.users?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('orders.order_date')}</p>
                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  {selectedOrder.scheduled_delivery_time && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('orders.scheduled_delivery')}</p>
                      <p className="font-medium">{formatDate(selectedOrder.scheduled_delivery_time)}</p>
                    </div>
                  )}
                </div>

                {/* Articles commandés */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('orders.items')}
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {t('orders.quantity')}: {item.quantity} × {item.price.toFixed(2)} EGP
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {(item.quantity * item.price).toFixed(2)} EGP
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Récapitulatif */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('orders.subtotal')}</span>
                    <span>{selectedOrder.subtotal.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('orders.service_fee')}</span>
                    <span>{selectedOrder.delivery_fee.toFixed(2)} EGP</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>{t('orders.total')}</span>
                    <span>{selectedOrder.total.toFixed(2)} EGP</span>
                  </div>
                </div>

                {/* Informations de paiement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('orders.payment_method')}</p>
                    <p className="font-medium">{t(`orders.${selectedOrder.payment_method}`)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t('orders.payment_status')}</p>
                    <p className="font-medium">
                      {selectedOrder.payment_status === 'paid' && t('orders.paid')}
                      {selectedOrder.payment_status === 'pending' && t('orders.pending_payment')}
                      {selectedOrder.payment_status === 'failed' && t('orders.failed')}
                    </p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {getActionButtons(selectedOrder)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ManageOrders;

