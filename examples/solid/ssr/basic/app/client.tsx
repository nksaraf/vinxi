/// <reference types="vinxi/types/client" />
import { MetaProvider } from "@solidjs/meta";
import { createAssets } from "@vinxi/solid";
import { NoHydration, Suspense, hydrate } from "solid-js/web";
import "vinxi/client";
import { getManifest } from "vinxi/manifest";

import { increment } from "./actions";
import App from "./app";

console.log(await increment());

const Assets = createAssets(
	getManifest("client").handler,
	getManifest("client"),
);

hydrate(
	() => (
		<MetaProvider>
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
			/>
		</MetaProvider>
	),
	document,
);
