/**
 * Contexte d'authentification pour les restaurants
 * 
 * Ce contexte React fournit l'état d'authentification restaurant à toute l'application.
 * Il gère :
 * - Le restaurant actuellement connecté
 * - Les fonctions de connexion/déconnexion/inscription
 * - Le chargement de l'état initial
 * 
 * Utilisation :
 * const { restaurant, login, signUp, logout, loading } = useRestaurantAuth();
 */

import { createContext, useContext, useState, useEffect } from 'react';
import * as restaurantAuthService from '../services/restaurantAuthService';
import { supabase } from '../services/supabase';

// Création du contexte
const RestaurantAuthContext = createContext(null);

/**
 * Provider du contexte d'authentification restaurant
 * 
 * Ce composant doit envelopper les routes restaurants pour que les composants
 * enfants puissent accéder à l'état d'authentification restaurant.
 */
export function RestaurantAuthProvider({ children }) {
  // État pour stocker le restaurant actuel
  const [restaurant, setRestaurant] = useState(null);
  
  // État pour indiquer si on est en train de charger le restaurant
  const [loading, setLoading] = useState(true);

  // Fonction pour charger le restaurant au démarrage
  useEffect(() => {
    let isMounted = true;
    
    // Timeout de sécurité pour éviter que la page reste bloquée
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Timeout chargement restaurant (7s), arrêt du chargement');
        setLoading(false);
      }
    }, 7000); // 7 secondes max (réduit car les appels ont maintenant leur propre timeout)

    // Vérifier si un restaurant est déjà connecté
    const checkRestaurant = async () => {
      try {
        const currentRestaurant = await restaurantAuthService.getCurrentRestaurant();
        if (isMounted) {
          setRestaurant(currentRestaurant);
        }
      } catch (error) {
        console.error('Erreur vérification restaurant:', error);
        if (isMounted) {
          setRestaurant(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkRestaurant();

    // Écouter les changements d'authentification (connexion/déconnexion)
    let subscription = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              const currentRestaurant = await restaurantAuthService.getCurrentRestaurant();
              // Ne réinitialiser le restaurant que si on n'a vraiment plus de session
              // Les erreurs 406 ne doivent pas causer de déconnexion
              if (currentRestaurant) {
                setRestaurant(currentRestaurant);
              } else if (session) {
                // Si on a une session mais pas de données restaurant (erreur 406), 
                // ne pas réinitialiser pour éviter la déconnexion
                // Le restaurant restera dans l'état actuel
              }
            } else if (event === 'SIGNED_OUT') {
              // Seulement réinitialiser en cas de déconnexion explicite
              setRestaurant(null);
            }
          } catch (error) {
            console.error('Erreur lors du changement d\'état auth:', error);
            // Ne pas réinitialiser le restaurant en cas d'erreur si on a encore une session
            // Vérifier la session avant de réinitialiser
            const { data: { session: checkSession } } = await supabase.auth.getSession();
            if (!checkSession) {
              setRestaurant(null);
            }
          } finally {
            setLoading(false);
          }
        }
      );
      subscription = data?.subscription;
    } catch (error) {
      console.error('Erreur configuration listener auth:', error);
      setLoading(false);
    }

    // Nettoyer l'abonnement et le timeout quand le composant est démonté
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      try {
        if (subscription) {
          subscription.unsubscribe();
        }
      } catch (error) {
        console.error('Erreur nettoyage subscription:', error);
      }
    };
  }, []);

  /**
   * Fonction de connexion
   * @param {string} email - Email du restaurant
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} - Résultat avec success et restaurant ou error
   */
  const login = async (email, password) => {
    const result = await restaurantAuthService.loginRestaurant(email, password);
    if (result.success) {
      setRestaurant(result.restaurant);
    }
    return result;
  };

  /**
   * Fonction d'inscription
   * @param {Object} restaurantData - Données du restaurant (inclut passportFile)
   * @returns {Promise<Object>} - Résultat avec success et restaurant ou error
   */
  const signUp = async (restaurantData) => {
    const result = await restaurantAuthService.signUpRestaurant(restaurantData);
    if (result.success) {
      setRestaurant(result.restaurant);
    }
    return result;
  };

  /**
   * Fonction de déconnexion
   * @returns {Promise<Object>} - Résultat avec success ou error
   */
  const logout = async () => {
    const result = await restaurantAuthService.logoutRestaurant();
    if (result.success) {
      setRestaurant(null);
    }
    return result;
  };

  // Valeur du contexte (ce qui sera accessible via useRestaurantAuth())
  const value = {
    restaurant,
    loading,
    login,
    signUp,
    logout,
    isAuthenticated: !!restaurant, // true si restaurant n'est pas null
    isVerified: restaurant?.is_verified || false,
    isActive: restaurant?.is_active || false,
  };

  return (
    <RestaurantAuthContext.Provider value={value}>
      {children}
    </RestaurantAuthContext.Provider>
  );
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification restaurant
 * 
 * Utilisation dans un composant :
 * const { restaurant, login, logout, loading } = useRestaurantAuth();
 * 
 * @returns {Object} - Objet contenant restaurant, loading, login, signUp, logout, isAuthenticated, isVerified, isActive
 */
export function useRestaurantAuth() {
  const context = useContext(RestaurantAuthContext);
  
  if (!context) {
    throw new Error('useRestaurantAuth doit être utilisé à l\'intérieur d\'un RestaurantAuthProvider');
  }
  
  return context;
}

