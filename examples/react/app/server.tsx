/// <reference types="vinxi/server" />
import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { eventHandler } from "vinxi/runtime/server";

import App from "./app";
import { renderAsset } from "./render-asset";

export default eventHandler(async (event) => {
	const clientManifest = import.meta.env.MANIFEST["client"];
	const assets = await clientManifest.inputs["./app/client.tsx"].assets();
	const events = {};
	const stream = renderToPipeableStream(
		<App assets={<Suspense>{assets.map((m) => renderAsset(m))}</Suspense>} />,
		{
			onAllReady: () => {
				events["end"]?.();
			},
			bootstrapModules: [clientManifest.inputs["./app/client.tsx"].output.path],
			bootstrapScriptContent: `window.manifest = ${JSON.stringify(
				await clientManifest.json(),
			)}`,
		},
	);

	// @ts-ignore
	stream.on = (event, listener) => {
		events[event] = listener;
	};

	return stream;
});
