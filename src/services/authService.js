/**
 * Service d'authentification
 * 
 * Ce service gère l'inscription, la connexion et la déconnexion des utilisateurs.
 * 
 * Pour ce MVP, nous utilisons un système simple avec Supabase :
 * - Les mots de passe sont hashés avec bcrypt côté serveur (via Edge Function)
 * - Les sessions sont gérées avec localStorage
 * - Les tokens JWT sont générés côté serveur
 * 
 * Note : Pour la production, il serait mieux d'utiliser Supabase Auth directement,
 * mais pour ce MVP, nous utilisons nos tables custom pour plus de contrôle.
 */

import { supabase } from './supabase';

// Email admin par défaut (doit correspondre à celui dans adminAuthService.js)
const ADMIN_EMAIL = 'admin@taybo.com';

/**
 * Inscrit un nouveau client
 * @param {Object} userData - Données du client
 * @param {string} userData.email - Email du client
 * @param {string} userData.password - Mot de passe en clair
 * @param {string} userData.firstName - Prénom
 * @param {string} userData.lastName - Nom
 * @param {string} userData.phone - Téléphone (optionnel)
 * @param {string} userData.language - Langue préférée (fr/ar/en)
 * @returns {Promise<Object>} - Résultat avec success et user ou error
 */
export async function signUpClient(userData) {
  try {
    // Appeler une Edge Function Supabase pour hasher le mot de passe
    // Pour l'instant, on va utiliser une approche simple avec Supabase Auth
    // qui gère déjà le hachage des mots de passe
    
    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          language: userData.language || 'fr',
          user_type: 'client',
        },
      },
    });

    if (authError) {
      throw authError;
    }

    // Vérifier que l'utilisateur a été créé
    if (!authData.user) {
      throw new Error('Échec de la création de l\'utilisateur');
    }

    // Si une session est disponible (email confirmé ou confirmation désactivée),
    // établir la session avant d'insérer dans la table users
    if (authData.session) {
      // La session est disponible, on peut insérer immédiatement
      // La session sera utilisée par RLS pour vérifier auth.uid()
      console.log('[signUpClient] Session disponible, insertion dans users...');
    } else {
      // Pas de session (email non confirmé), on ne peut pas insérer maintenant
      // L'utilisateur devra confirmer son email puis se connecter
      // L'entrée sera créée lors de la première connexion (voir loginClient)
      console.log('[signUpClient] Pas de session (email non confirmé), insertion différée');
      return {
        success: true,
        user: null,
        session: null,
        requiresEmailConfirmation: true,
        message: 'Votre compte a été créé. Veuillez vérifier votre email et confirmer votre compte avant de vous connecter.',
      };
    }

    // Créer l'entrée dans notre table users custom
    // Note: Si l'insertion échoue, l'utilisateur pourra toujours se connecter
    // et nous créerons l'entrée lors de la première connexion
    
    // ÉTAPE 1 : Vérifier l'existence par email avant insertion
    console.log('[signUpClient] Vérification de l\'existence par email avant insertion...');
    const { data: existingUserByEmail, error: emailCheckError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
      .eq('email', userData.email)
      .single();

    // ÉTAPE 2 : Gérer les données incohérentes - si l'email existe avec un ID différent
    if (existingUserByEmail) {
      if (existingUserByEmail.id !== authData.user.id) {
        // L'email existe déjà mais avec un ID différent - données incohérentes
        console.warn('[signUpClient] Email existe déjà avec un ID différent, utilisation de l\'entrée existante');
        console.warn('[signUpClient] ID Auth:', authData.user.id, 'ID Users:', existingUserByEmail.id);
        const { password_hash, ...userWithoutPassword } = existingUserByEmail;
        return {
          success: true,
          user: userWithoutPassword,
          session: authData.session,
          warning: 'Un compte avec cet email existe déjà. Utilisation du compte existant.',
        };
      } else {
        // L'utilisateur existe déjà avec le même ID - c'est OK, utiliser l'entrée existante
        console.log('[signUpClient] Utilisateur existe déjà dans users avec le même ID, utilisation de l\'entrée existante');
        const { password_hash, ...userWithoutPassword } = existingUserByEmail;
        return {
          success: true,
          user: userWithoutPassword,
          session: authData.session,
        };
      }
    }

    // ÉTAPE 3 : L'email n'existe pas, on peut créer l'entrée
    console.log('[signUpClient] Création de l\'entrée dans users pour:', userData.email);
    const { data: userDataResult, error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: userData.email,
          password_hash: 'hashed_by_supabase_auth', // Supabase Auth gère le hash
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          language: userData.language || 'fr',
        },
      ])
      .select()
      .single();

    // ÉTAPE 4 : Gérer l'erreur duplicate key si l'insertion échoue
    if (userError) {
      if (userError.code === '23505') {
        // Duplicate key - l'email existe déjà (race condition possible)
        console.warn('[signUpClient] Erreur duplicate key lors de l\'insertion, récupération de l\'utilisateur existant...');
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
          .eq('email', userData.email)
          .single();

        if (existingUser && !fetchError) {
          const { password_hash, ...userWithoutPassword } = existingUser;
          return {
            success: true,
            user: userWithoutPassword,
            session: authData.session,
            warning: 'Un compte avec cet email existe déjà. Utilisation du compte existant.',
          };
        }
      } else if (userError.code === '42501') {
        // RLS policy violation - la session n'est peut-être pas encore propagée
        console.warn('[signUpClient] Erreur RLS lors de l\'insertion (42501), l\'entrée sera créée à la connexion:', userError);
      } else {
        console.warn('[signUpClient] Erreur création entrée users, mais auth réussi:', userError);
      }
    }

    // Si l'entrée existe déjà ou a été créée, la récupérer
    let finalUserData = userDataResult;
    if (!finalUserData) {
      // Essayer de récupérer par ID
      const { data: existingUserById } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
        .eq('id', authData.user.id)
        .single();
      finalUserData = existingUserById;
      
      // Si toujours pas trouvé, essayer par email
      if (!finalUserData) {
        const { data: existingUserByEmail2 } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
          .eq('email', userData.email)
          .single();
        finalUserData = existingUserByEmail2;
      }
    }

    // Retourner les données sans le password_hash
    const { password_hash, ...userWithoutPassword } = finalUserData || {};
    return {
      success: true,
      user: userWithoutPassword,
      session: authData.session,
    };
  } catch (error) {
    console.error('Erreur inscription client:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de l\'inscription',
    };
  }
}

