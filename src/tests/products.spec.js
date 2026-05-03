import { test, expect } from "@playwright/test";
import { ProductsPage } from "../pages/ProductsPage";
import { LoginPage } from "../pages/LoginPage";
let productsPage, filteredCount;
test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    test.step("Launch", async () => {
      await page.goto("/");
    });

    productsPage = new ProductsPage(page);
  });
  test("TC001: Verify Products menu exists in sidebar", async ({ page }) => {
    await test.step("Verify the Product Menu", async () => {
      await expect(productsPage.getProductsMenu()).toBeVisible();
    });
  });
  test("TC002: Verify user can navigate to Products page", async ({ page }) => {
    await test.step("Navigate to the Product Menu", async () => {
      await productsPage.navigateToProducts();
    });
    await test.step("Verify that the user is in the Product page. Verifying by the Header", async () => {
      productsPage.getProductListHeader();
    });
  });
});
test.describe.only("Products List Page", () => {
  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await page.goto("/");
    await test.step("Navigate to the Product Menu", async () => {
      await productsPage.navigateToProducts();
    });
  });
  test("TC003: Verify Products page layout and all elements", async ({
    page,
  }) => {
    await test.step("Verify the Search bar is present", async () => {
      await expect(productsPage.getSearchBar()).toBeVisible();
    });
    await test.step("Verify Add Products button exists", async () => {
      await expect(productsPage.getAddProductButton()).toBeVisible();
    });
    await test.step("Verify table headers", async () => {
      for (let header of productsPage.getTableHeaders()) {
        await expect(header).toBeVisible();
      }
    });
  });
  test("TC004: Verify Products table displays all columns", async ({
    page,
  }) => {
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });

    await test.step("Skip the test if there are no products are present", async () => {
      if (productsPage.getAllRowCount() == 0) {
        test.skip(true, "No products present. Skipping product table test.");
      }
    });

    await test.step("Verify that every product has value", async () => {
      const products = await productsPage.getAllProductsData();
      for (const product of products) {
        expect(product.name).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.progressState).toBeDefined();
        expect(product.availability).toBeDefined();
        expect(product.availableUnits).toBeDefined();
      }
    });
  });
  test("TC005: Verify search functionality for products", async ({ page }) => {
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });

    await test.step("Skip the test if there are no products are present", async () => {
      if (productsPage.getAllRowCount() == 0) {
        test.skip(true, "No products present. Skipping product table test.");
      }
    });

    await test.step("Search the Initial Product", async () => {
      await productsPage.searchRandomProduct();
    });

    await test.step("Re-calculate rows after search", async () => {
      filteredCount = productsPage.getAllRowCount();
    });

    await test.step("Verify the search result", async () => {
      for (let i = 0; i < filteredCount; i++) {
        await expect(filteredCount.nth(i).locator("td").nth(1)).toHaveText(
          productsPage.searchRandomProduct(),
        );
      }
    });
  });
  test("TC006: Verify search box can be cleared", async ({ page }) => {
    await test.step("Search the Initial Product", async () => {
      await productsPage.searchRandomProduct();
    });

    await test.step("Re-calculate rows after search", async () => {
      filteredCount = productsPage.getAllRowCount();
    });

    await test.step("Clear the search", async () => {
      await productsPage.clearSearchInput();
    });

    await test.step("Verify the search results cleared", async () => {
      expect(filteredCount).not.toEqual(productsPage.getAllRowCount());
    });
  });
  test("TC007: Verify clicking product navigates to details", async ({
    page,
  }) => {
    await test.step("Click the First Product from the table", async () => {
      productsPage.clickFirstProduct();
    });
    await test.step("Verify that user is in Products detail page", async () => {
      await expect(productsPage.getProductDetailsHeader()).toHaveText(
        "Product Details",
      );
    });
  });
  test.only("TC008: Verify product details are displayed", async ({ page }) => {
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });
    await test.step("Verify product details are displayed", async () => {
      const productName = await productsPage.getProductDetails().productName;
      console.log(productName);
      const productPrice = await productsPage.getProductDetails().productPrice;
      const progressState =
        await productsPage.getProductDetails().progressState;
      const Availability = await productsPage.getProductDetails().Availability;
      await expect(productName).toBeDefined();
      await expect(productPrice).toBeDefined();
      await expect(progressState).toBeDefined();
      await expect(Availability).toBeDefined();
    });
  });
});

