// src/fixtures/baseTest.js
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  // We extend the 'page' fixture
  page: async ({ page }, use) => {
    const consoleErrors = [];

    // Step 1: Subscribe to console events before the test starts
    page.on('console', (msg) => {
      // We specifically look for 'error' type logs
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        // Optional: Log to your terminal for real-time debugging
        console.log(`\x1b[31m[BROWSER ERROR]\x1b[0m: ${msg.text()}`);
      }
    });

    // Step 2: 'use' the page. This is where your actual test code runs.
    await use(page);

    // Step 3: Final check after test completion
    // This ensures that even if UI assertions pass, a hidden crash fails the test.
    // The test is technically "done," but we do one last health check
    if (consoleErrors.length > 0) {
        // We throw a specific error type so the CI/CD log is clear
        throw new Error(
        `NON-BLOCKING REGRESSION ISSUE: UI passed, but ${consoleErrors.length} console errors were detected. ` +
        `These may indicate memory leaks or broken secondary features.`
        );
    }
  },
});

export { expect };