import { expect, test } from "@playwright/test";

import type { AppFixture, Fixture } from "./helpers/create-fixture.js";
import {
	createDevFixture,
	js,
	testDevAndProd,
} from "./helpers/create-fixture.js";
import { PlaywrightFixture, prettyHtml } from "./helpers/playwright-fixture.js";

testDevAndProd("multi-spa", ({ createFixture }) => {
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

			const testId = id ? "-" + id : "";

			expect(await app.getHtml(`[data-test-id=count${testId}]`)).toBe(
				prettyHtml(`<span data-test-id="count${testId}">0</span>`),
			);

			await app.clickElement(`[data-test-id=button${testId}]`);

			expect(await app.getHtml(`[data-test-id=count${testId}]`)).toBe(
				prettyHtml(`<span data-test-id="count${testId}">1</span>`),
			);

			expect(
				await app.getHtml(`[data-test-id=asset-image${testId}]`),
			).toContain('data-loaded="true"');
			expect(
				await app.getHtml(`[data-test-id=public-image${testId}]`),
			).toContain('data-loaded="true"');

			const res = await fixture.requestDocument(
				`${base + (base.endsWith("/") ? "" : "/")}not-defined`,
			);
			expect(res.status).toBe(200);
		});
	}

	createSPATest("root", "/");
	createSPATest("react", "/react", "react");
	createSPATest("solid", "/solid", "solid");
});

testDevAndProd("multi-spa-mode-backwards-compat", ({ createFixture }) => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createFixture({
			files: {
				"app.config.js": js`
				import react from "@vitejs/plugin-react";
import { createApp } from "vinxi";
import solid from "vite-plugin-solid";

const app = createApp({
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
		},
		{
			name: "public-react",
			mode: "static",
			dir: "./react/public",
			base: "/react",
		},
		{
			name: "public-solid",
			mode: "static",
			dir: "./solid/public",
			base: "/solid",
		},
		{
			name: "root",
			mode: "spa",
			handler: "./src/index.ts",
			target: "browser",
			plugins: () => [react()],
		},
		{
			name: "react",
			mode: "spa",
			root: "./react",
			handler: "./index.html",
			base: "/react",
			target: "browser",
			plugins: () => [react()],
		},
		{
			name: "solid",
			mode: "spa",
			root: "./solid",
			handler: "./src/index.ts",
			base: "/solid",
			target: "browser",
			plugins: () => [solid()],
		},
	],
});

export default app;
`,
			},
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

			expect(
				await app.getHtml(`[data-test-id=asset-image${testId}]`),
			).toContain('data-loaded="true"');
			expect(
				await app.getHtml(`[data-test-id=public-image${testId}]`),
			).toContain('data-loaded="true"');

			const res = await fixture.requestDocument(
				`${base + (base.endsWith("/") ? "" : "/")}not-defined`,
			);
			expect(res.status).toBe(200);
		});
	}

	createSPATest("root", "/");
	createSPATest("react", "/react", "react");
	createSPATest("solid", "/solid", "solid");
});
