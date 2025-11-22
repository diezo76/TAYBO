/**
 * Edge Function Supabase : Création d'une session Stripe Checkout pour le paiement de commission
 * 
 * Cette fonction crée une session Stripe Checkout pour permettre au restaurant
 * de payer sa commission hebdomadaire
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
    const { paymentId } = await req.json();

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'paymentId requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Récupérer les informations de la commission
    const { data: payment, error: paymentError } = await supabaseClient
      .from('commission_payments')
      .select(`
        id,
        restaurant_id,
        commission_amount,
        week_start_date,
        week_end_date,
        status,
        restaurants:restaurant_id(id, name, email)
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ error: 'Commission introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le statut est 'pending' ou 'overdue'
    if (payment.status !== 'pending' && payment.status !== 'overdue') {
      return new Response(
        JSON.stringify({ error: 'Cette commission est déjà payée' }),
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

    // Vérifier que l'utilisateur est le propriétaire du restaurant
    // Note: Vous devrez adapter cette vérification selon votre système d'authentification
    // Ici, on suppose que l'email de l'utilisateur correspond à l'email du restaurant
    const restaurant = payment.restaurants;
    if (!restaurant || restaurant.email !== user.email) {
      return new Response(
        JSON.stringify({ error: 'Vous n\'êtes pas autorisé à payer cette commission' }),
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
        'line_items[0][price_data][product_data][name]': `Commission hebdomadaire - ${restaurant.name}`,
        'line_items[0][price_data][product_data][description]': `Commission pour la période du ${new Date(payment.week_start_date).toLocaleDateString('fr-FR')} au ${new Date(payment.week_end_date).toLocaleDateString('fr-FR')}`,
        'line_items[0][price_data][unit_amount]': Math.round(parseFloat(payment.commission_amount) * 100), // Convertir en centimes
        'line_items[0][quantity]': '1',
        'success_url': `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentId}`,
        'cancel_url': `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/cancel?payment_id=${paymentId}`,
        'metadata[payment_id]': paymentId,
        'metadata[restaurant_id]': payment.restaurant_id,
        'customer_email': restaurant.email,
      }),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.json();
      throw new Error(`Erreur Stripe: ${errorData.error?.message || 'Erreur inconnue'}`);
    }

    const checkoutSession = await stripeResponse.json();

    // Mettre à jour la commission avec l'ID de la session Stripe
    const { error: updateError } = await supabaseClient
      .from('commission_payments')
      .update({
        stripe_checkout_session_id: checkoutSession.id,
        invoice_url: checkoutSession.url,
      })
      .eq('id', paymentId);

    if (updateError) {
      console.error('Erreur mise à jour commission:', updateError);
      // Ne pas échouer la requête si la mise à jour échoue
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: checkoutSession.url,
        session_id: checkoutSession.id,
        payment_id: paymentId,
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

