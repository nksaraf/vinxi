import { renderAsset } from "@vinxi/react";
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-server-dom-vite/server";
import { eventHandler } from "vinxi/runtime/server";

import App from "./app";

export default eventHandler(async (event) => {
	const reactServerManifest = import.meta.env.MANIFEST["rsc"];
	const serverAssets = await reactServerManifest.inputs[
		reactServerManifest.handler
	].assets();
	const clientManifest = import.meta.env.MANIFEST["client"];
	const assets = await clientManifest.inputs[clientManifest.handler].assets();

	const events = {};
	const stream = renderToPipeableStream(
		<App
			assets={
				<Suspense>
					{serverAssets.map((m) => renderAsset(m))}
					{assets.map((m) => renderAsset(m))}
				</Suspense>
			}
		/>,
	);

	// @ts-ignore
	stream.on = (event, listener) => {
		events[event] = listener;
	};

	event.node.res.setHeader("Content-Type", "text/x-component");
	event.node.res.setHeader("Router", "rsc");
	return stream;
});
