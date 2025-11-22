/**
 * Page Gestion du Menu Restaurant - Design Soft UI
 * 
 * Cette page permet au restaurant de gérer son menu avec le design Soft UI.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantAuth } from '../../contexts/RestaurantAuthContext';
import { getAllMenuItems, deleteMenuItem, toggleMenuItemAvailability } from '../../services/menuService';
import {
  UtensilsCrossed,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Menu as MenuIcon,
  Package,
  Tag,
  Calendar,
  User,
  Grid3x3,
  List,
} from 'lucide-react';
import MenuItemForm from '../../components/restaurant/MenuItemForm';
import { getMenuImageUrl } from '../../utils/imageUtils';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/soft-ui/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/soft-ui/Modal';
import Table from '../../components/soft-ui/Table';

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

function ManageMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurant, loading, logout, isVerified, isActive } = useRestaurantAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'table'

  // Rediriger si pas connecté
  useEffect(() => {
    if (!loading && !restaurant) {
      navigate('/restaurant/login');
    }
  }, [restaurant, loading, navigate]);

  // Charger le menu
  useEffect(() => {
    const loadMenu = async () => {
      if (!restaurant?.id) {
        setMenuLoading(false);
        return;
      }
      
      if (isVerified && isActive) {
        setMenuLoading(true);
        try {
          const items = await getAllMenuItems(restaurant.id);
          setMenuItems(items || []);
        } catch (error) {
          console.error('Erreur chargement menu:', error);
          setMenuItems([]);
        } finally {
          setMenuLoading(false);
        }
      } else {
        setMenuLoading(false);
      }
    };

    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id, isVerified, isActive]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/restaurant/login');
  };

  // Ouvrir le formulaire pour ajouter un plat
  const handleAddItem = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  // Ouvrir le formulaire pour modifier un plat
  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  // Recharger le menu après modification
  const handleMenuUpdated = async () => {
    if (restaurant?.id) {
      const items = await getAllMenuItems(restaurant.id);
      setMenuItems(items);
      handleCloseForm();
    }
  };

  // Ouvrir modal de suppression
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  // Supprimer un plat
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    const result = await deleteMenuItem(itemToDelete.id);
    if (result.success) {
      setMenuItems(menuItems.filter(item => item.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } else {
      alert(result.error || t('menu.delete_error'));
    }
  };

  // Activer/désactiver un plat
  const handleToggleAvailability = async (itemId, currentStatus) => {
    const result = await toggleMenuItemAvailability(itemId, !currentStatus);
    if (result.success) {
      setMenuItems(menuItems.map(item =>
        item.id === itemId ? { ...item, is_available: !currentStatus } : item
      ));
    } else {
      alert(result.error || t('menu.toggle_error'));
    }
  };

  // Filtrer les plats par catégorie
  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  // Grouper par catégorie
  const groupedItems = {
    entrée: filteredItems.filter(item => item.category === 'entrée'),
    plat: filteredItems.filter(item => item.category === 'plat'),
    dessert: filteredItems.filter(item => item.category === 'dessert'),
    boisson: filteredItems.filter(item => item.category === 'boisson'),
  };

  // Calculer les statistiques
  const stats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.is_available).length,
    unavailable: menuItems.filter(item => !item.is_available).length,
  };

  // Colonnes pour le tableau
  const tableColumns = [
    {
      key: 'image_url',
      label: t('menu.image'),
      render: (value, item) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          {value ? (
            <img
              src={getMenuImageUrl(value)}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: t('menu.name'),
      render: (value, item) => (
        <div>
          <div className="font-semibold text-gray-900">{value}</div>
          {item.description && (
            <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: t('menu.category'),
      render: (value) => (
        <Badge variant="secondary" size="sm">
          {getCategoryName(value)}
        </Badge>
      ),
    },
    {
      key: 'price',
      label: t('menu.price'),
      render: (value) => (
        <span className="font-semibold text-primary">
          {value.toFixed(2)} EGP
        </span>
      ),
    },
    {
      key: 'preparation_time',
      label: t('menu.preparation_time'),
      render: (value) => (
        <span className="text-gray-600">{value} min</span>
      ),
    },
    {
      key: 'is_available',
      label: t('menu.status'),
      render: (value) => (
        <Badge variant={value ? 'success' : 'secondary'} size="sm">
          {value ? 'Disponible' : 'Indisponible'}
        </Badge>
      ),
    },
  ];

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
        onClick={handleAddItem}
        variant="primary"
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span>{t('menu.add_item')}</span>
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

  // Si pas de restaurant, ne rien afficher (redirection en cours)
  if (!restaurant) {
    return null;
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      headerContent={headerContent}
      title={t('menu.title')}
    >
      {/* Message de statut */}
      {!isVerified && (
        <Card className="mb-6 p-6 bg-warning/10 border-warning/20">
          <p className="font-semibold text-warning mb-1">
            {t('restaurant_dashboard.verification_pending')}
          </p>
          <p className="text-sm text-warning/80">
            {t('restaurant_dashboard.verification_message')}
          </p>
        </Card>
      )}

      {isVerified && !isActive && (
        <Card className="mb-6 p-6 bg-error/10 border-error/20">
          <p className="font-semibold text-error mb-1">
            {t('restaurant_dashboard.account_inactive')}
          </p>
          <p className="text-sm text-error/80">
            {t('restaurant_dashboard.inactive_message')}
          </p>
        </Card>
      )}

      {/* Dashboard principal */}
      {isVerified && isActive && (
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<UtensilsCrossed className="w-6 h-6" />}
              title="Total d'articles"
              value={stats.total}
              iconBg="primary"
            />
            <StatCard
              icon={<Eye className="w-6 h-6" />}
              title="Articles disponibles"
              value={stats.available}
              iconBg="success"
            />
            <StatCard
              icon={<EyeOff className="w-6 h-6" />}
              title="Articles indisponibles"
              value={stats.unavailable}
              iconBg="warning"
            />
          </div>

          {/* Filtres et vue */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Filtres par catégorie */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: t('menu.all_categories') },
                  { key: 'plat', label: 'Plat' },
                  { key: 'entrée', label: 'Entrée' },
                  { key: 'dessert', label: 'Dessert' },
                  { key: 'boisson', label: 'Boisson' },
                ].map((cat) => (
                  <Button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    variant={selectedCategory === cat.key ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
              
              {/* Sélecteur de vue */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mode d'affichage :</span>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <Button
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    className="p-2"
                    title={t('menu.grid_view')}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode('table')}
                    variant={viewMode === 'table' ? 'primary' : 'ghost'}
                    size="sm"
                    className="p-2"
                    title={t('menu.table_view')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Liste des plats */}
          {menuLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="p-12 text-center">
              <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('menu.no_items')}
              </h3>
              <p className="text-gray-600 mb-6">{t('menu.no_items_message')}</p>
              <Button onClick={handleAddItem} variant="primary">
                {t('menu.add_first_item')}
              </Button>
            </Card>
          ) : viewMode === 'table' ? (
            /* Vue tableau */
            <Card title={t('menu.items_list')}>
              <Table
                columns={tableColumns}
                data={filteredItems}
                onEdit={handleEditItem}
                onDelete={handleDeleteClick}
                loading={menuLoading}
              />
            </Card>
          ) : (
            /* Vue grille */
            <div className="space-y-6">
              {(['plat', 'entrée', 'dessert', 'boisson']).map(category => {
                const items = groupedItems[category];
                if (items.length === 0) return null;

                return (
                  <Card key={category} title={getCategoryName(category)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map(item => (
                        <Card
                          key={item.id}
                          className={`p-4 transition-all duration-300 ${
                            !item.is_available ? 'opacity-75' : ''
                          }`}
                        >
                          {item.image_url && (
                            <img
                              src={getMenuImageUrl(item.image_url)}
                              alt={item.name}
                              className="w-full h-48 object-cover rounded-soft mb-4"
                              onError={(e) => {
                                console.error('[ManageMenu] Erreur chargement image menu:', item.id);
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                            <Badge
                              variant={item.is_available ? 'success' : 'secondary'}
                              size="sm"
                            >
                              {item.is_available
                                ? 'Disponible'
                                : 'Indisponible'}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-bold text-primary">
                              {item.price.toFixed(2)} EGP
                            </span>
                            <span className="text-sm text-gray-500">
                              {item.preparation_time} min
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditItem(item)}
                              variant="outline"
                              size="sm"
                              className="flex-1 flex items-center justify-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Modifier</span>
                            </Button>
                            <Button
                              onClick={() => handleToggleAvailability(item.id, item.is_available)}
                              variant="outline"
                              size="sm"
                              title={item.is_available ? t('menu.disable') : t('menu.enable')}
                            >
                              {item.is_available ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(item)}
                              variant="danger"
                              size="sm"
                              title={t('common.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
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
        <MenuItemForm
          restaurantId={restaurant.id}
          editingItem={editingItem}
          onClose={handleCloseForm}
          onSuccess={handleMenuUpdated}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title={t('menu.confirm_delete')}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setDeleteModalOpen(false);
                setItemToDelete(null);
              }}
              variant="outline"
            >
              Annuler
            </Button>
            <Button onClick={handleDeleteItem} variant="danger">
              {t('common.delete')}
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          {t('menu.confirm_delete_message')} "{itemToDelete?.name}"?
        </p>
      </Modal>
    </DashboardLayout>
  );
}

export default ManageMenu;
