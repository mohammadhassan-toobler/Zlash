import { test } from "@playwright/test";
test.only("Login", async ({ page }) => {
  await page.goto("http://d1cfp5hosozeex.cloudfront.net");
  await page.pause();
});
