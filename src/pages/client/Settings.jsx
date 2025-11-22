/**
 * Page Settings Client
 * 
 * Page principale des paramètres avec toutes les options disponibles
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateNotificationsSettings, updateLanguage, updateCountry, logoutClient } from '../../services/authService';
import { ArrowLeft, ChevronRight, LogOut } from 'lucide-react';
import Modal from '../../components/soft-ui/Modal';
import Button from '../../components/common/Button';

function Settings() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [notificationsSettings, setNotificationsSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setNotificationsSettings({
        pushEnabled: user.notifications_push_enabled ?? true,
        emailEnabled: user.notifications_email_enabled ?? true,
      });
    }
  }, [user]);

  const handleNotificationsClick = () => {
    setShowNotificationsModal(true);
  };

  const handleLanguageClick = () => {
    setShowLanguageModal(true);
  };

  const handleCountryClick = () => {
    setShowCountryModal(true);
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    const result = await updateNotificationsSettings(notificationsSettings);
    if (result.success) {
      await refreshUser();
      setShowNotificationsModal(false);
    }
    setLoading(false);
  };

  const handleLanguageChange = async (language) => {
    setLoading(true);
    const result = await updateLanguage(language);
    if (result.success) {
      await refreshUser();
      setShowLanguageModal(false);
      window.location.reload(); // Recharger pour appliquer la nouvelle langue
    }
    setLoading(false);
  };

  const handleCountryChange = async (country) => {
    setLoading(true);
    const result = await updateCountry(country);
    if (result.success) {
      await refreshUser();
      setShowCountryModal(false);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logoutClient();
    navigate('/client/login');
  };

  const getLanguageLabel = (lang) => {
    const labels = {
      en: 'English',
      ar: 'العربية',
      fr: 'Français',
    };
    return labels[lang] || lang;
  };

  const getNotificationsStatus = () => {
    if (notificationsSettings.pushEnabled || notificationsSettings.emailEnabled) {
      return 'Enabled';
    }
    return 'Disabled';
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          </div>
        </div>
      </div>

      {/* Liste des options */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Account info */}
          <button
            onClick={() => navigate('/client/settings/account')}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">Account info</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Saved Addresses */}
          <button
            onClick={() => navigate('/client/settings/addresses')}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">Saved Addresses</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Change email */}
          <button
            onClick={() => navigate('/client/settings/change-email')}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">Change email</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Change password */}
          <button
            onClick={() => navigate('/client/settings/change-password')}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">Change password</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Notifications */}
          <button
            onClick={handleNotificationsClick}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">Notifications</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{getNotificationsStatus()}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Language */}
          <button
            onClick={handleLanguageClick}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">Language</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{getLanguageLabel(user.language || 'en')}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Country */}
          <button
            onClick={handleCountryClick}
            className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">Country</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{user.country || 'Egypt'}</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          {/* Log out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-red-600"
          >
            <span>Log out</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Notifications */}
      <Modal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title="Enabled"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            To manage your application notifications, please go to Settings &gt; Notifications for the 'taybo' app.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Push Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsSettings.pushEnabled}
                  onChange={(e) => setNotificationsSettings({
                    ...notificationsSettings,
                    pushEnabled: e.target.checked,
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-900">Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationsSettings.emailEnabled}
                  onChange={(e) => setNotificationsSettings({
                    ...notificationsSettings,
                    emailEnabled: e.target.checked,
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowNotificationsModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNotifications}
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              Settings
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Language */}
      <Modal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title="Language"
      >
        <div className="space-y-2">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              user.language === 'en' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {user.language === 'en' && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
              <span>English</span>
            </div>
          </button>
          <button
            onClick={() => handleLanguageChange('ar')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              user.language === 'ar' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {user.language === 'ar' && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
              <span>العربية</span>
            </div>
          </button>
        </div>
      </Modal>

      {/* Modal Country */}
      <Modal
        isOpen={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        title="Country"
      >
        <div className="space-y-2">
          <button
            onClick={() => handleCountryChange('Egypt')}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              (user.country || 'Egypt') === 'Egypt' ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {(user.country || 'Egypt') === 'Egypt' && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
              <span>Egypt</span>
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Settings;

