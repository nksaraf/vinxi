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

test.describe("hmr", () => {
	let fixture: DevFixture;
	let appFixture: AppFixture;

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

	test("hmr ssr", async () => {
		let res = await fixture.requestDocument("/");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		expect(selectHtml(await res.text(), "[data-test-id=content]")).toBe(
			prettyHtml(`<h1 data-test-id="content">Hello from Vinxi</h1>`),
		);

		await fixture.updateFile(
			"app/root.tsx",
			js`import { Counter } from './Counter';

			export default function App({ assets }) {
				return (
					<html lang="en">
						<head>
							<link rel="icon" href="/favicon.ico" />
							{assets}
						</head>
						<body>
							<section>
								<h1 data-test-id="content">Hello from Vinxi too</h1>
								<Counter />
							</section>
						</body>
					</html>
				);
			}`,
		);

		await new Promise((r) => setTimeout(r, 1000));

		res = await fixture.requestDocument("/");
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/html");
		expect(selectHtml(await res.text(), "[data-test-id=content]")).toBe(
			prettyHtml(`<h1 data-test-id="content">Hello from Vinxi too</h1>`),
		);
	});

	test("client hmr", async ({ page }) => {
		let app = new PlaywrightFixture(appFixture, page);
		await app.goto("/", true);

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

		await fixture.updateFile(
			"app/Counter.tsx",
			js`import { useState } from "react";

			export function Counter() {
				const [count, setCount] = useState(0);
				return (
					<div>
						<button data-test-id="button" onClick={() => setCount(count + 1)}>
							Click me again
						</button>
						<span data-test-id="count">{count}</span>
					</div>
				);
			}`,
		);

		await new Promise((r) => setTimeout(r, 1000));

		expect(await app.getHtml("[data-test-id=button]")).toBe(
			prettyHtml(`<button data-test-id="button">Click me again</button>`),
		);
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
