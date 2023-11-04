import { loadConfig } from "c12";
import chokidar from "chokidar";
import { fileURLToPath } from "url";

import { createApp } from "./app.js";

/**
 *
 * @param {string | undefined} configFile
 * @returns {Promise<import("./app.js").App>}
 */
export async function loadApp(configFile = undefined, args = {}) {
	const stacks = typeof args.s === "string" ? [args.s] : args.s ?? [];
	console.log(stacks);
	/** @type {{ config: import("./app.js").App }}*/
	try {
		let { config: app } = await loadConfig(
			configFile
				? {
						configFile,
						jitiOptions: {
							esmResolve: true,
							nativeModules: ["acorn"],
						},
				  }
				: {
						name: "app",
						jitiOptions: {
							esmResolve: true,
							nativeModules: ["acorn"],
						},
				  },
		);

		if (!app.config) {
			const { config } = await loadConfig({
				name: "vite",
				jitiOptions: {
					esmResolve: true,
					nativeModules: ["acorn"],
				},
			});

			if (config.config) {
				console.warn("Found vite.config.js with app config");
				// @ts-expect-error trying to send c12's config as app
				//
				return config;
			} else {
				console.warn("No app config found. Assuming SPA app.");

				if (stacks.length) {
					return applyStacks(createApp({}), stacks);
				}

				const app = createApp({
					routers: [
						{
							name: "public",
							mode: "static",
							dir: "./public",
						},
						{
							name: "client",
							mode: "spa",
							handler: "./index.html",
							target: "browser",
							plugins: () => config.plugins ?? [],
						},
					],
				});

				return applyStacks(app, stacks);
			}
		}

		return applyStacks(app, stacks);
	} catch (e) {
		console.error(e);

		return undefined;
	}
}

async function applyStacks(app, s) {
	const { default: resolve } = await import("resolve");
	const stacks = await Promise.all(
		s.map(async (stack) => {
			if (stack.includes("/") || stack.includes("@")) {
				var res = resolve.sync(stack, { basedir: app.config.root });
				const mod = await import(res);
				return mod.default;
			}
			const mod = await import(
				fileURLToPath(new URL(`../stack/${stack}.js`, import.meta.url))
			);
			return mod.default;
		}),
	);

	console.log(stacks);

	for (const stack of stacks) {
		await app.stack(stack);
	}

	return app;
}
