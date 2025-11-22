/**
 * Edge Function Supabase : Génération de tokens CSRF
 * 
 * Génère et valide les tokens CSRF pour protéger les formulaires sensibles
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Store simple pour les tokens CSRF (en production, utiliser Supabase ou Redis)
const csrfTokens = new Map<string, { token: string; expiresAt: number }>();

const CSRF_TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes

async function generateCSRFToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function validateCSRFToken(userId: string, token: string): boolean {
  const record = csrfTokens.get(userId);
  
  if (!record) {
    return false;
  }

  if (Date.now() > record.expiresAt) {
    csrfTokens.delete(userId);
    return false;
  }

  return record.token === token;
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Récupérer les headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Récupérer l'utilisateur actuel
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    if (req.method === 'GET') {
      // Générer un nouveau token CSRF
      const token = await generateCSRFToken();
      csrfTokens.set(userId, {
        token,
        expiresAt: Date.now() + CSRF_TOKEN_EXPIRY,
      });

      return new Response(
        JSON.stringify({ csrfToken: token }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      // Valider un token CSRF
      const { csrfToken } = await req.json();

      if (!csrfToken) {
        return new Response(
          JSON.stringify({ error: 'Token CSRF manquant' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isValid = validateCSRFToken(userId, csrfToken);

      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Token CSRF invalide ou expiré' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ valid: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Méthode non autorisée' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

