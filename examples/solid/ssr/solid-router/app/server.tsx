/// <reference types="vinxi/types/server" />
import { MetaProvider, renderTags } from "@solidjs/meta";
import { Router, Routes } from "@solidjs/router";
import { lazyRoute, renderAsset } from "@vinxi/solid";
import {
	HydrationScript,
	NoHydration,
	Suspense,
	renderToStream,
	ssr,
	useAssets,
} from "solid-js/web";
import { eventHandler } from "vinxi/http";
import { getManifest } from "vinxi/manifest";

import { join } from "node:path";

import App from "./app";
import { routes } from "./routes";

export default eventHandler(async (event) => {
	const events = {};

	const clientManifest = getManifest("client");
	const serverManifest = getManifest("ssr");

	const assets = await clientManifest.inputs[clientManifest.handler].assets();

	function createRoute(route) {
		return {
			...route,
			component: lazyRoute(route.$component, clientManifest, serverManifest),
			data: route.$$data ? route.$$data.require().routeData : undefined,
			children: route.children ? route.children.map(createRoute) : undefined,
		};
	}

	const pageRoutes = routes.map(createRoute);

	const FileRoutes = () => {
		return pageRoutes as any;
	};

	const tags = [];
	function Meta() {
		useAssets(() => ssr(renderTags(tags)) as any);
		return null;
	}

	const manifestJson = await clientManifest.json();
	const stream = renderToStream(() => (
		<MetaProvider tags={tags}>
			<Router
				out={{}}
				url={join(import.meta.env.BASE_URL, event.path)}
				base={import.meta.env.BASE_URL}
			>
				<App
					assets={
						<>
							<NoHydration>
								<Meta />
							</NoHydration>
							<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>
						</>
					}
					scripts={
						<>
							<NoHydration>
								<HydrationScript />
								<script
									innerHTML={`window.manifest = ${JSON.stringify(
										manifestJson,
									)}`}
								></script>
								<script
									type="module"
									src={
										clientManifest.inputs[clientManifest.handler].output.path
									}
								/>
							</NoHydration>
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
	));

	return stream;
});
