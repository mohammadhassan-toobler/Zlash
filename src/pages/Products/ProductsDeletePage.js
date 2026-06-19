// src/pages/Products/ProductsDeletePage.js
//
// Page Object for the Delete Product confirmation dialog.

class ProductsDeletePage {
  constructor(page) {
    this.page = page;

    // Confirmation dialog container (scoped to prevent strict mode violations)
    this.dialogContainer = page
      .locator('[data-scope="dialog"]')
      .filter({ hasText: "Delete Product" })
      .first();

    // Dialog elements
    this.dialogHeader = this.dialogContainer.getByText("Delete Product");
    this.dialogBody = this.dialogContainer.getByText(
      "Are you sure you want to delete this product? This action cannot be undone."
    );
    this.confirmDeleteButton = this.dialogContainer
      .getByRole("button", { name: "Delete", exact: true })
      .first();
    this.cancelDeleteButton = this.dialogContainer
      .getByRole("button", { name: "Cancel" })
      .first();
  }

  getDialogContainer() {
    return this.dialogContainer;
  }

  getDialogHeader() {
    return this.dialogHeader;
  }

  getDialogBody() {
    return this.dialogBody;
  }

  getConfirmDeleteButton() {
    return this.confirmDeleteButton;
  }

  getCancelDeleteButton() {
    return this.cancelDeleteButton;
  }

  async cleanupOverlays() {
    await this.page.evaluate(() => {
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
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

  async safeClick(locator, options = {}) {
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

  /**
   * Click Cancel button in the confirmation dialog.
   */
  async clickCancel() {
    await this.safeClick(this.cancelDeleteButton);
    await this.page.waitForTimeout(400);
  }

  /**
   * Click Delete button in the confirmation dialog.
   */
  async clickDelete() {
    await this.safeClick(this.confirmDeleteButton);
    await this.page.waitForTimeout(400);
  }
}

export { ProductsDeletePage };
