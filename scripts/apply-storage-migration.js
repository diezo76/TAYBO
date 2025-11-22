#!/usr/bin/env node

/**
 * Script pour appliquer la migration Storage (016_setup_storage_policies.sql)
 * via l'API Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Récupérer les credentials Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Erreur: VITE_SUPABASE_URL ou SUPABASE_URL non défini dans .env');
  console.error('   Ajoutez VITE_SUPABASE_URL=https://votre-projet.supabase.co dans votre fichier .env');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Erreur: SUPABASE_SERVICE_ROLE_KEY non défini dans .env');
  console.error('   Pour appliquer les migrations, vous avez besoin de la clé service_role');
  console.error('   Trouvez-la dans Supabase Dashboard > Settings > API > service_role');
  console.error('');
  console.error('   ⚠️  Alternative: Appliquez la migration manuellement dans Supabase Dashboard > SQL Editor');
  process.exit(1);
}

// Créer le client Supabase avec la clé service_role (permissions admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🚀 Application de la migration Storage...');
  console.log('');

  // Lire le fichier de migration
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '016_setup_storage_policies.sql');
  let migrationSQL;
  
  try {
    migrationSQL = readFileSync(migrationPath, 'utf-8');
  } catch (error) {
    console.error(`❌ Erreur: Impossible de lire le fichier de migration: ${migrationPath}`);
    process.exit(1);
  }

  // Exécuter la migration via l'API Supabase
  try {
    console.log('📝 Exécution du script SQL...');
    
    // Utiliser l'API REST de Supabase pour exécuter le SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ sql: migrationSQL })
    });

    // Si l'API RPC n'existe pas, utiliser directement l'API PostgREST
    // Note: Cette approche peut ne pas fonctionner selon votre configuration
    // La meilleure méthode est d'utiliser Supabase CLI ou le Dashboard
    
    console.log('⚠️  Note: L\'exécution directe via API peut ne pas fonctionner.');
    console.log('   Utilisez plutôt Supabase CLI ou le Dashboard.');
    console.log('');
    console.log('📋 Pour appliquer manuellement:');
    console.log('   1. Ouvrez Supabase Dashboard > SQL Editor');
    console.log('   2. Copiez le contenu de: supabase/migrations/016_setup_storage_policies.sql');
    console.log('   3. Collez et exécutez dans le SQL Editor');
    console.log('');
    
    // Alternative: Utiliser Supabase CLI si disponible
    console.log('🔧 Tentative avec Supabase CLI...');
    
    const { execSync } = await import('child_process');
    
    try {
      // Vérifier si le projet est lié
      execSync('supabase status', { stdio: 'ignore' });
      
      // Appliquer la migration
      console.log('📦 Application de la migration avec Supabase CLI...');
      execSync(`supabase db push`, { 
        stdio: 'inherit',
        cwd: join(__dirname, '..')
      });
      
      console.log('');
      console.log('✅ Migration appliquée avec succès !');
      
    } catch (cliError) {
      console.log('⚠️  Supabase CLI non configuré ou projet non lié.');
      console.log('');
      console.log('📋 Instructions pour appliquer la migration:');
      console.log('');
      console.log('   Option 1: Via Supabase Dashboard (Recommandé)');
      console.log('   1. Ouvrez https://supabase.com/dashboard');
      console.log('   2. Sélectionnez votre projet');
      console.log('   3. Allez dans SQL Editor');
      console.log('   4. Copiez le contenu de: supabase/migrations/016_setup_storage_policies.sql');
      console.log('   5. Collez et exécutez (Run)');
      console.log('');
      console.log('   Option 2: Via Supabase CLI');
      console.log('   1. Exécutez: supabase login');
      console.log('   2. Exécutez: supabase link --project-ref votre-project-ref');
      console.log('   3. Exécutez: supabase db push');
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:');
    console.error(error.message);
    console.error('');
    console.error('📋 Appliquez la migration manuellement dans Supabase Dashboard > SQL Editor');
    process.exit(1);
  }
}

// Exécuter le script
applyMigration().catch(console.error);

