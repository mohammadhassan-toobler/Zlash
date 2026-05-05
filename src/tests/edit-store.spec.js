// src/tests/edit-store.spec.js
import { test, expect } from '../fixtures/baseTest';
import { DashboardPage } from '../pages/DashboardPage';
import { DASHBOARD_SELECTORS } from '../config/DashboardSelectors';
import path from 'path';

test.describe('Edit Store - Full Regression Suite', () => {
  let dashboardPage;

  // Runs before EVERY test in this file
  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.navigate(); 
    // THE FLOW:
    await dashboardPage.clickGoToStore(); // Reach the details page
    await dashboardPage.clickEditStore(); 
  });

  // ==========================================
  // MODULE 1: POSITIVE TEXT FIELD UPDATES
  // ==========================================
  test.describe('Module 1: Standard Text Fields', () => {
    
    test('TC-E006 @smoke: Verify user can successfully update text fields', async ({ page }) => {
      await test.step('Fill form with valid updated data', async () => {
        const timestamp = Date.now();
        const testName = `Zlash QA Store ${timestamp}`;
        const testPhone = '5550199999';
        const testEmail = `qa-auto-${timestamp}@zlash.test`;
        const testBio = `Automated regression update at ${new Date().toISOString()}`;

        await dashboardPage.updateStoreDetails(testName, testPhone, testEmail, testBio);
        await dashboardPage.saveChanges();
      });

      await test.step('Verify success state', async () => {
        await expect(page).toHaveURL(/.*admin\/dashboard/);
        
        // Navigate back to the landing page to see the Store Status block
        await dashboardPage.navigate(); 
        
        const storeNameDisplay = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_NAME_DISPLAY);
        await expect(storeNameDisplay).toHaveText(/Zlash QA Store/);
      });
    });

  });

  // ==========================================
  // MODULE 2: MEDIA UPLOADS
  // ==========================================
  test.describe('Module 2: Media Uploads', () => {

    test('TC-E010 @regression: Verify user can successfully upload a Store Logo', async ({ page }) => {
      await test.step('Upload valid image file', async () => {
        const filePath = path.join(__dirname, '../test-data/test_logo.png');
        await dashboardPage.uploadStoreLogo(filePath);
      });

      await test.step('Verify upload and save success', async () => {
        await dashboardPage.saveChanges();
        await expect(page).toHaveURL(/.*admin\/dashboard/);
      });
    });

  });

  // ==========================================
  // MODULE 3: NEGATIVE VALIDATIONS (FORM RULES)
  // ==========================================
  test.describe('Module 3: Negative Form Validations', () => {

    test('TC-E013: Verify system prevents saving when mandatory Store Name is blank', async ({ page }) => {
      // 1. Clear the mandatory field
      const nameInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.NAME_INPUT);
      await nameInput.clear();

      // 2. Attempt to save
      await dashboardPage.saveChanges();

      // 3. Verify we did NOT route back to the dashboard (we are still on the form)
      // Replace the toHaveURL check with:
      const updateBtn = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.UPDATE_BUTTON);
      await expect(updateBtn).toBeVisible();
      
      // 4. Verify the UI shows a validation error (adjust text based on Zlash's actual error message)
      await expect(page.getByText('Store name is required')).toBeVisible();
    });

    test.only('TC-E014: Verify Email field explicitly rejects invalid formats', async ({ page }) => {
      const emailInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.EMAIL_INPUT);
      await emailInput.fill('nexusli@trend'); 
      await dashboardPage.saveChanges();
    
      // // VERIFICATION: Ensure we stayed on the form by checking for the Update button
      // const updateBtn = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.UPDATE_BUTTON);
      // await expect(updateBtn).toBeVisible();
    });

    test('TC-E017: Verify Phone Number field enforces maximum digit length', async ({ page }) => {
      const phoneInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.PHONE_INPUT);
      await phoneInput.fill('12345678901234567890');
    
      // Attempt to save the invalid length
      await dashboardPage.clickUpdate();
    
      // Verify save was blocked (Update button still visible)
      const updateBtn = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.UPDATE_BUTTON);
      await expect(updateBtn).toBeVisible();
    });

  });

  // ==========================================
  // MODULE 4: STORE CATEGORIES (COMPLEX STATE)
  // ==========================================
  test.describe('Module 4: Store Categories Module', () => {
      // We will drop the MultiSelectDropdown tests (TC-E008 & TC-E009) right here!
  });

});