/// <reference types="bun-types" />
import { loadConfig } from "c12";
import { existsSync } from "fs";
import { joinURL } from "ufo";
import { fileURLToPath, pathToFileURL } from "url";

import { createApp } from "./app.js";
import { log } from "./logger.js";

async function loadFile({ ...options }) {
	if (process.versions.bun) {
		if (options.name) {
			for (const ext of ["js", "ts", "mjs"]) {
				if (
					await Bun.file(
						process.cwd() + "/" + options.name + ".config." + ext,
					).exists()
				)
					return import(
						process.cwd() + "/" + options.name + ".config." + ext
					).then((m) => ({
						config: m.default,
					}));
			}
		} else if (options.configFile) {
			if (await Bun.file(process.cwd() + "/" + options.configFile).exists()) {
				return import(process.cwd() + "/" + options.configFile).then((m) => ({
					config: m.default,
				}));
			}
		}
	}

	if (options.name) {
		if (existsSync(process.cwd() + "/" + options.name + ".config.js")) {
			return import(
				joinURL(pathToFileURL(process.cwd()).href, `${options.name}.config.js`)
			).then((m) => ({
				config: m.default,
			}));
		} else if (existsSync(process.cwd() + "/" + options.name + ".config.mjs")) {
			return import(
				joinURL(pathToFileURL(process.cwd()).href, `${options.name}.config.mjs`)
			).then((m) => ({
				config: m.default,
			}));
		}
	} else if (options.configFile) {
		if (options.configFile.endsWith("js")) {
			return import(
				joinURL(pathToFileURL(process.cwd()).href, `${options.configFile}`)
			).then((m) => ({
				config: m.default,
			}));
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
