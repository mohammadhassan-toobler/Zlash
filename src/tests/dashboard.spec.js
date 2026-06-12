// src/tests/dashboard.spec.js
import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { DASHBOARD_SELECTORS } from '../config/DashboardSelectors';
import * as allure from "allure-js-commons";

test.beforeAll(() => {
  allure.feature("Products Module");
});

test.describe('Dashboard - Full Regression Suite', () => {
  let dashboardPage;

  // Runs before EVERY test in this file
  test.beforeEach(async ({ page }) => {
    allure.story("Dashboard");
    allure.owner("Pratheesh");
    dashboardPage = new DashboardPage(page);
    await dashboardPage.navigate(); 
  });

  // ==========================================
  // MODULE 1: UI RENDERING & DATA INTEGRITY
  // ==========================================
  test.describe('Module 1: Read-Only UI Verification', () => {

    test('TC-D001: Verify Dashboard Layout and Store Info render correctly', async ({ page }) => {
      await test.step('Verify Dashboard Title', async () => {
        await expect(dashboardPage.getPageTitle()).toHaveText(DASHBOARD_SELECTORS.PAGE_TITLE.role.name);
      });

      await test.step('Verify Store Info Card Details', async () => {
        await expect(dashboardPage.getStoreName()).not.toBeEmpty();
        await expect(dashboardPage.getStoreEmail()).not.toBeEmpty();
        
        // Extended the regex to cover all known backend statuses
        await expect(dashboardPage.getStoreStatus()).toHaveText(/(ONLINE|OFFLINE|BANNED)/i);
      });
    });

  });

  // ==========================================
  // MODULE 2: NAVIGATION & ROUTING
  // ==========================================
  test.describe('Module 2: Navigation & Routing', () => {

    // Renamed to TC-D002 to match your Master Test Suite
    test('TC-D002: Verify "Go to Store" button successful routing', async ({ page }) => {
      
      await test.step('Click "Go to Store" button', async () => {
        const buttonLoc = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.GO_TO_STORE_BUTTON);
        await buttonLoc.click();
      });

      await test.step('Verify routing state', async () => {
        // State-based wait: Let the framework settle the new page load
        await page.waitForLoadState('domcontentloaded');
        
        // Positive Assertion: Verify the exact destination URL
        await expect(page).toHaveURL(/.*admin\/dashboard\/details/);
      });
    });

  });

  // ==========================================
  // MODULE 3: EDGE CASES & ERROR HANDLING
  // ==========================================
  test.describe('Module 3: Edge Cases', () => {
      
      // Using test.skip creates a placeholder in your test report so you don't forget it!
      test.skip('TC-D004: Verify Dashboard displays Empty State for new users', async ({ page }) => {
          // TODO: Require a fresh user account login state before navigating to Dashboard
      });

      test.skip('TC-D005: Verify Dashboard handles backend API failures gracefully', async ({ page }) => {
          // TODO: Intercept the /api/store endpoint and mock a 500 Server Error
      });

  });

});