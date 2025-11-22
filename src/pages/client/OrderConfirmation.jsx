/**
 * Page OrderConfirmation
 * 
 * Affiche les détails d'une commande après sa création
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ArrowLeft, Package, Calendar, CreditCard, MapPin, Truck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrderById } from '../../services/orderService';
import Button from '../../components/common/Button';

function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    try {
      const data = await getOrderById(id);
      console.log('OrderConfirmation: Données commande chargées:', data);
      if (data && data.user_id === user.id) {
        setOrder(data);
      } else {
        console.warn('OrderConfirmation: Commande non trouvée ou n\'appartient pas à l\'utilisateur');
        navigate('/client/orders');
      }
    } catch (error) {
      console.error('Erreur chargement commande:', error);
      navigate('/client/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/client/login');
      return;
    }

    // Vérifier si c'est un retour de Stripe
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (paymentStatus === 'success' && sessionId && id) {
      // Recharger la commande pour obtenir le statut de paiement mis à jour
      console.log('OrderConfirmation: Retour de Stripe, rechargement de la commande');
      loadOrder();
      // Nettoyer les paramètres de l'URL
      navigate(`/client/orders/${id}`, { replace: true });
    } else if (location.state?.order) {
      // Si la commande est passée via location.state, l'utiliser directement
      console.log('OrderConfirmation: Commande reçue via location.state', location.state.order);
      setOrder(location.state.order);
      setLoading(false);
    } else if (id) {
      // Sinon, charger depuis l'API
      console.log('OrderConfirmation: Chargement commande depuis API avec ID:', id);
      loadOrder();
    } else {
      console.warn('OrderConfirmation: Pas d\'ID de commande, redirection vers /client/orders');
      navigate('/client/orders');
    }
  }, [id, user, location.state, searchParams]);

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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPaymentMethod = (method) => {
    const methodMap = {
      cash: t('checkout.cash_on_delivery'),
      card: t('checkout.card'),
      paymob: 'Paymob',
      fawry: 'Fawry',
    };
    return methodMap[method] || method;
  };

  const handleInDriveRedirect = () => {
    // URL du site web inDrive pour l'Égypte
    const inDriveWebUrl = 'https://indrive.com/en-eg';
    
    // Essayer d'abord d'ouvrir l'app mobile via deep link (si disponible)
    // Note: Les deep links exacts pour inDrive ne sont pas documentés publiquement
    // On utilise donc une redirection vers le site web qui détectera automatiquement
    // si l'app est installée et proposera de l'ouvrir
    
    // Pour iOS
    const iOSDeepLink = 'indrive://';
    // Pour Android
    const androidDeepLink = 'intent://#Intent;scheme=indrive;package=com.indriver;end';
    
    // Détecter la plateforme
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /android/i.test(userAgent);
    
    if (isMobile) {
      if (isIOS) {
        // Essayer d'ouvrir l'app iOS, sinon rediriger vers le site web
        window.location.href = iOSDeepLink;
        setTimeout(() => {
          window.location.href = inDriveWebUrl;
        }, 500);
      } else if (isAndroid) {
        // Essayer d'ouvrir l'app Android, sinon rediriger vers le site web
        window.location.href = androidDeepLink;
        setTimeout(() => {
          window.location.href = inDriveWebUrl;
        }, 500);
      } else {
        // Autre mobile, rediriger vers le site web
        window.open(inDriveWebUrl, '_blank');
      }
    } else {
      // Desktop, ouvrir dans un nouvel onglet
      window.open(inDriveWebUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">{t('order_confirmation.not_found')}</p>
          <Button onClick={() => navigate('/client/orders')}>
            {t('order_confirmation.back_to_orders')}
          </Button>
        </div>
      </div>
    );
  }

  // Gérer le cas où restaurants peut être un objet (relation Supabase) ou null
  const restaurant = order.restaurants && typeof order.restaurants === 'object' && !Array.isArray(order.restaurants) 
    ? order.restaurants 
    : {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/client/orders')}
            className="flex items-center gap-2 text-gray-700 hover:text-primary mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-900">{t('order_confirmation.title')}</h1>
          </div>
          <p className="text-gray-600 mt-2">{t('order_confirmation.subtitle')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Carte de confirmation */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('order_confirmation.order_number')} #{order.id.slice(0, 8)}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {t('order_confirmation.placed_on')} {formatDate(order.created_at)}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </div>

          {/* Informations du restaurant */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t('order_confirmation.restaurant_info')}
            </h2>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">{restaurant.name}</p>
              {restaurant.cuisine_type && (
                <p className="text-sm text-gray-600">{restaurant.cuisine_type}</p>
              )}
            </div>
          </div>

          {/* Articles commandés */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('orders.items')}
            </h2>
            <div className="space-y-4">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start py-3 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {Object.entries(item.customizations).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {value}
                          </span>
                        ))}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-gray-900">
                      {item.quantity} x {parseFloat(item.price).toFixed(2)} EGP
                    </p>
                    <p className="text-sm text-gray-600">
                      {(item.quantity * parseFloat(item.price)).toFixed(2)} EGP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t('checkout.summary')}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>{t('orders.subtotal')}</span>
                <span>{parseFloat(order.subtotal).toFixed(2)} EGP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('orders.service_fee')}</span>
                <span>{parseFloat(order.delivery_fee || 0).toFixed(2)} EGP</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>{t('orders.total')}</span>
                  <span>{parseFloat(order.total).toFixed(2)} EGP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de paiement */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {t('orders.payment_method')}
            </h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">{t('orders.payment_method')}:</span>{' '}
                {formatPaymentMethod(order.payment_method)}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">{t('orders.payment_status')}:</span>{' '}
                <span className={`px-2 py-1 rounded text-sm ${
                  order.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : order.payment_status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.payment_status === 'paid'
                    ? t('orders.paid')
                    : order.payment_status === 'failed'
                    ? t('orders.failed')
                    : t('orders.pending_payment')}
                </span>
              </p>
            </div>
          </div>

          {/* Livraison programmée */}
          {order.scheduled_delivery_time && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {t('orders.scheduled_delivery')}
              </h2>
              <p className="text-gray-700">
                {formatDate(order.scheduled_delivery_time)}
              </p>
            </div>
          )}

          {/* Section Livraison avec inDrive */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Besoin d'un coursier pour la livraison ?
                </h2>
                <p className="text-gray-600 text-sm">
                  Commandez un coursier via inDrive pour récupérer votre commande au restaurant et vous la livrer.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInDriveRedirect}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              <Truck className="w-6 h-6" />
              {t('order_confirmation.order_courier_indrive')}
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/client/orders')}
                variant="outline"
                className="flex-1"
              >
                {t('order_confirmation.view_all_orders')}
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex-1"
              >
                {t('order_confirmation.continue_shopping')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;

