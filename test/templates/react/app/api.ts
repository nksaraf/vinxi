import { pathToRegexp } from "path-to-regexp";
import fileRoutes from "vinxi/routes";
import { H3Event, eventHandler, toWebRequest } from "vinxi/server";

const routes = [
	...fileRoutes.map((route) => ({
		...route,
		handler: async (event, params) => {
			const mod = await route.$handler.import();
			return await mod.default(event, params);
		},
	})),
];

function createRouter(routes) {
	const builtRoutes = routes.map((route) => {
		const keys = [];
		const regexp = pathToRegexp(route.path, keys);
		return {
			...route,
			regexp,
			keys,
		};
	});

	return {
		async handle(event) {
			for (const route of builtRoutes) {
				const url = new URL(toWebRequest(event).url);
				const path = url.pathname.replace(import.meta.env.BASE_URL, "");

				const match = route.regexp.exec(path);
				if (match) {
					const params = {};
					for (let i = 0; i < route.keys.length; i++) {
						params[route.keys[i].name] = match[i + 1];
					}
					return await route.handler(event, params);
				}
			}

			return new Response("Not found", { status: 404 });
		},
	};
}

const router = createRouter(routes);

export default eventHandler(async (event) => {
	return router.handle(event);
});
