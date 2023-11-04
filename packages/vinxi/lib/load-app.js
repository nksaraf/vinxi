import { loadConfig } from "c12";
import { fileURLToPath } from "url";

import { createApp } from "./app.js";
import { log } from "./logger.js";

/**
 *
 * @param {string | undefined} configFile
 * @returns {Promise<import("./app.js").App>}
 */
export async function loadApp(configFile = undefined, args = {}) {
	const stacks = typeof args.s === "string" ? [args.s] : args.s ?? [];
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
				log("Found vite.config.js with app config");
				// @ts-expect-error trying to send c12's config as app
				//
				return config;
			} else {
				log("No app config found. Assuming SPA app.");

				if (stacks.length) {
					log("Applying stacks:", ...stacks);
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
				var res = app.resolveSync(stack);
				const mod = await import(res);
				return mod.default;
			}
			const mod = await import(
				fileURLToPath(new URL(`../stack/${stack}.js`, import.meta.url))
			);
			return mod.default;
		}),
	);

	for (const stack of stacks) {
		await app.stack(stack);
	}

	return app;
}
