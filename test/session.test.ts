import { expect, test, type Response } from "@playwright/test";

import type { AppFixture, Fixture } from "./helpers/create-fixture.js";
import { createDevFixture, createFixture, js } from "./helpers/create-fixture.js";
import { PlaywrightFixture } from "./helpers/playwright-fixture.js";

test.describe("session", () => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createDevFixture({
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
    const userIds = await response.json() as number[];
    expect(userIds.filter(Boolean).length).toBe(userIds.length);
	});
});
