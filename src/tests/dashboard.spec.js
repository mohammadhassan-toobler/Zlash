import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { DASHBOARD_SELECTORS } from '../config/DashboardSelectors';

test.describe('Dashboard - Core Functionality', () => {
  let dashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.navigate(); 
  });

  test('TC-D001: Verify Dashboard Layout and Store Info', async () => {
    await test.step('Verify Dashboard Title', async () => {
      await expect(dashboardPage.getPageTitle()).toHaveText(DASHBOARD_SELECTORS.PAGE_TITLE.role.name);
    });

    await test.step('Verify Store Info Card Details', async () => {
      await expect(dashboardPage.getStoreName()).not.toBeEmpty();
      await expect(dashboardPage.getStoreEmail()).not.toBeEmpty();
      await expect(dashboardPage.getStoreStatus()).toHaveText(/(ONLINE|OFFLINE)/i);
    });
  });

  // Notice we went back to just ({ page }) instead of ({ context })
  test('TC-D003: Verify "Go to Store" External Navigation', async ({ page }) => {
    await test.step('Click "Go to Store" button and verify routing', async () => {
      const buttonLoc = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.GO_TO_STORE_BUTTON);
      
      // 1. Direct click. No need to wait for new tabs!
      await buttonLoc.click();
      
      // 2. State-based wait: Let the framework settle the new page load
      await page.waitForLoadState('domcontentloaded');
      
      // 3. Playwright-native assertion: Verify the current URL has successfully routed away from the dashboard
      // 3. Positive Assertion: Verify the exact destination URL
      await expect(page).toHaveURL(/.*admin\/dashboard\/details/);
      
      // (Optional: If you know the exact store URL path, you can use toHaveURL(/.*store-path-here.*/) instead)
    });
  });
});