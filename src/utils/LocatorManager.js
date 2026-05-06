// src/utils/LocatorManager.js

export class LocatorManager {
  constructor(page) {
    this.page = page;
  }

  /**
   * Chains fallback selectors using Playwright's native .or() method.
   * Eliminates the need for brittle try/catch blocks.
   */
  getResilientLocator(selectorObj) {
    let loc;

    if (selectorObj.dataTest) {
      loc = this.page.getByTestId(selectorObj.dataTest);
    }
    
    if (selectorObj.role) {
      const roleLoc = this.page.getByRole(selectorObj.role.role, { name: selectorObj.role.name });
      loc = loc ? loc.or(roleLoc) : roleLoc;
    }

    if (selectorObj.text) {
      const textLoc = this.page.getByText(selectorObj.text, { exact: false });
      loc = loc ? loc.or(textLoc) : textLoc;
    }

    if (selectorObj.cssClass) {
      const cssLoc = this.page.locator(`.${selectorObj.cssClass}`);
      loc = loc ? loc.or(cssLoc) : cssLoc;
    }

    if (selectorObj.xpath) {
      const xpathLoc = this.page.locator(selectorObj.xpath);
      loc = loc ? loc.or(xpathLoc) : xpathLoc;
    }

    // ---> NEW BLOCK FOR RAW LOCATORS <---
    if (selectorObj.locator) {
      const rawLoc = this.page.locator(selectorObj.locator);
      loc = loc ? loc.or(rawLoc) : rawLoc;
    }

    if (!loc) {
      throw new Error(`Invalid selector configuration provided: ${JSON.stringify(selectorObj)}`);
    }

    return loc.first();
  }
}