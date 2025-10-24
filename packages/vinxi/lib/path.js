import { isAbsolute, join } from "pathe";

export * from "pathe";

export function virtualId(/** @type {string} */ moduleName) {
	return `virtual:${moduleName}`;
}

export function handlerModule(
	/** @type {import("./service-mode").Service} */ service,
) {
	return service.handler?.endsWith(".html")
		? isAbsolute(service.handler)
			? service.handler
			: join(service.root, service.handler)
		: `$vinxi/handler/${service.name}`;
}
