const { test, expect } = require('@playwright/test');

test.describe('Dashboard Store Info Tests', () => {
    
    test.beforeEach(async ({ page }) => {
        // test.step groups these actions together in your Playwright report
        await test.step('Navigate to Application and Login', async () => {
            try {
                // 1. Navigate to the base URL
                await page.goto('http://d1cfp5hosozeex.cloudfront.net');

                // 2. Login Flow - Mobile Number
                await page.getByPlaceholder('Enter Mobile Number').fill('8589949955'); 
                await page.getByRole('button', { name: 'Next' }).click();

                // Wait for the OTP screen to load
                await page.waitForSelector('input[placeholder="Enter OTP"]');

                // 3. Fill static OTP and submit
                await page.getByPlaceholder('Enter OTP').fill('1234');
                await page.getByRole('button', { name: 'Login' }).click();

                // 4. Wait for successful navigation to dashboard
                await page.waitForURL('**/dashboard', { timeout: 15000 });
            } catch (error) {
                // Error Handling: If anything above fails, catch it and log a clear message
                console.error('❌ Login Step Failed:', error.message);
                throw error; // Re-throw the error so the test actually registers as a failure
            }
        });
    });

    test('TC-01: Verify Store Info Card Rendering', async ({ page }) => {
        await test.step('Verify Store Info Card Details', async () => {
            try {
                const storeInfoCard = page.locator('.store-info-card'); 

                await expect(storeInfoCard.getByText('VYBE Men')).toBeVisible();
                await expect(storeInfoCard.getByText('vybemen@gmail.com')).toBeVisible();

                const statusIndicator = storeInfoCard.getByText('ONLINE');
                await expect(statusIndicator).toBeVisible();
                await expect(statusIndicator).toHaveClass(/text-green-500/); 
            } catch (error) {
                console.error('❌ TC-01 Assertion Failed:', error.message);
                throw error;
            }
        });
    });

    test('TC-02: Verify "Go to Store" External Navigation', async ({ page, context }) => {
        await test.step('Navigate to Public Storefront in a new tab', async () => {
            try {
                const [newPage] = await Promise.all([
                    context.waitForEvent('page'),
                    page.getByRole('button', { name: 'Go to Store' }).click()
                ]);

                await newPage.waitForLoadState('domcontentloaded');
                await expect(newPage).toHaveURL(/.*vybe-men.*/); 
                await expect(newPage.getByRole('heading', { name: 'VYBE Men' })).toBeVisible();
            } catch (error) {
                console.error('❌ TC-02 External Navigation Failed:', error.message);
                throw error;
            }
        });
    });

});