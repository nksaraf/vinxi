import { relative } from "node:path";
import { fileURLToPath } from "node:url";

export function routes() {
	let router;
	let root;
	let isBuild;
	return {
		name: "vinxi:routes",
		config(config, command) {
			isBuild = command.command === "build";
		},
		configResolved(config) {
			root = config.root;
			router = config.router;
		},
		load(id) {
			if (id === fileURLToPath(new URL("../routes.js", import.meta.url))) {
				const code = `export default ${JSON.stringify(
					router.fileRouter?.routes,
					(k, v) => {
						if (k === "component") {
							return {
								src: isBuild ? relative(root, v) : v,
								import: isBuild ? `_$() => import('${v}')$_` : undefined,
							};
						}
						return v;
					},
				)}`;
				return code.replaceAll('"_$(', "(").replaceAll(')$_"', ")");

				// return `export default ${JSON.stringify(router.fileRouter?.routes)}`;
			}
		},
	};
}
