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
		async load(url) {
			const [id, query] = url.split("?");
			if (
				id ===
				fileURLToPath(new URL("../routes.js", import.meta.url)).replaceAll(
					"\\",
					"/",
				)
			) {
				const js = jsCode();
				const routesCode = JSON.stringify(
					await router.fileRouter?.getRoutes(),
					(k, v) => {
						if (!v) {
							return undefined;
						}

						if (k.startsWith("$$")) {
							const buildId = `${v.src}?${v.pick
								.map((p) => `pick=${p}`)
								.join("&")}`;

							const refs = {};
							for (var pick of v.pick) {
								refs[pick] = js.addNamedImport(pick, buildId);
							}
							return {
								require: `_$() => ({ ${Object.entries(refs)
									.map(([pick, namedImport]) => `'${pick}': ${namedImport}`)
									.join(", ")} })$_`,
								src: isBuild ? relative(root, buildId) : buildId,
							};
						} else if (k.startsWith("$")) {
							const buildId = `${v.src}?${v.pick
								.map((p) => `pick=${p}`)
								.join("&")}`;
							return {
								src: isBuild ? relative(root, buildId) : buildId,
								build: isBuild ? `_$() => import('${buildId}')$_` : undefined,
								import:
									router.build.target === "node"
										? `_$() => import('${buildId}')$_`
										: `_$(() => { const id = '${relative(
												root,
												buildId,
										  )}'; return import(import.meta.env.MANIFEST['${
												router.name
										  }'].inputs[id].output.path) })$_`,
							};
						}
						return v;
					},
				);
				const routes = routesCode
					.replaceAll('"_$(', "(")
					.replaceAll(')$_"', ")");
				const code = `${js.getImportStatements()}
				export default ${routes}`;
				return code;
			}
		},
	};
}

function jsCode() {
	let imports = new Map();
	let vars = 0;

	function addImport(p) {
		let id = imports.get(p);
		if (!id) {
			id = {};
			imports.set(p, id);
		}

		let d = "routeData" + vars++;
		id["default"] = d;
		return d;
	}

	function addNamedImport(name, p) {
		let id = imports.get(p);
		if (!id) {
			id = {};
			imports.set(p, id);
		}

		let d = "routeData" + vars++;
		id[name] = d;
		return d;
	}

	const getNamedExport = (p) => {
		let id = imports.get(p);

		delete id["default"];

		return Object.keys(id).length > 0
			? `{ ${Object.keys(id)
					.map((k) => `${k} as ${id[k]}`)
					.join(", ")} }`
			: "";
	};

	const getImportStatements = () => {
		return `${[...imports.keys()]
			.map(
				(i) =>
					`import ${
						imports.get(i).default
							? `${imports.get(i).default}${
									Object.keys(imports.get(i)).length > 1 ? ", " : ""
							  }`
							: ""
					} ${getNamedExport(i)} from '${i}';`,
			)
			.join("\n")}`;
	};

	return {
		addImport,
		addNamedImport,
		getImportStatements,
	};
}
