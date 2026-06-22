// src/pages/Products/ProductsPage.js
import { PRODUCTS_SELECTORS } from '../../config/ProductsSelectors';
import { LocatorManager } from '../../utils/LocatorManager';

class ProductsPage {
  constructor(page) {
    this.page = page;
    this.locatorManager = new LocatorManager(page);

    // Raw locators kept for evaluateAll / collection patterns that LocatorManager
    // cannot replace (multi-element scraping, nth indexing).
    this.productRows = page.locator('table tbody tr');
  }

  // ── Element Getters using LocatorManager ───────────────────────────────

  getProductsMenu() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCTS_MENU);
  }

  getProductListHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_LIST_HEADER);
  }

  getAddProductButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ADD_PRODUCT_BUTTON);
  }

  getSearchBar() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.SEARCH_INPUT);
  }

  getAllProductRows() {
    return this.productRows;
  }

  getTableHeaders() {
    const tableHeaders = [
      this.page.getByText('Product Image', { exact: true }),
      this.page.getByText('Name', { exact: true }),
      this.page.getByText('Price', { exact: true }),
      this.page.locator('th:has-text("Progress Status")'),
      this.page.getByText('Availability', { exact: true }),
      this.page.getByText('Available Units', { exact: true }),
    ];
    return tableHeaders;
  }

  getProductDetailsHeader() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_DETAILS_HEADER);
  }

  getEditProductButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.EDIT_PRODUCT_BUTTON);
  }

  getProductImage() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.PRODUCT_IMAGE);
  }

  getallStatusFilter() {
    return this.page.getByRole('combobox').first();
  }

  getProgressStateFilter() {
    return this.page.getByRole('combobox').last();
  }

  getErrorMessage() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.ERROR_MESSAGE);
  }

  get clearFilterButton() {
    return this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.CLEAR_FILTER_BUTTON);
  }

  // ── Navigation ─────────────────────────────────────────────────────────

  async navigateToProducts() {
    try {
      await this.getProductsMenu().click({ force: true, timeout: 3000 });
      await this.page.waitForURL(/\/admin\/product/, { timeout: 2000 });
    } catch {
      await this.page.goto('/admin/product', { waitUntil: 'load' }).catch(() => {});
    }
  }

  async navigateToAddProducts() {
    await this.safeClick(this.getAddProductButton());
  }

  async navigateToInvalidProductId() {
    await this.page.goto('/admin/product/897789', { waitUntil: 'networkidle' });
  }

  async navigateBackToProductsListButton() {
    await this.safeClick(
      this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.BACK_TO_PRODUCTS_LIST)
    );
  }

  // ── Product List Actions ───────────────────────────────────────────────

  async getAllProductsData() {
    await this.productRows.first().waitFor();
    return await this.productRows.evaluateAll((trs) =>
      trs.map((tr) => {
        const tds = tr.querySelectorAll('td');
        return {
          name: tds[1]?.innerText.trim(),
          price: tds[2]?.innerText.trim(),
          progressState: tds[3]?.innerText.trim(),
          availability: tds[4]?.innerText.trim(),
          availableUnits: tds[5]?.innerText.trim(),
        };
      })
    );
  }

  async getAllRowCount() {
    return await this.productRows.count();
  }

  async getColumnCount() {
    const cells = this.productRows.first().locator('td');
    return await cells.count();
  }

  async clickFirstProduct() {
    const cells = this.productRows.nth(0).locator('td');
    await this.safeClick(cells.nth(1));
  }

  async getFirstProductName() {
    return await this.getAllProductRows()
      .first()
      .locator('td')
      .nth(1)
      .textContent();
  }

  async getProductDetailsName() {
    return await this.page.locator('div  dd').nth(0).textContent();
  }

  async getProductDetailsPrice() {
    return await this.page.locator('div  dd').nth(1).textContent();
  }

  async getProductDetailsProgressState() {
    return await this.page.locator('div  dd').nth(4).textContent();
  }

  async getProductDetailsAvailability() {
    return await this.page.locator('div  dd').nth(3).textContent();
  }

  // ── Search ─────────────────────────────────────────────────────────────

  async searchRandomProduct() {
    const cells = this.productRows.nth(1).locator('td');
    const initialProduct = await cells.nth(1).textContent();
    await this.getSearchBar().fill(initialProduct);
    await this.getSearchBar().press('Enter');
    await this._waitForTableFilter(initialProduct);
    await this.page.waitForTimeout(500);
    return initialProduct;
  }

  async clearSearchInput() {
    await this.getSearchBar().clear();
  }

  async search(text) {
    const searchBar = this.getSearchBar();
    await this.safeClick(searchBar);
    try {
      await searchBar.fill(text);
    } catch {
      await this.safeClick(searchBar);
      await searchBar.fill(text);
    }
    try {
      await searchBar.press('Enter');
    } catch {
      await searchBar.press('Enter');
    }
    await this._waitForTableFilter(text);
    await this.page.waitForTimeout(500);
  }

  async searchWithSpecialCharacter() {
    const searchBar = this.getSearchBar();
    await this.safeClick(searchBar);
    await searchBar.fill('@#$%');
    await searchBar.press('Enter');
    await this.page.waitForTimeout(500);
  }
