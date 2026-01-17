import { expect, test } from "@playwright/test";
import { env } from "~/env";
import { login, waitForToast } from "~/tests/e2e/helpers";

test.describe("Login with Password", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("should display login form when user is not authenticated", async ({
		page,
	}) => {
		await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
		await expect(page.getByLabel("Email")).toBeVisible();
		await expect(page.getByLabel("Password")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Login", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Login with passkey" }),
		).toBeVisible();

		await expect(page.getByText("Subtracker")).toBeVisible();
	});

	test("should show error for invalid credentials", async ({ page }) => {
		await page.getByLabel("Email").fill("invalid@example.com");
		await page.getByLabel("Password").fill("wrongpassword");

		await page.getByRole("button", { name: "Login", exact: true }).click();

		await waitForToast(page, /Invalid email or password/i);

		await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
	});

	test("should successfully login with valid credentials", async ({ page }) => {
		await login(page);

		await expect(
			page.getByRole("heading", { name: "Subscriptions", exact: true }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Login" }),
		).not.toBeVisible();
	});

	test("should handle forgot password flow", async ({ page }) => {
		await page.getByLabel("Email").fill(env.ADMIN_EMAIL);

		await page.getByRole("button", { name: "Forgot password?" }).click();

		await expect(
			page.getByText(/If that email exists, a reset link has been sent/i),
		).toBeVisible();
	});
});
