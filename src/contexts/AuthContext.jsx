/**
 * Contexte d'authentification
 * 
 * Ce contexte React fournit l'état d'authentification à toute l'application.
 * Il gère :
 * - L'utilisateur actuellement connecté
 * - Les fonctions de connexion/déconnexion
 * - Le chargement de l'état initial
 * 
 * Utilisation :
 * const { user, login, logout, loading } = useAuth();
 */

import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

// Création du contexte
const AuthContext = createContext(null);

/**
 * Provider du contexte d'authentification
 * 
 * Ce composant doit envelopper toute l'application pour que les composants
 * enfants puissent accéder à l'état d'authentification.
 */
export function AuthProvider({ children }) {
  // État pour stocker l'utilisateur actuel
  const [user, setUser] = useState(null);
  
  // État pour indiquer si on est en train de charger l'utilisateur
  const [loading, setLoading] = useState(true);

  // Fonction pour charger l'utilisateur au démarrage
  useEffect(() => {
    let isMounted = true;
    
    // Timeout de sécurité pour éviter que la page reste bloquée
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Timeout chargement utilisateur (7s), arrêt du chargement');
        setLoading(false);
      }
    }, 7000); // 7 secondes max (réduit car les appels ont maintenant leur propre timeout)

    // Vérifier si un utilisateur est déjà connecté
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erreur vérification utilisateur:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkUser();

    // Écouter les changements d'authentification (connexion/déconnexion)
    let unsubscribe = null;
    try {
      unsubscribe = authService.onAuthStateChange(
        async (newUser, session) => {
          console.log('[AuthContext] Changement auth détecté:', { hasUser: !!newUser, hasSession: !!session });
          
          // Si on a une session valide
          if (session) {
            // Vérifier le type d'utilisateur dans les métadonnées
            const userType = session.user?.user_metadata?.user_type;
            
            // Si c'est un restaurant, ne pas essayer de récupérer les données utilisateur
            if (userType === 'restaurant') {
              console.log('[AuthContext] Utilisateur de type restaurant détecté, ne pas récupérer les données utilisateur');
              if (isMounted) {
                setUser(null); // Pas d'utilisateur client pour les restaurants
                setLoading(false);
              }
              return;
            }
            
            // Si on a les données utilisateur, les mettre à jour
            if (newUser) {
              console.log('[AuthContext] Mise à jour utilisateur avec données complètes');
              setUser(newUser);
            } else {
              // Si on a une session mais pas de données utilisateur, essayer de les récupérer
              // Seulement si ce n'est pas un restaurant
              console.log('[AuthContext] Session valide mais pas de données utilisateur, tentative de récupération');
              try {
                const userData = await authService.getCurrentUser();
                if (userData && isMounted) {
                  console.log('[AuthContext] Données utilisateur récupérées avec succès');
                  setUser(userData);
                } else {
                  console.log('[AuthContext] Impossible de récupérer les données utilisateur, maintien de l\'état actuel');
                  // Ne pas déconnecter, garder l'utilisateur actuel si disponible
                }
              } catch (error) {
                console.warn('[AuthContext] Erreur récupération données utilisateur:', error);
                // Ne pas déconnecter en cas d'erreur
              }
            }
          } else if (!session && !newUser) {
            // Seulement déconnecter si on n'a ni session ni utilisateur
            console.log('[AuthContext] Pas de session ni d\'utilisateur, déconnexion');
            setUser(null);
          }
          
          if (isMounted) {
            setLoading(false);
          }
        }
      );
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
        if (unsubscribe && unsubscribe.data && unsubscribe.data.subscription) {
          unsubscribe.data.subscription.unsubscribe();
        }
      } catch (error) {
        console.error('Erreur nettoyage subscription:', error);
      }
    };
  }, []);

  /**
   * Fonction de connexion
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} - Résultat avec success et user ou error
   */
  const login = async (email, password) => {
    const result = await authService.loginClient(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  /**
   * Fonction d'inscription
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>} - Résultat avec success et user ou error
   */
  const signUp = async (userData) => {
    const result = await authService.signUpClient(userData);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  /**
   * Fonction de déconnexion
   * @returns {Promise<Object>} - Résultat avec success ou error
   */
  const logout = async () => {
    const result = await authService.logoutClient();
    if (result.success) {
      setUser(null);
    }
    return result;
  };

  /**
   * Fonction pour rafraîchir les données utilisateur
   * Utile après une mise à jour du profil
   * @returns {Promise<void>}
   */
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Erreur rafraîchissement utilisateur:', error);
    }
  };

  // Valeur du contexte (ce qui sera accessible via useAuth())
  const value = {
    user,
    loading,
    login,
    signUp,
    logout,
    refreshUser,
    isAuthenticated: !!user, // true si user n'est pas null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 * 
 * Utilisation dans un composant :
 * const { user, login, logout, loading } = useAuth();
 * 
 * @returns {Object} - Objet contenant user, loading, login, signUp, logout, isAuthenticated
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
}

