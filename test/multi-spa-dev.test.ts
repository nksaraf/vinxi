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

	function createSPATest(title: string, base: string, id?: string) {
		test(title, async ({ page }) => {
			let app = new PlaywrightFixture(appFixture, page);
			await app.goto(base, true);

			const testId = id ? "-" + id : "";

			expect(await app.getHtml(`[data-test-id=count${testId}]`)).toBe(
				prettyHtml(`<span data-test-id="count${testId}">0</span>`),
			);
	
			await app.clickElement(`[data-test-id=button${testId}]`);
	
			expect(await app.getHtml(`[data-test-id=count${testId}]`)).toBe(
				prettyHtml(`<span data-test-id="count${testId}">1</span>`),
			);
	
			expect(await app.getHtml(`[data-test-id=asset-image${testId}]`)).toContain('data-loaded="true"');
			expect(await app.getHtml(`[data-test-id=public-image${testId}]`)).toContain('data-loaded="true"');
	
			const res = await fixture.requestDocument(`${base + (base.endsWith("/") ? "" : "/")}not-defined`);
			expect(res.status).toBe(200);
		});
	}

	createSPATest("root", "/");
	createSPATest("react", "/react", "react");
	createSPATest("solid", "/solid", "solid");
});

