import { eventHandler, lazyEventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";

export default lazyEventHandler(async () => {
	const { doc } = await import("@vinxi/doc");

	return eventHandler(async (event) => {
		const routers = import.meta.env.ROUTERS;

		/** @type {import('openapi-types').OpenAPIV3.Document['paths']} */
		const paths = {};
		for (var router of routers) {
			const base = getManifest(router).base;
			const routes = await getManifest(router).routes();
			for (var route of routes) {
				const path = new URL(base + "." + route.path, "http://localhost:3000")
					.pathname;
				paths[path] = {
					get: {
						"": {},
					},
				};
			}
		}
		if (event.path === "/openapi") {
			/** @type {import('openapi-types').OpenAPIV3.Document} */
			const x = {
				paths,
				openapi: "3.0.0",
				info: {
					title: "Vinxi",
					version: "0.2.0",
					description: "Vinxi",
				},
			};
			return x;
		}
		return await doc(`file://` + event.path);
	});
});
