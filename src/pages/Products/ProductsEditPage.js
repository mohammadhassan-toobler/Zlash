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

class ProductsEditPage {
  constructor(page) {
    this.page = page;

    // ── Header / page-level ────────────────────────────────────────────
    this.editProductPageHeader = page.getByRole("heading", {
      name: "Edit Product",
    });
    // "Back to Product List" is on the product DETAIL page, not the edit wizard
    this.backToProductListLink = page.getByText("Back to Product List");

    // ── Tab navigation ─────────────────────────────────────────────────
    this.tabProductCategory = page.getByRole("tab", {
      name: "Product Category",
    });
    this.tabProductIdentity = page.getByRole("tab", {
      name: "Product Identity",
    });
    this.tabProductDetails = page.getByRole("tab", {
      name: "Product Details",
    });
    this.tabProductAttributes = page.getByRole("tab", {
      name: "Product Attributes",
    });
    this.tabProductOptions = page.getByRole("tab", {
      name: "Product Options",
    });

    // ── Tab 1: Product Category ────────────────────────────────────────
    this.addMediaHeader = page.getByText("Add Media of your Product", {
      exact: true,
    });
    // "Choose your Media" renders as a styled div/placeholder, not a button role
    this.chooseMediaButton = page.getByText("Choose your Media", { exact: true });
    this.uploadMedia = page.locator('input[type="file"]').first();
    this.uploadedProductImage = page.locator('img[src*="amazonaws.com"], img[src*="/products/"]').first();
    this.categoryLockedText = page.getByText(
      "selected category cannot be edited",
      { exact: true },
    );
    this.categoryDisplayed = page.getByText("Fashion & Apparel", {
      exact: true,
    });
    this.continueButton = page.getByRole("button", { name: "Continue" });

    // ── Tab 2: Product Identity ────────────────────────────────────────
    this.productIdentityHeader = page.getByText(
      "Set the Identity of your Product",
      { exact: true },
    );
    // Inputs use <label for=...> association (NOT aria-label)
    this.productNameInput = page.getByLabel("Product Name");
    this.brandNameInput = page.getByLabel("Brand Name");
    this.productCategoryBadge = page
      .locator("span")
      .filter({ hasText: "Fashion & Apparel" })
      .first();

    // ── Tab 3: Product Details ─────────────────────────────────────────
    this.productDetailsHeader = page.getByText(
      "Set the Details of your Product",
      { exact: true },
    );
    // Inputs use <label for=...> association (NOT aria-label)
    this.descriptionInput = page.getByLabel("Description");
    this.neckTypeInput = page.getByLabel("Neck / Collar Type");
    this.lengthInput = page.getByLabel("Length");
    this.washCareInput = page.getByLabel("Washcare");
    this.sleeveInput = page.getByLabel("Sleeve Type");

    // ── Tab 4: Product Attributes ──────────────────────────────────────
    this.productAttributesHeader = page.getByText(
      "Set the Attributes of your Product",
      { exact: true },
    );
    this.addVariantsButton = page.getByRole("button", { name: "Add Variants" });
    // Variant row list — each row has an "Edit" button
    this.variantRows = page.locator('[data-part="item-group-item"]').or(
      page.locator("li").filter({ has: page.getByRole("button", { name: "Edit" }) }),
    );
    this.variantEditButton = page.getByRole("button", { name: "Edit" }).first();
    this.discountToggleText = page.getByText("This product has Discount?", {
      exact: true,
    });
    this.discountInput = page.getByPlaceholder("Enter the Amount");

    // ── Variant Edit Drawer ────────────────────────────────────────────
    this.variantDrawerHeader = page.getByText("Edit Variant", { exact: true });
    // Quantity has placeholder text (not aria-label or <label> association)
    this.variantQuantityInput = page.getByPlaceholder(
      "Quantity (Total quantity added by seller)",
    );
    // Price has name="price" but no placeholder or label — use name selector
    this.variantPriceInput = page.locator('input[name="price"]');
    this.variantUpdateButton = page.getByRole("button", { name: "Update" });
    this.variantDeleteButton = page
      .locator('[data-scope="dialog"]')
      .getByRole("button", { name: "Delete" });
    this.variantMediaButton = page.getByRole("button", {
      name: "Choose Your Media",
    });
    this.variantUploadInput = page.locator('input[type="file"]').first();
    this.variantDrawerCloseButton = page
      .locator('[data-scope="dialog"] [data-part="close-trigger"]')
      .or(page.locator('[data-scope="dialog"]').getByRole("button", { name: "Close" }));

    // ── Tab 5: Product Options ─────────────────────────────────────────
    this.productOptionsHeader = page.getByText("Set the Store Options", {
      exact: true,
    });
    this.saveButton = page.getByRole("button", { name: "Save" });
    this.deleteProductButton = page
      .locator("body")
      .getByRole("button", { name: "Delete" })
      .last();
    // Option labels
    this.recommendLabel = page.getByText("Recommend", { exact: true });
    this.availableToSellLabel = page.getByText("Available to sell?", {
      exact: true,
    });
    this.enableDeliveryLabel = page.getByText("Enable Delivery", {
      exact: true,
    });
    this.enableReturnLabel = page.getByText("Enable Return", { exact: true });
    this.deleteProductLabel = page.getByText("Delete this Product?", {
      exact: true,
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // Universal helpers
  // ════════════════════════════════════════════════════════════════════════

  /** Remove Chakra overlay / backdrop elements that block pointer events */
  async cleanupOverlays() {
    await this.page.evaluate(() => {
      document.documentElement.style.pointerEvents = "";
      document.body.style.pointerEvents = "";
      document.querySelectorAll(".css-1yooxd2").forEach((el) => {
        el.style.pointerEvents = "none";
      });
      document
        .querySelectorAll('[data-scope="dialog"][data-part="backdrop"]')
        .forEach((el) => {
          el.style.pointerEvents = "none";
          el.style.display = "none";
        });
    });
  }

  /** Wait for Chakra toasts to disappear; force-hide if they persist */
  async waitForToastToDisappear() {
    await this.page
      .evaluate(() => {
        document.querySelectorAll('[data-scope="toast"]').forEach((el) => {
          el.style.pointerEvents = "none";
          el.style.display = "none";
        });
        const toastGroup = document.querySelector(
          '[data-part="group"][data-scope="toast"]',
        );
        if (toastGroup) {
          toastGroup.style.pointerEvents = "none";
          toastGroup.style.display = "none";
        }
      })
      .catch(() => {});
  }

  /**
   * Safely click an element by waiting for toasts, cleaning up overlays,
   * and attempting standard click, evaluate click, and finally forced click.
   */
  async safeClick(locator, options = {}) {
    await this.waitForToastToDisappear();
    await this.cleanupOverlays();
    try {
      // Try standard click with a short timeout first (handles stable elements natively)
      await locator.click({ timeout: 5000, ...options });
    } catch (e) {
      try {
        // Fallback 1: Direct browser-side click (handles animating/moving elements instantly)
        await locator.evaluate((el) => {
          if (el) el.click();
        });
      } catch (innerErr) {
        // Fallback 2: Forced click (waits for element to appear if not in DOM yet)
        await locator.click({ force: true, timeout: 2000, ...options }).catch(() => {});
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
        await this.page.goto(url, { waitUntil: "load", ...options });
        return; // Success!
      } catch (err) {
        lastError = err;
        const msg = err.message || "";
        const isNetworkOrDnsError =
          msg.includes("NS_ERROR_UNKNOWN_HOST") ||
          msg.includes("NS_ERROR_ABORT") ||
          msg.includes("NS_ERROR_CONNECTION_REFUSED") ||
          msg.includes("net::ERR_NAME_NOT_RESOLVED") ||
          msg.includes("net::ERR_CONNECTION_REFUSED") ||
          msg.includes("net::ERR_CONNECTION_RESET") ||
          msg.includes("Timeout");

        if (isNetworkOrDnsError && attempt < maxRetries) {
          console.log(`[NETWORK WARNING] Goto ${url} failed (Attempt ${attempt}/${maxRetries}): ${msg}. Retrying in 2s...`);
          await this.page.waitForTimeout(2000);
        } else {
          throw err;
        }
      }
    }
  }

  /** Safely click a tab, bypassing overlays or layout shifts if necessary */
  async clickTab(tabNameOrLocator) {
    const tabLocator = typeof tabNameOrLocator === "string"
      ? this.page.getByRole("tab", { name: tabNameOrLocator })
      : tabNameOrLocator;
    await this.safeClick(tabLocator);
    await this.page.waitForTimeout(500);
  }

  /**
   * Click a Chakra switch / native checkbox that is near the given text string.
   * Traverses up to 8 ancestor levels looking for the text in the parent's
   * textContent. Returns the strategy used ('label'|'control'|'checkbox') or null.
   */
  async clickSwitchNearText(textFragment) {
    await this.cleanupOverlays();
    const clicked = await this.page.evaluate((text) => {
      const strategies = [
        { sel: 'label[data-scope="switch"]', key: "label" },
        { sel: 'span[data-part="control"]', key: "control" },
        { sel: 'input[type="checkbox"]', key: "checkbox" },
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

  /** Click Continue (tabs 1-4) or Save (tab 5) */
  async clickContinueButton() {
    const actionButton = this.page
      .locator("button")
      .filter({ hasText: /Continue|Save/i })
      .last();
    await this.safeClick(actionButton);
    await this.page.waitForTimeout(500);
  }

  // ════════════════════════════════════════════════════════════════════════
  // Navigation helpers
  // ════════════════════════════════════════════════════════════════════════

  /**
   * Navigate to the product detail page for the given productId,
   * then click the "Edit Product" button to open the edit wizard.
   */
  async navigateToEditProduct(productId) {
    await this.safeGoto(`/admin/product/${productId}`, {
      waitUntil: "load",
    });
    const editBtn = this.page.getByRole("button", { name: "Edit Product" });
    await this.safeClick(editBtn);
    await this.page.waitForLoadState("load");
  }

  /**
   * Navigate directly to the edit URL (bypasses the detail page).
   * Useful when the productId is known.
   */
  async navigateDirectlyToEditProduct(productId) {
    await this.safeGoto(`/admin/product/edit/${productId}`, {
      waitUntil: "load",
    });
    await this.addMediaHeader.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
    await this.categoryDisplayed.waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  getEditProductPageHeader() {
    return this.editProductPageHeader;
  }

  /**
   * Navigate to the product detail page and click "Back to Product List" from there.
   * Note: the Back link is only present on the DETAIL page (/admin/product/:id),
   * not on the edit wizard (/admin/product/edit/:id).
   */
  async clickBackToProductList() {
    // If currently on the edit page, navigate to the detail page first
    if (this.page.url().includes("/edit/")) {
      const productId = this.page.url().split("/edit/").pop();
      await this.safeGoto(`/admin/product/${productId}`, {
        waitUntil: "load",
      });
    }
    await this.safeClick(this.backToProductListLink);
    await this.page.waitForLoadState("load");
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 1: Product Category
  // ════════════════════════════════════════════════════════════════════════

  getAddMediaHeader() {
    return this.addMediaHeader;
  }

  getChooseMediaButton() {
    return this.chooseMediaButton;
  }

  getCategoryLockedText() {
    return this.categoryLockedText;
  }

  getCategoryDisplayed() {
    return this.categoryDisplayed;
  }

  async uploadProductImage(filePath) {
    await this.uploadMedia.setInputFiles(filePath);
  }

  getUploadedProductImage() {
    return this.uploadedProductImage;
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 2: Product Identity
  // ════════════════════════════════════════════════════════════════════════

  getProductIdentityHeader() {
    return this.productIdentityHeader;
  }

  async getProductNameValue() {
    return await this.productNameInput.inputValue();
  }

  async getBrandNameValue() {
    return await this.brandNameInput.inputValue();
  }

  async updateProductName(newName) {
    await this.productNameInput.fill("");
    await this.productNameInput.fill(newName);
  }

  async clearAndFillProductName(newName) {
    await this.productNameInput.focus();
    await this.productNameInput.press("Control+a");
    await this.productNameInput.press("Backspace");
    if (newName) {
      await this.productNameInput.fill(newName);
    }
    await this.productNameInput.blur().catch(() => {});
  }

  async clearAndFillBrandName(newName) {
    await this.brandNameInput.focus();
    await this.brandNameInput.press("Control+a");
    await this.brandNameInput.press("Backspace");
    if (newName) {
      await this.brandNameInput.fill(newName);
    }
    await this.brandNameInput.blur().catch(() => {});
  }

  async clearDescription() {
    await this.descriptionInput.focus();
    await this.descriptionInput.press("Control+a");
    await this.descriptionInput.press("Backspace");
    await this.descriptionInput.blur().catch(() => {});
  }

  getProductCategoryBadge() {
    return this.productCategoryBadge;
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 3: Product Details
  // ════════════════════════════════════════════════════════════════════════

  getProductDetailsHeader() {
    return this.productDetailsHeader;
  }

  async getDescriptionValue() {
    return await this.descriptionInput.inputValue();
  }

  async updateDescription(newDescription) {
    await this.descriptionInput.fill("");
    await this.descriptionInput.pressSequentially(newDescription, {
      delay: 5,
    });
  }

  async updateSleeveType(value) {
    await this.sleeveInput.fill(value);
  }

  async updateNeckType(value) {
    await this.neckTypeInput.fill(value);
  }

  async updateLength(value) {
    await this.lengthInput.fill(value);
  }

  async updateWashCare(value) {
    await this.washCareInput.fill(value);
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 4: Product Attributes
  // ════════════════════════════════════════════════════════════════════════

  getProductAttributesHeader() {
    return this.productAttributesHeader;
  }

  getAddVariantsButton() {
    return this.addVariantsButton;
  }

  getVariantEditButton() {
    return this.variantEditButton;
  }

  /** Open the Edit Variant drawer for the first (or Nth) variant */
  async openVariantEditDrawer(nth = 0) {
    const editButtons = this.page.getByRole("button", { name: "Edit" });
    await this.safeClick(editButtons.nth(nth));
    await this.page.waitForTimeout(600);
  }

  getVariantDrawerHeader() {
    return this.variantDrawerHeader;
  }

  async getVariantQuantityValue() {
    return await this.variantQuantityInput.inputValue();
  }

  async getVariantPriceValue() {
    return await this.variantPriceInput.inputValue();
  }

  async updateVariantQuantity(qty) {
    await this.variantQuantityInput.fill(String(qty));
  }

  async updateVariantPrice(price) {
    await this.variantPriceInput.fill(String(price));
  }

  async clickVariantUpdate() {
    await this.safeClick(this.variantUpdateButton);
    await this.page.waitForTimeout(500);
  }

  async closeVariantDrawer() {
    const isOpenBefore = await this.variantDrawerHeader.isVisible().catch(() => false);
    if (!isOpenBefore) {
      return;
    }
    await this.safeClick(this.variantDrawerCloseButton);
    await this.page.waitForTimeout(300);
    const isOpenAfter = await this.variantDrawerHeader.isVisible().catch(() => false);
    if (isOpenAfter) {
      await this.page.keyboard.press("Escape");
      await this.page.waitForTimeout(300);
    }
    await this.page
      .locator('[data-scope="dialog"][data-part="backdrop"]')
      .waitFor({ state: "hidden", timeout: 5000 })
      .catch(() => {});
    await this.cleanupOverlays();
    await this.page.waitForTimeout(400);
  }

  getDiscountToggleText() {
    return this.discountToggleText;
  }

  async enableDiscountAndFill(amount) {
    await this.cleanupOverlays();
    await this.clickSwitchNearText("Discount");
    await this.discountInput.fill(String(amount));
  }

  // ════════════════════════════════════════════════════════════════════════
  // Tab 5: Product Options
  // ════════════════════════════════════════════════════════════════════════

  getProductOptionsHeader() {
    return this.productOptionsHeader;
  }

  getSaveButton() {
    return this.saveButton;
  }

  getDeleteProductButton() {
    return this.deleteProductButton;
  }

  getDeleteProductLabel() {
    return this.deleteProductLabel;
  }

  getRecommendLabel() {
    return this.recommendLabel;
  }

  getAvailableToSellLabel() {
    return this.availableToSellLabel;
  }

  getEnableDeliveryLabel() {
    return this.enableDeliveryLabel;
  }

  getEnableReturnLabel() {
    return this.enableReturnLabel;
  }

  async clickSave() {
    await this.safeClick(this.saveButton);
    await this.page.waitForTimeout(500);
  }

  /**
   * Toggle a specific option on Tab 5 by its label text.
   * e.g. toggleOption('Recommend'), toggleOption('Available to sell')
   */
  async toggleOption(labelText) {
    await this.cleanupOverlays();
    const clicked = await this.clickSwitchNearText(labelText);
    if (!clicked) {
      // Fallback using JS paragraph traversal
      await this.page.evaluate((text) => {
        const paragraphs = document.querySelectorAll("p");
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
    const bodyText = await this.page.textContent("body");
    return (
      bodyText.includes("Recommend") &&
      bodyText.includes("Available to sell") &&
      bodyText.includes("Enable Delivery") &&
      bodyText.includes("Enable Return") &&
      bodyText.includes("Delete this Product?")
    );
  }
}

export { ProductsEditPage };
