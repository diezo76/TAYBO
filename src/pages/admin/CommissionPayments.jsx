/**
 * Page de suivi des paiements de commissions (Admin)
 * 
 * Cette page permet aux administrateurs de :
 * - Voir tous les paiements de commissions
 * - Filtrer par statut et restaurant
 * - Marquer un paiement comme payé
 * - Voir l'historique des paiements
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getAllCommissionPayments, markCommissionAsPaid } from '../../services/commissionService';
import { getAllRestaurants } from '../../services/adminService';
import { 
  Loader2, 
  Shield,
  DollarSign,
  CheckCircle,
  Clock,
  UtensilsCrossed,
  Calendar
} from 'lucide-react';
import Button from '../../components/common/Button';

function CommissionPayments() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAdminAuth();

  const [payments, setPayments] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [markingPaid, setMarkingPaid] = useState(null);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('transfer');

  // Rediriger si pas connecté
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, authLoading, navigate]);

  // Charger les restaurants pour le filtre
  useEffect(() => {
    const loadRestaurants = async () => {
      if (admin) {
        try {
          const data = await getAllRestaurants();
          setRestaurants(data);
        } catch (error) {
          console.error('Erreur chargement restaurants:', error);
        }
      }
    };
    loadRestaurants();
  }, [admin]);

  // Charger les paiements
  useEffect(() => {
    const loadPayments = async () => {
      if (admin) {
        setLoading(true);
        try {
          const filters = {};
          if (statusFilter !== 'all') {
            filters.status = statusFilter;
          }
          if (restaurantFilter !== 'all') {
            filters.restaurantId = restaurantFilter;
          }
          const data = await getAllCommissionPayments(filters);
          setPayments(data);
        } catch (error) {
          console.error('Erreur chargement paiements:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPayments();
  }, [admin, statusFilter, restaurantFilter]);

  // Marquer comme payé
  const handleMarkAsPaid = async () => {
    if (!showMarkPaidModal) return;

    setMarkingPaid(showMarkPaidModal);
    try {
      await markCommissionAsPaid(showMarkPaidModal, paymentMethod);
      
      // Recharger la liste
      const filters = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (restaurantFilter !== 'all') {
        filters.restaurantId = restaurantFilter;
      }
      const data = await getAllCommissionPayments(filters);
      setPayments(data);
      
      // Fermer le modal
      setShowMarkPaidModal(null);
      setPaymentMethod('transfer');
    } catch (error) {
      console.error('Erreur marquage paiement:', error);
      alert(t('admin.commissions.error_mark_paid'));
    } finally {
      setMarkingPaid(null);
    }
  };

  // Calculer le total des paiements en attente
  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  // Calculer le total des paiements payés
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t('admin.commissions.title')}
            </h1>
          </div>
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
            Retour
          </Button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t('admin.commissions.total_pending')}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalPending.toFixed(2)} EGP
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t('admin.commissions.total_paid')}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalPaid.toFixed(2)} EGP
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtre par statut */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.commissions.filter_status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">{t('admin.commissions.all_statuses')}</option>
                <option value="pending">{t('admin.commissions.status.pending')}</option>
                <option value="paid">{t('admin.commissions.status.paid')}</option>
              </select>
            </div>

            {/* Filtre par restaurant */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.commissions.filter_restaurant')}
              </label>
              <select
                value={restaurantFilter}
                onChange={(e) => setRestaurantFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">{t('admin.commissions.all_restaurants')}</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste des paiements */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">{t('admin.commissions.no_payments')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Informations */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {payment.restaurants?.name || t('admin.commissions.unknown_restaurant')}
                      </h3>
                      {payment.status === 'pending' ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t('admin.commissions.status.pending')}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {t('admin.commissions.status.paid')}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-gray-900 text-lg">
                          {parseFloat(payment.amount || 0).toFixed(2)} EGP
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(payment.period_start).toLocaleDateString()} - {new Date(payment.period_end).toLocaleDateString()}
                        </span>
                      </div>
                      {payment.payment_method && (
                        <div className="text-xs text-gray-500">
                          {t('admin.commissions.payment_method')}: {t(`admin.commissions.payment_methods.${payment.payment_method}`)}
                        </div>
                      )}
                      {payment.paid_at && (
                        <div className="text-xs text-gray-500">
                          {t('admin.commissions.paid_at')}: {new Date(payment.paid_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {payment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowMarkPaidModal(payment.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('admin.commissions.mark_paid')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal marquer comme payé */}
      {showMarkPaidModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {t('admin.commissions.mark_paid_title')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.commissions.payment_method')}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="transfer">{t('admin.commissions.payment_methods.transfer')}</option>
                  <option value="card">{t('admin.commissions.payment_methods.card')}</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  onClick={() => {
                    setShowMarkPaidModal(null);
                    setPaymentMethod('transfer');
                  }}
                  variant="outline"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleMarkAsPaid}
                  disabled={markingPaid === showMarkPaidModal}
                  className="flex items-center gap-2"
                >
                  {markingPaid === showMarkPaidModal ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {t('admin.commissions.confirm')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommissionPayments;