/**
 * Connecte un client
 * @param {string} email - Email du client
 * @param {string} password - Mot de passe
 * @returns {Promise<Object>} - Résultat avec success et user/session ou error
 */
export async function loginClient(email, password) {
  try {
    // Validation des données avant l'envoi
    if (!email || typeof email !== 'string' || email.trim() === '') {
      console.error('[loginClient] Email invalide:', email);
      return {
        success: false,
        error: 'L\'email est requis et doit être valide',
      };
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      console.error('[loginClient] Mot de passe invalide');
      return {
        success: false,
        error: 'Le mot de passe est requis',
      };
    }

    // Vérifier la configuration Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('[loginClient] Configuration Supabase manquante');
      return {
        success: false,
        error: 'Configuration Supabase manquante. Vérifiez les variables d\'environnement.',
      };
    }

    // Normaliser l'email (trim et lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    console.log('[loginClient] Tentative de connexion pour:', normalizedEmail);
    console.log('[loginClient] URL Supabase:', supabaseUrl);

    // Utiliser Supabase Auth pour la connexion
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password.trim(),
    });

    if (error) {
      // Log détaillé de l'erreur pour le débogage
      console.error('[loginClient] Erreur Supabase Auth:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        name: error.name,
        error: error,
      });

      // Améliorer les messages d'erreur selon le type d'erreur
      let errorMessage = 'Email ou mot de passe incorrect';
      
      // Gérer spécifiquement les erreurs 400
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
          } else if (error.message.includes('Password')) {
            errorMessage = 'Le mot de passe est requis et doit être valide.';
          } else {
            errorMessage = `Erreur de connexion: ${error.message}`;
          }
        } else {
          errorMessage = 'Erreur de connexion (400). Vérifiez vos identifiants et que votre email est confirmé.';
        }
      } else if (error.message) {
        // Gérer les autres types d'erreurs
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou mot de passe incorrect. Vérifiez vos identifiants ou confirmez votre email si vous venez de vous inscrire.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Votre email n\'a pas été confirmé. Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Aucun compte trouvé avec cet email. Vérifiez votre email ou inscrivez-vous.';
        } else {
          errorMessage = error.message;
        }
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

    // Récupérer les données utilisateur depuis notre table custom
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      // Si l'utilisateur existe dans Auth mais pas dans la table users, créer l'entrée
      if (userError.code === 'PGRST116') { // Not found
        console.warn('Utilisateur Auth trouvé mais pas dans table users, vérification avant création...');
        
        // Vérifier si l'email existe déjà avec un ID différent (cas de données incohérentes)
        const { data: existingUserByEmail, error: emailCheckError } = await supabase
          .from('users')
          .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
          .eq('email', data.user.email)
          .single();

        if (existingUserByEmail) {
          // L'email existe déjà mais avec un ID différent
          // C'est un cas de données incohérentes - utiliser l'entrée existante
          console.warn('Email existe déjà avec un ID différent, utilisation de l\'entrée existante');
          const { password_hash, ...userWithoutPassword } = existingUserByEmail;
          return {
            success: true,
            user: userWithoutPassword,
            session: data.session,
          };
        }

        // L'email n'existe pas, on peut créer l'entrée
        console.log('Création de l\'entrée dans users pour:', data.user.email);
        const { data: newUserData, error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              password_hash: 'hashed_by_supabase_auth',
              first_name: data.user.user_metadata?.first_name || '',
              last_name: data.user.user_metadata?.last_name || '',
              phone: data.user.user_metadata?.phone || null,
              language: data.user.user_metadata?.language || 'fr',
            },
          ])
          .select()
          .single();

        if (createError) {
          // Si l'erreur est une duplicate key (email existe déjà), essayer de récupérer l'utilisateur existant
          if (createError.code === '23505') {
            console.warn('Erreur duplicate key lors de l\'insertion, récupération de l\'utilisateur existant...');
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
              .eq('email', data.user.email)
              .single();

            if (existingUser && !fetchError) {
              const { password_hash, ...userWithoutPassword } = existingUser;
              return {
                success: true,
                user: userWithoutPassword,
                session: data.session,
              };
            }
          }
          console.error('Erreur création entrée users:', createError);
          throw createError;
        }

        const { password_hash, ...userWithoutPassword } = newUserData;
        return {
          success: true,
          user: userWithoutPassword,
          session: data.session,
        };
      }
      throw userError;
    }

    return {
      success: true,
      user: userData,
      session: data.session,
    };
  } catch (error) {
    console.error('Erreur connexion client:', error);
    return {
      success: false,
      error: error.message || 'Email ou mot de passe incorrect',
    };
  }
}

