/**
 * Composant ReviewForm - Formulaire pour créer/modifier un avis
 * 
 * Ce composant permet de :
 * - Sélectionner une note (1-5 étoiles)
 * - Ajouter un commentaire
 * - Créer ou modifier un avis
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Loader2 } from 'lucide-react';
import Button from './Button';

function ReviewForm({ orderId, restaurantId, userId, existingReview = null, onSubmit, onCancel }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rating) {
      setError(t('reviews.error_rating_required'));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmit({
        rating,
        comment: comment.trim() || null,
      });
    } catch (err) {
      setError(err.message || t('reviews.error_submit'));
    } finally {
      setSubmitting(false);
    }
  };

  // Rendre les étoiles interactives
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 ${
              i <= (hoveredRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      );
    }
    return stars;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('reviews.rating')} *
        </label>
        <div className="flex items-center gap-2">
          {renderStars()}
          {rating > 0 && (
            <span className="text-sm text-gray-600 ml-2">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('reviews.comment')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('reviews.comment_placeholder')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={submitting || !rating}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t('common.submitting')}
            </>
          ) : (
            existingReview ? t('reviews.update') : t('reviews.submit')
          )}
        </Button>
      </div>
    </form>
  );
}

export default ReviewForm;

