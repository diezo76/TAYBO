/**
 * Composant ReviewCard - Affiche un avis
 * 
 * Ce composant affiche un avis avec :
 * - La note (étoiles)
 * - Le commentaire
 * - L'utilisateur et la date
 */

import { useTranslation } from 'react-i18next';
import { Star, User, Calendar } from 'lucide-react';

function ReviewCard({ review, showActions = false, onEdit, onDelete }) {
  const { t } = useTranslation();

  // Rendre les étoiles
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="card-soft-md p-6 border-l-4 border-primary">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {review.users?.first_name} {review.users?.last_name}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {renderStars(review.rating)}
            <span className="text-sm text-gray-600">({review.rating}/5)</span>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(review)}
                className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded transition-colors"
              >
                {t('reviews.edit')}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                {t('reviews.delete')}
              </button>
            )}
          </div>
        )}
      </div>
      {review.comment && (
        <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
      )}
    </div>
  );
}

export default ReviewCard;

