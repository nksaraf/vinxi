/// <reference types="vinxi/client" />
import { Suspense } from "react";
import { hydrateRoot } from "react-dom/client";
import "vinxi/runtime/client";

import { createAssets } from "./Assets";
import App from "./root";

const Assets = createAssets(import.meta.env.MANIFEST["client"].handler);

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
