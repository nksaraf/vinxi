import { pathToRegexp } from "path-to-regexp";
import { eventHandler, toWebRequest } from "vinxi/http";
import fileRoutes from "vinxi/routes";

const routes = [
	...fileRoutes.map((route) => ({
		...route,
		handler: async (event, params) => {
			const mod = await route.$handler.import();
			event.context['params'] = params
			return await mod.default(event);
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
					// add params to context object
					event.context['params'] = params
					return await route.handler(event);
				}
			}

			return new Response("Not found", { status: 404 });
		},
	};
}

export default eventHandler(createRouter(routes).handle);
