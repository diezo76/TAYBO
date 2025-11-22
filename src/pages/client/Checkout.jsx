/**
 * Page Checkout
 * 
 * Formulaire de commande avec :
 * - Adresse de livraison
 * - Sélection du mode de paiement
 * - Livraison programmée (optionnelle)
 * - Récapitulatif de la commande
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CreditCard, Wallet, Smartphone, Banknote, Calendar } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { getRestaurantById } from '../../services/restaurantService';
import { createOrder, createOrderCheckout } from '../../services/orderService';
import Button from '../../components/common/Button';

function Checkout() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    cartItems,
    currentRestaurantId,
    getSubtotal,
    getServiceFee,
    getTotal,
    isEmpty,
    clearCart,
  } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    phone: user?.phone || '',
    paymentMethod: 'cash', // cash, card, paymob, fawry
    scheduledDelivery: false,
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/client/login');
      return;
    }

    if (isEmpty || !currentRestaurantId) {
      navigate('/client/cart');
      return;
    }

    loadRestaurant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isEmpty, currentRestaurantId]); // Utiliser user?.id pour éviter les rechargements

  const loadRestaurant = async () => {
    if (!currentRestaurantId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getRestaurantById(currentRestaurantId);
      setRestaurant(data);
    } catch (error) {
      console.error('Erreur chargement restaurant:', error);
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.address || !formData.city || !formData.phone) {
      alert(t('checkout.fill_required_fields'));
      return;
    }

    if (formData.scheduledDelivery && (!formData.scheduledDate || !formData.scheduledTime)) {
      alert(t('checkout.fill_scheduled_delivery'));
      return;
    }

    setSubmitting(true);

    try {
      const subtotal = getSubtotal();
      const serviceFee = getServiceFee();
      const total = getTotal();

      // Préparer les données de la commande
      const orderItems = cartItems.map(item => ({
        menu_item_id: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations || {},
      }));

      // Calculer la date de livraison programmée si nécessaire
      let scheduledDeliveryTime = null;
      if (formData.scheduledDelivery && formData.scheduledDate && formData.scheduledTime) {
        scheduledDeliveryTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
      }

      // Vérifier que user.id est défini
      if (!user || !user.id) {
        alert('Erreur : Vous devez être connecté pour passer une commande');
        navigate('/client/login');
        return;
      }

      const orderData = {
        userId: user.id,
        restaurantId: currentRestaurantId,
        items: orderItems,
        subtotal: subtotal,
        serviceFee: serviceFee,
        paymentMethod: formData.paymentMethod,
        scheduledDeliveryTime: scheduledDeliveryTime,
        commissionRate: 0.15, // 15% par défaut
      };

      // Créer la commande d'abord
      const result = await createOrder(orderData);
      console.log('Checkout: Résultat création commande:', result);

      if (!result.success) {
        console.error('Checkout: Erreur création commande:', result.error);
        alert(result.error || t('checkout.order_error'));
        return;
      }

      console.log('Checkout: Commande créée avec succès, ID:', result.order.id);

      // Si le paiement est par carte, créer une session Stripe Checkout
      if (formData.paymentMethod === 'card') {
        console.log('Checkout: Création session Stripe Checkout pour commande:', result.order.id);
        const checkoutResult = await createOrderCheckout(result.order.id);
        
        if (checkoutResult.success && checkoutResult.checkout_url) {
          console.log('Checkout: Redirection vers Stripe Checkout');
          // Rediriger vers Stripe Checkout
          window.location.href = checkoutResult.checkout_url;
          return;
        } else {
          console.error('Checkout: Erreur création checkout Stripe:', checkoutResult.error);
          alert(checkoutResult.error || 'Erreur lors de la création du paiement. Veuillez réessayer.');
          return;
        }
      }

      // Pour les autres modes de paiement (cash, etc.), rediriger vers la confirmation
      console.log('Checkout: Redirection vers /client/orders/' + result.order.id);
      navigate(`/client/orders/${result.order.id}`, {
        state: { order: result.order },
        replace: true, // Empêche de revenir en arrière vers le checkout
      });
      
      // Vider le panier APRÈS la redirection pour éviter la redirection vers le panier vide
      setTimeout(() => {
        clearCart();
      }, 100);
    } catch (error) {
      console.error('Erreur création commande:', error);
      alert(t('checkout.order_error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant || isEmpty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">{t('checkout.cart_empty')}</p>
          <Button onClick={() => navigate('/client/cart')}>
            Retour
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const serviceFee = getServiceFee();
  const total = getTotal();

  // Générer les options d'heures pour la livraison programmée
  const timeOptions = [];
  for (let hour = 9; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  // Date minimale = aujourd'hui
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button
            onClick={() => navigate('/client/cart')}
            className="flex items-center gap-2 text-gray-700 hover:text-primary mb-2 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('checkout.title')}</h1>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Informations de livraison */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                {t('checkout.delivery_info')}
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.address')} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('checkout.address_placeholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.city')} *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t('checkout.city_placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={t('checkout.phone_placeholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.notes')}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder={t('checkout.notes_placeholder')}
                  />
                </div>
              </div>
            </div>

            {/* Livraison programmée */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {t('client.scheduled_delivery')}
                </h2>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="scheduledDelivery"
                  checked={formData.scheduledDelivery}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-xs sm:text-sm text-gray-700">
                  {t('checkout.schedule_delivery')}
                </span>
              </label>

              {formData.scheduledDelivery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.delivery_date')} *
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      min={minDate}
                      required={formData.scheduledDelivery}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      {t('checkout.delivery_time')} *
                    </label>
                    <select
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      required={formData.scheduledDelivery}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">{t('checkout.select_time')}</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Mode de paiement */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                {t('client.payment_method')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Cash on Delivery */}
                <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.paymentMethod === 'cash'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <Banknote className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{t('checkout.cash_on_delivery')}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t('checkout.pay_on_delivery')}</div>
                  </div>
                </label>

                {/* Card */}
                <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.paymentMethod === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">{t('checkout.card')}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t('checkout.card_description')}</div>
                  </div>
                </label>

                {/* Paymob */}
                <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.paymentMethod === 'paymob'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paymob"
                    checked={formData.paymentMethod === 'paymob'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">Paymob</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t('checkout.paymob_description')}</div>
                  </div>
                </label>

                {/* Fawry */}
                <label className={`relative flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.paymentMethod === 'fawry'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="fawry"
                    checked={formData.paymentMethod === 'fawry'}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-primary mr-2 sm:mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">Fawry</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t('checkout.fawry_description')}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-20 sm:top-24">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                {t('checkout.summary')}
              </h2>

              {/* Restaurant */}
              <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                <p className="font-medium text-gray-900 text-sm sm:text-base">{restaurant.name}</p>
                <p className="text-xs sm:text-sm text-gray-600">{restaurant.cuisine_type}</p>
              </div>

              {/* Articles */}
              <div className="mb-3 sm:mb-4 space-y-1.5 sm:space-y-2">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 truncate pr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium flex-shrink-0">
                      {(item.price * item.quantity).toFixed(2)} EGP
                    </span>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                  <span>{t('client.subtotal')}</span>
                  <span>{subtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
                  <span>{t('client.service_fee')}</span>
                  <span>{serviceFee.toFixed(2)} EGP</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                    <span>{t('client.total')}</span>
                    <span>{total.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                className="w-full text-sm sm:text-base"
                size="lg"
                disabled={submitting}
              >
                {submitting ? t('checkout.placing_order') : t('checkout.place_order')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;

