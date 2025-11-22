/**
 * Page d'inscription client
 * 
 * Cette page permet aux nouveaux clients de créer un compte Taybo.
 * Elle utilise le contexte Auth pour gérer l'inscription.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

function SignUp() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // États pour les champs du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  // États pour la gestion des erreurs et du chargement
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
   * Fonction appelée quand l'utilisateur soumet le formulaire
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password,
        language: 'fr', // Par défaut, sera récupéré depuis i18n plus tard
      });

      if (result.success) {
        // Vérifier si l'utilisateur a une session valide (connecté immédiatement)
        if (result.session) {
          // L'utilisateur est connecté, rediriger vers la page d'accueil
          navigate('/');
        } else {
          // Pas de session immédiate (confirmation d'email requise)
          setSuccessMessage(
            'Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte. ' +
            'Vous pourrez vous connecter une fois votre email confirmé.'
          );
          // Réinitialiser le formulaire
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
          });
          // Rediriger vers la page de connexion après 5 secondes
          setTimeout(() => {
            navigate('/client/login');
          }, 5000);
        }
      } else {
        setError(result.error || 'Une erreur est survenue lors de l\'inscription');
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
      console.error('Erreur inscription:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inscription Client
          </h1>
          <p className="text-gray-600">
            Créez votre compte pour commander
          </p>
        </div>

        {/* Formulaire d'inscription */}
        <div className="card-soft-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message de succès */}
            {successMessage && (
              <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-soft">
                <p className="font-semibold mb-1">✓ {successMessage}</p>
                <p className="text-sm mt-2">Redirection vers la page de connexion dans quelques secondes...</p>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-soft">
                {error}
              </div>
            )}

            {/* Prénom */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="input-soft pl-10"
                  required
                  disabled={loading || !!successMessage}
                />
              </div>
            </div>

            {/* Nom */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="input-soft pl-10"
                  required
                  disabled={loading || !!successMessage}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="input-soft pl-10"
                  required
                  disabled={loading || !!successMessage}
                />
              </div>
            </div>

            {/* Téléphone (optionnel) */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone <span className="text-gray-400">(optionnel)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="input-soft pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="input-soft pl-10"
                  required
                  disabled={loading || !!successMessage}
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="input-soft pl-10"
                  required
                  disabled={loading || !!successMessage}
                  minLength={6}
                />
              </div>
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="w-full btn-soft-primary font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Inscription...
                </>
              ) : successMessage ? (
                'Inscription réussie !'
              ) : (
                'Inscription'
              )}
            </button>
          </form>

          {/* Lien vers la connexion */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link
                to="/client/login"
                className="text-primary font-semibold hover:underline"
              >
                Connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;


