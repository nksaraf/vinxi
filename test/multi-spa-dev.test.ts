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

	test("root", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/", true);

		expect(await app.getHtml("[data-test-id=count]")).toBe(
			prettyHtml(`<span data-test-id="count">0</span>`),
		);

		await app.clickElement("[data-test-id=button]");

		expect(await app.getHtml("[data-test-id=count]")).toBe(
			prettyHtml(`<span data-test-id="count">1</span>`),
		);

		expect(await app.getHtml("[data-test-id=asset-image]")).toContain('data-loaded="true"');
		expect(await app.getHtml("[data-test-id=public-image]")).toContain('data-loaded="true"');
	});

	test("react", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/react", true);

		expect(await app.getHtml("[data-test-id=count-react]")).toBe(
			prettyHtml(`<span data-test-id="count-react">0</span>`),
		);

		await app.clickElement("[data-test-id=button-react]");

		expect(await app.getHtml("[data-test-id=count-react]")).toBe(
			prettyHtml(`<span data-test-id="count-react">1</span>`),
		);

		expect(await app.getHtml("[data-test-id=asset-image-react]")).toContain('data-loaded="true"');
		expect(await app.getHtml("[data-test-id=public-image-react]")).toContain('data-loaded="true"');
	});

	test("solid", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/solid", true);

		expect(await app.getHtml("[data-test-id=count-solid]")).toBe(
			prettyHtml(`<span data-test-id="count-solid">0</span>`),
		);

		await app.clickElement("[data-test-id=button-solid]");

		expect(await app.getHtml("[data-test-id=count-solid]")).toBe(
			prettyHtml(`<span data-test-id="count-solid">1</span>`),
		);

		expect(await app.getHtml("[data-test-id=asset-image-solid]")).toContain('data-loaded="true"');
		expect(await app.getHtml("[data-test-id=public-image-solid]")).toContain('data-loaded="true"');
	});
});

