/**
 * Page de réenvoi d'email de confirmation
 * 
 * Cette page permet aux utilisateurs de demander un nouvel email de confirmation
 * s'ils ne l'ont pas reçu lors de l'inscription.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resendConfirmationEmail } from '../../services/authService';
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

function ResendConfirmation() {
  const navigate = useNavigate();
  
  // États pour le formulaire
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  /**
   * Fonction appelée quand l'utilisateur soumet le formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setMessage('');
    setSuccess(false);
    
    // Validation basique
    if (!email || !email.includes('@')) {
      setMessage('Veuillez entrer une adresse email valide');
      return;
    }

    setLoading(true);

    try {
      const result = await resendConfirmationEmail(email);
      
      if (result.success) {
        setSuccess(true);
        setMessage(result.message || 'Email de confirmation envoyé ! Vérifiez votre boîte de réception (et les spams).');
        // Réinitialiser le champ email après succès
        setTimeout(() => {
          setEmail('');
        }, 2000);
      } else {
        setSuccess(false);
        setMessage(result.error || 'Une erreur est survenue lors de l\'envoi de l\'email');
      }
    } catch (err) {
      setSuccess(false);
      setMessage('Une erreur inattendue est survenue');
      console.error('Erreur réenvoi email:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full">
        {/* En-tête avec style Soft UI */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Réenvoyer l'Email de Confirmation
          </h1>
          <p className="text-gray-600">
            Entrez votre adresse email pour recevoir un nouvel email de confirmation
          </p>
        </div>

        {/* Carte du formulaire avec style Soft UI */}
        <div className="card-soft p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="input-soft pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Message de succès/erreur */}
            {message && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                success 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {success ? (
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm">{message}</p>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full btn-soft-primary font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Réenvoyer l'email
                </>
              )}
            </button>
          </form>
        </div>

        {/* Liens utiles */}
        <div className="text-center space-y-4">
          <Link
            to="/client/login"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
          
          <div className="text-sm text-gray-600">
            <p className="mb-2">Vous n'avez pas encore de compte ?</p>
            <Link
              to="/client/signup"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Créer un compte
            </Link>
          </div>
        </div>

        {/* Conseils */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            💡 Conseils
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Vérifiez votre dossier <strong>Spam/Courrier indésirable</strong></li>
            <li>• Attendez quelques minutes (les emails peuvent prendre jusqu'à 10 minutes)</li>
            <li>• Vérifiez que l'adresse email est correcte</li>
            <li>• Vous pouvez réenvoyer l'email autant de fois que nécessaire</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResendConfirmation;

