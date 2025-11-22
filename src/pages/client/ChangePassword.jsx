/**
 * Page Change Password
 * 
 * Permet de changer le mot de passe de l'utilisateur
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../services/authService';
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';

function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);

  const passwordRequirements = [
    'At least 8 characters',
    '1 uppercase letter (A-Z)',
    '1 lowercase letter (a-z)',
    '1 number (0-9)',
    '1 special character (-@#\$%^&*_-+=,.?/)',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
    setValidationErrors([]);
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('1 uppercase letter (A-Z)');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('1 lowercase letter (a-z)');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('1 number (0-9)');
    }
    if (!/[-@#\$%^&*_\-+=,.?/]/.test(password)) {
      errors.push('1 special character (-@#\$%^&*_-+=,.?/)');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors([]);

    // Valider le mot de passe
    const errors = validatePassword(formData.newPassword);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setError('Le mot de passe ne respecte pas les exigences');
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword(
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      if (result.success) {
        setSuccess('Mot de passe mis à jour avec succès');
        setTimeout(() => {
          navigate('/client/settings');
        }, 2000);
      } else {
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
        }
        setError(result.error || 'Erreur lors du changement de mot de passe');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const checkRequirement = (requirement) => {
    if (!formData.newPassword) return false;
    
    if (requirement === 'At least 8 characters') {
      return formData.newPassword.length >= 8;
    }
    if (requirement === '1 uppercase letter (A-Z)') {
      return /[A-Z]/.test(formData.newPassword);
    }
    if (requirement === '1 lowercase letter (a-z)') {
      return /[a-z]/.test(formData.newPassword);
    }
    if (requirement === '1 number (0-9)') {
      return /[0-9]/.test(formData.newPassword);
    }
    if (requirement === '1 special character (-@#\$%^&*_-+=,.?/)') {
      return /[-@#\$%^&*_\-+=,.?/]/.test(formData.newPassword);
    }
    return false;
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Change password</h1>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="New password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm new password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password requirements */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Password must be at least 8 characters and should include:
            </p>
            <ul className="space-y-2">
              {passwordRequirements.map((req) => {
                const isValid = checkRequirement(req);
                return (
                  <li key={req} className="flex items-center gap-2 text-sm">
                    {isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className={isValid ? 'text-green-600' : 'text-gray-600'}>
                      • {req}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;

