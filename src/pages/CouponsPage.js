import { expect } from '@playwright/test';
import { COUPON_SELECTORS } from '../config/CouponSelectors';

export class CouponsPage {
  constructor(page, locatorManager) {
    this.page = page;
    this.locatorManager = locatorManager;
  }

  // 1. Initial Navigation
  async goto() {
    await this.page.goto('/admin/coupon'); // Adjust URL if needed
    const header = this.locatorManager.getResilientLocator(COUPON_SELECTORS.LIST_PAGE.HEADER);
    await header.waitFor();
  }

  // 2. Search & Filter
  async searchFor(term) {
    const searchBar = this.locatorManager.getResilientLocator(COUPON_SELECTORS.LIST_PAGE.SEARCH_BAR);
    await searchBar.fill(term);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(500); // Wait for frontend DOM to filter
  }

  async filterByTab(tabLocator) {
    const tab = this.locatorManager.getResilientLocator(tabLocator);
    await tab.click();
    await this.page.waitForTimeout(500);
  }

  // 3. Routing
  async clickAddCoupon() {
    const addBtn = this.locatorManager.getResilientLocator(COUPON_SELECTORS.LIST_PAGE.ADD_BTN);
    await addBtn.click();
    await this.page.waitForURL(/.*\/add/i); 
  }

