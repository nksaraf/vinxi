/// <reference types="vinxi/types/client" />
import { lazyRoute } from "@vinxi/react";
import { Suspense } from "react";
import { Outlet, RouterProvider } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import "vinxi/client";
import { getManifest } from "vinxi/manifest";
import routes from "vinxi/routes";

import { Layout } from "./components/Layout";

function createRouter() {
	const createNestedRoutes = (fileRoutes) => {
		function processRoute(routes, route, id, full) {
			const parentRoute = Object.values(routes).find((o) => {
				return id.startsWith(o.path + "/");
			});

			if (!parentRoute) {
				routes.push({
					...route,
					path: id,
				});
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

	const nestedRoutes = createNestedRoutes(routes);

	function createRoute(route) {
		return {
			path:
				route.path === "/"
					? undefined
					: route.path.length > 1 && route.path.startsWith("/")
					? route.path.slice(1)
					: route.path,
			index: route.path === "/",
			Component: lazyRoute(route.$component, getManifest("client")),
			...(route.$$meta ? { meta: route.$$meta } : {}),
			children: route.children?.map(createRoute),
			...(route.$$loader
				? {
						loader: route.$$loader.require().loader,
				  }
				: {}),
		};
	}

	const router = createBrowserRouter([
		{
			children: nestedRoutes.map(createRoute),
			Component: () => {
				return (
					<Layout sections={[]}>
						<Suspense>
							<Outlet />
						</Suspense>
					</Layout>
				);
			},
			ErrorBoundary: () => {
				return (
					<Layout sections={[]}>
						<Suspense>
							<Outlet />
						</Suspense>
					</Layout>
				);
			},
		},
	]);
	return router;
}

const router = createRouter();

export function Router() {
	return <RouterProvider router={router} />;
}
