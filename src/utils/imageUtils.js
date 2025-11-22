/**
 * Utilitaires pour la gestion des images
 * 
 * Fonctions pour obtenir les URLs publiques des images stockées dans Supabase Storage
 */

import { supabase } from '../services/supabase';

/**
 * Obtient l'URL publique d'une image de restaurant
 * Si l'URL est déjà une URL complète, elle est retournée telle quelle
 * Sinon, on essaie de générer l'URL publique depuis Supabase Storage
 * 
 * @param {string} imageUrl - URL de l'image (peut être complète ou un chemin relatif)
 * @returns {string} - URL publique de l'image
 */
export function getRestaurantImageUrl(imageUrl) {
  if (!imageUrl) {
    if (import.meta.env.DEV) {
      console.log('[imageUtils] getRestaurantImageUrl: URL vide');
    }
    return null;
  }

  if (import.meta.env.DEV) {
    console.log('[imageUtils] getRestaurantImageUrl - URL originale:', imageUrl);
  }

  // Si l'URL est déjà une URL complète (commence par http:// ou https://)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (import.meta.env.DEV) {
      console.log('[imageUtils] URL complète détectée');
    }
    
    // Vérifier si c'est une URL Supabase Storage publique
    // Format typique: https://[project].supabase.co/storage/v1/object/public/restaurant-images/...
    if (imageUrl.includes('/storage/v1/object/public/restaurant-images/')) {
      if (import.meta.env.DEV) {
        console.log('[imageUtils] URL Supabase Storage publique détectée, retournée telle quelle');
      }
      return imageUrl;
    }
    
    // Si c'est une URL Supabase Storage signée (avec token), essayer de la rendre publique
    if (imageUrl.includes('/storage/v1/object/sign/restaurant-images/')) {
      if (import.meta.env.DEV) {
        console.log('[imageUtils] URL Supabase Storage signée détectée, conversion en URL publique');
      }
      // Extraire le chemin du fichier depuis l'URL signée
      const signMatch = imageUrl.match(/\/restaurant-images\/([^?]+)/);
      if (signMatch && signMatch[1]) {
        const filePath = signMatch[1];
        const { data } = supabase.storage
          .from('restaurant-images')
          .getPublicUrl(filePath);
        const publicUrl = data?.publicUrl || imageUrl;
        if (import.meta.env.DEV) {
          console.log('[imageUtils] URL publique générée depuis URL signée:', publicUrl);
        }
        return publicUrl;
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('[imageUtils] URL complète retournée telle quelle');
    }
    return imageUrl;
  }

  // Si l'URL contient le chemin du bucket, extraire le chemin du fichier
  if (imageUrl.includes('/restaurant-images/')) {
    const pathParts = imageUrl.split('/restaurant-images/');
    if (pathParts.length > 1) {
      const filePath = pathParts[1].split('?')[0]; // Enlever les query params
      if (import.meta.env.DEV) {
        console.log('[imageUtils] Extraction chemin depuis URL bucket:', filePath);
      }
      const { data } = supabase.storage
        .from('restaurant-images')
        .getPublicUrl(filePath);
      const finalUrl = data?.publicUrl || imageUrl;
      if (import.meta.env.DEV) {
        console.log('[imageUtils] URL générée depuis bucket:', finalUrl);
      }
      return finalUrl;
    }
  }

  // Si c'est juste un chemin de fichier (sans préfixe, format: restaurantId/timestamp.ext)
  if (!imageUrl.includes('://') && !imageUrl.includes('/')) {
    // Ce n'est probablement pas un chemin valide, retourner null
    if (import.meta.env.DEV) {
      console.log('[imageUtils] Chemin invalide (pas de /):', imageUrl);
    }
    return null;
  }

  // Si c'est un chemin relatif (format: restaurantId/timestamp.ext)
  if (!imageUrl.includes('://') && imageUrl.includes('/')) {
    if (import.meta.env.DEV) {
      console.log('[imageUtils] Chemin relatif détecté, génération URL publique:', imageUrl);
    }
    const { data } = supabase.storage
      .from('restaurant-images')
      .getPublicUrl(imageUrl);
    const finalUrl = data?.publicUrl || imageUrl;
    if (import.meta.env.DEV) {
      console.log('[imageUtils] URL générée depuis chemin relatif:', finalUrl);
    }
    return finalUrl;
  }

  // Par défaut, retourner l'URL telle quelle
  if (import.meta.env.DEV) {
    console.log('[imageUtils] Retour URL par défaut:', imageUrl);
  }
  return imageUrl;
}

