/**
 * Page Panier
 * 
 * Affiche le récapitulatif du panier avec possibilité de modifier les quantités,
 * supprimer des articles, et passer à la commande.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { getRestaurantById } from '../../services/restaurantService';
import Button from '../../components/common/Button';

function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    currentRestaurantId,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getServiceFee,
    getTotal,
    isEmpty,
  } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentRestaurantId) {
      loadRestaurant();
    } else {
      setLoading(false);
    }
  }, [currentRestaurantId]);

  const loadRestaurant = async () => {
    try {
      const data = await getRestaurantById(currentRestaurantId);
      setRestaurant(data);
    } catch (error) {
      console.error('Erreur chargement restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/client/login');
      return;
    }
    navigate('/client/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isEmpty || !restaurant) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <div className="card-soft border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
          </div>
        </div>

        {/* Panier vide */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="card-soft-md p-12 inline-block">
              <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Votre panier est vide
              </h2>
              <p className="text-gray-600 mb-6">
                Ajoutez des plats à votre panier pour commencer
              </p>
              <Button onClick={() => navigate('/')}>
                Parcourir les restaurants
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const serviceFee = getServiceFee();
  const total = getTotal();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="card-soft border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-primary mb-2 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Panier</h1>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2">
            {/* Informations restaurant */}
            <div className="card-soft-md p-3 sm:p-4 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                {restaurant.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">{restaurant.cuisine_type}</p>
            </div>

            {/* Articles du panier */}
            <div className="card-soft-md divide-y divide-gray-200">
              {cartItems.map((item, index) => (
                <div key={index} className="p-3 sm:p-4">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base break-words">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {parseFloat(item.price).toFixed(2)} EGP
                      </p>
                      
                      {/* Contrôles de quantité */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                        <span className="font-medium text-gray-900 w-6 sm:w-8 text-center text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between gap-2">
                      <span className="font-bold text-primary text-sm sm:text-base">
                        {(item.price * item.quantity).toFixed(2)} EGP
                      </span>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="card-soft-md p-4 sm:p-6 sticky top-20 sm:top-24">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Récapitulatif
              </h2>
              
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Services fee</span>
                  <span>{serviceFee.toFixed(2)} EGP</span>
                </div>
                <div className="border-t border-gray-200 pt-2 sm:pt-3">
                  <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{total.toFixed(2)} EGP</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full text-sm sm:text-base"
                size="lg"
              >
                Passer la commande
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

