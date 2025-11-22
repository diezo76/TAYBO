/**
 * Page de gestion du profil restaurant - Design Soft UI
 * 
 * Cette page permet aux restaurateurs de gérer leur profil avec le design Soft UI.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantAuth } from '../../contexts/RestaurantAuthContext';
import { updateRestaurantProfile, uploadRestaurantImage, deactivateRestaurantAccount } from '../../services/restaurantService';
import {
  Loader2,
  Save,
  X,
  Power,
  Upload,
  Image as ImageIcon,
  UtensilsCrossed,
  Menu as MenuIcon,
  Package,
  Tag,
  Calendar,
  User,
  LogOut,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/soft-ui/Input';
import Card from '../../components/common/Card';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/soft-ui/Avatar';
import Modal from '../../components/soft-ui/Modal';

function ManageProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurant, loading: authLoading, logout } = useRestaurantAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    cuisine_type: '',
    address: '',
    phone: '',
    delivery_fee: 0,
  });
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);

  // Charger les données du restaurant
  useEffect(() => {
    if (!authLoading && !restaurant) {
      navigate('/restaurant/login');
    } else if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        email: restaurant.email || '',
        description: restaurant.description || '',
        cuisine_type: restaurant.cuisine_type || '',
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        delivery_fee: restaurant.delivery_fee || 0,
      });
      setImageUrl(restaurant.image_url || '');
      setImagePreview(restaurant.image_url || '');
    }
  }, [restaurant, authLoading, navigate]);

  // Gérer le changement de fichier image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Valider le type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert(t('restaurant_profile.invalid_image_type'));
        return;
      }

      // Valider la taille (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(t('restaurant_profile.image_too_large'));
        return;
      }

      setImageFile(file);
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Uploader l'image
  const handleUploadImage = async () => {
    if (!imageFile || !restaurant) return;

    setUploadingImage(true);
    try {
      console.log('[ManageProfile] Début upload image pour restaurant:', restaurant.id);
      const result = await uploadRestaurantImage(restaurant.id, imageFile);
      console.log('[ManageProfile] Résultat upload:', result);
      
      if (result.success) {
        console.log('[ManageProfile] Upload réussi, URL:', result.url);
        setImageUrl(result.url);
        setImagePreview(result.url);
        setImageFile(null);
        alert(t('restaurant_profile.image_uploaded') || 'Image uploadée avec succès');
      } else {
        console.error('[ManageProfile] Erreur upload:', result.error);
        alert(result.error || t('restaurant_profile.image_upload_error'));
      }
    } catch (error) {
      console.error('[ManageProfile] Erreur upload image:', error);
      alert(t('restaurant_profile.image_upload_error') || 'Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!restaurant) return;

    setSaving(true);
    try {
      const updates = { ...formData };
      if (imageUrl) {
        updates.image_url = imageUrl;
        console.log('[ManageProfile] Sauvegarde avec image_url:', imageUrl);
      } else {
        console.log('[ManageProfile] Sauvegarde sans image_url');
      }
      
      const updatedRestaurant = await updateRestaurantProfile(restaurant.id, updates);
      console.log('[ManageProfile] Profil mis à jour avec succès:', updatedRestaurant);
      console.log('[ManageProfile] Image URL sauvegardée:', updatedRestaurant.image_url);
      
      alert(t('restaurant_profile.profile_updated') || 'Profil mis à jour avec succès');
      // Recharger la page pour mettre à jour le contexte
      window.location.reload();
    } catch (error) {
      console.error('[ManageProfile] Erreur mise à jour profil:', error);
      alert(t('restaurant_profile.update_error') || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  // Désactiver le compte
  const handleDeactivate = async () => {
    if (!restaurant) return;

    setSaving(true);
    try {
      await deactivateRestaurantAccount(restaurant.id);
      alert(t('restaurant_profile.account_deactivated'));
      await logout();
      navigate('/restaurant/login');
    } catch (error) {
      console.error('Erreur désactivation compte:', error);
      alert(t('restaurant_profile.deactivate_error'));
    } finally {
      setSaving(false);
      setDeactivateModalOpen(false);
    }
  };

  // Items de navigation pour la sidebar
  const sidebarItems = [
    {
      icon: <UtensilsCrossed className="w-5 h-5" />,
      label: 'Tableau de bord',
      path: '/restaurant/dashboard',
    },
    {
      icon: <MenuIcon className="w-5 h-5" />,
      label: t('menu.title'),
      path: '/restaurant/menu',
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Commandes',
      path: '/restaurant/orders',
    },
    {
      icon: <Tag className="w-5 h-5" />,
      label: 'Promotions',
      path: '/restaurant/promotions',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Horaires',
      path: '/restaurant/opening-hours',
    },
    {
      icon: <User className="w-5 h-5" />,
      label: 'Profil',
      path: '/restaurant/profile',
    },
  ];

  // Header content
  const headerContent = (
    <Button
      onClick={() => navigate('/restaurant/dashboard')}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <X className="w-4 h-4" />
      <span>Retour</span>
    </Button>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurant) {
    return null;
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      headerContent={headerContent}
      title={t('restaurant_profile.title')}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Card principale */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {t('restaurant_profile.information')}
          </h2>

          {/* Image de profil */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('restaurant_profile.profile_image')}
            </label>
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Avatar
                  src={imagePreview}
                  name={restaurant.name}
                  size="xl"
                  alt={restaurant.name}
                />
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {t('restaurant_profile.image_hint')}
                </p>
                {imageFile && (
                  <Button
                    onClick={handleUploadImage}
                    disabled={uploadingImage}
                    variant="primary"
                    size="sm"
                    className="mt-3 flex items-center gap-2"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {t('restaurant_profile.upload_image')}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t('common.name')}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label={t('common.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant_profile.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white text-gray-900"
              />
            </div>

            <Input
              label="Type de cuisine"
              type="text"
              value={formData.cuisine_type}
              onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
              required
            />

            <Input
              label="Téléphone"
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <Input
              label="Adresse"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="md:col-span-2"
            />

            <Input
              label="Frais de livraison (EGP)"
              type="number"
              step="0.01"
              min="0"
              value={formData.delivery_fee}
              onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          {/* Boutons d'action */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="primary"
                className="flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Enregistrer
              </Button>
              <Button
                onClick={() => navigate('/restaurant/dashboard')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Annuler
              </Button>
            </div>

            <Button
              onClick={() => setDeactivateModalOpen(true)}
              disabled={saving}
              variant="outline"
              className="flex items-center gap-2 text-error hover:text-error border-error/30 hover:border-error"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              {t('restaurant_profile.deactivate_account')}
            </Button>
          </div>

          {/* Avertissement désactivation */}
          <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-xl">
            <p className="text-sm text-warning/90">
              <strong>{t('restaurant_profile.warning')}</strong>{' '}
              {t('restaurant_profile.deactivate_warning')}
            </p>
          </div>
        </Card>
      </div>

      {/* Modal de confirmation de désactivation */}
      <Modal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        title={t('restaurant_profile.confirm_deactivate')}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setDeactivateModalOpen(false)}
              variant="outline"
            >
              Annuler
            </Button>
            <Button onClick={handleDeactivate} variant="danger">
              {t('restaurant_profile.deactivate_account')}
            </Button>
          </div>
        }
      >
        <p className="text-gray-700 mb-4">
          {t('restaurant_profile.deactivate_warning')}
        </p>
        <p className="text-sm text-gray-600">
          {t('restaurant_profile.deactivate_confirmation')}
        </p>
      </Modal>
    </DashboardLayout>
  );
}

export default ManageProfile;
