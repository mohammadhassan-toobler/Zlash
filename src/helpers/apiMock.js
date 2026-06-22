const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function apiMockFile(page) {
  // Track the dynamic product ID extracted from the query parameters
  let capturedProductId = 389; // Default fallback matching your payload

  // Track product state statefully for wizard flow simulations
  let selectedCategory = null;
  let productName = null;
  let brandName = null;
  let productDescription = null;
  let specifications = [];
  let variantTypes = null;
  let productVariants = [];

  // 1. Intercept the product metadata API (GET and writes)
  await page.route(/\/api\/v1\/product(\/|\?|$)/, async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    // Extract the runtime ID (e.g., 389, 390, etc.) from the application query or path
    const idFromUrl = url.searchParams.get("productId");
    if (idFromUrl) {
      capturedProductId = parseInt(idFromUrl, 10);
    } else {
      const pathParts = url.pathname.split("/");
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && /^\d+$/.test(lastPart)) {
        capturedProductId = parseInt(lastPart, 10);
      }
    }

    if (method === "GET") {
      await delay(200);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          productId: capturedProductId,
          productName: productName,
          productDescription: productDescription,
          price: "0.00",
          isAvailable: false,
          discountPrice: null,
          offerTypeId: null,
          units: null,
          storeId: 12,
          isDelivery: false,
          uuid: "ab09b752-7e46-4d38-8dd1-ec721dc53728",
          progressStatus: "draft",
          rejectedReason: null,
          viewCount: 0,
          brandName: brandName,
          isRecommend: false,
          likes: 0,
          isBrand: brandName ? true : false,
          uniqueCode: null,
          variantTypes: variantTypes,
          orderedQuantity: 0,
          isReturn: true,
          isAffiliated: false,
          brandId: null,
          Store: {
            storeName: "Zlash QA Store 1780377299916",
            isAvailable: true,
            isEnable: true,
          },
          Brand: null,
          OfferType: null,
          ProductMediaFiles: [
            {
              productMediaFileId: 2406,
              ProductMediaType: "image",
              fileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
              thumbImage: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
              isDefault: true,
              isFeedVideo: false,
            },
          ],
          ProductCategories: selectedCategory ? [
            {
              productCategoryId: 1,
              categoryId: selectedCategory,
              productId: capturedProductId,
              Category: {
                categoryId: selectedCategory,
                categoryName: selectedCategory === 3 ? "Fashion & Apparel" : "Other Category",
              },
            },
          ] : [],
          ProductSpecifications: specifications.map(s => ({
            specificationId: s.specificationId,
            specificationValue: s.specificationValue,
            productId: capturedProductId
          })),
          ProductVariants: productVariants,
          TrendingProducts: [],
        }),
      });
    } else if (["POST", "PUT", "PATCH"].includes(method)) {
      const payload = route.request().postDataJSON();
      if (payload) {
        if (payload.categories && payload.categories.length > 0) {
          selectedCategory = payload.categories[0];
        }
        if (payload.productName !== undefined) {
          productName = payload.productName;
        }
        if (payload.brandName !== undefined) {
          brandName = payload.brandName;
        }
        if (payload.productDescription !== undefined) {
          productDescription = payload.productDescription;
        }
        if (payload.specifications !== undefined) {
          specifications = payload.specifications;
        }
        if (payload.variantTypes !== undefined) {
          variantTypes = payload.variantTypes;
        }
      }

      await delay(500);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([1]), // The real backend returns [1] on update
      });
    }
  });

  // 2. Intercept productvariant creation POST
  await page.route(/\/api\/v1\/productvariant/, async (route) => {
    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON() || {};
      const newVariant = {
        orderedQuantity: 0,
        productVariantId: 353 + productVariants.length,
        productId: capturedProductId,
        sku: `SHIR-00${capturedProductId}-${Date.now()}`,
        stockQuantity: payload.stockQuantity || 10,
        price: payload.price ? `${payload.price}.00` : "1000.00",
        isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : true,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        overallRate: null,
        deleted_at: null,
        ProductVariantValues: []
      };
      productVariants.push(newVariant);
      await delay(500);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(newVariant)
      });
    } else {
      await route.continue();
    }
  });

  // 3. Intercept media upload using your exact production JSON schema structure
  await page.route(/\/api\/v1\/product-media-upload/, async (route) => {
    if (route.request().method() === "POST") {
      console.log(
        `📸 Intercepted media upload for Product ID: ${capturedProductId}`,
      );

      // Dynamically extract productVariantId if uploading a variant image
      let productVariantId = null;
      const postData = route.request().postData();
      if (postData) {
        const match = postData.match(/name="productVariantId"\s*\r?\n\r?\n(\d+)/);
        if (match) {
          productVariantId = parseInt(match[1], 10);
        }
      }

      await delay(1000);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        // Exact structural match of your real API payload
        body: JSON.stringify({
          isFeedVideo: false,
          productMediaFileId: 2406 + (productVariantId ? 100 : 0),
          ProductMediaType: "image",
          fileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", // Directs UI to a safe static placeholder
          productId: capturedProductId, // Synchronized dynamically with the test execution
          thumbImage: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
          productVariantId: productVariantId,
          isDefault: productVariantId ? false : true,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }),
      });
    } else {
      await route.continue();
    }
  });
}
