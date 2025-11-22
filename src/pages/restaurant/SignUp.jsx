/**
 * Page d'inscription restaurant
 * 
 * Cette page permet aux nouveaux restaurants de créer un compte Taybo.
 * Elle utilise le contexte RestaurantAuth pour gérer l'inscription.
 * Inclut l'upload du document de passeport.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantAuth } from '../../contexts/RestaurantAuthContext';
import { Mail, Lock, UtensilsCrossed, Phone, MapPin, DollarSign, FileText, Loader2, Upload, X, Globe, Image, Map, Users, Award, Clock } from 'lucide-react';

function RestaurantSignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp } = useRestaurantAuth();

  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    description: '',
    cuisineType: '',
    address: '',
    phone: '',
    deliveryFee: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    capacity: '',
    yearsOfExperience: '',
    latitude: '',
    longitude: '',
  });
  
  // Horaires d'ouverture (par jour)
  const [openingHours, setOpeningHours] = useState({
    monday: { open: '', close: '', closed: false },
    tuesday: { open: '', close: '', closed: false },
    wednesday: { open: '', close: '', closed: false },
    thursday: { open: '', close: '', closed: false },
    friday: { open: '', close: '', closed: false },
    saturday: { open: '', close: '', closed: false },
    sunday: { open: '', close: '', closed: false },
  });
  
  // État pour le fichier passeport
  const [passportFile, setPassportFile] = useState(null);
  const [passportFileName, setPassportFileName] = useState('');
  
  // État pour les photos du restaurant
  const [restaurantPhotos, setRestaurantPhotos] = useState([]);
  
  // États pour la gestion des erreurs et du chargement
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Fonction pour mettre à jour un champ du formulaire
   * @param {string} field - Nom du champ
   * @param {string} value - Nouvelle valeur
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Réinitialiser l'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  /**
   * Fonction pour gérer la sélection du fichier passeport
   * @param {Event} e - Événement de changement de fichier
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError(t('restaurant_auth.invalid_file_type'));
        return;
      }
      
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(t('restaurant_auth.file_too_large'));
        return;
      }
      
      setPassportFile(file);
      setPassportFileName(file.name);
      if (error) setError('');
    }
  };

  /**
   * Fonction pour supprimer le fichier sélectionné
   */
  const handleRemoveFile = () => {
    setPassportFile(null);
    setPassportFileName('');
  };

  /**
   * Fonction pour gérer les photos du restaurant
   */
  const handlePhotosChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError('Seules les images (JPG, PNG, WEBP) sont acceptées');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Chaque image doit faire moins de 5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setRestaurantPhotos(prev => [...prev, ...validFiles]);
      if (error) setError('');
    }
  };

  /**
   * Fonction pour supprimer une photo
   */
  const handleRemovePhoto = (index) => {
    setRestaurantPhotos(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Fonction pour mettre à jour les horaires d'ouverture
   */
  const handleOpeningHoursChange = (day, field, value) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  /**
   * Fonction appelée quand l'utilisateur soumet le formulaire
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.cuisineType || !formData.address || !formData.phone || !formData.deliveryFee) {
      setError(t('restaurant_auth.fill_required_fields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('restaurant_auth.passwords_not_match'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('restaurant_auth.password_min_length'));
      return;
    }

    if (!passportFile) {
      setError(t('restaurant_auth.passport_required'));
      return;
    }

    // Validation du deliveryFee (doit être un nombre positif)
    const deliveryFee = parseFloat(formData.deliveryFee);
    if (isNaN(deliveryFee) || deliveryFee < 0) {
      setError(t('restaurant_auth.invalid_delivery_fee'));
      return;
    }

    setLoading(true);

    // Préparer les horaires d'ouverture
    const openingHoursData = {};
    Object.keys(openingHours).forEach(day => {
      if (!openingHours[day].closed && openingHours[day].open && openingHours[day].close) {
        openingHoursData[day] = {
          open: openingHours[day].open,
          close: openingHours[day].close,
        };
      }
    });

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        description: formData.description || null,
        cuisineType: formData.cuisineType,
        address: formData.address,
        phone: formData.phone,
        deliveryFee: deliveryFee,
        passportFile: passportFile,
        website: formData.website || null,
        facebook: formData.facebook || null,
        instagram: formData.instagram || null,
        twitter: formData.twitter || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        openingHours: Object.keys(openingHoursData).length > 0 ? openingHoursData : null,
        restaurantPhotos: restaurantPhotos.length > 0 ? restaurantPhotos : null,
      });

      if (result.success) {
        // Afficher un message de succès et rediriger
        alert(result.message || t('restaurant_auth.signup_success'));
        // Rediriger vers la page de connexion (car le compte doit être vérifié)
        navigate('/restaurant/login');
      } else {
        setError(result.error || t('restaurant_auth.signup_error'));
      }
    } catch (err) {
      setError(t('restaurant_auth.unexpected_error'));
      console.error('Erreur inscription restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UtensilsCrossed className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('restaurant_auth.signup_restaurant')}
          </h1>
          <p className="text-gray-600">
            {t('restaurant_auth.signup_subtitle')}
          </p>
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Nom du restaurant */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant_auth.restaurant_name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UtensilsCrossed className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.confirm_password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant_auth.description')}
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Type de cuisine */}
            <div>
              <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant_auth.cuisine_type')} <span className="text-red-500">*</span>
              </label>
              <input
                id="cuisineType"
                type="text"
                value={formData.cuisineType}
                onChange={(e) => handleChange('cuisineType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Ex: Italienne, Libanaise, Fast Food..."
                required
                disabled={loading}
              />
            </div>

            {/* Adresse */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant_auth.address')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.phone')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Frais de livraison */}
            <div>
              <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant_auth.delivery_fee')} (EGP) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.deliveryFee}
                  onChange={(e) => handleChange('deliveryFee', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0.00"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Coordonnées GPS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude (optionnel)
                </label>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="30.0444"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude (optionnel)
                </label>
                <div className="relative">
                  <Map className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="31.2357"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Site web */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Site web (optionnel)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://www.example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Réseaux sociaux (optionnel)
              </label>
              <div className="grid grid-cols-1 gap-3">
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Facebook URL"
                  disabled={loading}
                />
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Instagram URL"
                  disabled={loading}
                />
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Twitter URL"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Capacité et années d'expérience */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacité (optionnel)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleChange('capacity', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="50"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                  Années d'expérience (optionnel)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="5"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Horaires d'ouverture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Horaires d'ouverture (optionnel)
              </label>
              <div className="space-y-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const dayLabels = {
                    monday: 'Lundi',
                    tuesday: 'Mardi',
                    wednesday: 'Mercredi',
                    thursday: 'Jeudi',
                    friday: 'Vendredi',
                    saturday: 'Samedi',
                    sunday: 'Dimanche',
                  };
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-gray-700">{dayLabels[day]}</div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={openingHours[day].closed}
                          onChange={(e) => handleOpeningHoursChange(day, 'closed', e.target.checked)}
                          className="w-4 h-4 text-primary rounded"
                          disabled={loading}
                        />
                        <span className="text-sm text-gray-600">Fermé</span>
                      </label>
                      {!openingHours[day].closed && (
                        <>
                          <input
                            type="time"
                            value={openingHours[day].open}
                            onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={loading}
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="time"
                            value={openingHours[day].close}
                            onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={loading}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Photos du restaurant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos du restaurant (optionnel)
              </label>
              {restaurantPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {restaurantPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Restaurant ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        disabled={loading}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Image className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Cliquez pour ajouter</span> des photos
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG, WEBP (MAX. 5MB par image)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePhotosChange}
                  disabled={loading}
                />
              </label>
            </div>

            {/* Upload passeport */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('restaurant_auth.passport_document')} <span className="text-red-500">*</span>
              </label>
              {!passportFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">{t('restaurant_auth.click_to_upload')}</span> {t('restaurant_auth.or_drag_drop')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('restaurant_auth.file_types')}: PDF, PNG, JPG (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{passportFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Message d'information */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              {t('restaurant_auth.verification_info')}
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-gray-900 font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('restaurant_auth.registering')}
                </>
              ) : (
                t('restaurant_auth.signup')
              )}
            </button>
          </form>

          {/* Lien vers la connexion */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('restaurant_auth.already_have_account')}{' '}
              <Link
                to="/restaurant/login"
                className="text-primary font-semibold hover:underline"
              >
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantSignUp;

