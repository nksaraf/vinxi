/// <reference types="bun-types" />
import { existsSync } from "fs";
import { rm } from "fs/promises";
import { isBuiltin } from "module";
import { fileURLToPath, pathToFileURL } from "url";

import { createApp } from "./app.js";
import { log } from "./logger.js";
import { isAbsolute, join } from "./path.js";

function isBun() {
	return !!process.versions.bun;
}

async function fileExists(path) {
	return isBun() ? Bun.file(path).exists() : existsSync(path);
}

const bundleConfigFile = async (configFile, out) => {
	const esbuild = await import("esbuild");

	// const out = `app.config.timestamp_${Date.now()}.js`;
	await esbuild.build({
		entryPoints: [configFile],
		bundle: true,
		outfile: out,
		platform: "node",
		format: "esm",
		resolveExtensions: [".js", ".mjs", ".ts", ".jsx", ".tsx", ".mts"],
		plugins: [
			{
				name: "externalize-deps",
				setup(build) {
					build.onResolve(
						{ filter: /^[^.].*/ },
						async ({ path: id, importer, kind }) => {
							if (
								kind === "entry-point" ||
								isAbsolute(id) ||
								id.match(/node:.*/)
							) {
								return;
							}

							// With the `isNodeBuiltin` check above, this check captures if the builtin is a
							// non-node built-in, which esbuild doesn't know how to handle. In that case, we
							// externalize it so the non-node runtime handles it instead.
							if (isBuiltin(id)) {
								return { external: true };
							}

							return { external: true };
						},
					);
				},
			},
		],
		loader: {
			".js": "js",
			".ts": "ts",
			".jsx": "jsx",
			".tsx": "tsx",
			".mjs": "js",
			".mts": "ts",
		},
	});
};

async function loadFile({ ...options }) {
	if (options.name) {
		for (const ext of ["js", "mjs", "ts", "tsx", "jsx", "mts"]) {
			const filepath = join(process.cwd(), `${options.name}.config.${ext}`);

			if (await fileExists(filepath)) {
				let out = `${options.name}.config.timestamp_${Date.now()}.${
					["ts", "js", "tsx", "jsx"].includes(ext) ? "js" : "mjs"
				}`;
				await bundleConfigFile(`${options.name}.config.${ext}`, out);
				const importedApp = import(pathToFileURL(out).href).then((m) => ({
					config: m.default,
				}));

				await rm(out);
				return importedApp;
			}
		}

		throw new Error(`Config file not found: ${options.name}`);
	} else if (options.configFile) {
		const ext = options.configFile.slice(
			options.configFile.lastIndexOf(".") + 1,
		);
		const configFileName = options.configFile.slice(
			0,
			options.configFile.lastIndexOf("."),
		);

		if (["js", "mjs", "ts", "tsx", "jsx", "mts"].includes(ext)) {
			const filepath = join(process.cwd(), `${configFileName}.${ext}`);
			if (await fileExists(filepath)) {
				let out = `${configFileName}.timestamp_${Date.now()}.${
					["ts", "js", "tsx", "jsx"].includes(ext) ? "js" : "mjs"
				}`;
				await bundleConfigFile(options.configFile, out);
				const importedApp = import(pathToFileURL(out).href).then((m) => ({
					config: m.default,
				}));
				await rm(out);
				return importedApp;
			}
		}

		throw new Error(`Config file not found: ${options.configFile}`);
	}
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
