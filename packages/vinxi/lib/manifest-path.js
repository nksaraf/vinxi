import { join } from "pathe";

import { createRequire } from "node:module";

export const require = createRequire(import.meta.url);

export function viteManifestPath(
	/** @type {import("./router-mode").Router} */ router,
) {
	let vite = require("vite/package.json");
	if (vite.version.startsWith("5") || vite.version.startsWith("6")) {
		return join(router.outDir, router.base, ".vite", "manifest.json");
	}
	return join(router.outDir, router.base, "manifest.json");
}
