// src/tests/Products/delete-products.spec.js
//
// E2E Regression Suite — Delete Product
//
// Prerequisite:
//   A product is dynamically created at the start of the suite using the same 
//   happy path logic as TC:089 to ensure repeatability and clean state.
//
// Test IDs:
//   TC:117 – TC:123, TC:120 (Delete Product Suite)

import { test, expect } from "../../fixtures/baseTest";
import { ProductsPage } from "../../pages/Products/ProductsPage";
import { ProductsCreatePage } from "../../pages/Products/ProductsCreatePage";
import { ProductsEditPage } from "../../pages/Products/ProductsEditPage";
import { ProductsDeletePage } from "../../pages/Products/ProductsDeletePage";
import * as allure from "allure-js-commons";
import path from "path";

let productsPage, productsCreatePage, productsEditPage, productsDeletePage;
let createdProductId;
let createdProductName;
let initialRowCount;

// Helper to create a product using the exact TC:089 logic
async function createProductForTesting(page) {
  productsPage = new ProductsPage(page);
  productsCreatePage = new ProductsCreatePage(page);
  
  await page.goto("/");
  await test.step("Navigate to the Product Menu", async () => {
    await productsPage.navigateToProducts();
  });
  await test.step("Verify the Add product button is visible ", async () => {
    await expect(productsPage.getAddProductButton()).toBeVisible();
  });
  await test.step("Verify the Add product button is working ", async () => {
    await productsPage.navigateToAddProducts();
  });
  await test.step("Verify that user is in Add product page", async () => {
    await page.waitForLoadState("networkidle");
    await expect(productsCreatePage.getAddProductHeader()).toBeVisible();
  });

  // Tab 1: Category & Media
  await test.step("Upload product image", async () => {
    const filePath = path.join(
      process.cwd(),
      "src",
      "test-data",
      "images",
      "Product-Shirt-1.jpeg"
    );
    await productsCreatePage.uploadProductImage(filePath);
  });
  await test.step("Verify image uploaded", async () => {
    await expect(productsCreatePage.getUploadedProductImage()).toBeVisible();
  });
  await test.step("Choose a Category", async () => {
    await productsCreatePage.chooseCategory("Fashion & Apparel");
  });
  await test.step("Click continue to Identity tab", async () => {
    await productsCreatePage.clickContinueButton();
  });

  // Tab 2: Identity
  await test.step("Verify user is in Tab 2", async () => {
    await expect(productsCreatePage.getProductIdentityHeader()).toBeVisible();
  });
  await test.step("Add Product Name", async () => {
    await productsCreatePage.fillProductName();
  });
  await test.step("Toggle on the Brand Name Toggle", async () => {
    await productsCreatePage.switchBrandNameToggle();
  });
  await test.step("Fill brand name", async () => {
    await productsCreatePage.fillBrandName();
  });
  await test.step("Click continue to Details tab", async () => {
    await productsCreatePage.clickContinueButton();
  });

  // Tab 3: Details
  await test.step("Verify user is in Tab 3", async () => {
    await expect(productsCreatePage.getproductDetailsHeader()).toBeVisible();
  });
  await test.step("Fill All the Details in product details tab", async () => {
    await productsCreatePage.fillProductDetails();
  });
  await test.step("Click continue to Attributes tab", async () => {
    await productsCreatePage.clickContinueButton();
  });

  // Tab 4: Attributes
  await test.step("Verify user is in Tab 4", async () => {
    await expect(productsCreatePage.getproductsAttributeHeader()).toBeVisible();
  });
  await test.step("Switch on the product Variant toggle", async () => {
    await productsCreatePage.switchVariantToggle();
  });
  await test.step("Click the Variant type button", async () => {
    await productsCreatePage.clickVariantType();
  });
  await test.step("Select and save variants", async () => {
    await productsCreatePage.selectVariant();
  });
  await test.step("Click the Add a Variant button", async () => {
    await productsCreatePage.clickAddVariantButton();
  });
  await test.step("Add All the variant details", async () => {
    await productsCreatePage.addVariantDetails();
    const filePath = path.join(
      process.cwd(),
      "src",
      "test-data",
      "images",
      "Variant-Image.jpeg"
    );
    await productsCreatePage.uploadVariantImage(filePath);
  });
  await test.step("Add the product discount", async () => {
    await productsCreatePage.addDiscount();
  });

  // Tab 5: Options
  await test.step("Verify user is in Tab 5", async () => {
    await expect(productsCreatePage.getProductOptionsHeader()).toBeVisible();
  });
  await test.step("Enable all product options toggles", async () => {
    await productsCreatePage.enableAllProductOptionsToggles();
  });
  await test.step("Save the Product", async () => {
    await productsCreatePage.clickContinueButton();
  });

  // Wait for redirect to products list page
  await test.step("Wait for redirect to products list page", async () => {
    await page.waitForURL(/\/admin\/product/, { timeout: 20000 });
  });

  const name = productsCreatePage._productName;

  // Search for the newly created product to get its ID
  await test.step("Search for the created product in list", async () => {
    await productsPage.search(name);
  });

  await test.step("Click the created product to open details", async () => {
    await productsPage.clickFirstProduct();
  });

  await test.step("Wait for navigation to details page", async () => {
    await page.waitForURL(/\/admin\/product\/\d+/, { timeout: 15000 });
  });

  const url = page.url();
  const id = url.split("/").pop();
  console.log(`Successfully created test product ID: ${id}, Name: ${name}`);
  return { id, name };
}

