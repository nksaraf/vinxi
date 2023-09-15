import { dirname, resolve } from "pathe";

const PREFIX = "\0virtual:";

export function virtual(modules, name = "", cache = {}) {
	const _modules = new Map();

	for (const [id, mod] of Object.entries(modules)) {
		cache[id] = mod;
		_modules.set(id, mod);
		_modules.set(resolve(id), mod);
	}

	let config;
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
