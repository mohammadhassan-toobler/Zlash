import { expect } from "@playwright/test";

class LoginPage {
  constructor(page) {
    this.page = page;
    this.mobileNumberInput = page.getByRole("textbox", {
      name: "Enter the Mobile Number",
    });
    this.otpButton = page.getByRole("button", { name: "Request OTP" });
    this.otpInput = page.getByRole("textbox", { name: "pin code 1 of 4" });
    this.verifyOTPButton = page.getByRole("button", { name: "Verify OTP" });
  }
  async LanuchURL(url = "/") {
    await this.page.goto(url);
  }
  async OTPLogin(
    mobileNumber = process.env.APP_MOBILE_NUMBER,
    otp = process.env.APP_OTP,
  ) {
    await this.mobileNumberInput.fill(mobileNumber);
    await this.otpButton.click();
    await this.otpInput.fill(otp);
    await Promise.all([
      this.page.waitForURL(/\/admin\/dashboard/),
      this.verifyOTPButton.click(),
    ]);
  }
}
export { LoginPage };
