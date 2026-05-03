// src/pages/DashboardPage.js
import { DASHBOARD_SELECTORS } from "../config/DashboardSelectors";
import { LocatorManager } from "../utils/LocatorManager";

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
    return this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.STORE_NAME);
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
}