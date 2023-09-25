import { expect, test } from "@playwright/test";

import type { AppFixture, Fixture } from "./helpers/create-fixture.js";
import { createFixture, js } from "./helpers/create-fixture.js";
import {
	PlaywrightFixture,
	prettyHtml,
	selectHtml,
} from "./helpers/playwright-fixture.js";

test.describe("rsc", () => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createFixture({
			files: {},
			template: "react-rsc",
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

	test("spa", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/", true);

		expect(await app.getHtml("[data-test-id=title]")).toBe(
			prettyHtml(`<h1 data-test-id="title">Hello from Vinxi</h1>`),
		);
		expect(await app.getHtml("[data-test-id=counter]")).toBe(
			prettyHtml(`<button data-test-id="counter">Count: 0</button>`),
		);
		expect(await app.getHtml("[data-test-id=server-count]")).toBe(
			prettyHtml(`<span data-test-id="server-count">0</span>`),
		);

		await app.clickElement("[data-test-id=counter]");

		expect(await app.getHtml("[data-test-id=counter]")).toBe(
			prettyHtml(`<button data-test-id="counter">Count: 1</button>`),
		);
		expect(await app.getHtml("[data-test-id=server-count]")).toBe(
			prettyHtml(`<span data-test-id="server-count">1</span>`),
		);
	});
});
