import { directives } from "@vinxi/plugin-directives";
import { fileURLToPath } from "url";
import { chunkify } from "vinxi/lib/chunks";

import { CLIENT_REFERENCES_MANIFEST } from "./constants.js";

export function client({
	runtime = fileURLToPath(new URL("./references-runtime.js", import.meta.url)),
	manifest = CLIENT_REFERENCES_MANIFEST,
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
