/// <reference types="vinxi/client" />
import { MetaProvider } from "@solidjs/meta";
import { Router, Routes } from "@solidjs/router";
import { createAssets, lazyRoute } from "@vinxi/solid";
import { NoHydration, Suspense, hydrate } from "solid-js/web";
import fileRoutes from "vinxi/routes";
import "vinxi/runtime/client";

import App from "./root";

const Assets = createAssets(
	import.meta.env.MANIFEST["client"].handler,
	import.meta.env.MANIFEST["client"],
);

function createRoute(route) {
	return {
		path: route.path,
		component: lazyRoute(route.$component, import.meta.env.MANIFEST["client"]),
		data: route.$$data ? route.$$data.require().routeData : null,
		children: route.children ? route.children.map(createRoute) : null,
	};
}

const routes = fileRoutes.map(createRoute);

function FileRoutes() {
	return routes as any;
}

hydrate(
	() => (
		<MetaProvider>
			<Router>
				<App
					assets={
						<>
							<NoHydration></NoHydration>
							<Suspense>
								<Assets />
							</Suspense>
						</>
					}
					scripts={
						<>
							<NoHydration></NoHydration>
						</>
					}
				>
					<Suspense>
						<Routes>
							<FileRoutes />
						</Routes>
					</Suspense>
				</App>
			</Router>
		</MetaProvider>
	),
	document,
);
