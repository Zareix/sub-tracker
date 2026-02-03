import type { GitHubActionOptions } from "@estruyf/github-actions-reporter";
import { defineConfig, devices } from "@playwright/test";

// @ts-expect-error It's possible
process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = "./db-test.sqlite";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.ADMIN_EMAIL = "admin@gmail.com";
process.env.UPLOADS_FOLDER = "./uploads-test";

export default defineConfig({
	testDir: "./src/tests/e2e",
	timeout: 30 * 1000,
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	globalTeardown: process.env.CI ? undefined : "./src/tests/e2e/_teardown",
	reporter: process.env.CI
		? [
				["html"],
				["github"],
				[
					"@estruyf/github-actions-reporter",
					<GitHubActionOptions>{
						showError: true,
					},
				],
			]
		: [["list"], ["html"]],
	use: {
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
		screenshot: "only-on-failure",
	},

	expect: {
		timeout: 10000,
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		// {
		// 	name: "firefox",
		// 	use: { ...devices["Desktop Firefox"] },
		// },
		// {
		// 	name: "webkit",
		// 	use: { ...devices["Desktop Safari"] },
		// },
		// {
		// 	name: "Mobile Chrome",
		// 	use: { ...devices["Pixel 5"] },
		// },
		// {
		// 	name: "Mobile Safari",
		// 	use: { ...devices["iPhone 15 Pro"] },
		// },
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: "bun run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120 * 1000,
	},
});
