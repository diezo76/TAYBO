/**
 * Contexte d'authentification pour les administrateurs
 * 
 * Ce contexte React fournit l'état d'authentification admin à toute l'application.
 * Il gère :
 * - L'administrateur actuellement connecté
 * - Les fonctions de connexion/déconnexion
 * - Le chargement de l'état initial
 * 
 * Utilisation :
 * const { admin, login, logout, loading } = useAdminAuth();
 */

import { createContext, useContext, useState, useEffect } from 'react';
import * as adminAuthService from '../services/adminAuthService';
import { supabase } from '../services/supabase';

// Création du contexte
const AdminAuthContext = createContext(null);

/**
 * Provider du contexte d'authentification admin
 * 
 * Ce composant doit envelopper les routes admin pour que les composants
 * enfants puissent accéder à l'état d'authentification admin.
 */
export function AdminAuthProvider({ children }) {
  // État pour stocker l'admin actuel
  const [admin, setAdmin] = useState(null);
  
  // État pour indiquer si on est en train de charger l'admin
  const [loading, setLoading] = useState(true);

  // Fonction pour charger l'admin au démarrage
  useEffect(() => {
    let isMounted = true;
    
    // Timeout de sécurité pour éviter que la page reste bloquée
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Timeout chargement admin (7s), arrêt du chargement');
        setLoading(false);
      }
    }, 7000);

    // Vérifier si un admin est déjà connecté
    const checkAdmin = async () => {
      try {
        const currentAdmin = await adminAuthService.getCurrentAdmin();
        if (isMounted) {
          setAdmin(currentAdmin);
        }
      } catch (error) {
        console.error('Erreur vérification admin:', error);
        if (isMounted) {
          setAdmin(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdmin();

    // Écouter les changements d'authentification (connexion/déconnexion)
    let subscription = null;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          try {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              // Vérifier que c'est bien l'admin qui se connecte
              if (session && session.user && session.user.email === 'admin@taybo.com') {
                // Essayer de récupérer les données admin complètes
                try {
                  const currentAdmin = await adminAuthService.getCurrentAdmin();
                  if (isMounted && currentAdmin) {
                    setAdmin(currentAdmin);
                  } else if (isMounted && session.user) {
                    // Si getCurrentAdmin() échoue mais qu'on a une session valide,
                    // créer un objet admin basique pour maintenir la session
                    setAdmin({
                      id: session.user.id,
                      email: session.user.email,
                      first_name: 'Admin',
                      last_name: '',
                      phone: null,
                      created_at: session.user.created_at,
                      isAdmin: true,
                    });
                  }
                } catch (error) {
                  console.error('Erreur récupération admin après connexion:', error);
                  // Même en cas d'erreur, si on a une session valide avec l'email admin,
                  // on maintient l'état admin pour éviter de perdre la session
                  if (isMounted && session.user && session.user.email === 'admin@taybo.com') {
                    setAdmin({
                      id: session.user.id,
                      email: session.user.email,
                      first_name: 'Admin',
                      last_name: '',
                      phone: null,
                      created_at: session.user.created_at,
                      isAdmin: true,
                    });
                  }
                }
              } else {
                // Si ce n'est pas l'admin qui se connecte, réinitialiser
                if (isMounted) {
                  setAdmin(null);
                }
              }
            } else if (event === 'SIGNED_OUT') {
              // Seulement réinitialiser en cas de déconnexion explicite
              if (isMounted) {
                setAdmin(null);
              }
            }
          } catch (error) {
            console.error('Erreur lors du changement d\'état auth:', error);
            // Ne pas réinitialiser l'admin en cas d'erreur si on a déjà un admin
            // Cela évite de perdre l'état après une connexion réussie
          } finally {
            if (isMounted) {
              setLoading(false);
            }
          }
        }
      );
      subscription = data?.subscription;
    } catch (error) {
      console.error('Erreur configuration listener auth:', error);
      if (isMounted) {
        setLoading(false);
      }
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
   * @param {string} email - Email de l'admin
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} - Résultat avec success et admin ou error
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await adminAuthService.loginAdmin(email, password);
      if (result.success && result.admin) {
        // Mettre à jour l'état admin immédiatement avec les données reçues
        setAdmin(result.admin);
        // Attendre un peu pour s'assurer que l'état est bien mis à jour
        // et que le listener onAuthStateChange a le temps de se déclencher
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        setAdmin(null);
      }
      return result;
    } catch (error) {
      console.error('Erreur connexion admin:', error);
      setAdmin(null);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la connexion',
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fonction de déconnexion
   * @returns {Promise<Object>} - Résultat avec success ou error
   */
  const logout = async () => {
    const result = await adminAuthService.logoutAdmin();
    if (result.success) {
      setAdmin(null);
    }
    return result;
  };

  /**
   * Fonction pour rafraîchir les données admin
   * @returns {Promise<void>}
   */
  const refreshAdmin = async () => {
    try {
      const currentAdmin = await adminAuthService.getCurrentAdmin();
      setAdmin(currentAdmin);
    } catch (error) {
      console.error('Erreur rafraîchissement admin:', error);
    }
  };

  // Valeur du contexte (ce qui sera accessible via useAdminAuth())
  const value = {
    admin,
    loading,
    login,
    logout,
    refreshAdmin,
    isAuthenticated: !!admin, // true si admin n'est pas null
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification admin
 * 
 * Utilisation dans un composant :
 * const { admin, login, logout, loading } = useAdminAuth();
 * 
 * @returns {Object} - Objet contenant admin, loading, login, logout, isAuthenticated
 */
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  
  if (!context) {
    throw new Error('useAdminAuth doit être utilisé à l\'intérieur d\'un AdminAuthProvider');
  }
  
  return context;
}

