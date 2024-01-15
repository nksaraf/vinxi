// import jsx from "@babel/plugin-syntax-jsx";
// import typescript from "@babel/plugin-syntax-typescript";
import { basename } from '../path.js';
import plugin from "./tree-shake.babel.js";

/**
 *
 * @returns {import("../vite-dev.d.ts").Plugin}
 */
export function treeShake() {
	/** @type {import('../vite-dev.d.ts').ViteConfig} */
	let config;
	let cache = {};
	let server;

	async function transform(id, code) {
		const [path, queryString] = id.split("?");
		const query = new URLSearchParams(queryString);
		if (query.has("pick")) {
			const babel = await import("@babel/core");
			const transformed = await babel.transformAsync(code, {
				plugins: [
					[plugin, { pick: query.getAll("pick") }],
				],
				parserOpts: {
					plugins: [
						'jsx',
						'typescript',
					],
				},
				filename: basename(id),
				ast: false,
				sourceMaps: true,
				configFile: false,
				babelrc: false,
				sourceFileName: id,
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
			const ext = path.split(".").pop();
			if (query.has("pick") && ["js", "jsx", "ts", "tsx"].includes(ext)) {
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
