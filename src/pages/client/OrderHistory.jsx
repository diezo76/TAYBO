/**
 * Page OrderHistory
 * 
 * Affiche l'historique des commandes d'un client
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Clock, CheckCircle, XCircle, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserOrders } from '../../services/orderService';
import { getUserReviewForOrder, createReview, updateReview } from '../../services/reviewService';
import { useRealtimeClientOrders } from '../../hooks/useRealtimeOrders';
import ReviewForm from '../../components/common/ReviewForm';
import Button from '../../components/common/Button';

function OrderHistory() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, delivered, cancelled
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [existingReviews, setExistingReviews] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/client/login');
      return;
    }

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Retirer filter des dépendances car il est géré par filteredOrders

  // Écouter les changements de commandes en temps réel
  useRealtimeClientOrders(user?.id, (updatedOrder) => {
    // Mettre à jour la commande dans la liste
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === updatedOrder.id ? { ...order, ...updatedOrder } : order
      )
    );
  });

  const loadOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getUserOrders(user.id);
      setOrders(data || []);
      
      // Charger les avis existants pour les commandes livrées
      const reviewsMap = {};
      for (const order of data || []) {
        if (order.status === 'delivered') {
          try {
            const review = await getUserReviewForOrder(user.id, order.id);
            if (review) {
              reviewsMap[order.id] = review;
            }
          } catch (error) {
            // Pas d'avis existant, c'est normal
          }
        }
      }
      setExistingReviews(reviewsMap);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (orderId, reviewData) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.restaurant_id) return;

    try {
      const existingReview = existingReviews[orderId];
      if (existingReview) {
        await updateReview(existingReview.id, reviewData);
      } else {
        await createReview({
          userId: user.id,
          restaurantId: order.restaurant_id,
          orderId: orderId,
          ...reviewData,
        });
      }
      
      // Recharger les commandes pour mettre à jour les avis
      await loadOrders();
      setReviewingOrder(null);
    } catch (error) {
      console.error('Erreur soumission avis:', error);
      alert(error.message || t('reviews.error_submit'));
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      pending: t('client.pending'),
      accepted: t('client.accepted'),
      preparing: t('client.preparing'),
      ready: t('client.ready'),
      delivering: t('client.delivering'),
      delivered: t('client.delivered'),
      cancelled: t('client.cancelled'),
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    if (status === 'delivered') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status === 'cancelled') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      delivering: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      return ['pending', 'accepted', 'preparing', 'ready', 'delivering'].includes(order.status);
    }
    if (filter === 'delivered') {
      return order.status === 'delivered';
    }
    if (filter === 'cancelled') {
      return order.status === 'cancelled';
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('order_history.title')}</h1>
          <p className="text-gray-600 mt-2">{t('order_history.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('order_history.all_orders')}
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('order_history.pending')}
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'delivered'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('order_history.delivered')}
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'cancelled'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('order_history.cancelled')}
          </button>
        </div>

        {/* Liste des commandes */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('order_history.no_orders')}
            </h2>
            <p className="text-gray-600 mb-6">{t('order_history.no_orders_message')}</p>
            <Button onClick={() => navigate('/')}>
              {t('order_history.browse_restaurants')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const restaurant = order.restaurants || {};
              const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/client/orders/${order.id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(order.status)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {restaurant.name || t('order_history.restaurant')}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {t('order_history.order_number')} {order.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span>{formatDate(order.created_at)}</span>
                        <span>
                          {itemCount} {itemCount > 1 ? t('order_history.items') : t('order_history.item')}
                        </span>
                        <span className="font-medium text-gray-900">
                          {parseFloat(order.total).toFixed(2)} EGP
                        </span>
                      </div>
                    </div>

                    {/* Statut et actions */}
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      {order.status === 'delivered' && !existingReviews[order.id] && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewingOrder(order);
                          }}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          {t('order_history.leave_review')}
                        </Button>
                      )}
                      {order.status === 'delivered' && existingReviews[order.id] && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewingOrder(order);
                          }}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {t('order_history.edit_review')}
                        </Button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/client/orders/${order.id}`);
                        }}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title={t('order_history.view_details')}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal avis */}
      {reviewingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {existingReviews[reviewingOrder.id]
                  ? t('reviews.edit_review')
                  : t('reviews.leave_review')}
              </h2>
              <button
                onClick={() => setReviewingOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ReviewForm
              orderId={reviewingOrder.id}
              restaurantId={reviewingOrder.restaurant_id}
              userId={user.id}
              existingReview={existingReviews[reviewingOrder.id]}
              onSubmit={(reviewData) => handleReviewSubmit(reviewingOrder.id, reviewData)}
              onCancel={() => setReviewingOrder(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;

