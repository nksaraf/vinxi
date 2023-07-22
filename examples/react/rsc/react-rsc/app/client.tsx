/// <reference types="vinxi/client" />
import React, { Suspense, startTransition } from "react";
import { Root, hydrateRoot } from "react-dom/client";
import "vinxi/runtime/client";

import { ServerComponent } from "./server-component";

startTransition(() => {
	hydrateRoot(document, <ServerComponent url={window.location.pathname} />);
});

// import App from "./app";

// const Assets = createAssets(
// 	import.meta.env.MANIFEST["client"].handler,
// 	import.meta.env.MANIFEST["client"],
// );

// window.$root =
// 	window.$root ||
// 	hydrateRoot(
// 		document,
// 		<App
// 			assets={
// 				<Suspense>
// 					<Assets />
// 				</Suspense>
// 			}
// 		></App>,
// 	);

// if (import.meta.hot) {
// 	import.meta.hot.accept((mod) => {
// 		if (mod) {
// 			const Assets = createAssets(
// 				import.meta.env.MANIFEST["client"].handler,
// 				import.meta.env.MANIFEST["client"],
// 			);
// 			window.$root?.render(
// 				<mod.App
// 					assets={
// 						<Suspense>
// 							<Assets />
// 						</Suspense>
// 					}
// 				/>,
// 			);
// 		}
// 	});
// }

// export { App };

// declare global {
// 	interface Window {
// 		$root?: Root;
// 	}
// }
