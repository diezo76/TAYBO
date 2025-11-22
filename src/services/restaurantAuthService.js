/**
 * Service d'authentification pour les restaurants
 * 
 * Similaire à authService mais pour les restaurants.
 * Gère l'inscription avec upload de passeport.
 */

import { supabase } from './supabase';

/**
 * Inscrit un nouveau restaurant
 * @param {Object} restaurantData - Données du restaurant
 * @param {string} restaurantData.email - Email du restaurant
 * @param {string} restaurantData.password - Mot de passe
 * @param {string} restaurantData.name - Nom du restaurant
 * @param {string} restaurantData.description - Description
 * @param {string} restaurantData.cuisineType - Type de cuisine
 * @param {string} restaurantData.address - Adresse
 * @param {string} restaurantData.phone - Téléphone
 * @param {File} restaurantData.passportFile - Fichier passeport à uploader
 * @param {number} restaurantData.deliveryFee - Frais de livraison
 * @returns {Promise<Object>} - Résultat avec success et restaurant ou error
 */
export async function signUpRestaurant(restaurantData) {
  try {
    // 1. Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: restaurantData.email,
      password: restaurantData.password,
      options: {
        data: {
          name: restaurantData.name,
          user_type: 'restaurant',
        },
      },
    });

    if (authError) {
      throw authError;
    }

    // 2. Upload du passeport vers Supabase Storage
    let passportUrl = null;
    if (restaurantData.passportFile) {
      const fileExt = restaurantData.passportFile.name.split('.').pop();
      const fileName = `${authData.user.id}-${Date.now()}.${fileExt}`;
      // IMPORTANT : Ne pas ajouter "passports/" car le bucket s'appelle déjà "passports"
      // Le filePath doit être juste le nom du fichier
      const filePath = fileName;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('passports')
        .upload(filePath, restaurantData.passportFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Erreur upload passport:', uploadError);
        throw uploadError;
      }

      // Récupérer l'URL publique du fichier
      const { data: urlData } = supabase.storage
        .from('passports')
        .getPublicUrl(filePath);

      passportUrl = urlData.publicUrl;
    }

    // 3. Créer l'entrée dans notre table restaurants
    const { data: restaurantResult, error: restaurantError } = await supabase
      .from('restaurants')
      .insert([
        {
          id: authData.user.id,
          email: restaurantData.email,
          password_hash: 'hashed_by_supabase_auth',
          name: restaurantData.name,
          description: restaurantData.description || null,
          cuisine_type: restaurantData.cuisineType,
          address: restaurantData.address,
          phone: restaurantData.phone,
          passport_document_url: passportUrl,
          delivery_fee: restaurantData.deliveryFee,
          is_verified: false, // Doit être vérifié par un admin
          is_active: false, // Inactif jusqu'à vérification
        },
      ])
      .select()
      .single();

    if (restaurantError && restaurantError.code !== '23505') {
      console.warn('Erreur création entrée restaurant, mais auth réussi:', restaurantError);
    }

    // Récupérer les données du restaurant créé
    let finalRestaurantData = restaurantResult;
    if (!finalRestaurantData) {
      const { data: existingRestaurant } = await supabase
        .from('restaurants')
        .select('id, email, name, description, cuisine_type, address, phone, delivery_fee, is_verified, is_active, created_at')
        .eq('id', authData.user.id)
        .single();
      finalRestaurantData = existingRestaurant;
    }

    const { password_hash, ...restaurantWithoutPassword } = finalRestaurantData || {};
    return {
      success: true,
      restaurant: restaurantWithoutPassword,
      session: authData.session,
      message: 'Inscription réussie ! Votre compte sera activé après vérification par un administrateur.',
    };
  } catch (error) {
    console.error('Erreur inscription restaurant:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de l\'inscription',
    };
  }
}

/**
 * Connecte un restaurant
 * @param {string} email - Email du restaurant
 * @param {string} password - Mot de passe
 * @returns {Promise<Object>} - Résultat avec success et restaurant/session ou error
 */
