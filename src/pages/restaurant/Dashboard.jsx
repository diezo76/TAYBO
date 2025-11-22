/**
 * Page Dashboard Restaurant - Design Soft UI
 * 
 * Cette page affiche le tableau de bord du restaurant avec les statistiques
 * et les fonctionnalités principales, utilisant le design Soft UI.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantAuth } from '../../contexts/RestaurantAuthContext';
import { getRestaurantStats } from '../../services/restaurantStatsService';
import {
  UtensilsCrossed,
  LogOut,
  Loader2,
  User,
  ShoppingCart,
  DollarSign,
  Clock,
  Star,
  Menu as MenuIcon,
  Package,
  Tag,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/soft-ui/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/soft-ui/Table';
import CommissionCounter from '../../components/restaurant/CommissionCounter';
import CommissionHistory from '../../components/restaurant/CommissionHistory';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CreditCard } from 'lucide-react';

function RestaurantDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurant, loading, logout, isVerified, isActive } = useRestaurantAuth();
  const [stats, setStats] = useState({
    todayOrders: 0,
    weekRevenue: 0,
    pendingOrders: 0,
    averageRating: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' ou 'commissions'

  // Rediriger si pas connecté
  useEffect(() => {
    if (!loading && !restaurant) {
      navigate('/restaurant/login');
    }
  }, [restaurant, loading, navigate]);

  // Charger les statistiques quand le restaurant est disponible
  useEffect(() => {
    const loadStats = async () => {
      if (!restaurant?.id) {
        setStatsLoading(false);
        return;
      }
      
      if (isVerified && isActive) {
        setStatsLoading(true);
        try {
          const restaurantStats = await getRestaurantStats(restaurant.id);
          setStats({
            todayOrders: restaurantStats?.todayOrders || 0,
            weekRevenue: restaurantStats?.weekRevenue || 0,
            pendingOrders: restaurantStats?.pendingOrders || 0,
            averageRating: restaurant?.average_rating || 0,
          });
          
          // Simuler des commandes récentes (à remplacer par un vrai appel API)
          setRecentOrders([
            { id: 1, client: 'Jean Dupont', total: 25.50, status: 'En attente', date: '2024-01-15' },
            { id: 2, client: 'Marie Martin', total: 18.00, status: 'En préparation', date: '2024-01-15' },
            { id: 3, client: 'Pierre Durand', total: 32.75, status: 'Livrée', date: '2024-01-14' },
          ]);
        } catch (error) {
          console.error('Erreur chargement statistiques:', error);
          setStats({
            todayOrders: 0,
            weekRevenue: 0,
            pendingOrders: 0,
            averageRating: restaurant?.average_rating || 0,
          });
        } finally {
          setStatsLoading(false);
        }
      } else {
        setStatsLoading(false);
      }
    };

    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id, isVerified, isActive]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/restaurant/login');
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
      badge: stats.pendingOrders > 0 ? stats.pendingOrders : undefined,
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

  // Données pour le graphique (simulées)
  const chartData = [
    { name: 'Lun', revenus: 120 },
    { name: 'Mar', revenus: 190 },
    { name: 'Mer', revenus: 150 },
    { name: 'Jeu', revenus: 220 },
    { name: 'Ven', revenus: 280 },
    { name: 'Sam', revenus: 350 },
    { name: 'Dim', revenus: 200 },
  ];

  // Colonnes pour le tableau des commandes
  const orderColumns = [
    {
      key: 'client',
      label: 'Client',
    },
    {
      key: 'total',
      label: 'Total',
      render: (value) => `${value.toFixed(2)} EGP`,
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'Livrée' ? 'bg-success/10 text-success' :
          value === 'En préparation' ? 'bg-warning/10 text-warning' :
          'bg-info/10 text-info'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
    },
  ];

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

  // Header content avec bouton déconnexion
  const headerContent = (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      <span>Déconnexion</span>
    </Button>
  );

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      headerContent={headerContent}
      title={restaurant.name}
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

      {/* Bannière d'alerte si le restaurant est gelé */}
      {isVerified && isActive && restaurant.is_frozen && (
        <Card className="mb-6 p-6 bg-error/10 border-error/20 border-2">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-error flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="font-semibold text-error mb-2 text-lg">
                ⚠️ Compte Gelé
              </p>
              <p className="text-sm text-error/90 mb-4">
                {restaurant.frozen_reason || 'Votre compte a été temporairement gelé. Vous ne pouvez plus recevoir de nouvelles commandes.'}
              </p>
              {restaurant.frozen_at && (
                <p className="text-xs text-error/70 mb-4">
                  Gelé le : {new Date(restaurant.frozen_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              <Button
                onClick={() => {
                  setActiveTab('commissions');
                  // Scroll vers le haut après un court délai pour que le composant se charge
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
                variant="primary"
                className="flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Payer les commissions en attente
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Dashboard principal */}
      {isVerified && isActive && (
        <div className="space-y-6">
          {/* Onglets */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4 inline mr-2" />
                Tableau de bord
              </button>
              <button
                onClick={() => setActiveTab('commissions')}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'commissions'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Commissions
              </button>
            </nav>
          </div>

          {/* Contenu de l'onglet Dashboard */}
          {activeTab === 'dashboard' && (
            <>
              {/* En-tête de bienvenue */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('restaurant_dashboard.welcome_back')}, {restaurant.name}!
                </h2>
                <p className="text-gray-600">{t('restaurant_dashboard.subtitle')}</p>
              </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<ShoppingCart className="w-6 h-6" />}
              title={t('restaurant_dashboard.today_orders')}
              value={statsLoading ? '...' : stats.todayOrders}
              variation={stats.todayOrders > 0 ? '+12%' : undefined}
              variationColor="success"
              iconBg="primary"
            />
            <StatCard
              icon={<DollarSign className="w-6 h-6" />}
              title={t('restaurant_dashboard.weekly_revenue')}
              value={
                statsLoading
                  ? '...'
                  : `${stats.weekRevenue.toFixed(2)} EGP`
              }
              variation={stats.weekRevenue > 0 ? '+8%' : undefined}
              variationColor="success"
              iconBg="success"
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              title={t('restaurant_dashboard.pending_orders')}
              value={statsLoading ? '...' : stats.pendingOrders}
              variationColor="warning"
              iconBg="warning"
            />
            <StatCard
              icon={<Star className="w-6 h-6" />}
              title={t('restaurant_dashboard.average_rating')}
              value={
                restaurant.average_rating
                  ? restaurant.average_rating.toFixed(1)
                  : 'N/A'
              }
              iconBg="info"
            />
          </div>

          {/* Compteur de commissions */}
          <CommissionCounter restaurantId={restaurant.id} />

          {/* Graphique des revenus */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Graphique des revenus
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Évolution des revenus sur 7 jours
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenus"
                  stroke="#cb0c9f"
                  strokeWidth={2}
                  dot={{ fill: '#cb0c9f', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Commandes récentes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Commandes récentes
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Dernières commandes reçues
                </p>
              </div>
              <Button
                onClick={() => navigate('/restaurant/orders')}
                variant="outline"
                size="sm"
              >
                Voir tout
              </Button>
            </div>
            <Table
              columns={orderColumns}
              data={recentOrders}
              onEdit={(order) => navigate(`/restaurant/orders/${order.id}`)}
            />
          </Card>

          {/* Actions rapides */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Actions rapides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate('/restaurant/menu')}
                variant="primary"
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <MenuIcon className="w-6 h-6" />
                <span>{t('restaurant_dashboard.manage_menu')}</span>
              </Button>
              <Button
                onClick={() => navigate('/restaurant/orders')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <Package className="w-6 h-6" />
                <span>{t('restaurant_dashboard.view_orders')}</span>
              </Button>
              <Button
                onClick={() => navigate('/restaurant/promotions')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <Tag className="w-6 h-6" />
                <span>{t('restaurant_dashboard.manage_promotions')}</span>
              </Button>
              <Button
                onClick={() => navigate('/restaurant/opening-hours')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <Calendar className="w-6 h-6" />
                <span>{t('restaurant_dashboard.manage_opening_hours')}</span>
              </Button>
              <Button
                onClick={() => navigate('/restaurant/profile')}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
              >
                <User className="w-6 h-6" />
                <span>{t('restaurant_dashboard.manage_profile')}</span>
              </Button>
            </div>
          </Card>
            </>
          )}

          {/* Contenu de l'onglet Commissions */}
          {activeTab === 'commissions' && (
            <>
              {/* En-tête */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Gestion des Commissions
                </h2>
                <p className="text-gray-600">
                  Consultez et payez vos commissions hebdomadaires
                </p>
              </div>

              {/* Compteur de commissions */}
              <CommissionCounter restaurantId={restaurant.id} />

              {/* Historique des commissions */}
              <CommissionHistory restaurantId={restaurant.id} />
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

export default RestaurantDashboard;
