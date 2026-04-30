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
    const products = [];
    for (let i = 0; i < this.productRows.count(); i++) {
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
  async searchRandomProduct() {
    const cells = this.productRows.nth(1).locator("td");
    const initialProduct = await cells.nth(1).textContent();
    // Search the initial Product
    await this.searchInput.fill(initialProduct);
    return initialProduct;
  }
  async getAllRowCount() {
    await this.productRows.count();
  }
  async clearSearchInput() {
    await this.searchInput.clear();
  }
  async clickFirstProduct() {
    const productRows = page.locator("table tbody tr");
    const cells = productRows.nth(0).locator("td");
    await cells.nth(1).click();
  }
  getProductDetailsHeader() {
    return this.productDetailsHeader;
  }
  async navigateToAddProducts() {
    await this.addProductButton().click();
  }
}
export { ProductsPage };
