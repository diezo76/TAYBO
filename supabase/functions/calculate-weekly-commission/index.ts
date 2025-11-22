/**
 * Edge Function Supabase : Calcul des Commissions pour un Restaurant
 * 
 * Cette fonction calcule les commissions hebdomadaires pour un restaurant spécifique
 * Reçoit un restaurant_id en paramètre et retourne les statistiques de la semaine en cours
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Récupérer les headers d'authentification
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

    // Récupérer les données de la requête
    const { restaurant_id } = await req.json();

    if (!restaurant_id) {
      return new Response(
        JSON.stringify({ error: 'restaurant_id requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur est bien le propriétaire du restaurant
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le restaurant existe et appartient à l'utilisateur
    const { data: restaurant, error: restaurantError } = await supabaseClient
      .from('restaurants')
      .select('id, email')
      .eq('id', restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      return new Response(
        JSON.stringify({ error: 'Restaurant introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'email correspond (simplifié - à adapter selon votre système d'auth)
    if (restaurant.email !== user.email) {
      return new Response(
        JSON.stringify({ error: 'Vous n\'êtes pas autorisé à accéder à ce restaurant' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculer les commissions pour la semaine en cours
    const { data: commissionData, error: commissionError } = await supabaseClient
      .rpc('get_current_week_commission', {
        p_restaurant_id: restaurant_id
      });

    if (commissionError) {
      throw commissionError;
    }

    const commission = commissionData?.[0];

    // Si pas de données, retourner des valeurs par défaut
    if (!commission) {
      return new Response(
        JSON.stringify({
          week_start: null,
          week_end: null,
          total_sales: 0,
          commission_amount: 0,
          commission_rate: 4.00,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retourner les résultats
    return new Response(
      JSON.stringify({
        week_start: commission.week_start,
        week_end: commission.week_end,
        total_sales: parseFloat(commission.total_sales || 0),
        commission_amount: parseFloat(commission.commission_amount || 0),
        commission_rate: 4.00,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur calcul commission:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

