/// <reference types="vinxi/client" />
import { MetaProvider } from "@solidjs/meta";
import { NoHydration, Suspense, hydrate } from "solid-js/web";
import "vinxi/runtime/client";

import { createAssets } from "./Assets";
import App from "./app";

const Assets = createAssets();

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
