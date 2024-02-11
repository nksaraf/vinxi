/// <reference types="vinxi/types/client" />
import { lazyRoute } from "@vinxi/react";
import { createAssets } from "@vinxi/react";
import { pathToRegexp } from "path-to-regexp";
import { Suspense } from "react";
import { Root, hydrateRoot } from "react-dom/client";
import "vinxi/client";
import { getManifest } from "vinxi/manifest";
import fileRoutes from "vinxi/routes";
import { Route, Router } from "wouter";
import makeCachedMatcher from "wouter/matcher";

import App from "./app";

const routes = fileRoutes.map((route) => ({
	path: route.path,
	component: lazyRoute(
		route.$component,
		getManifest("client"),
		getManifest("ssr"),
	),
}));

const convertPathToRegexp = (path) => {
	let keys = [];

	// we use original pathToRegexp package here with keys
	const regexp = pathToRegexp(path, keys, { strict: true });
	return { keys, regexp };
};

const customMatcher = makeCachedMatcher(convertPathToRegexp);

const Assets = createAssets(
	getManifest("client").handler,
	getManifest("client"),
);
window.$root =
	window.$root ||
	hydrateRoot(
		document,
		<App
			assets={
				<Suspense>
					<Assets />
				</Suspense>
			}
		>
			<Suspense>
				<Router matcher={customMatcher} base={(window as any).base}>
					{routes.map((route) => (
						<Route
							path={route.path}
							key={route.path}
							component={route.component}
						/>
					))}
				</Router>
			</Suspense>
		</App>,
	);
