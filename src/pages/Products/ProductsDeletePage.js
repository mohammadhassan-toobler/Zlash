// src/pages/Products/ProductsDeletePage.js
//
// Page Object for the Delete Product confirmation dialog.

import { PRODUCTS_SELECTORS } from '../../config/ProductsSelectors';
import { LocatorManager } from '../../utils/LocatorManager';

class ProductsDeletePage {
  constructor(page) {
    this.page = page;
    this.locatorManager = new LocatorManager(page);

    // Confirmation dialog scoped container — kept raw to scope child locators
    this.dialogContainer = page
      .locator('[data-scope="dialog"]')
      .filter({ hasText: 'Delete Product' })
      .first();
  }

  // ── Element Getters using LocatorManager ──────────────────────────────

  getDialogContainer() {
    return this.dialogContainer;
  }

  getDialogHeader() {
    return this.dialogContainer.getByText('Delete Product');
  }

  getDialogBody() {
    return this.dialogContainer.getByText(
      'Are you sure you want to delete this product? This action cannot be undone.'
    );
  }

  getConfirmDeleteButton() {
    return this.dialogContainer
      .getByRole('button', { name: 'Delete', exact: true })
      .first();
  }

  getCancelDeleteButton() {
    return this.dialogContainer.getByRole('button', { name: 'Cancel' }).first();
  }

  // ── Interaction Helpers ───────────────────────────────────────────────

  async cleanupOverlays() {
    await this.page.evaluate(() => {
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
      document.querySelectorAll('.css-1yooxd2').forEach((el) => {
        el.style.pointerEvents = 'none';
      });
      document
        .querySelectorAll('[data-scope="dialog"][data-part="backdrop"]')
        .forEach((el) => {
          el.style.pointerEvents = 'none';
          el.style.display = 'none';
        });
    });
  }

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
   * Click Cancel button in the confirmation dialog.
   */
  async clickCancel() {
    await this.safeClick(this.getCancelDeleteButton());
    await this.page.waitForTimeout(400);
  }

  /**
   * Click Delete button in the confirmation dialog.
   */
  async clickDelete() {
    await this.safeClick(this.getConfirmDeleteButton());
    await this.page.waitForTimeout(400);
  }
}

export { ProductsDeletePage };
