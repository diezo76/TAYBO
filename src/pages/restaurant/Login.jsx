/**
 * Page de connexion restaurant
 * 
 * Cette page permet aux restaurants de se connecter à leur compte Taybo.
 * Elle utilise le contexte RestaurantAuth pour gérer la connexion.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRestaurantAuth } from '../../contexts/RestaurantAuthContext';
import { Mail, Lock, Loader2, UtensilsCrossed } from 'lucide-react';

function RestaurantLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useRestaurantAuth();

  // États pour les champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // États pour la gestion des erreurs et du chargement
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Fonction appelée quand l'utilisateur soumet le formulaire
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page
    
    // Réinitialiser l'erreur
    setError('');
    
    // Validation basique
    if (!email || !password) {
      setError(t('restaurant_auth.fill_all_fields'));
      return;
    }

    // Activer le chargement
    setLoading(true);

    try {
      // Appeler la fonction de connexion du contexte Auth
      const result = await login(email, password);

      if (result.success) {
        // Si la connexion réussit, rediriger vers le dashboard restaurant
        navigate('/restaurant/dashboard');
      } else {
        // Si la connexion échoue, afficher l'erreur
        setError(result.error || t('restaurant_auth.login_error'));
      }
    } catch (err) {
      // Gérer les erreurs inattendues
      setError(t('restaurant_auth.unexpected_error'));
      console.error('Erreur connexion restaurant:', err);
    } finally {
      // Désactiver le chargement
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <UtensilsCrossed className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('restaurant_auth.welcome_restaurant')}
          </h1>
          <p className="text-gray-600">
            {t('restaurant_auth.login_subtitle')}
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="restaurant@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-gray-900 font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('restaurant_auth.connecting')}
                </>
              ) : (
                t('auth.login')
              )}
            </button>
          </form>

          {/* Lien vers l'inscription */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('restaurant_auth.no_account')}{' '}
              <Link
                to="/restaurant/signup"
                className="text-primary font-semibold hover:underline"
              >
                {t('restaurant_auth.signup')}
              </Link>
            </p>
          </div>

          {/* Lien vers la connexion client */}
          <div className="mt-4 text-center">
            <Link
              to="/client/login"
              className="text-sm text-gray-500 hover:text-primary"
            >
              {t('restaurant_auth.client_login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantLogin;

