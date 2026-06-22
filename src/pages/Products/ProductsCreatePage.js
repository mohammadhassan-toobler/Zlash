class ProductsCreatePage {
  constructor(page) {
    this.page = page;
    this.addMediaHeader = page.getByRole("heading", {
      name: "Add Media of your Product",
    });
    this.addProductHeader = page.getByRole("heading", {
      name: "Add a Product",
    });
    this.selectCategoryHeader = page.getByRole("heading", {
      name: "Select a Category to get started!",
    });
    this.mediaUpload = page.getByText("Choose your Media", { exact: true });
    this.uploadMedia = page.locator('input[type="file"]').first();
    this.uploadedProductImage = page.locator('img[alt^="media"], img[src*="data:image"], img[src*="amazonaws.com"]').first();
    this.selectCategory = page.getByText("Select a Category", { exact: true });
    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.productIdentityHeader = page.getByRole("heading", {
      name: "Set the Identity of your Product",
    });
    this.productNameInput = page.getByRole("textbox", { name: "Product Name" });
    this.brandNameInput = page.getByRole('textbox', { name: 'Brand Name' });
    this.productCategoryText = page
      .locator("span")
      .filter({ hasText: "Fashion & Apparel" })
      .first();
    this.productDetailsHeader = page.getByText('Set the Details of your Product', { exact: true })
    this.descriptionInput = page.getByRole("textbox", { name: "Description" });
    this.sleeveInput = page.getByRole("textbox", { name: "Sleeve Type" });
    this.neckTypeInput = page.getByRole("textbox", {
      name: "Neck / Collar Type",
    });
    this.lengthInput = page.getByRole("textbox", { name: "Length" });
    this.washCareInput = page.getByRole("textbox", { name: "Washcare" });
    this.productAttributesHeader = page.getByText('Set the Attributes of your Product', { exact: true })
    this.chooseVariantTypeButton = page.getByRole("button", {
      name: "Choose Variant Type",
    });
    this.selectSizeVariant = page.getByRole("button", { name: "Size" });
    this.selectColorVariant = page.getByRole("button", { name: "Color" });
    this.selectGenderVariant = page.getByRole("button", { name: "Gender" });
    this.selectFitVariant = page.getByRole("button", { name: "Fit" });
    this.selectPatternVariant = page.getByRole("button", { name: "Pattern" });
    this.variantSaveButton = page
      .locator('[data-scope="dialog"]:visible')
      .getByRole("button", { name: "Save" })
      .first();
    this.addVariantButton = page.getByRole('button', { name: 'Add Variants' });
    this.sizeVariantsDetails = page.getByText('Select Size', { exact: true });
    this.colorVariantsDetails = page.getByText('Select Color', { exact: true });
    this.genderVariantsDetails = page.getByText('Select Gender', { exact: true });
    this.fitVariantsDetails = page.getByText('Select Fit', { exact: true });
    this.patternVariantsDetails = page.getByText('Select Pattern', { exact: true });
    this.variantErrorMessages = page.locator('span').filter({ hasText: 'Required' });
    this.variantFirstOption = page.getByRole('option').first();
    this.quantityInput = page.getByRole('textbox', { name: 'Quantity' });
    this.priceInput = page.getByRole('textbox', { name: 'Price' });
    this.availableToPurchaseToggle = page.locator("span[id='switch:isAvailable:control']");
    this.variantImage = page.locator(':text("Choose Your Media")');
    this.productDiscountInput = page.getByPlaceholder('Enter the Amount');
    this.productOptionsHeader = page.getByText('Set the Store Options', { exact: true });
  }

  // ──────────────────────────────────────────────────────────────────────
  // Universal helper: clean up ALL known overlay/pointer-events blockers
  // ──────────────────────────────────────────────────────────────────────
  async cleanupOverlays() {
    await this.page.evaluate(() => {
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
      
      // Category dropdown overlays
      document.querySelectorAll('.css-1yooxd2').forEach(el => {
        el.style.pointerEvents = 'none';
      });
    }).catch(() => {});
  }

  // ──────────────────────────────────────────────────────────────────────
  // Universal helper: click a Chakra switch near specific text using JS
  // This bypasses all locator resolution issues with nested wrapper divs
  // ──────────────────────────────────────────────────────────────────────
  async clickSwitchNearText(textFragment) {
    await this.cleanupOverlays();
    const clicked = await this.page.evaluate((text) => {
      // Strategy 1: Find switch labels near the text
      const switches = document.querySelectorAll('label[data-scope="switch"]');
      for (const sw of switches) {
        let parent = sw.parentElement;
        for (let i = 0; i < 8; i++) {
          if (!parent) break;
          if (parent.textContent.includes(text)) {
            sw.click();
            return 'label';
          }
          parent = parent.parentElement;
        }
      }
      // Strategy 2: Find switch control spans near the text
      const controls = document.querySelectorAll('span[data-part="control"]');
      for (const ctrl of controls) {
        let parent = ctrl.parentElement;
        for (let i = 0; i < 8; i++) {
          if (!parent) break;
          if (parent.textContent.includes(text)) {
            ctrl.click();
            return 'control';
          }
          parent = parent.parentElement;
        }
      }
      // Strategy 3: Find checkbox inputs near the text
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      for (const cb of checkboxes) {
        let parent = cb.parentElement;
        for (let i = 0; i < 8; i++) {
          if (!parent) break;
          if (parent.textContent.includes(text)) {
            cb.click();
            return 'checkbox';
          }
          parent = parent.parentElement;
        }
      }
      return null;
    }, textFragment);
    // Wait for the toggle state to update
    await this.page.waitForTimeout(500);
    return clicked;
  }

  // ──────────────────────────────────────────────────────────────────────
  // Universal helper: wait for toast notifications to disappear
  // ──────────────────────────────────────────────────────────────────────
  async waitForToastToDisappear() {
    await this.page.evaluate(() => {
      document.querySelectorAll('[data-scope="toast"]').forEach(el => {
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
          else throw new Error("Element not found for evaluate click");
        });
      } catch (innerErr) {
        await locator.click({ force: true, timeout: 5000, ...options });
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // Tab 1: Product Category
  // ──────────────────────────────────────────────────────────────────────
  getAddProductHeader() {
    return this.addProductHeader;
  }
  getAddMediaHeader() {
    return this.addMediaHeader;
  }
  getSelectCategoryHeader() {
    return this.selectCategoryHeader;
  }
  getMediaUpload() {
    return this.mediaUpload;
  }
  async uploadProductImage(filePath) {
    const responsePromise = this.page.waitForResponse(
      response => response.url().includes('/api/v1/product-media-upload') && response.status() === 200,
      { timeout: 30000 }
    ).catch(() => null);
    await this.uploadMedia.setInputFiles(filePath);
    await responsePromise;
    await this.page.waitForTimeout(1000); // Allow UI to render the uploaded image
  }
  getUploadedProductImage() {
    return this.uploadedProductImage;
  }
  async verifySelectCategoryButtonVisible() {
    return await this.selectCategory.isVisible();
  }
  async chooseCategory(category) {
    await this.safeClick(this.selectCategory);
    await this.safeClick(this.page.getByText(category, { exact: true }));
    // The category dropdown renders a persistent overlay that blocks pointer events
    await this.cleanupOverlays();
  }
  verifyCategoryVisible(category) {
    return this.page.getByText(category, { exact: true }).first();
  }

  // ──────────────────────────────────────────────────────────────────────
  // Navigation: Continue / Save button
  // ──────────────────────────────────────────────────────────────────────
  async clickContinueButton(forceSingleClick = false) {
    await this.waitForToastToDisappear();
    await this.cleanupOverlays();
    const activeTab = this.page.locator('[role="tabpanel"]:visible');
    const initialId = await activeTab.getAttribute("id").catch(() => null);
    const actionButton = activeTab
      .locator("button")
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
      const currentId = await currentTab.getAttribute("id").catch(() => null);
      if (currentId !== initialId) {
        return; // Successfully transitioned to the next tab!
      }
      console.log(`[Warning] clickContinueButton did not transition tab (Attempt ${attempt}/3). Retrying...`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  // Tab 2: Product Identity
  // ──────────────────────────────────────────────────────────────────────
  getProductIdentityHeader() {
    return this.productIdentityHeader;
  }
  async fillProductName() {
    const timestamp = Date.now();
    this._productName = `Shirt ${timestamp}`; // Store for possible re-fill after toggle re-render
    await this.safeClick(this.productNameInput);
    await this.productNameInput.fill(this._productName);
    // Verify the value was actually set (guard against React re-render clearing it)
    const value = await this.productNameInput.inputValue();
    if (!value) {
      await this.safeClick(this.productNameInput);
      await this.productNameInput.fill(this._productName);
    }
  }
  async switchBrandNameToggle() {
    await this.cleanupOverlays();
    
    // Check if the "doesn't have brand name" checkbox is checked
    const isChecked = await this.page.evaluate(() => {
      const cb = Array.from(document.querySelectorAll('input[type="checkbox"]'))
        .find(c => {
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

    // We want the checkbox to be UNCHECKED so that we can fill the brand name.
    // If it is checked, click it to uncheck it.
    if (isChecked) {
      const clicked = await this.clickSwitchNearText("doesn't have brand name");
      if (!clicked) {
        await this.page.evaluate(() => {
          const cb = Array.from(document.querySelectorAll('input[type="checkbox"]'))
            .find(c => {
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
    // Verify the input is enabled before filling
    await this.brandNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.brandNameInput.fill("Allen Solly");
    // The brand name toggle may have caused a React re-render that cleared the product name.
    // Re-fill it if it got cleared.
    if (this._productName) {
      const currentName = await this.productNameInput.inputValue().catch(() => '');
      if (!currentName) {
        await this.safeClick(this.productNameInput);
        await this.productNameInput.fill(this._productName);
      }
    }
  }
  verifyProductCategoryVisible() {
    return this.productCategoryText;
  }

  // ──────────────────────────────────────────────────────────────────────
  // Tab 3: Product Details
  // ──────────────────────────────────────────────────────────────────────
  getproductDetailsHeader() {
    return this.productDetailsHeader;
  }
  async fillProductDetails() {
    await this.safeClick(this.descriptionInput);
    await this.page.waitForTimeout(200); // Let React settle after focus
    
    const descText = "A regular-fit unisex cotton tee with a smooth print surface and a soft, broken-in feel. Easy through the body and sleeves, it works well as a daily staple, a branded uniform piece, or a clean base layer under outerwear.";
    await this.descriptionInput.fill(descText);
    
    // Verify the value was set, retry if not
    const descValue = await this.descriptionInput.inputValue();
    if (descValue !== descText) {
      await this.safeClick(this.descriptionInput);
      await this.descriptionInput.fill(descText);
    }
    
    await this.sleeveInput.fill("Full-Sleeve");
    await this.neckTypeInput.fill("Collar-Type");
    await this.lengthInput.fill("XL");
    await this.washCareInput.fill("Wash Inside out");
  }

  // ──────────────────────────────────────────────────────────────────────
  // Tab 4: Product Attributes
  // ──────────────────────────────────────────────────────────────────────
  getproductsAttributeHeader() {
    return this.productAttributesHeader;
  }
  async switchVariantToggle() {
    await this.cleanupOverlays();
    // Wait for the Attributes tab to be fully rendered
    await this.productAttributesHeader.waitFor({ state: 'visible', timeout: 10000 });
    
    // Check if the toggle is already ON
    const isAlreadyOn = await this.page.evaluate(() => {
      const checkbox = Array.from(document.querySelectorAll('input[type="checkbox"]'))
        .find(cb => {
          let parent = cb.parentElement;
          for (let i = 0; i < 8; i++) {
            if (!parent) break;
            if (parent.textContent.includes('Variants')) return true;
            parent = parent.parentElement;
          }
          return false;
        });
      return checkbox ? checkbox.checked : false;
    });

    if (!isAlreadyOn) {
      const clicked = await this.clickSwitchNearText('Variants?');
      if (!clicked) {
        // Direct fallback: find the checkbox inside the Product Variants group
        await this.page.evaluate(() => {
          const cb = Array.from(document.querySelectorAll('input[type="checkbox"]'))
            .find(c => {
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
      // Wait for the toggle to take effect and "Choose Variant Type" button to appear
      await this.page.waitForTimeout(800);
    }
  }
  getChooseVariantTypeButton() {
    return this.chooseVariantTypeButton;
  }
  async clickVariantType() {
    await this.safeClick(this.chooseVariantTypeButton);
  }
  async selectVariant() {
    await this.safeClick(this.selectSizeVariant);
    await this.safeClick(this.selectColorVariant);
    await this.safeClick(this.selectGenderVariant);
    await this.safeClick(this.selectFitVariant);
    await this.safeClick(this.selectPatternVariant);
    await this.safeClick(this.variantSaveButton);
  }
  getAddVariantButton() {
    return this.addVariantButton;
  }
  async clickAddVariantButton() {
    await this.safeClick(this.addVariantButton);
  }
  verifySizeVariantsDetailsVisible() {
    return this.sizeVariantsDetails;
  }
  verifyColorVariantsDetailsVisible() {
    return this.colorVariantsDetails;
  }
  verifyGenderVariantsDetailsVisible() {
    return this.genderVariantsDetails;
  }
  verifyFitVariantsDetailsVisible() {
    return this.fitVariantsDetails;
  }
  verifyPatternVariantsDetailsVisible() {
    return this.patternVariantsDetails;
  }
  async verifyMandatoryVariantsError() {
    await this.waitForToastToDisappear();
    await this.safeClick(this.variantSaveButton);
  }
  getVariantErrorMessages() {
    return this.variantErrorMessages;
  }
  async addVariantDetails() {
    await this.safeClick(this.sizeVariantsDetails, { force: true });
    await this.sizeVariantsDetails.press("ArrowDown").catch(() => {});
    await this.safeClick(this.variantFirstOption);
    await this.safeClick(this.colorVariantsDetails, { force: true });
    await this.colorVariantsDetails.press("ArrowDown").catch(() => {});
    await this.safeClick(this.variantFirstOption);
    await this.safeClick(this.genderVariantsDetails, { force: true });
    await this.genderVariantsDetails.press("ArrowDown").catch(() => {});
    await this.safeClick(this.variantFirstOption);
    await this.safeClick(this.fitVariantsDetails, { force: true });
    await this.fitVariantsDetails.press("ArrowDown").catch(() => {});
    await this.safeClick(this.variantFirstOption);
    await this.safeClick(this.patternVariantsDetails, { force: true });
    await this.patternVariantsDetails.press("ArrowDown").catch(() => {});
    await this.safeClick(this.variantFirstOption);
    await this.cleanupOverlays();
    await this.quantityInput.fill('10');
    await this.priceInput.fill('1000');
    await this.safeClick(this.availableToPurchaseToggle);
    await this.safeClick(this.variantSaveButton);
  }
  getVariantImageText() {
    return this.variantImage;
  }
  async uploadVariantImage(filePath) {
    // Click the "Choose Your Media" text/button in the variant table row to open the upload drawer
    await this.safeClick(this.variantImage);
    await this.page.waitForTimeout(500); // wait for drawer/input to settle

    const responsePromise = this.page.waitForResponse(
      response => response.url().includes('/api/v1/product-media-upload') && response.status() === 200,
      { timeout: 30000 }
    ).catch(() => null);
    await this.uploadMedia.setInputFiles(filePath);
    await responsePromise;
    await this.page.waitForTimeout(1000); // Allow UI to render the uploaded image
    await this.cleanupOverlays();
    await this.safeClick(this.variantSaveButton, { force: true });
    // Close the drawer after saving — only click if it is still open
    const closeTrigger = this.page.locator('[data-scope="dialog"]')
      .filter({ hasText: /Upload|Media/i })
      .locator('[data-part="close-trigger"]')
      .first();
    if (await closeTrigger.isVisible().catch(() => false)) {
      await this.safeClick(closeTrigger).catch(() => {});
    }
    // Wait for the drawer to fully close
    await this.page.locator('[data-scope="dialog"][data-part="backdrop"]')
      .waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    // Extra cleanup to remove any lingering drawer elements
    await this.cleanupOverlays();
    await this.page.waitForTimeout(500);
  }

  // ──────────────────────────────────────────────────────────────────────
  // Tab 4 continued: Product Discount
  // ──────────────────────────────────────────────────────────────────────
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
    
    // Check if discount toggle is already checked (ON)
    const isChecked = await this.page.evaluate(() => {
      const cb = Array.from(document.querySelectorAll('input[type="checkbox"]'))
        .find(c => {
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
          const cb = Array.from(document.querySelectorAll('input[type="checkbox"]'))
            .find(c => {
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
    
    await this.productDiscountInput.fill('100');
    await this.clickContinueButton();
  }

  // ──────────────────────────────────────────────────────────────────────
  // Tab 5: Product Options
  // ──────────────────────────────────────────────────────────────────────
  getProductOptionsHeader() {
    return this.productOptionsHeader;
  }
  async verifyProductOptionsToggles() {
    const text = await this.page.textContent('body');
    return text.includes('Recommend') && text.includes('Available to sell') && text.includes('Enable Delivery');
  }
  async enableAllProductOptionsToggles() {
    await this.cleanupOverlays();
    // Click all toggle switches on the Product Options tab via JS
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
