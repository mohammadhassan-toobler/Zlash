class ProductsPage {
  constructor(page) {
    this.page = page;
    this.productsMenu = page.getByText("Products", { exact: true });
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
    this.allStatusFilter = page
      .locator("div")
      .filter({ hasText: /^All Status$/ })
      .nth(2);
    this.progressStateFilter = page
      .locator("div")
      .filter({ hasText: /^Progress Status$/ })
      .nth(2);
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
    await this.productsMenu.click();
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
    await this.searchInput.clear();
  }
  async clickFirstProduct() {
    const cells = this.productRows.nth(0).locator("td");
    await cells.nth(1).click();
  }
  getProductDetailsHeader() {
    return this.productDetailsHeader;
  }
  async navigateToAddProducts() {
    await this.addProductButton().click();
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
    await this.backToProductsListButton.click();
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
    await this.searchInput.fill("_");
  }
  async searchWithEmptyString() {
    await this.searchInput.fill("");
    await this.searchInput.press("Enter");
  }
  async searchWithWhiteSpaces() {
    await this.searchInput.fill("   ");
  }
  async search(text) {
    await this.searchInput.fill(text);
    await this.page.waitForTimeout(1000);
    await this.productRows.first().waitFor();
  }
  async getFirstProductName() {
    return await this.getAllProductRows()
      .first()
      .locator("td")
      .nth(1)
      .textContent();
  }
  async filterByAllStatus(status) {
    await this.allStatusFilter.click();
    // Select the option - this assumes a dropdown/select exists
    await this.page.getByRole("option", { name: status, exact: true }).click();
  }
  async removeClickBlockers() {
    await this.page.evaluate(() => {
      const blockers = document.querySelectorAll(
        '[class*="backdrop"], [class*="overlay"], [class*="loader"], [class*="spinner"]',
      );
      blockers.forEach((el) => el.remove());
    });
  }
  async clearFilter() {
    const button = this.clearFilterButton;
    if ((await button.count()) > 0) {
      await button.click();
    } else {
      throw new Error("Clear filter button not found");
    }
    await this.removeClickBlockers();
  }
  async filterByProogressStatus(status) {
    await this.progressStateFilter.click();
    // Select the option - this assumes a dropdown/select exists
    await this.page.getByRole("option", { name: status, exact: true }).click();
  }
}
export { ProductsPage };
