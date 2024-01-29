/// <reference types="bun-types" />
import { loadConfig } from "c12";
import { existsSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";

import { createApp } from "./app.js";
import { log } from "./logger.js";
import { join } from "./path.js";

function isBun() {
	return !!process.versions.bun;
}

async function fileExists(path) {
	return isBun() ? Bun.file(path).exists() : existsSync(path);
}

async function loadFile({ ...options }) {
	if (options.name) {
		for (const ext of ["js", "mjs", "ts"]) {
			if (ext === "ts" && !isBun()) continue;

			const filepath = join(process.cwd(), `${options.name}.config.${ext}`);

			if (await fileExists(filepath)) {
				return import(
					pathToFileURL(filepath).href + `?time=${Date.now()}`
				).then((m) => ({
					config: m.default,
				}));
			}
		}
	} else if (options.configFile) {
		const ext = options.configFile.slice(
			options.configFile.lastIndexOf(".") + 1,
		);
		if (["js", "mjs", "ts"].includes(ext) && (ext !== "ts" || isBun())) {
			const filepath = join(process.cwd(), options.configFile);
			if (await fileExists(filepath)) {
				return import(
					pathToFileURL(filepath).href + `?time=${Date.now()}`
				).then((m) => ({
					config: m.default,
				}));
			}
		}
	}

	return loadConfig({
		jitiOptions: {
			esmResolve: true,
			nativeModules: ["acorn"],
		},
		...options,
	});
}

/**
 *
 * @param {string | undefined} configFile
 * @returns {Promise<import("./app.js").App>}
 */
export async function loadApp(configFile = undefined, args = {}) {
	const stacks = typeof args.s === "string" ? [args.s] : args.s ?? [];
	/** @type {{ config: import("./app.js").App }}*/
	try {
		let { config: app } = await loadFile(
			configFile
				? {
						configFile,
				  }
				: {
						name: "app",
				  },
		);

		if (!app.config) {
			const { config } = await loadFile({
				name: "vite",
			});

			if (config.config) {
				log("Found vite.config.js with app config");
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
							type: "static",
							dir: "./public",
						},
						{
							name: "client",
							type: "spa",
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