/**
 * Déconnecte l'utilisateur actuel
 * @returns {Promise<Object>} - Résultat avec success ou error
 */
export async function logoutClient() {
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
 * Récupère l'utilisateur actuellement connecté
 * @returns {Promise<Object|null>} - Utilisateur connecté ou null
 */
export async function getCurrentUser() {
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

    // Vérifier que ce n'est pas l'admin qui est connecté
    // L'admin doit utiliser le contexte AdminAuth, pas AuthContext
    if (session.user && session.user.email === ADMIN_EMAIL) {
      return null;
    }

    // CORRECTION : Vérifier si c'est un restaurant avant d'interroger la table users
    // Les restaurants n'ont pas d'entrée dans la table users, seulement dans restaurants
    const userType = session.user?.user_metadata?.user_type;
    if (userType === 'restaurant') {
      console.log('[authService] Restaurant détecté, ne pas interroger la table users');
      return null;
    }

    // Récupérer les données utilisateur depuis notre table custom avec timeout
    const userPromise = supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
      .eq('id', session.user.id)
      .single();
    
    const timeoutPromise2 = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout user data')), 5000)
    );
    
    const { data: userData, error: userError } = await Promise.race([
      userPromise,
      timeoutPromise2
    ]).catch((err) => {
      console.warn('Timeout ou erreur récupération données utilisateur:', err);
      return { data: null, error: { message: 'Timeout' } };
    });

    if (userError) {
      // Si l'erreur est "not found" ou RLS, c'est normal si pas d'utilisateur
      // Ne pas déconnecter en cas d'erreur 406 (Not Acceptable) - c'est juste une erreur de requête
      const is406Error = userError.status === 406 || 
                         userError.statusCode === 406 ||
                         userError.code === '406' ||
                         userError.message?.includes('406') ||
                         userError.message?.includes('Not Acceptable');
      
      if (userError.code === 'PGRST116' || 
          userError.message?.includes('timeout') ||
          is406Error) {
        // Vérifier si on a toujours une session valide
        try {
          const { data: { session: checkSession } } = await supabase.auth.getSession();
          if (checkSession) {
            // Si on a une session mais pas de données utilisateur, retourner null sans déconnecter
            // L'utilisateur reste connecté même si on ne peut pas récupérer ses données
            return null;
          }
        } catch (sessionError) {
          // Si on ne peut pas vérifier la session, retourner null
          console.warn('Erreur vérification session:', sessionError);
        }
        return null;
      }
      console.warn('Erreur récupération utilisateur:', userError);
      return null;
    }

    if (!userData) {
      return null;
    }

    return userData;
  } catch (error) {
    // Erreur de timeout ou autre erreur
    if (error.message?.includes('Timeout')) {
      console.warn('Timeout récupération utilisateur');
    } else {
      console.error('Erreur récupération utilisateur:', error);
    }
    return null;
  }
}

