// src/pages/DashboardPage.js
import { DASHBOARD_SELECTORS } from "../config/DashboardSelectors";
import { LocatorManager } from "../utils/LocatorManager";

export class DashboardPage {
  constructor(page) {
    this.page = page;
    this.locatorManager = new LocatorManager(page);
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
  async openPublicStorefront(context) {
    const buttonLoc = this.locatorManager.getResilientLocator(DASHBOARD_SELECTORS.GO_TO_STORE_BUTTON);
    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      buttonLoc.click()
    ]);
    
    await newPage.waitForLoadState('domcontentloaded');
    return newPage;
  }
}