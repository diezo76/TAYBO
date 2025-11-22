/**
 * Page Profil utilisateur
 * 
 * Permet aux clients de consulter et modifier leurs informations personnelles :
 * - Nom et prénom
 * - Téléphone
 * - Langue préférée
 * - Allergies
 * - Préférences alimentaires
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, uploadUserImage } from '../../services/authService';
import { User, Save, AlertCircle, CheckCircle, Camera, Settings } from 'lucide-react';
import Button from '../../components/common/Button';
import { getUserImageUrl } from '../../utils/imageUtils';

function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  // États du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    language: 'fr',
    allergies: [],
    dietaryPreferences: [],
  });

  // États pour la gestion du formulaire
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [preferenceInput, setPreferenceInput] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Options de langue
  const languages = [
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: t('common.languages.ar') || 'العربية' },
    { value: 'en', label: t('common.languages.en') || 'English' },
  ];

  // Options de préférences alimentaires communes
  const commonPreferences = [
    t('profile.dietary_preferences.vegetarian') || 'Végétarien',
    t('profile.dietary_preferences.vegan') || 'Végétalien',
    t('profile.dietary_preferences.halal') || 'Halal',
    t('profile.dietary_preferences.kosher') || 'Cacher',
    t('profile.dietary_preferences.gluten_free') || 'Sans gluten',
    t('profile.dietary_preferences.lactose_free') || 'Sans lactose',
  ];

  // Charger les données utilisateur au montage
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        language: user.language || 'fr',
        allergies: user.allergies || [],
        dietaryPreferences: user.dietary_preferences || [],
      });
      // Charger l'image de profil
      if (user.image_url) {
        const processedImageUrl = getUserImageUrl(user.image_url);
        setImageUrl(processedImageUrl);
      }
    }
  }, [user]);

  /**
   * Gère l'upload d'une image de profil
   */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image est trop grande. Taille maximale : 5 MB');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('[Profile] Début upload image');
      const result = await uploadUserImage(file);
      
      if (result.success) {
        console.log('[Profile] Upload réussi, URL:', result.url);
        setImageUrl(result.url);
        setImageError(false);
        setSuccess('Image de profil mise à jour avec succès');
        // Rafraîchir les données utilisateur
        await refreshUser();
      } else {
        setError(result.error || 'Erreur lors de l\'upload de l\'image');
      }
    } catch (err) {
      console.error('[Profile] Erreur upload image:', err);
      setError('Une erreur est survenue lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère le changement des champs du formulaire
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer les messages d'erreur/succès lors de la modification
    setError('');
    setSuccess('');
  };

  /**
   * Ajoute une allergie
   */
  const handleAddAllergy = () => {
    if (allergyInput.trim() && !formData.allergies.includes(allergyInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()],
      }));
      setAllergyInput('');
    }
  };

  /**
   * Supprime une allergie
   */
  const handleRemoveAllergy = (allergy) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((a) => a !== allergy),
    }));
  };

  /**
   * Ajoute une préférence alimentaire
   */
  const handleAddPreference = (preference) => {
    if (!formData.dietaryPreferences.includes(preference)) {
      setFormData((prev) => ({
        ...prev,
        dietaryPreferences: [...prev.dietaryPreferences, preference],
      }));
    }
  };

  /**
   * Supprime une préférence alimentaire
   */
  const handleRemovePreference = (preference) => {
    setFormData((prev) => ({
      ...prev,
      dietaryPreferences: prev.dietaryPreferences.filter((p) => p !== preference),
    }));
  };

  /**
   * Soumet le formulaire pour mettre à jour le profil
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError(t('profile.errors.name_required') || 'Le nom et le prénom sont obligatoires');
        setLoading(false);
        return;
      }

      // Mettre à jour le profil
      const result = await updateUserProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
        language: formData.language,
        allergies: formData.allergies,
        dietaryPreferences: formData.dietaryPreferences,
      });

      if (result.success) {
        setSuccess(t('profile.success.updated') || 'Profil mis à jour avec succès');
        // Rafraîchir les données utilisateur dans le contexte
        await refreshUser();
        // Changer la langue si nécessaire
        if (formData.language !== user?.language) {
          window.location.reload(); // Recharger pour appliquer la nouvelle langue
        }
      } else {
        setError(result.error || t('profile.errors.update_failed') || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      console.error('Erreur mise à jour profil:', err);
      setError(t('profile.errors.update_failed') || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Si l'utilisateur n'est pas connecté, ne rien afficher (la route est protégée)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* En-tête avec photo de profil */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            {/* Photo de profil */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                {imageUrl && !imageError ? (
                  <img
                    src={imageUrl}
                    alt="Photo de profil"
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.error('[Profile] Erreur chargement image de profil');
                      setImageError(true);
                    }}
                  />
                ) : (
                  <User className="w-10 h-10 text-primary" />
                )}
              </div>
              {/* Bouton pour changer la photo */}
              <label
                htmlFor="profile-image-upload"
                className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-dark transition-colors"
                title="Changer la photo de profil"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="profile-image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('profile.title') || 'Mon Profil'}
                </h1>
                <button
                  onClick={() => navigate('/client/settings')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </div>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Cliquez sur l'icône caméra pour changer votre photo de profil
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Messages d'erreur et succès */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          {/* Informations personnelles */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('profile.sections.personal_info') || 'Informations personnelles'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prénom */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.first_name') || 'Prénom'} *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.last_name') || 'Nom'} *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Langue */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.language') || 'Langue préférée'}
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('profile.sections.allergies') || 'Allergies'}
            </h2>
            <div className="space-y-3">
              {/* Liste des allergies */}
              {formData.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(allergy)}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Ajouter une allergie */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAllergy();
                    }
                  }}
                  placeholder={t('profile.allergies.placeholder') || 'Ajouter une allergie...'}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button
                  type="button"
                  onClick={handleAddAllergy}
                  variant="secondary"
                  disabled={!allergyInput.trim()}
                >
                  {t('common.add') || 'Ajouter'}
                </Button>
              </div>
            </div>
          </div>

          {/* Préférences alimentaires */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('profile.sections.dietary_preferences') || 'Préférences alimentaires'}
            </h2>
            <div className="space-y-3">
              {/* Liste des préférences sélectionnées */}
              {formData.dietaryPreferences.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.dietaryPreferences.map((pref) => (
                    <span
                      key={pref}
                      className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      {pref}
                      <button
                        type="button"
                        onClick={() => handleRemovePreference(pref)}
                        className="hover:text-green-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Options de préférences communes */}
              <div className="flex flex-wrap gap-2">
                {commonPreferences.map((pref) => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => handleAddPreference(pref)}
                    disabled={formData.dietaryPreferences.includes(pref)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      formData.dietaryPreferences.includes(pref)
                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    + {pref}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button type="submit" loading={loading} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;