/**
 * Met à jour le profil de l'utilisateur connecté
 * @param {Object} profileData - Données à mettre à jour
 * @param {string} [profileData.firstName] - Prénom
 * @param {string} [profileData.lastName] - Nom
 * @param {string} [profileData.phone] - Téléphone
 * @param {string} [profileData.language] - Langue préférée (fr/ar/en)
 * @param {Array<string>} [profileData.allergies] - Liste des allergies
 * @param {Array<string>} [profileData.dietaryPreferences] - Préférences alimentaires
 * @returns {Promise<Object>} - Résultat avec success et user ou error
 */
export async function updateUserProfile(profileData) {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Vous devez être connecté pour mettre à jour votre profil');
    }

    // Préparer les données à mettre à jour (seulement les champs fournis)
    const updateData = {};
    if (profileData.firstName !== undefined) updateData.first_name = profileData.firstName;
    if (profileData.lastName !== undefined) updateData.last_name = profileData.lastName;
    if (profileData.phone !== undefined) updateData.phone = profileData.phone;
    if (profileData.language !== undefined) updateData.language = profileData.language;
    if (profileData.allergies !== undefined) updateData.allergies = profileData.allergies;
    if (profileData.dietaryPreferences !== undefined) updateData.dietary_preferences = profileData.dietaryPreferences;

    // Mettre à jour dans la table users
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
      .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    // Mettre à jour aussi les métadonnées Supabase Auth si nécessaire
    if (profileData.firstName || profileData.lastName || profileData.phone || profileData.language) {
      await supabase.auth.updateUser({
        data: {
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          phone: updatedUser.phone,
          language: updatedUser.language,
        },
      });
    }

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la mise à jour du profil',
    };
  }
}

/**
 * Upload une image de profil pour l'utilisateur connecté
 * @param {File} file - Fichier image à uploader
 * @returns {Promise<Object>} - Résultat avec success et url ou error
 */
export async function uploadUserImage(file) {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Vous devez être connecté pour uploader une image');
    }

    // Créer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

    console.log('[uploadUserImage] Début upload image pour utilisateur:', session.user.id);
    console.log('[uploadUserImage] Nom du fichier:', fileName);

    // Supprimer l'ancienne image si elle existe
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('image_url')
        .eq('id', session.user.id)
        .single();
      
      if (userData?.image_url) {
        // Extraire le chemin du fichier depuis l'URL
        const oldFilePath = userData.image_url.split('/user-images/').pop()?.split('?')[0];
        if (oldFilePath && !oldFilePath.startsWith('http')) {
          console.log('[uploadUserImage] Suppression ancienne image:', oldFilePath);
          await supabase.storage
            .from('user-images')
            .remove([oldFilePath]);
        }
      }
    } catch (error) {
      console.warn('[uploadUserImage] Erreur suppression ancienne image (non critique):', error);
    }

    // Uploader la nouvelle image
    const { data, error } = await supabase.storage
      .from('user-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('user-images')
      .getPublicUrl(fileName);

    console.log('[uploadUserImage] Upload réussi, URL:', urlData.publicUrl);

    // Mettre à jour l'URL de l'image dans la base de données
    const { error: updateError } = await supabase
      .from('users')
      .update({ image_url: urlData.publicUrl })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('[uploadUserImage] Erreur mise à jour image_url dans BDD:', updateError);
      throw updateError;
    }

    console.log('[uploadUserImage] Image_url mise à jour dans la BDD');

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Erreur upload image utilisateur:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de l\'upload de l\'image',
    };
  }
}

