/**
 * Composant RestaurantCard
 * 
 * Affiche une carte pour un restaurant dans la liste.
 * Design inspiré d'Uber Eats avec image, nom, note, type de cuisine, etc.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Bike } from 'lucide-react';
import { RestaurantFavoriteButton } from '../common/FavoriteButton';
import { getRestaurantImageUrl } from '../../utils/imageUtils';
import { validateAndFixRestaurantImage } from '../../utils/imageValidation';
import LazyImage from '../common/LazyImage';

function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [validatedImageUrl, setValidatedImageUrl] = useState(null);
  const hasValidatedRef = useRef(false);

  /**
   * Fonction appelée quand on clique sur la carte
   * Redirige vers la page de détail du restaurant
   */
  const handleClick = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  // Obtenir l'URL publique de l'image
  const originalImageUrl = restaurant.image_url ? getRestaurantImageUrl(restaurant.image_url) : null;

  // Valider et corriger l'image si nécessaire (une seule fois au chargement)
  useEffect(() => {
    if (!originalImageUrl || !restaurant.id) {
      setValidatedImageUrl(originalImageUrl);
      hasValidatedRef.current = false;
      return;
    }

    // Valider l'image seulement une fois par restaurant/URL
    if (!hasValidatedRef.current) {
      hasValidatedRef.current = true;
      validateAndFixRestaurantImage(originalImageUrl, restaurant.id)
        .then((correctedUrl) => {
          setValidatedImageUrl(correctedUrl || originalImageUrl);
        })
        .catch(() => {
          // En cas d'erreur, utiliser l'URL originale
          setValidatedImageUrl(originalImageUrl);
        });
    }
  }, [originalImageUrl, restaurant.id]);

  // Utiliser l'URL validée ou l'URL originale en fallback
  const imageUrl = validatedImageUrl !== null ? validatedImageUrl : originalImageUrl;

  // Gérer l'erreur de chargement de l'image
  const handleImageError = (e) => {
    // Ne pas logger l'erreur si l'image a déjà été marquée comme erreur
    // pour éviter les logs répétés
    if (!imageError) {
      const attemptedUrl = e.target?.src || imageUrl;
      
      // Logger seulement en mode développement avec moins de verbosité
      if (import.meta.env.DEV) {
        console.warn(`[RestaurantCard] Image non disponible pour "${restaurant.name}"`, {
          url: attemptedUrl,
          restaurantId: restaurant.id,
          hint: 'Vérifiez que le fichier existe dans le bucket Supabase Storage et que les permissions sont correctes.',
        });
      }
      
      setImageError(true);
      
      // La validation automatique a déjà été effectuée dans useEffect
      // Ici on log juste pour le débogage
      if (import.meta.env.DEV) {
        console.warn(`[RestaurantCard] Image non disponible après validation pour "${restaurant.name}"`);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className="card-soft-md overflow-hidden cursor-pointer hover:shadow-soft-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image du restaurant */}
      <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200">
        {imageUrl && !imageError ? (
          <LazyImage
            src={imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
            placeholder={{
              color: '#f3f4f6',
              text: '',
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Bike className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-gray-500">Image non disponible</p>
            </div>
          </div>
        )}

        {/* Bouton favoris */}
        <div className="absolute top-2 right-2">
          <RestaurantFavoriteButton restaurantId={restaurant.id} />
        </div>

        {/* Badge promotion si applicable */}
        {/* Note: Les promotions seront ajoutées plus tard */}
      </div>

      {/* Informations du restaurant */}
      <div className="p-4">
        {/* Nom et note */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {restaurant.name}
          </h3>
          {restaurant.average_rating > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm font-medium">
                {restaurant.average_rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Type de cuisine */}
        <p className="text-sm text-gray-600 mb-3">
          {restaurant.cuisine_type}
        </p>

        {/* Infos livraison */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>25-35 min</span>
          </div>
        </div>

        {/* Nombre d'avis */}
        {restaurant.total_reviews > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {restaurant.total_reviews} avis
          </p>
        )}
      </div>
    </div>
  );
}

export default RestaurantCard;


