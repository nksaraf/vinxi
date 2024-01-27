/// <reference types="vinxi/types/client" />
import {
	Loader,
	LoaderClient,
	LoaderClientProvider,
	createLoaderOptions,
	typedClient,
	useLoaderInstance,
} from "@tanstack/react-loaders";
import {
	ErrorComponent,
	Link,
	Outlet,
	RootRoute,
	Route,
	Router,
	RouterContext,
	RouterProvider,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { lazyRoute } from "@vinxi/react";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom/client";
import "vinxi/client";
import fileRoutes from "vinxi/routes";
import { getManifest } from "vinxi/manifest";

import { NotFoundError } from "./error";
import "./style.css";

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
function createRoute(route, parent) {
	const parentRoute = new Route({
		path: route.path,
		component: lazyRoute(route.$component, getManifest("client")),
		errorComponent: route.$error
			? lazyRoute(
					route.$error,
					getManifest("client"),
					undefined,
					"ErrorBoundary",
			  )
			: undefined,

		pendingComponent: route.$loading
			? lazyRoute(route.$loading, getManifest("client"), undefined, "Loading")
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

type PostType = {
	id: string;
	title: string;
	body: string;
};

const fetchPosts = async () => {
	console.log("Fetching posts...");
	await new Promise((r) => setTimeout(r, 500));
	return axios
		.get<PostType[]>("https://jsonplaceholder.typicode.com/posts")
		.then((r) => r.data.slice(0, 10));
};

const fetchPost = async (postId: string) => {
	console.log(`Fetching post with id ${postId}...`);
	await new Promise((r) => setTimeout(r, 500));
	const post = await axios
		.get<PostType>(`https://jsonplaceholder.typicode.com/posts/${postId}`)
		.then((r) => r.data);

	if (!post) {
		throw new NotFoundError(`Post with id "${postId}" not found!`);
	}

	return post;
};

const postsLoader = new Loader({
	key: "posts",
	fn: fetchPosts,
});

const postLoader = new Loader({
	key: "post",
	fn: fetchPost,
	onInvalidate: ({ client }) => {
		typedClient(client).invalidateLoader({ key: "posts" });
	},
});

const loaderClient = new LoaderClient({
	loaders: [postsLoader, postLoader],
});

declare module "@tanstack/react-loaders" {
	interface Register {
		loaderClient: typeof loaderClient;
	}
}

const routerContext = new RouterContext<{
	loaderClient: typeof loaderClient;
}>();

const rootRoute = routerContext.createRootRoute({
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
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);

	root.render(
		// <React.StrictMode>
		<LoaderClientProvider client={loaderClient}>
			<RouterProvider router={router} />
		</LoaderClientProvider>,
		// </React.StrictMode>,
	);
}
