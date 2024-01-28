import { type Response, expect, test } from "@playwright/test";

import type { AppFixture, Fixture } from "./helpers/create-fixture.js";
import { testDevAndProd } from "./helpers/create-fixture.js";
import { PlaywrightFixture } from "./helpers/playwright-fixture.js";

testDevAndProd("session", ({ createFixture }) => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createFixture({
			files: {},
			template: "react",
		});

		appFixture = await fixture.createServer();
	});

	test.afterAll(async () => {
		await appFixture.close();
	});

	let logs: string[] = [];

	test.beforeEach(({ page }) => {
		page.on("console", (msg) => {
			logs.push(msg.text());
		});
	});

	test("concurrent getSession calls", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/api/init-session", true);

		const response = await app.goto("/api/read-session");
		const userIds = (await response.json()) as number[];
		expect(userIds.filter(Boolean).length).toBe(userIds.length);
	});
});
