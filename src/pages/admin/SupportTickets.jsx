/**
 * Page de gestion des tickets de support (Admin)
 * 
 * Cette page permet aux administrateurs de :
 * - Voir tous les tickets de support
 * - Filtrer par statut et priorité
 * - Répondre aux tickets
 * - Fermer les tickets
 * - Voir l'historique des messages
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getAllTickets, getTicketById, addTicketMessage, closeTicket } from '../../services/supportService';
import { useRealtimeSupportTickets } from '../../hooks/useRealtimeOrders';
import { 
  Loader2, 
  Shield,
  Filter,
  MessageSquare,
  Send,
  XCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  UtensilsCrossed
} from 'lucide-react';
import Button from '../../components/common/Button';

function SupportTickets() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useAdminAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Rediriger si pas connecté
  useEffect(() => {
    if (!authLoading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, authLoading, navigate]);

  // Charger les tickets
  useEffect(() => {
    const loadTickets = async () => {
      if (admin) {
        setLoading(true);
        try {
          const filters = {};
          if (statusFilter !== 'all') {
            filters.status = statusFilter;
          }
          if (priorityFilter !== 'all') {
            filters.priority = priorityFilter;
          }
          const data = await getAllTickets(filters);
          setTickets(data);
        } catch (error) {
          console.error('Erreur chargement tickets:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTickets();
  }, [admin, statusFilter, priorityFilter]);

  // Écouter les nouveaux tickets en temps réel
  useRealtimeSupportTickets((newTicket) => {
    // Ajouter le nouveau ticket à la liste s'il n'existe pas déjà
    if (newTicket && !tickets.find(t => t.id === newTicket.id)) {
      setTickets(prevTickets => [newTicket, ...prevTickets]);
    }
  });

  // Charger les détails d'un ticket
  const handleSelectTicket = async (ticketId) => {
    try {
      const ticket = await getTicketById(ticketId);
      setSelectedTicket(ticket);
    } catch (error) {
      console.error('Erreur chargement détails ticket:', error);
      alert(t('admin.support.error_load'));
    }
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSendingMessage(true);
    try {
      await addTicketMessage({
        ticketId: selectedTicket.id,
        senderType: 'admin',
        senderId: admin.id,
        message: newMessage.trim(),
      });

      // Recharger le ticket avec les nouveaux messages
      const updatedTicket = await getTicketById(selectedTicket.id);
      setSelectedTicket(updatedTicket);
      setNewMessage('');

      // Mettre à jour la liste
      const updatedTickets = await getAllTickets({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      });
      setTickets(updatedTickets);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert(t('admin.support.error_send'));
    } finally {
      setSendingMessage(false);
    }
  };

  // Fermer un ticket
  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    if (!confirm(t('admin.support.confirm_close'))) return;

    try {
      await closeTicket(selectedTicket.id);
      
      // Recharger la liste
      const updatedTickets = await getAllTickets({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      });
      setTickets(updatedTickets);
      
      // Fermer le modal
      setSelectedTicket(null);
    } catch (error) {
      console.error('Erreur fermeture ticket:', error);
      alert(t('admin.support.error_close'));
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    const configs = {
      open: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: t('admin.support.status.open') },
      in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle, label: t('admin.support.status.in_progress') },
      closed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: t('admin.support.status.closed') },
    };

    const config = configs[status] || configs.open;
    const Icon = config.icon;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Obtenir le badge de priorité
  const getPriorityBadge = (priority) => {
    const configs = {
      low: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('admin.support.priority.low') },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('admin.support.priority.medium') },
      high: { bg: 'bg-red-100', text: 'text-red-800', label: t('admin.support.priority.high') },
    };

    const config = configs[priority] || configs.medium;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

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
              {t('admin.support.title')}
            </h1>
          </div>
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
            Retour
          </Button>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtre par statut */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.support.filter_status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">{t('admin.support.all_statuses')}</option>
                <option value="open">{t('admin.support.status.open')}</option>
                <option value="in_progress">{t('admin.support.status.in_progress')}</option>
                <option value="closed">{t('admin.support.status.closed')}</option>
              </select>
            </div>

            {/* Filtre par priorité */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('admin.support.filter_priority')}
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">{t('admin.support.all_priorities')}</option>
                <option value="low">{t('admin.support.priority.low')}</option>
                <option value="medium">{t('admin.support.priority.medium')}</option>
                <option value="high">{t('admin.support.priority.high')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Liste des tickets */}
        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">{t('admin.support.no_tickets')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectTicket(ticket.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {ticket.subject}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {ticket.description}
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {ticket.users && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{ticket.users.first_name} {ticket.users.last_name}</span>
                    </div>
                  )}
                  {ticket.restaurants && (
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4" />
                      <span>{ticket.restaurants.name}</span>
                    </div>
                  )}
                  <div className="text-gray-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal détails ticket */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            {/* Header modal */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Message initial */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    {selectedTicket.users && (
                      <p className="font-semibold text-gray-900">
                        {selectedTicket.users.first_name} {selectedTicket.users.last_name}
                      </p>
                    )}
                    {selectedTicket.restaurants && (
                      <p className="font-semibold text-gray-900">
                        {selectedTicket.restaurants.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(selectedTicket.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Messages de réponse */}
              {selectedTicket.messages?.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.sender_type === 'admin'
                      ? 'bg-primary/10 ml-8'
                      : 'bg-gray-50 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-900">
                      {message.sender_type === 'admin'
                        ? t('admin.support.admin')
                        : message.sender_type === 'user'
                        ? t('admin.support.user')
                        : t('admin.support.restaurant')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Formulaire de réponse */}
            {selectedTicket.status !== 'closed' && (
              <div className="p-6 border-t">
                <div className="flex gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t('admin.support.reply_placeholder')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="flex items-center gap-2"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {t('admin.support.send')}
                  </Button>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleCloseTicket}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('admin.support.close_ticket')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportTickets;

