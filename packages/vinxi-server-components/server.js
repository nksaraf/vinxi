import {
	decorateExportsPlugin,
	directives,
	shimExportsPlugin,
} from "@vinxi/plugin-directives";
import { chunkify } from "vinxi/lib/chunks";

import { SERVER_REFERENCES_MANIFEST } from "./constants.js";

/**
 *
 * @param {*} param0
 * @returns {import('vinxi').Plugin[]}
 */
export function server({
	resolve = {
		conditions: ["react-server", "node", "import", process.env.NODE_ENV],
	},
	runtime = "@vinxi/react-server-dom/runtime",
	transpileDeps = ["react", "react-dom", "@vinxi/react-server-dom"],
	manifest = SERVER_REFERENCES_MANIFEST,
	transforms = undefined,
} = {}) {
	const serverModules = new Set();
	const clientModules = new Set();
	return [
		directives({
			hash: chunkify,
			runtime,
			onReference(type, reference) {
				if (type === "server") {
					serverModules.add(reference);
				} else {
					clientModules.add(reference);
				}
			},
			transforms: [
				decorateExportsPlugin({
					runtime: {
						module: runtime,
						function: "createServerReference",
					},
					onModuleFound: (mod) => {
						serverModules.add(mod);
					},
					hash: chunkify,
					apply: (code, id, options) => {
						return options.ssr;
					},
					pragma: "use server",
				}),
				shimExportsPlugin({
					runtime: {
						module: runtime,
						function: "createClientReference",
					},
					onModuleFound: (mod) => {
						clientModules.add(mod);
					},
					hash: chunkify,
					apply: (code, id, options) => {
						return options.ssr;
					},
					pragma: "use client",
				}),
			],
		}),
		buildServerComponents({
			resolve,
			transpileDeps,
			manifest,
			modules: {
				server: serverModules,
				client: clientModules,
			},
		}),
	];
}

/**
 *
 * @param {*} param0
 * @returns {import('vinxi').Plugin}
 */
export function buildServerComponents({
	resolve = {
		conditions: ["react-server", "node", "import", process.env.NODE_ENV],
	},
	transpileDeps = ["react", "react-dom", "@vinxi/react-server-dom"],
	manifest = SERVER_REFERENCES_MANIFEST,
	modules = {
		server: new Set(),
		client: new Set(),
	},
}) {
	return {
		name: "server-components-hmr",
		handleHotUpdate({ file }) {
			// clear vite module cache so when its imported again, we will
			// fetch(`http://localhost:3000/__refresh`, {
			//   method: 'POST',
			//   headers: {'Content-Type': 'application/json'},
			//   body: JSON.stringify({file}),
			// })
			//   .then(() => {})
			//   .catch(err => console.error(err));
		},
		config(inlineConfig, env) {
			if (env.command === "build") {
				return {
					build: {
						rollupOptions: {
							onwarn: (warning, warn) => {
								// suppress warnings about source map issues for now
								// these are caused originally by rollup trying to complain about directives
								// in the middle of the files
								// TODO: fix source map issues
								if (warning.code === "SOURCEMAP_ERROR") {
									return;
								}
							},
							output: {
								// preserve the export names of the server actions in chunks
								minifyInternalExports: false,
								manualChunks: (chunk) => {
									// server references should be emitted as separate chunks
									// so that we can load them individually when server actions
									// are called. we need to do this in manualChunks because we don't
									// want to run a preanalysis pass just to identify these
									if (modules.server.has(chunk)) {
										return chunkify(chunk);
									}
								},
								// we want to control the chunk names so that we can load them
								// individually when server actions are called
								chunkFileNames: "[name].mjs",
								entryFileNames: "[name].mjs",
							},
						},
					},
					ssr: {
						resolve: {
							externalConditions: resolve.conditions,
							conditions: resolve.conditions,
						},
						noExternal: true,
					},
				};
			} else {
				return {
					ssr: {
						resolve: {
							externalConditions: resolve.conditions,
							conditions: resolve.conditions,
						},
						noExternal: true,
						external: transpileDeps,
					},
				};
			}
		},
		generateBundle() {
			this.emitFile({
				fileName: manifest,
				type: "asset",
				source: JSON.stringify({
					server: [...modules.server],
					client: [...modules.client],
				}),
			});
		},
	};
}
