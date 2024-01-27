/// <reference types="vinxi/types/client" />
import { Suspense } from "react";
import { hydrateRoot } from "react-dom/client";
import "vinxi/client";
import { getManifest } from "vinxi/manifest";

import { createAssets } from "./Assets";
import App from "./root";

const Assets = createAssets(getManifest("client").handler);

hydrateRoot(
	document,
	<App
		assets={
			<Suspense>
				<Assets />
			</Suspense>
		}
	/>,
);
