/**
 * Page de gestion des horaires d'ouverture (Restaurant)
 * 
 * Cette page permet aux restaurants de :
 * - Voir leurs horaires d'ouverture actuels
 * - Modifier les horaires pour chaque jour de la semaine
 * - Fermer certains jours
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantAuth } from '../../contexts/RestaurantAuthContext';
import { getRestaurantOpeningHours, updateRestaurantOpeningHours, getDefaultOpeningHours } from '../../services/openingHoursService';
import { Loader2, Clock, Save, LogOut, UtensilsCrossed, Menu as MenuIcon, Package, Tag, Calendar, User } from 'lucide-react';
import Button from '../../components/common/Button';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';

function ManageOpeningHours() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurant, loading: authLoading, logout } = useRestaurantAuth();

  const [openingHours, setOpeningHours] = useState(getDefaultOpeningHours());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const days = [
    { key: 'monday', label: t('opening_hours.monday') },
    { key: 'tuesday', label: t('opening_hours.tuesday') },
    { key: 'wednesday', label: t('opening_hours.wednesday') },
    { key: 'thursday', label: t('opening_hours.thursday') },
    { key: 'friday', label: t('opening_hours.friday') },
    { key: 'saturday', label: t('opening_hours.saturday') },
    { key: 'sunday', label: t('opening_hours.sunday') },
  ];

  // Rediriger si pas connecté
  useEffect(() => {
    if (!authLoading && !restaurant) {
      navigate('/restaurant/login');
    }
  }, [restaurant, authLoading, navigate]);

  // Charger les horaires
  useEffect(() => {
    const loadOpeningHours = async () => {
      if (restaurant?.id) {
        setLoading(true);
        try {
          const hours = await getRestaurantOpeningHours(restaurant.id);
          setOpeningHours(hours);
        } catch (error) {
          console.error('Erreur chargement horaires:', error);
          setError(t('opening_hours.error_load'));
        } finally {
          setLoading(false);
        }
      }
    };

    loadOpeningHours();
  }, [restaurant?.id, t]);

  // Mettre à jour les horaires d'un jour
  const updateDayHours = (dayKey, field, value) => {
    setOpeningHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
    setError('');
    setSuccess('');
  };

  // Basculer l'état fermé/ouvert d'un jour
  const toggleDayClosed = (dayKey) => {
    setOpeningHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        closed: !prev[dayKey].closed,
      },
    }));
    setError('');
    setSuccess('');
  };

  // Sauvegarder les horaires
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateRestaurantOpeningHours(restaurant.id, openingHours);
      setSuccess(t('opening_hours.success_save'));
    } catch (error) {
      console.error('Erreur sauvegarde horaires:', error);
      setError(error.message || t('opening_hours.error_save'));
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
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

  // Gérer la déconnexion
  const handleLogout = async () => {
    await logout();
    navigate('/restaurant/login');
  };

  // Header content
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

  if (!restaurant) {
    return null;
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      headerContent={headerContent}
      title={t('opening_hours.title')}
    >
        {error && (
          <Card className="mb-6 p-4 bg-error/10 border-error/20">
            <p className="text-error">{error}</p>
          </Card>
        )}

        {success && (
          <Card className="mb-6 p-4 bg-success/10 border-success/20">
            <p className="text-success">{success}</p>
          </Card>
        )}

        <Card className="p-6">
          <p className="text-gray-600 mb-6">
            {t('opening_hours.description')}
          </p>

          <div className="space-y-4">
            {days.map((day) => {
              // S'assurer que dayHours existe, sinon utiliser les valeurs par défaut
              const dayHours = openingHours[day.key] || {
                open: '09:00',
                close: '22:00',
                closed: false,
              };

              return (
                <div
                  key={day.key}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {day.label}
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!dayHours.closed}
                        onChange={() => toggleDayClosed(day.key)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        {dayHours.closed ? t('opening_hours.closed') : t('opening_hours.open')}
                      </span>
                    </label>
                  </div>

                  {!dayHours.closed && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('opening_hours.open_time')}
                        </label>
                        <input
                          type="time"
                          value={dayHours.open || '09:00'}
                          onChange={(e) => updateDayHours(day.key, 'open', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('opening_hours.close_time')}
                        </label>
                        <input
                          type="time"
                          value={dayHours.close || '22:00'}
                          onChange={(e) => updateDayHours(day.key, 'close', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer
            </Button>
          </div>
        </Card>
    </DashboardLayout>
  );
}

export default ManageOpeningHours;

