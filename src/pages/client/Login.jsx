/**
 * Page de connexion client
 * 
 * Cette page permet aux clients de se connecter à leur compte Taybo.
 * Elle utilise le contexte Auth pour gérer la connexion.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
      setError('Veuillez remplir tous les champs');
      return;
    }

    // Activer le chargement
    setLoading(true);

    try {
      // Appeler la fonction de connexion du contexte Auth
      const result = await login(email, password);

      if (result.success) {
        // Si la connexion réussit, rediriger vers la page d'accueil
        navigate('/');
      } else {
        // Si la connexion échoue, afficher l'erreur
        setError(result.error || 'Une erreur est survenue lors de la connexion');
      }
    } catch (err) {
      // Gérer les erreurs inattendues
      setError('Une erreur inattendue est survenue');
      console.error('Erreur connexion:', err);
    } finally {
      // Désactiver le chargement
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* En-tête avec style Soft UI */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-colored-md mx-auto">
              <span className="text-2xl font-bold text-white">T</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bienvenue sur Taybo
          </h1>
          <p className="text-gray-600 text-lg">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire de connexion avec style Soft UI */}
        <div className="card-soft-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-error-50 border-l-4 border-error-500 text-error-700 px-4 py-3 rounded-soft">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 flex-shrink-0">
                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>{error}</span>
                </div>
                {(error.includes('confirmé') || error.includes('confirmation')) && (
                  <div className="mt-2 pt-2 border-t border-error-200">
                    <Link
                      to="/client/resend-confirmation"
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm inline-flex items-center gap-1"
                    >
                      Réenvoyer l'email de confirmation
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-soft pl-10"
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-soft pl-10"
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
              className="w-full btn-soft-primary font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Connexion'
              )}
            </button>
          </form>

          {/* Lien vers l'inscription */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link
                to="/client/signup"
                className="text-primary font-semibold hover:text-primary-dark transition-colors"
              >
                Inscription
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;


