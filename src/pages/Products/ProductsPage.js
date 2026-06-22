class ProductsPage {
  constructor(page) {
    this.page = page;
    this.productsMenu = page.getByRole("link", { name: "Products", exact: true });
    this.productListHeader = page.locator(
      "heading[level='2']:has-text('Products')",
    );
    this.productRows = page.locator("table tbody tr");
    this.cells = this.productRows.locator("td");

    this.addProductButton = page.getByRole("button", { name: "Add Products" });
    this.searchInput = page.getByPlaceholder("Search Products");
    this.productDetailsHeader = page.getByRole("heading", {
      name: "Product Details",
    });
    this.productNameData = page.locator("div  dd").nth(0);
    this.productPriceData = page.locator("div  dd").nth(1);
    this.progressStateData = page.locator("div  dd").nth(4);
    this.availabilityData = page.locator("div  dd").nth(3);
    this.backToProductsListButton = page.getByText("Back to Product List");
    this.productListHeader = page
      .locator("h2")
      .filter({ hasText: "Products Lists" })
      .first();
    this.EditProductButton = page.getByRole("button", {
      name: "Edit Product",
    });
    this.productImage = this.productRows.locator("img");
    this.allStatusFilter = page.getByRole("combobox").first();
    this.progressStateFilter = page.getByRole("combobox").last();
    this.errorMessage = page.getByText("Data do not exists", { exact: true });
    this.clearFilterButton = page.getByLabel("Clear selected options");
  }

  getProductsMenu() {
    return this.productsMenu;
  }
  getProductListHeader() {
    return this.productListHeader;
  }
  getAddProductButton() {
    return this.addProductButton;
  }
  getSearchBar() {
    return this.searchInput;
  }
  getAllProductRows() {
    return this.productRows;
  }
  getTableHeaders() {
    const tableHeaders = [
      this.page.getByText("Product Image", { exact: true }),
      this.page.getByText("Name", { exact: true }),
      this.page.getByText("Price", { exact: true }),
      this.page.locator('th:has-text("Progress Status")'),
      this.page.getByText("Availability", { exact: true }),
      this.page.getByText("Available Units", { exact: true }),
    ];
    return tableHeaders;
  }
  async navigateToProducts() {
    try {
      await this.productsMenu.click({ force: true, timeout: 3000 });
      await this.page.waitForURL(/\/admin\/product/, { timeout: 2000 });
    } catch {
      await this.page.goto("/admin/product", { waitUntil: "load" }).catch(() => {});
    }
  }
  async getAllProductsData() {
    await this.productRows.first().waitFor();

    return await this.productRows.evaluateAll((trs) =>
      trs.map((tr) => {
        const tds = tr.querySelectorAll("td");
        return {
          name: tds[1]?.innerText.trim(),
          price: tds[2]?.innerText.trim(),
          progressState: tds[3]?.innerText.trim(),
          availability: tds[4]?.innerText.trim(),
          availableUnits: tds[5]?.innerText.trim(),
        };
      }),
    );
  }
  async searchRandomProduct() {
    const cells = this.productRows.nth(1).locator("td");
    const initialProduct = await cells.nth(1).textContent();
    // Search the initial Product
    await this.searchInput.fill(initialProduct);
    await this.searchInput.press("Enter");
    // Wait for the table to filter
    await Promise.race([
      this.page.waitForFunction(
        (t) => {
          const el = document.querySelector('table tbody tr td:nth-child(2)');
          return el && el.innerText.toLowerCase().includes(t.toLowerCase());
        },
        initialProduct,
        { timeout: 25000 }
      ),
      this.page.locator('text=No Data Found').waitFor({ state: 'visible', timeout: 25000 })
    ]).catch(() => {});
    await this.page.waitForTimeout(500);
    return initialProduct;
  }
  async getAllRowCount() {
    return await this.productRows.count();
  }
  async getColumnCount() {
    const cells = this.productRows.first().locator("td");
    return await cells.count();
  }

  async clearSearchInput() {
    await this.page.getByPlaceholder("Search Products").clear();
  }
  async clickFirstProduct() {
    const cells = this.productRows.nth(0).locator("td");
    await this.safeClick(cells.nth(1));
  }
  getProductDetailsHeader() {
    return this.productDetailsHeader;
  }
  async navigateToAddProducts() {
    await this.safeClick(this.addProductButton);
  }
  async getProductDetailsName() {
    const productName = await this.productNameData.textContent();
    return productName;
  }
  async getProductDetailsPrice() {
    const productPrice = await this.productPriceData.textContent();
    return productPrice;
  }
  async getProductDetailsProgressState() {
    const progressState = await this.progressStateData.textContent();
    return progressState;
  }
  async getProductDetailsAvailability() {
    const Availability = await this.availabilityData.textContent();
    return Availability;
  }
  async navigateBackToProductsListButton() {
    await this.safeClick(this.backToProductsListButton);
  }
  getEditProductButton() {
    return this.EditProductButton;
  }
  getProductImage() {
    return this.productImage.first();
  }
  getallStatusFilter() {
    return this.allStatusFilter;
  }
  getProgressStateFilter() {
    return this.progressStateFilter;
  }
  getErrorMessage() {
    return this.errorMessage;
  }
  async navigateToInvalidProductId() {
    await this.page.goto("/admin/product/897789", {
      waitUntil: "networkidle",
    });
  }
  async searchWithSpecialCharacter() {
    const searchInput = this.page.getByPlaceholder("Search Products");
    await searchInput.fill("_");
  }
  async searchWithEmptyString() {
    const searchInput = this.page.getByPlaceholder("Search Products");
    await searchInput.fill("");
    await searchInput.press("Enter");
  }
  async searchWithWhiteSpaces() {
    const searchInput = this.page.getByPlaceholder("Search Products");
    await searchInput.fill("   ");
  }
  async search(text) {
    const getSearchInput = () => this.page.getByPlaceholder("Search Products");
    await this.safeClick(getSearchInput());
    
    try {
      await getSearchInput().fill(text);
    } catch {
      await this.safeClick(getSearchInput());
      await getSearchInput().fill(text);
    }
    
    try {
      await getSearchInput().press("Enter");
    } catch {
      await getSearchInput().press("Enter");
    }
    
    // Wait for the table to filter: either the first row has the search text,
    // or the "No Data Found" message appears.
    await Promise.race([
      this.page.waitForFunction(
        (t) => {
          const el = document.querySelector('table tbody tr td:nth-child(2)');
          return el && el.innerText.toLowerCase().includes(t.toLowerCase());
        },
        text,
        { timeout: 25000 }
      ),
      this.page.locator('text=No Data Found').waitFor({ state: 'visible', timeout: 25000 })
    ]).catch(() => {});
    await this.page.waitForTimeout(500);
  }
  async getFirstProductName() {
    return await this.getAllProductRows()
      .first()
      .locator("td")
      .nth(1)
      .textContent();
  }
  async filterByAllStatus(status) {
    await this.safeClick(this.allStatusFilter);
    await this.allStatusFilter.press("ArrowDown").catch(() => {});
    await this.safeClick(this.page.getByRole("option", { name: status, exact: true }));
    // Wait for the filter to apply: either a row availability matches, or "No Data Found" appears.
    await Promise.race([
      this.page.waitForFunction(
        (s) => {
          const el = document.querySelector('table tbody tr td:nth-child(5)');
          return el && el.innerText.trim().toLowerCase() === s.toLowerCase();
        },
        status,
        { timeout: 25000 }
      ),
      this.page.locator('text=No Data Found').waitFor({ state: 'visible', timeout: 25000 })
    ]).catch(() => {});
    await this.page.waitForTimeout(500);
  }
  async removeClickBlockers() {
    await this.page.evaluate(() => {
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
      const blockers = document.querySelectorAll(
        '[class*="backdrop"], [class*="overlay"], [class*="loader"], [class*="spinner"]',
      );
      blockers.forEach((el) => el.remove());
    });
  }
  async cleanupOverlays() {
    await this.page.evaluate(() => {
      document.documentElement.style.pointerEvents = '';
      document.body.style.pointerEvents = '';
      
      // Category dropdown overlays
      document.querySelectorAll(".css-1yooxd2").forEach((el) => {
        el.style.pointerEvents = "none";
      });
    }).catch(() => {});
  }
  async waitForToastToDisappear() {
    await this.page.evaluate(() => {
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
  async clearFilter() {
    const button = this.clearFilterButton;
    if ((await button.count()) > 0) {
      await this.safeClick(button);
    } else {
      throw new Error("Clear filter button not found");
    }
    await this.removeClickBlockers();
  }
  async filterByProogressStatus(status) {
    await this.removeClickBlockers();
    await this.waitForToastToDisappear();
    // Scroll the combobox into view before interacting
    await this.progressStateFilter.scrollIntoViewIfNeeded().catch(() => {});
    await this.safeClick(this.progressStateFilter);
    await this.progressStateFilter.press("ArrowDown").catch(() => {});
    await this.safeClick(this.page.getByRole("option", { name: status, exact: true }));
    // Wait for the filter to apply: either a row progress status matches, or "No Data Found" appears.
    await Promise.race([
      this.page.waitForFunction(
        (s) => {
          const el = document.querySelector('table tbody tr td:nth-child(4)');
          return el && el.innerText.trim().toLowerCase() === s.toLowerCase();
        },
        status,
        { timeout: 25000 }
      ),
      this.page.locator('text=No Data Found').waitFor({ state: 'visible', timeout: 25000 })
    ]).catch(() => {});
    await this.page.waitForTimeout(500);
  }
}
export { ProductsPage };