/**
 * Écoute les changements d'authentification
 * @param {Function} callback - Fonction appelée quand l'état d'auth change
 * @returns {Object} - Objet avec data.subscription pour se désabonner
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      // Vérifier que ce n'est pas l'admin qui est connecté
      // L'admin doit utiliser le contexte AdminAuth, pas AuthContext
      if (session.user && session.user.email === ADMIN_EMAIL) {
        callback(null, null);
        return;
      }
      const user = await getCurrentUser();
      callback(user, session);
    } else {
      callback(null, null);
    }
  });
}

/**
 * Met à jour les informations du compte (date de naissance, genre, préférences)
 * @param {Object} accountData - Données à mettre à jour
 * @param {string} [accountData.firstName] - Prénom
 * @param {string} [accountData.lastName] - Nom
 * @param {Date|string} [accountData.dateOfBirth] - Date de naissance
 * @param {string} [accountData.gender] - Genre (male/female)
 * @param {boolean} [accountData.receiveOffers] - Recevoir des offres
 * @param {boolean} [accountData.subscribeNewsletter] - S'abonner à la newsletter
 * @returns {Promise<Object>} - Résultat avec success et user ou error
 */
export async function updateAccountInfo(accountData) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Vous devez être connecté pour mettre à jour votre compte');
    }

    const updateData = {};
    if (accountData.firstName !== undefined) updateData.first_name = accountData.firstName;
    if (accountData.lastName !== undefined) updateData.last_name = accountData.lastName;
    if (accountData.dateOfBirth !== undefined) {
      updateData.date_of_birth = accountData.dateOfBirth ? new Date(accountData.dateOfBirth).toISOString().split('T')[0] : null;
    }
    if (accountData.gender !== undefined) updateData.gender = accountData.gender || null;
    if (accountData.receiveOffers !== undefined) updateData.receive_offers = accountData.receiveOffers;
    if (accountData.subscribeNewsletter !== undefined) updateData.subscribe_newsletter = accountData.subscribeNewsletter;

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
      .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error('Erreur mise à jour compte:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la mise à jour du compte',
    };
  }
}

/**
 * Change l'email de l'utilisateur
 * @param {string} newEmail - Nouvel email
 * @param {string} confirmEmail - Confirmation du nouvel email
 * @param {string} password - Mot de passe actuel
 * @returns {Promise<Object>} - Résultat avec success ou error
 */
export async function changeEmail(newEmail, confirmEmail, password) {
  try {
    if (newEmail !== confirmEmail) {
      return {
        success: false,
        error: 'Les emails ne correspondent pas',
      };
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Vous devez être connecté pour changer votre email');
    }

    // Vérifier le mot de passe actuel
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: password,
    });

    if (passwordError) {
      return {
        success: false,
        error: 'Mot de passe incorrect',
      };
    }

    // Mettre à jour l'email dans Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      throw updateError;
    }

    // Mettre à jour l'email dans la table users
    const { error: dbError } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', session.user.id);

    if (dbError) {
      throw dbError;
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur changement email:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors du changement d\'email',
    };
  }
}

/**
 * Valide les exigences du mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} - {valid: boolean, errors: string[]}
 */
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('At least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('1 uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('1 lowercase letter (a-z)');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('1 number (0-9)');
  }
  if (!/[-@#\$%^&*_\-+=,.?/]/.test(password)) {
    errors.push('1 special character (-@#\$%^&*_-+=,.?/)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Change le mot de passe de l'utilisateur
 * @param {string} currentPassword - Mot de passe actuel
 * @param {string} newPassword - Nouveau mot de passe
 * @param {string} confirmPassword - Confirmation du nouveau mot de passe
 * @returns {Promise<Object>} - Résultat avec success ou error
 */
export async function changePassword(currentPassword, newPassword, confirmPassword) {
  try {
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: 'Les mots de passe ne correspondent pas',
      };
    }

    // Valider les exigences du mot de passe
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return {
        success: false,
        error: 'Le mot de passe ne respecte pas les exigences',
        validationErrors: validation.errors,
      };
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Vous devez être connecté pour changer votre mot de passe');
    }

    // Vérifier le mot de passe actuel
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });

    if (passwordError) {
      return {
        success: false,
        error: 'Mot de passe actuel incorrect',
      };
    }

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors du changement de mot de passe',
    };
  }
}

