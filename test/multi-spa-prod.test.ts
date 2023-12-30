import { expect, test } from "@playwright/test";
import type { AppFixture, Fixture } from "./helpers/create-fixture.js";
import { createFixture } from "./helpers/create-fixture.js";
import { PlaywrightFixture, prettyHtml } from "./helpers/playwright-fixture.js";

test.describe("multi-spa-prod", () => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createFixture({
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

			expect(await app.getHtml(`[data-test-id=count${id ? "-" + id : ""}]`)).toBe(
				prettyHtml(`<span data-test-id="count${id ? "-" + id : ""}">0</span>`),
			);
	
			await app.clickElement(`[data-test-id=button${id ? "-" + id : ""}]`);
	
			expect(await app.getHtml(`[data-test-id=count${id ? "-" + id : ""}]`)).toBe(
				prettyHtml(`<span data-test-id="count${id ? "-" + id : ""}">1</span>`),
			);
	
			expect(await app.getHtml(`[data-test-id=asset-image${id ? "-" + id : ""}]`)).toContain('data-loaded="true"');
			expect(await app.getHtml(`[data-test-id=public-image${id ? "-" + id : ""}]`)).toContain('data-loaded="true"');
	
			const res = await fixture.requestDocument(`${base + (base.endsWith("/") ? "" : "/")}not-defined`);
			expect(res.status).toBe(200);
		});
	}

	createSPATest("root", "/");
	createSPATest("react", "/react", "react");
	createSPATest("solid", "/solid", "solid");
});
