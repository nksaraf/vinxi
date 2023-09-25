/// <reference types="vinxi/types/client" />
import { StartClient } from "@tanstack/react-start/client";
import { createAssets } from "@vinxi/react";
import ReactDOM from "react-dom/client";
import "vinxi/client";

import { createRouter } from "./router";
// import { loaderClient, router } from "./router";
import "./style.css";

const Assets = createAssets(
	import.meta.env.MANIFEST["client"].handler,
	import.meta.env.MANIFEST["client"],
);

const router = createRouter(import.meta.env.MANIFEST["client"], undefined);
router.update({
	context: {
		...router.context,
		assets: (
			<>
				<Assets />
				{import.meta.env.DEV ? (
					<script
						src={
							import.meta.env.MANIFEST["client"].inputs[
								import.meta.env.MANIFEST["client"].handler
							].output.path
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
// if (!rootElement.innerHTML) {
// 	const root = ReactDOM.createRoot(rootElement);

// 	root.render(
// 		<StrictMode>
// 			{/* <LoaderClientProvider loaderClient={loaderClient}> */}
// 			{/* <RouterProvider router={router} /> */}
// 			{/* </LoaderClientProvider> */}
// 		</StrictMode>,
// 	);
// }
