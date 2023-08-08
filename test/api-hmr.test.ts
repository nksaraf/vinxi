import { expect, test } from "@playwright/test";

import type {
	AppFixture,
	DevFixture,
	Fixture,
} from "./helpers/create-fixture.js";
import {
	createDevFixture,
	createFixture,
	js,
} from "./helpers/create-fixture.js";
import {
	PlaywrightFixture,
	prettyHtml,
	selectHtml,
} from "./helpers/playwright-fixture.js";

test.describe("api hmr", () => {
	let fixture: DevFixture;
	let appFixture: AppFixture;
	// test.skip(process.env.START_ADAPTER !== "solid-start-node");

	test.beforeAll(async () => {
		fixture = await createDevFixture({
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

	test.afterEach(async () => {
		await fixture.reset();
	});

	test("hmr api", async () => {
		let res = await fixture.requestDocument("/api/hello");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		expect(await res.text()).toBe("Hello world");

		await fixture.updateFile(
			"app/api/hello.ts",
			js`export default function handler(event) {
				return "Hello world too";
			}`,
		);

		await new Promise((r) => setTimeout(r, 1000));

		res = await fixture.requestDocument("/api/hello");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		expect(await res.text()).toBe("Hello world too");

		await fixture.updateFile(
			"app/api/new.ts",
			js`export default function handler(event) {
				return "Hello new";
			}`,
		);

		await new Promise((r) => setTimeout(r, 1000));

		res = await fixture.requestDocument("/api/new");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		expect(await res.text()).toBe("Hello new");

		await fixture.deleteFile("app/api/new.ts");

		await new Promise((r) => setTimeout(r, 1000));
		res = await fixture.requestDocument("/api/new");
		expect(res.status).toBe(404);
	});
});
