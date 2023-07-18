import plugin from "./tree-shake.babel.js";

export function treeShake() {
	let config;
	let cache = {};
	let server;

	async function transform(id, code) {
		const [path, queryString] = id.split("?");
		const query = new URLSearchParams(queryString);
		if (query.has("pick")) {
			const babel = await import("@babel/core");
			const transformed = babel.transform(code, {
				plugins: [
					...(config.router.build?.babel?.plugins ?? []),
					"@babel/plugin-syntax-jsx",
					["@babel/plugin-syntax-typescript", { isTSX: true }],
					[plugin, { pick: query.getAll("pick") }],
				],
			});

			return transformed;

			// cache[path] ??= {};
			// cache[path][id] ??= transformed.code;

			// return {
			// 	code: transformed.code,
			// 	map: transformed.map,
			// };
		}
	}
	return {
		name: "tree-shake",
		enforce: "pre",
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		configureServer(s) {
			server = s;
		},
		async handleHotUpdate(ctx) {
			if (cache[ctx.file]) {
				const mods = [];
				const newCode = await ctx.read();
				for (const [id, code] of Object.entries(cache[ctx.file])) {
					const { code: transformedCode } = await transform(id, newCode);

					if (transformedCode !== code) {
						mods.push(server.moduleGraph.getModuleById(id));
					}

					cache[ctx.file] ??= {};
					cache[ctx.file][id] = transformedCode;
					// server.moduleGraph.setModuleSource(id, code);
				}

				return mods;
			}
			// 	const mods = [];
			// 	[...server.moduleGraph.urlToModuleMap.entries()].forEach(([url, m]) => {
			// 		if (m.file === ctx.file && m.id.includes("pick=")) {
			// 			if (!m.id.includes("pick=loader")) {
			// 				mods.push(m);
			// 			}
			// 		}
			// 	});
			// 	return mods;
			// 	// this.router.updateRoute(ctx.path);
			// }
		},
		async transform(code, id) {
			const [path, queryString] = id.split("?");
			const query = new URLSearchParams(queryString);
			if (query.has("pick")) {
				const transformed = await transform(id, code);

				cache[path] ??= {};
				cache[path][id] = transformed.code;

				return {
					code: transformed.code,
					map: transformed.map,
				};
			}
		},
	};
}