  async clickEditForCoupon(couponCode) {
    // Safely scan the table and click Edit ONLY on the correct row
    const allRows = this.page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.ROWS.locator);
    const targetRow = allRows.filter({ hasText: couponCode });
    const editBtn = targetRow.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.ACTION_EDIT.locator);
    
    await editBtn.click();
    await this.page.waitForURL(/.*\/edit/i);
  }
  // 1. Rapidly fill standard text and radio inputs
  async fillBasicCouponDetails(couponData) {
    const inputs = COUPON_SELECTORS.ADD_PAGE.INPUTS;
    
    await this.locatorManager.getResilientLocator(inputs.NAME).fill(couponData.name);
    await this.locatorManager.getResilientLocator(inputs.CODE).fill(couponData.code);
    await this.locatorManager.getResilientLocator(inputs.DISCOUNT_PRICE).fill(couponData.price);
    await this.locatorManager.getResilientLocator(inputs.MIN_ORDER).fill(couponData.minOrder);

    if (couponData.discountType === 'Percentage') {
      await this.locatorManager.getResilientLocator(COUPON_SELECTORS.ADD_PAGE.RADIOS.PERCENTAGE_DISCOUNT).click();
    } else {
      await this.locatorManager.getResilientLocator(COUPON_SELECTORS.ADD_PAGE.RADIOS.FLAT_DISCOUNT).click();
    }
  }

  // 2. Handle the complex Chakra UI Popover safely
  async tagProduct(productName) {
    // Uses your exact TAG_DROPDOWN config!
    const trigger = this.page.locator(COUPON_SELECTORS.ADD_PAGE.TAG_DROPDOWN.TRIGGER.locator);
    await trigger.click();

    const popover = this.page.locator(COUPON_SELECTORS.ADD_PAGE.TAG_DROPDOWN.POPOVER_CONTENT.locator);
    await expect(popover).toBeVisible();

    const searchInput = this.page.locator(COUPON_SELECTORS.ADD_PAGE.TAG_DROPDOWN.SEARCH.locator);
    await searchInput.fill(productName);

    const optionToClick = this.page.locator(COUPON_SELECTORS.ADD_PAGE.TAG_DROPDOWN.getOption(productName)).first();
    await optionToClick.waitFor({ state: 'visible', timeout: 10000 });
    await optionToClick.click();

    await this.page.keyboard.press('Escape');
    await expect(popover).toBeHidden();
  }
  
  // Handle Native Date Pickers (Requires YYYY-MM-DD format)
  async setDates(fromDate, tillDate) {
    const fromInput = this.locatorManager.getResilientLocator(COUPON_SELECTORS.ADD_PAGE.COMPLEX_INPUTS.VALID_FROM);
    const tillInput = this.locatorManager.getResilientLocator(COUPON_SELECTORS.ADD_PAGE.COMPLEX_INPUTS.VALID_TILL);

    await fromInput.fill(fromDate);
    await tillInput.fill(tillDate);
  }

  // Handle Rich Text Editor
  async fillTermsAndConditions(text) {
    const editor = this.page.locator(COUPON_SELECTORS.ADD_PAGE.COMPLEX_INPUTS.TERMS_EDITOR.locator);
    // Because it's a rich text area, we click inside it first to focus, then type
    await editor.click();
    await editor.fill(text);
  }

  // Handle Image Upload
  async uploadCouponImage(filePath) {
    // Playwright intercepts the hidden file input and attaches the file directly!
    const fileInput = this.page.locator(COUPON_SELECTORS.ADD_PAGE.COMPLEX_INPUTS.IMAGE_UPLOAD.locator);
    await fileInput.setInputFiles(filePath);
    
    // Give the UI a moment to render the image preview thumbnail
    await this.page.waitForTimeout(1000); 
  }

  // --- ACTIONS ---
  async fillCodeAndTriggerValidation(code) {
    const codeInput = this.locatorManager.getResilientLocator(COUPON_SELECTORS.ADD_PAGE.INPUTS.CODE);
    await codeInput.fill(code);
    await codeInput.blur(); // Native Playwright method to trigger validation!
    
    // Click the body to trigger the React 'onBlur' validation event
    await this.page.locator('body').click(); 
  }

  // --- GETTERS (For Assertions) ---
  getCodeInput() {
    return this.page.locator(COUPON_SELECTORS.ADD_PAGE.INPUTS.CODE.locator);
  }

  getCodeFormatError() {
    return this.page.locator(COUPON_SELECTORS.ADD_PAGE.ERRORS.CODE_FORMAT.locator);
  }

  // --- UI INTERACTION ACTIONS ---

  async setDiscountType(type) {
    // Uses your exact RADIOS config!
    const radioLocator = type === 'Percentage' 
      ? COUPON_SELECTORS.ADD_PAGE.RADIOS.PERCENTAGE_DISCOUNT.locator 
      : COUPON_SELECTORS.ADD_PAGE.RADIOS.FLAT_DISCOUNT.locator;
      
    await this.page.locator(radioLocator).click();
  }

  async toggleApplyToAllProducts() {
    // Uses your exact TOGGLES config!
    await this.page.locator(COUPON_SELECTORS.ADD_PAGE.TOGGLES.APPLY_ALL_PRODUCTS.locator).click();
  }

  // --- GETTERS FOR ASSERTIONS ---
  
  getTagProductsContainer() {
    // Uses the new CONTAINER locator you just added to your config
    return this.page.locator(COUPON_SELECTORS.ADD_PAGE.TAG_DROPDOWN.CONTAINER.locator);
  }

  getDiscountTypeRadio(type) {
    const value = type === 'Percentage' ? 'percentage' : 'fixedAmount'; 
    return this.page.locator(`input[type="radio"][value="${value}"]`);
  }

  // --- TABLE ACTIONS (EDIT / DELETE) ---

  async clickEditForCoupon(code) {
    const row = this.page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.getRowByCode(code));
    // Click the Edit button specifically inside that row
    await row.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.ACTION_EDIT.locator).first().click();
  }

  async clickDeleteForCoupon(code) {
    const row = this.page.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.getRowByCode(code));
    // Click the Delete button specifically inside that row
    await row.locator(COUPON_SELECTORS.LIST_PAGE.TABLE.ACTION_DELETE.locator).first().click();
  }

  // --- MODAL ACTIONS ---

  async cancelDelete() {
    const modal = this.page.locator(COUPON_SELECTORS.LIST_PAGE.DELETE_MODAL.CONTAINER.locator);
    await expect(modal).toBeVisible();
    await this.page.locator(COUPON_SELECTORS.LIST_PAGE.DELETE_MODAL.CANCEL_BTN.locator).first().click();
    await expect(modal).toBeHidden(); // Ensure it closes
  }

  async confirmDelete() {
    const modal = this.page.locator(COUPON_SELECTORS.LIST_PAGE.DELETE_MODAL.CONTAINER.locator);
    await expect(modal).toBeVisible();
    await this.page.locator(COUPON_SELECTORS.LIST_PAGE.DELETE_MODAL.CONFIRM_BTN.locator).first().click();
    await expect(modal).toBeHidden(); // Wait for it to close
    await this.page.waitForTimeout(500); // Give DOM a moment to remove the row
  }
}