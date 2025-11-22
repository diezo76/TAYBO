/**
 * Service de gestion des adresses utilisateur
 * 
 * Ce service gère les adresses sauvegardées des clients.
 */

import { supabase } from './supabase';

/**
 * Récupère toutes les adresses d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Résultat avec success et addresses ou error
 */
export async function getUserAddresses(userId) {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return {
      success: true,
      addresses: data || [],
    };
  } catch (error) {
    console.error('Erreur récupération adresses:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la récupération des adresses',
    };
  }
}

/**
 * Crée une nouvelle adresse
 * @param {Object} addressData - Données de l'adresse
 * @param {string} addressData.user_id - ID de l'utilisateur
 * @param {string} addressData.address_type - Type (apartment/house/office)
 * @param {string} addressData.area - Zone
 * @param {string} addressData.building_name - Nom du bâtiment
 * @param {string} addressData.apt_number - Numéro d'appartement
 * @param {string} addressData.floor - Étage (optionnel)
 * @param {string} addressData.street - Rue
 * @param {string} addressData.phone_number - Numéro de téléphone
 * @param {string} addressData.additional_directions - Directions supplémentaires (optionnel)
 * @param {string} addressData.address_label - Label de l'adresse (optionnel)
 * @param {boolean} addressData.is_default - Si c'est l'adresse par défaut
 * @returns {Promise<Object>} - Résultat avec success et address ou error
 */
export async function createAddress(addressData) {
  try {
    // Si c'est l'adresse par défaut, désactiver les autres adresses par défaut
    if (addressData.is_default) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', addressData.user_id)
        .eq('is_default', true);
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .insert([addressData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      address: data,
    };
  } catch (error) {
    console.error('Erreur création adresse:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la création de l\'adresse',
    };
  }
}

/**
 * Met à jour une adresse
 * @param {string} addressId - ID de l'adresse
 * @param {Object} addressData - Données à mettre à jour
 * @returns {Promise<Object>} - Résultat avec success et address ou error
 */
export async function updateAddress(addressId, addressData) {
  try {
    // Si c'est l'adresse par défaut, désactiver les autres adresses par défaut
    if (addressData.is_default) {
      const { data: address } = await supabase
        .from('user_addresses')
        .select('user_id')
        .eq('id', addressId)
        .single();

      if (address) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', address.user_id)
          .eq('is_default', true)
          .neq('id', addressId);
      }
    }

    const { data, error } = await supabase
      .from('user_addresses')
      .update(addressData)
      .eq('id', addressId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      address: data,
    };
  } catch (error) {
    console.error('Erreur mise à jour adresse:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la mise à jour de l\'adresse',
    };
  }
}

/**
 * Supprime une adresse
 * @param {string} addressId - ID de l'adresse
 * @returns {Promise<Object>} - Résultat avec success ou error
 */
export async function deleteAddress(addressId) {
  try {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      throw error;
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur suppression adresse:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la suppression de l\'adresse',
    };
  }
}

/**
 * Définit une adresse comme adresse par défaut
 * @param {string} addressId - ID de l'adresse
 * @returns {Promise<Object>} - Résultat avec success ou error
 */
export async function setDefaultAddress(addressId) {
  try {
    // Récupérer l'user_id de l'adresse
    const { data: address, error: fetchError } = await supabase
      .from('user_addresses')
      .select('user_id')
      .eq('id', addressId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Désactiver toutes les autres adresses par défaut
    await supabase
      .from('user_addresses')
      .update({ is_default: false })
      .eq('user_id', address.user_id)
      .eq('is_default', true);

    // Activer cette adresse comme par défaut
    const { data, error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      address: data,
    };
  } catch (error) {
    console.error('Erreur définition adresse par défaut:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la définition de l\'adresse par défaut',
    };
  }
}