test("TC009: Verify back to product list navigation", async ({ page }) => {
  await page.getByRole("link", { name: "Back to Product List" }).click();
  expect(page.locator("h2").filter({ hasText: "Products Lists" }).first());
});
test("TC010: Verify Edit Product button on details page", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: "Edit Product" }),
  ).toBeVisible();
});
test("TC011: Verify products have price values", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Verify the price value
  const productRows = page.locator("table tbody tr");
  const cells = productRows.nth(0).locator("td");
  const productData = {
    price: await cells.nth(2).textContent(),
  };
  products.push(productData);
  productData.forEach((products) => {
    expect(products.price).toBeTruthy();
    expect(products.price).toMatch(/[₹\d]/);
  });
});
test("TC012: Verify products progress status", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Verify the progress status
  const productRows = page.locator("table tbody tr");
  const cells = productRows.nth(0).locator("td");
  const productData = {
    price: await cells.nth(3).textContent(),
  };
  products.push(productData);
  productData.forEach((products) => {
    const status = products.progressStatus?.trim();
    expect(["Draft", "Published", "Rejected", "Under Review"]).toContain(
      status,
    );
  });
});
test("TC013: Verify products availability status", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Verify the progress status
  const productRows = page.locator("table tbody tr");
  const cells = productRows.nth(0).locator("td");
  const productData = {
    price: await cells.nth(4).textContent(),
  };
  products.push(productData);
  productData.forEach((products) => {
    const availability = products.progressStatus?.trim();
    expect(["Available", "Unavailable"]).toContain(availability);
  });
});
test("TC014: Verify Add Products button visible and clickable", async ({
  page,
}) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Verify the Add product button is visible
  await expect(
    page.getByRole("button", { name: "Add Products" }),
  ).toBeVisible();
  // Add Product button is clickable
  expect(page.getByRole("button", { name: "Add Products" }).isEnabled()).toBe(
    true,
  );
});
test("TC015: Verify list consistency after navigation", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Count the total rows
  const productRows = page.locator("table tbody tr");
  const initialRowCount = productRows.count();
  // Click the first product
  const cells = productRows.nth(0).locator("td");
  await cells.nth(1).click();
  // Check whether you are in product detail page or not
  await expect(
    page.getByRole("heading", { name: "Product Details" }),
  ).toBeVisible();
  // Click the Back to Product list
  await page.getByRole("link", { name: "Back to Product List" }).click();
  // Verify that you are in Product list page
  await expect(
    page.getByRole("heading", { name: "Products Lists" }),
  ).toBeVisible();
  // Count the rows after navigation
  await expect(productRows.first()).toBeVisible();
  const finalRowCount = productRows.count();
  // Assert the inital and final row counts
  expect(finalRowCount).toBe(initialRowCount);
});
test("TC016: Verify table column structure", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Count the total columns
  const firstRow = page.locator("table tbody tr").first();
  const cells = firstRow.locator("td");
  const totalColumn = cells.count();
  // Assert the Column count by 6
  expect(totalColumn).toBe(6);
});
test("TC017: Verify product images display", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Get first product image
  const productImage = page
    .locator("table tbody tr")
    .first()
    .locator("img")
    .first();
  // Verify image is visible
  const imageVisible = await productImage.isVisible().catch(() => false);
  expect(imageVisible).toBe(true);
});
test("TC018: Verify pagination/scrolling behavior", async ({ page }) => {});
test("TC019: Verify filter dropdowns visible", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Verify the Status Dropdown is present
  await expect(page.getByText("All Status")).toBeVisible();
  // Verify Progress Status Dropdown is present
  await expect(page.getByText("Progress Status")).toBeVisible();
});
test("TC020: Verify invalid product ID handling", async ({ page }) => {
  await page.goto("http://d1cfp5hosozeex.cloudfront.net/admin/product/897789", {
    waitUntil: "networkidle",
  });
  await expect(
    page.getByText("Data do not exists", { exact: true }).toBeVisible(),
  );
});
test("TC021: Search with special characters (@#$%)", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Search the special characters
  await page.getByPlaceholder("Search Products").fill("@$/");
  await expect(page.getByText("No Data Found", { exact: true })).toBeVisible();
});
test("TC022: Search with empty string", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Search with empty String
  await page.getByPlaceholder("Search Products").fill("");
  await expect(page.getByText("No Data Found", { exact: true })).toBeVisible();
});
test("TC023: Search with whitespace", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Search with white spaces
  await page.getByPlaceholder("Search Products").fill("   ");
  await expect(page.getByText("No Data Found", { exact: true })).toBeVisible();
});
test("TC024: Search case-insensitive", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Count the initial rows
  const productRows = page.locator("table tbody tr");
  const initialRowCount = productRows.count();
  // Search with Upper Cases
  await page.getByPlaceholder("Search Products").fill("CASIO");
  await expect(productRows.first()).toBeVisible();
  // Count after the search
  const finalRowCount = productRows.count();
  expect(finalRowCount).toBeLessThan(initialRowCount);
  // Clear the search
  await page.getByPlaceholder("Search Products").clear();
  // Search with lower Case
  await page.getByPlaceholder("Search Products").fill("casio");
  await expect(productRows.first()).toBeVisible();
  // Count after the search
  const finalRowCount1 = productRows.count();
  expect(finalRowCount1).toBeLessThan(initialRowCount);
  // Clear the search
  await page.getByPlaceholder("Search Products").clear();
  // Search with Mixed Case
  await page.getByPlaceholder("Search Products").fill("CasIo");
  await expect(productRows.first()).toBeVisible();
  // Count after the search
  const finalRowCount2 = productRows.count();
  expect(finalRowCount2).toBeLessThan(initialRowCount);
});
test("TC025: Product name truncation", async ({ page }) => {});
test("TC026: Price formatting consistency", async ({ page }) => {
  // Navigate to products
  productsPage.navigateToProducts();
  // Get the product price
  const productData = productsPage.getAllProductsData();
  productData.forEach((products) => {
    const priceText = products.price?.trim();
    // Price should have currency symbol or number
    expect(priceText).toMatch(/[₹$\d.]/);
  });
});
test("TC027: Availability units format", async ({ page }) => {});
test("TC028: Multiple rows clickable", async ({ page }) => {});
test("TC029: Product details completeness", async ({ page }) => {});
test("TC030: Table scroll behavior", async ({ page }) => {});
test("TC031: Page refresh maintains list", async ({ page }) => {});
test("TC032: Browser back button", async ({ page }) => {});
test("TC033: Product images alt text", async ({ page }) => {});
test("TC034: Add button cursor feedback", async ({ page }) => {});
test("TC035: Table header alignment", async ({ page }) => {});
test("TC036: No console errors", async ({ page }) => {});
test("TC037: Responsive mobile layout", async ({ page }) => {});
test("TC038: Data consistency multi-load", async ({ page }) => {});
test("TC039: Search result accuracy", async ({ page }) => {});
test("TC040: Product click middle rows", async ({ page }) => {});
test("TC041: Rapid product navigation", async ({ page }) => {});
