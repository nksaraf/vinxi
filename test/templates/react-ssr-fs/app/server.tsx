/// <reference types="vinxi/types/server" />
import { lazyRoute, renderAsset } from "@vinxi/react";
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { eventHandler, setHeader } from "vinxi/http";
import { getManifest } from "vinxi/manifest";
import fileRoutes from "vinxi/routes";
import { Route, Router } from "wouter";

import App from "./app";

export default eventHandler(async (event) => {
	const clientManifest = getManifest("client");
	const serverManifest = getManifest("ssr");

	const routes = fileRoutes.map((route) => {
		return {
			...route,
			component: lazyRoute(route.$component, clientManifest, serverManifest),
		};
	});

	const assets = await clientManifest.inputs[clientManifest.handler].assets();

	const base =
		import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL;

	const json = JSON.stringify(await clientManifest.json());
	const stream = await new Promise((resolve) => {
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
				onShellReady() {
					resolve(stream);
				},
				bootstrapModules: [
					clientManifest.inputs[clientManifest.handler].output.path,
				],
				bootstrapScriptContent: `window.manifest = ${json}; window.base = ${JSON.stringify(
					base,
				)};`,
			},
		);
	});

	setHeader(event, "Content-Type", "text/html");

	return stream;
});
