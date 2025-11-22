/**
 * Script de test : Inscription Restaurant
 * 
 * Ce script teste l'inscription d'un restaurant avec les données fournies.
 * Exécutez-le dans la console de votre application ou via Node.js.
 */

import { signUpRestaurant } from './src/services/restaurantAuthService.js';

/**
 * Fonction de test pour créer un compte restaurant
 */
async function testInscriptionRestaurant() {
  console.log('🚀 Début du test d\'inscription restaurant...');
  
  try {
    // Données du restaurant de test
    const restaurantData = {
      // Informations de connexion
      email: 'diezoweez@gmail.com',
      password: 'Siinadiiezo',
      
      // Informations du restaurant
      name: 'Restaurant Test Taybo',
      description: 'Restaurant de test pour vérifier l\'inscription',
      cuisineType: 'Française',
      address: '123 Rue de Test, 75001 Paris, France',
      phone: '+33612345678',
      deliveryFee: 2.50,
      
      // Document d'identité (optionnel pour le test)
      // passportFile: null, // Vous pouvez ajouter un fichier plus tard
      
      // Horaires d'ouverture (optionnel)
      openingHours: {
        lundi: { open: '09:00', close: '22:00', closed: false },
        mardi: { open: '09:00', close: '22:00', closed: false },
        mercredi: { open: '09:00', close: '22:00', closed: false },
        jeudi: { open: '09:00', close: '22:00', closed: false },
        vendredi: { open: '09:00', close: '23:00', closed: false },
        samedi: { open: '10:00', close: '23:00', closed: false },
        dimanche: { open: '10:00', close: '22:00', closed: false }
      }
    };
    
    console.log('📝 Données du restaurant:', {
      email: restaurantData.email,
      name: restaurantData.name,
      cuisineType: restaurantData.cuisineType,
      address: restaurantData.address,
      phone: restaurantData.phone
    });
    
    // Tentative d'inscription
    console.log('⏳ Inscription en cours...');
    const result = await signUpRestaurant(restaurantData);
    
    // Vérifier le résultat
    if (result.success) {
      console.log('✅ INSCRIPTION RÉUSSIE !');
      console.log('📋 Détails du compte créé:');
      console.log('  - ID:', result.restaurant?.id);
      console.log('  - Email:', result.restaurant?.email);
      console.log('  - Nom:', result.restaurant?.name);
      console.log('  - Vérifié:', result.restaurant?.is_verified ? 'Oui' : 'Non (en attente de vérification)');
      console.log('  - Actif:', result.restaurant?.is_active ? 'Oui' : 'Non (en attente d\'activation)');
      
      if (result.restaurant?.passport_document_url) {
        console.log('  - Document d\'identité:', result.restaurant.passport_document_url);
      }
      
      console.log('\n🎉 Vous pouvez maintenant vous connecter avec:');
      console.log('  - Email: diezoweez@gmail.com');
      console.log('  - Mot de passe: Siinadiiezo');
      
      return {
        success: true,
        data: result
      };
    } else {
      console.error('❌ ERREUR lors de l\'inscription:');
      console.error('  - Message:', result.error?.message || 'Erreur inconnue');
      console.error('  - Code:', result.error?.code);
      console.error('  - Détails:', result.error);
      
      return {
        success: false,
        error: result.error
      };
    }
  } catch (error) {
    console.error('❌ EXCEPTION lors du test:');
    console.error('  - Message:', error.message);
    console.error('  - Stack:', error.stack);
    
    return {
      success: false,
      error: error
    };
  }
}

// Exécuter le test si ce fichier est lancé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('         TEST INSCRIPTION RESTAURANT - TAYBO');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  testInscriptionRestaurant()
    .then(result => {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('                    RÉSULTAT FINAL');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(result.success ? '✅ TEST RÉUSSI' : '❌ TEST ÉCHOUÉ');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ ERREUR FATALE:', error);
      process.exit(1);
    });
}

export { testInscriptionRestaurant };

