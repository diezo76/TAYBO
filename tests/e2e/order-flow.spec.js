/**
 * Tests E2E pour le parcours de commande complet
 */

import { test, expect } from '@playwright/test';

test.describe('Parcours de commande', () => {
  test.beforeEach(async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('/');
  });

  test('devrait permettre de passer une commande complète', async ({ page }) => {
    // 1. Se connecter en tant que client
    await page.click('text=Connexion');
    await page.fill('input[type="email"]', 'client@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Attendre la redirection vers la page d'accueil
    await page.waitForURL('/');
    
    // 2. Sélectionner un restaurant
    await page.click('.restaurant-card:first-child');
    
    // 3. Ajouter des plats au panier
    await page.click('button:has-text("Ajouter")');
    await page.click('button:has-text("Ajouter")');
    
    // 4. Aller au panier
    await page.click('a[href="/client/cart"]');
    
    // 5. Passer à la commande
    await page.click('button:has-text("Passer la commande")');
    
    // 6. Remplir le formulaire de checkout
    await page.fill('input[name="address"]', '123 Rue Test');
    await page.fill('input[name="city"]', 'Cairo');
    await page.fill('input[name="phone"]', '0123456789');
    
    // 7. Sélectionner le paiement à la livraison
    await page.click('label:has-text("Paiement à la livraison")');
    
    // 8. Confirmer la commande
    await page.click('button[type="submit"]');
    
    // 9. Vérifier la redirection vers la page de confirmation
    await page.waitForURL(/\/client\/orders\/.*/);
    await expect(page.locator('h1')).toContainText('Commande confirmée');
  });
});

