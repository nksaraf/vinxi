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
export function serverActions({
	resolve = {
		conditions: ["react-server"],
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
	];
}
