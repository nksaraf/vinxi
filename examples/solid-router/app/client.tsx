/// <reference types="vinxi/client" />
import { MetaProvider } from "@solidjs/meta";
import { Router, Routes } from "@solidjs/router";
import { NoHydration, Suspense, hydrate } from "solid-js/web";
import fileRoutes from "vinxi/routes";
import "vinxi/runtime/client";

import { createAssets } from "./Assets";
import App from "./app";
import lazyRoute from "./lazy-route";

const routes = fileRoutes.map((route) => ({
	path: route.path,
	component: lazyRoute(
		route.component,
		import.meta.env.MANIFEST["client"],
		import.meta.env.MANIFEST["ssr"],
	),
}));

const Assets = createAssets();

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
