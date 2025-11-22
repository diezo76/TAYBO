/**
 * Service de cache en mémoire avec TTL (Time To Live)
 * 
 * Ce service permet de mettre en cache les données avec une durée de vie
 * pour optimiser les performances et réduire les requêtes à Supabase.
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
  }

  /**
   * Génère une clé de cache à partir d'un préfixe et d'arguments
   * @param {string} prefix - Préfixe de la clé
   * @param {...any} args - Arguments pour générer la clé unique
   * @returns {string} - Clé de cache
   */
  generateKey(prefix, ...args) {
    const argsString = args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg);
      }
      return String(arg);
    }).join(':');
    return `${prefix}:${argsString}`;
  }

  /**
   * Récupère une valeur du cache
   * @param {string} key - Clé de cache
   * @returns {any|null} - Valeur en cache ou null si expirée/inexistante
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Vérifier si l'item a expiré
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Stocke une valeur dans le cache
   * @param {string} key - Clé de cache
   * @param {any} value - Valeur à stocker
   * @param {number} ttl - Durée de vie en millisecondes (optionnel)
   */
  set(key, value, ttl = null) {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now(),
    });
  }

  /**
   * Supprime une valeur du cache
   * @param {string} key - Clé de cache
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Supprime toutes les valeurs d'un préfixe
   * @param {string} prefix - Préfixe à supprimer
   */
  deleteByPrefix(prefix) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix + ':')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Vide tout le cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Nettoie les entrées expirées du cache
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Récupère une valeur du cache ou exécute une fonction si non présente
   * @param {string} key - Clé de cache
   * @param {Function} fetchFn - Fonction à exécuter si non en cache
   * @param {number} ttl - Durée de vie en millisecondes (optionnel)
   * @returns {Promise<any>} - Valeur en cache ou résultat de fetchFn
   */
  async getOrSet(key, fetchFn, ttl = null) {
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Invalide le cache pour un préfixe (utile après mutations)
   * @param {string} prefix - Préfixe à invalider
   */
  invalidate(prefix) {
    this.deleteByPrefix(prefix);
  }
}

// Instance singleton
const cacheService = new CacheService();

// Nettoyage automatique toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheService.cleanup();
  }, 10 * 60 * 1000);
}

export default cacheService;

