import { expect, test } from "@playwright/test";

import type { AppFixture, Fixture } from "./helpers/create-fixture.js";
import { testDevAndProd } from "./helpers/create-fixture.js";
import {
	PlaywrightFixture,
	prettyHtml,
	selectHtml,
} from "./helpers/playwright-fixture.js";

testDevAndProd("basic", ({ createFixture }) => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createFixture({
			files: {},
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

	test("ssr", async () => {
		let res = await fixture.requestDocument("/");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		expect(selectHtml(await res.text(), "[data-test-id=content]")).toBe(
			prettyHtml(`<h1 data-test-id="content">Hello from Vinxi</h1>`),
		);
	});

	test("hydrates", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/", true);
		await app.isReady();

		expect(await app.getHtml("[data-test-id=content]")).toBe(
			prettyHtml(`<h1 data-test-id="content">Hello from Vinxi</h1>`),
		);
		expect(await app.getHtml("[data-test-id=count]")).toBe(
			prettyHtml(`<span data-test-id="count">0</span>`),
		);

		await app.clickElement("[data-test-id=button]");

		expect(await app.getHtml("[data-test-id=count]")).toBe(
			prettyHtml(`<span data-test-id="count">1</span>`),
		);
	});

	test("api", async () => {
		let res = await fixture.requestDocument("/api/hello");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		expect(await res.text()).toBe("Hello world");
	});
});