getSearchValidationMessage() {
  return this.page.getByText(
    "Search query must contain at least one alphanumeric character",
    { exact: true }
  );
}
  async searchWithEmptyString() {
    const bar = this.getSearchBar();
    await bar.fill('');
    await bar.press('Enter');
  }

  async searchWithWhiteSpaces() {
    const searchBar = this.getSearchBar();
    await this.safeClick(searchBar);
    await searchBar.fill('   ');
    await searchBar.press('Enter');
    await this._waitForTableFilter('   ');
    await this.page.waitForTimeout(500);
  }

  /** Internal: wait for the table to reflect a search/filter change */
  async _waitForTableFilter(text) {
    await Promise.race([
      this.page.waitForFunction(
        (t) => {
          const el = document.querySelector('table tbody tr td:nth-child(2)');
          return el && el.innerText.toLowerCase().includes(t.toLowerCase());
        },
        text,
        { timeout: 25000 }
      ),
      this.page.locator('text=No Data Found').waitFor({ state: 'visible', timeout: 25000 }),
    ]).catch(() => {});
  }

  // ── Filters ────────────────────────────────────────────────────────────

  async filterByAllStatus(status) {
    await this.safeClick(this.getallStatusFilter());
    await this.getallStatusFilter().press('ArrowDown').catch(() => {});
    await this.safeClick(this.page.getByRole('option', { name: status, exact: true }));
    await Promise.race([
      this.page.waitForFunction(
        (s) => {
          const el = document.querySelector('table tbody tr td:nth-child(5)');
          return el && el.innerText.trim().toLowerCase() === s.toLowerCase();
        },
        status,
        { timeout: 25000 }
      ),
      this.page.locator('text=No Data Found').waitFor({ state: 'visible', timeout: 25000 }),
    ]).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async filterByProogressStatus(status) {
    await this.removeClickBlockers();
    await this.waitForToastToDisappear();
    const filter = this.getProgressStateFilter();
    await filter.scrollIntoViewIfNeeded().catch(() => {});
    await this.safeClick(filter);
    await filter.press('ArrowDown').catch(() => {});
    await this.safeClick(this.page.getByRole('option', { name: status, exact: true }));
    await Promise.race([
      this.page.waitForFunction(
        (s) => {
          const el = document.querySelector('table tbody tr td:nth-child(4)');
          return el && el.innerText.trim().toLowerCase() === s.toLowerCase();
        },
        status,
        { timeout: 25000 }
      ),
      this.page.locator('text=No Data Found').waitFor({ state: 'visible', timeout: 25000 }),
    ]).catch(() => {});
    await this.page.waitForTimeout(500);
  }

  async clearFilter() {
    const button = this.locatorManager.getResilientLocator(PRODUCTS_SELECTORS.CLEAR_FILTER_BUTTON);
    if ((await button.count()) > 0) {
      await this.safeClick(button);
    } else {
      throw new Error('Clear filter button not found');
    }
    await this.removeClickBlockers();
  }

  // ── Overlay / Interaction Helpers ──────────────────────────────────────

  async removeClickBlockers() {
    await this.page.evaluate(() => {
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
      const blockers = document.querySelectorAll(
        '[class*="backdrop"], [class*="overlay"], [class*="loader"], [class*="spinner"]'
      );
      blockers.forEach((el) => el.remove());
    });
  }

  async cleanupOverlays() {
    await this.page.evaluate(() => {
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
      document.querySelectorAll('.css-1yooxd2').forEach((el) => {
        el.style.pointerEvents = 'none';
      });
    }).catch(() => {});
  }

  async waitForToastToDisappear() {
    await this.page.evaluate(() => {
      document.querySelectorAll('[data-scope="toast"][data-part="root"]').forEach((el) => {
        el.style.pointerEvents = 'none';
        el.style.display = 'none';
      });
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
}

export { ProductsPage };
