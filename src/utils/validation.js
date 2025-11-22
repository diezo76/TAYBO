/**
 * Utilitaires de validation pour améliorer la sécurité
 */

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean} - true si valide
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @param {number} minLength - Longueur minimale (défaut: 6)
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validatePassword(password, minLength = 6) {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Le mot de passe est requis');
    return { valid: false, errors };
  }
  
  if (password.length < minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${minLength} caractères`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valide un numéro de téléphone (format international simplifié)
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean} - true si valide
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Format: +XX XXXXXXXXXX ou 0X XXXXXXXXXX
  const phoneRegex = /^(\+?[0-9]{1,3}[\s-]?)?[0-9]{8,15}$/;
  return phoneRegex.test(phone.trim().replace(/\s/g, ''));
}

/**
 * Valide un montant (prix)
 * @param {number|string} amount - Montant à valider
 * @param {number} min - Montant minimum (défaut: 0)
 * @returns {boolean} - true si valide
 */
export function isValidAmount(amount, min = 0) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num >= min && isFinite(num);
}

/**
 * Nettoie et valide une entrée utilisateur (protection XSS basique)
 * @param {string} input - Entrée à nettoyer
 * @returns {string} - Entrée nettoyée
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprimer les caractères < et >
    .substring(0, 10000); // Limiter la longueur
}

/**
 * Valide un UUID
 * @param {string} uuid - UUID à valider
 * @returns {boolean} - true si valide
 */
export function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valide un statut de commande
 * @param {string} status - Statut à valider
 * @returns {boolean} - true si valide
 */
export function isValidOrderStatus(status) {
  const validStatuses = ['pending', 'accepted', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
  return validStatuses.includes(status);
}

/**
 * Rate limiting simple côté client (pour éviter les abus)
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Vérifie si une requête est autorisée
   * @param {string} key - Clé unique pour l'utilisateur/action
   * @returns {boolean} - true si autorisé
   */
  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];

    // Nettoyer les requêtes anciennes
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  /**
   * Réinitialise le rate limiter pour une clé
   * @param {string} key - Clé à réinitialiser
   */
  reset(key) {
    this.requests.delete(key);
  }
}

export const rateLimiter = new RateLimiter(10, 60000); // 10 requêtes par minute