/**
 * Obtient l'URL publique d'une image de menu
 * 
 * @param {string} imageUrl - URL de l'image
 * @returns {string} - URL publique de l'image
 */
export function getMenuImageUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  // Si l'URL est déjà une URL complète
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si l'URL contient le chemin du bucket
  if (imageUrl.includes('/menu-images/')) {
    const pathParts = imageUrl.split('/menu-images/');
    if (pathParts.length > 1) {
      const filePath = pathParts[1].split('?')[0];
      const { data } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);
      return data.publicUrl;
    }
  }

  // Si c'est juste un chemin de fichier
  if (!imageUrl.includes('://')) {
    const { data } = supabase.storage
      .from('menu-images')
      .getPublicUrl(imageUrl);
    return data.publicUrl;
  }

  return imageUrl;
}

/**
 * Obtient l'URL publique d'une image de profil utilisateur
 * 
 * @param {string} imageUrl - URL de l'image
 * @returns {string} - URL publique de l'image
 */
export function getUserImageUrl(imageUrl) {
  if (!imageUrl) {
    if (import.meta.env.DEV) {
      console.log('[imageUtils] getUserImageUrl: URL vide');
    }
    return null;
  }

  if (import.meta.env.DEV) {
    console.log('[imageUtils] getUserImageUrl - URL originale:', imageUrl);
  }

  // Si l'URL est déjà une URL complète
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    if (import.meta.env.DEV) {
      console.log('[imageUtils] URL complète détectée');
    }
    
    // Vérifier si c'est une URL Supabase Storage publique
    if (imageUrl.includes('/storage/v1/object/public/user-images/')) {
      if (import.meta.env.DEV) {
        console.log('[imageUtils] URL Supabase Storage publique détectée, retournée telle quelle');
      }
      return imageUrl;
    }
    
    // Si c'est une URL Supabase Storage signée, essayer de la rendre publique
    if (imageUrl.includes('/storage/v1/object/sign/user-images/')) {
      if (import.meta.env.DEV) {
        console.log('[imageUtils] URL Supabase Storage signée détectée, conversion en URL publique');
      }
      const signMatch = imageUrl.match(/\/user-images\/([^?]+)/);
      if (signMatch && signMatch[1]) {
        const filePath = signMatch[1];
        const { data } = supabase.storage
          .from('user-images')
          .getPublicUrl(filePath);
        const publicUrl = data?.publicUrl || imageUrl;
        if (import.meta.env.DEV) {
          console.log('[imageUtils] URL publique générée depuis URL signée:', publicUrl);
        }
        return publicUrl;
      }
    }
    
    if (import.meta.env.DEV) {
      console.log('[imageUtils] URL complète retournée telle quelle');
    }
    return imageUrl;
  }

  // Si l'URL contient le chemin du bucket
  if (imageUrl.includes('/user-images/')) {
    const pathParts = imageUrl.split('/user-images/');
    if (pathParts.length > 1) {
      const filePath = pathParts[1].split('?')[0];
      if (import.meta.env.DEV) {
        console.log('[imageUtils] Extraction chemin depuis URL bucket:', filePath);
      }
      const { data } = supabase.storage
        .from('user-images')
        .getPublicUrl(filePath);
      const finalUrl = data?.publicUrl || imageUrl;
      if (import.meta.env.DEV) {
        console.log('[imageUtils] URL générée depuis bucket:', finalUrl);
      }
      return finalUrl;
    }
  }

  // Si c'est un chemin relatif (format: userId/timestamp.ext)
  if (!imageUrl.includes('://') && imageUrl.includes('/')) {
    if (import.meta.env.DEV) {
      console.log('[imageUtils] Chemin relatif détecté, génération URL publique:', imageUrl);
    }
    const { data } = supabase.storage
      .from('user-images')
      .getPublicUrl(imageUrl);
    const finalUrl = data?.publicUrl || imageUrl;
    if (import.meta.env.DEV) {
      console.log('[imageUtils] URL générée depuis chemin relatif:', finalUrl);
    }
    return finalUrl;
  }

  // Par défaut, retourner l'URL telle quelle
  if (import.meta.env.DEV) {
    console.log('[imageUtils] Retour URL par défaut:', imageUrl);
  }
  return imageUrl;
}

