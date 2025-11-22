/**
 * Service d'authentification pour les administrateurs
 * 
 * Les admins utilisent la table users avec l'email admin@taybo.com
 * L'authentification se fait via Supabase Auth comme pour les clients
 */

import { supabase } from './supabase';

// Email admin par défaut (peut être configuré via variable d'environnement)
const ADMIN_EMAIL = 'admin@taybo.com';

/**
 * Connecte un administrateur
 * @param {string} email - Email de l'admin
 * @param {string} password - Mot de passe
 * @returns {Promise<Object>} - Résultat avec success et admin/session ou error
 */
export async function loginAdmin(email, password) {
  try {
    // Validation des données avant l'envoi
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.error('[loginAdmin] Email invalide:', email);
      return {
        success: false,
        error: 'L\'email est requis et doit être valide',
      };
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      console.error('[loginAdmin] Mot de passe invalide');
      return {
        success: false,
        error: 'Le mot de passe est requis',
      };
    }

    // Normaliser l'email
    const normalizedEmail = email.trim().toLowerCase();

    // Vérifier que l'email est celui d'un admin
    if (normalizedEmail !== ADMIN_EMAIL) {
      return {
        success: false,
        error: 'Accès refusé. Email non autorisé.',
      };
    }

    // Vérifier la configuration Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[loginAdmin] Configuration Supabase manquante');
      return {
        success: false,
        error: 'Configuration Supabase manquante. Vérifiez les variables d\'environnement.',
      };
    }

    console.log('[loginAdmin] Tentative de connexion admin pour:', normalizedEmail);

    // Utiliser Supabase Auth pour la connexion
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password.trim(),
    });

    if (error) {
      // Log détaillé de l'erreur pour le débogage
      console.error('[loginAdmin] Erreur Supabase Auth:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        name: error.name,
        error: error,
      });

      // Gérer spécifiquement les erreurs 400
      let errorMessage = 'Email ou mot de passe incorrect';
      
      if (error.status === 400 || error.statusCode === 400) {
        if (error.message) {
          if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_grant')) {
            errorMessage = 'Email ou mot de passe incorrect. Vérifiez vos identifiants ou confirmez votre email si vous venez de vous inscrire.';
          } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            errorMessage = 'Votre email n\'a pas été confirmé. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.';
          } else if (error.message.includes('User not found') || error.message.includes('user_not_found')) {
            errorMessage = 'Aucun compte trouvé avec cet email. Vérifiez votre email ou inscrivez-vous.';
          } else if (error.message.includes('Invalid email') || error.message.includes('invalid_email')) {
            errorMessage = 'Format d\'email invalide. Veuillez vérifier votre adresse email.';
          } else {
            errorMessage = `Erreur de connexion: ${error.message}`;
          }
        } else {
          errorMessage = 'Erreur de connexion (400). Vérifiez vos identifiants et que votre email est confirmé.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        errorDetails: {
          status: error.status || error.statusCode,
          message: error.message,
        },
      };
    }

    // Vérifier que l'utilisateur existe dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, created_at')
      .eq('id', data.user.id)
      .eq('email', ADMIN_EMAIL)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Compte administrateur non trouvé. Contactez le support.',
      };
    }

    return {
      success: true,
      admin: {
        ...userData,
        isAdmin: true,
      },
      session: data.session,
    };
  } catch (error) {
    console.error('Erreur connexion admin:', error);
    return {
      success: false,
      error: error.message || 'Email ou mot de passe incorrect',
    };
  }
}

/**
 * Déconnecte l'administrateur
 * @returns {Promise<Object>} - Résultat avec success ou error
 */
export async function logoutAdmin() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Erreur déconnexion admin:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la déconnexion',
    };
  }
}

/**
 * Récupère l'administrateur actuellement connecté
 * @returns {Promise<Object|null>} - Admin connecté ou null
 */
export async function getCurrentAdmin() {
  try {
    // Timeout de sécurité pour éviter les blocages
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout récupération admin')), 5000)
    );

    const sessionPromise = supabase.auth.getSession();
    const { data: { session }, error: sessionError } = await Promise.race([
      sessionPromise,
      timeoutPromise,
    ]).catch(() => ({ data: { session: null }, error: { message: 'Timeout' } }));
    
    if (sessionError || !session || !session.user) {
      return null;
    }

    // Vérifier que l'email correspond à l'admin
    if (session.user.email !== ADMIN_EMAIL) {
      return null;
    }

    // Vérifier que l'utilisateur est un admin dans la table users
    const userQueryPromise = supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, created_at')
      .eq('id', session.user.id)
      .eq('email', ADMIN_EMAIL)
      .single();

    const { data: userData, error: userError } = await Promise.race([
      userQueryPromise,
      timeoutPromise,
    ]).catch(() => ({ data: null, error: { message: 'Timeout' } }));

    if (userError || !userData) {
      // Si l'utilisateur n'existe pas dans la table users mais est connecté avec l'email admin,
      // on retourne quand même un objet admin basique
      if (session.user.email === ADMIN_EMAIL) {
        return {
          id: session.user.id,
          email: session.user.email,
          first_name: 'Admin',
          last_name: '',
          phone: null,
          created_at: session.user.created_at,
          isAdmin: true,
        };
      }
      return null;
    }

    return {
      ...userData,
      isAdmin: true,
    };
  } catch (error) {
    console.error('Erreur récupération admin:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur actuel est un admin
 * @returns {Promise<boolean>} - true si admin, false sinon
 */
export async function isAdmin() {
  const admin = await getCurrentAdmin();
  return admin !== null;
}

