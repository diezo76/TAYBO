/**
 * Page Dashboard Admin
 * 
 * Cette page affiche le tableau de bord administrateur avec les KPIs
 * et les fonctionnalités principales.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getAdminStats } from '../../services/adminService';
import { useRealtimePendingRestaurants, useRealtimeSupportTickets } from '../../hooks/useRealtimeOrders';
import { 
  Shield, 
  LogOut, 
  Loader2, 
  UtensilsCrossed, 
  Users, 
  Package, 
  DollarSign,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import Button from '../../components/common/Button';

function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { admin, loading, logout } = useAdminAuth();
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    pendingRestaurants: 0,
    totalClients: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    weekRevenue: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Rediriger si pas connecté
  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, loading, navigate]);

  // Charger les statistiques quand l'admin est disponible
  useEffect(() => {
    const loadStats = async () => {
      if (!admin) {
        setStatsLoading(false);
        return;
      }
      
      setStatsLoading(true);
      try {
        const adminStats = await getAdminStats();
        setStats(adminStats || {
          totalRestaurants: 0,
          pendingRestaurants: 0,
          totalClients: 0,
          totalOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0,
          weekRevenue: 0,
        });
      } catch (error) {
        console.error('Erreur chargement statistiques:', error);
        setStats({
          totalRestaurants: 0,
          pendingRestaurants: 0,
          totalClients: 0,
          totalOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0,
          weekRevenue: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  // Écouter les nouveaux restaurants en attente en temps réel
  useRealtimePendingRestaurants(() => {
    // Recharger les stats quand un nouveau restaurant arrive
    if (admin) {
      getAdminStats().then(adminStats => {
        if (adminStats) {
          setStats(adminStats);
        }
      }).catch(error => {
        console.error('Erreur rechargement stats:', error);
      });
    }
  });

  // Écouter les nouveaux tickets de support en temps réel
  useRealtimeSupportTickets(() => {
    // Recharger les stats quand un nouveau ticket arrive
    if (admin) {
      getAdminStats().then(adminStats => {
        if (adminStats) {
          setStats(adminStats);
        }
      }).catch(error => {
        console.error('Erreur rechargement stats:', error);
      });
    }
  });

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

  // Si pas d'admin, ne rien afficher (redirection en cours)
  if (!admin) {
    return null;
  }

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t('admin.dashboard.title')}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Restaurants en attente - Style Soft UI */}
          <div className="card-soft-md p-6 border-l-4 border-warning">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('admin.dashboard.pending_restaurants')}
                </p>
                {statsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.pendingRestaurants}
                  </p>
                )}
              </div>
              <div className="bg-warning-50 p-3 rounded-xl shadow-soft">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
            </div>
            <Button
              onClick={() => navigate('/admin/restaurants?filter=pending')}
              className="mt-4 w-full"
              variant="outline"
            >
              {t('admin.dashboard.view_all')}
            </Button>
          </div>

          {/* Total Restaurants - Style Soft UI */}
          <div className="card-soft-md p-6 border-l-4 border-info">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('admin.dashboard.total_restaurants')}
                </p>
                {statsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalRestaurants}
                  </p>
                )}
              </div>
              <div className="bg-info-50 p-3 rounded-xl shadow-soft">
                <UtensilsCrossed className="w-6 h-6 text-info" />
              </div>
            </div>
            <Button
              onClick={() => navigate('/admin/restaurants')}
              className="mt-4 w-full"
              variant="outline"
            >
              {t('admin.dashboard.manage')}
            </Button>
          </div>

          {/* Total Clients - Style Soft UI */}
          <div className="card-soft-md p-6 border-l-4 border-success">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('admin.dashboard.total_clients')}
                </p>
                {statsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalClients}
                  </p>
                )}
              </div>
              <div className="bg-success-50 p-3 rounded-xl shadow-soft">
                <Users className="w-6 h-6 text-success" />
              </div>
            </div>
            <Button
              onClick={() => navigate('/admin/clients')}
              className="mt-4 w-full"
              variant="outline"
            >
              {t('admin.dashboard.manage')}
            </Button>
          </div>

          {/* Total Commandes - Style Soft UI */}
          <div className="card-soft-md p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {t('admin.dashboard.total_orders')}
                </p>
                {statsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                )}
              </div>
              <div className="bg-primary-50 p-3 rounded-xl shadow-soft">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
            <Button
              onClick={() => navigate('/admin/orders')}
              className="mt-4 w-full"
              variant="outline"
            >
              {t('admin.dashboard.manage')}
            </Button>
          </div>
        </div>

        {/* Statistiques financières - Style Soft UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Revenus totaux */}
          <div className="card-gradient-success p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t('admin.dashboard.total_revenue')}
              </h3>
              <div className="bg-white/20 p-2 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <p className="text-4xl font-bold text-white">
                {stats.totalRevenue.toFixed(2)} EGP
              </p>
            )}
          </div>

          {/* Revenus de la semaine */}
          <div className="card-gradient-info p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t('admin.dashboard.week_revenue')}
              </h3>
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            ) : (
              <p className="text-4xl font-bold text-white">
                {stats.weekRevenue.toFixed(2)} EGP
              </p>
            )}
          </div>
        </div>

        {/* Actions rapides - Style Soft UI */}
        <div className="card-soft-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {t('admin.dashboard.quick_actions')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/admin/restaurants?filter=pending')}
              className="w-full"
              variant="gradient"
            >
              {t('admin.dashboard.review_restaurants')}
            </Button>
            <Button
              onClick={() => navigate('/admin/orders?filter=pending')}
              className="w-full"
              variant="outline"
            >
              {t('admin.dashboard.view_pending_orders')}
            </Button>
            <Button
              onClick={() => navigate('/admin/support')}
              className="w-full"
              variant="outline"
            >
              {t('admin.dashboard.support_tickets')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

