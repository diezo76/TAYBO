/**
 * Service pour la gestion des horaires d'ouverture des restaurants
 * 
 * Ce service gère toutes les opérations liées aux horaires d'ouverture :
 * - Récupération des horaires
 * - Mise à jour des horaires
 */

import { supabase } from './supabase';

/**
 * Récupère les horaires d'ouverture d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Object>} - Horaires d'ouverture (format JSONB)
 */
export async function getRestaurantOpeningHours(restaurantId) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('opening_hours')
      .eq('id', restaurantId)
      .single();

    if (error) {
      throw error;
    }

    // S'assurer que les horaires retournés sont complets
    const hours = data.opening_hours || getDefaultOpeningHours();
    const defaultHours = getDefaultOpeningHours();
    
    // Fusionner avec les valeurs par défaut pour s'assurer que tous les jours sont présents
    const completeHours = { ...defaultHours };
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      if (hours[day]) {
        completeHours[day] = {
          ...defaultHours[day],
          ...hours[day],
        };
      }
    });

    return completeHours;
  } catch (error) {
    console.error('Erreur récupération horaires:', error);
    // En cas d'erreur, retourner les horaires par défaut plutôt que de lancer une erreur
    return getDefaultOpeningHours();
  }
}

/**
 * Met à jour les horaires d'ouverture d'un restaurant
 * @param {string} restaurantId - ID du restaurant
 * @param {Object} openingHours - Horaires d'ouverture (format JSONB)
 * @returns {Promise<Object>} - Restaurant mis à jour
 */
export async function updateRestaurantOpeningHours(restaurantId, openingHours) {
  try {
    // Valider le format des horaires
    validateOpeningHours(openingHours);

    const { data, error } = await supabase
      .from('restaurants')
      .update({ opening_hours: openingHours })
      .eq('id', restaurantId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erreur mise à jour horaires:', error);
    throw error;
  }
}

/**
 * Vérifie si un restaurant est ouvert maintenant
 * @param {Object} openingHours - Horaires d'ouverture
 * @returns {boolean} - True si le restaurant est ouvert
 */
export function isRestaurantOpenNow(openingHours) {
  if (!openingHours) return false;

  const now = new Date();
  const dayName = getDayName(now.getDay());
  const dayHours = openingHours[dayName];

  if (!dayHours || dayHours.closed) {
    return false;
  }

  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes depuis minuit
  const openTime = parseTime(dayHours.open);
  const closeTime = parseTime(dayHours.close);

  return currentTime >= openTime && currentTime < closeTime;
}

/**
 * Retourne les horaires par défaut (tous les jours ouverts de 9h à 22h)
 * @returns {Object} - Horaires par défaut
 */
export function getDefaultOpeningHours() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const defaultHours = {};

  days.forEach(day => {
    defaultHours[day] = {
      open: '09:00',
      close: '22:00',
      closed: false,
    };
  });

  return defaultHours;
}

/**
 * Valide le format des horaires d'ouverture
 * @param {Object} openingHours - Horaires à valider
 * @throws {Error} - Si le format est invalide
 */
function validateOpeningHours(openingHours) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  for (const day of days) {
    if (!openingHours[day]) {
      throw new Error(`Horaires manquants pour ${day}`);
    }

    const dayHours = openingHours[day];
    if (!dayHours.closed) {
      if (!dayHours.open || !dayHours.close) {
        throw new Error(`Horaires incomplets pour ${day}`);
      }

      const openTime = parseTime(dayHours.open);
      const closeTime = parseTime(dayHours.close);

      if (openTime >= closeTime) {
        throw new Error(`L'heure d'ouverture doit être avant l'heure de fermeture pour ${day}`);
      }
    }
  }
}

/**
 * Parse une heure au format HH:MM en minutes depuis minuit
 * @param {string} time - Heure au format HH:MM
 * @returns {number} - Minutes depuis minuit
 */
function parseTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Retourne le nom du jour en anglais
 * @param {number} dayIndex - Index du jour (0 = dimanche, 1 = lundi, ...)
 * @returns {string} - Nom du jour
 */
function getDayName(dayIndex) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayIndex];
}

