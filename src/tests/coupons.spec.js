import { test, expect } from '@playwright/test';
import { CouponsPage } from '../pages/CouponsPage';
import { LocatorManager } from '../utils/LocatorManager'; 
import { COUPON_SELECTORS } from '../config/CouponSelectors';
import path from 'path';
import * as allure from "allure-js-commons";

test.beforeAll(() => {
  allure.feature("Coupons Module");
});

test.describe('Coupons Module - Full Regression Suite', () => {
  let couponsPage;

  test.beforeEach(async ({ page }) => {
    const locatorManager = new LocatorManager(page);
    couponsPage = new CouponsPage(page, locatorManager);
    
    await couponsPage.goto(); 
  });

  // ==========================================
  // MODULE 1: RENDERING & NAVIGATION
  // ==========================================
  test.describe('Module 1: Rendering & Navigation', () => {

    test('TC-C001: Verify all core UI elements render on the List Page', async ({ page }) => {
      await expect(page.locator(COUPON_SELECTORS.LIST_PAGE.HEADER.locator)).toBeVisible();
      await expect(page.locator(COUPON_SELECTORS.LIST_PAGE.ADD_BTN.locator)).toBeVisible();
      await expect(page.locator(COUPON_SELECTORS.LIST_PAGE.SEARCH_BAR.locator)).toBeEnabled();
    });

    test('TC-C002: Verify clicking "+ Add Coupon" routes to the creation form', async ({ page }) => {
      await couponsPage.clickAddCoupon();
      await expect(page).toHaveURL(/.*\/add/i);
    });

    test('TC-C003: Verify clicking "Edit" button on a row routes to the populated edit form', async ({ page }) => {
      // FIX: Dynamically grab the code from the first row in the table!
      const dynamicCode = await page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.CELL_CODE.locator).first().innerText();
      await couponsPage.clickEditForCoupon(dynamicCode.trim());
      await expect(page).toHaveURL(/.*\/edit/i);
    });
  });

  // ==========================================
  // MODULE 2: SEARCH & FILTERING
  // ==========================================
  test.describe('Module 2: Search & Filtering', () => {

    test('TC-C004: Verify user can search for a coupon by EXACT Code', async ({ page }) => {
      // FIX: Dynamically grab a real code to search for
      const dynamicCode = await page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.CELL_CODE.locator).first().innerText();
      const codeToSearch = dynamicCode.trim();
      
      await couponsPage.searchFor(codeToSearch);
      
      const rows = page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.ROWS.locator);
      await expect(rows).toHaveCount(1);
      
      const codeCell = rows.first().locator(COUPON_SELECTORS.LIST_PAGE.TABLE.CELL_CODE.locator);
      await expect(codeCell).toHaveText(codeToSearch);
    });

    test('TC-C005: Verify "Active" tab correctly filters table rows', async ({ page }) => {
      await couponsPage.filterByTab(COUPON_SELECTORS.LIST_PAGE.TABS.ACTIVE);
      
      const statusCells = page.locator(`${COUPON_SELECTORS.LIST_PAGE.TABLE.ROWS.locator} ${COUPON_SELECTORS.LIST_PAGE.TABLE.CELL_STATUS.locator}`);
      const count = await statusCells.count();
      
      for (let i = 0; i < count; i++) {
        await expect(statusCells.nth(i)).toContainText(/Active/i);
      }
    });
  });

  // ==========================================
  // MODULE 3: ADD COUPON (NEGATIVE VALIDATIONS)
  // ==========================================
  test.describe('Module 3: Add Coupon - Negative Validations', () => {

    test.beforeEach(async () => {
      await couponsPage.clickAddCoupon();
    });

    test('TC-C013: Verify mandatory field validation messages trigger on empty submit', async ({ page }) => {
      await test.step('Trigger validations via blur and submit', async () => {
        const nameInput = page.locator(COUPON_SELECTORS.ADD_PAGE.INPUTS.NAME.locator);
        await nameInput.click();
        await page.locator('body').click(); 

        const submitBtn = page.locator(COUPON_SELECTORS.ADD_PAGE.SUBMIT_BTN.locator);
        await submitBtn.scrollIntoViewIfNeeded();
        await submitBtn.click({ force: true });
      });

      await test.step('Verify required error messages render', async () => {
        const errors = COUPON_SELECTORS.ADD_PAGE.ERRORS;
        await expect(page.locator(errors.NAME_REQUIRED.locator)).toBeVisible({ timeout: 2000 });
        await expect(page.locator(errors.CODE_REQUIRED.locator)).toBeVisible();
        await expect(page.locator(errors.DISCOUNT_REQUIRED.locator)).toBeVisible();
        await expect(page.locator(errors.START_DATE_REQUIRED.locator)).toBeVisible();
        await expect(page.locator(errors.TERMS_REQUIRED.locator)).toBeVisible();
      });
    });

    test('TC-C016: Verify Number fields strictly reject alphabetical characters', async ({ page }) => {
      const minOrderInput = page.locator(COUPON_SELECTORS.ADD_PAGE.INPUTS.MIN_ORDER.locator);
      const discountInput = page.locator(COUPON_SELECTORS.ADD_PAGE.INPUTS.DISCOUNT_PRICE.locator);

      await test.step('Type invalid letters', async () => {
        await minOrderInput.fill('gg');
        await discountInput.fill('ghyuklhjuljik;lj');
        await page.locator('body').click(); 
      });

      await test.step('Verify strict number validation errors', async () => {
        const minOrderError = page.locator(COUPON_SELECTORS.ADD_PAGE.ERRORS.MIN_ORDER_NUMBER.locator);
        const discountError = page.locator(COUPON_SELECTORS.ADD_PAGE.ERRORS.DISCOUNT_NUMBER.locator);
        await expect(minOrderError).toBeVisible();
        await expect(discountError).toBeVisible();
      });
    });

    test('TC-C015: Verify chronological date validation prevents time-travel', async ({ page }) => {
      await test.step('Set Valid Till date before Valid From date', async () => {
        // We set Start Date to Nov 30th, but End Date to Nov 1st
        await couponsPage.setDates('2026-11-30', '2026-11-01');
        await page.locator('body').click();
      });

      await test.step('Verify system restricts invalid end dates', async () => {
        const tillInput = page.locator(COUPON_SELECTORS.ADD_PAGE.COMPLEX_INPUTS.VALID_TILL.locator);
        // Ask the browser directly if the input violates HTML5 date logic
        const isValid = await tillInput.evaluate((el) => el.validity.valid);
        expect(isValid).toBeFalsy(); 
      });
    });

    test('TC-C019: Verify Coupon Code enforces 4-12 character length limits', async ({ page }) => {
      await test.step('Verify error triggers on < 4 characters', async () => {
        await couponsPage.fillCodeAndTriggerValidation('ABC'); // 3 characters
        await expect(couponsPage.getCodeFormatError()).toBeVisible();
        await expect(couponsPage.getCodeInput()).toHaveAttribute('aria-invalid', 'true');
      });

      await test.step('Verify error triggers on > 12 characters', async () => {
        await couponsPage.fillCodeAndTriggerValidation('THISISWAYTOOLONG'); // 16 characters
        await expect(couponsPage.getCodeFormatError()).toBeVisible();
        await expect(couponsPage.getCodeInput()).toHaveAttribute('aria-invalid', 'true');
      });
    });

    test('TC-C020: Verify Coupon Code strictly rejects special characters', async ({ page }) => {
      await test.step('Type code with valid length but invalid special character', async () => {
        await couponsPage.fillCodeAndTriggerValidation('12345678-z'); 
      });

      await test.step('Verify strict alphanumeric error message renders', async () => {
        await expect(couponsPage.getCodeFormatError()).toContainText('alphanumeric characters');
        await expect(couponsPage.getCodeInput()).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  // ==========================================
  // MODULE 4: ADD COUPON (HAPPY PATH)
  // ==========================================
  test.describe('Module 4: Add Coupon - Happy Path', () => {

    test.beforeEach(async () => {
      await couponsPage.clickAddCoupon();
    });

    test('TC-C012: Verify user can successfully create a complete Coupon', async ({ page }) => {
      await test.step('Upload coupon image', async () => {
        const filePath = path.join(__dirname, '../test-data/dummy-coupon.png');
        await couponsPage.uploadCouponImage(filePath); 
      });
      
      await test.step('Fill basic form fields', async () => {
        const randomNum = Math.floor(1000 + Math.random() * 9000); 

        await couponsPage.fillBasicCouponDetails({
          name: 'Black Friday Super Sale',
          code: `BF${randomNum}`, 
          price: '1500',
          minOrder: '5000',
          discountType: 'Flat'
        });
      });

      await test.step('Select target products', async () => {
        await couponsPage.tagProduct('MacBook Air 15'); 
      });

      await test.step('Set validity dates', async () => {
        await couponsPage.setDates('2026-11-01', '2026-11-30'); 
      });

      await test.step('Write Terms and Conditions', async () => {
        await couponsPage.fillTermsAndConditions('1. Limit one per customer.\n2. Not valid with other offers.');
      });

      await test.step('Submit the form and verify successful creation', async () => {
        const submitBtn = page.locator(COUPON_SELECTORS.ADD_PAGE.SUBMIT_BTN.locator);
        
        await page.waitForTimeout(1000);
        await submitBtn.scrollIntoViewIfNeeded();
        await submitBtn.click({ force: true });

        await expect(page).toHaveURL(/.*\/coupon/i, { timeout: 10000 });
      });
    });

    test('TC-C007: Verify toggling the "Discount Type" radio button updates selection', async ({ page }) => {
      await test.step('Navigate to Add Coupon form', async () => {
        await page.locator(COUPON_SELECTORS.LIST_PAGE.ADD_BTN.locator).click();
      });

      await test.step('Switch to Percentage Discount', async () => {
        await couponsPage.setDiscountType('Percentage');
        const percentageRadio = couponsPage.getDiscountTypeRadio('Percentage');
        await expect(percentageRadio).toBeChecked();
      });
  
      await test.step('Switch back to Flat Discount', async () => {
        await couponsPage.setDiscountType('Flat');
        const flatRadio = couponsPage.getDiscountTypeRadio('Flat');
        await expect(flatRadio).toBeChecked();
      });
    });
  
    test('TC-C008: Verify "Apply to all products" toggle hides the Tag Products field', async ({ page }) => {
      await test.step('Navigate to Add Coupon form', async () => {
        await page.locator(COUPON_SELECTORS.LIST_PAGE.ADD_BTN.locator).click();
      });

      const tagProductsContainer = couponsPage.getTagProductsContainer();
  
      await test.step('Verify Tag Products field is visible by default', async () => {
        await expect(tagProductsContainer).toBeVisible();
      });
  
      await test.step('Toggle "Apply to all products" to ON', async () => {
        await couponsPage.toggleApplyToAllProducts();
        await expect(tagProductsContainer).toBeHidden(); 
      });
  
      await test.step('Toggle "Apply to all products" back to OFF', async () => {
        await couponsPage.toggleApplyToAllProducts();
        await expect(tagProductsContainer).toBeVisible();
      });
    });
  });

  // ==========================================
  // MODULE 5: EDIT COUPON (UPDATE)
  // ==========================================
  test.describe('Module 5: Edit Coupon - Update Scenarios', () => {
    
    // FIX: We will assign this dynamically before each test
    let TARGET_COUPON; 

    // FIX: Added { page } to the parameter list so the hook doesn't crash!
    test.beforeEach(async ({ page }) => {
      // Grab the first coupon code in the list dynamically
      TARGET_COUPON = await page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.CELL_CODE.locator).first().innerText();
      TARGET_COUPON = TARGET_COUPON.trim();

      // Navigate to the edit form for our target coupon before each test
      await couponsPage.clickEditForCoupon(TARGET_COUPON);
      // Wait for the form to fully load
      await page.waitForTimeout(1000); 
    });

    test('TC-C017: Verify the Edit form hydrates existing database values', async ({ page }) => {
      // Verify the Code input is NOT empty and contains our target code
      const codeInput = couponsPage.getCodeInput();
      await expect(codeInput).toHaveValue(TARGET_COUPON);
      
      // Verify Name is hydrated
      const nameInput = page.locator(COUPON_SELECTORS.ADD_PAGE.INPUTS.NAME.locator);
      await expect(nameInput).not.toBeEmpty();
    });

    test('TC-C018: Verify user can modify existing data and Update successfully', async ({ page }) => {
      const minOrderInput = page.locator(COUPON_SELECTORS.ADD_PAGE.INPUTS.MIN_ORDER.locator);
      
      await test.step('Modify a value', async () => {
        await minOrderInput.fill('9999'); 
      });

      await test.step('Submit the Update', async () => {
        const updateBtn = page.locator(COUPON_SELECTORS.ADD_PAGE.UPDATE_BTN.locator);
        await updateBtn.scrollIntoViewIfNeeded();
        await updateBtn.click({ force: true });

        // Assert we are routed back to the list page on success
        await expect(page).toHaveURL(/.*\/coupon/i, { timeout: 10000 });
      });
    });
  });

  // ==========================================
  // MODULE 6: DELETE COUPON (DESTROY)
  // ==========================================
  test.describe('Module 6: Delete Coupon - Destroy Scenarios', () => {

    test('TC-C020 & TC-C021: Verify Warning Modal appears and Cancel stops deletion', async ({ page }) => {
      // FIX: Dynamically target the first row
      const codeText = await page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.CELL_CODE.locator).first().innerText();
      const DELETE_TARGET = codeText.trim();

      await test.step('Trigger Delete Warning', async () => {
        await couponsPage.clickDeleteForCoupon(DELETE_TARGET);
        const modal = page.locator(COUPON_SELECTORS.LIST_PAGE.DELETE_MODAL.CONTAINER.locator);
        await expect(modal).toBeVisible();
      });

      await test.step('Click Cancel and verify row remains', async () => {
        await couponsPage.cancelDelete();
        
        // Assert the row is still in the table!
        const targetRow = page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.getRowByCode(DELETE_TARGET));
        await expect(targetRow).toBeVisible();
      });
    });

    test('TC-C022: Verify Confirming Delete removes the record', async ({ page }) => {
      // FIX: Dynamically target the first row
      const codeText = await page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.CELL_CODE.locator).first().innerText();
      const DELETE_TARGET = codeText.trim();

      await test.step('Trigger and Confirm Delete', async () => {
        await couponsPage.clickDeleteForCoupon(DELETE_TARGET);
        await couponsPage.confirmDelete();
      });

      await test.step('Verify UI removes the row', async () => {
        // Assert the row no longer exists in the DOM
        const targetRow = page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.getRowByCode(DELETE_TARGET));
        await expect(targetRow).toBeHidden({ timeout: 10000 });
      });
    });
  });
});