import { relative } from "../path.js";

export const moduleId = "vinxi/routes";

/**
 *
 * @returns {import("../vite-dev.d.ts").Plugin}
 */
export function routes() {
	/**
	 * @type {Exclude<import("../router-modes.js").RouterSchema, import("../router-modes.js").StaticRouterSchema>}
	 */
	let router;
	/**
	 * @type {string}
	 */
	let root;
	/**
	 * @type {boolean}
	 */
	let isBuild;
	return {
		name: "vinxi:routes",
		/**
		 * @param {any} config
		 * @param {{ command: string; }} command
		 */
		config(config, command) {
			isBuild = command.command === "build";
		},
		/**
		 * @param {{ root: any; router: any; }} config
		 */
		configResolved(config) {
			root = config.root;
			router = config.router;
		},
		resolveId: {
			order: "pre",
			handler(id) {
				if (id === moduleId) {
					return id;
				}
			},
		},
		async load(id) {
			if (id === moduleId) {
				const js = jsCode();
				const routes = await router.internals.routes?.getRoutes();

				let routesCode = JSON.stringify(routes ?? [], (k, v) => {
					if (v === undefined) {
						return undefined;
					}

					if (k.startsWith("$$")) {
						const buildId = `${v.src}?${v.pick
							.map((/** @type {any} */ p) => `pick=${p}`)
							.join("&")}`;

						/**
						 * @type {{ [key: string]: string }}
						 */
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
							.map((/** @type {any} */ p) => `pick=${p}`)
							.join("&")}`;
						return {
							src: isBuild ? relative(root, buildId) : buildId,
							build: isBuild
								? `_$() => import(/* @vite-ignore */ '${buildId}')$_`
								: undefined,
							import:
								router.target === "server"
									? `_$() => import(/* @vite-ignore */ '${buildId}')$_`
									: `_$(() => { const id = '${relative(
											root,
											buildId,
									  )}'; return import(/* @vite-ignore */ import.meta.env.MANIFEST['${
											router.name
									  }'].inputs[id].output.path) })$_`,
						};
					}
					return v;
				});

				routesCode = routesCode.replaceAll('"_$(', "(").replaceAll(')$_"', ")");

				const code = `${js.getImportStatements()}
				export default ${routesCode}`;
				return code;
			}
		},
	};
}

function jsCode() {
	let imports = new Map();
	let vars = 0;

	/**
	 * @param {any} p
	 */
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

	/**
	 * @param {string | number} name
	 * @param {any} p
	 */
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

	const getNamedExport = (/** @type {any} */ p) => {
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
