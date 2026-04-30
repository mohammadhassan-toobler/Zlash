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
  async verifyProductsTable() {
    const productRows = page.locator("table tbody tr");
    await expect(productRows.first()).toBeVisible();
    const totalRows = await productRows.count();
    if (totalRows == 0) {
      test.skip(true, "No products present. Skipping product table test.");
    }
    const products = [];
    for (let i = 0; i < totalRows; i++) {
      const cells = productRows.nth(i).locator("td");
      const productData = {
        name: await cells.nth(1).textContent(),
        price: await cells.nth(2).textContent(),
        progressState: await cells.nth(3).textContent(),
        availablity: await cells.nth(4).textContent(),
        availableUnits: await cells.nth(5).textContent(),
      };
      products.push(productData);
    }
    products.forEach((products) => {
      expect(products.name).toBeDefined();
      expect(products.price).toBeDefined();
      expect(products.progressState).toBeDefined();
      expect(products.availablity).toBeDefined();
      expect(products.availableUnits).toBeDefined();
    });
  }
  async getAllProductsData() {
    const products = [];
    for (let i = 0; i < this.productRows.count; i++) {
      const cells = this.productRows.nth(i).locator("td");
      const productData = {
        name: await cells.nth(1).textContent(),
        price: await cells.nth(2).textContent(),
        status: await cells.nth(3).textContent(),
        availability: await cells.nth(4).textContent(),
      };
      products.push(productData);
    }
    return products;
  }
}
export { ProductsPage };
