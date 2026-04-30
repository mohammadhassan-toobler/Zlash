// src/tests/dashboard.spec.js
import { test, expect } from "@playwright/test";
import { DashboardPage } from "../pages/DashboardPage";

test.describe('Dashboard - Core Functionality', () => {
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    
    await test.step('Navigate to Dashboard via Global Auth State', async () => {
      await page.goto('/admin/dashboard'); 
    });
  });

  test('TC-D001: Verify Dashboard Layout and Store Info', async () => {
    await test.step('Verify Dashboard Title', async () => {
      await expect(dashboardPage.getPageTitle()).toBeVisible();
    });

    await test.step('Verify Store Info Card Details', async () => {
      await expect(dashboardPage.getStoreName()).toHaveText(/VYBE Men/i);
      await expect(dashboardPage.getStoreEmail()).toHaveText('vybemen@gmail.com');
      
      const statusLoc = dashboardPage.getStoreStatus();
      await expect(statusLoc).toHaveText('ONLINE');
      // Regex check for the dynamic green class
      await expect(statusLoc).toHaveClass(/text-green|status-online/); 
    });
  });

  test('TC-D002: Verify Navigation Links', async () => {
    await test.step('Click Products link and verify URL', async () => {
      const productsLink = dashboardPage.getProductsLink();
      await expect(productsLink).toBeVisible();
      await productsLink.click();
      
      await expect(dashboardPage.page).toHaveURL(/.*admin\/product/);
    });
  });

  test('TC-D003: Verify "Go to Store" External Navigation', async ({ context }) => {
    await test.step('Click "Go to Store" button and verify new storefront tab', async () => {
      const newPage = await dashboardPage.openPublicStorefront(context);

      await expect(newPage).toHaveURL(/.*vybe-men.*/); 
      await expect(newPage.getByRole('heading', { name: 'VYBE Men' })).toBeVisible();
    });
  });
});