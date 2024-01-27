/// <reference types="vinxi/types/client" />
import { MDXProvider } from "@mdx-js/react";
import { lazyRoute } from "@vinxi/react";
import { pathToRegexp } from "path-to-regexp";
import { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "vinxi/client";
import fileRoutes from "vinxi/routes";
import { Link, Route, Router } from "wouter";
import makeCachedMatcher from "wouter/matcher";
import { getManifest } from "vinxi/manifest";

import "./style.css";

const routes = fileRoutes.map((route) => ({
	path: route.path,
	component: lazyRoute(route.$component, getManifest("client")),
}));

const convertPathToRegexp = (path) => {
	let keys = [];

	// we use original pathToRegexp package here with keys
	const regexp = pathToRegexp(path, keys, { strict: true });
	return { keys, regexp };
};

const customMatcher = makeCachedMatcher(convertPathToRegexp);

function App({ assets, children }) {
	return (
		<>
			{assets}
			{children}
		</>
	);
}

ReactDOM.createRoot(document.getElementById("root")).render(
	<MDXProvider
		components={{
			a: Link,
		}}
	>
		<App assets={<Suspense>{/* <Assets /> */}</Suspense>}>
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
		</App>
	</MDXProvider>,
);
