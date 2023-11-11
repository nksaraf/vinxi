import { expect, test } from "@playwright/test";
import type { AppFixture, Fixture } from "./helpers/create-fixture.js";
import { createDevFixture } from "./helpers/create-fixture.js";
import { PlaywrightFixture, prettyHtml } from "./helpers/playwright-fixture.js";

test.describe("multi-spa-dev", () => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createDevFixture({
			files: {},
			template: "multi-spa",
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

	test("react", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/", true);

		expect(await app.getHtml("[data-test-id=count]")).toBe(
			prettyHtml(`<span data-test-id="count">0</span>`),
		);

		await app.clickElement("[data-test-id=button]");

		expect(await app.getHtml("[data-test-id=count]")).toBe(
			prettyHtml(`<span data-test-id="count">1</span>`),
		);
	});

	test("solid", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/solid", true);

		expect(await app.getHtml("[data-test-id=count]")).toBe(
			prettyHtml(`<span data-test-id="count">0</span>`),
		);

		await app.clickElement("[data-test-id=button]");

		expect(await app.getHtml("[data-test-id=count]")).toBe(
			prettyHtml(`<span data-test-id="count">1</span>`),
		);
	});
});

