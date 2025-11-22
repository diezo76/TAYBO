/**
 * Composant CommissionCounter - Affiche le compteur de commissions hebdomadaires en temps réel
 * 
 * Ce composant affiche :
 * - Le total des ventes de la semaine en cours (hors frais de livraison)
 * - La commission due (4% du CA)
 * - Les paiements en attente
 * - Un bouton pour payer via Stripe
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { 
  getCurrentWeekCommission, 
  getPendingCommissions,
  createCommissionCheckout 
} from '../../services/commissionService';

function CommissionCounter({ restaurantId }) {
  const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState({
    total_sales: 0,
    commission_amount: 0,
    week_start: null,
    week_end: null
  });
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Charger les données de commission
  useEffect(() => {
    if (!restaurantId) return;

    const loadCommissionData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [currentWeekData, pendingData] = await Promise.all([
          getCurrentWeekCommission(restaurantId),
          getPendingCommissions(restaurantId)
        ]);
        
        setCurrentWeek(currentWeekData || {
          total_sales: 0,
          commission_amount: 0,
          week_start: null,
          week_end: null
        });
        setPendingPayments(pendingData || []);
      } catch (err) {
        console.error('Erreur chargement commissions:', err);
        setError('Erreur lors du chargement des commissions');
      } finally {
        setLoading(false);
      }
    };

    loadCommissionData();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadCommissionData, 30000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  // Gérer le paiement d'une commission
  const handlePayCommission = async (paymentId) => {
    setProcessing(true);
    setError(null);
    
    try {
      const { checkout_url } = await createCommissionCheckout(paymentId);
      
      if (checkout_url) {
        // Rediriger vers Stripe Checkout
        window.location.href = checkout_url;
      } else {
        throw new Error('URL de checkout non disponible');
      }
    } catch (err) {
      console.error('Erreur création checkout:', err);
      setError('Erreur lors de la création du paiement. Veuillez réessayer.');
      setProcessing(false);
    }
  };

  // Formater une date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Calculer le temps restant avant échéance
  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    if (diff <= 0) return 'Échue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}j ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  const totalPending = pendingPayments.reduce((sum, p) => 
    sum + parseFloat(p.commission_amount || p.amount || 0), 0
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Commissions hebdomadaires
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {currentWeek.week_start && currentWeek.week_end && (
              <>Semaine du {formatDate(currentWeek.week_start)} au {formatDate(currentWeek.week_end)}</>
            )}
          </p>
        </div>
        <CreditCard className="w-8 h-8 text-primary" />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-error" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {/* Commission de la semaine en cours */}
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            CA de la semaine (hors frais de livraison)
          </span>
          <span className="text-lg font-bold text-gray-900">
            {currentWeek.total_sales?.toFixed(2) || '0.00'} EGP
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Commission due (4%)
          </span>
          <span className="text-xl font-bold text-primary">
            {currentWeek.commission_amount?.toFixed(2) || '0.00'} EGP
          </span>
        </div>
        {currentWeek.commission_amount > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Cette commission sera facturée le dimanche à 23:59
          </p>
        )}
      </div>

      {/* Paiements en attente */}
      {pendingPayments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Paiements en attente
          </h4>
          <div className="space-y-3">
            {pendingPayments.map((payment) => {
              const isOverdue = payment.status === 'overdue' || 
                (payment.due_date && new Date(payment.due_date) < new Date());
              const timeRemaining = getTimeRemaining(payment.due_date);
              
              return (
                <div
                  key={payment.id}
                  className={`p-4 rounded-lg border ${
                    isOverdue
                      ? 'bg-error/5 border-error/20'
                      : 'bg-warning/5 border-warning/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(payment.week_start_date || payment.period_start)} -{' '}
                        {formatDate(payment.week_end_date || payment.period_end)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Montant: {(payment.commission_amount || payment.amount || 0).toFixed(2)} EGP
                      </p>
                    </div>
                    {isOverdue ? (
                      <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-warning flex-shrink-0" />
                    )}
                  </div>
                  
                  {payment.due_date && (
                    <p className={`text-xs mb-3 ${
                      isOverdue ? 'text-error' : 'text-gray-600'
                    }`}>
                      {isOverdue ? (
                        <>⚠️ Échue - Votre compte sera gelé si non payée</>
                      ) : (
                        <>⏰ Échéance dans {timeRemaining}</>
                      )}
                    </p>
                  )}
                  
                  <Button
                    onClick={() => handlePayCommission(payment.id)}
                    disabled={processing}
                    variant={isOverdue ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Traitement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payer maintenant
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
          
          {totalPending > 0 && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm font-medium text-warning">
                Total à payer: {totalPending.toFixed(2)} EGP
              </p>
            </div>
          )}
        </div>
      )}

      {pendingPayments.length === 0 && currentWeek.commission_amount === 0 && (
        <div className="text-center py-4">
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Aucune commission en attente
          </p>
        </div>
      )}
    </Card>
  );
}

export default CommissionCounter;

