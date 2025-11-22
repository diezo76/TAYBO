/**
 * Tests E2E pour la gestion restaurant
 */

import { test, expect } from '@playwright/test';

test.describe('Gestion restaurant', () => {
  test('devrait permettre à un restaurant de gérer son menu', async ({ page }) => {
    // 1. Se connecter en tant que restaurant
    await page.goto('/restaurant/login');
    await page.fill('input[type="email"]', 'restaurant@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 2. Aller à la gestion du menu
    await page.click('a[href="/restaurant/menu"]');
    
    // 3. Ajouter un nouveau plat
    await page.click('button:has-text("Ajouter un plat")');
    await page.fill('input[name="name"]', 'Nouveau Plat Test');
    await page.fill('input[name="price"]', '25.50');
    await page.selectOption('select[name="category"]', 'plat');
    await page.click('button[type="submit"]');
    
    // 4. Vérifier que le plat apparaît dans la liste
    await expect(page.locator('text=Nouveau Plat Test')).toBeVisible();
  });

  test('devrait permettre à un restaurant de gérer les commandes', async ({ page }) => {
    // 1. Se connecter en tant que restaurant
    await page.goto('/restaurant/login');
    await page.fill('input[type="email"]', 'restaurant@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 2. Aller à la gestion des commandes
    await page.click('a[href="/restaurant/orders"]');
    
    // 3. Vérifier que les commandes sont affichées
    await expect(page.locator('h1')).toContainText('Gestion des Commandes');
  });
});

