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
    this.uploadedProductImage = page.getByRole("img", { name: /media/i });
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
    this.variantDrawerCloseButton = page.locator(
      '[data-scope="dialog"] [data-part="close-trigger"]',
    );

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
        .querySelectorAll('[data-scope="dialog"][data-part="positioner"]')
        .forEach((el) => {
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
      .locator('[data-scope="toast"]')
      .waitFor({ state: "hidden", timeout: 10000 })
      .catch(() => {});
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
    await this.waitForToastToDisappear();
    await this.cleanupOverlays();
    const continueVisible = await this.continueButton
      .isVisible()
      .catch(() => false);
    if (continueVisible) {
      await this.continueButton.click();
    } else {
      // Tab 5 uses Save
      try {
        await this.saveButton.click({ timeout: 5000 });
      } catch {
        await this.saveButton.click({ force: true });
      }
    }
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
    await this.page.goto(`/admin/product/${productId}`, {
      waitUntil: "networkidle",
    });
    await this.page
      .getByRole("button", { name: "Edit Product" })
      .click();
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Navigate directly to the edit URL (bypasses the detail page).
   * Useful when the productId is known.
   */
  async navigateDirectlyToEditProduct(productId) {
    await this.page.goto(`/admin/product/edit/${productId}`, {
      waitUntil: "networkidle",
    });
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
      await this.page.goto(`/admin/product/${productId}`, {
        waitUntil: "networkidle",
      });
    }
    await this.backToProductListLink.click();
    await this.page.waitForLoadState("networkidle");
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
    await this.productNameInput.click();
    await this.productNameInput.selectAll
      ? await this.productNameInput.selectAll()
      : await this.productNameInput.triple_click
        ? await this.productNameInput.tripleClick()
        : null;
    await this.productNameInput.fill(newName);
  }

  async clearAndFillProductName(newName) {
    await this.productNameInput.click();
    await this.productNameInput.fill("");
    await this.productNameInput.fill(newName);
  }

  async clearAndFillBrandName(newName) {
    await this.brandNameInput.click();
    await this.brandNameInput.fill("");
    await this.brandNameInput.fill(newName);
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
    await this.descriptionInput.scrollIntoViewIfNeeded();
    await this.descriptionInput.click();
    await this.page.waitForTimeout(200);
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
    await editButtons.nth(nth).click();
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
    await this.variantQuantityInput.click();
    await this.variantQuantityInput.fill(String(qty));
  }

  async updateVariantPrice(price) {
    await this.variantPriceInput.click();
    await this.variantPriceInput.fill(String(price));
  }

  async clickVariantUpdate() {
    await this.variantUpdateButton.click();
    await this.page.waitForTimeout(500);
  }

  async closeVariantDrawer() {
    await this.variantDrawerCloseButton
      .click()
      .catch(async () => {
        await this.page.keyboard.press("Escape");
      });
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
    await this.waitForToastToDisappear();
    await this.cleanupOverlays();
    try {
      await this.saveButton.click({ timeout: 5000 });
    } catch {
      await this.saveButton.click({ force: true });
    }
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
