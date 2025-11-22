/**
 * Page Account Info
 * 
 * Permet de consulter et modifier les informations du compte
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateAccountInfo, deleteAccount } from '../../services/authService';
import { ArrowLeft, Edit, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/soft-ui/Modal';

function AccountInfo() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    receiveOffers: false,
    subscribeNewsletter: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        dateOfBirth: user.date_of_birth || '',
        gender: user.gender || '',
        receiveOffers: user.receive_offers || false,
        subscribeNewsletter: user.subscribe_newsletter || false,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateAccountInfo({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        receiveOffers: formData.receiveOffers,
        subscribeNewsletter: formData.subscribeNewsletter,
      });

      if (result.success) {
        setSuccess('Informations mises à jour avec succès');
        await refreshUser();
        setIsEditing(false);
      } else {
        setError(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const result = await deleteAccount(deletePassword);
      if (result.success) {
        navigate('/client/login');
      } else {
        setError(result.error || 'Erreur lors de la suppression du compte');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Account info</h1>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>

          {/* First name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditing
                  ? 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                  : 'border-gray-300 bg-gray-50 text-gray-500'
              }`}
            />
          </div>

          {/* Last name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditing
                  ? 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                  : 'border-gray-300 bg-gray-50 text-gray-500'
              }`}
            />
          </div>

          {/* Date of birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of birth (optional)
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 border rounded-lg ${
                isEditing
                  ? 'border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent'
                  : 'border-gray-300 bg-gray-50 text-gray-500'
              }`}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender (optional)
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-4 h-4 text-primary"
                />
                <span className={!isEditing ? 'text-gray-500' : ''}>Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-4 h-4 text-primary"
                />
                <span className={!isEditing ? 'text-gray-500' : ''}>Female</span>
              </label>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="receiveOffers"
                checked={formData.receiveOffers}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-4 h-4 text-primary rounded"
              />
              <span className={!isEditing ? 'text-gray-500' : ''}>
                Yes, I want to receive offers and discounts
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="subscribeNewsletter"
                checked={formData.subscribeNewsletter}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-4 h-4 text-primary rounded"
              />
              <span className={!isEditing ? 'text-gray-500' : ''}>
                Subscribe to newsletter
              </span>
            </label>
          </div>

          {/* Boutons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setError('');
                  setSuccess('');
                  // Réinitialiser les données
                  if (user) {
                    setFormData({
                      firstName: user.first_name || '',
                      lastName: user.last_name || '',
                      dateOfBirth: user.date_of_birth || '',
                      gender: user.gender || '',
                      receiveOffers: user.receive_offers || false,
                      subscribeNewsletter: user.subscribe_newsletter || false,
                    });
                  }
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}

          {/* Delete account */}
          <div className="pt-6 border-t border-gray-200">
            <Button
              onClick={() => setShowDeleteModal(true)}
              variant="danger"
              className="w-full"
            >
              Delete account
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Delete Account */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletePassword('');
          setError('');
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete your account? This action cannot be undone.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter your password to confirm
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Password"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => {
                setShowDeleteModal(false);
                setDeletePassword('');
                setError('');
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="danger"
              className="flex-1"
              disabled={deleting || !deletePassword}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AccountInfo;

