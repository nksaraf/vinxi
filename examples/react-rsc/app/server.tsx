/// <reference types="vinxi/server" />
import { renderAsset } from "@vinxi/react";
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { eventHandler } from "vinxi/runtime/server";

import App from "./app";

export default eventHandler(async (event) => {
	const clientManifest = import.meta.env.MANIFEST["client"];
	const assets = await clientManifest.inputs[clientManifest.handler].assets();
	const events = {};
	const stream = renderToPipeableStream(
		<App assets={<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>} />,
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
