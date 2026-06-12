import { test, expect } from "../../fixtures/baseTest";
import { ProductsPage } from "../../pages/Products/ProductsPage";
import { ProductsCreatePage } from "../../pages/Products/ProductsCreatePage";
import * as allure from "allure-js-commons";
import path from "path";
import { apiMockFile } from "../../helpers/apiMock";
let productsPage, productsCreatePage;
test.beforeAll(() => {
  allure.feature("Products Module");
});
test.describe("Create Products", async () => {
  let initialRowCount;
  test.beforeEach(async ({ page }) => {
    allure.story("Create Product");
    allure.owner("Hassan");
    productsPage = new ProductsPage(page);
    productsCreatePage = new ProductsCreatePage(page);
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
  });
  test("TC083: Verify add product form has Product Category section", async () => {
    await expect(productsCreatePage.getAddMediaHeader()).toBeVisible();
  });
  test("TC084: Verify category selection dropdown is available", async () => {
    await expect(productsCreatePage.getSelectCategoryHeader()).toBeVisible();
  });
  test("TC85: Verify media upload button is visible", async () => {
    await expect(productsCreatePage.getMediaUpload()).toBeVisible();
  });
  test("TC86: Verify that user can add the product image without DB creation", async ({
    page,
  }) => {
    await apiMockFile(page);
    // --- UI Execution Steps ---
    await test.step("Verify media upload button is visible", async () => {
      await expect(productsCreatePage.getMediaUpload()).toBeVisible();
    });

    await test.step("Add the image", async () => {
      const filePath = path.join(
        process.cwd(),
        "src",
        "test-data",
        "images",
        "Product-Shirt-1.jpeg",
      );
      await productsCreatePage.uploadProductImage(filePath);
    });

    await test.step("Verify the added image is uploaded", async () => {
      // The console errors will clear, and this assertion will now pass!
      await expect(productsCreatePage.getUploadedProductImage()).toBeVisible();
    });
  });
  test("TC87: Verify Select Category button is clickable", async ({ page }) => {
    await apiMockFile(page);
    await test.step("Verify media upload button is visible", async () => {
      await expect(productsCreatePage.getMediaUpload()).toBeVisible();
    });
    await test.step("Add the image", async () => {
      const filePath = path.join(
        process.cwd(),
        "src",
        "test-data",
        "images",
        "Product-Shirt-1.jpeg",
      );
      await productsCreatePage.uploadProductImage(filePath);
    });
    await test.step("Verify the added image is uploaded", async () => {
      await expect(productsCreatePage.getUploadedProductImage()).toBeVisible();
    });
    await test.step("Verify Select Category button is clickable", async () => {
      expect(
        await productsCreatePage.verifySelectCategoryButtonVisible(),
      ).toBeTruthy();
    });
  });
  test("TC88: Verify can select a category", async () => {
    await test.step("Verify media upload button is visible", async () => {
      await expect(productsCreatePage.getMediaUpload()).toBeVisible();
    });
    await test.step("Add the image", async () => {
      const filePath = path.join(
        process.cwd(),
        "src",
        "test-data",
        "images",
        "Product-Shirt-1.jpeg",
      );
      await productsCreatePage.uploadProductImage(filePath);
    });
    await test.step("Verify the added image is uploaded", async () => {
      await expect(productsCreatePage.getUploadedProductImage()).toBeVisible();
    });
    await test.step("Verify Select Category button is clickable", async () => {
      expect(
        await productsCreatePage.verifySelectCategoryButtonVisible(),
      ).toBeTruthy();
    });
    await test.step("Choose a Category", async () => {
      await productsCreatePage.chooseCategory("Fashion & Apparel");
    });
    await test.step("Verify the category is selected or not", async () => {
      expect(
        await productsCreatePage.verifyCategoryVisible("Fashion & Apparel"),
      ).toBeTruthy();
    });
  });
});
test.describe("Full Multi-Tab Happy Path Lifecycle Validation", () => {
  test.beforeEach(async ({ page }) => {
    allure.story("Create Product");
    allure.owner("Hassan");
    productsPage = new ProductsPage(page);
    productsCreatePage = new ProductsCreatePage(page);
    await page.goto("/");
    await test.step("Navigate to the Product Menu", async () => {
      await productsPage.navigateToProducts();
    });
    await test.step("Check the First Row is Visible", async () => {
      await expect(productsPage.getAllProductRows().first()).toBeVisible();
    });
    // await test.step("Count rows before clicking the first product", async () => {
    //   initialRowCount = await productsPage.getAllRowCount();
    //   return initialRowCount;
    // });
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
  });
  test("TC:089 - Verify that a standard user can successfully create and publish a product by completely populating all fields across all 5 wizard tabs.", async () => {
    await test.step("Verify media upload button is visible", async () => {
      await expect(productsCreatePage.getMediaUpload()).toBeVisible();
    });
    await test.step("Add the image", async () => {
      const filePath = path.join(
        process.cwd(),
        "src",
        "test-data",
        "images",
        "Product-Shirt-1.jpeg",
      );
      await productsCreatePage.uploadProductImage(filePath);
    });
    await test.step("Verify the added image is uploaded", async () => {
      await expect(productsCreatePage.getUploadedProductImage()).toBeVisible();
    });
    await test.step("Verify Select Category button is clickable", async () => {
      expect(
        await productsCreatePage.verifySelectCategoryButtonVisible(),
      ).toBeTruthy();
    });
    await test.step("Choose a Category", async () => {
      await productsCreatePage.chooseCategory("Fashion & Apparel");
    });
//     await test.step("Verify the category is selected or not", async () => {
//      const category = productsCreatePage.verifyCategoryVisible("Fashion & Apparel");

// await category.waitFor({
//   state: "visible",
//   timeout: 10000,
// });

// await expect(category).toBeVisible();
//     });
    await test.step("Click the cotiniue and navigate to the next tab", async () => {
      await productsCreatePage.clickContinueButton();
    });
    await test.step("Verify the user is in Tab 2", async () => {
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
    await test.step("Verify the Category is present", async () => {
      expect(await productsCreatePage.verifyProductCategoryVisible()).toBeVisible();
    });
    await test.step("Click the cotiniue and navigate to the next tab", async () => {
      await productsCreatePage.clickContinueButton();
    });
    await test.step("Verify the user is in Tab 3", async () => {
      await expect(productsCreatePage.getproductDetailsHeader()).toBeVisible();
    });
    await test.step("Fill All the Details in product details tab", async () => {
      await productsCreatePage.fillProductDetails();
    });
    await test.step("Click the cotiniue and navigate to the next tab", async () => {
      await productsCreatePage.clickContinueButton();
    });
    await test.step("Verify the user is in Tab 4", async () => {
      await expect(
        productsCreatePage.getproductsAttributeHeader(),
      ).toBeVisible();
    });
    await test.step("Switch on the product Variant toggle", async () => {
      await productsCreatePage.switchVariantToggle();
    });
    await test.step("Verify the choose Variant button is present", async () => {
      await expect(
        productsCreatePage.getChooseVariantTypeButton(),
      ).toBeVisible();
    });
    await test.step("Verify that user can click the Variant type button", async () => {
      await productsCreatePage.clickVariantType();
    });
    await test.step("Verify the user can save the variants", async () => {
      await productsCreatePage.selectVariant();
    });
    await test.step("Verify the Add a Variant Button is present or not", async () => {
      await expect(productsCreatePage.getAddVariantButton()).toBeVisible();
    });
    await test.step("Verify that user can click the Add a Variant button", async () => {
      await productsCreatePage.clickAddVariantButton();
    });
    await test.step("Verify that Added Variants are Visible or not", async () => {
      await expect(
        productsCreatePage.verifySizeVariantsDetailsVisible(),
      ).toBeVisible();
      await expect(
        productsCreatePage.verifyColorVariantsDetailsVisible(),
      ).toBeVisible();
      await expect(
        productsCreatePage.verifyGenderVariantsDetailsVisible(),
      ).toBeVisible();
      await expect(
        productsCreatePage.verifyFitVariantsDetailsVisible(),
      ).toBeVisible();
      await expect(
        productsCreatePage.verifyPatternVariantsDetailsVisible(),
      ).toBeVisible();
    });
    await test.step("Verify that mandatory validations added for all the variants", async () => {
      await productsCreatePage.verifyMandatoryVariantsError();
      await expect(productsCreatePage.getVariantErrorMessages()).toHaveCount(
        5 + 2,
      );
    });
    await test.step("Add All the variant details", async () => {
      await productsCreatePage.addVariantDetails();
      await expect(productsCreatePage.getVariantImageText()).toBeVisible();
      const filePath = path.join(
        process.cwd(),
        "src",
        "test-data",
        "images",
        "Variant-Image.jpeg",
      );
      await productsCreatePage.uploadVariantImage(filePath);
    });
    await test.step("Verify the product discount toggle is present", async () => {
      expect(await productsCreatePage.getProductDiscountToggle()).toBe(true);
    });
    await test.step("Verify the user can add the product discount", async () => {
      await productsCreatePage.addDiscount();
    });
    await test.step("Verify that user is in Tab 5", async () => {
      await expect(productsCreatePage.getProductOptionsHeader()).toBeVisible();
    });
    await test.step("Verify product options toggles", async () => {
      expect(await productsCreatePage.verifyProductOptionsToggles()).toBe(true);
    });
    await test.step("Enable all the toggles", async () => {
      await productsCreatePage.enableAllProductOptionsToggles();
    });
    await test.step("Save the Product", async () => {
      await productsCreatePage.clickContinueButton();
    });
  });
});
