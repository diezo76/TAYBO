/**
 * Page Favoris
 * 
 * Affiche les restaurants et plats favoris de l'utilisateur.
 * Permet de supprimer des favoris et de naviguer vers les restaurants/plats.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Star, Clock, Bike, Trash2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUserFavorites,
  removeRestaurantFromFavorites,
  removeMenuItemFromFavorites,
} from '../../services/favoritesService';
import Button from '../../components/common/Button';
import RestaurantCard from '../../components/client/RestaurantCard';
import { getMenuImageUrl } from '../../utils/imageUtils';

function Favorites() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [restaurantFavorites, setRestaurantFavorites] = useState([]);
  const [menuItemFavorites, setMenuItemFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants' ou 'menuItems'

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Utiliser user?.id pour éviter les rechargements inutiles

  const loadFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const favorites = await getUserFavorites(user.id);
      setRestaurantFavorites(favorites?.restaurants || []);
      setMenuItemFavorites(favorites?.menuItems || []);
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
      setRestaurantFavorites([]);
      setMenuItemFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRestaurantFavorite = async (favoriteId, restaurantId) => {
    if (!user) return;

    try {
      await removeRestaurantFromFavorites(user.id, restaurantId);
      setRestaurantFavorites(prev =>
        prev.filter(fav => fav.id !== favoriteId)
      );
    } catch (error) {
      console.error('Erreur suppression favori restaurant:', error);
      alert(t('favorites.remove_error'));
    }
  };

  const handleRemoveMenuItemFavorite = async (favoriteId, menuItemId) => {
    if (!user) return;

    try {
      await removeMenuItemFromFavorites(user.id, menuItemId);
      setMenuItemFavorites(prev =>
        prev.filter(fav => fav.id !== favoriteId)
      );
    } catch (error) {
      console.error('Erreur suppression favori plat:', error);
      alert(t('favorites.remove_error'));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('favorites.login_required')}
          </h2>
          <p className="text-gray-600 mb-6">
            {t('favorites.login_message')}
          </p>
          <Button onClick={() => navigate('/client/login')}>
            {t('common.login')}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasRestaurants = restaurantFavorites.length > 0;
  const hasMenuItems = menuItemFavorites.length > 0;
  const isEmpty = !hasRestaurants && !hasMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-primary mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            {t('client.favorites')}
          </h1>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-8">
        {isEmpty ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('favorites.empty_title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('favorites.empty_message')}
            </p>
            <Button onClick={() => navigate('/')}>
              {t('favorites.browse_restaurants')}
            </Button>
          </div>
        ) : (
          <>
            {/* Onglets */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === 'restaurants'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('favorites.restaurants')} ({restaurantFavorites.length})
              </button>
              <button
                onClick={() => setActiveTab('menuItems')}
                className={`pb-3 px-4 font-medium transition-colors ${
                  activeTab === 'menuItems'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('favorites.menu_items')} ({menuItemFavorites.length})
              </button>
            </div>

            {/* Restaurants favoris */}
            {activeTab === 'restaurants' && (
              <div>
                {hasRestaurants ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurantFavorites.map((favorite) => {
                      const restaurant = favorite.restaurants;
                      if (!restaurant) return null;

                      return (
                        <div key={favorite.id} className="relative">
                          <RestaurantCard
                            restaurant={restaurant}
                            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                          />
                          <button
                            onClick={() =>
                              handleRemoveRestaurantFavorite(favorite.id, restaurant.id)
                            }
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                            title={t('favorites.remove')}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">{t('favorites.no_restaurants')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Plats favoris */}
            {activeTab === 'menuItems' && (
              <div>
                {hasMenuItems ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItemFavorites.map((favorite) => {
                      const menuItem = favorite.menu_items;
                      const restaurant = menuItem?.restaurants;
                      if (!menuItem) return null;

                      return (
                        <div
                          key={favorite.id}
                          className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow relative"
                        >
                          <button
                            onClick={() =>
                              handleRemoveMenuItemFavorite(favorite.id, menuItem.id)
                            }
                            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                            title={t('favorites.remove')}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>

                          {menuItem.image_url && (
                            <img
                              src={getMenuImageUrl(menuItem.image_url)}
                              alt={menuItem.name}
                              className="w-full h-48 object-cover rounded-lg mb-4"
                              onError={(e) => {
                                console.error('[Favorites] Erreur chargement image menu:', menuItem.id);
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {menuItem.name}
                          </h3>
                          {menuItem.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {menuItem.description}
                            </p>
                          )}
                          {restaurant && (
                            <p className="text-sm text-primary mb-2">
                              {restaurant.name}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">
                              {parseFloat(menuItem.price).toFixed(2)} EGP
                            </span>
                            <Button
                              size="sm"
                              onClick={() =>
                                restaurant &&
                                navigate(`/restaurant/${restaurant.id}`)
                              }
                            >
                              {t('favorites.view_restaurant')}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">{t('favorites.no_menu_items')}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Favorites;

