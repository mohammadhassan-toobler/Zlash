# Zlash Test Automation Framework

This project contains the test automation suite for the **Zlash** platform. It is built on top of **Playwright**, utilizing a custom resilient architecture, Page Object Model (POM), and advanced fixture extensions for maximum stability and test execution speed.

---

## 🛠️ Framework Architecture & Features

The framework is designed with modularity, maintainability, and resilience at its core. Below are the primary components that comprise the automation framework:

### 1. Resilient Locator System (`LocatorManager`)
To eliminate brittle tests caused by frequent UI updates, the framework uses a resilient fallback system managed by the [LocatorManager](file:///home/toobler/Projects/Zlash/src/utils/LocatorManager.js). 

Instead of relying on a single locator type, each element selector configuration can specify multiple identification strategies (e.g., test IDs, roles, text, CSS classes, and XPaths). The `LocatorManager` dynamically chains these fallbacks using Playwright's native `.or()` method:

```javascript
// Example Selector Configuration
export const SELECTOR = {
  role: { role: 'button', name: 'Submit' },
  locator: 'button:has-text("Submit")',
  xpath: '//button[@type="submit"]',
};

// Consumption
const locator = locatorManager.getResilientLocator(SELECTOR); // Resolves to the first matching strategy
```

### 2. Auto-Failing Console Monitor (`baseTest` Fixture)
The framework extends Playwright's default `page` fixture in [baseTest.js](file:///home/toobler/Projects/Zlash/src/fixtures/baseTest.js) to catch hidden regressions. 

During test execution, it subscribes to browser console events. If any uncaught browser console errors (excluding harmless downloadable font/external resource warnings) are logged, the test is automatically failed at teardown, even if all UI-level assertions passed.

```javascript
// src/fixtures/baseTest.js
export const test = base.extend({
  page: async ({ page }, use) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        // filter & push console errors...
        consoleErrors.push(msg.text());
      }
    });
    await use(page);
    if (consoleErrors.length > 0) {
      throw new Error(`UI passed, but console errors were detected.`);
    }
  }
});
```

### 3. Session State Caching & Global Setup
To optimize execution time and prevent redundant log-in steps for every test, the framework uses a global setup mechanism defined in [auth.setup.js](file:///home/toobler/Projects/Zlash/src/tests/setup/auth.setup.js). 

1. **Authentication:** Performs OTP login at the beginning of the test run.
2. **Storage State:** Captures cookies and local storage tokens into `storageState.json`.
3. **Reuse:** Subsequent tests automatically load `storageState.json` to run pre-authenticated in parallel worker threads.

### 4. Decoupled POM & Selectors
Rather than hardcoding selectors directly inside page classes, the project enforces a strict separation of concerns:
* **Selectors (`src/config/`)**: Centralized dictionaries mapping logical element names to multi-strategy selector objects (e.g., `ProductsSelectors.js`).
* **Page Objects (`src/pages/`)**: Contain atomic action methods and workflow orchestrations that fetch locators through `LocatorManager` and perform interactions (e.g., `DashboardPage.js`).

---

## 📂 Framework Directory Structure

```yaml
Zlash/
├── playwright.config.js       # Global Playwright configuration & project setup
├── package.json               # Dependencies and scripts (Playwright, Allure, Dotenv)
├── storageState.json          # Cached authentication state (auto-generated)
└── src/
    ├── config/                # Selector configurations mapping pages
    │   ├── DashboardSelectors.js
    │   └── ProductsSelectors.js
    ├── fixtures/              # Custom Playwright fixtures
    │   └── baseTest.js        # Extended page fixture (console error tracking)
    ├── helpers/               # Utilities & mocking helper classes
    │   └── apiMock.js         # API interception & network mock helpers
    ├── pages/                 # Page Objects (POM actions & workflows)
    │   ├── LoginPage.js
    │   ├── DashboardPage.js
    │   └── Products/          # Feature-specific page objects
    ├── utils/                 # Core framework utilities
    │   └── LocatorManager.js  # Resilient fallback selector manager
    └── tests/                 # Playwright test files
        ├── setup/
        │   └── auth.setup.js  # Global authentication setup
        └── Products/          # Automated test specifications
```

---

## ⚙️ Configuration (`playwright.config.js`)

Key parameters in [playwright.config.js](file:///home/toobler/Projects/Zlash/playwright.config.js):
* **Parallelism:** Runs tests in fully parallel mode (`fullyParallel: true`) with controlled worker limits to avoid database concurrency conflicts.
* **Retries:** Configured to automatically retry failed tests (1 retry locally, 2 in CI environment).
* **Screenshots & Traces:** Captured automatically on failure (`only-on-failure`) to assist with debugging.
* **Reporters:** Emits both default Playwright HTML report outputs and **Allure Playwright** reports.
* **Base URL:** Loaded dynamically from environment variables using `dotenv`.
* **Projects / Browsers:** Defines browser profiles (`firefox`, `chromium`, `webkit`, etc.) that inherit authorization state dependencies.

---

## 🌐 Cross-Browser Testing

The framework supports multi-browser execution, allowing you to validate application behavior across different rendering engines:

* **Available Engines:** Configured for **Chromium** (Google Chrome, Microsoft Edge), **Firefox** (Gecko), and **WebKit** (Apple Safari).
* **State Sharing:** Authenticated state (`storageState.json`) generated by the setup project is shared across all browser test instances.
* **Targeting Specific Browsers:** Run tests on a single browser directly from the command line:
  ```bash
  npx playwright test --project=firefox
  ```
* **Enabling Additional Browsers:** Un-comment the desired browser profile block in the `projects` array inside [playwright.config.js](file:///home/toobler/Projects/Zlash/playwright.config.js) to include them in full test runs.

---

## 🚀 Getting Started & Execution

### Prerequisites
Install the project dependencies:
```bash
npm install
```

### Running Tests
Execute the entire test suite (this will automatically trigger `auth.setup.js` if dependencies are missing/outdated):
```bash
npm run test
```

Run a specific set of tests (e.g., products module):
```bash
npx playwright test products
```

### Generating Allure Reports
The framework is pre-configured with Allure reporting. Run the following commands to generate and visualize the test execution metrics:

* **Generate report:**
  ```bash
  npm run allure:generate
  ```
* **Open report:**
  ```bash
  npm run allure:open
  ```
* **Generate & open combined:**
  ```bash
  npm run allure
  ```
