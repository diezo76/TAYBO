/**
 * Composant Formulaire Promotion
 * 
 * Formulaire pour ajouter ou modifier une promotion
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createPromotion, updatePromotion } from '../../services/promotionService';
import { X, Loader2 } from 'lucide-react';

function PromotionForm({ restaurantId, editingPromotion, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  // Initialiser le formulaire avec les données de la promotion en édition
  useEffect(() => {
    if (editingPromotion) {
      const startDate = new Date(editingPromotion.start_date);
      const endDate = new Date(editingPromotion.end_date);
      
      // Formater les dates pour l'input datetime-local (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: editingPromotion.title || '',
        description: editingPromotion.description || '',
        discountPercentage: editingPromotion.discount_percentage?.toString() || '',
        startDate: formatDateForInput(startDate),
        endDate: formatDateForInput(endDate),
        isActive: editingPromotion.is_active !== undefined ? editingPromotion.is_active : true,
      });
    } else {
      // Valeurs par défaut pour une nouvelle promotion
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: '',
        description: '',
        discountPercentage: '',
        startDate: formatDateForInput(now),
        endDate: formatDateForInput(tomorrow),
        isActive: true,
      });
    }
  }, [editingPromotion]);

  // Valider le formulaire
  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('promotions.title_required');
    }

    if (!formData.discountPercentage || isNaN(formData.discountPercentage)) {
      newErrors.discountPercentage = t('promotions.discount_required');
    } else {
      const discount = parseFloat(formData.discountPercentage);
      if (discount < 0 || discount > 100) {
        newErrors.discountPercentage = t('promotions.discount_range');
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = t('promotions.start_date_required');
    }

    if (!formData.endDate) {
      newErrors.endDate = t('promotions.end_date_required');
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = t('promotions.end_date_after_start');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const promotionData = {
        restaurantId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        discountPercentage: parseFloat(formData.discountPercentage),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      };

      let result;
      if (editingPromotion) {
        result = await updatePromotion(editingPromotion.id, promotionData);
      } else {
        result = await createPromotion(promotionData);
      }

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        alert(result.error || t('promotions.save_error'));
      }
    } catch (error) {
      console.error('Erreur sauvegarde promotion:', error);
      alert(t('promotions.save_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingPromotion ? t('promotions.edit_promotion') : t('promotions.add_promotion')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('promotions.title')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('promotions.title_placeholder')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('promotions.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('promotions.description_placeholder')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Pourcentage de réduction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('promotions.discount_percentage')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  placeholder="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.discountPercentage ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
              </div>
              {errors.discountPercentage && (
                <p className="mt-1 text-sm text-red-600">{errors.discountPercentage}</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date de début */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('promotions.start_date')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              {/* Date de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('promotions.end_date')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Statut actif */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                {t('promotions.is_active')}
              </label>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  Enregistrer
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PromotionForm;

