import { LoaderClientProvider } from "@tanstack/react-loaders";
import { Route, Router } from "@tanstack/router";
import { RootRoute } from "@tanstack/router";
import { lazyRoute } from "@vinxi/react";
import fileRoutes from "vinxi/routes";

import { createLoaderClient } from "./loaderClient";
import Root from "./root";

const createNestedRoutes = (fileRoutes) => {
	function processRoute(routes, route, id, full) {
		const parentRoute = Object.values(routes).find((o) => {
			// if (o.id.endsWith("/index")) {
			// 	return false;
			// }
			return id.startsWith(o.path + "/");
		});

		if (!parentRoute) {
			routes.push({ ...route, path: id });
			return routes;
		}
		processRoute(
			parentRoute.children || (parentRoute.children = []),
			route,
			id.slice(parentRoute.path.length),
			full,
		);

		return routes;
	}

	return fileRoutes
		.sort((a, b) => a.path.length - b.path.length)
		.reduce((prevRoutes, route) => {
			return processRoute(prevRoutes, route, route.path, route.path);
		}, []);
};

type RouterContext = {
	loaderClient: ReturnType<typeof createLoaderClient>;
};

// Set up a Router instance
export const createRouter = (clientManifest, serverManifest) => {
	const rootRoute = RootRoute.withRouterContext<RouterContext>()({
		component: Root,
	});

	const routes = createNestedRoutes(fileRoutes);
	function createRoute(route, parent) {
		const parentRoute = new Route({
			path: route.path,
			component: lazyRoute(route.$component, clientManifest, serverManifest),
			errorComponent: route.$error
				? lazyRoute(
						route.$error,
						clientManifest,
						serverManifest,
						"ErrorBoundary",
				  )
				: undefined,
			pendingComponent: route.$loading
				? lazyRoute(route.$loading, clientManifest, serverManifest, "Loading")
				: undefined,
			loader: route.$$loader?.require().loader,
			...(route.$$config?.require().config ?? {}),
			getParentRoute: () => parent,
		});
		if (route.children) {
			parentRoute.addChildren(
				route.children.map((route) => createRoute(route, parentRoute)),
			);
		}
		return parentRoute;
	}
	const routeTree = rootRoute.addChildren([
		...routes.map((route) => {
			return createRoute(route, rootRoute);
		}),
	]);
	const loaderClient = createLoaderClient();

	const router = new Router({
		routeTree,
		defaultPreload: "intent",
		context: {
			loaderClient,
		},
		// On the server, dehydrate the loader client
		dehydrate: () => {
			return {
				loaderClient: loaderClient.dehydrate(),
			};
		},
		// On the client, rehydrate the loader client
		hydrate: (dehydrated) => {
			loaderClient.hydrate(dehydrated.loaderClient);
		},
		// Wrap our router in the loader client provider
		Wrap: ({ children }) => {
			return (
				<LoaderClientProvider loaderClient={loaderClient}>
					{children}
				</LoaderClientProvider>
			);
		},
	});

	// Provide hydration and dehydration functions to loader instances
	loaderClient.options = {
		...loaderClient.options,
		hydrateLoaderInstanceFn: (instance) =>
			router.hydrateData(instance.hashedKey) as any,
		dehydrateLoaderInstanceFn: (instance) =>
			router.dehydrateData(instance.hashedKey, () => instance.state),
	};

	return router;
};
// Register things for typesafety

declare module "@tanstack/router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
