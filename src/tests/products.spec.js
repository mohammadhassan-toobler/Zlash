import { test, expect } from "@playwright/test";
import { ProductsPage } from "../pages/ProductsPage";
let productsPage, filteredCount;
test.describe("Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await test.step("Launch", async () => {
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
  test("TC020: Verify invalid product ID handling", async ({ page }) => {
    await test.step("Navigate to invalid product id", async () => {
      await productsPage.navigateToInvalidProductId();
    });
    await test.step("Verify the error message appears or not", async () => {
      await expect(productsPage.getErrorMessage()).toBeVisible();
    });
  });
});
test.describe("Products List Page", () => {
  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await page.goto("/");
    await test.step("Navigate to the Product Menu", async () => {
      await productsPage.navigateToProducts();
    });
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
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

  test("TC007: Verify clicking product navigates to details", async ({
    page,
  }) => {
    await test.step("Click the First Product from the table", async () => {
      await productsPage.clickFirstProduct();
    });
    await test.step("Verify that user is in Products detail page", async () => {
      await expect(productsPage.getProductDetailsHeader()).toHaveText(
        "Product Details",
      );
    });
  });

  test("TC011: Verify products have price values", async ({ page }) => {
    await test.step("Verify the price is present", async () => {
      const products = await productsPage.getAllProductsData();
      for (const product of products) {
        expect(product.price).toBeTruthy();
        expect(product.price).toMatch(/[₹\d]/);
      }
    });
  });

  test("TC012: Verify products progress status", async ({ page }) => {
    await test.step("Verify the availability status", async () => {
      const products = await productsPage.getAllProductsData();
      for (const product of products) {
        const status = product.progressState?.trim();
        expect(["Draft", "Published", "Rejected", "Under Review"]).toContain(
          status,
        );
      }
    });
  });

  test("TC013: Verify products availability status", async ({ page }) => {
    await test.step("Verify the availability status", async () => {
      const products = await productsPage.getAllProductsData();
      for (const product of products) {
        const availability = product.availability?.trim();
        expect(["Available", "Unavailable"]).toContain(availability);
      }
    });
  });

  test("TC014: Verify Add Products button visible and clickable", async ({
    page,
  }) => {
    await test.step("Verify the Add product button is visible", async () => {
      await expect(productsPage.getAddProductButton()).toBeVisible();
    });

    await test.step("Add Product button is clickable", async () => {
      expect(await productsPage.getAddProductButton().isEnabled()).toBe(true);
    });
  });

  test("TC016: Verify table column structure", async ({ page }) => {
    await test.step("Assert there are 6 colums", async () => {
      expect(await productsPage.getColumnCount()).toBe(6);
    });
  });

  test("TC017: Verify product images display", async ({ page }) => {
    await test.step("Verify product images display", async () => {
      const imageVisible = await productsPage
        .getProductImage()
        .isVisible()
        .catch(() => false);
      expect(imageVisible).toBe(true);
    });
  });

  test("TC026: Price formatting consistency", async ({ page }) => {
    const products = await productsPage.getAllProductsData();
    for (let product of products) {
      expect(product.price).toMatch(/[₹$\d.]/);
    }
  });
});
test.describe("Products Detail Page", async () => {
  let initialRowCount;
  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await page.goto("/");
    await test.step("Navigate to the Product Menu", async () => {
      await productsPage.navigateToProducts();
    });
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });
    await test.step("Count rows before clicking the first product", async () => {
      initialRowCount = await productsPage.getAllRowCount();
      return initialRowCount;
    });
    await test.step("Click the First Product from the table", async () => {
      await productsPage.clickFirstProduct();
    });
    await test.step("Verify that user is in Products detail page", async () => {
      await expect(productsPage.getProductDetailsHeader()).toHaveText(
        "Product Details",
      );
    });
  });
  test("TC008: Verify product details are displayed", async ({ page }) => {
    await test.step("Verify product details are displayed", async () => {
      const productName = await productsPage.getProductDetailsName();
      const productPrice = await productsPage.getProductDetailsPrice();
      const progressState = await productsPage.getProductDetailsProgressState();
      const Availability = await productsPage.getProductDetailsAvailability();
      expect(productName).toBeDefined();
      expect(productPrice).toBeDefined();
      expect(progressState).toBeDefined();
      expect(Availability).toBeDefined();
    });
  });
  test("TC009: Verify back to product list navigation", async ({ page }) => {
    await test.step("Click the Back to Product List Button", async () => {
      await productsPage.navigateBackToProductsListButton();
    });
    await test.step("Verify that the user navigated to the Products list page", async () => {
      expect(productsPage.getProductListHeader());
    });
  });
  test("TC010: Verify Edit Product button on details page", async ({
    page,
  }) => {
    await test.step("Verify Edit Product button on details page", async () => {
      await expect(productsPage.getEditProductButton()).toBeVisible();
    });
  });
  test("TC015: Verify list consistency after navigation", async ({ page }) => {
    let finalRowCount;
    await test.step("Click the Back to Product List Button", async () => {
      await productsPage.navigateBackToProductsListButton();
    });
    await test.step("Verify that the user is in product list page", async () => {
      await expect(productsPage.getProductListHeader()).toBeVisible();
    });
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });
    await test.step("Count rows after coming back to Product List page", async () => {
      finalRowCount = await productsPage.getAllRowCount();
    });
    await test.step("Verify the count is correct", async () => {
      expect(finalRowCount).toBe(initialRowCount);
    });
  });
});
test.describe("Filters", async () => {
  let products, filteredCount;
  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await test.step("Launch", async () => {
      await page.goto("/");
    });
    await test.step("Navigate to the Product Menu", async () => {
      await productsPage.navigateToProducts();
    });
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });
    await test.step("Get the product Data", async () => {
      products = await productsPage.getAllProductsData();
      return await products;
    });
  });

  test("TC005: Verify search functionality for products", async () => {
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

  test("TC006: Verify search box can be cleared", async () => {
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

  test("TC019: Verify filter dropdowns visible", async () => {
    await test.step("Verify the Status Dropdown is present", async () => {
      await expect(productsPage.getallStatusFilter()).toBeVisible();
    });
    await test.step("Verify Progress status filter is present", async () => {
      await expect(productsPage.getProgressStateFilter()).toBeVisible();
    });
  });

  test("TC021: Search with special characters (@#$%)", async () => {
    // Search the special characters
    await test.step("Search with special Character", async () => {
      await productsPage.searchWithSpecialCharacter();
    });
    await test.step("Assert the filtered values", async () => {
      for (let product of products) {
        expect(product.name).toContain("_");
      }
    });
  });

  test("TC022: Search with empty string", async () => {
    await test.step("Search with empty String", async () => {
      await productsPage.searchWithEmptyString();
    });
    await test.step("Verify the empty string searches anything", async () => {});
    const filteredProducts = await productsPage.getAllProductsData();
    expect(filteredProducts).toEqual(products);
  });

  test("TC023: Search with whitespace", async ({ page }) => {
    await test.step("Search with white spaces", async () => {
      await productsPage.searchWithWhiteSpaces();
    });
    await test.step("Verify the search results", async () => {
      const filteredProducts = await productsPage.getAllProductsData();
      expect(filteredProducts).toEqual(products);
    });
  });
  test("TC024: Search case-insensitive", async ({ page }) => {
    let upperResult, lowerResult, mixedResult;
    const productName = "iphone";
    await test.step("Search with the Upper cases", async () => {
      await productsPage.search(productName.toUpperCase());
    });
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });
    await test.step("Store the first product", async () => {
      upperResult = await productsPage.getFirstProductName();
    });
    await test.step("Clear the search", async () => {
      await productsPage.clearSearchInput();
    });
    await test.step("Search with lower case", async () => {
      await productsPage.search(productName.toLowerCase());
    });
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });
    await test.step("Store the first product", async () => {
      lowerResult = await productsPage.getFirstProductName();
    });
    await test.step("Clear the search", async () => {
      await productsPage.clearSearchInput();
    });
    await test.step("Search with mixed case", async () => {
      await productsPage.search("IpHoNe");
    });
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });
    await test.step("Store the first product", async () => {
      mixedResult = await productsPage.getFirstProductName();
    });
    await test.step("Assert the rows", async () => {
      expect(upperResult).toBe(lowerResult);
      expect(lowerResult).toBe(mixedResult);
    });
  });
  test("TC066: Product availability filtering", async ({ page }) => {
    await test.step("Select the Status by Available", async () => {
      await productsPage.filterByAllStatus("Available");
    });
    await test.step("Assert the values", async () => {
      await expect
        .poll(async () => {
          const data = await productsPage.getAllProductsData();
          return (
            data.length > 0 && data.every((p) => p.availability === "Available")
          );
        })
        .toBe(true);
    });
  });
  test("TC081: Product progress state filtering", async ({ page }) => {
    await test.step("Select the Status by Available", async () => {
      await productsPage.filterByProogressStatus("Draft");
    });
    await test.step("Assert the values", async () => {
      await expect
        .poll(async () => {
          const data = await productsPage.getAllProductsData();
          return (
            data.length > 0 && data.every((p) => p.progressState === "Draft")
          );
        })
        .toBe(true);
    });
  });
});

test("TC018: Verify pagination/scrolling behavior", async ({ page }) => {});

test("TC025: Product name truncation", async ({ page }) => {});

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
