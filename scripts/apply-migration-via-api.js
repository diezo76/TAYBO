#!/usr/bin/env node

/**
 * Script pour appliquer la migration Storage via l'API Supabase REST
 * Utilise les variables d'environnement pour se connecter
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL ou SUPABASE_URL non défini dans .env');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY non défini dans .env');
  console.error('   Trouvez-la dans Supabase Dashboard > Settings > API > service_role');
  console.error('');
  console.error('   ⚠️  Alternative: Utilisez Supabase Dashboard > SQL Editor');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Application de la migration Storage via API...\n');

  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '016_setup_storage_policies.sql');
  let migrationSQL;
  
  try {
    migrationSQL = readFileSync(migrationPath, 'utf-8');
  } catch (error) {
    console.error(`❌ Impossible de lire: ${migrationPath}`);
    process.exit(1);
  }

  try {
    // Utiliser l'API REST de Supabase pour exécuter le SQL
    // Note: Cette méthode peut ne pas fonctionner selon votre configuration Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ sql: migrationSQL })
    });

    if (response.ok) {
      console.log('✅ Migration appliquée avec succès !');
      return;
    }
  } catch (error) {
    // L'API RPC n'existe probablement pas, utiliser une autre méthode
  }

  // Méthode alternative: Utiliser Supabase Management API
  console.log('⚠️  L\'API RPC n\'est pas disponible.');
  console.log('📋 Utilisez Supabase Dashboard pour appliquer la migration:\n');
  console.log('   1. Ouvrez https://supabase.com/dashboard');
  console.log('   2. Sélectionnez votre projet');
  console.log('   3. Allez dans SQL Editor');
  console.log('   4. Copiez le contenu de: supabase/migrations/016_setup_storage_policies.sql');
  console.log('   5. Collez et exécutez (Run)\n');
  
  // Afficher le SQL pour faciliter le copier-coller
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 SQL à copier:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(migrationSQL);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

applyMigration().catch(console.error);

