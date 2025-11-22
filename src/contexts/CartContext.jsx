/**
 * Contexte Panier (Cart)
 * 
 * Ce contexte gère le panier d'achat du client.
 * Il stocke les articles sélectionnés, calcule les totaux,
 * et persiste les données dans localStorage.
 */

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

/**
 * Provider du contexte Panier
 */
export function CartProvider({ children }) {
  // État du panier : tableau d'articles
  // Chaque article contient : { menuItemId, name, price, quantity, customizations, restaurantId }
  const [cartItems, setCartItems] = useState([]);
  
  // Restaurant actuel du panier (on ne peut commander que d'un restaurant à la fois)
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('taybo-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed.items || []);
        setCurrentRestaurantId(parsed.restaurantId || null);
      } catch (error) {
        console.error('Erreur chargement panier:', error);
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('taybo-cart', JSON.stringify({
      items: cartItems,
      restaurantId: currentRestaurantId,
    }));
  }, [cartItems, currentRestaurantId]);

  /**
   * Ajoute un article au panier
   * @param {Object} item - Article à ajouter
   * @param {string} item.menuItemId - ID du plat
   * @param {string} item.name - Nom du plat
   * @param {number} item.price - Prix unitaire
   * @param {string} item.restaurantId - ID du restaurant
   * @param {Object} item.customizations - Personnalisations (options, extras, etc.)
   */
  const addToCart = (item) => {
    setCartItems(prev => {
      // Si le panier contient déjà des articles d'un autre restaurant, vider le panier
      if (currentRestaurantId && currentRestaurantId !== item.restaurantId) {
        setCurrentRestaurantId(item.restaurantId);
        return [{
          ...item,
          quantity: 1,
        }];
      }

      // Si c'est le même restaurant, vérifier si l'article existe déjà
      const existingItemIndex = prev.findIndex(
        cartItem => cartItem.menuItemId === item.menuItemId &&
        JSON.stringify(cartItem.customizations) === JSON.stringify(item.customizations)
      );

      if (existingItemIndex >= 0) {
        // Si l'article existe déjà avec les mêmes personnalisations, augmenter la quantité
        const updated = [...prev];
        updated[existingItemIndex].quantity += 1;
        return updated;
      } else {
        // Sinon, ajouter un nouvel article
        setCurrentRestaurantId(item.restaurantId);
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  /**
   * Supprime un article du panier
   * @param {number} index - Index de l'article dans le panier
   */
  const removeFromCart = (index) => {
    setCartItems(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Si le panier est vide, réinitialiser le restaurant
      if (updated.length === 0) {
        setCurrentRestaurantId(null);
      }
      return updated;
    });
  };

  /**
   * Met à jour la quantité d'un article
   * @param {number} index - Index de l'article
   * @param {number} quantity - Nouvelle quantité
   */
  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCartItems(prev => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  /**
   * Vide complètement le panier
   */
  const clearCart = () => {
    setCartItems([]);
    setCurrentRestaurantId(null);
  };

  /**
   * Calcule le sous-total du panier
   */
  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  /**
   * Calcule le service fee (5% du subtotal)
   */
  const getServiceFee = () => {
    const subtotal = getSubtotal();
    return subtotal * 0.05; // 5% du subtotal
  };

  /**
   * Calcule le total avec service fee
   */
  const getTotal = () => {
    return getSubtotal() + getServiceFee();
  };

  /**
   * Récupère le nombre total d'articles dans le panier
   */
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    currentRestaurantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getServiceFee,
    getTotal,
    getTotalItems,
    isEmpty: cartItems.length === 0,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte Panier
 */
export function useCart() {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart doit être utilisé à l\'intérieur d\'un CartProvider');
  }
  
  return context;
}


