/**
 * Edge Function Supabase : Création d'une session Stripe Checkout pour le paiement d'une commande
 * 
 * Cette fonction crée une session Stripe Checkout pour permettre au client
 * de payer sa commande par carte
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
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les informations de la commande
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        id,
        user_id,
        restaurant_id,
        total,
        payment_method,
        payment_status,
        status,
        restaurants:restaurant_id(id, name),
        users:user_id(id, email, first_name, last_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Commande introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le mode de paiement est 'card'
    if (order.payment_method !== 'card') {
      return new Response(
        JSON.stringify({ error: 'Cette commande n\'utilise pas le paiement par carte' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le statut de paiement est 'pending'
    if (order.payment_status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Cette commande est déjà payée ou a échoué' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur est bien le propriétaire de la commande
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (order.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Vous n\'êtes pas autorisé à payer cette commande' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer la clé secrète Stripe depuis les variables d'environnement
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Configuration Stripe manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const restaurant = order.restaurants;
    const customer = order.users;
    const customerEmail = customer?.email || '';
    const customerName = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '';

    // Créer la session Stripe Checkout
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'payment_method_types[]': 'card',
        'line_items[0][price_data][currency]': 'egp', // EGP pour l'Égypte
        'line_items[0][price_data][product_data][name]': `Commande #${orderId.substring(0, 8)} - ${restaurant?.name || 'Restaurant'}`,
        'line_items[0][price_data][product_data][description]': `Paiement de la commande ${orderId.substring(0, 8)}`,
        'line_items[0][price_data][unit_amount]': Math.round(parseFloat(order.total) * 100), // Convertir en centimes (EGP)
        'line_items[0][quantity]': '1',
        'success_url': `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/client/orders/${orderId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/client/orders/${orderId}?payment=cancelled`,
        'metadata[order_id]': orderId,
        'metadata[user_id]': order.user_id,
        'metadata[restaurant_id]': order.restaurant_id,
        ...(customerEmail ? { 'customer_email': customerEmail } : {}),
      }),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      throw new Error(`Erreur Stripe: ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    const checkoutSession = await stripeResponse.json();

    // Mettre à jour la commande avec l'ID de la session Stripe
    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({
        stripe_checkout_session_id: checkoutSession.id,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Erreur mise à jour commande:', updateError);
      // Ne pas échouer la requête si la mise à jour échoue
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: checkoutSession.url,
        session_id: checkoutSession.id,
        order_id: orderId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur création checkout:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

