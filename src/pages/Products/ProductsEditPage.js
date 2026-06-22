// src/pages/Products/ProductsEditPage.js
//
// Page Object for the Edit Product wizard.
// The edit form lives at: /admin/product/edit/:id
// It shares the same 5-tab structure as the Create form, but:
//  - Tab 1 (Category): category is read-only ("selected category cannot be edited")
//  - Tab 2 (Identity): fields are pre-populated with the existing product data
//  - Tab 3 (Details): pre-populated description and specifications
//  - Tab 4 (Attributes): existing variants listed with an "Edit" button each
//  - Tab 5 (Options): Save button (no Continue) + Delete button

import { PRODUCTS_SELECTORS } from '../../config/ProductsSelectors';
import { LocatorManager } from '../../utils/LocatorManager';

class ProductsEditPage {
  constructor(page) {
    this.page = page;
    this.locatorManager = new LocatorManager(page);

    // Raw locators kept only where scoped container context is required
    // (variant drawer, file input).
    this.variantDrawerContainer = page
      .locator('[data-scope="dialog"]')
      .filter({ hasText: 'Edit Variant' })
      .first();
    this.uploadMedia = page.locator('input[type="file"]').first();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Universal helpers
  // ════════════════════════════════════════════════════════════════════════

  /** Remove Chakra overlay / backdrop elements that block pointer events */
  async cleanupOverlays() {
    await this.page.evaluate(() => {
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
      document.querySelectorAll('.css-1yooxd2').forEach((el) => {
        el.style.pointerEvents = 'none';
      });
    }).catch(() => {});
  }

  /** Wait for Chakra toasts to disappear; force-hide if they persist */
  async waitForToastToDisappear() {
    await this.page
      .evaluate(() => {
        document.querySelectorAll('[data-scope="toast"]').forEach((el) => {
          el.style.pointerEvents = 'none';
          el.style.display = 'none';
        });
        const toastGroup = document.querySelector('[data-part="group"][data-scope="toast"]');
        if (toastGroup) {
          toastGroup.style.pointerEvents = 'none';
          toastGroup.style.display = 'none';
        }
      })
      .catch(() => {});
  }

  /**
   * Safely click an element: standard click → evaluate click → forced click.
   */
  async safeClick(locator, options = {}) {
    await this.waitForToastToDisappear();
    await this.cleanupOverlays();
    const timeout = options.timeout !== undefined ? options.timeout : 15000;
    try {
      await locator.click({ ...options, timeout });
    } catch (e) {
      try {
        await locator.evaluate((el) => {
          if (el) el.click();
          else throw new Error('Element not found for evaluate click');
        });
      } catch (innerErr) {
        await locator.click({ force: true, timeout: 5000, ...options });
      }
    }
  }

  /**
   * Safely navigate to a URL with retries on network/DNS errors or timeouts.
   */
  async safeGoto(url, options = {}, maxRetries = 3) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.page.goto(url, { waitUntil: 'load', ...options });
        return;
      } catch (err) {
        lastError = err;
        const msg = err.message || '';
        const isNetworkOrDnsError =
          msg.includes('NS_ERROR_UNKNOWN_HOST') ||
          msg.includes('NS_ERROR_ABORT') ||
          msg.includes('NS_ERROR_CONNECTION_REFUSED') ||
          msg.includes('net::ERR_NAME_NOT_RESOLVED') ||
          msg.includes('net::ERR_CONNECTION_REFUSED') ||
          msg.includes('net::ERR_CONNECTION_RESET') ||
          msg.includes('Timeout');

        if (isNetworkOrDnsError && attempt < maxRetries) {
          console.log(
            `[NETWORK WARNING] Goto ${url} failed (Attempt ${attempt}/${maxRetries}): ${msg}. Retrying in 2s...`
          );
          await this.page.waitForTimeout(2000);
        } else {
          throw err;
        }
      }
    }
  }

  /** Safely click a tab, bypassing overlays or layout shifts if necessary */
  async clickTab(tabNameOrLocator) {
    const tabLocator =
      typeof tabNameOrLocator === 'string'
        ? this.page.getByRole('tab', { name: tabNameOrLocator })
        : tabNameOrLocator;
    await this.safeClick(tabLocator);
    await this.page.waitForTimeout(500);
  }

  /**
   * Click a Chakra switch / native checkbox near the given text string.
   * Returns the strategy used ('label'|'control'|'checkbox') or null.
   */
  async clickSwitchNearText(textFragment) {
    await this.cleanupOverlays();
    const clicked = await this.page.evaluate((text) => {
      const strategies = [
        { sel: 'label[data-scope="switch"]', key: 'label' },
        { sel: 'span[data-part="control"]', key: 'control' },
        { sel: 'input[type="checkbox"]', key: 'checkbox' },
      ];
      for (const { sel, key } of strategies) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          let parent = el.parentElement;
          for (let i = 0; i < 8; i++) {
            if (!parent) break;
            if (parent.textContent.includes(text)) {
              el.click();
              return key;
            }
            parent = parent.parentElement;
          }
        }
      }
      return null;
    }, textFragment);
    await this.page.waitForTimeout(400);
    return clicked;
  }

  async clickContinueButton(forceSingleClick = false) {
    const activeTab = this.page.locator('[role="tabpanel"]:visible');
    const initialId = await activeTab.getAttribute('id').catch(() => null);
    const actionButton = activeTab
      .locator('button')
      .filter({ hasText: /Continue|Save/i })
      .first();

    if (forceSingleClick) {
      await this.safeClick(actionButton);
      return;
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
      await this.safeClick(actionButton);
      await this.page.waitForTimeout(1000);
      const currentTab = this.page.locator('[role="tabpanel"]:visible');
      const currentId = await currentTab.getAttribute('id').catch(() => null);
      if (currentId !== initialId) {
        return;
      }
      console.log(
        `[Warning] clickContinueButton did not transition tab (Attempt ${attempt}/3). Retrying...`
      );
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Element Getters using LocatorManager
  // ════════════════════════════════════════════════════════════════════════

  getEditProductPageHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.EDIT_PRODUCT_PAGE_HEADER);
  }

  getAddMediaHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ADD_MEDIA_HEADER);
  }

  getChooseMediaButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.CHOOSE_MEDIA_BUTTON);
  }

  getCategoryLockedText() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.CATEGORY_LOCKED_TEXT);
  }

  getCategoryDisplayed() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.CATEGORY_DISPLAYED);
  }

  getUploadedProductImage() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.UPLOADED_PRODUCT_IMAGE);
  }

  getProductIdentityHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_IDENTITY_HEADER);
  }

  getProductCategoryBadge() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_CATEGORY_BADGE);
  }

  getProductDetailsHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_DETAILS_TAB_HEADER);
  }

  getProductAttributesHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_ATTRIBUTES_HEADER);
  }

  getAddVariantsButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ADD_VARIANT_BUTTON);
  }

  getVariantEditButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_EDIT_BUTTON);
  }

  getVariantDrawerHeader() {
    return this.variantDrawerContainer.getByText('Edit Variant', { exact: true });
  }

  getDiscountToggleText() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.DISCOUNT_TOGGLE_TEXT);
  }

  getProductOptionsHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_OPTIONS_HEADER);
  }

  getSaveButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SAVE_BUTTON);
  }

  getDeleteProductButton() {
    return this.page.locator('body').getByRole('button', { name: 'Delete' }).last();
  }

  getDeleteProductLabel() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.DELETE_PRODUCT_LABEL);
  }

  getRecommendLabel() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.RECOMMEND_LABEL);
  }

  getAvailableToSellLabel() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.AVAILABLE_TO_SELL_LABEL);
  }

  getEnableDeliveryLabel() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ENABLE_DELIVERY_LABEL);
  }

  getEnableReturnLabel() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ENABLE_RETURN_LABEL);
  }

  get tabProductCategory() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.TAB_PRODUCT_CATEGORY);
  }

  get tabProductIdentity() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.TAB_PRODUCT_IDENTITY);
  }

  get tabProductDetails() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.TAB_PRODUCT_DETAILS);
  }

  get tabProductAttributes() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.TAB_PRODUCT_ATTRIBUTES);
  }

  get tabProductOptions() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.TAB_PRODUCT_OPTIONS);
  }

  get productNameInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_NAME_INPUT);
  }

  get brandNameInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.BRAND_NAME_INPUT);
  }

  get descriptionInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.DESCRIPTION_INPUT);
  }

  get neckTypeInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.NECK_TYPE_INPUT);
  }

  get sleeveInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SLEEVE_INPUT);
  }

  get lengthInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.LENGTH_INPUT);
  }

  get washCareInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.WASHCARE_INPUT);
  }

  get variantQuantityInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_QUANTITY_DRAWER_INPUT);
  }

  get variantUpdateButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_UPDATE_BUTTON);
  }

  // ════════════════════════════════════════════════════════════════════════
  // Navigation helpers
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Navigate to the product detail page for the given productId,
   * then click the "Edit Product" button to open the edit wizard.
   */
  async navigateToEditProduct(productId) {
    await this.safeGoto(`/admin/product/${productId}`, { waitUntil: 'load' });
    const editBtn = this.page.getByRole('button', { name: 'Edit Product' });
    await this.safeClick(editBtn);
    await this.page.waitForLoadState('load');
  }

  /**
   * Navigate directly to the edit URL (bypasses the detail page).
   */
  async navigateDirectlyToEditProduct(productId) {
    await this.safeGoto(`/admin/product/edit/${productId}`, { waitUntil: 'load' });
    await this.getAddMediaHeader().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    await this.getCategoryDisplayed().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to the product detail page and click "Back to Product List".
   */
  async clickBackToProductList() {
    if (this.page.url().includes('/edit/')) {
      const productId = this.page.url().split('/edit/').pop();
      await this.safeGoto(`/admin/product/${productId}`, { waitUntil: 'load' });
    }
    await this.safeClick(
      this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.BACK_TO_PRODUCT_LIST_LINK)
    );
    await this.page.waitForLoadState('load');
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 1: Product Category
  // ════════════════════════════════════════════════════════════════════════

  async uploadProductImage(filePath) {
    await this.uploadMedia.setInputFiles(filePath);
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 2: Product Identity
  // ════════════════════════════════════════════════════════════════════════

  async getProductNameValue() {
    return await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_NAME_INPUT).inputValue();
  }

  async getBrandNameValue() {
    return await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.BRAND_NAME_INPUT).inputValue();
  }

  async updateProductName(newName) {
    const nameInput = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_NAME_INPUT);
    await nameInput.fill('');
    await nameInput.fill(newName);
  }

  async clearAndFillProductName(newName) {
    const nameInput = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_NAME_INPUT);
    await nameInput.fill(newName || '');
    await nameInput.blur().catch(() => {});
  }

  async clearAndFillBrandName(newName) {
    const brandInput = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.BRAND_NAME_INPUT);
    await brandInput.fill(newName || '');
    await brandInput.blur().catch(() => {});
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 3: Product Details
  // ════════════════════════════════════════════════════════════════════════

  async getDescriptionValue() {
    return await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.DESCRIPTION_INPUT).inputValue();
  }

  async clearDescription() {
    const descInput = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.DESCRIPTION_INPUT);
    await descInput.fill('');
    await descInput.blur().catch(() => {});
  }

  async updateDescription(newDescription) {
    const descInput = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.DESCRIPTION_INPUT);
    await descInput.focus();
    await descInput.fill(newDescription);
    const value = await descInput.inputValue();
    if (value !== newDescription) {
      await descInput.fill('');
      await descInput.fill(newDescription);
    }
  }

  async updateSleeveType(value) {
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SLEEVE_INPUT).fill(value);
  }

  async updateNeckType(value) {
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.NECK_TYPE_INPUT).fill(value);
  }

  async updateLength(value) {
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.LENGTH_INPUT).fill(value);
  }

  async updateWashCare(value) {
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.WASHCARE_INPUT).fill(value);
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 4: Product Attributes
  // ════════════════════════════════════════════════════════════════════════

  /** Open the Edit Variant drawer for the first (or Nth) variant */
  async openVariantEditDrawer(nth = 0) {
    const editButtons = this.page.getByRole('button', { name: 'Edit' });
    await this.safeClick(editButtons.nth(nth));
    await this.page.waitForTimeout(600);
  }

  async getVariantQuantityValue() {
    return await this.variantDrawerContainer
      .locator('input[placeholder*="Quantity"]')
      .inputValue();
  }

  async getVariantPriceValue() {
    return await this.variantDrawerContainer.locator('input[name="price"]').inputValue();
  }

  async updateVariantQuantity(qty) {
    const qtyInput = this.variantDrawerContainer.locator('input[placeholder*="Quantity"]');
    await qtyInput.fill(String(qty));
    const val = await qtyInput.inputValue();
    if (val !== String(qty)) {
      await qtyInput.click();
      await qtyInput.press('Control+a');
      await qtyInput.press('Backspace');
      await qtyInput.fill(String(qty));
    }
  }

  async updateVariantPrice(price) {
    const priceInput = this.variantDrawerContainer.locator('input[name="price"]');
    await priceInput.fill(String(price));
    const val = await priceInput.inputValue();
    if (val !== String(price)) {
      await priceInput.click();
      await priceInput.press('Control+a');
      await priceInput.press('Backspace');
      await priceInput.fill(String(price));
    }
  }

  async clickVariantUpdate() {
    await this.safeClick(
      this.variantDrawerContainer.getByRole('button', { name: 'Update' })
    );
    await this.page.waitForTimeout(500);
  }

  async closeVariantDrawer() {
    const drawerHeader = this.variantDrawerContainer.getByText('Edit Variant', { exact: true });
    const isOpenBefore = await drawerHeader.isVisible().catch(() => false);
    if (!isOpenBefore) return;

    const closeButton = this.variantDrawerContainer
      .locator('[data-part="close-trigger"]')
      .or(this.variantDrawerContainer.getByRole('button', { name: 'Close' }))
      .first();
    await this.safeClick(closeButton);
    await this.page.waitForTimeout(300);

    const isOpenAfter = await drawerHeader.isVisible().catch(() => false);
    if (isOpenAfter) {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    }
    await this.page
      .locator('[data-scope="dialog"][data-part="backdrop"]')
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});
    await this.cleanupOverlays();
    await this.page.waitForTimeout(400);
  }

  async enableDiscountAndFill(amount) {
    await this.cleanupOverlays();
    const isChecked = await this.page.evaluate(() => {
      const cb = Array.from(document.querySelectorAll('input[type="checkbox"]')).find((c) => {
        let parent = c.parentElement;
        for (let i = 0; i < 8; i++) {
          if (!parent) break;
          if (parent.textContent.includes('Discount')) return true;
          parent = parent.parentElement;
        }
        return false;
      });
      return cb ? cb.checked : false;
    });

    if (!isChecked) {
      const clicked = await this.clickSwitchNearText('Discount');
      if (!clicked) {
        await this.page.evaluate(() => {
          const cb = Array.from(document.querySelectorAll('input[type="checkbox"]')).find((c) => {
            let parent = c.parentElement;
            for (let i = 0; i < 8; i++) {
              if (!parent) break;
              if (parent.textContent.includes('Discount')) return true;
              parent = parent.parentElement;
            }
            return false;
          });
          if (cb) cb.click();
        });
      }
      await this.page.waitForTimeout(500);
    }
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.DISCOUNT_INPUT).fill(String(amount));
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 5: Product Options
  // ════════════════════════════════════════════════════════════════════════

  async clickSave() {
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SAVE_BUTTON));
    await this.page.waitForTimeout(500);
  }

  async clickDeleteProductButton() {
    await this.safeClick(this.getDeleteProductButton());
  }

  /**
   * Toggle a specific option on Tab 5 by its label text.
   * e.g. toggleOption('Recommend'), toggleOption('Available to sell')
   */
  async toggleOption(labelText) {
    await this.cleanupOverlays();
    const clicked = await this.clickSwitchNearText(labelText);
    if (!clicked) {
      await this.page.evaluate((text) => {
        const paragraphs = document.querySelectorAll('p');
        for (const p of paragraphs) {
          if (p.textContent.includes(text)) {
            const parent = p.parentElement;
            if (parent) {
              const cb = parent.querySelector('input[type="checkbox"]');
              if (cb) {
                cb.click();
                return;
              }
            }
          }
        }
      }, labelText);
    }
    await this.page.waitForTimeout(300);
  }

  /**
   * Returns true if all four option labels are visible on Tab 5.
   */
  async verifyProductOptionsPresent() {
    const bodyText = await this.page.textContent('body');
    return (
      bodyText.includes('Recommend') &&
      bodyText.includes('Available to sell') &&
      bodyText.includes('Enable Delivery') &&
      bodyText.includes('Enable Return') &&
      bodyText.includes('Delete this Product?')
    );
  }
}

export { ProductsEditPage };
