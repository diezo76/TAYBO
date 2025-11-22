/**
 * Script pour créer le webhook Stripe pour handle-commission-webhook
 * 
 * Usage: node scripts/create-stripe-webhook.js
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const stripeSecretKey = process.env.SUPABASE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ Erreur: SUPABASE_STRIPE_SECRET_KEY ou STRIPE_SECRET_KEY non trouvé dans .env.local');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
});

const webhookUrl = 'https://ocxesczzlzopbcobppok.supabase.co/functions/v1/handle-commission-webhook';

async function createWebhook() {
  try {
    console.log('🔄 Création du webhook Stripe...');
    console.log(`📍 URL: ${webhookUrl}`);
    
    // Créer le webhook endpoint
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'checkout.session.expired',
        'payment_intent.succeeded',
      ],
      description: 'Webhook pour handle-commission-webhook - Gestion des paiements de commission et commandes',
    });

    console.log('\n✅ Webhook créé avec succès!');
    console.log('\n📋 Détails du webhook:');
    console.log(`   ID: ${webhookEndpoint.id}`);
    console.log(`   URL: ${webhookEndpoint.url}`);
    console.log(`   Statut: ${webhookEndpoint.status}`);
    console.log(`   Événements: ${webhookEndpoint.enabled_events.join(', ')}`);
    
    console.log('\n🔑 IMPORTANT: Copiez le secret du webhook ci-dessous:');
    console.log(`\n   STRIPE_WEBHOOK_SECRET=${webhookEndpoint.secret}`);
    console.log('\n📝 Ajoutez ce secret dans Supabase:');
    console.log('   supabase secrets set STRIPE_WEBHOOK_SECRET=' + webhookEndpoint.secret);
    
    return webhookEndpoint;
  } catch (error) {
    if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_already_exists') {
      console.log('⚠️  Un webhook avec cette URL existe déjà.');
      console.log('📋 Récupération des webhooks existants...');
      
      // Lister les webhooks existants
      const webhooks = await stripe.webhookEndpoints.list({
        limit: 10,
      });
      
      const existingWebhook = webhooks.data.find(w => w.url === webhookUrl);
      
      if (existingWebhook) {
        console.log('\n✅ Webhook existant trouvé:');
        console.log(`   ID: ${existingWebhook.id}`);
        console.log(`   URL: ${existingWebhook.url}`);
        console.log(`   Statut: ${existingWebhook.status}`);
        console.log(`   Événements: ${existingWebhook.enabled_events.join(', ')}`);
        
        // Récupérer le secret du webhook
        try {
          const secret = await stripe.webhookEndpoints.retrieve(existingWebhook.id);
          console.log('\n🔑 Secret du webhook:');
          console.log(`   STRIPE_WEBHOOK_SECRET=${secret.secret || 'Secret non disponible (créé via Dashboard)'}`);
        } catch (secretError) {
          console.log('\n⚠️  Impossible de récupérer le secret. Vous devez le copier depuis Stripe Dashboard:');
          console.log('   1. Allez sur https://dashboard.stripe.com/test/webhooks');
          console.log(`   2. Cliquez sur le webhook avec l'URL: ${webhookUrl}`);
          console.log('   3. Copiez le "Signing secret"');
        }
      } else {
        console.log('\n❌ Aucun webhook trouvé avec cette URL.');
        console.log('💡 Créez-le manuellement dans Stripe Dashboard:');
        console.log('   https://dashboard.stripe.com/test/webhooks');
      }
    } else {
      console.error('\n❌ Erreur lors de la création du webhook:', error.message);
      throw error;
    }
  }
}

createWebhook()
  .then(() => {
    console.log('\n✨ Terminé!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  });

