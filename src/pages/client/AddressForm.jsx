/**
 * Page New/Edit Address
 * 
 * Formulaire pour créer ou modifier une adresse
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { createAddress, updateAddress, getUserAddresses } from '../../services/addressService';
import { ArrowLeft, MapPin, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';

function AddressForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    address_type: 'apartment',
    area: '',
    building_name: '',
    apt_number: '',
    floor: '',
    street: '',
    phone_number: '',
    country_code: '+20',
    additional_directions: '',
    address_label: '',
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [streetValid, setStreetValid] = useState(false);

  useEffect(() => {
    if (isEditing && user?.id) {
      loadAddress();
    }
  }, [id, user]);

  const loadAddress = async () => {
    const result = await getUserAddresses(user.id);
    if (result.success) {
      const address = result.addresses.find((a) => a.id === id);
      if (address) {
        // Extraire le code pays du numéro de téléphone
        const phoneParts = address.phone_number.match(/^(\+\d+)\s*(.+)$/);
        setFormData({
          address_type: address.address_type,
          area: address.area,
          building_name: address.building_name,
          apt_number: address.apt_number,
          floor: address.floor || '',
          street: address.street,
          phone_number: phoneParts ? phoneParts[2] : address.phone_number,
          country_code: phoneParts ? phoneParts[1] : '+20',
          additional_directions: address.additional_directions || '',
          address_label: address.address_label || '',
          is_default: address.is_default || false,
        });
        setStreetValid(!!address.street);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');

    // Valider le champ street
    if (name === 'street') {
      setStreetValid(value.trim().length > 0);
    }
  };

  const handleAddressTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      address_type: type,
    }));
  };

  const handleAreaChange = () => {
    // Pour l'instant, on garde juste un placeholder
    // Plus tard, on pourra intégrer une sélection d'area
    const newArea = prompt('Enter area (e.g., Nasr City - Nasr city towers):', formData.area);
    if (newArea) {
      setFormData((prev) => ({
        ...prev,
        area: newArea,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const addressData = {
        user_id: user.id,
        address_type: formData.address_type,
        area: formData.area,
        building_name: formData.building_name,
        apt_number: formData.apt_number,
        floor: formData.floor || null,
        street: formData.street,
        phone_number: `${formData.country_code} ${formData.phone_number}`,
        additional_directions: formData.additional_directions || null,
        address_label: formData.address_label || null,
        is_default: formData.is_default,
      };

      let result;
      if (isEditing) {
        result = await updateAddress(id, addressData);
      } else {
        result = await createAddress(addressData);
      }

      if (result.success) {
        navigate('/client/settings/addresses');
      } else {
        setError(result.error || 'Erreur lors de la sauvegarde de l\'adresse');
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit address' : 'New address'}
            </h1>
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

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Map placeholder */}
          <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center relative">
            <span className="text-gray-500">Map</span>
            <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600">
              Google
            </div>
          </div>

          {/* Area */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Area</p>
                  <p className="text-gray-900 font-medium">
                    {formData.area || 'Select area'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAreaChange}
                variant="outline"
                size="sm"
              >
                Change
              </Button>
            </div>
          </div>

          {/* Address type pills */}
          <div className="flex gap-2">
            {['apartment', 'house', 'office'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleAddressTypeChange(type)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  formData.address_type === type
                    ? 'bg-gray-900 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {type === 'apartment' && '🏢'}
                {type === 'house' && '🏠'}
                {type === 'office' && '💼'}
                <span className="ml-2 capitalize">{type}</span>
              </button>
            ))}
          </div>

          {/* Building name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Building name
            </label>
            <input
              type="text"
              name="building_name"
              value={formData.building_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Building name"
            />
          </div>

          {/* Apt number and Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apt. number
              </label>
              <input
                type="text"
                name="apt_number"
                value={formData.apt_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Apt. number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor (optional)
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Floor"
              />
            </div>
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street
            </label>
            <div className="relative">
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  streetValid ? 'border-green-300' : 'border-gray-300'
                }`}
                placeholder="Street"
              />
              {streetValid && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
              )}
            </div>
          </div>

          {/* Phone number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number
            </label>
            <div className="flex gap-2">
              <select
                name="country_code"
                value={formData.country_code}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="+20">🇪🇬 +20</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+33">🇫🇷 +33</option>
              </select>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="1206703884"
              />
            </div>
          </div>

          {/* Additional directions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional directions (optional)
            </label>
            <textarea
              name="additional_directions"
              value={formData.additional_directions}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Additional directions"
            />
          </div>

          {/* Address label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address label (optional)
            </label>
            <input
              type="text"
              name="address_label"
              value={formData.address_label}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="e.g. Parent's home"
            />
            <p className="text-xs text-gray-500 mt-1">
              Give this address a label so you can easily choose between them (e.g. Parent's home)
            </p>
          </div>

          {/* Default address */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="w-4 h-4 text-primary rounded"
            />
            <label className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save address'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AddressForm;