/**
 * Supprime le compte de l'utilisateur
 * @param {string} password - Mot de passe pour confirmation
 * @returns {Promise<Object>} - Résultat avec success ou error
 */
export async function deleteAccount(password) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Vous devez être connecté pour supprimer votre compte');
    }

    // Vérifier le mot de passe
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: password,
    });

    if (passwordError) {
      return {
        success: false,
        error: 'Mot de passe incorrect',
      };
    }

    // Supprimer l'utilisateur de Supabase Auth
    // Note: Supabase Auth ne permet pas de supprimer directement un utilisateur
    // Il faudrait utiliser l'admin API ou marquer le compte comme supprimé
    // Pour l'instant, on va juste supprimer les données de la table users
    // et déconnecter l'utilisateur
    
    // Supprimer les données utilisateur (les adresses seront supprimées automatiquement via CASCADE)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', session.user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Déconnecter l'utilisateur
    await supabase.auth.signOut();

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erreur suppression compte:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la suppression du compte',
    };
  }
}

/**
 * Met à jour les paramètres de notifications
 * @param {Object} settings - Paramètres de notifications
 * @param {boolean} settings.pushEnabled - Activer les notifications push
 * @param {boolean} settings.emailEnabled - Activer les notifications email
 * @returns {Promise<Object>} - Résultat avec success et user ou error
 */
export async function updateNotificationsSettings(settings) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Vous devez être connecté pour mettre à jour les notifications');
    }

    const updateData = {};
    if (settings.pushEnabled !== undefined) updateData.notifications_push_enabled = settings.pushEnabled;
    if (settings.emailEnabled !== undefined) updateData.notifications_email_enabled = settings.emailEnabled;

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
      .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error('Erreur mise à jour notifications:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la mise à jour des notifications',
    };
  }
}

/**
 * Met à jour la langue de l'utilisateur
 * @param {string} language - Langue (fr/ar/en)
 * @returns {Promise<Object>} - Résultat avec success et user ou error
 */
export async function updateLanguage(language) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Vous devez être connecté pour changer la langue');
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ language })
      .eq('id', session.user.id)
      .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error('Erreur mise à jour langue:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la mise à jour de la langue',
    };
  }
}

/**
 * Réenvoie l'email de confirmation pour un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<Object>} - Résultat avec success ou error
 */
export async function resendConfirmationEmail(email) {
  try {
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return {
        success: false,
        error: 'L\'email est requis',
      };
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log('[resendConfirmationEmail] Réenvoi de l\'email de confirmation pour:', normalizedEmail);

    // Utiliser Supabase Auth pour réenvoyer l'email de confirmation
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
    });

    if (error) {
      console.error('[resendConfirmationEmail] Erreur:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de l\'envoi de l\'email de confirmation',
      };
    }

    return {
      success: true,
      message: 'Email de confirmation envoyé. Vérifiez votre boîte de réception (et les spams).',
    };
  } catch (error) {
    console.error('Erreur réenvoi email confirmation:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de l\'envoi de l\'email de confirmation',
    };
  }
}

/**
 * Met à jour le pays de l'utilisateur
 * @param {string} country - Pays
 * @returns {Promise<Object>} - Résultat avec success et user ou error
 */
export async function updateCountry(country) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Vous devez être connecté pour changer le pays');
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ country })
      .eq('id', session.user.id)
      .select('id, email, first_name, last_name, phone, language, allergies, dietary_preferences, image_url, date_of_birth, gender, receive_offers, subscribe_newsletter, notifications_push_enabled, notifications_email_enabled, country, created_at')
      .single();

    if (updateError) {
      throw updateError;
    }

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    console.error('Erreur mise à jour pays:', error);
    return {
      success: false,
      error: error.message || 'Une erreur est survenue lors de la mise à jour du pays',
    };
  }
}

