/// <reference types="vinxi/types/client" />
import { createAssets } from "@vinxi/react";
import { Suspense } from "react";
import { Root, hydrateRoot } from "react-dom/client";
import "vinxi/client";
import { getManifest } from "vinxi/manifest";

import App from "./app";

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
		></App>,
	);

if (import.meta.hot) {
	import.meta.hot.accept((mod) => {
		if (mod) {
			const Assets = createAssets(
				getManifest("client").handler,
				getManifest("client"),
			);
			window.$root?.render(
				<mod.App
					assets={
						<Suspense>
							<Assets />
						</Suspense>
					}
				/>,
			);
		}
	});
}

export { App };

declare global {
	interface Window {
		$root?: Root;
	}
}
