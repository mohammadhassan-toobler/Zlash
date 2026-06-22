// src/pages/Products/ProductsCreatePage.js
import { PRODUCTS_SELECTORS } from '../../config/ProductsSelectors';
import { LocatorManager } from '../../utils/LocatorManager';

class ProductsCreatePage {
  constructor(page) {
    this.page = page;
    this.locatorManager = new LocatorManager(page);

    // Raw locators kept only where LocatorManager's .first() scoping would
    // break file-input or strict-mode-sensitive operations.
    this.uploadMedia = page.locator('input[type="file"]').first();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Element Getters using LocatorManager
  // ════════════════════════════════════════════════════════════════════════

  getAddProductHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ADD_PRODUCT_PAGE_HEADER);
  }

  getAddMediaHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ADD_MEDIA_HEADER);
  }

  getSelectCategoryHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SELECT_CATEGORY_HEADER);
  }

  getMediaUpload() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.CHOOSE_MEDIA_BUTTON);
  }

  getUploadedProductImage() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.UPLOADED_PRODUCT_IMAGE);
  }

  getProductIdentityHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_IDENTITY_HEADER);
  }

  getproductDetailsHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_DETAILS_TAB_HEADER);
  }

  getproductsAttributeHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_ATTRIBUTES_HEADER);
  }

  getChooseVariantTypeButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.CHOOSE_VARIANT_TYPE_BUTTON);
  }

  getAddVariantButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ADD_VARIANT_BUTTON);
  }

  verifySizeVariantsDetailsVisible() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_SIZE_SELECT);
  }

  verifyColorVariantsDetailsVisible() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_COLOR_SELECT);
  }

  verifyGenderVariantsDetailsVisible() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_GENDER_SELECT);
  }

  verifyFitVariantsDetailsVisible() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_FIT_SELECT);
  }

  verifyPatternVariantsDetailsVisible() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_PATTERN_SELECT);
  }

  getVariantErrorMessages() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_ERROR_MESSAGES, { all: true });
  }

  getVariantImageText() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_IMAGE_BUTTON);
  }

  getProductOptionsHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_OPTIONS_HEADER);
  }

  verifyCategoryVisible(category) {
    return this.page.getByText(category, { exact: true }).first();
  }

  verifyProductCategoryVisible() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_CATEGORY_BADGE);
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

  get sleeveInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SLEEVE_INPUT);
  }

  get neckTypeInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.NECK_TYPE_INPUT);
  }

  get lengthInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.LENGTH_INPUT);
  }

  get washCareInput() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.WASHCARE_INPUT);
  }

  get selectSizeVariant() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_SIZE_BUTTON);
  }

  get variantSaveButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_SAVE_BUTTON);
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

  /**
   * Click a Chakra switch near a specific text string.
   * Traverses up to 8 ancestor levels. Returns the strategy used or null.
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
    await this.page.waitForTimeout(500);
    return clicked;
  }

  /** Wait for Chakra toasts to disappear; force-hide if they persist */
  async waitForToastToDisappear() {
    await this.page.evaluate(() => {
      document.querySelectorAll('[data-scope="toast"]').forEach((el) => {
        el.style.pointerEvents = 'none';
        el.style.display = 'none';
      });
      const toastGroup = document.querySelector('[data-part="group"][data-scope="toast"]');
      if (toastGroup) {
        toastGroup.style.pointerEvents = 'none';
        toastGroup.style.display = 'none';
      }
    }).catch(() => {});
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

  // ════════════════════════════════════════════════════════════════════════
  // Tab 1: Product Category
  // ════════════════════════════════════════════════════════════════════════

  async uploadProductImage(filePath) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/product-media-upload') && response.status() === 200,
      { timeout: 30000 }
    ).catch(() => null);
    await this.uploadMedia.setInputFiles(filePath);
    await responsePromise;
    await this.page.waitForTimeout(1000);
  }

  async verifySelectCategoryButtonVisible() {
    return await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SELECT_CATEGORY_BUTTON).isVisible();
  }

  async chooseCategory(category) {
    await this.safeClick(
      this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SELECT_CATEGORY_BUTTON)
    );
    await this.safeClick(this.page.getByText(category, { exact: true }));
    await this.cleanupOverlays();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Navigation: Continue / Save button
  // ════════════════════════════════════════════════════════════════════════

  async clickContinueButton(forceSingleClick = false) {
    await this.waitForToastToDisappear();
    await this.cleanupOverlays();
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
  // Tab 2: Product Identity
  // ════════════════════════════════════════════════════════════════════════

  async fillProductName() {
    const timestamp = Date.now();
    this._productName = `Shirt ${timestamp}`;
    const nameInput = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_NAME_INPUT);
    await this.safeClick(nameInput);
    await nameInput.fill(this._productName);
    const value = await nameInput.inputValue();
    if (!value) {
      await this.safeClick(nameInput);
      await nameInput.fill(this._productName);
    }
  }

  async switchBrandNameToggle() {
    await this.cleanupOverlays();
    const isChecked = await this.page.evaluate(() => {
      const cb = Array.from(document.querySelectorAll('input[type="checkbox"]')).find((c) => {
        let parent = c.parentElement;
        for (let i = 0; i < 8; i++) {
          if (!parent) break;
          if (parent.textContent.includes("brand name")) return true;
          parent = parent.parentElement;
        }
        return false;
      });
      return cb ? cb.checked : false;
    });

    if (isChecked) {
      const clicked = await this.clickSwitchNearText("doesn't have brand name");
      if (!clicked) {
        await this.page.evaluate(() => {
          const cb = Array.from(document.querySelectorAll('input[type="checkbox"]')).find((c) => {
            let parent = c.parentElement;
            for (let i = 0; i < 8; i++) {
              if (!parent) break;
              if (parent.textContent.includes("brand name")) return true;
              parent = parent.parentElement;
            }
            return false;
          });
          if (cb) cb.click();
        });
      }
      await this.page.waitForTimeout(500);
    }
  }

  async fillBrandName() {
    const brandInput = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.BRAND_NAME_INPUT);
    await brandInput.waitFor({ state: 'visible', timeout: 5000 });
    await brandInput.fill('Allen Solly');
    // Re-fill product name if React cleared it after toggle
    if (this._productName) {
      const nameInput = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_NAME_INPUT);
      const currentName = await nameInput.inputValue().catch(() => '');
      if (!currentName) {
        await this.safeClick(nameInput);
        await nameInput.fill(this._productName);
      }
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 3: Product Details
  // ════════════════════════════════════════════════════════════════════════

  async fillProductDetails() {
    const descInput = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.DESCRIPTION_INPUT);
    await this.safeClick(descInput);
    await this.page.waitForTimeout(200);
    const descText =
      'A regular-fit unisex cotton tee with a smooth print surface and a soft, broken-in feel. Easy through the body and sleeves, it works well as a daily staple, a branded uniform piece, or a clean base layer under outerwear.';
    await descInput.fill(descText);
    const descValue = await descInput.inputValue();
    if (descValue !== descText) {
      await this.safeClick(descInput);
      await descInput.fill(descText);
    }

    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SLEEVE_INPUT).fill('Full-Sleeve');
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.NECK_TYPE_INPUT).fill('Collar-Type');
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.LENGTH_INPUT).fill('XL');
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.WASHCARE_INPUT).fill('Wash Inside out');
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 4: Product Attributes
  // ════════════════════════════════════════════════════════════════════════

  async switchVariantToggle() {
    await this.cleanupOverlays();
    const attrHeader = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_ATTRIBUTES_HEADER);
    await attrHeader.waitFor({ state: 'visible', timeout: 10000 });

    const isAlreadyOn = await this.page.evaluate(() => {
      const checkbox = Array.from(document.querySelectorAll('input[type="checkbox"]')).find(
        (cb) => {
          let parent = cb.parentElement;
          for (let i = 0; i < 8; i++) {
            if (!parent) break;
            if (parent.textContent.includes('Variants')) return true;
            parent = parent.parentElement;
          }
          return false;
        }
      );
      return checkbox ? checkbox.checked : false;
    });

    if (!isAlreadyOn) {
      const clicked = await this.clickSwitchNearText('Variants?');
      if (!clicked) {
        await this.page.evaluate(() => {
          const cb = Array.from(document.querySelectorAll('input[type="checkbox"]')).find((c) => {
            let parent = c.parentElement;
            for (let i = 0; i < 8; i++) {
              if (!parent) break;
              if (parent.textContent.includes('Variants')) return true;
              parent = parent.parentElement;
            }
            return false;
          });
          if (cb) cb.click();
        });
      }
      await this.page.waitForTimeout(800);
    }
  }

  async clickVariantType() {
    await this.safeClick(
      this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.CHOOSE_VARIANT_TYPE_BUTTON)
    );
  }

  async selectVariant() {
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_SIZE_BUTTON));
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_COLOR_BUTTON));
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_GENDER_BUTTON));
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_FIT_BUTTON));
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_PATTERN_BUTTON));
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_SAVE_BUTTON));
  }

  async clickAddVariantButton() {
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ADD_VARIANT_BUTTON));
  }

  async verifyMandatoryVariantsError() {
    await this.waitForToastToDisappear();
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_SAVE_BUTTON));
  }

  async addVariantDetails() {
    const sizeSelect   = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_SIZE_SELECT);
    const colorSelect  = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_COLOR_SELECT);
    const genderSelect = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_GENDER_SELECT);
    const fitSelect    = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_FIT_SELECT);
    const patternSelect= this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_PATTERN_SELECT);
    const firstOption  = this.page.getByRole('option').first();

    await this.safeClick(sizeSelect, { force: true });
    await sizeSelect.press('ArrowDown').catch(() => {});
    await this.safeClick(firstOption);

    await this.safeClick(colorSelect, { force: true });
    await colorSelect.press('ArrowDown').catch(() => {});
    await this.safeClick(firstOption);

    await this.safeClick(genderSelect, { force: true });
    await genderSelect.press('ArrowDown').catch(() => {});
    await this.safeClick(firstOption);

    await this.safeClick(fitSelect, { force: true });
    await fitSelect.press('ArrowDown').catch(() => {});
    await this.safeClick(firstOption);

    await this.safeClick(patternSelect, { force: true });
    await patternSelect.press('ArrowDown').catch(() => {});
    await this.safeClick(firstOption);

    await this.cleanupOverlays();
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_QUANTITY_INPUT).fill('10');
    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_PRICE_INPUT).fill('1000');
    await this.safeClick(
      this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.AVAILABLE_TO_PURCHASE_TOGGLE)
    );
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_SAVE_BUTTON));
  }

  async uploadVariantImage(filePath) {
    const responsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/product-media-upload') && response.status() === 200,
      { timeout: 30000 }
    ).catch(() => null);

    // Intercept file chooser event to prevent OS dialog crash in headless Firefox
    const fileChooserPromise = this.page.waitForEvent('filechooser', { timeout: 15000 });
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_IMAGE_BUTTON));
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    await responsePromise;
    await this.page.waitForTimeout(1000);
    await this.cleanupOverlays();
    await this.safeClick(this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.VARIANT_SAVE_BUTTON), { force: true });

    // Close the drawer after saving — only click if it is still open
    const closeTrigger = this.page
      .locator('[data-scope="dialog"]')
      .filter({ hasText: /Upload|Media/i })
      .locator('[data-part="close-trigger"]')
      .first();
    if (await closeTrigger.isVisible().catch(() => false)) {
      await this.safeClick(closeTrigger).catch(() => {});
    }
    await this.page
      .locator('[data-scope="dialog"][data-part="backdrop"]')
      .waitFor({ state: 'hidden', timeout: 5000 })
      .catch(() => {});
    await this.cleanupOverlays();
    await this.page.waitForTimeout(500);
  }

  // ── Product Discount ────────────────────────────────────────────────────

  async getProductDiscountToggle() {
    await this.cleanupOverlays();
    const isVisible = await this.page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent.includes('This product has Discount?') && el.children.length < 5) {
          return true;
        }
      }
      return false;
    });
    return isVisible;
  }

  async addDiscount() {
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

    await this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.DISCOUNT_INPUT).fill('100');
    await this.clickContinueButton();
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 5: Product Options
  // ════════════════════════════════════════════════════════════════════════

  async verifyProductOptionsToggles() {
    const text = await this.page.textContent('body');
    return text.includes('Recommend') && text.includes('Available to sell') && text.includes('Enable Delivery');
  }

  async enableAllProductOptionsToggles() {
    await this.cleanupOverlays();
    await this.page.evaluate(() => {
      const toggleTexts = ['Recommend', 'Available to sell', 'Enable Delivery'];
      for (const text of toggleTexts) {
        const switches = document.querySelectorAll('label[data-scope="switch"]');
        for (const sw of switches) {
          let parent = sw.parentElement;
          for (let i = 0; i < 5; i++) {
            if (!parent) break;
            if (parent.textContent.includes(text)) {
              sw.click();
              break;
            }
            parent = parent.parentElement;
          }
        }
      }
    });
    await this.page.waitForTimeout(300);
  }
}

export { ProductsCreatePage };
