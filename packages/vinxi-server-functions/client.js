import { directives, shimExportsPlugin } from "@vinxi/plugin-directives";
import { fileURLToPath } from "url";
import { chunkify } from "vinxi/lib/chunks";
import { normalize } from "vinxi/lib/path";

import { CLIENT_REFERENCES_MANIFEST } from "./constants.js";

export function client({
	runtime = normalize(
		fileURLToPath(new URL("./client-runtime.js", import.meta.url)),
	),
	manifest = CLIENT_REFERENCES_MANIFEST,
} = {}) {
	const serverModules = new Set();
	const clientModules = new Set();
	return [
		directives({
			hash: chunkify,
			runtime,
			transforms: [
				shimExportsPlugin({
					runtime: {
						module: runtime,
						function: "createServerReference",
					},
					onModuleFound: (mod) => {
						serverModules.add(mod);
					},
					hash: chunkify,
					apply: (code, id, options) => {
						return !options.ssr;
					},
					pragma: "use server",
				}),
			],
			onReference(type, reference) {
				if (type === "server") {
					serverModules.add(reference);
				} else {
					clientModules.add(reference);
				}
			},
		}),
		{
			name: "references-manifest",
			generateBundle() {
				this.emitFile({
					fileName: manifest,
					type: "asset",
					source: JSON.stringify({
						server: [...serverModules],
						client: [...clientModules],
					}),
				});
			},
		},
	];
}