test.beforeAll(() => {
  allure.feature("Products Module");
});

test.describe("Delete Product Regression Suite", () => {
  let context, setupPage;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180000);
    context = await browser.newContext({
      storageState: "storageState.json",
      baseURL: process.env.BASE_URL,
    });
    setupPage = await context.newPage();
    
    const productsPageSetup = new ProductsPage(setupPage);
    
    // Store row count before deletion testing begins
    await setupPage.goto("/");
    await productsPageSetup.navigateToProducts();
    await setupPage.waitForURL(/\/admin\/product/);
    await setupPage.waitForLoadState("networkidle").catch(() => {});
    await expect(productsPageSetup.getAddProductButton()).toBeVisible({ timeout: 20000 });
    await productsPageSetup.getAllProductRows().first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    initialRowCount = await productsPageSetup.getAllRowCount();
    console.log(`Initial product row count: ${initialRowCount}`);

    // Create the test product
    const product = await createProductForTesting(setupPage);
    createdProductId = product.id;
    createdProductName = product.name;
  });

  test.afterAll(async () => {
    if (context) {
      await context.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    allure.owner("Hassan");
    productsPage = new ProductsPage(page);
    productsCreatePage = new ProductsCreatePage(page);
    productsEditPage = new ProductsEditPage(page);
    productsDeletePage = new ProductsDeletePage(page);
  });

  test("TC:117 - Verify that the Delete section and button are visible on Tab 5", async ({ page }) => {
    allure.story("Delete Product UI");
    
    await test.step("Navigate to the edit wizard page directly", async () => {
      await productsEditPage.navigateDirectlyToEditProduct(createdProductId);
    });

    await test.step("Navigate to Product Options Tab 5", async () => {
      await productsEditPage.clickTab("Product Options");
      await expect(productsEditPage.getProductOptionsHeader()).toBeVisible();
    });

    await test.step("Verify Delete Product section elements are visible", async () => {
      await expect(productsEditPage.getDeleteProductLabel()).toBeVisible();
      await expect(productsEditPage.getDeleteProductButton()).toBeVisible();
    });
  });

  test("TC:118 - Verify clicking Delete button opens confirmation dialog and clicking Cancel aborts deletion", async ({ page }) => {
    allure.story("Delete Product UI");

    await test.step("Navigate to the edit page and click Tab 5", async () => {
      await productsEditPage.navigateDirectlyToEditProduct(createdProductId);
      await productsEditPage.clickTab("Product Options");
    });

    await test.step("Click Delete button on Tab 5", async () => {
      await productsEditPage.clickDeleteProductButton();
    });

    await test.step("Verify confirmation dialog is open", async () => {
      await expect(productsDeletePage.getDialogContainer()).toBeVisible();
      await expect(productsDeletePage.getDialogHeader()).toBeVisible();
      await expect(productsDeletePage.getDialogBody()).toBeVisible();
    });

    await test.step("Click Cancel in confirmation dialog", async () => {
      await productsDeletePage.clickCancel();
    });

    await test.step("Verify dialog is closed and page remains in Edit mode", async () => {
      await expect(productsDeletePage.getDialogContainer()).not.toBeVisible();
      await expect(productsEditPage.getEditProductPageHeader()).toBeVisible();
    });
  });

  test("TC:121 - Verify that pressing the Escape key when the Delete confirmation dialog is open cancels the deletion", async ({ page }) => {
    allure.story("Delete Product UI");

    await test.step("Navigate to Tab 5", async () => {
      await productsEditPage.navigateDirectlyToEditProduct(createdProductId);
      await productsEditPage.clickTab("Product Options");
    });

    await test.step("Click Delete to open dialog", async () => {
      await productsEditPage.clickDeleteProductButton();
    });

    await test.step("Verify dialog visible", async () => {
      await expect(productsDeletePage.getDialogContainer()).toBeVisible();
    });

    await test.step("Press Escape key", async () => {
      await page.keyboard.press("Escape");
    });

    await test.step("Verify dialog is dismissed", async () => {
      await expect(productsDeletePage.getDialogContainer()).not.toBeVisible();
      await expect(productsEditPage.getEditProductPageHeader()).toBeVisible();
    });
  });

  test("TC:120 - Negative: Verify delete product operation handling when API fails", async ({ page }) => {
    allure.story("Delete Product API Error");

    // Intercept DELETE request to product endpoint and mock a 500 server error
    await page.route(new RegExp(`/api/v1/product/${createdProductId}`), async (route) => {
      if (route.request().method() === "DELETE") {
        console.log(`[Mock Server Error] Intercepted DELETE request to /api/v1/product/${createdProductId}`);
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Failed to delete product due to database error" }),
        });
      } else {
        await route.continue();
      }
    });

    await test.step("Navigate to Tab 5", async () => {
      await productsEditPage.navigateDirectlyToEditProduct(createdProductId);
      await productsEditPage.clickTab("Product Options");
    });

    await test.step("Click Delete and confirm delete in dialog", async () => {
      await productsEditPage.clickDeleteProductButton();
      
      await Promise.all([
        page.waitForURL(/\/admin\/product$/),
        productsDeletePage.clickDelete()
      ]);
    });

    await test.step("Verify system displays error toast and product is NOT deleted", async () => {
      // Check for error toast on list page
      const bodyText = page.locator('body');
      await expect(bodyText).toContainText(/fail|error|unable|failed/i, { timeout: 10000 });
      
      // Search for the product name
      await productsPage.search(createdProductName);
      
      // Assert the product is still visible (first row matches)
      const firstRowName = await productsPage.getFirstProductName();
      expect(firstRowName.trim()).toBe(createdProductName);
    });
  });

  test("TC:119 - Verify that a standard user can successfully delete a product", async ({ page }) => {
    allure.story("Delete Product Happy Path");

    await test.step("Navigate to Tab 5", async () => {
      await productsEditPage.navigateDirectlyToEditProduct(createdProductId);
      await productsEditPage.clickTab("Product Options");
    });

    await test.step("Click Delete and confirm in dialog", async () => {
      await productsEditPage.clickDeleteProductButton();
      
      await Promise.all([
        page.waitForURL(/\/admin\/product$/),
        productsDeletePage.clickDelete()
      ]);
    });

    await test.step("Verify redirection to Products list page", async () => {
      await expect(page).toHaveURL(/\/admin\/product$/);
      await expect(productsPage.getProductListHeader()).toBeVisible();
    });

    await test.step("Search for deleted product name", async () => {
      await productsPage.getSearchBar().fill(createdProductName);
      await page.waitForTimeout(2000);
    });

    await test.step("Verify product is no longer present in search results", async () => {
      await expect(page.getByText("No Data Found")).toBeVisible();
      const count = await productsPage.getAllRowCount();
      expect(count).toBe(0);
    });
  });

  test("TC:123 - Verify that deleting a product correctly decrements the total product row count on the list page", async ({ page }) => {
    allure.story("Delete Product List Update");

    await test.step("Navigate to Products page", async () => {
      await page.goto("/");
      await productsPage.navigateToProducts();
      await page.waitForURL(/\/admin\/product/);
      await page.waitForLoadState("networkidle").catch(() => {});
    });

    await test.step("Verify table loads and check first row is visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible({ timeout: 20000 });
    });

    await test.step("Verify current product row count matches initial product count", async () => {
      const currentRowCount = await productsPage.getAllRowCount();
      console.log(`Current product row count after deletion: ${currentRowCount}`);
      expect(currentRowCount).toBe(initialRowCount);
    });
  });

  test("TC:122 - Verify that attempting to navigate to the details or edit URL of a deleted product displays an error", async ({ page }) => {
    allure.story("Deleted Product Navigation handling");

    await test.step("Navigate directly to the deleted product detail URL", async () => {
      await page.goto(`/admin/product/${createdProductId}`);
    });

    await test.step("Verify error message 'Data do not exists' appears", async () => {
      await expect(productsPage.getErrorMessage()).toBeVisible();
    });

    await test.step("Navigate directly to the deleted product edit URL", async () => {
      await page.goto(`/admin/product/edit/${createdProductId}`);
    });

    await test.step("Verify error message or redirect is handled", async () => {
      // Missing data handling should show an error page or redirect to products list
      await expect(productsPage.getErrorMessage().or(productsPage.getProductListHeader()).first()).toBeVisible();
    });
  });
});
