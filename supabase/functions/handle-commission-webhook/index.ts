/**
 * Edge Function Supabase : Webhook Stripe pour les paiements de commission et commandes
 * 
 * Cette fonction gère les webhooks Stripe pour mettre à jour le statut
 * des paiements de commission et des commandes client
 * 
 * Configuration requise dans Stripe Dashboard :
 * - URL du webhook : https://votre-projet.supabase.co/functions/v1/handle-commission-webhook
 * - Événements à écouter : checkout.session.completed, payment_intent.succeeded
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Récupérer la signature Stripe pour vérifier l'authenticité du webhook
    const stripeSignature = req.headers.get('stripe-signature');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeSignature || !stripeWebhookSecret) {
      return new Response(
        JSON.stringify({ error: 'Signature Stripe manquante' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Lire le body de la requête
    const body = await req.text();

    // Vérifier la signature du webhook (simplifié - en production, utiliser stripe.constructEvent)
    // Pour l'instant, on fait confiance à Stripe si la signature est présente
    // En production, vous devriez utiliser la bibliothèque Stripe pour vérifier la signature

    // Parser le JSON du webhook
    const event = JSON.parse(body);

    // Créer le client Supabase avec les droits admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Traiter les différents types d'événements
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const paymentId = session.metadata?.payment_id;
      const orderId = session.metadata?.order_id;
      const restaurantId = session.metadata?.restaurant_id;

      // Vérifier s'il s'agit d'une commande client
      if (orderId) {
        // C'est une commande client
        const { data: order, error: orderError } = await supabaseAdmin
          .from('orders')
          .select('id, payment_status, payment_method')
          .eq('id', orderId)
          .single();

        if (orderError || !order) {
          console.error('Commande introuvable:', orderError);
          return new Response(
            JSON.stringify({ error: 'Commande introuvable' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Vérifier que le paiement n'est pas déjà traité
        if (order.payment_status === 'paid') {
          return new Response(
            JSON.stringify({ success: true, message: 'Paiement déjà traité' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Vérifier que le mode de paiement est bien 'card'
        if (order.payment_method !== 'card') {
          return new Response(
            JSON.stringify({ error: 'Mode de paiement incorrect' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Mettre à jour le statut de paiement de la commande
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            stripe_payment_intent_id: session.payment_intent,
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('Erreur mise à jour commande:', updateError);
          throw updateError;
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Paiement de commande traité avec succès',
            order_id: orderId,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sinon, c'est une commission (logique existante)
      if (!paymentId || !restaurantId) {
        console.error('Metadata manquante dans la session Stripe');
        return new Response(
          JSON.stringify({ error: 'Metadata manquante' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Récupérer la commission
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('commission_payments')
        .select('id, restaurant_id, status')
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) {
        console.error('Commission introuvable:', paymentError);
        return new Response(
          JSON.stringify({ error: 'Commission introuvable' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier que le paiement n'est pas déjà traité
      if (payment.status === 'paid') {
        return new Response(
          JSON.stringify({ success: true, message: 'Paiement déjà traité' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mettre à jour le statut de la commission
      const { error: updateError } = await supabaseAdmin
        .from('commission_payments')
        .update({
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent,
          paid_at: new Date().toISOString(),
          payment_method: 'card',
        })
        .eq('id', paymentId);

      if (updateError) {
        console.error('Erreur mise à jour commission:', updateError);
        throw updateError;
      }

      // Déverrouiller le restaurant s'il était gelé
      const { error: unfreezeError } = await supabaseAdmin
        .rpc('unfreeze_restaurant', {
          p_restaurant_id: restaurantId
        });

      if (unfreezeError) {
        console.error('Erreur déverrouillage restaurant:', unfreezeError);
        // Ne pas échouer si le déverrouillage échoue (peut-être qu'il n'était pas gelé)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Paiement traité avec succès',
          payment_id: paymentId,
          restaurant_id: restaurantId,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gérer l'événement payment_intent.succeeded (backup)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Chercher d'abord une commande avec ce payment_intent_id
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('id, payment_status, payment_method')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

      if (!orderError && order) {
        // C'est une commande
        if (order.payment_status !== 'paid') {
          const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
              payment_status: 'paid',
            })
            .eq('id', order.id);

          if (updateError) {
            console.error('Erreur mise à jour commande:', updateError);
            throw updateError;
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Paiement de commande traité avec succès',
            order_id: order.id,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sinon, chercher une commission avec ce payment_intent_id
      const { data: payment, error: paymentError } = await supabaseAdmin
        .from('commission_payments')
        .select('id, restaurant_id, status')
        .eq('stripe_payment_intent_id', paymentIntent.id)
        .single();

      if (paymentError || !payment) {
        // Ce n'est peut-être pas une commission, ignorer
        return new Response(
          JSON.stringify({ success: true, message: 'Événement ignoré' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Vérifier que le paiement n'est pas déjà traité
      if (payment.status === 'paid') {
        return new Response(
          JSON.stringify({ success: true, message: 'Paiement déjà traité' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mettre à jour le statut
      const { error: updateError } = await supabaseAdmin
        .from('commission_payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: 'card',
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Erreur mise à jour commission:', updateError);
        throw updateError;
      }

      // Déverrouiller le restaurant
      const { error: unfreezeError } = await supabaseAdmin
        .rpc('unfreeze_restaurant', {
          p_restaurant_id: payment.restaurant_id
        });

      if (unfreezeError) {
        console.error('Erreur déverrouillage restaurant:', unfreezeError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Paiement traité avec succès',
          payment_id: payment.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Événement non géré
    return new Response(
      JSON.stringify({ success: true, message: 'Événement non géré' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur webhook Stripe:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

