/// <reference types="vinxi/server" />
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { eventHandler } from "vinxi/runtime/server";

import { renderAsset } from "./render-asset";
import App from "./root";

export default eventHandler(async (event) => {
	const clientManifest = import.meta.env.MANIFEST["client"];
	console.log(clientManifest.handler);
	const assets = await clientManifest.inputs[clientManifest.handler].assets();
	const events = {};

	function Assets() {
		return <>{assets.map((asset) => renderAsset(asset))}</>;
	}
	const stream = renderToPipeableStream(
		<App
			assets={
				<Suspense>
					<Assets />
				</Suspense>
			}
		/>,
		{
			onAllReady: () => {
				events["end"]?.();
			},
			bootstrapModules: [
				clientManifest.inputs[clientManifest.handler].output.path,
			],
			bootstrapScriptContent: `window.manifest = ${JSON.stringify(
				await clientManifest.json(),
			)}`,
		},
	);

	// @ts-ignore
	stream.on = (event, listener) => {
		events[event] = listener;
	};

	event.node.res.setHeader("Content-Type", "text/html");

	return stream;
});
