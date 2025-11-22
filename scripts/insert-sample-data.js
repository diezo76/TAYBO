/**
 * Script d'insertion de données d'exemple dans Supabase
 * 
 * Ce script insère 10 restaurants complets avec leurs menus
 * et 10 utilisateurs clients d'exemple dans la base de données.
 * 
 * Usage:
 *   node scripts/insert-sample-data.js
 * 
 * Prérequis:
 *   - Fichier .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
 *   - Ou variables d'environnement définies
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Récupérer les variables d'environnement
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Variables d\'environnement Supabase manquantes');
  console.error('   Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans .env');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Données des restaurants
const restaurants = [
  {
    id: 'a1b2c3d4-e5f6-4789-a012-345678901234',
    email: 'pizza.italiana@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'Pizza Italiana',
    description: 'Authentique cuisine italienne avec des pizzas faites maison au feu de bois. Nos ingrédients sont importés directement d\'Italie pour vous offrir une expérience gustative unique.',
    cuisine_type: 'Italienne',
    address: '123 Avenue Mohammed V, Casablanca',
    phone: '+212 522 123 456',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '11:00', fermeture: '23:00' },
      mardi: { ouverture: '11:00', fermeture: '23:00' },
      mercredi: { ouverture: '11:00', fermeture: '23:00' },
      jeudi: { ouverture: '11:00', fermeture: '23:00' },
      vendredi: { ouverture: '11:00', fermeture: '00:00' },
      samedi: { ouverture: '11:00', fermeture: '00:00' },
      dimanche: { ouverture: '12:00', fermeture: '22:00' }
    },
    delivery_fee: 15.00,
    average_rating: 4.5,
    total_reviews: 127
  },
  {
    id: 'b2c3d4e5-f6g7-4890-b123-456789012345',
    email: 'sushi.master@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'Sushi Master',
    description: 'Sushi frais préparé quotidiennement par nos chefs japonais certifiés. Découvrez une sélection de sushis, sashimis et makis de qualité premium.',
    cuisine_type: 'Japonais',
    address: '45 Boulevard Zerktouni, Casablanca',
    phone: '+212 522 234 567',
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '12:00', fermeture: '22:30' },
      mardi: { ouverture: '12:00', fermeture: '22:30' },
      mercredi: { ouverture: '12:00', fermeture: '22:30' },
      jeudi: { ouverture: '12:00', fermeture: '22:30' },
      vendredi: { ouverture: '12:00', fermeture: '23:00' },
      samedi: { ouverture: '12:00', fermeture: '23:00' },
      dimanche: { ouverture: '12:00', fermeture: '22:00' }
    },
    delivery_fee: 20.00,
    average_rating: 4.7,
    total_reviews: 89
  },
  {
    id: 'c3d4e5f6-g7h8-4901-c234-567890123456',
    email: 'tajine.royal@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'Tajine Royal',
    description: 'Cuisine marocaine traditionnelle authentique. Nos tajines sont préparés selon les recettes ancestrales avec des ingrédients frais et locaux.',
    cuisine_type: 'Marocain',
    address: '78 Rue Allal Ben Abdellah, Casablanca',
    phone: '+212 522 345 678',
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '11:30', fermeture: '23:00' },
      mardi: { ouverture: '11:30', fermeture: '23:00' },
      mercredi: { ouverture: '11:30', fermeture: '23:00' },
      jeudi: { ouverture: '11:30', fermeture: '23:00' },
      vendredi: { ouverture: '11:30', fermeture: '23:30' },
      samedi: { ouverture: '11:30', fermeture: '23:30' },
      dimanche: { ouverture: '12:00', fermeture: '22:30' }
    },
    delivery_fee: 12.00,
    average_rating: 4.8,
    total_reviews: 203
  },
  {
    id: 'd4e5f6g7-h8i9-4012-d345-678901234567',
    email: 'burger.house@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'Burger House',
    description: 'Les meilleurs burgers de Casablanca ! Viande 100% halal, pains frais cuits quotidiennement et frites croustillantes. Une expérience gourmande à chaque bouchée.',
    cuisine_type: 'Fast Food',
    address: '12 Boulevard Hassan II, Casablanca',
    phone: '+212 522 456 789',
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '11:00', fermeture: '23:30' },
      mardi: { ouverture: '11:00', fermeture: '23:30' },
      mercredi: { ouverture: '11:00', fermeture: '23:30' },
      jeudi: { ouverture: '11:00', fermeture: '23:30' },
      vendredi: { ouverture: '11:00', fermeture: '00:30' },
      samedi: { ouverture: '11:00', fermeture: '00:30' },
      dimanche: { ouverture: '11:00', fermeture: '23:00' }
    },
    delivery_fee: 10.00,
    average_rating: 4.4,
    total_reviews: 312
  },
  {
    id: 'e5f6g7h8-i9j0-4123-e456-789012345678',
    email: 'bistrot.francais@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'Le Bistrot Français',
    description: 'Cuisine française raffinée dans une ambiance chaleureuse. Escargots, coq au vin, boeuf bourguignon et bien plus encore pour une expérience gastronomique authentique.',
    cuisine_type: 'Français',
    address: '56 Avenue des FAR, Casablanca',
    phone: '+212 522 567 890',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '12:00', fermeture: '22:00' },
      mardi: { ouverture: '12:00', fermeture: '22:00' },
      mercredi: { ouverture: '12:00', fermeture: '22:00' },
      jeudi: { ouverture: '12:00', fermeture: '22:00' },
      vendredi: { ouverture: '12:00', fermeture: '23:00' },
      samedi: { ouverture: '12:00', fermeture: '23:00' },
      dimanche: { ouverture: '12:00', fermeture: '21:00' }
    },
    delivery_fee: 18.00,
    average_rating: 4.6,
    total_reviews: 145
  },
  {
    id: 'f6g7h8i9-j0k1-4234-f567-890123456789',
    email: 'spice.garden@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'Spice Garden',
    description: 'Cuisine indienne authentique avec des épices importées directement d\'Inde. Currys, biryanis, tandooris et naans faits maison pour une explosion de saveurs.',
    cuisine_type: 'Indien',
    address: '89 Rue Ibn Battuta, Casablanca',
    phone: '+212 522 678 901',
    image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '12:00', fermeture: '22:30' },
      mardi: { ouverture: '12:00', fermeture: '22:30' },
      mercredi: { ouverture: '12:00', fermeture: '22:30' },
      jeudi: { ouverture: '12:00', fermeture: '22:30' },
      vendredi: { ouverture: '12:00', fermeture: '23:00' },
      samedi: { ouverture: '12:00', fermeture: '23:00' },
      dimanche: { ouverture: '12:00', fermeture: '22:00' }
    },
    delivery_fee: 16.00,
    average_rating: 4.5,
    total_reviews: 98
  },
  {
    id: 'g7h8i9j0-k1l2-4345-g678-901234567890',
    email: 'la.pasta@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'La Pasta',
    description: 'Spécialiste des pâtes fraîches faites maison. Plus de 20 variétés de pâtes et sauces authentiques italiennes. Une véritable expérience culinaire italienne.',
    cuisine_type: 'Italienne',
    address: '34 Boulevard Anfa, Casablanca',
    phone: '+212 522 789 012',
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '11:30', fermeture: '22:30' },
      mardi: { ouverture: '11:30', fermeture: '22:30' },
      mercredi: { ouverture: '11:30', fermeture: '22:30' },
      jeudi: { ouverture: '11:30', fermeture: '22:30' },
      vendredi: { ouverture: '11:30', fermeture: '23:00' },
      samedi: { ouverture: '11:30', fermeture: '23:00' },
      dimanche: { ouverture: '12:00', fermeture: '22:00' }
    },
    delivery_fee: 14.00,
    average_rating: 4.3,
    total_reviews: 167
  },
  {
    id: 'h8i9j0k1-l2m3-4456-h789-012345678901',
    email: 'dragon.palace@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'Dragon Palace',
    description: 'Cuisine chinoise authentique avec des spécialités du Sichuan et du Canton. Dim sum, canard laqué, nouilles sautées et bien plus encore.',
    cuisine_type: 'Chinois',
    address: '67 Avenue Lalla Yacout, Casablanca',
    phone: '+212 522 890 123',
    image_url: 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '11:00', fermeture: '22:00' },
      mardi: { ouverture: '11:00', fermeture: '22:00' },
      mercredi: { ouverture: '11:00', fermeture: '22:00' },
      jeudi: { ouverture: '11:00', fermeture: '22:00' },
      vendredi: { ouverture: '11:00', fermeture: '23:00' },
      samedi: { ouverture: '11:00', fermeture: '23:00' },
      dimanche: { ouverture: '11:00', fermeture: '22:00' }
    },
    delivery_fee: 17.00,
    average_rating: 4.4,
    total_reviews: 134
  },
  {
    id: 'i9j0k1l2-m3n4-4567-i890-123456789012',
    email: 'le.grill@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'Le Grill',
    description: 'Spécialiste des grillades et viandes premium. Nos viandes sont sélectionnées avec soin et grillées au charbon de bois pour une saveur incomparable.',
    cuisine_type: 'Grillades',
    address: '23 Boulevard Mohammed V, Casablanca',
    phone: '+212 522 901 234',
    image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '18:00', fermeture: '23:30' },
      mardi: { ouverture: '18:00', fermeture: '23:30' },
      mercredi: { ouverture: '18:00', fermeture: '23:30' },
      jeudi: { ouverture: '18:00', fermeture: '23:30' },
      vendredi: { ouverture: '18:00', fermeture: '00:30' },
      samedi: { ouverture: '18:00', fermeture: '00:30' },
      dimanche: { ouverture: '18:00', fermeture: '23:00' }
    },
    delivery_fee: 19.00,
    average_rating: 4.7,
    total_reviews: 189
  },
  {
    id: 'j0k1l2m3-n4o5-4678-j901-234567890123',
    email: 'sweet.dreams@taybo.com',
    password_hash: '$2a$10$rK8X8V8X8V8X8V8X8V8X8O8X8V8X8V8X8V8X8V8X8V8X8V8X8V8X8V8',
    name: 'Sweet Dreams',
    description: 'Pâtisserie et café de qualité. Gâteaux, tartes, macarons et desserts gourmands préparés quotidiennement par nos pâtissiers. Café arabica de qualité supérieure.',
    cuisine_type: 'Desserts & Café',
    address: '91 Rue Oued El Makhazine, Casablanca',
    phone: '+212 522 012 345',
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop',
    is_verified: true,
    is_active: true,
    opening_hours: {
      lundi: { ouverture: '08:00', fermeture: '20:00' },
      mardi: { ouverture: '08:00', fermeture: '20:00' },
      mercredi: { ouverture: '08:00', fermeture: '20:00' },
      jeudi: { ouverture: '08:00', fermeture: '20:00' },
      vendredi: { ouverture: '08:00', fermeture: '21:00' },
      samedi: { ouverture: '09:00', fermeture: '21:00' },
      dimanche: { ouverture: '09:00', fermeture: '19:00' }
    },
    delivery_fee: 8.00,
    average_rating: 4.6,
    total_reviews: 256
  }
];

// Fonction pour insérer les restaurants
async function insertRestaurants() {
  console.log('📦 Insertion des restaurants...');
  let successCount = 0;
  let errorCount = 0;

  for (const restaurant of restaurants) {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .insert([restaurant])
        .select();

      if (error) {
        if (error.code === '23505') { // Duplicate key
          console.log(`  ⚠️  ${restaurant.name} existe déjà (ignoré)`);
        } else {
          console.error(`  ❌ Erreur pour ${restaurant.name}:`, error.message);
          errorCount++;
        }
      } else {
        console.log(`  ✅ ${restaurant.name} inséré`);
        successCount++;
      }
    } catch (err) {
      console.error(`  ❌ Erreur pour ${restaurant.name}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Résultat: ${successCount} restaurants insérés, ${errorCount} erreurs\n`);
  return successCount;
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage de l\'insertion des données d\'exemple...\n');

  try {
    // Insérer les restaurants
    await insertRestaurants();

    console.log('✅ Insertion terminée !');
    console.log('\n📝 Note: Les menus et utilisateurs doivent être insérés via le script SQL');
    console.log('   Exécutez: scripts/insert_sample_data.sql dans Supabase SQL Editor');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter le script
main();

