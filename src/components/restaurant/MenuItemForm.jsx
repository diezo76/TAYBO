/**
 * Composant Formulaire Menu Item
 * 
 * Formulaire pour ajouter ou modifier un plat du menu
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createMenuItem, updateMenuItem, uploadMenuItemImage } from '../../services/menuService';
import { X, Upload, Loader2 } from 'lucide-react';

function MenuItemForm({ restaurantId, editingItem, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'entrée',
    price: '',
    preparation_time: 15,
    image_url: '',
    is_available: true,
    options: [],
    allergens: [],
    dietary_tags: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Initialiser le formulaire avec les données de l'item en édition
  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name || '',
        description: editingItem.description || '',
        category: editingItem.category || 'entrée',
        price: editingItem.price?.toString() || '',
        preparation_time: editingItem.preparation_time || 15,
        image_url: editingItem.image_url || '',
        is_available: editingItem.is_available !== undefined ? editingItem.is_available : true,
        options: editingItem.options || [],
        allergens: editingItem.allergens || [],
        dietary_tags: editingItem.dietary_tags || [],
      });
      if (editingItem.image_url) {
        setImagePreview(editingItem.image_url);
      }
    }
  }, [editingItem]);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Gérer la sélection d'image
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: t('menu.invalid_image_type') }));
        return;
      }
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: t('menu.image_too_large') }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  // Valider le formulaire
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = t('menu.name_required');
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = t('menu.price_required');
    }
    if (!formData.category) {
      newErrors.category = t('menu.category_required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image_url;

      // Upload de l'image si un nouveau fichier est sélectionné
      if (imageFile) {
        setUploadingImage(true);
        const uploadResult = await uploadMenuItemImage(restaurantId, imageFile);
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          setErrors(prev => ({ ...prev, image: uploadResult.error }));
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Préparer les données
      const menuItemData = {
        restaurant_id: restaurantId,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        price: parseFloat(formData.price),
        image_url: imageUrl || null,
        is_available: formData.is_available,
        preparation_time: parseInt(formData.preparation_time) || 15,
        options: formData.options,
        allergens: formData.allergens,
        dietary_tags: formData.dietary_tags,
      };

      // Créer ou mettre à jour
      let result;
      if (editingItem) {
        result = await updateMenuItem(editingItem.id, menuItemData);
      } else {
        result = await createMenuItem(menuItemData);
      }

      if (result.success) {
        onSuccess();
      } else {
        alert(result.error || t('menu.save_error'));
      }
    } catch (error) {
      console.error('Erreur sauvegarde plat:', error);
      alert(t('menu.save_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingItem ? t('menu.edit_item') : t('menu.add_item')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('menu.item_name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('menu.item_name_placeholder')}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('menu.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('menu.description_placeholder')}
            />
          </div>

          {/* Catégorie et Prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('menu.category')} <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="plat">Plat</option>
                <option value="entrée">Entrée</option>
                <option value="dessert">Dessert</option>
                <option value="boisson">Boisson</option>
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('menu.price')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-2 text-gray-500">EGP</span>
              </div>
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>
          </div>

          {/* Temps de préparation et Disponibilité */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('menu.preparation_time')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="preparation_time"
                  value={formData.preparation_time}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className="absolute right-3 top-2 text-gray-500">min</span>
              </div>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {t('menu.available')}
                </span>
              </label>
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('menu.image')}
            </label>
            <div className="space-y-4">
              {imagePreview && (
                <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                      setFormData(prev => ({ ...prev, image_url: '' }));
                    }}
                    className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    {t('menu.click_to_upload')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG jusqu'à 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-6 py-2 bg-primary text-gray-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading || uploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadingImage ? t('menu.uploading') : t('common.loading')}</span>
                </>
              ) : (
                <span>Enregistrer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MenuItemForm;

