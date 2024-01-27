import { type Response, expect, test } from "@playwright/test";

import type { AppFixture, Fixture } from "./helpers/create-fixture.js";
import {
	createDevFixture,
	createFixture,
	js,
} from "./helpers/create-fixture.js";
import { PlaywrightFixture, prettyHtml } from "./helpers/playwright-fixture.js";

test.describe("async-context-dev", () => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createDevFixture({
			files: {
				"app.config.js": js`
import reactRefresh from "@vitejs/plugin-react";
import { serverFunctions } from "@vinxi/server-functions/plugin";
import { createApp } from "vinxi";

export default createApp({
	server: {
		experimental: {
			asyncContext: true,
		}
	},
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			target: "browser",
			plugins: () => [serverFunctions.client(), reactRefresh()],
		},
		serverFunctions.router()
	],
});
`,
				"app/App.tsx": js`
import { useEffect, useState } from "react";
async function greetServer(name: string) {
	"use server";
	const { getEvent, getRequestProtocol, HTTPEventSymbol } = await import("vinxi/server");
	let event = getEvent();
	let wrappedEvent = {
		[HTTPEventSymbol]: event
	}
	let wrappedH3Event = {
		[Symbol("h3Event")]: event
	}
	return {
		method: getEvent().method,
		protocol1: getRequestProtocol(),
		protocol2: getRequestProtocol(event),
		protocol3: getRequestProtocol(wrappedEvent),
		protocol4: getRequestProtocol(wrappedH3Event),
	};
}

export function App() {
	const [data, setData] = useState<any>(null);
	useEffect(() => {
		greetServer("client").then(setData);
	}, []);
	return data ? <div data-test-id="data">{JSON.stringify(data)}</div> : null;
}			
`,
			},
			template: "react-srv-fn",
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

		// let responses = app.collectResponses();
		let body = await page.$("body");
		await body.waitForSelector("[data-test-id=data]");

		let result = {
			method: "POST",
			protocol1: "http",
			protocol2: "http",
			protocol3: "http",
			protocol4: "http",
		};
		expect(await app.getHtml("[data-test-id=data]")).toBe(
			prettyHtml(`<div data-test-id="data">${JSON.stringify(result)}</div>`),
		);
	});
});

test.describe("async-context-prod", () => {
	let fixture: Fixture;
	let appFixture: AppFixture;

	test.beforeAll(async () => {
		fixture = await createFixture({
			files: {
				"app.config.js": js`
import reactRefresh from "@vitejs/plugin-react";
import { serverFunctions } from "@vinxi/server-functions/plugin";
import { createApp } from "vinxi";

export default createApp({
	server: {
		experimental: {
			asyncContext: true,
		}
	},
	routers: [
		{
			name: "public",
			mode: "static",
			dir: "./public",
			base: "/",
		},
		{
			name: "client",
			mode: "spa",
			handler: "./index.html",
			target: "browser",
			plugins: () => [serverFunctions.client(), reactRefresh()],
		},
		serverFunctions.router()
	],
});
`,
				"app/App.tsx": js`
import { useEffect, useState } from "react";

async function greetServer(name: string) {
	"use server";
	const { getEvent, getRequestProtocol, HTTPEventSymbol } = await import("vinxi/server");
	let event = getEvent();
	let wrappedEvent = {
		[HTTPEventSymbol]: event
	}
	let wrappedH3Event = {
		[Symbol("h3Event")]: event
	}
	return {
		method: getEvent().method,
		protocol1: getRequestProtocol(),
		protocol2: getRequestProtocol(event),
		protocol3: getRequestProtocol(wrappedEvent),
		protocol4: getRequestProtocol(wrappedH3Event),
	};
}

export function App() {
	const [data, setData] = useState<any>(null);
	useEffect(() => {
		greetServer("client").then(setData);
	}, []);
	return data ? <div data-test-id="data">{JSON.stringify(data)}</div> : null;
}			
`,
			},
			template: "react-srv-fn",
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

		// let responses = app.collectResponses();
		let body = await page.$("body");
		await body.waitForSelector("[data-test-id=data]");

		let result = {
			method: "POST",
			protocol1: "http",
			protocol2: "http",
			protocol3: "http",
			protocol4: "http",
		};
		expect(await app.getHtml("[data-test-id=data]")).toBe(
			prettyHtml(`<div data-test-id="data">${JSON.stringify(result)}</div>`),
		);
	});
});
