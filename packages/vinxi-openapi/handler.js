import { eventHandler, lazyEventHandler } from "vinxi/server";

export default lazyEventHandler(async () => {
	const { doc } = await import("@vinxi/doc");

	return eventHandler(async (event) => {
		const routers = import.meta.env.ROUTERS;

		console.log(
			await Promise.all(
				routers.map((router) => import.meta.env.MANIFEST[router].routes()),
			),
		);

		/** @type {import('openapi-types').OpenAPIV3.Document['paths']} */
		const paths = {};
		for (var router of routers) {
			const base = import.meta.env.MANIFEST[router].base;
			const routes = await import.meta.env.MANIFEST[router].routes();
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
					version: "1.0.0",
					description: "Vinxi",
				},
			};
			return x;
		}
		console.log(event.path);

		return await doc(`file://` + event.path);
	});
});
