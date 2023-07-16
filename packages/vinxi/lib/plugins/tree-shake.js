import plugin from "./tree-shake.babel.js";

export function treeShake() {
	let config;
	return {
		name: "tree-shake",
		enforce: "pre",
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		async transform(code, id) {
			const [path, queryString] = id.split("?");
			const query = new URLSearchParams(queryString);
			if (query.has("pick")) {
				const babel = await import("@babel/core");
				const transformed = babel.transform(code, {
					plugins: [
						...(config.router.build?.babel?.plugins ?? []),
						[plugin, { pick: query.getAll("pick") }],
					],
				});

				return {
					code: transformed.code,
					map: transformed.map,
				};
			}
		},
	};
}
