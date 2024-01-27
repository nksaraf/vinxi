/// <reference types="vinxi/types/client" />
import { StartClient } from "@tanstack/react-start/client";
import { createAssets } from "@vinxi/react";
import ReactDOM from "react-dom/client";
import "vinxi/client";
import { getManifest } from "vinxi/manifest";

import { createRouter } from "./router";
import "./style.css";

const Assets = createAssets(
	getManifest("client").handler,
	getManifest("client"),
);

const router = createRouter(getManifest("client"), undefined);
router.update({
	context: {
		...router.context,
		assets: (
			<>
				<Assets />
				{import.meta.env.DEV ? (
					<script
						src={
							getManifest("client").inputs[getManifest("client").handler].output
								.path
						}
						type="module"
					/>
				) : null}
			</>
		),
	},
});
router.hydrate();

ReactDOM.hydrateRoot(document, <StartClient router={router} />);
