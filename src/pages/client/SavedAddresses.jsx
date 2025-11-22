/**
 * Page Saved Addresses
 * 
 * Affiche la liste des adresses sauvegardées de l'utilisateur
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAddresses, deleteAddress } from '../../services/addressService';
import { ArrowLeft, Plus, ChevronRight, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';

function SavedAddresses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await getUserAddresses(user.id);
    if (result.success) {
      setAddresses(result.addresses || []);
    }
    setLoading(false);
  };

  const handleDelete = async (addressId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    setDeletingId(addressId);
    const result = await deleteAddress(addressId);
    if (result.success) {
      await loadAddresses();
    }
    setDeletingId(null);
  };

  const getAddressTypeLabel = (type) => {
    const labels = {
      apartment: 'Apartment',
      house: 'House',
      office: 'Office',
    };
    return labels[type] || type;
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
              <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
            </div>
            <Button
              onClick={() => navigate('/client/settings/addresses/new')}
              variant="primary"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">No addresses saved yet</p>
            <Button
              onClick={() => navigate('/client/settings/addresses/new')}
              variant="primary"
            >
              Add your first address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                onClick={() => navigate(`/client/settings/addresses/${address.id}`)}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-primary transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900">
                        {getAddressTypeLabel(address.address_type)}
                      </span>
                      {address.is_default && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 mb-1">
                      {address.area}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      {address.building_name}
                      {address.apt_number && `, ${address.apt_number}`}
                      {address.floor && `, Floor ${address.floor}`}
                      {address.street && `, ${address.street}`}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Mobile Number: {address.phone_number}
                    </p>
                    {address.address_label && (
                      <p className="text-gray-500 text-xs mt-2">
                        Label: {address.address_label}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(address.id, e)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={deletingId === address.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedAddresses;

