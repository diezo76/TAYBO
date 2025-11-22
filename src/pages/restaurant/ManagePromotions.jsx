/**
 * Page Gestion des Promotions Restaurant
 * 
 * Cette page permet au restaurant de gérer ses promotions :
 * - Voir toutes les promotions (actives et inactives)
 * - Ajouter une nouvelle promotion
 * - Modifier une promotion existante
 * - Supprimer une promotion
 * - Activer/désactiver une promotion
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantAuth } from '../../contexts/RestaurantAuthContext';
import { getRestaurantPromotions, deletePromotion, togglePromotionStatus } from '../../services/promotionService';
import { Tag, LogOut, Plus, Edit, Trash2, Eye, EyeOff, Loader2, UtensilsCrossed, Menu as MenuIcon, Package, Calendar, User } from 'lucide-react';
import PromotionForm from '../../components/restaurant/PromotionForm';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

function ManagePromotions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurant, loading, logout, isVerified, isActive } = useRestaurantAuth();
  const [promotions, setPromotions] = useState([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  // Rediriger si pas connecté
  useEffect(() => {
    if (!loading && !restaurant) {
      navigate('/restaurant/login');
    }
  }, [restaurant, loading, navigate]);

  // Charger les promotions
  useEffect(() => {
    const loadPromotions = async () => {
      if (restaurant?.id && isVerified && isActive) {
        setPromotionsLoading(true);
        try {
          const items = await getRestaurantPromotions(restaurant.id, { activeOnly: false });
          setPromotions(items);
        } catch (error) {
          console.error('Erreur chargement promotions:', error);
        } finally {
          setPromotionsLoading(false);
        }
      }
    };

    loadPromotions();
  }, [restaurant?.id, isVerified, isActive]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/restaurant/login');
  };

  // Ouvrir le formulaire pour ajouter une promotion
  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setShowForm(true);
  };

  // Ouvrir le formulaire pour modifier une promotion
  const handleEditPromotion = (promotion) => {
    setEditingPromotion(promotion);
    setShowForm(true);
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPromotion(null);
  };

  // Recharger les promotions après modification
  const handlePromotionsUpdated = async () => {
    if (restaurant?.id) {
      const items = await getRestaurantPromotions(restaurant.id, { activeOnly: false });
      setPromotions(items);
      handleCloseForm();
    }
  };

  // Supprimer une promotion
  const handleDeletePromotion = async (promotionId) => {
    if (!window.confirm(t('promotions.confirm_delete'))) {
      return;
    }

    const result = await deletePromotion(promotionId);
    if (result.success) {
      setPromotions(promotions.filter(promo => promo.id !== promotionId));
    } else {
      alert(result.error || t('promotions.delete_error'));
    }
  };

  // Activer/désactiver une promotion
  const handleToggleStatus = async (promotionId, currentStatus) => {
    const result = await togglePromotionStatus(promotionId, !currentStatus);
    if (result.success) {
      setPromotions(promotions.map(promo =>
        promo.id === promotionId ? { ...promo, is_active: !currentStatus } : promo
      ));
    } else {
      alert(result.error || t('promotions.toggle_error'));
    }
  };

  // Filtrer les promotions par statut
  const filteredPromotions = filterStatus === 'all'
    ? promotions
    : filterStatus === 'active'
    ? promotions.filter(promo => promo.is_active)
    : promotions.filter(promo => !promo.is_active);

  // Vérifier si une promotion est actuellement active (dans la période de validité)
  const isCurrentlyActive = (promotion) => {
    if (!promotion.is_active) return false;
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    return now >= startDate && now <= endDate;
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

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
    <div className="flex items-center gap-4">
      <Button
        onClick={handleAddPromotion}
        variant="primary"
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>{t('promotions.add_promotion')}</span>
      </Button>
      <Button
        onClick={handleLogout}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Déconnexion</span>
      </Button>
    </div>
  );

  // Si pas de restaurant, ne rien afficher (redirection en cours)
  if (!restaurant) {
    return null;
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      headerContent={headerContent}
      title={t('promotions.title')}
    >
        {/* Message de statut */}
        {!isVerified && (
          <Card className="mb-6 p-6 bg-warning/10 border-warning/20">
            <p className="font-semibold text-warning mb-1">{t('restaurant_dashboard.verification_pending')}</p>
            <p className="text-sm text-warning/80">{t('restaurant_dashboard.verification_message')}</p>
          </Card>
        )}

        {isVerified && !isActive && (
          <Card className="mb-6 p-6 bg-error/10 border-error/20">
            <p className="font-semibold text-error mb-1">{t('restaurant_dashboard.account_inactive')}</p>
            <p className="text-sm text-error/80">{t('restaurant_dashboard.inactive_message')}</p>
          </Card>
        )}

        {/* Dashboard principal */}
        {isVerified && isActive && (
          <div>
            {/* Filtres par statut */}
            <Card className="mb-6 p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setFilterStatus('all')}
                  variant={filterStatus === 'all' ? 'primary' : 'outline'}
                  size="sm"
                >
                  {t('promotions.all_promotions')}
                </Button>
                <Button
                  onClick={() => setFilterStatus('active')}
                  variant={filterStatus === 'active' ? 'primary' : 'outline'}
                  size="sm"
                >
                  {t('promotions.active_promotions')}
                </Button>
                <Button
                  onClick={() => setFilterStatus('inactive')}
                  variant={filterStatus === 'inactive' ? 'primary' : 'outline'}
                  size="sm"
                >
                  {t('promotions.inactive_promotions')}
                </Button>
              </div>
            </Card>

            {/* Liste des promotions */}
            {promotionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            ) : filteredPromotions.length === 0 ? (
              <Card className="p-12 text-center">
                <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('promotions.no_promotions')}
                </h3>
                <p className="text-gray-600 mb-6">{t('promotions.no_promotions_message')}</p>
                <Button
                  onClick={handleAddPromotion}
                  variant="primary"
                >
                  {t('promotions.add_first_promotion')}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromotions.map(promotion => {
                  const currentlyActive = isCurrentlyActive(promotion);
                  const startDate = new Date(promotion.start_date);
                  const endDate = new Date(promotion.end_date);
                  const now = new Date();
                  const isExpired = now > endDate;
                  const isUpcoming = now < startDate;

                  return (
                    <Card
                      key={promotion.id}
                      className={`p-6 border-2 ${
                        currentlyActive
                          ? 'border-success'
                          : isExpired
                          ? 'border-gray-300 opacity-75'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Badge de statut */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            currentlyActive
                              ? 'bg-green-100 text-green-800'
                              : isExpired
                              ? 'bg-gray-200 text-gray-600'
                              : isUpcoming
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {currentlyActive && t('promotions.currently_active')}
                            {isExpired && t('promotions.expired')}
                            {isUpcoming && t('promotions.upcoming')}
                            {!currentlyActive && !isExpired && !isUpcoming && t('promotions.inactive')}
                          </span>
                          {!promotion.is_active && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {t('promotions.disabled')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Titre */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{promotion.title}</h3>

                      {/* Description */}
                      {promotion.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{promotion.description}</p>
                      )}

                      {/* Pourcentage de réduction */}
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-primary">
                          -{promotion.discount_percentage}%
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">{t('promotions.start_date')}:</span>{' '}
                          <span className="font-medium">{formatDate(promotion.start_date)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('promotions.end_date')}:</span>{' '}
                          <span className="font-medium">{formatDate(promotion.end_date)}</span>
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          onClick={() => handleEditPromotion(promotion)}
                          variant="outline"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Modifier</span>
                        </Button>
                        <Button
                          onClick={() => handleToggleStatus(promotion.id, promotion.is_active)}
                          variant="outline"
                          size="sm"
                          title={promotion.is_active ? t('promotions.disable') : t('promotions.enable')}
                        >
                          {promotion.is_active ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDeletePromotion(promotion.id)}
                          variant="danger"
                          size="sm"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

      {/* Modal formulaire */}
      {showForm && (
        <PromotionForm
          restaurantId={restaurant.id}
          editingPromotion={editingPromotion}
          onClose={handleCloseForm}
          onSuccess={handlePromotionsUpdated}
        />
      )}
    </DashboardLayout>
  );
}

export default ManagePromotions;

