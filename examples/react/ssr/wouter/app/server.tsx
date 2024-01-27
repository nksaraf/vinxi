/// <reference types="vinxi/types/server" />
import { lazyRoute, renderAsset } from "@vinxi/react";
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import fileRoutes from "vinxi/routes";
import { eventHandler } from "vinxi/server";
import { Route, Router } from "wouter";
import { getManifest } from "vinxi/manifest";

import App from "./app";

export default eventHandler(async (event) => {
	const clientManifest = getManifest("client");
	const serverManifest = getManifest("ssr");

	console.log(fileRoutes);

	const routes = fileRoutes.map((route) => {
		return {
			...route,
			component: lazyRoute(route.$component, clientManifest, serverManifest),
		};
	});

	console.log(routes);

	const assets = await clientManifest.inputs[clientManifest.handler].assets();
	const events = {};

	const base =
		import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL;

	const stream = renderToPipeableStream(
		<App assets={<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>}>
			<Router
				ssrPath={
					event.path
					// event.path
				}
				base={base}
			>
				<Suspense>
					{routes.map((route) => (
						<Route
							path={route.path}
							key={route.path}
							component={route.component}
						/>
					))}
				</Suspense>
			</Router>
		</App>,
		{
			bootstrapModules: [
				clientManifest.inputs[clientManifest.handler].output.path,
			],
			bootstrapScriptContent: `window.manifest = ${JSON.stringify(
				await clientManifest.json(),
			)}; window.base = ${JSON.stringify(base)};`,
		},
	);

	// @ts-ignore
	stream._read = () => {};
	// @ts-ignore
	stream.on = (event, listener) => {
		events[event] = listener;
	};

	return stream;
});
