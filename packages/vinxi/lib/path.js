import { join } from "pathe";

export * from "pathe";

export function virtualId(/** @type {string} */ moduleName) {
	return `virtual:${moduleName}`;
}

export function handlerModule(
	/** @type {import("./router-mode").Router} */ router,
) {
	return router.handler?.endsWith(".html")
		? router.handler
		: `#vinxi/handler/${router.name}`;
}

export function viteManifestPath(
	/** @type {import("./router-mode").Router} */ router,
) {
	// return join(router.outDir, router.base, ".vite", "manifest.json");
	return join(router.outDir, router.base, "manifest.json");
}
