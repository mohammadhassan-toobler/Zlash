import { test } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

test("Authenticate and save session", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await test.step("Launch the URL", async () => {
    await loginPage.LanuchURL();
  });

  await test.step("Login the Application", async () => {
    await loginPage.OTPLogin();
  });

  await test.step("Store the session", async () => {
    await page.context().storageState({ path: "storageState.json" });
  });
});
