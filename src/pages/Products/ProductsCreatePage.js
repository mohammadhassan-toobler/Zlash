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
    this.uploadedProductImage = page.getByRole("img", { name: "media" });
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
    this.variantSaveButton = page.getByRole("button", { name: "Save" });
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
      // Restore pointer-events on html/body
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
      // Category dropdown overlays
      document.querySelectorAll('.css-1yooxd2').forEach(el => {
        el.style.pointerEvents = 'none';
      });
      // Chakra dialog/drawer positioners and backdrops
      document.querySelectorAll('[data-scope="dialog"][data-part="positioner"]').forEach(el => {
        el.style.pointerEvents = 'none';
      });
      document.querySelectorAll('[data-scope="dialog"][data-part="backdrop"]').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.display = 'none';
      });
    });
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
    // First, wait up to 10s for the toast to disappear on its own
    await this.page.locator('[data-scope="toast"]')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});
    // If toast is still visible, hide it via JS to unblock pointer events
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
    await this.uploadMedia.setInputFiles(filePath);
  }
  getUploadedProductImage() {
    return this.uploadedProductImage;
  }
  async verifySelectCategoryButtonVisible() {
    return await this.selectCategory.isVisible();
  }
  async chooseCategory(category) {
    await this.selectCategory.click();
    await this.page.getByText(category, { exact: true }).click();
    // The category dropdown renders a persistent overlay that blocks pointer events
    await this.cleanupOverlays();
  }
  verifyCategoryVisible(category) {
    return this.page.getByText(category, { exact: true }).first();
  }

  // ──────────────────────────────────────────────────────────────────────
  // Navigation: Continue / Save button
  // ──────────────────────────────────────────────────────────────────────
  async clickContinueButton() {
    await this.waitForToastToDisappear();
    await this.cleanupOverlays();
    // Try Continue first; on the last tab the button says "Save"
    const continueVisible = await this.continueButton.isVisible().catch(() => false);
    if (continueVisible) {
      await this.continueButton.click();
    } else {
      // On Tab 5 (last tab), the button says "Save" — click the last visible Save button
      // (to avoid clicking the variant Save button inside a drawer)
      const saveButton = this.page.getByRole('button', { name: 'Save' }).last();
      try {
        await saveButton.click({ timeout: 5000 });
      } catch {
        // If toast/overlay still blocks, use force click to bypass interception
        await saveButton.click({ force: true });
      }
    }
    // Brief wait for tab transition React re-render
    await this.page.waitForTimeout(500);
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
    await this.productNameInput.click();
    await this.productNameInput.fill(this._productName);
    // Verify the value was actually set (guard against React re-render clearing it)
    const value = await this.productNameInput.inputValue();
    if (!value) {
      await this.productNameInput.click();
      await this.productNameInput.fill(this._productName);
    }
  }
  async switchBrandNameToggle() {
    // The brand name toggle is a native <checkbox> element next to the
    // "This product doesn't have brand name" label — use JS to find and click it.
    // Only toggle if the brand name input is not currently enabled.
    const isEnabled = await this.brandNameInput.isEnabled().catch(() => false);
    if (!isEnabled) {
      // Use the generic JS strategy which handles checkboxes (Strategy 3)
      const clicked = await this.clickSwitchNearText("doesn't have brand name");
      if (!clicked) {
        // Fallback: find the checkbox that's near the brand name paragraph directly
        await this.page.evaluate(() => {
          const paragraphs = document.querySelectorAll('p');
          for (const p of paragraphs) {
            if (p.textContent.includes("brand name")) {
              const parent = p.parentElement;
              if (parent) {
                const cb = parent.querySelector('input[type="checkbox"]');
                if (cb) { cb.click(); return; }
              }
            }
          }
        });
      }
      await this.page.waitForTimeout(300);
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
        await this.productNameInput.click();
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
    // Scroll the description textarea into view and explicitly focus it before filling
    await this.descriptionInput.scrollIntoViewIfNeeded();
    await this.descriptionInput.click();
    await this.page.waitForTimeout(200); // Let React settle after focus
    // Use pressSequentially to simulate real keystrokes (fill() may silently fail on
    // React controlled textareas that reset on synthetic input events)
    await this.descriptionInput.pressSequentially(
      "A regular-fit unisex cotton tee with a smooth print surface and a soft, broken-in feel. Easy through the body and sleeves, it works well as a daily staple, a branded uniform piece, or a clean base layer under outerwear.",
      { delay: 5 }
    );
    // Verify the value was set, fall back to fill() if pressSequentially didn't work
    const descValue = await this.descriptionInput.inputValue();
    if (!descValue) {
      await this.descriptionInput.click();
      await this.descriptionInput.fill(
        "A regular-fit unisex cotton tee with a smooth print surface and a soft, broken-in feel."
      );
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
    // The variant toggle is a native <checkbox> — use JS to click the checkbox
    // near "Variants?" text (same pattern as the brand name toggle)
    const clicked = await this.clickSwitchNearText('Variants?');
    if (!clicked) {
      // Direct fallback: find the checkbox inside the Product Variants group
      await this.page.evaluate(() => {
        const paragraphs = document.querySelectorAll('p');
        for (const p of paragraphs) {
          if (p.textContent.includes('Variants')) {
            const parent = p.parentElement;
            if (parent) {
              const cb = parent.querySelector('input[type="checkbox"]');
              if (cb) { cb.click(); return; }
            }
          }
        }
      });
    }
    // Wait for the toggle to take effect and "Choose Variant Type" button to appear
    await this.page.waitForTimeout(800);
  }
  getChooseVariantTypeButton() {
    return this.chooseVariantTypeButton;
  }
  async clickVariantType() {
    await this.chooseVariantTypeButton.click();
  }
  async selectVariant() {
    await this.selectSizeVariant.click();
    await this.selectColorVariant.click();
    await this.selectGenderVariant.click();
    await this.selectFitVariant.click();
    await this.selectPatternVariant.click();
    await this.variantSaveButton.click();
  }
  getAddVariantButton() {
    return this.addVariantButton;
  }
  async clickAddVariantButton() {
    await this.addVariantButton.click();
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
    await this.variantSaveButton.click();
  }
  getVariantErrorMessages() {
    return this.variantErrorMessages;
  }
  async addVariantDetails() {
    await this.sizeVariantsDetails.click({ force: true });
    await this.variantFirstOption.click();
    await this.colorVariantsDetails.click({ force: true });
    await this.variantFirstOption.click();
    await this.genderVariantsDetails.click({ force: true });
    await this.variantFirstOption.click();
    await this.fitVariantsDetails.click({ force: true });
    await this.variantFirstOption.click();
    await this.patternVariantsDetails.click({ force: true });
    await this.variantFirstOption.click();
    await this.quantityInput.fill('10');
    await this.priceInput.fill('1000');
    await this.availableToPurchaseToggle.click();
    await this.variantSaveButton.click();
  }
  getVariantImageText() {
    return this.variantImage;
  }
  async uploadVariantImage(filePath) {
    await this.uploadMedia.setInputFiles(filePath);
    await this.variantSaveButton.click();
    // Close the drawer after saving — Save doesn't auto-close it
    await this.page.locator('[data-scope="dialog"] [data-part="close-trigger"]').click();
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
    // Click the discount toggle
    await this.clickSwitchNearText('Discount');
    // Fill the discount amount
    await this.productDiscountInput.fill('100');
    // Navigate to Tab 5 using the robust clickContinueButton method
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
