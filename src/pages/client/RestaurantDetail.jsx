/**
 * Page détail restaurant
 * 
 * Affiche les informations complètes d'un restaurant et son menu.
 * Permet d'ajouter des plats au panier.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Clock, Bike, ArrowLeft, Plus, Minus } from 'lucide-react';
import { getRestaurantById, getRestaurantMenu } from '../../services/restaurantService';
import { getRestaurantReviews } from '../../services/reviewService';
import { useCart } from '../../contexts/CartContext';
import { RestaurantFavoriteButton, MenuItemFavoriteButton } from '../../components/common/FavoriteButton';
import ReviewCard from '../../components/common/ReviewCard';
import Button from '../../components/common/Button';
import LazyImage from '../../components/common/LazyImage';
import { getRestaurantImageUrl, getMenuImageUrl } from '../../utils/imageUtils';

function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart, currentRestaurantId } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    loadRestaurantData();
  }, [id]);

  // Fonction helper pour obtenir le nom français de la catégorie
  const getCategoryName = (category) => {
    const categoryMap = {
      'entrée': 'Entrée',
      'entree': 'Entrée',
      'plat': 'Plat',
      'dessert': 'Dessert',
      'boisson': 'Boisson'
    };
    return categoryMap[category] || category;
  };

  const loadRestaurantData = async () => {
    setLoading(true);
    try {
      const [restaurantData, menuData, reviewsData] = await Promise.all([
        getRestaurantById(id),
        getRestaurantMenu(id),
        getRestaurantReviews(id).catch(() => []), // Ne pas bloquer si erreur
      ]);
      setRestaurant(restaurantData);
      setMenuItems(menuData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Erreur chargement restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    // Vérifier si on peut ajouter au panier (même restaurant ou panier vide)
    if (currentRestaurantId && currentRestaurantId !== restaurant.id) {
      if (window.confirm('Votre panier contient des articles d\'un autre restaurant. Voulez-vous vider le panier et ajouter cet article ?')) {
        addToCart({
          menuItemId: item.id,
          name: item.name,
          price: parseFloat(item.price),
          restaurantId: restaurant.id,
          customizations: {},
        });
      }
    } else {
      addToCart({
        menuItemId: item.id,
        name: item.name,
        price: parseFloat(item.price),
        restaurantId: restaurant.id,
        customizations: {},
      });
    }
  };

  const updateQuantity = (itemId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Restaurant introuvable</p>
          <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
        </div>
      </div>
    );
  }

  // Grouper les plats par catégorie
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Ordre défini pour l'affichage des catégories (plat en premier)
  const categoryOrder = ['plat', 'entrée', 'dessert', 'boisson'];
  
  // Trier les catégories selon l'ordre défini
  const sortedCategories = categoryOrder.filter(cat => menuByCategory[cat] && menuByCategory[cat].length > 0);

  return (
    <div className="min-h-screen">
      {/* Header avec retour */}
      <div className="card-soft border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Retour</span>
          </button>
        </div>
      </div>

      {/* Informations restaurant */}
      <div className="card-soft border-b border-gray-200">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">{restaurant.name}</h1>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">{restaurant.description || restaurant.cuisine_type}</p>
            </div>
            <div className="flex-shrink-0">
              <RestaurantFavoriteButton restaurantId={restaurant.id} />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
            {restaurant.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-primary text-primary" />
                <span className="font-medium">{restaurant.average_rating.toFixed(1)}</span>
                <span className="hidden sm:inline">({restaurant.total_reviews} avis)</span>
                <span className="sm:hidden">({restaurant.total_reviews})</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>25-35 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {sortedCategories.length === 0 ? (
          <p className="text-center text-gray-600 text-sm sm:text-base">Aucun plat disponible pour le moment</p>
        ) : (
          sortedCategories.map((category) => {
            const items = menuByCategory[category];
            return (
            <div key={category} className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 capitalize">
                {getCategoryName(category)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="card-soft-md p-4 hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex gap-3 sm:gap-4">
                      {item.image_url && (
                        <LazyImage
                          src={getMenuImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            console.error('[RestaurantDetail] Erreur chargement image menu:', item.id);
                            if (e.target) {
                              e.target.style.display = 'none';
                            }
                          }}
                          placeholder={{
                            color: '#f3f4f6',
                            text: '',
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <h3 className="font-semibold text-gray-900 flex-1 text-sm sm:text-base break-words">{item.name}</h3>
                          <MenuItemFavoriteButton menuItemId={item.id} />
                        </div>
                        {item.description && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-primary text-sm sm:text-base">
                            {parseFloat(item.price).toFixed(2)} EGP
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            className="flex-shrink-0"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            );
          })
        )}

        {/* Section Avis */}
        <div className="mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Avis ({reviews.length})
            </h2>
            {reviews.length > 0 && (
              <Button
                onClick={() => setShowReviews(!showReviews)}
                variant="outline"
                className="text-sm"
              >
                {showReviews ? t('restaurant.hide_reviews') : t('restaurant.show_reviews')}
              </Button>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="card-soft-md p-12 text-center">
              <p className="text-gray-600">{t('restaurant.no_reviews')}</p>
            </div>
          ) : showReviews ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="card-soft-md p-6">
              <p className="text-gray-600 text-center">
                {t('restaurant.click_to_see_reviews')}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RestaurantDetail;


