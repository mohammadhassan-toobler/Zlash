export async function apiMockFile(page) {
  // Track the dynamic product ID extracted from the query parameters
  let capturedProductId = 389; // Default fallback matching your payload

  // 1. Intercept the product metadata API (GET and writes)
  await page.route(/\/api\/v1\/product/, async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    // Extract the runtime ID (e.g., 389, 390, etc.) from the application query
    const idFromUrl = url.searchParams.get("productId");
    if (idFromUrl) {
      capturedProductId = parseInt(idFromUrl, 10);
    }

    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: capturedProductId,
          name: "Mocked Dynamic Product",
          status: "DRAFT_MOCKED",
          // Mirror back the structure your frontend expects for existing media
          media: [
            {
              productMediaFileId: 2406,
              ProductMediaType: "image",
              fileUrl: "https://placehold.co/600x400.png",
              thumbImage: "https://placehold.co/150x150.png",
              productId: capturedProductId,
              isDefault: true,
            },
          ],
        }),
      });
    } else if (["POST", "PUT", "PATCH"].includes(method)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: capturedProductId,
          status: "DRAFT_MOCKED",
        }),
      });
    }
  });

  // 2. Intercept media upload using your exact production JSON schema structure
  await page.route(/\/api\/v1\/product-media-upload/, async (route) => {
    if (route.request().method() === "POST") {
      console.log(
        `📸 Intercepted media upload for Product ID: ${capturedProductId}`,
      );

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        // Exact structural match of your real API payload
        body: JSON.stringify({
          isFeedVideo: false,
          productMediaFileId: 2406,
          ProductMediaType: "image",
          fileUrl: "https://placehold.co/600x400.png", // Directs UI to a safe static placeholder
          productId: capturedProductId, // Synchronized dynamically with the test execution
          thumbImage: "https://placehold.co/150x150.png",
          productVariantId: null,
          isDefault: true,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }),
      });
    } else {
      await route.continue();
    }
  });
}
