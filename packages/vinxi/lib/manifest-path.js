import { join } from "pathe";

import { createRequire } from "node:module";

export const require = createRequire(import.meta.url);

export function viteManifestPath(
	/** @type {import("./service-mode").Service} */ service,
) {
	let vite = require("vite/package.json");
	if (vite.version.startsWith("5") || vite.version.startsWith("6")) {
		return join(service.outDir, service.base, ".vite", "manifest.json");
	}
	return join(service.outDir, service.base, "manifest.json");
}
