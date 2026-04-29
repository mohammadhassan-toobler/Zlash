class ProductsPage {
  constructor(page) {
    this.page = page;
    this.productsMenu = page.getByText("Products", { exact: true });
    this.productRows = page.locator("table tbody tr");
    this.cells = this.productRows.locator("td");
  }
  async navigateToProducts() {
    await this.productsMenu.click();
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
