/**
 * Edge Function Supabase : Gel automatique des restaurants avec commissions impayées
 * 
 * Cette fonction doit être appelée périodiquement (toutes les heures) pour vérifier
 * les restaurants qui n'ont pas payé leurs commissions après le délai de 72h
 * 
 * Utilisation avec pg_cron ou un service externe (ex: cron-job.org)
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
    // Vérifier l'authentification (seul le service peut appeler cette fonction)
    const authHeader = req.headers.get('Authorization');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!authHeader || !authHeader.includes(serviceKey || '')) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer le client Supabase avec les droits admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const now = new Date();

    // Récupérer les commissions en retard (due_date dépassée et status = 'pending')
    const { data: overduePayments, error: paymentsError } = await supabaseAdmin
      .from('commission_payments')
      .select(`
        id,
        restaurant_id,
        commission_amount,
        due_date,
        restaurants:restaurant_id(id, name, email, is_frozen)
      `)
      .eq('status', 'pending')
      .lt('due_date', now.toISOString());

    if (paymentsError) {
      throw paymentsError;
    }

    if (!overduePayments || overduePayments.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Aucune commission en retard',
          frozen: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    let frozen = 0;
    let alreadyFrozen = 0;
    let errors = 0;

    // Geler chaque restaurant avec commission impayée
    for (const payment of overduePayments) {
      try {
        const restaurant = payment.restaurants;
        
        if (!restaurant) {
          continue;
        }

        // Si déjà gelé, passer au suivant
        if (restaurant.is_frozen) {
          alreadyFrozen++;
          results.push({
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            payment_id: payment.id,
            status: 'already_frozen'
          });
          continue;
        }

        // Geler le restaurant
        const { error: freezeError } = await supabaseAdmin
          .rpc('freeze_restaurant', {
            p_restaurant_id: restaurant.id,
            p_reason: `Commission impayée (${payment.commission_amount} EGP) - Paiement dû le ${new Date(payment.due_date).toLocaleDateString('fr-FR')}`
          });

        if (freezeError) {
          throw freezeError;
        }

        // Mettre à jour le statut de la commission en 'overdue'
        const { error: updateError } = await supabaseAdmin
          .from('commission_payments')
          .update({ status: 'overdue' })
          .eq('id', payment.id);

        if (updateError) {
          console.error(`Erreur mise à jour statut commission ${payment.id}:`, updateError);
        }

        frozen++;
        results.push({
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          payment_id: payment.id,
          commission_amount: payment.commission_amount,
          due_date: payment.due_date,
          status: 'frozen'
        });

      } catch (error) {
        errors++;
        results.push({
          restaurant_id: payment.restaurant_id,
          payment_id: payment.id,
          status: 'error',
          error: error.message
        });
        console.error(`Erreur gel restaurant ${payment.restaurant_id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        checked: overduePayments.length,
        frozen,
        already_frozen: alreadyFrozen,
        errors,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur gel restaurants:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

