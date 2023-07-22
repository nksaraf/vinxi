/// <reference types="vinxi/client" />
import { MetaProvider } from "@solidjs/meta";
import { createAssets } from "@vinxi/solid";
import { NoHydration, Suspense, hydrate } from "solid-js/web";
import "vinxi/runtime/client";

import App from "./app";

const Assets = createAssets(
	import.meta.env.MANIFEST["client"].handler,
	import.meta.env.MANIFEST["client"],
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
