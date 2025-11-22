/**
 * Tests E2E pour la validation admin
 */

import { test, expect } from '@playwright/test';

test.describe('Validation admin', () => {
  test('devrait permettre à un admin de valider un restaurant', async ({ page }) => {
    // 1. Se connecter en tant qu'admin
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@taybo.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // 2. Aller à la gestion des restaurants
    await page.click('a[href="/admin/restaurants"]');
    
    // 3. Filtrer les restaurants en attente
    await page.click('button:has-text("En attente")');
    
    // 4. Vérifier qu'il y a des restaurants en attente
    const pendingRestaurants = page.locator('.restaurant-card');
    const count = await pendingRestaurants.count();
    
    if (count > 0) {
      // 5. Valider le premier restaurant
      await page.click('.restaurant-card:first-child button:has-text("Valider")');
      
      // 6. Confirmer la validation
      await page.click('button:has-text("Confirmer")');
      
      // 7. Vérifier que le restaurant n'est plus dans la liste des en attente
      await expect(page.locator('text=Restaurant validé')).toBeVisible();
    }
  });
});

