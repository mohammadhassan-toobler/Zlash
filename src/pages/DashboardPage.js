// src/pages/DashboardPage.js
import { DASHBOARD_SELECTORS } from "../config/DashboardSelectors";
import { LocatorManager } from "../utils/LocatorManager";
// src/pages/DashboardPage.js
import { expect } from "@playwright/test";

export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.locatorManager = new LocatorManager(page);
  }

  // Inside DashboardPage.js
async navigate() {
  await this.page.goto('/admin/dashboard'); // Playwright dynamically attaches the base URL!
}

  // Element Getters using the LocatorManager
  getPageTitle() {
    return this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.PAGE_TITLE);
  }

  getStoreName() {
    return this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_NAME_DISPLAY);
  }

  getStoreEmail() {
    return this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_EMAIL);
  }

  getStoreStatus() {
    return this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_STATUS_VALUE);
  }

  getProductsLink() {
    return this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.PRODUCTS_LINK);
  }

  // Complex Actions
 async openPublicStorefront() {
    const buttonLoc = this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.GO_TO_STORE_BUTTON);
    
    // Direct click. Force: true helps if Chakra UI animations intercept the click.
    await buttonLoc.click({ force: true });
    
    // Wait for the DOM to settle after the navigation click
    await this.page.waitForLoadState('domcontentloaded');
  }
  // --- EDIT STORE ACTIONS ---
  
  // src/pages/DashboardPage.js

// src/pages/DashboardPage.js

  async clickGoToStore() {
    // 1. Get the locator for the 'Go to Store' button
    const goToBtn = this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.GO_TO_STORE_BUTTON);
    
    // 2. Click it
    await goToBtn.click();
    
    // 3. Wait for the URL to change to the details view to ensure the next step starts on the right page
    await this.page.waitForURL(/.*admin\/dashboard\/details/, { timeout: 10000 });
  }

  async clickEditStore() {
    // This stays atomic - only handles the Edit Store button click
    await this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.EDIT_STORE_BUTTON).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async updateStoreDetails(name, phone, email, bio) {
    // We use sequential fills to mimic human interaction
    await this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.NAME_INPUT).fill(name);
    await this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.PHONE_INPUT).fill(phone);
    await this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.EMAIL_INPUT).fill(email);
    await this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.BIO_INPUT).fill(bio);
  }

  // src/pages/DashboardPage.js

  async uploadStoreLogo(filePath) {
    const deleteTrigger = this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.LOGO_DELETE_BUTTON);
    const confirmBtn = this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.CONFIRM_DELETE_BUTTON);
    const fileInput = this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.LOGO_UPLOAD_INPUT);

    // 1. Handle Cleanup with Confirmation
    if (await deleteTrigger.isVisible()) {
        console.log("Existing logo found. Opening confirmation modal...");
        await deleteTrigger.click();
        
        // Wait for the modal button and click it
        await confirmBtn.waitFor({ state: 'visible' });
        await confirmBtn.click();
        
        // Crucial: Wait for the deletion to sync with the server/UI
        await expect(deleteTrigger).toBeHidden();
        console.log("Logo deleted and auto-saved.");
    }

    // 2. Upload the new logo
    console.log("Uploading new logo...");
    await fileInput.setInputFiles(filePath);

    // 3. Verify Auto-Save Success
    // After upload, the 'X' delete button should reappear automatically
    await expect(deleteTrigger).toBeVisible({ timeout: 10000 });
  }

  async saveChanges() {
    await this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.UPDATE_BUTTON).click();
  }
  async clickUpdate() {
    // Finds the update button using the selector from your config
    const updateBtn = this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_FORM.UPDATE_BUTTON);
    await updateBtn.click();
    // Wait for network to settle to ensure validation logic has run
    await this.page.waitForLoadState('networkidle');
  }
  
  async saveChanges() {
    // Alias for clickUpdate if you use this name in your tests
    await this.clickUpdate();
  }
  // Inside src/pages/DashboardPage.js
  // async saveChanges() {
  //   // Promise.all tells Playwright: "Click the button, and DO NOT move to the 
  //   // next line of code until the /api/store network request finishes responding."
  //   await Promise.all([
  //     this.page.waitForResponse(res => res.url().includes('/api/store')),
  //     this.clickUpdate() // Your existing click method
  //   ]);
  // }
}