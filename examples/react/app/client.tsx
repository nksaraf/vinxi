/// <reference types="vinxi/client" />
import React, { Suspense } from "react";
import { Root, hydrateRoot } from "react-dom/client";
import "vinxi/runtime/client";

import { createAssets } from "./Assets";
import App from "./app";

const Assets = createAssets();
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
			const Assets = createAssets();
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
