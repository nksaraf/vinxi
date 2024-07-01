import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
	testDir: ".",
	testMatch: ["**/*.test.ts"],
	fullyParallel: false,
	timeout: process.env.CI ? 360_000 : 30_000, // 5 minutes in CI, 30 seconds locally
	expect: {
		timeout: 5_000, // 5 second retries for assertions
	},
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI
		? "github"
		: [["html", { open: process.env.TEST_REPORT ? "always" : "none" }]],
	use: { actionTimeout: 0 },
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
			},
		},
	],
};

export default config;
