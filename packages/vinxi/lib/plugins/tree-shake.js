import plugin from "./tree-shake.babel.js";

export function treeShake() {
	return {
		name: "tree-shake",
		async transform(code, id) {
			const [path, queryString] = id.split("?");
			const query = new URLSearchParams(queryString);
			if (query.has("pick")) {
				const babel = await import("@babel/core");
				const transformed = babel.transform(code, {
					plugins: [[plugin, { pick: query.getAll("pick") }]],
				});

				return {
					code: transformed.code,
					map: transformed.map,
				};
			}
		},
	};
}
