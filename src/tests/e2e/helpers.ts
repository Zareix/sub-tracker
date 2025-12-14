import { expect, type Page } from "@playwright/test";

/**
 * Login helper function for E2E tests
 * @param page - Playwright page object
 * @param email - User email (defaults to TEST_USER.email)
 * @param password - User password (defaults to TEST_USER.password)
 */
export async function login(
	page: Page,
	email: string = process.env.ADMIN_EMAIL ?? "admin@gmail.com",
	password = "password",
) {
	await page.goto("/");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill(password);
	await page.getByRole("button", { name: "Login", exact: true }).click();

	// Wait for successful login - main page should be visible
	await expect(
		page.getByRole("heading", { name: "Subscriptions", exact: true }),
	).toBeVisible();
}

/**
 * Logout helper function for E2E tests
 * @param page - Playwright page object
 */
export async function logout(page: Page) {
	// Open user menu (assuming it's in the navigation)
	const userMenuTrigger = page.locator('[data-testid="user-menu"]').first();
	if (await userMenuTrigger.isVisible()) {
		await userMenuTrigger.click();
	} else {
		// Fallback: look for sign out button directly
		const signOutButton = page.getByRole("menuitem", { name: /sign out/i });
		if (await signOutButton.isVisible()) {
			await signOutButton.click();
		}
	}

	// Wait for redirect to login page
	await page.waitForURL(/.*\//, { timeout: 5000 });
	await page.getByRole("heading", { name: "Login" }).waitFor({ timeout: 5000 });
}

/**
 * Wait for toast message to appear
 * @param page - Playwright page object
 * @param message - Message to wait for (can be string or regex)
 */
export async function waitForToast(page: Page, message: string | RegExp) {
	const toastSelector = page.locator("[data-sonner-toast]").filter({
		hasText: message,
	});

	await toastSelector.waitFor({ state: "visible" });
}

/**
 * Fill login form without submitting
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 */
export async function fillLoginForm(
	page: Page,
	email: string,
	password: string,
) {
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill(password);
}

/**
 * Navigate to the home page
 * @param page - Playwright page object
 */
export async function goToHome(page: Page) {
	await page.goto("/");
	await page.waitForLoadState("networkidle");
}

/**
 * Request password reset
 * @param page - Playwright page object
 * @param email - Email to send reset link to
 */
export async function requestPasswordReset(page: Page, email: string) {
	await page.goto("/");
	await page.getByLabel("Email").fill(email);
	await page.getByRole("button", { name: "Forgot password?" }).click();
}

/**
 * Clear all cookies and local storage
 * @param page - Playwright page object
 */
export async function clearAuth(page: Page) {
	await page.context().clearCookies();
	await page.evaluate(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
}
