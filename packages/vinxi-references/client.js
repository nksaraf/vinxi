import { directives } from "@vinxi/plugin-directives";
import { fileURLToPath } from "url";

import { CLIENT_REFERENCES_MANIFEST, hash } from "./constants.js";

export function client({
	runtime = fileURLToPath(new URL("./references-runtime.js", import.meta.url)),
	manifest = CLIENT_REFERENCES_MANIFEST,
} = {}) {
	const serverModules = new Set();
	const clientModules = new Set();
	return [
		directives({
			hash: (e) => `c_${hash(e)}`,
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
