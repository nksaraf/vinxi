import { dirname, resolve } from "../path.js";

const PREFIX = "\0virtual:";

/**
 *
 * @param {{ [key: string] : (ctx: { config: import("../vite-dev.d.ts").ViteConfig }) => (string | Promise<string>) }} modules
 * @param {string} name
 * @param {any} cache
 * @returns {import('../vite-dev.d.ts').Plugin}
 */
export function virtual(modules, name = "", cache = {}) {
	const _modules = new Map();

	for (const [id, mod] of Object.entries(modules)) {
		cache[id] = mod;
		_modules.set(id, mod);
		_modules.set(resolve(id), mod);
	}

	/** @type {import('../vite-dev.d.ts').ViteConfig} */
	let config;
	/** @type {import('../vite-dev.d.ts').ConfigEnv} */
	let env;

	return {
		name: `virtual:${name}`,
		configResolved(_config) {
			config = _config;
		},
		config(config, _env) {
			env = _env;
		},
		resolveId(id, importer) {
			if (id in modules) {
				return PREFIX + id;
			}

			if (importer) {
				const importerNoPrefix = importer.startsWith(PREFIX)
					? importer.slice(PREFIX.length)
					: importer;
				const resolved = resolve(dirname(importerNoPrefix), id);
				if (_modules.has(resolved)) {
					return PREFIX + resolved;
				}
			}

			return null;
		},

		async load(id) {
			if (!id.startsWith(PREFIX)) {
				return null;
			}

			const idNoPrefix = id.slice(PREFIX.length);
			if (!_modules.has(idNoPrefix)) {
				return null;
			}

			let m = _modules.get(idNoPrefix);
			if (typeof m === "function") {
				m = await m({
					env,
					config,
				});
			}

			cache[id.replace(PREFIX, "")] = m;

			return {
				code: m,
				map: null,
			};
		},
	};
}
