import { existsSync } from "fs";
import { rm } from "fs/promises";
import { isBuiltin } from "module";
import { fileURLToPath, pathToFileURL } from "url";

import { createApp } from "./app.js";
import { c, log } from "./logger.js";
import { basename, isAbsolute, join } from "./path.js";

function isBun() {
	return !!process.versions.bun;
}

async function fileExists(/** @type {string} */ path) {
	// @ts-ignore
	return isBun() ? Bun.file(path).exists() : existsSync(path);
}

const bundleConfigFile = async (
	/** @type {string} */ configFile,
	/** @type {string} */ out,
) => {
	const esbuild = await import("esbuild");

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

async function loadFile(
	/** @type {{ name?: string; configFile?: string }} */ options,
) {
	if (options.name) {
		for (const ext of ["js", "mjs", "ts", "tsx", "jsx", "mts"]) {
			const filepath = join(process.cwd(), `${options.name}.config.${ext}`);

			if (await fileExists(filepath)) {
				let out = `${options.name}.config.timestamp_${Date.now()}.${
					["ts", "js", "tsx", "jsx"].includes(ext) ? "js" : "mjs"
				}`;
				await bundleConfigFile(`${options.name}.config.${ext}`, out);
				const importedApp = await import(pathToFileURL(out).href).then((m) => ({
					export: m.default,
					path: filepath,
				}));

				await rm(out);
				return importedApp;
			}
		}

		return { export: null, path: null };
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
				const importedApp = await import(pathToFileURL(out).href).then((m) => ({
					export: m.default,
					path: filepath,
				}));
				await rm(out);
				return importedApp;
			}
		}

		return { export: null, path: null };
	}

	return {
		export: null,
		path: null,
	};
}

/**
 *
 * @param {string | undefined} configFile
 * @param {{ mode?: string }} args
 * @returns {Promise<import("./app.js").App | undefined>}
 */
export async function loadApp(configFile = undefined, args = {}) {
	/** @type {{ config: import("./app.js").App }}*/
	try {
		let appConfig = await loadFile(
			configFile
				? {
						configFile,
				  }
				: {
						name: "app",
				  },
		);

		if (appConfig.path) {
			if (!appConfig.export) {
				log(
					c.dim(
						c.green(
							`no vinxi app config found exported from ${basename(
								appConfig.path,
							)}`,
						),
					),
				);
				return undefined;
			}
			return appConfig.export;
		} else {
			const viteConfig = await loadFile({
				name: "vite",
			});

			// vinxi app config's have a "config" field
			if (viteConfig.path) {
				if (viteConfig.export.config) {
					log(
						c.dim(
							c.green(`found vinxi app config in ${basename(viteConfig.path)}`),
						),
					);
					return viteConfig.export;
				} else {
					log(c.dim(c.green("no vinxi app config found")));
					log(
						c.dim(c.green(`found vite config in ${basename(viteConfig.path)}`)),
					);

					const app = createApp({
						mode: args.mode,
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
								plugins: () => viteConfig.export.plugins ?? [],
							},
						],
					});

					return app;
				}
			}

			return undefined;
		}
	} catch (e) {
		console.error(e);

		return undefined;
	}
}
