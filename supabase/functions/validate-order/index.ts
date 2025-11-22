/**
 * Edge Function Supabase : Validation de commande
 * 
 * Valide une commande côté serveur avant création :
 * - Vérifie les prix et disponibilités
 * - Valide les données
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
    // Récupérer les headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier le token CSRF pour les requêtes POST/PUT/DELETE
    if (req.method !== 'GET') {
      const csrfToken = req.headers.get('X-CSRF-Token');
      if (!csrfToken) {
        return new Response(
          JSON.stringify({ error: 'Token CSRF manquant' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Note: La validation complète du CSRF devrait être faite via l'Edge Function csrf-token
      // Ici on vérifie juste sa présence
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

    // Récupérer les données de la commande
    const { orderData } = await req.json();

    // Valider les données requises
    if (!orderData.userId || !orderData.restaurantId || !orderData.items || !Array.isArray(orderData.items)) {
      return new Response(
        JSON.stringify({ error: 'Données de commande invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le restaurant existe et est actif
    const { data: restaurant, error: restaurantError } = await supabaseClient
      .from('restaurants')
      .select('id, is_active, is_verified, delivery_fee')
      .eq('id', orderData.restaurantId)
      .single();

    if (restaurantError || !restaurant || !restaurant.is_active || !restaurant.is_verified) {
      return new Response(
        JSON.stringify({ error: 'Restaurant non disponible' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier chaque item du menu
    let calculatedSubtotal = 0;
    for (const item of orderData.items) {
      const { data: menuItem, error: menuError } = await supabaseClient
        .from('menu_items')
        .select('id, price, is_available')
        .eq('id', item.menu_item_id)
        .eq('restaurant_id', orderData.restaurantId)
        .single();

      if (menuError || !menuItem || !menuItem.is_available) {
        return new Response(
          JSON.stringify({ error: `Plat ${item.name} non disponible` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier que le prix correspond
      if (Math.abs(parseFloat(item.price) - parseFloat(menuItem.price)) > 0.01) {
        return new Response(
          JSON.stringify({ error: `Prix incorrect pour ${item.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      calculatedSubtotal += parseFloat(item.price) * item.quantity;
    }

    // Vérifier le sous-total
    if (Math.abs(calculatedSubtotal - orderData.subtotal) > 0.01) {
      return new Response(
        JSON.stringify({ error: 'Sous-total incorrect' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier les frais de livraison
    if (Math.abs(parseFloat(orderData.deliveryFee) - parseFloat(restaurant.delivery_fee)) > 0.01) {
      return new Response(
        JSON.stringify({ error: 'Frais de livraison incorrects' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tout est valide
    return new Response(
      JSON.stringify({ 
        success: true,
        validated: true,
        calculatedSubtotal,
        deliveryFee: restaurant.delivery_fee,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

