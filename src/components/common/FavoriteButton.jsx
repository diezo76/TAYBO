/**
 * Composant FavoriteButton
 * 
 * Bouton réutilisable pour ajouter/retirer des favoris (restaurants ou plats)
 */

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  addRestaurantToFavorites,
  addMenuItemToFavorites,
  removeRestaurantFromFavorites,
  removeMenuItemFromFavorites,
  isRestaurantFavorite,
  isMenuItemFavorite,
} from '../../services/favoritesService';

/**
 * Bouton favoris pour restaurant
 */
export function RestaurantFavoriteButton({ restaurantId, className = '' }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.id && restaurantId) {
      checkFavorite();
    } else {
      setIsFavorite(false);
    }
  }, [user, restaurantId]);

  const checkFavorite = async () => {
    if (!user || !user.id || !restaurantId) return;
    try {
      const favorite = await isRestaurantFavorite(user.id, restaurantId);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Erreur vérification favori:', error);
      setIsFavorite(false);
    }
  };

  const handleToggle = async (e) => {
    e.stopPropagation(); // Empêcher la propagation du clic
    if (!user || !user.id) {
      alert('Vous devez être connecté pour ajouter aux favoris');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await removeRestaurantFromFavorites(user.id, restaurantId);
        setIsFavorite(false);
      } else {
        await addRestaurantToFavorites(user.id, restaurantId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      alert('Erreur lors de la modification des favoris');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.id) {
    return null; // Ne pas afficher si non connecté ou si user.id n'est pas défini
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${
        isFavorite
          ? 'bg-primary text-white hover:bg-primary/90'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      } shadow-md hover:shadow-lg ${className}`}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
      />
    </button>
  );
}

/**
 * Bouton favoris pour plat
 */
export function MenuItemFavoriteButton({ menuItemId, className = '' }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.id && menuItemId) {
      checkFavorite();
    } else {
      setIsFavorite(false);
    }
  }, [user, menuItemId]);

  const checkFavorite = async () => {
    if (!user || !user.id || !menuItemId) return;
    try {
      const favorite = await isMenuItemFavorite(user.id, menuItemId);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Erreur vérification favori:', error);
      setIsFavorite(false);
    }
  };

  const handleToggle = async (e) => {
    e.stopPropagation(); // Empêcher la propagation du clic
    if (!user || !user.id) {
      alert('Vous devez être connecté pour ajouter aux favoris');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await removeMenuItemFromFavorites(user.id, menuItemId);
        setIsFavorite(false);
      } else {
        await addMenuItemToFavorites(user.id, menuItemId);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erreur toggle favori:', error);
      alert('Erreur lors de la modification des favoris');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.id) {
    return null; // Ne pas afficher si non connecté ou si user.id n'est pas défini
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-1.5 rounded-full transition-colors ${
        isFavorite
          ? 'bg-primary text-white hover:bg-primary/90'
          : 'bg-white text-gray-600 hover:bg-gray-100'
      } shadow-sm hover:shadow-md ${className}`}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
      />
    </button>
  );
}

