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
