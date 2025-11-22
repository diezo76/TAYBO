/**
 * Edge Function Supabase : Rate Limiting
 * 
 * Implémente un rate limiting simple pour protéger les endpoints sensibles
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Store simple en mémoire (en production, utiliser Redis ou Supabase)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Configuration du rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requêtes par minute

function getRateLimitKey(req: Request): string {
  // Utiliser l'IP ou l'ID utilisateur comme clé
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const authHeader = req.headers.get('Authorization');
  
  if (authHeader) {
    // Extraire l'ID utilisateur du token si possible
    // Pour simplifier, on utilise l'IP
    return `rate_limit:${ip}`;
  }
  
  return `rate_limit:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Nouvelle fenêtre ou première requête
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Incrémenter le compteur
  record.count++;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - record.count,
    resetTime: record.resetTime,
  };
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const key = getRateLimitKey(req);
    const rateLimit = checkRateLimit(key);

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Trop de requêtes. Veuillez réessayer plus tard.',
          resetTime: rateLimit.resetTime,
        }),
        { 
          status: 429,
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Ajouter les headers de rate limit
    const headers = {
      ...corsHeaders,
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': rateLimit.resetTime.toString(),
    };

    // Ici, vous pouvez appeler une autre fonction ou retourner une réponse
    return new Response(
      JSON.stringify({ message: 'Rate limit OK' }),
      { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

