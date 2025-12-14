import { expect, test } from "@playwright/test";
import { login, waitForToast } from "~/tests/e2e/helpers";

test.describe("Create Subscription", () => {
	test.beforeEach(async ({ page }) => {
		await login(page);
	});

	test("should successfully create a basic subscription", async ({ page }) => {
		// Open create subscription dialog
		await page.getByRole("button", { name: "Add new subscription" }).click();

		// Wait for dialog to open
		await expect(
			page.getByRole("heading", { name: "Create Subscription" }),
		).toBeVisible();

		// Fill in required fields
		await page.getByLabel("Name").fill("Netflix");
		await page.getByLabel("Description").fill("Streaming service");
		await page.getByLabel("Price").fill("15.99");

		// Select category (first available option)
		await page.getByLabel("Category").click();
		await page.getByRole("option").first().click();

		// Select payment method (first available option)
		await page.getByLabel("Payment Method").click();
		await page.getByRole("option").first().click();

		// Select schedule (Monthly)
		await page.getByLabel("Schedule").click();
		await page.getByRole("option", { name: "Monthly" }).click();

		// Select first payment date (use today's date by default)
		await page.getByTestId("firstPaymentDatePicker").click();
		await page.getByRole("button", { name: "today" }).click();
		await page.press("body", "Escape");

		// Submit form
		await page.getByRole("button", { name: "Submit" }).click();

		// Wait for success toast
		await waitForToast(page, /Subscription created!/i);

		// Verify the subscription appears in the list
		await expect(
			page.getByRole("heading", { name: "Netflix", exact: true }).first(),
		).toBeVisible();
	});
});
