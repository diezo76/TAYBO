/**
 * Edge Function Supabase : Validation de paiement
 * 
 * Valide les paiements côté serveur avant traitement
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

    // Vérifier le token CSRF
    const csrfToken = req.headers.get('X-CSRF-Token');
    if (!csrfToken) {
      return new Response(
        JSON.stringify({ error: 'Token CSRF manquant' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Récupérer les données de paiement
    const { paymentData } = await req.json();

    // Valider les données requises
    if (!paymentData.orderId || !paymentData.amount || !paymentData.paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Données de paiement invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que la commande existe
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, total, payment_status, status')
      .eq('id', paymentData.orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Commande introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que le montant correspond
    if (Math.abs(parseFloat(paymentData.amount) - parseFloat(order.total)) > 0.01) {
      return new Response(
        JSON.stringify({ error: 'Montant incorrect' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que la commande n'est pas déjà payée
    if (order.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Commande déjà payée' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Valider la méthode de paiement
    const validPaymentMethods = ['cash', 'card', 'paymob', 'fawry'];
    if (!validPaymentMethods.includes(paymentData.paymentMethod)) {
      return new Response(
        JSON.stringify({ error: 'Méthode de paiement invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Tout est valide
    return new Response(
      JSON.stringify({ 
        success: true,
        validated: true,
        orderId: order.id,
        amount: order.total,
        paymentMethod: paymentData.paymentMethod,
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

