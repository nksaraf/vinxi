/// <reference types="vinxi/client" />
import {
	Loader,
	LoaderClient,
	LoaderClientProvider,
} from "@tanstack/react-loaders";
import {
	Link,
	Outlet,
	RootRoute,
	Route,
	Router,
	RouterProvider,
} from "@tanstack/router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { lazyRoute } from "@vinxi/react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import fileRoutes from "vinxi/routes";
import "vinxi/runtime/client";

import { fetchPost, fetchPosts } from "./db";
import "./style.css";

const postsLoader = new Loader({
	fn: fetchPosts,
});

const postLoader = new Loader({
	fn: fetchPost,
	onInvalidate: () => {
		postsLoader.invalidate();
	},
});

const loaderClient = new LoaderClient({
	getLoaders: () => ({
		posts: postsLoader,
		post: postLoader,
	}),
});

declare module "@tanstack/react-loaders" {
	interface Register {
		loaderClient: typeof loaderClient;
	}
}

type RouterContext = {
	loaderClient: typeof loaderClient;
};

const rootRoute = RootRoute.withRouterContext<RouterContext>()({
	component: () => {
		return (
			<>
				<div className="p-2 flex gap-2 text-lg">
					<Link
						to="/"
						activeProps={{
							className: "font-bold",
						}}
						activeOptions={{ exact: true }}
					>
						Home
					</Link>{" "}
					<Link
						to={"/posts"}
						activeProps={{
							className: "font-bold",
						}}
					>
						Posts
					</Link>
				</div>
				<hr />
				<Outlet />
				{/* Start rendering router matches */}
				<TanStackRouterDevtools position="bottom-right" />
			</>
		);
	},
});

const defineRoutes = (fileRoutes) => {
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

const routes = defineRoutes(fileRoutes);
console.log(routes);

function createRoute(route, parent) {
	const parentRoute = new Route({
		path: route.path,
		component: lazyRoute(route.$component, import.meta.env.MANIFEST["client"]),
		errorComponent: route.$error
			? lazyRoute(
					route.$error,
					import.meta.env.MANIFEST["client"],
					undefined,
					"ErrorBoundary",
			  )
			: undefined,
		pendingComponent: route.$loading
			? lazyRoute(
					route.$loading,
					import.meta.env.MANIFEST["client"],
					undefined,
					"Loading",
			  )
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

// Set up a Router instance
const router = new Router({
	routeTree,
	defaultPreload: "intent",
	context: {
		loaderClient,
	},
});

// Register things for typesafety
declare module "@tanstack/router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);

	root.render(
		<StrictMode>
			<LoaderClientProvider loaderClient={loaderClient}>
				<RouterProvider router={router} />
			</LoaderClientProvider>
		</StrictMode>,
	);
}
