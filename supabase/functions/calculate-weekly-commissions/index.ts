/**
 * Edge Function Supabase : Calcul des commissions hebdomadaires
 * 
 * Cette fonction doit être appelée automatiquement le dimanche à 23:59
 * pour générer les factures de commission pour tous les restaurants
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

    // Obtenir les dates de la semaine précédente (lundi → dimanche)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, etc.
    
    // Calculer le dimanche de la semaine précédente
    const daysToSubtract = dayOfWeek === 0 ? 7 : dayOfWeek;
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - daysToSubtract);
    lastSunday.setHours(23, 59, 59, 999);
    
    // Calculer le lundi de la semaine précédente
    const lastMonday = new Date(lastSunday);
    lastMonday.setDate(lastSunday.getDate() - 6);
    lastMonday.setHours(0, 0, 0, 0);

    const weekStart = lastMonday.toISOString().split('T')[0];
    const weekEnd = lastSunday.toISOString().split('T')[0];
    
    // Date d'échéance : mercredi suivant à 23:59 (72h après dimanche)
    const dueDate = new Date(lastSunday);
    dueDate.setDate(lastSunday.getDate() + 3); // Mercredi
    dueDate.setHours(23, 59, 59, 999);

    // Récupérer tous les restaurants actifs
    const { data: restaurants, error: restaurantsError } = await supabaseAdmin
      .from('restaurants')
      .select('id, name, email')
      .eq('is_active', true)
      .eq('is_verified', true);

    if (restaurantsError) {
      throw restaurantsError;
    }

    if (!restaurants || restaurants.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Aucun restaurant actif trouvé',
          processed: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];
    let processed = 0;
    let errors = 0;

    // Traiter chaque restaurant
    for (const restaurant of restaurants) {
      try {
        // Vérifier si une facture existe déjà pour cette période
        const { data: existingPayment } = await supabaseAdmin
          .from('commission_payments')
          .select('id')
          .eq('restaurant_id', restaurant.id)
          .eq('week_start_date', weekStart)
          .eq('week_end_date', weekEnd)
          .single();

        if (existingPayment) {
          results.push({
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            status: 'skipped',
            reason: 'Facture déjà existante pour cette période'
          });
          continue;
        }

        // Calculer les commissions pour cette semaine
        const { data: commissionData, error: commissionError } = await supabaseAdmin
          .rpc('calculate_weekly_commission', {
            p_restaurant_id: restaurant.id,
            p_week_start: weekStart,
            p_week_end: weekEnd
          });

        if (commissionError) {
          throw commissionError;
        }

        const commission = commissionData?.[0];
        const totalSales = parseFloat(commission?.total_sales || 0);
        const commissionAmount = parseFloat(commission?.commission_amount || 0);

        // Si pas de ventes, ne pas créer de facture
        if (totalSales === 0) {
          results.push({
            restaurant_id: restaurant.id,
            restaurant_name: restaurant.name,
            status: 'skipped',
            reason: 'Aucune vente pour cette période'
          });
          continue;
        }

        // Créer la facture de commission
        const { data: payment, error: paymentError } = await supabaseAdmin
          .from('commission_payments')
          .insert({
            restaurant_id: restaurant.id,
            week_start_date: weekStart,
            week_end_date: weekEnd,
            total_sales: totalSales,
            commission_rate: 4.00,
            commission_amount: commissionAmount,
            amount: commissionAmount, // Pour compatibilité avec l'ancien système
            status: 'pending',
            due_date: dueDate.toISOString(),
          })
          .select()
          .single();

        if (paymentError) {
          throw paymentError;
        }

        processed++;
        results.push({
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          payment_id: payment.id,
          total_sales: totalSales,
          commission_amount: commissionAmount,
          status: 'created'
        });

      } catch (error) {
        errors++;
        results.push({
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.name,
          status: 'error',
          error: error.message
        });
        console.error(`Erreur pour le restaurant ${restaurant.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        week_start: weekStart,
        week_end: weekEnd,
        due_date: dueDate.toISOString(),
        processed,
        errors,
        total_restaurants: restaurants.length,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur calcul commissions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

