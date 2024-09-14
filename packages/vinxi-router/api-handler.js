import { match } from "path-to-regexp";
import { eventHandler, toWebRequest, setContext } from "vinxi/http";
import fileRoutes from "vinxi/routes";

const routes = [
	...fileRoutes.map((route) => ({
		...route,
		handler: async (event) => {
			const mod = await route.$handler.import();
			return await mod.default(event);
		},
	})),
];

function createRouter(routes) {
	const builtRoutes = routes.map((route) => {
		const matcher = match(route.path);
		return {
			...route,
			matcher,
		};
	});

	return {
		async handle(event) {
			for (const route of builtRoutes) {
				const url = new URL(toWebRequest(event).url);
				const path = url.pathname.replace(import.meta.env.BASE_URL, "");

				const match = route.matcher(path)
				if (match) {
					// add params to context object
					setContext(event, 'params', { ...match.params });
					return await route.handler(event);
				}
			}

			return new Response("Not found", { status: 404 });
		},
	};
}

export default eventHandler(createRouter(routes).handle);
