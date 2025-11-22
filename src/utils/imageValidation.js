/**
 * Utilitaires de validation et correction des images
 * 
 * Fonctions pour vérifier l'existence des fichiers dans Supabase Storage
 * et corriger automatiquement les URLs si nécessaire
 */

import { supabase } from '../services/supabase';

/**
 * Vérifie si un fichier existe dans le storage Supabase
 * @param {string} bucketName - Nom du bucket
 * @param {string} filePath - Chemin du fichier
 * @returns {Promise<boolean>} - True si le fichier existe
 */
export async function checkFileExists(bucketName, filePath) {
  try {
    // Essayer de récupérer le fichier directement pour vérifier son existence
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(filePath.split('/')[0], {
        limit: 1000,
      });

    if (error) {
      if (import.meta.env.DEV) {
        console.warn(`[imageValidation] Erreur lors de la vérification du fichier:`, error);
      }
      // Si on ne peut pas vérifier, supposer que le fichier existe (fallback)
      return true;
    }

    if (!data || data.length === 0) {
      return false;
    }

    const fileName = filePath.split('/').pop();
    const exists = data.some(file => file.name === fileName);
    
    if (import.meta.env.DEV && !exists) {
      console.warn(`[imageValidation] Fichier non trouvé dans la liste: ${filePath}`);
    }
    
    return exists;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[imageValidation] Erreur lors de la vérification:`, error);
    }
    // En cas d'erreur, supposer que le fichier existe pour éviter de bloquer l'affichage
    return true;
  }
}

/**
 * Trouve le fichier le plus récent dans un dossier du storage
 * @param {string} bucketName - Nom du bucket
 * @param {string} folderPath - Chemin du dossier
 * @returns {Promise<string|null>} - Chemin du fichier le plus récent ou null
 */
export async function findLatestFile(bucketName, folderPath) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error || !data || data.length === 0) {
      return null;
    }

    // Retourner le chemin complet du fichier le plus récent
    const latestFile = data[0];
    return `${folderPath}/${latestFile.name}`;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[imageValidation] Erreur lors de la recherche du fichier:`, error);
    }
    return null;
  }
}

/**
 * Valide et corrige l'URL d'une image de restaurant si nécessaire
 * @param {string} imageUrl - URL de l'image
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<string|null>} - URL corrigée ou null si aucune image disponible
 */
export async function validateAndFixRestaurantImage(imageUrl, restaurantId) {
  if (!imageUrl || !restaurantId) {
    return null;
  }

  // Si l'URL est une URL externe (comme Unsplash, etc.), la retourner telle quelle
  // sans essayer de la valider dans Supabase Storage
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Vérifier si c'est une URL Supabase Storage
    if (!imageUrl.includes('/restaurant-images/') && !imageUrl.includes('supabase.co')) {
      // C'est une URL externe (Unsplash, etc.), la retourner telle quelle
      return imageUrl;
    }
  }

  // Extraire le chemin du fichier depuis l'URL Supabase Storage
  let filePath = null;
  if (imageUrl.includes('/restaurant-images/')) {
    const pathMatch = imageUrl.match(/\/restaurant-images\/(.+)/);
    if (pathMatch && pathMatch[1]) {
      filePath = pathMatch[1].split('?')[0]; // Enlever les query params
    }
  }

  if (!filePath) {
    // Si on ne peut pas extraire le chemin, c'est probablement une URL externe
    // Retourner l'URL originale sans warning
    return imageUrl;
  }

  // Vérifier si le fichier existe
  const fileExists = await checkFileExists('restaurant-images', filePath);

  if (fileExists) {
    // Le fichier existe, retourner l'URL originale
    return imageUrl;
  }

  // Le fichier n'existe pas, chercher un fichier plus récent
  if (import.meta.env.DEV) {
    console.warn(`[imageValidation] Fichier manquant: ${filePath}, recherche d'un fichier alternatif...`);
  }

  const latestFile = await findLatestFile('restaurant-images', restaurantId);

  if (latestFile) {
    // Générer la nouvelle URL avec le fichier trouvé
    const { data } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(latestFile);

    if (data?.publicUrl) {
      if (import.meta.env.DEV) {
        console.info(`[imageValidation] Fichier alternatif trouvé: ${latestFile}`);
        console.info(`[imageValidation] Nouvelle URL: ${data.publicUrl}`);
      }
      return data.publicUrl;
    }
  }

  // Aucun fichier disponible
  if (import.meta.env.DEV) {
    console.warn(`[imageValidation] Aucun fichier disponible pour le restaurant ${restaurantId}`);
  }
  return null;
}

/**
 * Liste tous les fichiers d'un restaurant dans le storage
 * @param {string} restaurantId - ID du restaurant
 * @returns {Promise<Array>} - Liste des fichiers
 */
export async function listRestaurantFiles(restaurantId) {
  try {
    const { data, error } = await supabase.storage
      .from('restaurant-images')
      .list(restaurantId, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      if (import.meta.env.DEV) {
        console.warn(`[imageValidation] Erreur lors de la liste des fichiers:`, error);
      }
      return [];
    }

    return data || [];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[imageValidation] Erreur lors de la liste:`, error);
    }
    return [];
  }
}

