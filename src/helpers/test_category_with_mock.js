const { firefox } = require('@playwright/test');

(async () => {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext({
    storageState: 'storageState.json',
    baseURL: 'http://d1cfp5hosozeex.cloudfront.net'
  });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  
  page.on('request', request => {
    console.log(`>> Request: ${request.method()} ${request.url()}`);
  });

  page.on('response', response => {
    console.log(`<< Response: ${response.status()} ${response.url()}`);
  });

  // Register apiMockFile logic directly
  let capturedProductId = 389;
  await page.route(/\/api\/v1\/product($|\?)/, async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    console.log(`[MOCK INTERCEPT] /api/v1/product: ${method} ${url}`);
    
    if (method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: capturedProductId,
          name: "Mocked Dynamic Product",
          status: "DRAFT_MOCKED",
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
    } else {
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

  await page.route(/\/api\/v1\/product-media-upload/, async (route) => {
    console.log(`[MOCK INTERCEPT] media upload`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        isFeedVideo: false,
        productMediaFileId: 2406,
        ProductMediaType: "image",
        fileUrl: "https://placehold.co/600x400.png",
        productId: capturedProductId,
        thumbImage: "https://placehold.co/150x150.png",
        productVariantId: null,
        isDefault: true,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      }),
    });
  });

  try {
    await page.goto('/admin/product', { waitUntil: 'load' });
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
    
    // Click Add Products
    const addBtn = page.getByRole("button", { name: "Add Products" });
    await addBtn.click();
    await page.waitForLoadState("networkidle");
    
    // Upload image
    console.log('Uploading product image...');
    const uploadInput = page.locator('input[type="file"]').first();
    await uploadInput.setInputFiles('src/test-data/images/Product-Shirt-1.jpeg');
    
    // Wait for image visible
    const img = page.getByRole("img", { name: "media" });
    await img.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Image uploaded and visible.');
    
    // Click select category
    console.log('Clicking Select Category dropdown...');
    const selectCategory = page.getByText("Select a Category", { exact: true });
    await selectCategory.click();
    await page.waitForTimeout(2000);
    
    // Check what is on the screen/body
    const bodyText = await page.innerText('body');
    console.log('Body Text after clicking category dropdown:');
    console.log(bodyText.substring(0, 1000));
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