export async function loginRestaurant(email, password) {
  try {
    // Validation des données avant l'envoi
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.error('[loginRestaurant] Email invalide:', email);
      return {
        success: false,
        error: 'L\'email est requis et doit être valide',
      };
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      console.error('[loginRestaurant] Mot de passe invalide');
      return {
        success: false,
        error: 'Le mot de passe est requis',
      };
    }

    // Vérifier la configuration Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[loginRestaurant] Configuration Supabase manquante');
      return {
        success: false,
        error: 'Configuration Supabase manquante. Vérifiez les variables d\'environnement.',
      };
    }

    // Normaliser l'email (trim et lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    console.log('[loginRestaurant] Tentative de connexion pour:', normalizedEmail);

    // Utiliser Supabase Auth pour la connexion
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password.trim(),
    });

    if (error) {
      // Log détaillé de l'erreur pour le débogage
      console.error('[loginRestaurant] Erreur Supabase Auth:', {
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

    // Récupérer les données restaurant depuis notre table custom
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, email, name, description, cuisine_type, address, phone, delivery_fee, is_verified, is_active, average_rating, total_reviews, image_url, created_at')
      .eq('id', data.user.id)
      .single();

    if (restaurantError) {
      throw restaurantError;
    }

    // Vérifier si le restaurant est vérifié et actif
    if (!restaurantData.is_verified) {
      return {
        success: false,
        error: 'Votre compte n\'a pas encore été vérifié par un administrateur.',
      };
    }

    if (!restaurantData.is_active) {
      return {
        success: false,
        error: 'Votre compte est désactivé. Contactez le support pour plus d\'informations.',
      };
    }

    return {
      success: true,
      restaurant: restaurantData,
      session: data.session,
    };
  } catch (error) {
    console.error('Erreur connexion restaurant:', error);
    return {
      success: false,
      error: error.message || 'Email ou mot de passe incorrect',
    };
  }
}

/**
 * Déconnecte le restaurant
 * @returns {Promise<Object>} - Résultat avec success ou error
 */
export async function logoutRestaurant() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la déconnexion',
    };
  }
}

/**
 * Récupère le restaurant actuellement connecté
 * @returns {Promise<Object|null>} - Restaurant connecté ou null
 */
export async function getCurrentRestaurant() {
  try {
    // Récupérer la session actuelle avec timeout
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout session')), 5000)
    );
    
    const { data: { session }, error: sessionError } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]).catch(() => ({ data: { session: null }, error: { message: 'Timeout' } }));
    
    if (sessionError || !session) {
      return null;
    }

    // Récupérer les données restaurant avec timeout
    const restaurantPromise = supabase
      .from('restaurants')
      .select('id, email, name, description, cuisine_type, address, phone, delivery_fee, is_verified, is_active, is_frozen, frozen_reason, frozen_at, average_rating, total_reviews, image_url, created_at')
      .eq('id', session.user.id)
      .single();
    
    const timeoutPromise2 = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout restaurant data')), 5000)
    );
    
    const { data: restaurantData, error: restaurantError } = await Promise.race([
      restaurantPromise,
      timeoutPromise2
    ]).catch((err) => {
      console.warn('Timeout ou erreur récupération données restaurant:', err);
      return { data: null, error: { message: 'Timeout' } };
    });

    if (restaurantError) {
      // Log détaillé de l'erreur pour diagnostic
      console.error('Erreur détaillée récupération restaurant:', {
        code: restaurantError.code,
        message: restaurantError.message,
        details: restaurantError.details,
        hint: restaurantError.hint,
        status: restaurantError.status || restaurantError.statusCode,
        restaurantId: session.user.id
      });

      // Si l'erreur est "not found" ou RLS, c'est normal si pas de restaurant
      // Ne pas déconnecter en cas d'erreur 406 (Not Acceptable) ou 400 (Bad Request) - ce sont des erreurs de requête
      const is406Error = restaurantError.status === 406 || 
                         restaurantError.statusCode === 406 ||
                         restaurantError.code === '406' ||
                         restaurantError.message?.includes('406') ||
                         restaurantError.message?.includes('Not Acceptable');
      
      const is400Error = restaurantError.status === 400 || 
                         restaurantError.statusCode === 400 ||
                         restaurantError.code === '400' ||
                         restaurantError.message?.includes('400') ||
                         restaurantError.message?.includes('Bad Request');
      
      if (restaurantError.code === 'PGRST116' || 
          restaurantError.message?.includes('timeout') ||
          is406Error ||
          is400Error) {
        // Vérifier si on a toujours une session valide
        try {
          const { data: { session: checkSession } } = await supabase.auth.getSession();
          if (checkSession) {
            // Si on a une session mais pas de données restaurant, retourner null sans déconnecter
            // Le restaurant reste connecté même si on ne peut pas récupérer ses données
            console.warn('Session valide mais impossible de récupérer les données restaurant (erreur 406/400)');
            return null;
          }
        } catch (sessionError) {
          // Si on ne peut pas vérifier la session, retourner null
          console.warn('Erreur vérification session:', sessionError);
        }
        return null;
      }
      console.warn('Erreur récupération restaurant:', restaurantError);
      return null;
    }

    if (!restaurantData) {
      return null;
    }

    return restaurantData;
  } catch (error) {
    // Erreur de timeout ou autre erreur
    if (error.message?.includes('Timeout')) {
      console.warn('Timeout récupération restaurant');
    } else {
      console.error('Erreur récupération restaurant:', error);
    }
    return null;
  }
}


