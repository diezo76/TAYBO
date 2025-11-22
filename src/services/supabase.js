/**
 * Service Supabase - Configuration du client Supabase
 * 
 * Ce fichier configure la connexion à Supabase.
 * Supabase est notre backend : base de données PostgreSQL, authentification,
 * stockage de fichiers, et notifications en temps réel.
 * 
 * Les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
 * doivent être définies dans un fichier .env à la racine du projet.
 */

import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement
// Vite préfixe les variables avec VITE_ pour des raisons de sécurité
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement Supabase manquantes. ' +
    'Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans .env'
  );
}

// Création du client Supabase
// Ce client sera utilisé dans tout le projet pour interagir avec Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Garder la session active même après fermeture du navigateur
    autoRefreshToken: true, // Rafraîchir automatiquement le token expiré
    detectSessionInUrl: true, // Détecter la session dans l'URL (pour les redirections)
    flowType: 'pkce', // Utiliser PKCE pour plus de sécurité
    storage: window.localStorage, // Utiliser localStorage explicitement
    storageKey: 'taybo-auth-token', // Clé personnalisée pour le stockage
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  // Configuration de la connexion réseau
  realtime: {
    params: {
      eventsPerSecond: 2, // Limiter le nombre d'événements par seconde
    },
  },
  // Configuration pour éviter les timeouts
  db: {
    schema: 'public',
  },
});


