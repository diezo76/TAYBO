/**
 * Composant CommissionHistory - Affiche l'historique des commissions
 * 
 * Ce composant affiche un tableau avec l'historique des commissions
 * avec filtres, pagination et actions
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Eye, Loader2, Filter, Download } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Table from '../soft-ui/Table';
import { getAllCommissionPayments, createCommissionCheckout } from '../../services/commissionService';

function CommissionHistory({ restaurantId }) {
  const { t } = useTranslation();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '', // 'paid', 'pending', 'overdue', ou '' pour tous
    period: 'all', // 'all', 'current_month', 'last_month', 'last_3_months'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [processing, setProcessing] = useState(null);

  // Charger l'historique des commissions
  useEffect(() => {
    if (!restaurantId) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await getAllCommissionPayments({
          restaurantId,
          status: filters.status || undefined,
        });
        
        // Filtrer par période si nécessaire
        let filteredData = data;
        if (filters.period !== 'all') {
          const now = new Date();
          const cutoffDate = new Date();
          
          switch (filters.period) {
            case 'current_month':
              cutoffDate.setMonth(now.getMonth());
              cutoffDate.setDate(1);
              break;
            case 'last_month':
              cutoffDate.setMonth(now.getMonth() - 1);
              cutoffDate.setDate(1);
              break;
            case 'last_3_months':
              cutoffDate.setMonth(now.getMonth() - 3);
              break;
            default:
              break;
          }
          
          filteredData = data.filter(commission => {
            const commissionDate = new Date(commission.created_at || commission.week_start_date || commission.period_start);
            return commissionDate >= cutoffDate;
          });
        }
        
        setCommissions(filteredData);
      } catch (error) {
        console.error('Erreur chargement historique commissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [restaurantId, filters.status, filters.period]);

  // Gérer le paiement d'une commission
  const handlePay = async (paymentId) => {
    setProcessing(paymentId);
    try {
      const { checkout_url } = await createCommissionCheckout(paymentId);
      if (checkout_url) {
        window.location.href = checkout_url;
      }
    } catch (error) {
      console.error('Erreur création checkout:', error);
      alert('Erreur lors de la création du paiement. Veuillez réessayer.');
      setProcessing(null);
    }
  };

  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Formater le statut
  const formatStatus = (status) => {
    const statusMap = {
      paid: { label: 'Payée', color: 'success' },
      pending: { label: 'En attente', color: 'warning' },
      overdue: { label: 'En retard', color: 'error' },
      cancelled: { label: 'Annulée', color: 'gray' },
    };
    return statusMap[status] || { label: status, color: 'gray' };
  };

  // Pagination
  const totalPages = Math.ceil(commissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCommissions = commissions.slice(startIndex, startIndex + itemsPerPage);

  // Colonnes du tableau
  const columns = [
    {
      key: 'period',
      label: 'Période',
      render: (value, row) => {
        const start = formatDate(row.week_start_date || row.period_start);
        const end = formatDate(row.week_end_date || row.period_end);
        return `${start} - ${end}`;
      },
    },
    {
      key: 'total_sales',
      label: 'CA Total',
      render: (value, row) => {
        const sales = row.total_sales || 0;
        return `${parseFloat(sales).toFixed(2)} EGP`;
      },
    },
    {
      key: 'commission_amount',
      label: 'Commission',
      render: (value, row) => {
        const amount = row.commission_amount || row.amount || 0;
        return (
          <span className="font-semibold text-primary">
            {parseFloat(amount).toFixed(2)} EGP
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value) => {
        const statusInfo = formatStatus(value);
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusInfo.color === 'success' ? 'bg-success/10 text-success' :
            statusInfo.color === 'warning' ? 'bg-warning/10 text-warning' :
            statusInfo.color === 'error' ? 'bg-error/10 text-error' :
            'bg-gray/10 text-gray'
          }`}>
            {statusInfo.label}
          </span>
        );
      },
    },
    {
      key: 'due_date',
      label: 'Date limite',
      render: (value) => formatDate(value),
    },
    {
      key: 'paid_at',
      label: 'Date de paiement',
      render: (value) => value ? formatDate(value) : '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.invoice_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(row.invoice_url, '_blank')}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              Facture
            </Button>
          )}
          {(row.status === 'pending' || row.status === 'overdue') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handlePay(row.id)}
              disabled={processing === row.id}
              className="flex items-center gap-1"
            >
              {processing === row.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Payer
                </>
              )}
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Historique des Commissions
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Consultez l'historique de toutes vos commissions
          </p>
        </div>
        <Download className="w-6 h-6 text-gray-400" />
      </div>

      {/* Filtres */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtres:</span>
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tous les statuts</option>
          <option value="paid">Payées</option>
          <option value="pending">En attente</option>
          <option value="overdue">En retard</option>
        </select>

        <select
          value={filters.period}
          onChange={(e) => setFilters({ ...filters, period: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Toutes les périodes</option>
          <option value="current_month">Mois en cours</option>
          <option value="last_month">Mois dernier</option>
          <option value="last_3_months">3 derniers mois</option>
        </select>
      </div>

      {/* Tableau */}
      {commissions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune commission trouvée</p>
        </div>
      ) : (
        <>
          <Table columns={columns} data={paginatedCommissions} />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages} ({commissions.length} commissions)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

export default CommissionHistory;

