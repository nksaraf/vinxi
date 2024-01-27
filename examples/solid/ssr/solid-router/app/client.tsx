/// <reference types="vinxi/types/client" />
import { MetaProvider } from "@solidjs/meta";
import { Router, Routes } from "@solidjs/router";
import { createAssets, lazyRoute } from "@vinxi/solid";
import { NoHydration, Suspense, hydrate } from "solid-js/web";
import "vinxi/client";
import fileRoutes from "vinxi/routes";
import { getManifest } from "vinxi/manifest";

import App from "./app";

const Assets = createAssets(
	getManifest("client").handler,
	getManifest("client"),
);

function createRoute(route) {
	return {
		path: route.path,
		component: lazyRoute(route.$component, getManifest("client")),
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
