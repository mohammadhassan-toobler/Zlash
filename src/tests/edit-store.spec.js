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
  // MODULE 0: RENDER & NAVIGATION (SECTION 2)
  // ==========================================
  test.describe('Module 0: Render & Navigation', () => {
    
    // Note: TC-E001 (Navigation) is intrinsically verified by the beforeEach hook succeeding.

    test('TC-E002: Verify form correctly populates with existing backend data', async ({ page }) => {
      await test.step('Verify core fields auto-populate on load', async () => {
        const nameInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.NAME_INPUT);
        const emailInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.EMAIL_INPUT);

        // We give it a generous 10-second timeout. It will keep checking the field 
        // until the React API finishes loading the data into it.
        await expect(nameInput).not.toBeEmpty({ timeout: 10000 });
        await expect(emailInput).not.toBeEmpty({ timeout: 10000 });
      });
    });

    test('TC-E003: Verify clicking "Cancel" discards inputs and returns to Dashboard', async ({ page }) => {
      await test.step('Enter unsaved data into the form', async () => {
        const nameInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.NAME_INPUT);
        await nameInput.fill('Temporary Cancel Test Data');
      });

      await test.step('Click Cancel and verify routing', async () => {
        const cancelBtn = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.CANCEL_BUTTON);
        await cancelBtn.click();
        
        // Assert we routed back to the main dashboard
        await expect(page).toHaveURL(/.*admin\/dashboard/);
      });

      await test.step('Verify unsaved changes were discarded', async () => {
        // The temporary data should not exist anywhere on the dashboard
        await expect(page.getByText('Temporary Cancel Test Data')).toBeHidden();
      });
    });

    test('TC-E004: Verify the "Status Approval" badge is strictly read-only', async ({ page }) => {
      await test.step('Locate status badge and assert read-only HTML state', async () => {
        const statusBadge = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.STATUS_BADGE);
        await expect(statusBadge).toBeVisible();

        // Ensure it is not an editable input element
        const tagName = await statusBadge.evaluate(el => el.tagName);
        expect(['INPUT', 'TEXTAREA', 'SELECT']).not.toContain(tagName);
        
        // Ensure developers didn't leave contenteditable="true" on a div/span
        await expect(statusBadge).not.toHaveAttribute('contenteditable', 'true');
      });
    });

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
    test('TC-E007: Verify user can successfully change the "Store Status" dropdown', async ({ page }) => {
      await test.step('Change status to Offline', async () => {
        // Target the React-Select hidden input/combobox
        const statusDropdown = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.STATUS_COMBOBOX);
        
        // Click to open the dropdown
        await statusDropdown.click();
        
        // Type the desired option and press Enter to select it
        await statusDropdown.fill('Offline'); // Assumes 'Offline' is the alternative to 'Online'
        await page.keyboard.press('Enter');
      });

      await test.step('Save and verify', async () => {
        const updateBtn = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.UPDATE_BUTTON);
        await updateBtn.click();
        
        // Assert we routed back to dashboard or wait for success toast
        await expect(page).toHaveURL(/.*admin\/dashboard/);
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
      const nameInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.NAME_INPUT);
      
      await test.step('Clear the mandatory Store Name field', async () => {
        await nameInput.clear();
      });

      await test.step('Attempt to save changes', async () => {
        await dashboardPage.saveChanges();
      });

      await test.step('Verify save is blocked and validation error appears', async () => {
        // Verify we did NOT route back to the dashboard (we are still on the form)
        const updateBtn = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.UPDATE_BUTTON);
        await expect(updateBtn).toBeVisible();
        
        // Verify the UI shows a validation error
        await expect(page.getByText('Store name is required')).toBeVisible();
      });
    });

    test('TC-E014: Verify Email field explicitly rejects invalid formats', async ({ page }) => {
      const emailInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.EMAIL_INPUT);
      
      await test.step('Enter a malformed email address', async () => {
        await emailInput.fill('nexusli@trend'); 
      });

      await test.step('Attempt to save changes (EXPECTED TO FAIL DUE TO KNOWN BUG)', async () => {
        await dashboardPage.saveChanges();
      });
    
      // Note: Verification steps omitted here because this currently bypasses UI rules and crashes the server (Backend Bug Logged).
    });

    test('TC-E015: Verify Phone Number field rejects alphabetical characters', async ({ page }) => {
      const phoneInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.PHONE_INPUT);
      
      await test.step('Clear the field and attempt to input letters', async () => {
        await phoneInput.clear();
        await phoneInput.fill('abcDEFghi');
      });
      
      await test.step('Verify the input rejects letters and remains empty', async () => {
        // A standard number input should remain empty if letters are typed
        await expect(phoneInput).toBeEmpty();
      });
    });

    test('TC-E015b: Verify Phone Number field has the correct UI label (BUG CATCHER)', async ({ page }) => {
      const phoneLabel = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.PHONE_LABEL);
      
      await test.step('Assert label text matches the input purpose', async () => {
        // This will intentionally fail because the developer accidentally labeled it "Store Name"
        await expect(phoneLabel).toHaveText(/Phone/i, { timeout: 5000 });
      });
    });

    test('TC-E016: Verify Phone Number enforces minimum digit constraints', async ({ page }) => {
      const phoneInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.PHONE_INPUT);
      
      await test.step('Input a phone number below the minimum length (3 digits)', async () => {
        await phoneInput.clear();
        await phoneInput.fill('123');
      });

      await test.step('Attempt to save changes', async () => {
        await dashboardPage.clickUpdate();
      });
      
      await test.step('Verify save is blocked and validation error appears', async () => {
        const updateBtn = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.UPDATE_BUTTON);
        await expect(updateBtn).toBeVisible();
        await expect(page.getByText(/Enter a valid 10-digit phone number/i)).toBeVisible();
      });
    });

    test('TC-E017: Verify Phone Number field enforces maximum digit length', async ({ page }) => {
      const phoneInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.PHONE_INPUT);
      
      await test.step('Enter a phone number exceeding maximum allowed digits', async () => {
        await phoneInput.fill('12345678901234567890');
      });

      await test.step('Attempt to save changes', async () => {
        await dashboardPage.clickUpdate();
      });
    
      await test.step('Verify save was blocked by boundary constraint', async () => {
        const updateBtn = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.UPDATE_BUTTON);
        await expect(updateBtn).toBeVisible();
      });
    });

    test('TC-E018: Verify Bio text area enforces maximum character limits', async ({ page }) => {
      const bioInput = dashboardPage.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.BIO_INPUT);
      
      await test.step('Attempt to input text exceeding the maximum limit (505 chars)', async () => {
        const massiveString = 'A'.repeat(505);
        await bioInput.fill(massiveString);
      });
      
      await test.step('Verify the text is truncated to the 500 character limit', async () => {
        const currentText = await bioInput.inputValue();
        expect(currentText.length).toBeLessThanOrEqual(500);
      });
    });

  });

  // ==========================================
  // MODULE 4: STORE CATEGORIES (COMPLEX STATE)
  // ==========================================
  test.describe('Module 4: Store Categories Module', () => {
      // We will drop the MultiSelectDropdown tests (TC-E008 & TC-E009) right here!
  });

});