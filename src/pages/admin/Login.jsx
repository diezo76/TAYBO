/**
 * Page de connexion administrateur
 * 
 * Cette page permet aux administrateurs de se connecter à leur compte Taybo.
 * Elle utilise le contexte AdminAuth pour gérer la connexion.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Mail, Lock, Loader2, Shield } from 'lucide-react';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();

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
      // Appeler la fonction de connexion du contexte AdminAuth
      const result = await login(email, password);

      if (result.success && result.admin) {
        // Attendre un peu pour s'assurer que l'état est bien mis à jour
        await new Promise(resolve => setTimeout(resolve, 200));
        // Si la connexion réussit, rediriger vers le dashboard admin
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Si la connexion échoue, afficher l'erreur
        setError(result.error || 'Une erreur est survenue lors de la connexion');
        setLoading(false);
      }
    } catch (err) {
      // Gérer les erreurs inattendues
      setError(err.message || 'Une erreur inattendue est survenue');
      console.error('Erreur connexion admin:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Shield className="w-8 h-8 text-gray-900" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Connexion Administrateur
          </h1>
          <p className="text-gray-400">
            Accédez au panneau d'administration
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-lg shadow-xl p-8">
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
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="admin@taybo.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
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
              className="w-full bg-gray-900 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

